import { useState, useRef, useEffect, useCallback } from 'react';
import {
  synthesizePiperAudio,
  synthesizeBrowserNative,
  checkPiperHealth,
  cleanTextForSpeech,
  PIPER_VOICES,
} from '../services/ttsService';
import { synthesizePollySpeech, synthesizePollyArabic, resolvePollyVoice } from '../services/pollyService';
import { attachAudioSync, attachSpeechSynthesisSync } from '../utils/speechSync';

const ARABIC_RE = /[\u0600-\u06FF]/;

// ── Singleton AudioContext (created once, never closed between calls) ──────────
// Creating a new AudioContext per utterance can silently fail on Windows/Electron
// when the OS audio session is still attached to the previous (closed) context.
let _sharedCtx = null;
async function getAudioCtx() {
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) return null;
  if (!_sharedCtx || _sharedCtx.state === 'closed') {
    _sharedCtx = new AudioCtxClass();
  }
  if (_sharedCtx.state === 'suspended') {
    try { await _sharedCtx.resume(); } catch {}
  }
  return _sharedCtx;
}

/**
 * Unified React Hook for Mascot Voice Integration
 * Supports:
 * - Local Piper TTS (:8100)
 * - Electron Native Piper IPC
 * - Browser native SpeechSynthesis fallback
 * - Real-time word and line speech synchronization
 * - Full state management (loading, speaking, idle, error)
 * - Memory leak prevention & abortable requests
 */
