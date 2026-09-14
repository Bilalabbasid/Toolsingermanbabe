'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Video,
  FileAudio,
  FileVideo,
  Download,
  RefreshCw,
  AlertCircle,
  Play,
  Pause,
  CheckCircle2,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { DownloadBox } from '@/components/tools/DownloadBox';
import { downloadBlob, formatBytes } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export type MediaToolId =
  | 'audio-konvertieren'
  | 'audio-komprimieren'
  | 'video-in-mp3-umwandeln'
  | 'video-konvertieren'
  | 'video-komprimieren'
  | 'video-in-gif-umwandeln'
  | 'video-in-mp4-umwandeln'
  | 'mp4-in-webm-umwandeln';

interface MediaEngineProps {
  toolId: MediaToolId;
}

export function MediaEngine({ toolId }: MediaEngineProps) {
  const isPro = typeof window !== 'undefined' && localStorage.getItem('coolwave_pro_active') === 'true';

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Conversion options
  const isAudioTool =
    toolId === 'audio-konvertieren' ||
    toolId === 'audio-komprimieren' ||
    toolId === 'video-in-mp3-umwandeln';

  const [targetAudioFormat, setTargetAudioFormat] = useState<'mp3' | 'wav' | 'aac' | 'flac' | 'ogg' | 'm4a'>('mp3');
  const [audioBitrate, setAudioBitrate] = useState<'64k' | '96k' | '128k' | '192k' | '256k'>('128k');

  const [targetVideoFormat, setTargetVideoFormat] = useState<'mp4' | 'webm' | 'gif' | 'mov' | 'avi' | 'mkv'>('mp4');
  const [videoCompressionLevel, setVideoCompressionLevel] = useState<'high' | 'balanced' | 'low'>('balanced');
  const [gifFps, setGifFps] = useState<10 | 15>(10);

  // Sync initial target format based on toolId
  useEffect(() => {
    if (toolId === 'video-in-mp3-umwandeln') setTargetAudioFormat('mp3');
    else if (toolId === 'video-in-gif-umwandeln') setTargetVideoFormat('gif');
    else if (toolId === 'mp4-in-webm-umwandeln') setTargetVideoFormat('webm');
    else if (toolId === 'video-in-mp4-umwandeln') setTargetVideoFormat('mp4');
  }, [toolId]);

  // Clean up ObjectURL when component unmounts or new result
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];

    const maxMB = isAudioTool ? (isPro ? 200 : 50) : (isPro ? 500 : 100);
    if (selected.size > maxMB * 1024 * 1024) {
      setError(`Datei zu groß. Das maximale Limit beträgt ${maxMB} MB.`);
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

    setIsProcessing(true);
    setProgress(15);
    setStatusText('Mediadatei wird übertragen...');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', toolId);

    if (toolId === 'audio-komprimieren') {
      formData.append('targetFormat', file.name.split('.').pop() || 'mp3');
      formData.append('options', JSON.stringify({ bitrate: audioBitrate, compress: true }));
    } else if (toolId === 'audio-konvertieren') {
      formData.append('targetFormat', targetAudioFormat);
      formData.append('options', JSON.stringify({ bitrate: audioBitrate }));
    } else if (toolId === 'video-in-mp3-umwandeln') {
      formData.append('targetFormat', 'mp3');
    } else if (toolId === 'video-in-gif-umwandeln') {
      formData.append('targetFormat', 'gif');
      formData.append('options', JSON.stringify({ fps: gifFps }));
    } else if (toolId === 'mp4-in-webm-umwandeln') {
      formData.append('targetFormat', 'webm');
    } else if (toolId === 'video-komprimieren') {
      formData.append('targetFormat', 'mp4');
      formData.append('options', JSON.stringify({ compressionLevel: videoCompressionLevel, compress: true }));
    } else {
      formData.append('targetFormat', targetVideoFormat);
    }

    try {
      const res = await fetch('/api/v1/jobs', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server-Fehler: HTTP ${res.status}`);
      }

      const { jobId } = await res.json();
      setStatusText('In Verarbeitungswarteschlange...');
      setProgress(30);

      // Poll job status
      let attempts = 0;
      const maxAttempts = 120; // 2 minutes max
      let completedJob = null;

      while (attempts < maxAttempts) {
        attempts++;
        await new Promise((r) => setTimeout(r, 800));

        const pollRes = await fetch(`/api/v1/jobs/${jobId}`);
        if (!pollRes.ok) continue;

        const pollData = await pollRes.json();
        const currentJob = pollData.job;

        if (currentJob.status === 'processing') {
          const curPct = Math.max(35, Math.min(currentJob.progress || 50, 90));
          setProgress(curPct);
          setStatusText(`Wird transkodiert (${curPct}%)...`);
        } else if (currentJob.status === 'completed') {
          completedJob = currentJob;
          break;
        } else if (currentJob.status === 'failed') {
          throw new Error(currentJob.error || 'Medienverarbeitung fehlgeschlagen.');
        }
      }

      if (!completedJob) {
        throw new Error('Zeitüberschreitung bei der Medienkonvertierung.');
      }

      setProgress(95);
      setStatusText('Ergebnis wird geladen...');

      // Download result blob
      const downloadRes = await fetch(completedJob.output.downloadUrl);
      if (!downloadRes.ok) {
        throw new Error('Fehler beim Herunterladen des Ergebnisses.');
      }

      const blob = await downloadRes.blob();
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
      setOutputFilename(completedJob.output.fileName);
      setProgress(100);
      trackEvent('conversion_completed', { toolId, inputSize: file.size, outputSize: blob.size });
    } catch (err: any) {
      console.error('[MediaEngine Error]:', err);
      setError(err?.message || 'Unerwarteter Fehler bei der Medienverarbeitung.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setError(null);
    setProgress(0);
  };

  // Accepted file extensions
  const acceptedExts = isAudioTool
    ? ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a']
    : ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {!file && !resultBlob && (
        <FileUploader
          onFilesSelected={handleFilesSelected}
          acceptedExtensions={acceptedExts}
          title={isAudioTool ? 'Audiodatei hier ablegen oder auswählen' : 'Videodatei hier ablegen oder auswählen'}
          subtitle={
            isAudioTool
              ? 'Unterstützt MP3, WAV, AAC, FLAC, OGG, M4A bis zu 50 MB kostenlos (200 MB Pro)'
              : 'Unterstützt MP4, MOV, AVI, MKV, WebM bis zu 100 MB kostenlos (500 MB Pro)'
          }
          maxFileSizeMB={isAudioTool ? (isPro ? 200 : 50) : (isPro ? 500 : 100)}
        />
      )}

      {file && !resultBlob && !isProcessing && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
          {/* File summary header */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                {isAudioTool ? <Music className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </div>
              <div>
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
              </div>
            )}

            {/* Audio Compress: Bitrate Picker */}
            {(toolId === 'audio-komprimieren' || toolId === 'audio-konvertieren') && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Audio-Bitrate (Qualität):</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { val: '64k', label: '64 kbps (Sehr klein)' },
                    { val: '96k', label: '96 kbps (Kompakt)' },
                    { val: '128k', label: '128 kbps (Standard)' },
                    { val: '192k', label: '192 kbps (Hohe Qualität)' },
                    { val: '256k', label: '256 kbps (Studio)' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setAudioBitrate(item.val as any)}
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
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'high', label: 'Stark komprimieren', desc: 'Kleinste Dateigröße (CRF 32)' },
                    { id: 'balanced', label: 'Ausgewogen (Empfohlen)', desc: 'Optimale Balance (CRF 28)' },
                    { id: 'low', label: 'Leichte Kompression', desc: 'Höchste Bildschärfe (CRF 24)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVideoCompressionLevel(item.id as any)}
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
            {toolId === 'video-in-gif-umwandeln' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bildrate (FPS):</label>
                <div className="flex gap-2">
                  {[
                    { val: 10, label: '10 FPS (Kompakte GIF-Größe)' },
                    { val: 15, label: '15 FPS (Flüssigere Bewegung)' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setGifFps(item.val as any)}
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
              </div>
            )}
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
        />
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Verarbeitung fehlgeschlagen</div>
            <div className="text-xs text-rose-600">{error}</div>
            <button
              onClick={resetAll}
              className="mt-2 text-xs font-bold text-rose-700 underline hover:no-underline"
            >
              Erneut versuchen
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
            {isAudioTool || outputFilename.endsWith('.mp3') || outputFilename.endsWith('.wav') || outputFilename.endsWith('.aac') ? (
              <audio controls src={resultUrl} className="w-full max-w-md my-2" />
            ) : outputFilename.endsWith('.gif') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resultUrl} alt="Konvertiertes GIF" className="max-h-72 rounded-lg object-contain shadow" />
            ) : (
              <video controls src={resultUrl} className="max-h-80 w-full rounded-lg object-contain" />
            )}
          </div>

          {/* Download & Reset actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => downloadBlob(resultBlob, outputFilename)}
              className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{outputFilename} herunterladen ({formatBytes(resultBlob.size)})</span>
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
