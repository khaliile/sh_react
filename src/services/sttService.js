/**
 * sttService.js
 * High-speed Speech-to-Text powered by Groq Whisper (whisper-large-v3-turbo).
 * Works reliably across all browsers, operating systems, and Electron without Google Speech API restrictions.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

const HALLUCINATION_SET = new Set([
  'thank you', 'thank you.', 'thanks for watching', 'thanks for watching.',
  'thank you for watching', 'thank you for watching.', 'subtitles by',
  'subscribed', 'subscribe', 'you', 'bye', 'bye bye', 'mbc',
  'شكرا', 'شكرا لكم', 'شكرا للمشاهدة', 'اشترك في القناة', 'تفريغ',
  '.', '..', '...', '!', '?', 'null', 'none'
]);

/**
 * Transcribe an audio Blob using Groq Whisper.
 * @param {Blob} audioBlob - Audio recording blob (e.g. audio/webm or audio/wav)
 * @param {'ar'|'en'} [lang='ar'] - Preferred language hint ('ar' or 'en')
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeAudioWithGroq(audioBlob, lang = 'ar') {
  if (!audioBlob || audioBlob.size < 100) {
    return '';
  }

  // 1. In Electron desktop: use native Node IPC to completely avoid Chromium upload data pipe bugs
  if (window.electronAPI?.transcribeAudio) {
    try {
      const buffer = await audioBlob.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = btoa(binary);
      const result = await window.electronAPI.transcribeAudio(base64Audio, lang);
      return (result || '').trim();
    } catch (e) {
      console.warn('[sttService] Electron IPC transcription failed, falling back to fetch:', e);
    }
  }

  // 2. Direct browser fetch fallback
  const apiKey = (import.meta.env.VITE_GROQ_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim();
  if (!apiKey) {
    throw new Error('Groq API Key is not configured in .env (VITE_GROQ_API_KEY)');
  }

  const formData = new FormData();
  // Determine file extension
  const extension = audioBlob.type?.includes('mp4') ? 'mp4' : audioBlob.type?.includes('ogg') ? 'ogg' : 'webm';
  const file = new File([audioBlob], `recording.${extension}`, { type: audioBlob.type || 'audio/webm' });

  const isAr = lang && lang.startsWith('ar');

  formData.append('file', file);
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('temperature', '0.0');
  formData.append('prompt', 'Study Hub assistant conversation with student in English and Arabic.');

  if (lang) {
    formData.append('language', isAr ? 'ar' : 'en');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Groq Whisper transcription failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const raw = (data.text || '').trim();
  const clean = raw.replace(/^[.,!?_\s]+|[.,!?_\s]+$/g, '').trim();
  if (HALLUCINATION_SET.has(clean.toLowerCase()) || clean.length === 0) {
    return '';
  }
  return raw;
}

/**
 * VoiceRecorder helper class to record microphone audio with:
 * - Live volume level measurement (0-100)
 * - Automatic Voice Activity Detection (VAD) & Silence detection
 * - Clean WebM/Opus audio buffer flushing
 */
export class VoiceRecorder {
  constructor({
    onVolumeChange,
    onSpeechStart,
    onSilence,
    onLiveTranscript,
    lang = 'en',
    silenceThreshold = 10,
    silenceDurationMs = 3200,
    minSpeechDurationMs = 800,
  } = {}) {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.audioContext = null;
    this.analyser = null;
    this.animFrame = null;
    this.onVolumeChange = onVolumeChange || null;
    this.onSpeechStart = onSpeechStart || null;
    this.onSilence = onSilence || null;
    this.onLiveTranscript = onLiveTranscript || null;
    this.lang = lang;
    this.silenceThreshold = silenceThreshold;
    this.silenceDurationMs = silenceDurationMs;
    this.minSpeechDurationMs = minSpeechDurationMs;
    this.isRecording = false;
    this.hasSpoken = false;
    this.speechStartTime = null;
    this.lastSoundTime = null;
    this.liveTranscribeTimer = null;
    this.isTranscribingLive = false;
  }

  async start() {
    this.audioChunks = [];
    this.hasSpoken = false;
    this.speechStartTime = null;
    this.lastSoundTime = Date.now();

    // Request microphone access with standard clean audio constraints
    try {
      console.log('[VoiceRecorder] Requesting microphone access...');
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      console.log('[VoiceRecorder] ✓ Microphone access granted');
      console.log('[VoiceRecorder] Audio track settings:', this.stream.getAudioTracks()[0]?.getSettings());
    } catch (err) {
      console.error('[VoiceRecorder] ✗ Microphone access denied:', err);
      console.error('[VoiceRecorder] Error name:', err.name);
      console.error('[VoiceRecorder] Error message:', err.message);
      throw new Error(`Microphone access denied: ${err.message}`);
    }

    // Set up audio analysis for live visual volume feedback & silence detection
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        this.audioContext = new AC();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.3;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const updateVolume = () => {
          if (!this.isRecording) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          if (this.onVolumeChange) this.onVolumeChange(normalized);

          const now = Date.now();

          if (normalized >= this.silenceThreshold) {
            this.lastSoundTime = now;
            if (!this.hasSpoken) {
              this.hasSpoken = true;
              this.speechStartTime = now;
              if (this.onSpeechStart) this.onSpeechStart();
            }
          } else if (
            this.hasSpoken &&
            this.speechStartTime &&
            now - this.speechStartTime >= this.minSpeechDurationMs &&
            now - this.lastSoundTime >= this.silenceDurationMs
          ) {
            // Trigger automatic silence callback once
            if (this.onSilence) {
              const cb = this.onSilence;
              this.onSilence = null; // Prevent re-trigger
              cb();
            }
          }

          this.animFrame = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      }
    } catch (e) {
      console.warn('[VoiceRecorder] Audio analysis warning:', e);
    }


    // Determine supported mime type
    let mimeType = 'audio/webm';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }
    }

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
    this.isRecording = true;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // collect in 100ms chunks

  }

  async stop() {
    if (!this.isRecording) return null;
    this.isRecording = false;

    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.audioContext) {
      this.audioContext.close().catch(() => { });
    }

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        this.cleanup();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        resolve(blob);
      };

      try {
        if (this.mediaRecorder.state !== 'inactive') {
          // Flush any pending data into chunks before stopping
          try { this.mediaRecorder.requestData(); } catch { }
          this.mediaRecorder.stop();
        } else {
          this.cleanup();
          resolve(new Blob(this.audioChunks, { type: 'audio/webm' }));
        }
      } catch {
        this.cleanup();
        resolve(null);
      }
    });
  }

  cleanup() {
    if (this.liveTranscribeTimer) {
      clearInterval(this.liveTranscribeTimer);
      this.liveTranscribeTimer = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.onVolumeChange) this.onVolumeChange(0);
  }
}
