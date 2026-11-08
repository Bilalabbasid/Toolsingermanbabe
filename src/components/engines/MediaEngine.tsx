'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Music, Video, Download, AlertCircle, CheckCircle2, Sliders, Sparkles, AlertTriangle, Cpu } from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import {
  AUDIO_INPUT_EXTENSIONS,
  GIF_MAX_SECONDS,
  VIDEO_INPUT_EXTENSIONS,
  compressedAudioFormat,
  isAudioInputTool,
  isAudioOutputTool,
  type AudioBitrate,
  type AudioFormat,
  type CompressionLevel,
  type GifFps,
  type MediaToolId as MediaToolIdBase,
  type VideoFormat,
} from '@/lib/client/media/mediaArgs';

export type MediaToolId = MediaToolIdBase;

interface MediaEngineProps {
  toolId: MediaToolId;
}

/** Hard limit for in-browser processing (WASM / tab memory). */
const MAX_MEDIA_MB = 500;
/** Above this size we warn about memory and duration. */
const LARGE_MEDIA_MB = 200;

const DEFAULT_VIDEO_FORMAT: Partial<Record<MediaToolId, VideoFormat>> = {
  'video-in-gif-umwandeln': 'gif',
  'mp4-in-webm-umwandeln': 'webm',
  'video-in-mp4-umwandeln': 'mp4',
};

