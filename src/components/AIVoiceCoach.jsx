import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaRobot, FaVolumeUp, FaVolumeMute, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaGlobe, FaPaperPlane, FaUser, FaHeadphones } from 'react-icons/fa';
import { getAppDataSnapshot, formatSnapshotForAI } from '../utils/appDataSnapshot';
import { callAICoach } from '../services/aiCoachService';
import { sendVoiceAudioToBackend } from '../services/voiceCoachBackendService';
import { useMascotVoice } from '../hooks/useMascotVoice';
import { cleanTextForSpeech } from '../services/ttsService';
import { transcribeAudioWithGroq, VoiceRecorder } from '../services/sttService';
import { MASCOT_CHARACTERS } from '../data/mascotCharacters';
import { getAvatarPath } from '../data/animeAvatars';
import VoiceSyncText from './VoiceSyncText';
import './AIVoiceCoach.css';

const ARABIC_RE = /[\u0600-\u06FF]/;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: format seconds to MM:SS
// ─────────────────────────────────────────────────────────────────────────────
function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AIVoiceCoach({ onClose, inline = false, initialLang = null, activeCharacter = null }) {
  const coachChar = activeCharacter || MASCOT_CHARACTERS[localStorage.getItem('mascot_character') || 'chrollo'] || MASCOT_CHARACTERS.chrollo;

  // ── Language State ─────────────────────────────────────────────────────────
  const [currentLang, setCurrentLang] = useState(() => {
    if (initialLang) return initialLang;
    try {
      const saved = localStorage.getItem('robin_ui_lang');
      return (saved === 'ar-SA' || saved === 'ar') ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });

  const isAr = currentLang === 'ar';

  // ── State ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('connecting'); // connecting | active | ended
  const [callStatus, setCallStatus] = useState('connecting'); // connecting | speaking | listening | thinking | idle | ended
  const [transcript, setTranscript] = useState('');
  const [lastUserMessage, setLastUserMessage] = useState(''); // Stores user transcript
  const [liveUserText, setLiveUserText] = useState(''); // Live real-time speech-to-text words
  const [typedInput, setTypedInput] = useState('');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isListeningActive, setIsListeningActive] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const convHistoryRef = useRef([]); // conversation history [{role,content}]
  const dataContextRef = useRef('');
  const recognitionRef = useRef(null);
  const voiceRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const abortRef = useRef(null);
  const isMountedRef = useRef(true);
  const langRef = useRef(currentLang);
  langRef.current = currentLang;

  // ── Voice hook ─────────────────────────────────────────────────────────────
  const voice = useMascotVoice({ defaultEngine: 'piper' });

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      recognitionRef.current?.stop();
      if (voiceRecorderRef.current) {
        voiceRecorderRef.current.stop().catch(() => {});
      }
      abortRef.current?.abort();
      voice.stop();
      clearInterval(timerRef.current);
      clearTimeout(silenceTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Call timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => {
        if (isMountedRef.current) setCallSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ── Speak text via TTS (Piper Local Neural with fallback) ─────────────────
  const speakText = useCallback(async (text, langOverride = null) => {
    if (!isMountedRef.current || voiceMuted) return;
    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    const targetLang = langOverride || (ARABIC_RE.test(clean) ? 'ar' : langRef.current);
    const isArabic = targetLang === 'ar' || ARABIC_RE.test(clean);

    const charGender = coachChar?.gender || (['robin', 'mikasa', 'hinata', 'nezuko', 'nami', 'boa', 'tsunade', 'sakura', 'yor', 'anya'].includes(coachChar?.id) ? 'female' : 'male');
    if (isMountedRef.current) setCallStatus('speaking');
    return new Promise((resolve) => {
      voice.speak(clean, {
        engine: 'polly', // Use Amazon Polly for high-quality neural voices
        charId: coachChar?.id,
        voiceId: coachChar?.defaultVoice || coachChar?.id,
        lang: isArabic ? 'ar-AE' : 'en-US',
        gender: charGender,
        onEnd: () => {
          if (isMountedRef.current) setCallStatus('idle');
          resolve(true);
        },
        onError: () => {
          if (isMountedRef.current) setCallStatus('idle');
          resolve(false);
        },
      }).then((res) => {
        if (isMountedRef.current) setCallStatus('idle');
        resolve(res);
      }).catch(() => {
        if (isMountedRef.current) setCallStatus('idle');
        resolve(false);
      });
    });
  }, [voice, voiceMuted]);

  // ── Stable function references to avoid circular dependency / TDZ errors ──
  const handleUserSpeechRef = useRef(null);
  const finishListeningRef = useRef(null);
  const startListeningRef = useRef(null);

  // ── Stop Listening & Transcribe with FastAPI Groq Whisper Pipeline ────────
  const finishListening = useCallback(async (interimFallback = '') => {
    if (!isMountedRef.current) return;
    clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    setIsListeningActive(false);
    setCallStatus('transcribing');

    let transcribedText = interimFallback;
    let precomputedAiResponse = null;

    if (voiceRecorderRef.current) {
      try {
        const audioBlob = await voiceRecorderRef.current.stop();
        voiceRecorderRef.current = null;
        if (audioBlob && audioBlob.size > 100) {
          const langCode = langRef.current === 'ar' ? 'ar' : 'en';
          
          // 1. Send audio Blob & app data context to Python FastAPI Backend
          try {
            const backendResult = await sendVoiceAudioToBackend(
              audioBlob,
              dataContextRef.current,
              { language: langCode, history: convHistoryRef.current }
            );
            if (backendResult?.user_transcript) {
              transcribedText = backendResult.user_transcript;
              precomputedAiResponse = backendResult.ai_response;
            }
          } catch (backendErr) {
            console.warn('[AIVoiceCoach] FastAPI backend offline, using direct Groq client STT:', backendErr.message);
            const whisperText = await transcribeAudioWithGroq(audioBlob, langCode);
            if (whisperText && whisperText.trim()) {
              transcribedText = whisperText.trim();
            }
          }
        }
      } catch (err) {
        console.warn('[AIVoiceCoach] Audio recording error:', err);
      }
    }

    if (transcribedText && transcribedText.trim()) {
      const cleanUserSpoken = transcribedText.trim();
      // Immediately display user's recognized voice in the UI
      setLastUserMessage(cleanUserSpoken);
      setTypedInput(cleanUserSpoken);
      setLiveUserText('');
      setCallStatus('thinking');

      if (handleUserSpeechRef.current) {
        await handleUserSpeechRef.current(cleanUserSpoken, precomputedAiResponse);
      }
    } else {
      setCallStatus('idle');
      setTranscript(
        langRef.current === 'ar'
          ? 'لم أتمكن من سماعك بوضوح. اضغط على المايك وتحدث مجدداً.'
          : 'I didn\'t catch that. Tap the mic and speak again.'
      );
    }
  }, []);

  finishListeningRef.current = finishListening;

  // ── Start speech recognition (Dual Groq Whisper + Web Speech) ─────────────
  const startListening = useCallback(async () => {
    if (isMuted || !isMountedRef.current) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (voiceRecorderRef.current) {
        try { await voiceRecorderRef.current.stop(); } catch {}
      }

      setIsListeningActive(true);
      setCallStatus('listening');
      setLiveUserText('');

      // 1. Start Groq Audio Recording with live streaming Whisper transcription
      const recorder = new VoiceRecorder({
        lang: langRef.current === 'ar' ? 'ar' : 'en',
        onLiveTranscript: (liveText) => {
          if (liveText && liveText.trim() && isMountedRef.current) {
            setTypedInput(liveText.trim());
            setLiveUserText(liveText.trim());
          }
        },
        onSpeechStart: () => {
          if (isMountedRef.current) setCallStatus('listening');
        },
        onSilence: () => {
          if (isMountedRef.current && finishListeningRef.current) {
            finishListeningRef.current();
          }
        },
      });
      await recorder.start();
      voiceRecorderRef.current = recorder;

      // 2. Also start Web Speech API for instant interim preview if supported (browser only)
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR && !window.electronAPI) {
        const rec = new SR();
        rec.lang = langRef.current === 'ar' ? 'ar-SA' : 'en-US';
        rec.interimResults = true;
        rec.continuous = true;

        rec.onresult = (e) => {
          let interim = '';
          let finalSaid = '';

          for (let i = e.resultIndex; i < e.results.length; i++) {
            const item = e.results[i];
            const text = item[0]?.transcript || '';
            if (item.isFinal) finalSaid += text;
            else interim += text;
          }

          const currentWords = finalSaid || interim;
          if (currentWords) {
            setLiveUserText(currentWords);
            setTypedInput(currentWords);

            // Reset silence timer: when user pauses for 2 seconds, transcribe and send
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (isMountedRef.current && finishListeningRef.current) {
                finishListeningRef.current(currentWords);
              }
            }, 2000);
          }
        };

        rec.onerror = () => {};
        rec.onend = () => {};
        recognitionRef.current = rec;
        try { rec.start(); } catch {}
      }
    } catch (err) {
      console.warn('[AIVoiceCoach] Mic start error:', err);
      setIsListeningActive(false);
      setCallStatus('idle');
    }
  }, [isMuted]);

  startListeningRef.current = startListening;

  // ── Handle user's spoken or typed message ─────────────────────────────────
  const handleUserSpeech = useCallback(async (userText, precomputedAiResponse = null) => {
    if (!userText || !userText.trim() || !isMountedRef.current) return;
    const cleanUserText = userText.trim();

    setCallStatus('thinking');
    setLiveUserText('');
    setTypedInput('');
    setLastUserMessage(cleanUserText);

    // Use the explicitly selected language
    const activeLang = langRef.current;
    voice.stop();

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reply = precomputedAiResponse || await callAICoach(
        cleanUserText,
        convHistoryRef.current,
        dataContextRef.current,
        controller.signal,
        activeLang
      );

      if (!isMountedRef.current) return;

      // Record in history
      convHistoryRef.current = [
        ...convHistoryRef.current,
        { role: 'user', content: cleanUserText },
        { role: 'assistant', content: reply },
      ].slice(-20); // keep last 10 exchanges

      setTranscript(reply);
      await speakText(reply, activeLang);

      // After AI speaks, auto-listen again
      if (isMountedRef.current) {
        setTimeout(() => {
          if (isMountedRef.current && phase === 'active' && startListeningRef.current) {
            startListeningRef.current();
          }
        }, 600);
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      if (isMountedRef.current) {
        setCallStatus('idle');
        setTranscript(
          activeLang === 'ar'
            ? 'حدث خطأ في الاتصال. اضغط على المايك للمحاولة مرة أخرى.'
            : 'Connection issue. Tap the mic to continue.'
        );
      }
    }
  }, [voice, speakText, phase]);

  handleUserSpeechRef.current = handleUserSpeech;

  // ── Submit typed message from input field ─────────────────────────────────
  const handleTypedSubmit = (e) => {
    if (e) e.preventDefault();
    if (!typedInput.trim()) return;
    const text = typedInput.trim();
    setTypedInput('');
    recognitionRef.current?.stop();
    handleUserSpeech(text);
  };

  // ── Toggle Language (EN <-> AR) on the fly ────────────────────────────────
  const toggleLanguage = useCallback(() => {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    setCurrentLang(newLang);
    recognitionRef.current?.stop();
    voice.stop();
    try {
      localStorage.setItem('robin_ui_lang', newLang === 'ar' ? 'ar-SA' : 'en-US');
    } catch {
      // ignore storage errors
    }
  }, [currentLang, voice]);

  // ── Initialize call: collect data + get opening message ───────────────────
  useEffect(() => {
    let cancelled = false;

    async function initCall() {
      // Collect full app data in the active language
      const snap = getAppDataSnapshot();
      const ctx = formatSnapshotForAI(snap, langRef.current);
      dataContextRef.current = ctx;

      // Delay for connecting animation
      await new Promise(r => setTimeout(r, 1200));
      if (cancelled || !isMountedRef.current) return;

      setPhase('active');
      setCallStatus('thinking');
      setTranscript(
        langRef.current === 'ar'
          ? 'المدرب يحلل بياناتك ويجهز ملخص جلستك…'
          : 'Your coach is preparing your briefing…'
      );

      try {
        const opening = await callAICoach(
          'START_CALL',
          [],
          ctx,
          null,
          langRef.current
        );
        if (cancelled || !isMountedRef.current) return;

        convHistoryRef.current = [
          { role: 'user', content: 'START_CALL' },
          { role: 'assistant', content: opening },
        ];

        setTranscript(opening);
        await speakText(opening, langRef.current);

        // Turn on microphone strictly AFTER coach has completely finished speaking the opening greeting
        if (!cancelled && isMountedRef.current && phase === 'active') {
          setTimeout(() => {
            if (!cancelled && isMountedRef.current && phase === 'active') {
              startListening();
            }
          }, 300);
        }
      } catch {
        if (!cancelled && isMountedRef.current) {
          setCallStatus('idle');
          setTranscript(
            langRef.current === 'ar'
              ? 'المدرب جاهز. تحدث في المايك أو اكتب رسالتك أدناه.'
              : 'Ready. Speak into your mic or type below.'
          );
          startListening();
        }
      }
    }

    initCall();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── End the call ──────────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    recognitionRef.current?.stop();
    abortRef.current?.abort();
    voice.stop();
    clearInterval(timerRef.current);
    clearTimeout(silenceTimerRef.current);
    setPhase('ended');
    setCallStatus('ended');
    setIsListeningActive(false);
    setTranscript(
      isAr
        ? `انتهت المكالمة بعد ${formatTime(callSeconds)}. واصل التقدم — أنت قادر على تحقيق أهدافك!`
        : `Call ended after ${formatTime(callSeconds)}. Keep pushing — you've got this!`
    );
    setTimeout(() => {
      if (isMountedRef.current) onClose?.();
    }, 2000);
  }, [voice, callSeconds, onClose, isAr]);

  // ── Toggle mic: start recording or finish and transcribe ─────────────────
  const toggleMic = useCallback(() => {
    if (isListeningActive) {
      finishListening(liveUserText);
    } else {
      setIsMuted(false);
      startListening();
    }
  }, [isListeningActive, finishListening, liveUserText, startListening]);

  // ── Toggle voice output ────────────────────────────────────────────────────
  const toggleVoice = useCallback(() => {
    if (!voiceMuted) {
      voice.stop();
    }
    setVoiceMuted(v => !v);
  }, [voiceMuted, voice]);

  // ── Derived display values ─────────────────────────────────────────────────
  const statusLabel = {
    connecting:   isAr ? 'جاري الاتصال بالمدرب الذكي…' : 'Connecting to AI Coach…',
    speaking:     isAr ? 'المدرب يتحدث…' : 'AI Coach is speaking…',
    listening:    isAr ? 'يستمع لصوتك الآن…' : 'Listening to your voice…',
    transcribing: isAr ? 'جاري تحويل صوتك إلى نص…' : 'Transcribing your voice…',
    thinking:     isAr ? 'يفكر في إجابتك…' : 'Thinking…',
    idle:         isAr ? 'تحدث في المايك أو اضغط للتسجيل' : 'Speak into mic or tap to record',
    ended:        isAr ? 'تم إنهاء المكالمة' : 'Call ended',
  }[callStatus] || '';

  const isAnimating = callStatus === 'speaking';
  const isBusy = phase !== 'active' || callStatus === 'thinking' || callStatus === 'speaking' || callStatus === 'connecting';

  const inner = (
    <div className={inline ? 'avc-modal avc-inline' : 'avc-modal'} dir={isAr ? 'rtl' : 'ltr'}>

      {/* Header bar with language switch */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="avc-caller-label">
          {isAr ? 'مكالمة صوتية مباشرة' : 'Live Voice Call'}
        </div>
        
        {/* Language switch button */}
        <button
          onClick={toggleLanguage}
          title={isAr ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
          aria-label={isAr ? 'Switch to English' : 'Switch to Arabic'}
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            borderRadius: '20px',
            padding: '3px 10px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s ease',
          }}
        >
          <FaGlobe style={{ fontSize: '0.8rem' }} />
          {isAr ? 'عربي (Amazon Polly)' : 'English (Neural)'}
        </button>
      </div>

      {/* Coach name */}
      <div className="avc-coach-header-group">
        <div className="avc-coach-name">
          {coachChar.name}
        </div>
        <div className="avc-coach-sub">
          {isAr ? 'مدربك الدراسي الذكي' : 'AI Study Coach'}
        </div>
      </div>

      {/* Avatar with pulse ring */}
      <div className="avc-avatar-wrap">
        <div
          className={`avc-avatar-ring ${isAnimating ? 'speaking' : isListeningActive ? 'listening-glow' : ''}`}
          style={{ borderColor: coachChar.defaultAura || '#38bdf8', color: coachChar.defaultAura || '#38bdf8' }}
        />
        <div
          className="avc-avatar-img"
          style={{ borderColor: coachChar.defaultAura ? `${coachChar.defaultAura}66` : undefined }}
        >
          <img
            src={coachChar.imageUrl || getAvatarPath(coachChar.id)}
            alt={coachChar.name}
            className="avc-avatar-img-real"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(coachChar.name)}&background=1a1e2e&color=fff&size=108`;
            }}
          />
        </div>
      </div>

      {/* Status text */}
      <div className={`avc-status ${callStatus}`}>
        {callStatus === 'connecting' && <span className="avc-spinner" />}
        {statusLabel}
      </div>

      {/* Call timer */}
      {phase === 'active' && (
        <div className="avc-timer">{formatTime(callSeconds)}</div>
      )}

      {/* Animated sound bars */}
      <div className="avc-wave-bars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`avc-wave-bar ${isAnimating || isListeningActive ? 'active' : ''}`}
            style={{ height: '8px' }}
          />
        ))}
      </div>

      {/* Live or Last User Transcript Display */}
      {(liveUserText || lastUserMessage) && (
        <div className="avc-user-transcript" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="avc-user-badge">
            <FaUser style={{ fontSize: '0.7rem', color: liveUserText ? '#ef4444' : '#818cf8' }} />
            <span>{liveUserText ? (isAr ? 'أنت تتحدث الآن:' : 'You (Speaking):') : (isAr ? 'أنت:' : 'You:')}</span>
          </div>
          <div className="avc-user-text">
            "{liveUserText || lastUserMessage}"
          </div>
        </div>
      )}

      {/* AI Transcript Box with Real-time Voice & Text Synchronization */}
      {transcript && !liveUserText && (
        <div className="avc-transcript" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="avc-coach-badge">
            <span className="avc-coach-badge-dot" style={{ backgroundColor: coachChar.defaultAura || '#38bdf8' }} />
            <span>{coachChar.name}</span>
          </div>
          <VoiceSyncText
            text={transcript}
            isSpeaking={callStatus === 'speaking' || voice.isSpeaking}
            activeWordIndex={voice.syncState?.activeWordIndex ?? -1}
            activeLineIndex={voice.syncState?.activeLineIndex ?? -1}
            isArabic={isAr}
            accentColor={coachChar.defaultAura || '#38bdf8'}
            activeColor={coachChar.defaultAura || '#38bdf8'}
          />
        </div>
      )}

      {/* Quick typed input fallback (type & speak option) */}
      {phase === 'active' && (
        <form
          onSubmit={handleTypedSubmit}
          style={{
            width: '100%',
            display: 'flex',
            gap: '6px',
            marginTop: '2px',
          }}
        >
          <input
            type="text"
            className="mascot-input"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder={isAr ? 'أو اكتب ردك هنا واضغط إرسال...' : 'Or type your message here...'}
            style={{
              flex: 1,
              fontSize: '0.78rem',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#fff',
            }}
          />
          <button
            type="submit"
            disabled={!typedInput.trim()}
            style={{
              background: typedInput.trim() ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: typedInput.trim() ? 'pointer' : 'default',
              opacity: typedInput.trim() ? 1 : 0.4,
            }}
          >
            <FaPaperPlane style={{ fontSize: '0.75rem' }} />
          </button>
        </form>
      )}

      {/* Call controls */}
      <div className="avc-controls">
        {/* Mute / unmute voice output */}
        <button
          className={`avc-btn avc-btn-vol ${voiceMuted ? 'muted' : ''}`}
          onClick={toggleVoice}
          title={voiceMuted ? (isAr ? 'تشغيل الصوت' : 'Unmute coach voice') : (isAr ? 'كتم الصوت' : 'Mute coach voice')}
          aria-label={voiceMuted ? 'Unmute coach voice' : 'Mute coach voice'}
        >
          {voiceMuted ? <FaVolumeMute style={{ color: '#f87171' }} /> : <FaVolumeUp style={{ color: '#94a3b8' }} />}
        </button>

        {/* End call */}
        <button
          className="avc-btn avc-btn-end"
          onClick={endCall}
          title={isAr ? 'إنهاء المكالمة' : 'End call'}
          aria-label={isAr ? 'إنهاء المكالمة' : 'End call'}
        >
          <FaPhoneSlash style={{ color: '#ffffff' }} />
        </button>

        {/* Microphone */}
        <button
          className={`avc-btn avc-btn-mic ${isListeningActive ? 'listening-active' : ''}`}
          onClick={toggleMic}
          disabled={isBusy && !isListeningActive}
          title={isListeningActive ? (isAr ? 'إيقاف الاستماع' : 'Stop listening') : (isAr ? 'تحدث إلى المدرب' : 'Speak to coach')}
          aria-label={isListeningActive ? 'Stop listening' : 'Speak to coach'}
        >
          {isMuted ? (
            <FaMicrophoneSlash style={{ color: '#94a3b8' }} />
          ) : isListeningActive ? (
            <FaMicrophone style={{ color: '#ef4444', animation: 'avc-pulse-ring 1s infinite' }} />
          ) : (
            <FaMicrophone style={{ color: '#38bdf8' }} />
          )}
        </button>
      </div>

    </div>
  );

  if (inline) return inner;

  return (
    <div className="avc-overlay" role="dialog" aria-label="AI Voice Coach Call" aria-modal="true">
      {inner}
    </div>
  );
}


