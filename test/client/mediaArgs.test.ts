import { describe, it, expect } from 'vitest';
import {
  baseNameOf,
  extensionOf,
  isAudioInputTool,
  isAudioOutputTool,
  compressedAudioFormat,
  buildMediaJob,
} from '@/lib/client/media/mediaArgs';

describe('Media Args Pure Builder', () => {
  it('should extract correct extensions and basenames', () => {
    expect(extensionOf('test-video.mp4')).toBe('mp4');
    expect(extensionOf('audio.file.WAV')).toBe('wav');
    expect(baseNameOf('my-song.mp3')).toBe('my-song');
    expect(baseNameOf('video:with?illegal<chars>.mp4')).toBe('video_with_illegal_chars_');
  });

  it('should identify audio tools correctly', () => {
    expect(isAudioInputTool('audio-konvertieren')).toBe(true);
    expect(isAudioInputTool('audio-komprimieren')).toBe(true);
    expect(isAudioInputTool('video-in-mp3-umwandeln')).toBe(false);

    expect(isAudioOutputTool('video-in-mp3-umwandeln')).toBe(true);
    expect(isAudioOutputTool('video-in-mp4-umwandeln')).toBe(false);
  });

  it('should pick appropriate compressed audio formats', () => {
    expect(compressedAudioFormat('song.wav')).toBe('mp3');
    expect(compressedAudioFormat('podcast.m4a')).toBe('m4a');
    expect(compressedAudioFormat('track.ogg')).toBe('ogg');
  });

  it('should build audio conversion job plan', () => {
    const plan = buildMediaJob({
      toolId: 'audio-konvertieren',
      inputPath: '/work/input.wav',
      inputName: 'speech.wav',
      targetAudioFormat: 'mp3',
      audioBitrate: '192k',
    });

    expect(plan.kind).toBe('audio');
    expect(plan.outputName).toBe('speech.mp3');
    expect(plan.mimeType).toBe('audio/mpeg');
    expect(plan.args).toContain('libmp3lame');
    expect(plan.args).toContain('192k');
  });

  it('should build video to gif conversion job plan with time cap', () => {
    const plan = buildMediaJob({
      toolId: 'video-in-gif-umwandeln',
      inputPath: '/work/input.mp4',
      inputName: 'clip.mp4',
      gifFps: 10,
    });

    expect(plan.kind).toBe('gif');
    expect(plan.outputName).toBe('clip.gif');
    expect(plan.mimeType).toBe('image/gif');
    expect(plan.args).toContain('-t');
    expect(plan.args).toContain('30');
  });

  it('should build video mp4 conversion job plan with faststart', () => {
    const plan = buildMediaJob({
      toolId: 'video-in-mp4-umwandeln',
      inputPath: '/work/input.mov',
      inputName: 'home-movie.mov',
      targetVideoFormat: 'mp4',
    });

    expect(plan.kind).toBe('video');
    expect(plan.outputName).toBe('home-movie.mp4');
    expect(plan.mimeType).toBe('video/mp4');
    expect(plan.args).toContain('libx264');
    expect(plan.args).toContain('+faststart');
  });
});