export function useMascotVoice(initialOptions = {}) {
  const [engine, setEngine] = useState(initialOptions.defaultEngine || 'piper'); // 'piper' | 'browser'
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'speaking' | 'error'
  const [error, setError] = useState(null);
  const [serverHealth, setServerHealth] = useState({ piper: null });
  const [activeVoiceId, setActiveVoiceId] = useState(initialOptions.defaultVoice || 'en_US-ryan-medium');

  // Real-time synchronization state for word & line highlighting
  const [syncState, setSyncState] = useState({
    activeWordIndex: -1,
    activeLineIndex: -1,
    activeCharIndex: -1,
    progress: 0,
    isSpeaking: false,
    spokenText: '',
  });

  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const abortControllerRef = useRef(null);
  const syncCleanupRef = useRef(null);

  // Status flags for quick component bindings
  const isLoading = status === 'loading';
  const isSpeaking = status === 'speaking';
  const isIdle = status === 'idle';

  /**
   * Stop any current speech, audio playback, fetch requests, and free blob URLs
   */
  const stop = useCallback(() => {
    // 1. Clean up audio sync
    if (syncCleanupRef.current) {
      try { syncCleanupRef.current(); } catch { }
      syncCleanupRef.current = null;
    }
    setSyncState({
      activeWordIndex: -1,
      activeLineIndex: -1,
      activeCharIndex: -1,
      progress: 0,
      isSpeaking: false,
      spokenText: '',
    });

    // 2. Abort any pending HTTP requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 3. Stop browser native speech
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('SpeechSynthesis cancel error', e);
    }

    // 4. Pause and clean up HTMLAudioElement
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      } catch (e) {
        console.warn('Audio pause error', e);
      }
      audioRef.current = null;
    }

    // 5. Free allocated Object URL to avoid memory leaks
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setStatus('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  /**
   * Check health of local server
   */
  const checkHealth = useCallback(async () => {
    const piperOk = await checkPiperHealth();
    setServerHealth(prev => {
      if (prev.piper === piperOk) return prev;
      return { piper: piperOk };
    });
    return { piper: piperOk };
  }, []);

  // Run periodic health check (polls every 3s until ready, then every 60s)
  useEffect(() => {
    let cancelled = false;
    const runCheck = async () => {
      if (cancelled) return;
      await checkHealth();
    };

    runCheck();
    const fastPoll = setInterval(async () => {
      if (cancelled) return;
      const res = await checkHealth();
      if (res.piper) {
        clearInterval(fastPoll);
      }
    }, 3000);

    const slowPoll = setInterval(runCheck, 60000);
    return () => {
      cancelled = true;
      clearInterval(fastPoll);
      clearInterval(slowPoll);
    };
  }, [checkHealth]);

  /**
   * Play an audio Blob via Web Audio API (primary) → HTMLAudio (fallback)
   * Web Audio API is used first because it bypasses Electron's autoplay policy
   * which silently blocks HTMLAudio.play() on new/unconfigured machines.
   */
  const playBlob = useCallback((blob, options = {}) => {
    const { onStart, onEnd, onError, rawText, onSyncUpdate } = options;

    return new Promise(async (resolve, reject) => {
      // Revoke any previous object URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (syncCleanupRef.current) {
        try { syncCleanupRef.current(); } catch { }
        syncCleanupRef.current = null;
      }

      const hasArabic = rawText && /[\u0600-\u06FF]/.test(rawText);

      // === PRIMARY: Web Audio API (immune to Electron autoplay policy) ===
      try {
        const ctx = await getAudioCtx();
        if (ctx) {
          const arrayBuf = await blob.arrayBuffer();
          const decoded = await ctx.decodeAudioData(arrayBuf);
          const source = ctx.createBufferSource();
          source.buffer = decoded;
          // Natural playback rate — Polly voices sound best at 1.0
          source.playbackRate.value = 1.0;

          // Explicit gain node at full volume (guards against system-level muting)
          const gain = ctx.createGain();
          gain.gain.value = 1.0;
          source.connect(gain);
          gain.connect(ctx.destination);

          // Attach sync via a muted dummy audio element for timing only
          let dummyAudio = null;
          if (rawText) {
            const audioUrl = URL.createObjectURL(blob);
            objectUrlRef.current = audioUrl;
            dummyAudio = new Audio(audioUrl);
            dummyAudio.muted = true;
            dummyAudio.playbackRate = 1.0;
            audioRef.current = dummyAudio;
            syncCleanupRef.current = attachAudioSync(
              dummyAudio,
              rawText,
              (syncData) => {
                setSyncState(syncData);
                if (onSyncUpdate) onSyncUpdate(syncData);
              },
              () => {
                setSyncState({
                  activeWordIndex: -1,
                  activeLineIndex: -1,
                  activeCharIndex: -1,
                  progress: 1,
                  isSpeaking: false,
                  spokenText: rawText,
                });
              }
            );
            dummyAudio.play().catch(() => {}); // silent, just for timing events
          }

          source.onended = () => {
            if (dummyAudio) {
              try { dummyAudio.pause(); } catch {}
            }
            if (syncCleanupRef.current) {
              try { syncCleanupRef.current(); } catch {}
              syncCleanupRef.current = null;
            }
            if (objectUrlRef.current) {
              URL.revokeObjectURL(objectUrlRef.current);
              objectUrlRef.current = null;
            }
            audioRef.current = null;
            setStatus('idle');
            if (onEnd) onEnd();
            resolve(true);
          };

          setStatus('speaking');
          if (onStart) onStart();
          source.start(0);
          console.log('[playBlob] ✔ Web Audio API playing audio (singleton ctx, state:', ctx.state, ')');
          return;
        }
      } catch (webAudioErr) {
        console.warn('[playBlob] Web Audio API failed, trying HTMLAudio:', webAudioErr.message);
      }

      // === FALLBACK: HTMLAudioElement ===
      try {
        const audioUrl = URL.createObjectURL(blob);
        objectUrlRef.current = audioUrl;
        const audio = new Audio(audioUrl);
        audio.playbackRate = hasArabic ? 1.0 : 0.9;
        audio.volume = 1.0;
        audioRef.current = audio;

        if (rawText) {
          syncCleanupRef.current = attachAudioSync(
            audio,
            rawText,
            (syncData) => {
              setSyncState(syncData);
              if (onSyncUpdate) onSyncUpdate(syncData);
            },
            () => {
              setSyncState({
                activeWordIndex: -1,
                activeLineIndex: -1,
                activeCharIndex: -1,
                progress: 1,
                isSpeaking: false,
                spokenText: rawText,
              });
            }
          );
        }

        audio.onplay = () => { setStatus('speaking'); if (onStart) onStart(); };
        audio.onended = () => {
          if (syncCleanupRef.current) { try { syncCleanupRef.current(); } catch {} syncCleanupRef.current = null; }
          if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
          audioRef.current = null;
          setStatus('idle');
          if (onEnd) onEnd();
          resolve(true);
        };
        audio.onerror = () => {
          if (syncCleanupRef.current) { try { syncCleanupRef.current(); } catch {} syncCleanupRef.current = null; }
          if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
          audioRef.current = null;
          const errMsg = audio.error ? `Audio error code ${audio.error.code}` : 'Audio playback error';
          setStatus('error'); setError(errMsg);
          if (onError) onError(new Error(errMsg));
          reject(new Error(errMsg));
        };

        await audio.play();
        console.log('[playBlob] ✔ HTMLAudio playing');
      } catch (htmlAudioErr) {
        console.error('[playBlob] All playback methods failed:', htmlAudioErr.message);
        setStatus('error');
        setError(htmlAudioErr.message);
        if (onError) onError(htmlAudioErr);
        reject(htmlAudioErr);
      }
    });
  }, []);

  /**
   * Unified Speak Method
   * Dynamically handles Piper (Electron IPC & HTTP) and Browser native fallback with real-time text sync
   */
  const speak = useCallback(
    async (text, options = {}) => {
      const clean = cleanTextForSpeech(text);
      if (!clean) return false;

      // Stop any existing speech first
      stop();
      setError(null);
      setStatus('loading');
      setSyncState({
        activeWordIndex: 0,
        activeLineIndex: 0,
        activeCharIndex: 0,
        progress: 0,
        isSpeaking: true,
        spokenText: text,
      });

      const targetEngine = options.engine || engine;
      const targetVoice = options.voiceId || activeVoiceId;
      const targetLang = options.lang || 'en-GB';
      const fallbackToBrowser = options.fallbackToBrowser !== false; // default true
      const onSyncUpdate = options.onSyncUpdate;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const isArabic = ARABIC_RE.test(clean) || targetLang?.startsWith('ar');
        const resolvedVoice = isArabic ? (options.gender === 'female' ? 'Hala' : 'Zayd') : targetVoice;

        // --- 1. AMAZON POLLY TTS (Cloud Neural Voices - Arabic Hala/Zayd, English Joanna/Matthew) ---
        // For Arabic, ALWAYS use Amazon Polly (fast 200ms cloud neural voice) instead of slow local Piper CPU
        if (targetEngine === 'polly' || isArabic) {
          try {
            const pollyVoiceId = resolvePollyVoice({
              voiceId: targetVoice,
              gender: options.gender,
              lang: isArabic ? 'ar-AE' : targetLang,
              charId: options.charId || options.characterId
            });

            const audioBuffer = await synthesizePollySpeech(clean, {
              lang: isArabic ? 'ar-AE' : targetLang,
              gender: options.gender,
              voiceId: pollyVoiceId,
              charId: options.charId || options.characterId
            });
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
            await playBlob(audioBlob, { ...options, rawText: text, onSyncUpdate });
            return true;
          } catch (pollyErr) {
            console.warn('[useMascotVoice] Polly synthesis failed, trying Piper/browser fallback:', pollyErr.message);
            // Fall through to Piper or Browser fallback
          }
        }

        // --- 2. ELECTRON NATIVE PIPER IPC (Instant <150ms for Piper engine) ---
        if ((targetEngine === 'piper' || targetEngine === 'polly') && window.electronAPI?.generatePiperTTS) {
          const voiceModel = isArabic
            ? 'Kareem'
            : (resolvedVoice.includes('joe') ? 'Joe' : resolvedVoice.includes('lessac') ? 'Lessac' : resolvedVoice.includes('alba') ? 'Alba' : resolvedVoice.includes('amy') ? 'Amy' : 'Ryan');

          try {
            const wavPath = await window.electronAPI.generatePiperTTS(clean, voiceModel);
            if (wavPath && typeof wavPath === 'string' && !wavPath.startsWith('ERROR')) {
              const audio = new Audio(`file://${wavPath}`);
              audio.volume = 1.0;
              if (isArabic) audio.playbackRate = 1.25;
              audioRef.current = audio;

              // Attach real-time sync
              syncCleanupRef.current = attachAudioSync(
                audio,
                text,
                (syncData) => {
                  setSyncState(syncData);
                  if (onSyncUpdate) onSyncUpdate(syncData);
                },
                () => {
                  setSyncState({
                    activeWordIndex: -1,
                    activeLineIndex: -1,
                    activeCharIndex: -1,
                    progress: 1,
                    isSpeaking: false,
                    spokenText: text,
                  });
                }
              );

              return new Promise((resolve) => {
                audio.onplay = () => {
                  setStatus('speaking');
                  if (options.onStart) options.onStart();
                };
                audio.onended = () => {
                  if (syncCleanupRef.current) {
                    try { syncCleanupRef.current(); } catch { }
                    syncCleanupRef.current = null;
                  }
                  audioRef.current = null;
                  setStatus('idle');
                  if (options.onEnd) options.onEnd();
                  resolve(true);
                };
                audio.onerror = (e) => {
                  if (syncCleanupRef.current) {
                    try { syncCleanupRef.current(); } catch { }
                    syncCleanupRef.current = null;
                  }
                  audioRef.current = null;
                  setStatus('idle');
                  if (options.onError) options.onError(e);
                  resolve(false);
                };

                audio.play().catch((playErr) => {
                  if (playErr.name === 'AbortError') {
                    resolve(false);
                    return;
                  }
                  setStatus('error');
                  setError(playErr.message);
                  if (options.onError) options.onError(playErr);
                  resolve(false);
                });
              });
            }
          } catch (ipcErr) {
            console.warn('[useMascotVoice] Electron IPC TTS failed, trying HTTP Piper:', ipcErr.message);
          }
        }

        // --- 3. PIPER TTS HTTP (:8100) ---
        if (targetEngine === 'piper' || targetEngine === 'polly') {
          try {
            const audioBlob = await synthesizePiperAudio(
              clean,
              resolvedVoice,
              controller.signal,
            );
            await playBlob(audioBlob, { ...options, rawText: text, onSyncUpdate });
            return true;
          } catch (piperErr) {
            console.warn('[useMascotVoice] Piper failed, attempting Polly cloud fallback:', piperErr.message);
          }
        }

        // --- 3.5. AMAZON POLLY CLOUD FALLBACK (after Piper fails) ---
        if (targetEngine !== 'polly' && !isArabic) {
          try {
            const pollyVoiceId = resolvePollyVoice({
              voiceId: targetVoice,
              gender: options.gender,
              lang: targetLang || 'en-US',
              charId: options.charId || options.characterId
            });

            const audioBuffer = await synthesizePollySpeech(clean, {
              lang: targetLang || 'en-US',
              gender: options.gender,
              voiceId: pollyVoiceId,
              charId: options.charId || options.characterId
            });
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
            await playBlob(audioBlob, { ...options, rawText: text, onSyncUpdate });
            return true;
          } catch (pollyFallbackErr) {
            console.warn('[useMascotVoice] Polly cloud fallback failed:', pollyFallbackErr.message);
          }
        }

        // --- 4. BROWSER NATIVE TTS FALLBACK ---
        setStatus('speaking');
        if (options.onStart) options.onStart();
        const utterance = await synthesizeBrowserNative(clean, {
          lang: isArabic ? 'ar-SA' : targetLang,
          onEnd: () => {
            if (syncCleanupRef.current) {
              try { syncCleanupRef.current(); } catch { }
              syncCleanupRef.current = null;
            }
            setStatus('idle');
            setSyncState({
              activeWordIndex: -1,
              activeLineIndex: -1,
              activeCharIndex: -1,
              progress: 1,
              isSpeaking: false,
              spokenText: text,
            });
            if (options.onEnd) options.onEnd();
          },
          onError: (err) => {
            if (syncCleanupRef.current) {
              try { syncCleanupRef.current(); } catch { }
              syncCleanupRef.current = null;
            }
            setStatus('error');
            setError(err?.error || 'Browser speech error');
            if (options.onError) options.onError(err);
          },
        });

        if (utterance) {
          syncCleanupRef.current = attachSpeechSynthesisSync(
            utterance,
            text,
            (syncData) => {
              setSyncState(syncData);
              if (onSyncUpdate) onSyncUpdate(syncData);
            },
            () => {
              setSyncState({
                activeWordIndex: -1,
                activeLineIndex: -1,
                activeCharIndex: -1,
                progress: 1,
                isSpeaking: false,
                spokenText: text,
              });
            }
          );
        }
        return true;
      } catch (err) {
        if (err.name === 'AbortError') {
          return false;
        }

        console.warn(`[useMascotVoice] ${targetEngine} failed:`, err.message);

        // --- AUTOMATIC FALLBACK TO BROWSER SPEECH ---
        if (fallbackToBrowser && targetEngine !== 'browser') {
          console.warn('[useMascotVoice] Falling back to Browser SpeechSynthesis.');
          setError(`${targetEngine.toUpperCase()} offline. Using browser voice fallback.`);
          setStatus('speaking');
          if (options.onStart) options.onStart();

          try {
            const utterance = await synthesizeBrowserNative(clean, {
              lang: targetLang,
              onEnd: () => {
                if (syncCleanupRef.current) {
                  try { syncCleanupRef.current(); } catch { }
                  syncCleanupRef.current = null;
                }
                setStatus('idle');
                setSyncState({
                  activeWordIndex: -1,
                  activeLineIndex: -1,
                  activeCharIndex: -1,
                  progress: 1,
                  isSpeaking: false,
                  spokenText: text,
                });
                if (options.onEnd) options.onEnd();
              },
              onError: (browserErr) => {
                if (syncCleanupRef.current) {
                  try { syncCleanupRef.current(); } catch { }
                  syncCleanupRef.current = null;
                }
                setStatus('error');
                setError('Speech synthesis failed completely.');
                if (options.onError) options.onError(browserErr);
              },
            });

            if (utterance) {
              syncCleanupRef.current = attachSpeechSynthesisSync(
                utterance,
                text,
                (syncData) => {
                  setSyncState(syncData);
                  if (onSyncUpdate) onSyncUpdate(syncData);
                },
                () => {
                  setSyncState({
                    activeWordIndex: -1,
                    activeLineIndex: -1,
                    activeCharIndex: -1,
                    progress: 1,
                    isSpeaking: false,
                    spokenText: text,
                  });
                }
              );
            }
            return true;
          } catch (fallbackErr) {
            setStatus('error');
            setError(fallbackErr.message);
            if (options.onError) options.onError(fallbackErr);
            return false;
          }
        }

        setStatus('error');
        setError(err.message);
        if (options.onError) options.onError(err);
        return false;
      }
    },
    [engine, activeVoiceId, stop, playBlob]
  );

  return {
    // Current States
    status,
    isLoading,
    isSpeaking,
    isIdle,
    error,
    engine,
    activeVoiceId,
    serverHealth,
    syncState,

    // Controls
    speak,
    stop,
    setEngine,
    setActiveVoiceId,
    checkHealth,

    // Voice Data List
    piperVoices: PIPER_VOICES,
    pollyVoices: POLLY_VOICE_LIST,
  };
}

export const POLLY_VOICE_LIST = [
  { id: 'Hala', name: 'Hala — Female, Arabic (Neural)', lang: 'ar-AE' },
  { id: 'Zayd', name: 'Zayd — Male, Arabic (Neural)', lang: 'ar-AE' },
  { id: 'Zeina', name: 'Zeina — Female, Arabic (Standard)', lang: 'arb' },
  { id: 'Joanna', name: 'Joanna — Female, English (Neural)', lang: 'en-US' },
  { id: 'Matthew', name: 'Matthew — Male, English (Neural)', lang: 'en-US' },
];

export default useMascotVoice;


