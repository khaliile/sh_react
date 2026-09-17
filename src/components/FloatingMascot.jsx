import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FaTimes,
  FaBookOpen,
  FaCog,
  FaVolumeUp,
  FaVolumeMute,
  FaServer,
  FaPaperPlane,
  FaCommentDots,
  FaBan,
  FaStar,
} from 'react-icons/fa';
import './FloatingMascot.css';
import { useMascotVoice } from '../hooks/useMascotVoice';
import { cleanTextForSpeech } from '../services/ttsService';
import { saveChatHistory, loadChatHistory, clearChatHistory } from '../utils/chatStorage';
import { loadRPGStats, awardXP, resetRPGStats, getLevelUpReaction, getXPGainReaction, XP_REWARDS } from '../utils/rpgSystem';
import { synthesizePollySpeech, synthesizePollyArabic } from '../services/pollyService';
import { useInventoryStorage, ANIME_CHARACTERS } from '../hooks/useInventoryStorage';
import { MASCOT_CHARACTERS } from '../data/mascotCharacters';
import {
  getMascotConfig,
  getAutoPersonalityResponse,
  generateFallback,
  SELF_MOTIVATION_MESSAGES,
} from '../data/mascotConfig';
import { generateOfflineEventResponse } from '../data/mascotOfflineQA';
import {
  readLiveAppState,
  buildMascotPrompt,
  queryMascotBrain,
  stripThinkTags,
  OPENROUTER_API_URL,
  DEFAULT_OPENROUTER_KEY,
} from '../utils/mascotAI';
import MascotSettings from './mascot/MascotSettings';
import MascotBubble from './mascot/MascotBubble';
import MascotAvatar, { MascotDockWidget } from './mascot/MascotAvatar';

const ARABIC_RE = /[\u0600-\u06FF]/;

const readStored = (key, legacyKey, fallback) =>
  localStorage.getItem(key) ??
  (legacyKey ? localStorage.getItem(legacyKey) : null) ??
  fallback;