export function MediaEngine({ toolId }: MediaEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultKind, setResultKind] = useState<'audio' | 'video' | 'gif'>('video');
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [autoDownload, setAutoDownload] = useState(true);
  const cancelledRef = useRef(false);
  const isProcessingRef = useRef(false);

  const audioInput = isAudioInputTool(toolId);
  const audioOutput = isAudioOutputTool(toolId);

  const [targetAudioFormat, setTargetAudioFormat] = useState<AudioFormat>('mp3');
  const [audioBitrate, setAudioBitrate] = useState<AudioBitrate>(toolId === 'video-in-mp3-umwandeln' ? '192k' : '128k');
  const [targetVideoFormat, setTargetVideoFormat] = useState<VideoFormat>(DEFAULT_VIDEO_FORMAT[toolId] ?? 'mp4');
  const [videoCompressionLevel, setVideoCompressionLevel] = useState<CompressionLevel>('balanced');
  const [gifFps, setGifFps] = useState<GifFps>(10);

  // Release the preview ObjectURL when it is replaced or on unmount.
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  // Abort a running conversion when the component unmounts.
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);
  useEffect(() => {
    const cancelled = cancelledRef;
    const processing = isProcessingRef;
    return () => {
      if (processing.current && !cancelled.current) {
        cancelled.current = true;
        void import('@/lib/client/media/convert').then((m) => m.cancelMediaConversion());
      }
    };
  }, []);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];

    if (selected.size > MAX_MEDIA_MB * 1024 * 1024) {
      setError(
        `Die Datei ist ${formatBytes(selected.size)} groß. Im Browser können Mediendateien bis ${MAX_MEDIA_MB} MB verarbeitet werden.`
      );
      return;
    }

    setFile(selected);
    setError(null);
    setResultBlob(null);
    setResultUrl(null);
    trackEvent('upload_completed', { toolId, size: selected.size });
  };

  const handleProcess = async () => {
    if (!file) return;

    cancelledRef.current = false;
    setIsProcessing(true);
    setProgress(undefined);
    setStatusText('Konvertierungs-Engine wird vorbereitet …');
    setError(null);
    trackEvent('conversion_started', { toolId, size: file.size });

    let conversionStartTime: number | null = null;
    let timerId: ReturnType<typeof setInterval> | null = null;
    let receivedPositiveProgress = false;

    try {
      const { convertMedia } = await import('@/lib/client/media/convert');
      const result = await convertMedia(
        file,
        {
          toolId,
          targetAudioFormat,
          audioBitrate,
          targetVideoFormat,
          compressionLevel: videoCompressionLevel,
          gifFps,
        },
        {
          isCancelled: () => cancelledRef.current,
          onEngineDownload: (fraction) => {
            setProgress(Math.round(fraction * 100));
            setStatusText(
              `Konvertierungs-Engine wird einmalig geladen (ca. 31 MB) … ${Math.round(fraction * 100)} %`
            );
          },
          onStage: (stage) => {
            if (stage === 'loading') {
              setStatusText('Konvertierungs-Engine wird geladen …');
            } else if (stage === 'preparing') {
              setProgress(undefined);
              setStatusText('Datei wird eingelesen …');
            } else if (stage === 'converting') {
              conversionStartTime = Date.now();
              setProgress(undefined);
              setStatusText(
                audioOutput ? 'Audio wird lokal umgewandelt …' : 'Video wird lokal umgewandelt …'
              );
              timerId = setInterval(() => {
                if (conversionStartTime && !receivedPositiveProgress) {
                  const elapsedSec = Math.floor((Date.now() - conversionStartTime) / 1000);
                  setStatusText(
                    `${audioOutput ? 'Audio' : 'Video'} wird lokal umgewandelt … (${elapsedSec}s)`
                  );
                }
              }, 1000);
            } else if (stage === 'finalizing') {
              if (timerId) {
                clearInterval(timerId);
                timerId = null;
              }
              setProgress(100);
              setStatusText('Ergebnis wird vorbereitet …');
            }
          },
          onProgress: (fraction) => {
            const pct = Math.round(fraction * 100);
            if (pct > 0) {
              receivedPositiveProgress = true;
              if (timerId) {
                clearInterval(timerId);
                timerId = null;
              }
              setProgress(pct);
              setStatusText(`${audioOutput ? 'Audio' : 'Video'} wird lokal umgewandelt … ${pct} %`);
            }
          },
        }
      );

      const url = URL.createObjectURL(result.blob);
      setResultBlob(result.blob);
      setResultUrl(url);
      setResultKind(result.kind);
      setOutputFilename(result.fileName);
      setProgress(100);
      if (autoDownload) downloadBlob(result.blob, result.fileName);
      trackEvent('conversion_completed', { toolId, inputSize: file.size, outputSize: result.blob.size });
    } catch (err) {
      if (cancelledRef.current || (err as Error)?.name === 'MediaCancelledError') {
        setError('Die Konvertierung wurde abgebrochen.');
      } else {
        console.error('[MediaEngine Error]:', err);
        setError((err as Error)?.message || 'Unerwarteter Fehler bei der Medienverarbeitung.');
        trackEvent('conversion_failed', { toolId });
      }
    } finally {
      if (timerId) clearInterval(timerId);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    void import('@/lib/client/media/convert').then((m) => m.cancelMediaConversion());
  };

  const resetAll = () => {
    setFile(null);
    setResultBlob(null);
    setResultUrl(null);
    setError(null);
    setProgress(0);
  };

  const acceptedExts = audioInput ? AUDIO_INPUT_EXTENSIONS : VIDEO_INPUT_EXTENSIONS;
  const isLarge = Boolean(file && file.size > LARGE_MEDIA_MB * 1024 * 1024);
  const compressTarget = file && toolId === 'audio-komprimieren' ? compressedAudioFormat(file.name) : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {!file && !resultBlob && (
        <FileUploader
          onFilesSelected={handleFilesSelected}
          acceptedExtensions={acceptedExts}
          title={audioInput ? 'Audiodatei hier ablegen oder auswählen' : 'Videodatei hier ablegen oder auswählen'}
          subtitle={
            audioInput
              ? `Unterstützt MP3, WAV, AAC, FLAC, OGG und M4A bis ${MAX_MEDIA_MB} MB – Verarbeitung direkt in Ihrem Browser`
              : `Unterstützt MP4, MOV, AVI, MKV und WebM bis ${MAX_MEDIA_MB} MB – Verarbeitung direkt in Ihrem Browser`
          }
          maxFileSizeMB={MAX_MEDIA_MB}
        />
      )}

      {file && !resultBlob && !isProcessing && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
          {/* File summary header */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold shrink-0">
                {audioInput ? <Music className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-800 truncate max-w-md">{file.name}</div>
                <div className="text-xs text-slate-500">{formatBytes(file.size)}</div>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors"
            >
              Datei wechseln
            </button>
          </div>

          {isLarge && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Große Datei:</strong> Die Umwandlung läuft vollständig auf Ihrem Gerät und kann bei{' '}
                {formatBytes(file.size)} mehrere Minuten dauern sowie viel Arbeitsspeicher belegen. Schließen Sie
                nach Möglichkeit andere Tabs. Auf Smartphones empfehlen wir Dateien unter {LARGE_MEDIA_MB} MB.
              </span>
            </div>
          )}

          {/* Options Panel */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-600" />
              Einstellungen & Zielformat
            </div>

            {/* Audio Convert: Format Picker */}
            {toolId === 'audio-konvertieren' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ziel-Audioformat:</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetAudioFormat(fmt)}
                      className={`p-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                        targetAudioFormat === fmt
                          ? 'border-sky-600 bg-sky-50 text-sky-700 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                {(targetAudioFormat === 'wav' || targetAudioFormat === 'flac') && (
                  <p className="mt-1.5 text-2xs text-slate-500">
                    {targetAudioFormat.toUpperCase()} ist verlustfrei – die Bitrate wird dabei nicht verwendet.
                  </p>
                )}
              </div>
            )}

            {/* Bitrate Picker */}
            {(toolId === 'audio-komprimieren' || toolId === 'audio-konvertieren' || toolId === 'video-in-mp3-umwandeln') && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Audio-Bitrate (Qualität):</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { val: '64k', label: '64 kbps (Sehr klein)' },
                      { val: '96k', label: '96 kbps (Kompakt)' },
                      { val: '128k', label: '128 kbps (Standard)' },
                      { val: '192k', label: '192 kbps (Hohe Qualität)' },
                      { val: '256k', label: '256 kbps (Studio)' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setAudioBitrate(item.val)}
                      className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                        audioBitrate === item.val
                          ? 'border-sky-600 bg-sky-50 text-sky-700 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {compressTarget && (
                  <p className="mt-1.5 text-2xs text-slate-500">
                    Ausgabeformat: {compressTarget.toUpperCase()}
                    {compressTarget === 'mp3' && !/\.mp3$/i.test(file.name)
                      ? ' (verlustfreie Formate werden zur Verkleinerung in MP3 umgewandelt)'
                      : ''}
                  </p>
                )}
              </div>
            )}

            {/* Video Convert: Format Picker */}
            {toolId === 'video-konvertieren' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ziel-Videoformat:</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['mp4', 'webm', 'mov', 'avi', 'mkv', 'gif'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetVideoFormat(fmt)}
                      className={`p-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                        targetVideoFormat === fmt
                          ? 'border-sky-600 bg-sky-50 text-sky-700 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Video Compress: Level */}
            {toolId === 'video-komprimieren' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Komprimierungsgrad:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'high', label: 'Stark komprimieren', desc: 'Kleinste Dateigröße (CRF 32, max. 720p)' },
                      { id: 'balanced', label: 'Ausgewogen (Empfohlen)', desc: 'Optimale Balance (CRF 28, max. 720p)' },
                      { id: 'low', label: 'Leichte Kompression', desc: 'Höchste Bildschärfe (CRF 24, max. 1080p)' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVideoCompressionLevel(item.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        videoCompressionLevel === item.id
                          ? 'border-sky-600 bg-sky-50 text-sky-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-2xs text-slate-500 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Video to GIF: FPS */}
            {(toolId === 'video-in-gif-umwandeln' || (toolId === 'video-konvertieren' && targetVideoFormat === 'gif')) && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bildrate (FPS):</label>
                <div className="flex gap-2">
                  {(
                    [
                      { val: 10, label: '10 FPS (Kompakte GIF-Größe)' },
                      { val: 15, label: '15 FPS (Flüssigere Bewegung)' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setGifFps(item.val)}
                      className={`flex-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        gifFps === item.val
                          ? 'border-sky-600 bg-sky-50 text-sky-700 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-2xs text-slate-500">
                  GIFs werden aus den ersten {GIF_MAX_SECONDS} Sekunden des Videos erstellt (optimierte Farbpalette).
                </p>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-2xs text-slate-600 leading-relaxed flex items-start gap-2">
              <Cpu className="w-4 h-4 shrink-0 text-sky-600" />
              <span>
                Die Umwandlung erfolgt mit FFmpeg direkt in Ihrem Browser – Ihre Datei wird nicht hochgeladen. Beim
                ersten Start wird die Konvertierungs-Engine (ca. 31 MB) einmalig geladen.
                {!audioOutput && ' Videos werden mit der Rechenleistung Ihres Geräts kodiert und benötigen daher etwas Zeit.'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleProcess}
            className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Jetzt umwandeln & optimieren</span>
          </button>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <ProcessingStatus
          progress={progress}
          statusText={statusText}
          isLargeFile={isLarge || !audioOutput}
          onCancel={handleCancel}
          autoDownload={autoDownload}
          onAutoDownloadChange={setAutoDownload}
        />
      )}

      {/* Error state */}
      {error && !isProcessing && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Verarbeitung fehlgeschlagen</div>
            <div className="text-xs text-rose-600">{error}</div>
            <button
              onClick={resetAll}
              className="mt-2 text-xs font-bold text-rose-700 underline hover:no-underline"
            >
              Andere Datei wählen
            </button>
          </div>
        </div>
      )}

      {/* Result State with Media Player Preview */}
      {resultBlob && resultUrl && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <div className="text-base font-bold text-slate-800">Erfolgreich fertiggestellt!</div>
              <div className="text-xs text-slate-500">
                {file ? `${formatBytes(file.size)} → ${formatBytes(resultBlob.size)}` : formatBytes(resultBlob.size)}
                {file && file.size > resultBlob.size && (
                  <span className="ml-1.5 text-emerald-600 font-bold">
                    (-{Math.round((1 - resultBlob.size / file.size) * 100)}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Media Player Preview */}
          <div className="p-4 rounded-xl bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
            {resultKind === 'audio' ? (
              <audio controls src={resultUrl} className="w-full max-w-md my-2" />
            ) : resultKind === 'gif' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resultUrl} alt="Konvertiertes GIF" className="max-h-72 rounded-lg object-contain shadow" />
            ) : (
              <video controls src={resultUrl} className="max-h-80 w-full rounded-lg object-contain" />
            )}
          </div>
          {(outputFilename.endsWith('.avi') || outputFilename.endsWith('.mkv') || outputFilename.endsWith('.flac')) && (
            <p className="text-2xs text-slate-500 -mt-3">
              Hinweis: Nicht jeder Browser kann dieses Format in der Vorschau abspielen – die Datei selbst ist
              trotzdem vollständig.
            </p>
          )}

          {/* Download & Reset actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                downloadBlob(resultBlob, outputFilename);
                trackEvent('download_completed', { toolId });
              }}
              className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="truncate">
                {outputFilename} herunterladen ({formatBytes(resultBlob.size)})
              </span>
            </button>
            <button
              onClick={resetAll}
              className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
            >
              Weitere Datei bearbeiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