const FloatingMascot = React.memo(function FloatingMascot() {
  const { equippedAvatar, collectibles, equipAvatar } = useInventoryStorage();

  const [activeChar, setActiveChar] = useState(() => {
    return equippedAvatar || readStored('mascot_character', null, 'chrollo');
  });
  const charConfig = getMascotConfig(activeChar);

  const [uiLang, setUiLang] = useState(() => readStored('robin_ui_lang', null, 'en-US'));
  const [isAr, setIsAr] = useState(uiLang === 'ar-SA');
  const [dialogueText, setDialogueText] = useState(() =>
    isAr ? (charConfig.greetingAr || charConfig.greetingEn) : (charConfig.greetingEn || 'Welcome back. The operation resumes — calm, focused, and mathematically inevitable.')
  );
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [pos, setPos] = useState(() => {
    try {
      const savedX = readStored('robin_mascot_x', null, null);
      const savedY = readStored('robin_mascot_y', null, null);
      if (savedX !== null && savedY !== null) {
        return { x: Number(savedX), y: Number(savedY) };
      }
    } catch {
      // Ignore malformed localStorage values.
    }
    return { x: Math.max(10, window.innerWidth - 150), y: Math.max(10, window.innerHeight - 200) };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0, hasMoved: false });
  const [isPinned, setIsPinned] = useState(() => localStorage.getItem('robin_mascot_pinned') === 'true');
  const lastTapRef = useRef(0);

  const [chatStatus, setChatStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking'
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [pollyQuotaExceeded, setPollyQuotaExceeded] = useState(false);
  const [ttsStatus, setTtsStatus] = useState('idle');
  const ttsAudioRef = useRef(null);

  const [chatHistory, setChatHistory] = useState([]);
  const chatHistoryRef = useRef([]);

  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  const [rpgStats, setRpgStats] = useState(null);
  const [showXpNotification, setShowXpNotification] = useState(null);

  // Unified Mascot Voice Hook
  const {
    isLoading: isVoiceLoading,
    isSpeaking: isVoiceSpeaking,
    engine: ttsEngine,
    setEngine: setTtsEngine,
    activeVoiceId: voiceId,
    setActiveVoiceId: setVoiceId,
    serverHealth,
    speak: mascotSpeak,
    stop: stopVoice,
    piperVoices,
  } = useMascotVoice({
    defaultEngine: readStored('mascot_tts_engine', null, 'piper'),
    defaultVoice: readStored('mascot_voice_id', null, charConfig.defaultVoice || 'en_US-ryan-medium'),
  });

  const [llmProvider] = useState(() =>
    readStored('robin_llm_provider', null, 'openrouter')
  );
  const [llmApiKey] = useState(() => {
    const saved = readStored('robin_llm_api_key', null, null);
    return (saved && saved.trim()) ? saved.trim() : DEFAULT_OPENROUTER_KEY;
  });
  const [llmModel] = useState(() =>
    readStored('robin_llm_model', null, 'meta-llama/llama-3.2-3b-instruct:free')
  );
  const [auraColor, setAuraColor] = useState(() =>
    readStored('mascot_aura_color', null, charConfig.defaultAura)
  );

  const recognitionRef = useRef(null);

  const visualStatus = chatStatus === 'listening'
    ? 'listening'
    : chatStatus === 'thinking'
      ? 'thinking'
      : isVoiceLoading
        ? 'loading'
        : isVoiceSpeaking
          ? 'speaking'
          : 'idle';

  const handleOpenStore = useCallback(() => {
    setIsBubbleOpen(false);
    window.dispatchEvent(new CustomEvent('open-shop-modal', { detail: { tab: 'avatars' } }));
    window.dispatchEvent(new CustomEvent('open-shop', { detail: { tab: 'avatars' } }));
  }, []);

  // Synchronize mascot character when equippedAvatar changes
  useEffect(() => {
    if (equippedAvatar && equippedAvatar !== activeChar) {
      const newChar = getMascotConfig(equippedAvatar);
      setActiveChar(equippedAvatar);
      setAuraColor(newChar.defaultAura || '#38bdf8');
      setVoiceId(newChar.defaultVoice || 'en_US-ryan-medium');
      setDialogueText(isAr ? (newChar.greetingAr || newChar.greetingEn) : newChar.greetingEn);
      
      if (chatHistoryRef.current && chatHistoryRef.current.length > 0) {
        saveChatHistory(chatHistoryRef.current, activeChar);
      }
      const loadedHistory = loadChatHistory(equippedAvatar);
      setChatHistory(loadedHistory);
      chatHistoryRef.current = loadedHistory;

      localStorage.setItem('mascot_character', equippedAvatar);
      localStorage.setItem('mascot_character_user_chosen', '1');
      if (newChar.defaultAura) localStorage.setItem('mascot_aura_color', newChar.defaultAura);
      if (newChar.defaultVoice) localStorage.setItem('mascot_voice_id', newChar.defaultVoice);
    }
  }, [equippedAvatar, activeChar, isAr, setVoiceId]);

  const handleCharChange = (newCharId) => {
    if (!collectibles?.[newCharId] && newCharId !== equippedAvatar && newCharId !== 'chrollo' && newCharId !== 'robin') {
      handleOpenStore();
      return;
    }
    const newChar = getMascotConfig(newCharId);
    setActiveChar(newCharId);
    setAuraColor(newChar.defaultAura || '#38bdf8');
    setVoiceId(newChar.defaultVoice || 'en_US-ryan-medium');
    setDialogueText(isAr ? (newChar.greetingAr || newChar.greetingEn) : newChar.greetingEn);
    
    if (chatHistory.length > 0) {
      saveChatHistory(chatHistory, activeChar);
    }
    
    const loadedHistory = loadChatHistory(newCharId);
    setChatHistory(loadedHistory);
    chatHistoryRef.current = loadedHistory;
    
    localStorage.setItem('mascot_character', newCharId);
    localStorage.setItem('mascot_character_user_chosen', '1');
    if (newChar.defaultAura) localStorage.setItem('mascot_aura_color', newChar.defaultAura);
    if (newChar.defaultVoice) localStorage.setItem('mascot_voice_id', newChar.defaultVoice);

    equipAvatar(newCharId);
  };

  const allAvailableCharacters = useMemo(() => {
    const map = new Map();
    (ANIME_CHARACTERS || []).forEach(c => map.set(c.id, c));
    Object.values(MASCOT_CHARACTERS || {}).forEach(c => {
      if (!map.has(c.id)) {
        map.set(c.id, {
          id: c.id,
          name: c.name,
          series: c.series,
          rarity: 'Rare',
          cost: 250,
        });
      }
    });
    return Array.from(map.values());
  }, []);

  const { unlockedCharacters, lockedCharacters } = useMemo(() => {
    const unlocked = [];
    const locked = [];
    allAvailableCharacters.forEach(c => {
      const isOwned = Boolean(collectibles?.[c.id] || c.id === equippedAvatar || c.id === activeChar);
      if (isOwned) {
        unlocked.push(c);
      } else {
        locked.push(c);
      }
    });
    return { unlockedCharacters: unlocked, lockedCharacters: locked };
  }, [allAvailableCharacters, collectibles, equippedAvatar, activeChar]);

  const handleLangChange = (newLang) => {
    const newIsAr = newLang === 'ar-SA';
    setIsAr(newIsAr);
    setUiLang(newLang);
    localStorage.setItem('robin_ui_lang', newLang);
    // Keep global app language in sync
    const appLang = newIsAr ? 'ar' : 'en';
    localStorage.setItem('app_language', appLang);
    window.dispatchEvent(new CustomEvent('app-language-changed', {
      detail: { isAr: newIsAr, lang: appLang }
    }));

    const newVoiceId = newIsAr 
      ? 'ar_JO-kareem-medium'
      : (charConfig.defaultVoice || 'en_US-ryan-medium');
    
    setVoiceId(newVoiceId);
    localStorage.setItem('mascot_voice_id', newVoiceId);
    
    const greeting = newIsAr ? (charConfig.greetingAr || charConfig.greetingEn) : charConfig.greetingEn;
    setDialogueText(greeting);
  };

  // RPG System Functions
  const handleXPGain = useCallback((amount, reason = '') => {
    const result = awardXP(amount, reason);
    setRpgStats(loadRPGStats());
    window.dispatchEvent(new CustomEvent('rpg-xp-gained', { detail: result }));
    
    setShowXpNotification({ amount, reason });
    setTimeout(() => setShowXpNotification(null), 3000);
    
    if (result.leveledUp) {
      const levelUpReaction = getLevelUpReaction(activeChar, result.newLevel, isAr);
      setDialogueText(levelUpReaction);
      if (!isMuted && speakResponseRef.current) {
        speakResponseRef.current(levelUpReaction);
      }
    } else if (amount >= 25) {
      const xpReaction = getXPGainReaction(activeChar, amount, reason, isAr);
      if (Math.random() < 0.3) {
        setDialogueText(xpReaction);
      }
    }
    
    return result;
  }, [activeChar, isAr, isMuted]);

  useEffect(() => {
    const stats = loadRPGStats();
    setRpgStats(stats);
    
    const loadedHistory = loadChatHistory(activeChar);
    if (loadedHistory.length > 0) {
      setChatHistory(loadedHistory);
      chatHistoryRef.current = loadedHistory;
    }
  }, [activeChar]);

  useEffect(() => {
    const handleResize = () => {
      setPos(p => ({
        x: Math.max(10, Math.min(p.x, window.innerWidth - 140)),
        y: Math.max(10, Math.min(p.y, window.innerHeight - 150)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync mascot language with global app language changes (e.g. Sidebar toggle)
  useEffect(() => {
    const handleGlobalLang = (e) => {
      const detail = e.detail;
      if (!detail) return;
      const targetIsAr = detail.lang === 'ar' || detail.lang === 'ar-SA' || detail.isAr === true;
      const newUiLang = targetIsAr ? 'ar-SA' : 'en-US';
      setIsAr(prev => {
        if (prev === targetIsAr) return prev;
        return targetIsAr;
      });
      setUiLang(newUiLang);
      localStorage.setItem('robin_ui_lang', newUiLang);
      const newVoiceId = targetIsAr ? 'ar_JO-kareem-medium' : (charConfigRef.current?.defaultVoice || 'en_US-ryan-medium');
      setVoiceId(newVoiceId);
      localStorage.setItem('mascot_voice_id', newVoiceId);
      const cfg = charConfigRef.current;
      if (cfg) {
        const greeting = targetIsAr ? (cfg.greetingAr || cfg.greetingEn) : cfg.greetingEn;
        setDialogueText(greeting);
      }
    };
    window.addEventListener('app-language-changed', handleGlobalLang);
    return () => window.removeEventListener('app-language-changed', handleGlobalLang);
  }, [setVoiceId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('robin_mascot_x', String(Math.round(pos.x)));
      localStorage.setItem('robin_mascot_y', String(Math.round(pos.y)));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [pos]);

  const speakResponseRef = useRef(null);
  const charConfigRef    = useRef(charConfig);
  const voiceIdRef       = useRef(voiceId);
  const llmProviderRef   = useRef(llmProvider);
  const llmApiKeyRef     = useRef(llmApiKey);
  const llmModelRef      = useRef(llmModel);
  const isMutedRef       = useRef(isMuted);
  const isArRef          = useRef(isAr);
  const activeCharRef    = useRef(activeChar);
  const ttsStatusRef     = useRef(ttsStatus);

  useEffect(() => {
    charConfigRef.current  = charConfig;
    voiceIdRef.current     = voiceId;
    llmProviderRef.current = llmProvider;
    llmApiKeyRef.current   = llmApiKey;
    llmModelRef.current    = llmModel;
    isMutedRef.current     = isMuted;
    isArRef.current        = isAr;
    activeCharRef.current  = activeChar;
    ttsStatusRef.current   = ttsStatus;
    chatHistoryRef.current = chatHistory;
  });

  const appStartFiredRef = useRef(false);
  const [showClickOverlay, setShowClickOverlay] = useState(true);
  const pauseHistoryRef = useRef([]);

  const playAudioSafe = useCallback(async (sourceOrBlob, { onPlay, onEnd, onError, playbackRate = 1.0 } = {}) => {
    let blob = sourceOrBlob;
    if (typeof sourceOrBlob === 'string') {
      try {
        const resp = await fetch(sourceOrBlob);
        blob = await resp.blob();
      } catch {
        try {
          const audio = new Audio(sourceOrBlob);
          audio.playbackRate = playbackRate;
          audio.volume = 1.0;
          ttsAudioRef.current = audio;
          audio.onplay = () => { if (onPlay) onPlay(); };
          audio.onended = () => { ttsAudioRef.current = null; if (onEnd) onEnd(); };
          audio.onerror = () => { ttsAudioRef.current = null; if (onError) onError(new Error('Audio playback error')); };
          await audio.play();
        } catch (e) {
          if (onError) onError(e);
        }
        return;
      }
    }

    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        const ctx = new AudioCtxClass();
        if (ctx.state === 'suspended') await ctx.resume();
        const arrayBuf = await blob.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrayBuf);
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.playbackRate.value = playbackRate;
        source.connect(ctx.destination);
        source.onended = () => {
          try { ctx.close(); } catch {}
          ttsAudioRef.current = null;
          if (onEnd) onEnd();
        };
        if (onPlay) onPlay();
        source.start(0);
        return;
      }
    } catch (webErr) {
      console.warn('[playAudioSafe] Web Audio failed, trying HTMLAudio:', webErr.message);
    }

    try {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = playbackRate;
      audio.volume = 1.0;
      ttsAudioRef.current = audio;
      audio.onplay = () => { if (onPlay) onPlay(); };
      audio.onended = () => { URL.revokeObjectURL(url); ttsAudioRef.current = null; if (onEnd) onEnd(); };
      audio.onerror = () => { URL.revokeObjectURL(url); ttsAudioRef.current = null; if (onError) onError(new Error('HTMLAudio error')); };
      await audio.play();
    } catch (htmlErr) {
      console.error('[playAudioSafe] All playback methods failed:', htmlErr.message);
      if (onError) onError(htmlErr);
    }
  }, []);

  const speakResponse = useCallback(async (text, options = {}) => {
    const clean = cleanTextForSpeech(text);
    if (!clean) {
      if (options.onEnd) options.onEnd();
      return false;
    }

    setDialogueText(clean);

    if (isMuted && !options.force) {
      if (options.onEnd) options.onEnd();
      return false;
    }

    const targetLang = options.lang || uiLang;
    const isArabicLang = targetLang === 'ar-SA' || targetLang?.startsWith('ar');
    const selectedVoiceId = isArabicLang ? 'ar_JO-kareem-medium' : (options.voiceId || voiceId);

    return await mascotSpeak(clean, {
      engine: ttsEngine,
      voiceId: selectedVoiceId,
      lang: targetLang,
      charId: charConfig?.id,
      characterId: charConfig?.id,
      gender: charConfig?.gender || 'male',
      fallbackToBrowser: true,
      onStart: () => { if (options.onStart) options.onStart(); },
      onEnd: () => { if (options.onEnd) options.onEnd(); },
      onError: (err) => {
        if (options.onError) options.onError(err);
        if (options.onEnd) options.onEnd();
      },
    });
  }, [cleanTextForSpeech, isMuted, mascotSpeak, ttsEngine, voiceId, uiLang, charConfig]);

  useEffect(() => {
    speakResponseRef.current = speakResponse;
  }, [speakResponse]);

  const speakViaElectron = useCallback(async (text, voiceIdOverride) => {
    const clean = cleanTextForSpeech(text);
    if (!clean || isMuted) return;

    const getVoiceModel = (vId) => {
      if (vId.includes('joe')) return 'Joe';
      if (vId.includes('alba')) return 'Alba';
      if (vId.includes('kareem') || vId.startsWith('ar_')) return 'Kareem';
      return 'Ryan';
    };

    const actualVoiceId = voiceIdOverride || voiceIdRef.current || 'en_US-ryan-medium';
    const voiceModel = getVoiceModel(actualVoiceId);
    const isArabicVoice = voiceModel === 'Kareem';
    const isArabicText = ARABIC_RE.test(clean);

    if (ttsAudioRef.current) {
      try { ttsAudioRef.current.pause(); ttsAudioRef.current.src = ''; } catch {}
      ttsAudioRef.current = null;
    }
    stopVoice();

    if (isArabicText && !pollyQuotaExceeded) {
      setTtsStatus('processing');
      try {
        const isFemaleChar = (
          charConfig?.gender === 'female' ||
          ['robin', 'mikasa', 'hinata', 'nezuko', 'nami', 'boa', 'tsunade', 'sakura', 'yor', 'anya'].includes(charConfig?.id)
        );
        const characterGender = isFemaleChar ? 'female' : 'male';
        const audioBuffer = await synthesizePollyArabic(clean, characterGender);
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        await playAudioSafe(audioBlob, {
          onPlay: () => setTtsStatus('green'),
          onEnd: () => setTtsStatus('idle'),
          onError: () => setTtsStatus('idle'),
        });
        return;
      } catch (err) {
        if (err.message === 'QUOTA_EXCEEDED') {
          setPollyQuotaExceeded(true);
        }
      }
    }

    if (window.electronAPI?.generatePiperTTS) {
      setTtsStatus('processing');
      const finalVoiceModel = (isArabicText || isArabicVoice) ? 'Kareem' : voiceModel;
      try {
        const wavPath = await window.electronAPI.generatePiperTTS(clean, finalVoiceModel);
        if (!wavPath || (typeof wavPath === 'string' && wavPath.startsWith('ERROR'))) {
          throw new Error(wavPath || 'IPC TTS returned no audio path');
        }
        const piperRate = finalVoiceModel === 'Kareem' ? 1.35 : 1.0;
        await playAudioSafe(`file://${wavPath}`, {
          playbackRate: piperRate,
          onPlay: () => setTtsStatus('green'),
          onEnd: () => setTtsStatus('idle'),
          onError: () => setTtsStatus('idle'),
        });
        return;
      } catch (err) {
        console.warn('[Mascot] Electron TTS unavailable, trying fallback:', err.message);
        setTtsStatus('idle');
      }
    }

    try {
      setTtsStatus('processing');
      const isFemaleChar = charConfig?.gender === 'female';
      const characterGender = isFemaleChar ? 'female' : 'male';
      const audioBuffer = await synthesizePollySpeech(clean, {
        lang: isArabicText ? 'ar-AE' : 'en-US',
        gender: characterGender,
        voiceId: voiceIdRef.current,
        charId: charConfig?.id
      });
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      await playAudioSafe(audioBlob, {
        onPlay: () => setTtsStatus('green'),
        onEnd: () => setTtsStatus('idle'),
        onError: () => setTtsStatus('idle'),
      });
      return;
    } catch {
      setTtsStatus('idle');
    }

    await speakResponse(clean, {
      lang: uiLang || 'en-US',
      voiceId: voiceIdRef.current || 'en_US-ryan-medium',
    });
  }, [isMuted, stopVoice, speakResponse, uiLang, pollyQuotaExceeded, charConfig, playAudioSafe]);

  const handleClickToStart = useCallback(async () => {
    if (appStartFiredRef.current) return;
    appStartFiredRef.current = true;
    setShowClickOverlay(false);

    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        if (ctx.state === 'suspended') await ctx.resume();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        src.onended = () => { try { ctx.close(); } catch {} };
      }
    } catch {
      // Ignore audio context unlock errors
    }

    const cfg = charConfigRef.current;
    const greeting = isAr
      ? (cfg?.greetingAr || cfg?.greetingEn)
      : (cfg?.greetingEn || 'Welcome back. The operation resumes.');
    
    setDialogueText(greeting);
    window.dispatchEvent(new CustomEvent('mascot-greeting-finished'));
  }, [isAr]);

  const runVoice = useCallback(async () => {
    if (window.electronAPI?.generatePiperTTS) {
      await speakViaElectron(dialogueText, voiceIdRef.current);
    } else {
      await speakResponse(dialogueText, { force: true });
    }
  }, [dialogueText, speakResponse, speakViaElectron]);

  const toggleListening = () => {
    if (chatStatus === 'listening') {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      recognitionRef.current = null;
      setChatStatus('idle');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDialogueText('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      stopVoice();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = uiLang;

      recognition.onstart = () => {
        setChatStatus('listening');
        setLiveTranscript('');
        setIsBubbleOpen(true);
      };

      recognition.onresult = (e) => {
        let interim = '';
        let finalText = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        setLiveTranscript(interim || finalText);
        if (finalText.trim()) handleUserSubmit(finalText);
      };

      recognition.onerror = () => {
        recognitionRef.current = null;
        setChatStatus('idle');
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        setChatStatus(prev => (prev === 'listening' ? 'idle' : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setChatStatus('idle');
    }
  };

  async function handleUserSubmit(textToSubmit) {
    const prompt = (textToSubmit || inputText).trim();
    if (!prompt || ttsStatus === 'processing') return;

    setInputText('');
    setLiveTranscript('');
    setIsBubbleOpen(true);
    setChatStatus('thinking');
    setDialogueText(isAr ? 'أفكر...' : 'Thinking...');

    let answer = await queryMascotBrain({
      userPrompt: prompt,
      eventType: 'USER_CHAT',
      charConfig: charConfigRef.current,
      isAr: isArRef.current,
      chatHistory: chatHistoryRef.current,
      llmApiKey: llmApiKeyRef.current,
      setIsOfflineMode,
    });

    const isArabicText = isAr || ARABIC_RE.test(answer);
    if (isArabicText) {
      const cleanedAnswer = answer
        .replace(/[A-Za-z]+/g, '')
        .replace(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '')
        .replace(/[^\u0600-\u06FF\u064B-\u065F\u0670\s،؛؟\.]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanedAnswer.length >= 10) {
        answer = cleanedAnswer;
      } else {
        answer = 'عَفْوًا، حَدَثَ خَطَأٌ. هَلْ يُمْكِنُكَ إِعَادَةُ السُّؤَالِ؟';
      }
    }

    answer = answer
      .replace(/(?:\s*\.\s*){2,}/g, '. ')
      .replace(/(?:\s*[؟?]\s*){2,}/g, '؟ ')
      .trim();

    setChatStatus('idle');
    setDialogueText(answer);

    const newChatHistory = [
      ...chatHistory,
      { role: 'user', content: prompt },
      { role: 'assistant', content: answer }
    ];
    
    setChatHistory(newChatHistory);
    chatHistoryRef.current = newChatHistory;
    saveChatHistory(newChatHistory, activeChar);
    handleXPGain(XP_REWARDS.CHAT_MESSAGE, 'chat_message');

    const selectedVoice = isArabicText ? 'ar_JO-kareem-medium' : voiceIdRef.current;
    speakViaElectron(answer, selectedVoice).catch(err => {
      console.warn('[Mascot] Background TTS failed:', err.message);
    });
  }

  // Unified mascot event listener
  useEffect(() => {
    const handleMascotEvent = async (e) => {
      const {
        eventType = 'POMODORO_FINISHED',
        taskName = '',
        userMessage = '',
        completedMins = 25,
        blockNumber = null,
        totalBlocks = null,
        todayTotalMins = null,
      } = e?.detail || {};

      const cfg = charConfigRef.current;
      const appState = readLiveAppState();

      if (todayTotalMins != null) {
        appState.studyHours = (todayTotalMins / 60).toFixed(1);
      }

      if (eventType === 'APP_START') {
        if (cfg.id === 'teach') {
          const teachAudio = new Audio('/sounds/blackbeard-laugh.mp3');
          teachAudio.onended = () => {
            window.dispatchEvent(new CustomEvent('mascot-event', {
              detail: { eventType: 'TEACH_BOSS_FINISHED' },
            }));
          };
          teachAudio.onerror = () => {
            window.dispatchEvent(new CustomEvent('mascot-greeting-finished'));
          };
          teachAudio.play().catch(() => {
            window.dispatchEvent(new CustomEvent('mascot-greeting-finished'));
          });
          return;
        }

        const greeting = isArRef.current
          ? (cfg.greetingAr || cfg.greetingEn)
          : (cfg.greetingEn || 'Welcome back. The operation resumes — calm, focused, and mathematically inevitable.');
        setDialogueText(greeting);
        const notifyFinish = () => {
          window.dispatchEvent(new CustomEvent('mascot-greeting-finished'));
        };

        if (!isArRef.current && !isMutedRef.current && speakResponseRef.current) {
          speakResponseRef.current(greeting, {
            lang: 'en-US',
            voiceId: voiceIdRef.current || 'en_US-ryan-medium',
            onEnd: notifyFinish,
            onError: notifyFinish,
          });
        } else {
          notifyFinish();
        }
        return;
      }

      if (eventType === 'TEACH_BOSS_FINISHED') {
        const reactionEn = cfg.id === 'chrollo'
          ? 'Kill him. That noisy laugh is all he has.'
          : 'Silence the noise. Continue the plan.';
        const reactionAr = 'اقتله. ضحكته المزعجة هي كل ما لديه.';
        const reaction = isArRef.current ? reactionAr : reactionEn;

        setDialogueText(reaction);
        const notifyFinish = () => {
          window.dispatchEvent(new CustomEvent('mascot-teach-reaction-finished'));
        };

        if (!isArRef.current && !isMutedRef.current && speakResponseRef.current) {
          speakResponseRef.current(reaction, {
            lang: 'en-US',
            voiceId: voiceIdRef.current || 'en_US-ryan-medium',
            onEnd: notifyFinish,
            onError: notifyFinish,
          });
        } else {
          notifyFinish();
        }
        return;
      }

      let interventionNote = '';
      if (eventType === 'TIMER_PAUSED') {
        const now = Date.now();
        pauseHistoryRef.current = pauseHistoryRef.current.filter(t => now - t < 10 * 60 * 1000);
        pauseHistoryRef.current.push(now);
        if (pauseHistoryRef.current.length >= 3) {
          interventionNote = isArRef.current
            ? 'تم رصد توقفات متكررة. جاري تقسيم الهدف إلى سبرنت مصغر لمدة 5 دقائق على الخطوة الأولى الآن.'
            : 'Frequent interruptions detected. Deconstructing the objective into a 5-minute micro-sprint. Focus on the very first sub-step now.';
        }
      }

      let fatigueNote = '';
      if (eventType === 'FATIGUE_ALERT' || (eventType === 'POMODORO_FINISHED' && blockNumber >= 2)) {
        fatigueNote = isArRef.current
          ? 'تم الوصول إلى الحد الذهني الأقصى. ابدأ استراحة تعافٍ تكتيكية لمدة 5 دقائق.'
          : 'Cognitive threshold reached. Initiate a 5-minute tactical recovery break.';
      }

      let contextNote = '';
      if (eventType === 'POMODORO_FINISHED') {
        const dailyGoalHours = Math.max(1, Number(localStorage.getItem('app_daily_study_goal_hours') || 5));
        const todayMins = todayTotalMins ?? (parseFloat(appState.studyHours) * 60);
        const remainingMins = Math.max(0, dailyGoalHours * 60 - todayMins);
        const blockCtx = blockNumber && totalBlocks
          ? `Block ${blockNumber} of ${totalBlocks} done. ${totalBlocks - blockNumber} block(s) remain.`
          : '';
        contextNote = `${completedMins}-min focus block on "${taskName || 'task'}" complete. Daily goal: ${dailyGoalHours}h, remaining: ${Math.floor(remainingMins / 60)}h ${remainingMins % 60}m. ${blockCtx}`.trim();
      } else if (taskName) {
        contextNote = `Task: "${taskName}"${userMessage ? `. Context: ${userMessage}` : ''}`;
      }

      const fullEventMessage = [interventionNote || fatigueNote || contextNote, userMessage].filter(Boolean).join('. ');
      const userPromptText = buildMascotPrompt(cfg, eventType, appState, fullEventMessage);

      const autoResponse = getAutoPersonalityResponse(eventType, activeCharRef.current, isArRef.current);
      let answer = autoResponse || interventionNote || fatigueNote || generateFallback(fullEventMessage, activeCharRef.current, eventType, isArRef.current);

      if (autoResponse) {
        setDialogueText(answer);
        setIsBubbleOpen(true);
        if (!isMutedRef.current && speakResponseRef.current) {
          const isArabicText = isArRef.current || ARABIC_RE.test(answer);
          speakResponseRef.current(answer, {
            lang: isArabicText ? 'ar-SA' : 'en-US',
            voiceId: isArabicText ? 'ar_JO-kareem-medium' : (voiceIdRef.current || 'en_US-ryan-medium'),
          });
        }
        return;
      }

      const provider = llmProviderRef.current;
      const rawKey   = llmApiKeyRef.current;
      const apiKey   = ((rawKey && rawKey.trim()) ? rawKey : DEFAULT_OPENROUTER_KEY).replace(/[^\x20-\x7E]/g, '').trim();
      const model    = llmModelRef.current;

      if (provider === 'openrouter' && !interventionNote && !fatigueNote) {
        let lastError = null;
        try {
          const res = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': window.location.origin || 'http://localhost:5173',
              'X-Title': 'Study Hub - Executive Chief of Staff',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model || 'google/gemma-4-31b-it:free',
              messages: [{ role: 'user', content: userPromptText }],
              max_tokens: 200,
              temperature: 0.85,
            }),
            signal: AbortSignal.timeout(10000),
          });
          const data = await res.json();
          if (res.ok && data.choices?.[0]?.message?.content) {
            answer = stripThinkTags(data.choices[0].message.content.trim());
          } else {
            lastError = data?.error?.message || `HTTP ${res.status}`;
          }
        } catch (err) {
          lastError = err.message;
        }

        if (lastError) {
          answer = generateOfflineEventResponse(eventType, cfg.name, appState, isArRef.current);
        }
      }

      setDialogueText(answer);

      if (eventType === 'POMODORO_FINISHED') {
        const sessionMins = completedMins || 25;
        let xpAmount = XP_REWARDS.STUDY_SESSION_25MIN;
        if (sessionMins <= 5) xpAmount = XP_REWARDS.STUDY_SESSION_5MIN;
        else if (sessionMins <= 15) xpAmount = XP_REWARDS.STUDY_SESSION_15MIN;
        
        awardXP(xpAmount, `pomodoro_${sessionMins}min`, activeCharRef.current);
        setShowXpNotification({ amount: xpAmount, reason: `${sessionMins}m Focus Session` });
        setTimeout(() => setShowXpNotification(null), 3000);
      } else if (eventType === 'TASK_COMPLETED') {
        awardXP(XP_REWARDS.TASK_COMPLETED, 'task_completion', activeCharRef.current);
        setShowXpNotification({ amount: XP_REWARDS.TASK_COMPLETED, reason: 'Task Completed' });
        setTimeout(() => setShowXpNotification(null), 3000);
      } else if (eventType === 'FLASHCARD_COMPLETED') {
        awardXP(XP_REWARDS.FLASHCARD_REVIEW, 'flashcard_review', activeCharRef.current);
        setShowXpNotification({ amount: XP_REWARDS.FLASHCARD_REVIEW, reason: 'Flashcard Mastered' });
        setTimeout(() => setShowXpNotification(null), 3000);
      }

      if (!isMutedRef.current && speakResponseRef.current) {
        const isArabicText = isArRef.current || ARABIC_RE.test(answer);
        speakResponseRef.current(answer, {
          lang: isArabicText ? 'ar-SA' : 'en-US',
          voiceId: isArabicText ? 'ar_JO-kareem-medium' : (voiceIdRef.current || 'en_US-ryan-medium'),
        });
      }
    };

    window.addEventListener('mascot-event', handleMascotEvent);
    const handleLegacyPomo = (e) => {
      const d = e?.detail || {};
      window.dispatchEvent(new CustomEvent('mascot-event', {
        detail: { eventType: 'POMODORO_FINISHED', ...d },
      }));
    };
    window.addEventListener('pomodoro-complete', handleLegacyPomo);

    return () => {
      window.removeEventListener('mascot-event', handleMascotEvent);
      window.removeEventListener('pomodoro-complete', handleLegacyPomo);
    };
  }, []);

  // Idle detector
  useEffect(() => {
    const IDLE_MS = 5 * 60 * 1000;
    let idleTimer = null;
    let lastReset = 0;

    const armTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('mascot-event', {
          detail: { eventType: 'IDLE_ALERT', userMessage: '' },
        }));
      }, IDLE_MS);
    };

    const resetIdle = () => {
      const now = Date.now();
      if (now - lastReset < 10000) return;
      lastReset = now;
      armTimer();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }));
    armTimer();
    return () => {
      clearTimeout(idleTimer);
      events.forEach(ev => window.removeEventListener(ev, resetIdle));
    };
  }, []);

  // Periodic motivational auto-talk
  useEffect(() => {
    const MOTIVATION_INTERVAL = 12 * 60 * 1000;
    let motivationTimer = null;

    const triggerMotivation = () => {
      const char = activeCharRef.current;
      const isArabic = isArRef.current;
      const messages = SELF_MOTIVATION_MESSAGES[char];
      
      if (messages) {
        const langMessages = messages[isArabic ? 'ar' : 'en'];
        const randomMessage = langMessages[Math.floor(Math.random() * langMessages.length)];
        
        if (!isMutedRef.current && ttsStatusRef.current === 'idle') {
          setDialogueText(randomMessage);
          if (speakResponseRef.current) {
            speakResponseRef.current(randomMessage, {
              lang: isArabic ? 'ar-SA' : 'en-US',
              voiceId: isArabic ? 'ar_JO-kareem-medium' : (voiceIdRef.current || 'en_US-ryan-medium'),
            });
          }
        }
      }
      motivationTimer = setTimeout(triggerMotivation, MOTIVATION_INTERVAL);
    };

    motivationTimer = setTimeout(triggerMotivation, 8 * 60 * 1000);
    return () => clearTimeout(motivationTimer);
  }, []);

  const handleSaveSettings = () => {
    const safeKey = (llmApiKey || '').replace(/[^\x20-\x7E]/g, '').trim();
    localStorage.setItem('robin_ui_lang', uiLang);
    localStorage.setItem('mascot_tts_engine', ttsEngine);
    localStorage.setItem('mascot_voice_id', voiceId);
    localStorage.setItem('robin_llm_provider', llmProvider);
    localStorage.setItem('robin_llm_api_key', safeKey);
    localStorage.setItem('robin_llm_model', llmModel);
    localStorage.setItem('mascot_aura_color', auraColor);
    setIsSettingsOpen(false);
    setDialogueText(uiLang === 'ar-SA' ? (charConfig.greetingAr || charConfig.greetingEn) : charConfig.greetingEn);
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('.mascot-bubble')) return;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos.x,
      posY: pos.y,
      hasMoved: false,
    };
    if (isPinned) {
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const dragRafRef = useRef(null);

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragStartRef.current.hasMoved = true;

    if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
    dragRafRef.current = requestAnimationFrame(() => {
      setPos({
        x: Math.max(10, Math.min(window.innerWidth - 130, dragStartRef.current.posX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 140, dragStartRef.current.posY + dy)),
      });
    });
  };

  const handlePointerUp = (e) => {
    if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
    if (isDragging) setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore pointer release error
    }

    if (dragStartRef.current.hasMoved) return;

    const now = Date.now();
    const delta = now - lastTapRef.current;
    if (delta < 350 && delta > 0) {
      setIsPinned(prev => {
        const next = !prev;
        localStorage.setItem('robin_mascot_pinned', String(next));
        return next;
      });
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
    setIsBubbleOpen(prev => !prev);
  };

  const quickChips = isAr
    ? ['مصفوفة المهام', 'استرجاع نشط', 'فحص التركيز', 'تقرير الجلسة', 'حفّزني']
    : ['Task Matrix', 'Active Recall', 'Cognitive Check', 'Session Debrief', 'Motivate Me'];

  const engineLabel = ttsEngine === 'piper'
    ? 'Piper TTS'
    : 'Browser Speech';

  const isServerReady = ttsEngine === 'browser' ? true : serverHealth.piper === true;
  const serverTooltip = ttsEngine === 'browser'
    ? 'Browser SpeechSynthesis Ready'
    : (serverHealth.piper ? 'Piper TTS server (:8100) is online' : 'Piper offline — start start-tts.bat (fallback active)');

  return (
    <>
      {/* XP Notification */}
      {showXpNotification && (
        <div className="xp-notification">
          <div className="xp-icon"><FaStar /></div>
          <div className="xp-text">
            <div className="xp-amount">+{showXpNotification.amount} XP</div>
            <div className="xp-reason">{showXpNotification.reason.replace(/_/g, ' ')}</div>
          </div>
        </div>
      )}

      {/* Click-to-Start overlay */}
      {showClickOverlay && (
        <div
          className="click-to-start-overlay"
          onClick={handleClickToStart}
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', userSelect: 'none',
            backdropFilter: 'blur(20px)',
          }}
        >
          <img
            src={charConfig?.imageUrl || '/avatars/chrollo.jpg'}
            alt={charConfig?.name || 'Mascot'}
            onError={(e) => { e.target.src = '/avatars/chrollo.jpg'; }}
            className="click-to-start-avatar"
            style={{
              width: 120, height: 120, borderRadius: '50%',
              objectFit: 'cover',
              border: `3px solid ${auraColor}`,
              animation: 'glow-pulse 2s ease-in-out infinite',
              marginBottom: 24,
            }}
          />
          <div className="click-to-start-text" style={{
            color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 600,
            textAlign: 'center', marginBottom: 8,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
            fontFamily: 'Inter, sans-serif',
          }}>
            {charConfig?.name || 'Chrollo Lucilfer'}
          </div>
          <div className="click-to-start-subtitle" style={{
            color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center',
            maxWidth: '400px', lineHeight: 1.5, letterSpacing: '0.5px',
            textTransform: 'uppercase', fontWeight: 500,
          }}>
            Click anywhere to begin your study journey
          </div>
        </div>
      )}

      {/* Pinned dock widget in sidebar */}
      {isPinned && (() => {
        const dockEl = document.getElementById('sidebar-mascot-dock');
        if (!dockEl) return null;
        return createPortal(
          <MascotDockWidget
            charConfig={charConfig}
            visualStatus={visualStatus}
            handlePointerDown={handlePointerDown}
            handlePointerUp={handlePointerUp}
            isAr={isAr}
          />,
          dockEl
        );
      })()}

      {/* Floating root */}
      {!isPinned && (
        <div
          className="mascot-floating-root"
          style={{
            left: pos.x,
            top: pos.y,
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            '--mascot-aura': auraColor,
          }}
        >
          {isBubbleOpen && (
            <div
              className="mascot-bubble mascot-fade-in"
              dir={isAr ? 'rtl' : 'ltr'}
              onPointerDown={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div className="mascot-header-info">
                  <div className="mascot-title">
                    <FaCommentDots style={{ marginInlineEnd: 6 }} /> {charConfig.name} <span style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: 400 }}>· {charConfig.series}</span>
                  </div>
                  <div className="mascot-engine-badge">
                    <span
                      className="mascot-tts-light"
                      style={{
                        background:
                          ttsStatus === 'green'      ? '#22c55e'
                          : ttsStatus === 'processing' ? '#eab308'
                          : isServerReady              ? '#38bdf8'
                          : '#64748b',
                      }}
                      title={
                        ttsStatus === 'processing' ? 'Synthesizing voice…'
                        : ttsStatus === 'green'    ? 'Speaking'
                        : 'Ready'
                      }
                    />
                    <FaServer /> {engineLabel} · {isServerReady ? 'Ready' : 'Offline'}
                    {isOfflineMode && (
                      <span style={{ 
                        marginInlineStart: 6, 
                        padding: '2px 6px', 
                        background: '#f59e0b', 
                        borderRadius: 4, 
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: '#000'
                      }}>
                        {isAr ? <><FaBan style={{ marginInlineEnd: 4 }} /> وضع غير متصل</> : <><FaBan style={{ marginInlineEnd: 4 }} /> OFFLINE MODE</>}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="mascot-icon-btn" title={serverTooltip} aria-label="Voice engine status">
                    <FaServer color={isServerReady ? '#10b981' : '#f59e0b'} />
                  </button>
                  <button
                    className={`mascot-icon-btn language-toggle-btn ${isAr ? 'is-ar' : 'is-en'}`}
                    onClick={() => handleLangChange(isAr ? 'en-US' : 'ar-SA')}
                    title={isAr ? 'العربية (اضغط للتبديل إلى الإنجليزية)' : 'English (Click to switch to Arabic)'}
                    aria-label={isAr ? 'Switch to English' : 'Switch to Arabic'}
                    style={{ fontWeight: 700, fontSize: '0.75rem', minWidth: '32px' }}
                  >
                    {isAr ? 'AR' : 'EN'}
                  </button>
                  <button
                    className="mascot-icon-btn"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    title={isAr ? 'الإعدادات' : 'Settings'}
                    aria-label={isAr ? 'الإعدادات' : 'Settings'}
                  >
                    {isSettingsOpen ? <FaBookOpen /> : <FaCog />}
                  </button>
                  <button
                    className="mascot-icon-btn"
                    onClick={() => {
                      setIsMuted(v => !v);
                      if (!isMuted) {
                        stopVoice();
                        if (ttsAudioRef.current) {
                          try {
                            ttsAudioRef.current.pause();
                            ttsAudioRef.current.src = '';
                            ttsAudioRef.current = null;
                          } catch {}
                        }
                      }
                      setTtsStatus('idle');
                    }}
                    title={isMuted ? (isAr ? 'إلغاء كتم الصوت' : 'Unmute') : (isAr ? 'كتم الصوت' : 'Mute')}
                    aria-label={isMuted ? (isAr ? 'إلغاء كتم الصوت' : 'Unmute') : (isAr ? 'كتم الصوت' : 'Mute')}
                  >
                    {isMuted ? <FaVolumeMute color="#ef4444" /> : <FaVolumeUp />}
                  </button>
                  <button
                    className="mascot-icon-btn"
                    onClick={() => setIsBubbleOpen(false)}
                    title={isAr ? 'إغلاق' : 'Close'}
                    aria-label={isAr ? 'إغلاق' : 'Close'}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {isSettingsOpen ? (
                <MascotSettings
                  isAr={isAr}
                  activeChar={activeChar}
                  handleCharChange={handleCharChange}
                  unlockedCharacters={unlockedCharacters}
                  lockedCharacters={lockedCharacters}
                  handleOpenStore={handleOpenStore}
                  uiLang={uiLang}
                  handleLangChange={handleLangChange}
                  ttsEngine={ttsEngine}
                  setTtsEngine={setTtsEngine}
                  voiceId={voiceId}
                  setVoiceId={setVoiceId}
                  piperVoices={piperVoices}
                  handleSaveSettings={handleSaveSettings}
                />
              ) : (
                <MascotBubble
                  isAr={isAr}
                  auraColor={auraColor}
                  chatStatus={chatStatus}
                  visualStatus={visualStatus}
                  liveTranscript={liveTranscript}
                  dialogueText={dialogueText}
                  isVoiceLoading={isVoiceLoading}
                  isVoiceSpeaking={isVoiceSpeaking}
                  runVoice={runVoice}
                  stopVoice={() => {
                    stopVoice();
                    if (ttsAudioRef.current) {
                      try {
                        ttsAudioRef.current.pause();
                        ttsAudioRef.current.src = '';
                        ttsAudioRef.current = null;
                      } catch {}
                    }
                    setChatStatus('idle');
                    setTtsStatus('idle');
                  }}
                  isMuted={isMuted}
                  inputText={inputText}
                  setInputText={setInputText}
                  handleUserSubmit={handleUserSubmit}
                  ttsStatus={ttsStatus}
                  toggleListening={toggleListening}
                  isOfflineMode={isOfflineMode}
                  quickChips={quickChips}
                />
              )}
            </div>
          )}

          <MascotAvatar
            charConfig={charConfig}
            visualStatus={visualStatus}
            handlePointerDown={handlePointerDown}
            handlePointerMove={handlePointerMove}
            handlePointerUp={handlePointerUp}
          />
        </div>
      )}

      {/* Pinned sidebar bubble */}
      {isPinned && isBubbleOpen && (
        <div
          className="mascot-bubble mascot-bubble-from-sidebar mascot-fade-in"
          dir={isAr ? 'rtl' : 'ltr'}
          onPointerDown={e => e.stopPropagation()}
          style={{ zIndex: 99999, '--mascot-aura': auraColor }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div className="mascot-title"><FaCommentDots style={{ marginInlineEnd: 6 }} />{charConfig.name}</div>
            <button className="mascot-icon-btn" onClick={() => setIsBubbleOpen(false)} title="Close" aria-label="Close chat"><FaTimes /></button>
          </div>
          <div className="mascot-dialogue">
            {chatStatus === 'thinking' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: auraColor }}>
                Thinking...
              </span>
            ) : (
              <div>{dialogueText}</div>
            )}
          </div>
          <div className="mascot-input-row">
            <input
              className="mascot-input"
              type="text"
              placeholder={isAr ? 'اكتب رسالتك...' : 'Ask me anything...'}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUserSubmit(inputText); } }}
              dir={isAr ? 'rtl' : 'ltr'}
            />
            <button
              className="mascot-icon-btn"
              onClick={() => handleUserSubmit(inputText)}
              disabled={!inputText.trim() || chatStatus !== 'idle'}
              title={isAr ? 'إرسال' : 'Send'}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default FloatingMascot;
