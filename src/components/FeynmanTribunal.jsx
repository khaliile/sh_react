import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Scale,
  GraduationCap,
  Sparkles,
  Wrench,
  Volume2,
  VolumeX,
  RotateCcw,
  Coins,
  Award,
  Zap,
  Send,
  Loader2,
  ShieldCheck,
  BookOpen,
  Dices,
  Search,
  X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { synthesizePolly, revokePollyUrl, clearAllPollyUrls } from '../utils/pollyTts';
import {
  FEYNMAN_TOPICS,
  TOPIC_CATEGORIES,
  getRandomFeynmanTopic
} from '../data/feynmanTribunalTopics';
import { getRandomJudgeCritique } from '../data/feynmanJudgeReplies';
import { evaluateTribunalWithAI } from '../services/feynmanJudgeService';
import './FeynmanTribunal.css';

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO CLEANUP UTILITY
// Properly disposes an HTML5 Audio object to prevent Electron memory leaks
// ═══════════════════════════════════════════════════════════════════════════
function destroyAudio(audioObj) {
  if (!audioObj) return;
  try {
    audioObj.pause();
    audioObj.ontimeupdate = null;
    audioObj.onended = null;
    audioObj.onerror = null;
    // Revoke Polly Blob URL to free memory before clearing src
    if (audioObj.src && audioObj.src.startsWith('blob:')) {
      revokePollyUrl(audioObj.src);
    }
    audioObj.src = '';
    audioObj.load(); // Releases the media resource in Chromium/Electron
  } catch {
    /* ignore cleanup errors */
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSET PATH RESOLVER (Electron & Web compatible)
// ═══════════════════════════════════════════════════════════════════════════
function getCharterPath(fileName) {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}charter/${fileName}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. TRIBUNAL JUDGES CONFIGURATION (105+ Dynamic Responses)
// ═══════════════════════════════════════════════════════════════════════════

const TRIBUNAL_JUDGES = [
  {
    id: 'skeptic_professor',
    name: 'The Skeptic Professor',
    nameAr: 'البروفيسور المتشكك',
    archetype: 'Logic Inquisitor',
    archetypeAr: 'محقق المنطق الصارم',
    image: getCharterPath('skeptic.png'),
    imageAr: getCharterPath('البروفيسور المتشكك.png'),
    imagePosition: 'top center',
    IconComponent: GraduationCap,
    coreMotto: 'Finds logic flaws & unproven assumptions',
    coreMottoAr: 'يكشف الثغرات المنطقية والافتراضات غير المبررة',
    colorName: 'violet',
    // EN: Piper Joe (deep/authoritative) | AR: Polly Zayd (Male Neural Gulf Arabic)
    voiceAliasEn: 'judge_skeptic_en',
    pollyVoiceAr: 'Zayd',
    defaultFeedback: (concept, isAr) => getRandomJudgeCritique('skeptic_professor', concept, isAr),
  },
  {
    id: 'curious_child',
    name: 'The Curious Child',
    nameAr: 'الطفل الفضولي',
    archetype: 'Jargon Crusher',
    archetypeAr: 'محطم المصطلحات المعقدة',
    image: getCharterPath('child.png'),
    imageAr: getCharterPath('لطفل الفضولي.png'),
    imagePosition: '50% 20%',
    IconComponent: Sparkles,
    coreMotto: 'Hates jargon & demands simple analogies',
    coreMottoAr: 'يكره المصطلحات المعقدة ويطلب تشبيهات ملموسة',
    colorName: 'amber',
    // EN: Piper Ryan (friendly/natural) | AR: Polly Hala (Female Neural Gulf Arabic)
    voiceAliasEn: 'judge_child_en',
    pollyVoiceAr: 'Hala',
    defaultFeedback: (concept, isAr) => getRandomJudgeCritique('curious_child', concept, isAr),
  },
  {
    id: 'pragmatic_engineer',
    name: 'The Pragmatic Engineer',
    nameAr: 'المهندس العملي',
    archetype: 'System Realist',
    archetypeAr: 'المطبق الواقعي للأنظمة',
    image: getCharterPath('engineer.png'),
    imageAr: getCharterPath('لمهندس العملي.png'),
    imagePosition: '50% 25%',
    IconComponent: Wrench,
    coreMotto: 'Focuses on real-world execution & edge cases',
    coreMottoAr: 'يركز على التطبيق العملي وسيناريوهات الفشل الواقعية',
    colorName: 'emerald',
    // EN: Piper Alba (Scottish GB — authoritative) | AR: Polly Zeina (Female Standard MSA)
    voiceAliasEn: 'judge_engineer_en',
    pollyVoiceAr: 'Zeina',
    defaultFeedback: (concept, isAr) => getRandomJudgeCritique('pragmatic_engineer', concept, isAr),
  },
];

// Featured topics displayed as quick chips in the tribunal header (only 3 core concepts)
const FEATURED_TOPIC_IDS = ['recursion', 'superposition', 'feynman_technique'];
const FEATURED_TOPICS = FEATURED_TOPIC_IDS.map(id => FEYNMAN_TOPICS.find(t => t.id === id) || FEYNMAN_TOPICS[0]);

// ═══════════════════════════════════════════════════════════════════════════
// TTS INTEGRATION — Local Piper server at port 8100
// ═══════════════════════════════════════════════════════════════════════════

/** Base URL for the local Piper TTS HTTP server */
const TTS_BASE_URL = 'http://127.0.0.1:8100';

/**
 * Build a Piper TTS GET URL for the given text and voice alias.
 * The server accepts: GET /tts?text=...&voice=<alias>
 * Returns null if audio is disabled (caller falls back to text-based timer).
 *
 * @param {string} text       - Text to synthesize
 * @param {string} voiceAlias - Piper alias (e.g. 'judge_skeptic_en')
 * @returns {string} Full TTS URL
 */
function buildTtsUrl(text, voiceAlias) {
  const params = new URLSearchParams({ text, voice: voiceAlias });
  return `${TTS_BASE_URL}/tts?${params.toString()}`;
}



function AudioVisualizerBars() {
  return (
    <div className="ft-waveform" aria-hidden="true">
      <span className="ft-waveform-bar" />
      <span className="ft-waveform-bar" />
      <span className="ft-waveform-bar" />
      <span className="ft-waveform-bar" />
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// 3. MAIN FEYNMAN TRIBUNAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function FeynmanTribunal({
  initialConcept = '',
  onRewardClaimed = null,
  className = '',
}) {
  // Context hooks
  const { lang, isArabic } = useLanguage();
  const isAr = lang === 'ar' || isArabic;
  const { addXpAndCoins } = useRpgStorage();

  // ── Component State ───────────────────────────────────────────────────────
  const [concept, setConcept] = useState(initialConcept || '');

  const [explanation, setExplanation] = useState('');

  // Status state machine: 'idle' | 'deliberating' | 'speaking' | 'verdict'
  const [status, setStatus] = useState('idle');

  // Active speaker: null | judge.id string
  const [activeSpeaker, setActiveSpeaker] = useState(null);

  // Audio controls
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0–100

  // Generated critiques for the 3 judges
  const [critiques, setCritiques] = useState({});

  // RPG Rewards state
  const [rewardsAwarded, setRewardsAwarded] = useState(false);
  const [scores, setScores] = useState({ logic: 92, simplicity: 88, practicality: 95 });
  const [aiProvider, setAiProvider] = useState(null);

  // 100+ Topics Library & Explorer state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [justRandomized, setJustRandomized] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  // Single live HTML5 Audio instance (Electron-compatible)
  const audioRef = useRef(null);
  // Fallback timeout ID when TTS/audio is unavailable
  const fallbackTimerRef = useRef(null);
  // Deliberation phase timer (fires before karaoke starts)
  const deliberationTimerRef = useRef(null);
  // Progress bar interval
  const progressIntervalRef = useRef(null);
  // Judge queue for sequential playback (array of judge IDs remaining)
  const judgeQueueRef = useRef([]);
  const sessionTokenRef = useRef(0);
  // Critiques snapshot stable ref for use inside async audio callbacks
  const critiquesRef = useRef({});
  // Stable ref to current language flag — safe to read inside async audio callbacks
  const isArRef = useRef(isAr);
  useEffect(() => { isArRef.current = isAr; }, [isAr]);

  // ── Memory Cleanup ────────────────────────────────────────────────────────
  /**
   * Stops all active playback and clears every pending timer/interval.
   * Safe to call at any time: reset, unmount, or tab change.
   */
  const stopAll = useCallback(() => {
    sessionTokenRef.current += 1;
    destroyAudio(audioRef.current);
    audioRef.current = null;

    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (deliberationTimerRef.current) {
      clearTimeout(deliberationTimerRef.current);
      deliberationTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    judgeQueueRef.current = [];
    clearAllPollyUrls();
  }, []);

  useEffect(() => {
    return () => stopAll();
  }, [stopAll]);

  // ── Grant RPG Rewards (+50 XP, +20 Coins) ────────────────────────────────
  const grantRPGRewards = useCallback(() => {
    if (rewardsAwarded) return;
    setRewardsAwarded(true);

    const xpAmount = 50;
    const coinsAmount = 20;

    if (typeof addXpAndCoins === 'function') {
      try {
        addXpAndCoins(xpAmount, coinsAmount, isAr ? 'اجتياز محكمة فاينمان' : 'Feynman Tribunal Mastery');
      } catch (e) {
        console.warn('[FeynmanTribunal] Hook addXpAndCoins failed:', e);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('rpg-xp-gained', {
            detail: {
              xpAwarded: xpAmount,
              coinsAwarded: coinsAmount,
              reason: 'Feynman Tribunal Approved',
              characterId: 'feynman_tribunal',
            },
          })
        );
      } catch {
        /* ignore */
      }
    }

    if (onRewardClaimed) {
      onRewardClaimed({ xp: xpAmount, coins: coinsAmount });
    }
  }, [rewardsAwarded, addXpAndCoins, isAr, onRewardClaimed]);

  // ── Verdict Transition ────────────────────────────────────────────────────
  const finishSession = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setPlaybackProgress(100);
    setActiveSpeaker(null);
    setStatus('verdict');
    grantRPGRewards();
  }, [grantRPGRewards]);

  // ── Helper: Resolve Audio URL for Judge ──────────────────────────────────
  const resolveJudgeAudioUrl = useCallback(async (judge, text, isArabic) => {
    if (!audioEnabled || !judge) return null;
    if (isArabic) {
      if (!judge.pollyVoiceAr) return null;
      try {
        // Zeina (pragmatic_engineer) reads faster with SSML prosody rate
        const isZeina = judge.pollyVoiceAr === 'Zeina';
        const ssmlText = isZeina
          ? `<speak><prosody rate="125%">${text}</prosody></speak>`
          : text;
        return await synthesizePolly(ssmlText, judge.pollyVoiceAr, { ssml: isZeina });
      } catch (err) {
        console.warn(`[FeynmanTribunal] AWS Polly (${judge.pollyVoiceAr}) error:`, err);
        return null;
      }
    } else {
      if (!judge.voiceAliasEn) return null;
      return buildTtsUrl(text, judge.voiceAliasEn);
    }
  }, [audioEnabled]);

  // ── Core: Play one judge slot (HTML5 Audio + fallback) ────────────────────
  /**
   * Activates a judge's highlight and plays their TTS audio.
   * Transitions to the next judge ONLY when audio fires `onended`.
   * Falls back to a text-length timer if audio is unavailable or fails.
   *
   * @param {string} judgeId       - The active judge ID
   * @param {string} critiqueText  - Feedback text (for fallback duration)
   */
  const playJudgeSlot = useCallback(async (judgeId, critiqueText) => {
    // Tear down any previous audio
    destroyAudio(audioRef.current);
    audioRef.current = null;
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setActiveSpeaker(judgeId);
    const thisSession = sessionTokenRef.current;
    const totalJudges = TRIBUNAL_JUDGES.length;
    const judgeIndex = Math.max(0, TRIBUNAL_JUDGES.findIndex(j => j.id === judgeId));

    // Anchor progress bar at start of this judge's turn (0% for judge 1, 33% for judge 2, 67% for judge 3)
    const basePct = Math.round((judgeIndex / totalJudges) * 100);
    setPlaybackProgress(basePct);

    // Called when the current judge's slot ends (audio ended or fallback expired)
    const handleNextJudge = () => {
      if (sessionTokenRef.current !== thisSession) return;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      destroyAudio(audioRef.current);
      audioRef.current = null;
      fallbackTimerRef.current = null;

      // Update progress cleanly on slot completion
      const completedPct = Math.min(100, Math.round(((judgeIndex + 1) / totalJudges) * 100));
      setPlaybackProgress(completedPct);

      const remaining = judgeQueueRef.current;
      if (remaining.length > 0) {
        const nextId = remaining.shift();
        const nextText = critiquesRef.current[nextId] || '';
        playJudgeSlot(nextId, nextText);
      } else {
        finishSession();
      }
    };

    const judge = TRIBUNAL_JUDGES.find(j => j.id === judgeId);
    const audioUrl = await resolveJudgeAudioUrl(judge, critiqueText, isArRef.current);

    // If session cancelled/reset while awaiting audio synthesis, stop immediately
    if (sessionTokenRef.current !== thisSession) return;

    if (audioEnabled && audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Event-driven transition: move to next judge when audio naturally ends
        audio.addEventListener('ended', handleNextJudge, { once: true });

        // Physical audio time synchronization: progress only moves as the audio physically plays
        audio.addEventListener('timeupdate', () => {
          if (sessionTokenRef.current !== thisSession) return;
          const dur = audio.duration;
          if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
            const fraction = Math.min(1, Math.max(0, audio.currentTime / dur));
            const currentPct = Math.min(99, Math.round(((judgeIndex + fraction) / totalJudges) * 100));
            setPlaybackProgress(currentPct);
          }
        });

        audio.onerror = () => {
          console.warn('[FeynmanTribunal] Audio error for judge:', judgeId);
          destroyAudio(audioRef.current);
          audioRef.current = null;
          const ms = Math.max(critiqueText.split(/\s+/).length * 400, 2000);
          const slotStart = Date.now();
          progressIntervalRef.current = setInterval(() => {
            if (sessionTokenRef.current !== thisSession) return;
            const elapsed = Date.now() - slotStart;
            const fraction = Math.min(1, elapsed / ms);
            const currentPct = Math.min(99, Math.round(((judgeIndex + fraction) / totalJudges) * 100));
            setPlaybackProgress(currentPct);
          }, 100);
          fallbackTimerRef.current = setTimeout(handleNextJudge, ms);
        };

        audio.play().catch((err) => {
          console.warn('[FeynmanTribunal] audio.play() rejected:', err);
          destroyAudio(audioRef.current);
          audioRef.current = null;
          const ms = Math.max(critiqueText.split(/\s+/).length * 400, 2000);
          const slotStart = Date.now();
          progressIntervalRef.current = setInterval(() => {
            if (sessionTokenRef.current !== thisSession) return;
            const elapsed = Date.now() - slotStart;
            const fraction = Math.min(1, elapsed / ms);
            const currentPct = Math.min(99, Math.round(((judgeIndex + fraction) / totalJudges) * 100));
            setPlaybackProgress(currentPct);
          }, 100);
          fallbackTimerRef.current = setTimeout(handleNextJudge, ms);
        });
      } catch (err) {
        console.warn('[FeynmanTribunal] Failed to construct Audio:', err);
        const ms = Math.max(critiqueText.split(/\s+/).length * 400, 2000);
        const slotStart = Date.now();
        progressIntervalRef.current = setInterval(() => {
          if (sessionTokenRef.current !== thisSession) return;
          const elapsed = Date.now() - slotStart;
          const fraction = Math.min(1, elapsed / ms);
          const currentPct = Math.min(99, Math.round(((judgeIndex + fraction) / totalJudges) * 100));
          setPlaybackProgress(currentPct);
        }, 100);
        fallbackTimerRef.current = setTimeout(handleNextJudge, ms);
      }
    } else {
      // Text-based fallback: ~400ms per word, minimum 2 seconds
      const ms = Math.max(critiqueText.split(/\s+/).length * 400, 2000);
      const slotStart = Date.now();
      progressIntervalRef.current = setInterval(() => {
        if (sessionTokenRef.current !== thisSession) return;
        const elapsed = Date.now() - slotStart;
        const fraction = Math.min(1, elapsed / ms);
        const currentPct = Math.min(99, Math.round(((judgeIndex + fraction) / totalJudges) * 100));
        setPlaybackProgress(currentPct);
      }, 100);
      fallbackTimerRef.current = setTimeout(handleNextJudge, ms);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEnabled, finishSession, resolveJudgeAudioUrl]);

  // ── Sequential Karaoke Playback (HTML5 Audio, event-driven) ──────────────
  const startKaraokePlayback = useCallback((judgeCritiques) => {
    setStatus('speaking');
    critiquesRef.current = judgeCritiques;
    setPlaybackProgress(0);

    const judgeIds = TRIBUNAL_JUDGES.map(j => j.id);

    // Load the queue: first judge plays immediately, rest are queued
    const [firstId, ...rest] = judgeIds;
    judgeQueueRef.current = rest;

    const firstText = judgeCritiques[firstId] || '';
    playJudgeSlot(firstId, firstText);
  }, [playJudgeSlot]);

  // ── Submission & Deliberation Flow (Dynamic Live AI + Fallback) ─────────
  const handleStartTribunal = async () => {
    if (!explanation.trim() || status === 'deliberating' || status === 'speaking') return;

    stopAll();
    const thisSession = sessionTokenRef.current;
    setStatus('deliberating');
    setActiveSpeaker(null);
    setRewardsAwarded(false);
    setPlaybackProgress(0);

    // Call dynamic AI evaluation across the 3 judges
    const evalResult = await evaluateTribunalWithAI({
      concept: concept || (isArRef.current ? 'المفهوم المختار' : 'The Chosen Concept'),
      explanation,
      isAr: isArRef.current,
    });

    // Abort if session was reset or cancelled while waiting for AI
    if (sessionTokenRef.current !== thisSession) return;

    const generated = {
      skeptic_professor: evalResult.skeptic,
      curious_child: evalResult.child,
      pragmatic_engineer: evalResult.engineer,
    };
    setCritiques(generated);
    setScores(evalResult.scores);
    setAiProvider(evalResult.isAI ? evalResult.provider : null);

    // Prefetch Polly audio concurrently during deliberation if Arabic + Audio enabled
    if (audioEnabled && isArRef.current) {
      TRIBUNAL_JUDGES.forEach(judge => {
        if (judge.pollyVoiceAr && generated[judge.id]) {
          const isZeina = judge.pollyVoiceAr === 'Zeina';
          const ssmlText = isZeina
            ? `<speak><prosody rate="125%">${generated[judge.id]}</prosody></speak>`
            : generated[judge.id];
          synthesizePolly(ssmlText, judge.pollyVoiceAr, { ssml: isZeina }).catch(err => {
            console.warn('[FeynmanTribunal] Polly prefetch error:', err);
          });
        }
      });
    }

    // Brief deliberation phase (1.2s) before sequential karaoke playback starts
    deliberationTimerRef.current = setTimeout(() => {
      deliberationTimerRef.current = null;
      if (sessionTokenRef.current !== thisSession) return;
      startKaraokePlayback(generated);
    }, 1200);
  };

  // Quick preset loader from library or featured list
  const handleApplyPreset = (preset) => {
    setConcept(isAr ? preset.ar : preset.en);
    setExplanation(isAr ? preset.sampleAr : preset.sampleEn);
    setIsLibraryOpen(false);
  };

  // Pick random concept from the 100+ topics library
  const handleRandomTopic = () => {
    const randomTopic = getRandomFeynmanTopic();
    if (randomTopic) {
      setConcept(isAr ? randomTopic.ar : randomTopic.en);
      setExplanation(isAr ? randomTopic.sampleAr : randomTopic.sampleEn);
      setJustRandomized(true);
      setTimeout(() => setJustRandomized(false), 700);
    }
  };

  // Filtered topics for the 100+ concepts grand library modal
  const filteredTopics = useMemo(() => {
    let list = FEYNMAN_TOPICS;
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter(t => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(t =>
        t.en.toLowerCase().includes(q) ||
        t.ar.toLowerCase().includes(q) ||
        t.sampleEn.toLowerCase().includes(q) ||
        t.sampleAr.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  // Reset entire tribunal — instantly stops audio (Electron-safe)
  const handleReset = () => {
    stopAll();
    setStatus('idle');
    setActiveSpeaker(null);
    setPlaybackProgress(0);
    setRewardsAwarded(false);
  };

  // Calculate composite score
  const overallAverageScore = useMemo(() => {
    return Math.round((scores.logic + scores.simplicity + scores.practicality) / 3);
  }, [scores]);

  // Active judge metadata for current playback slot
  const activeJudge = useMemo(() => {
    return TRIBUNAL_JUDGES.find(j => j.id === activeSpeaker);
  }, [activeSpeaker]);

  const activeJudgeIndex = useMemo(() => {
    const idx = TRIBUNAL_JUDGES.findIndex(j => j.id === activeSpeaker);
    return idx >= 0 ? idx : 0;
  }, [activeSpeaker]);

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`ft-tribunal-root ${className}`}
    >
      {/* ── Header Bar ── */}
      <header className="ft-header">
        <div className="ft-header-left">
          <div className="ft-title-icon-box">
            <Scale />
          </div>
          <div className="ft-title-wrap">
            <h2>
              <span>{isAr ? 'محكمة فاينمان المعرفية' : 'The Feynman Tribunal'}</span>
              <span className="ft-rank-badge">
                {isAr ? 'رتبة S' : 'S-Rank AI'}
              </span>
            </h2>
            <p className="ft-header-subtitle">
              {isAr
                ? 'اشرح المفهوم ببساطة شديدة ليحكم عليك القضاة الثلاثة بدقة'
                : 'Defend your understanding against 3 distinct cognitive archetypes'}
            </p>
          </div>
        </div>

        {/* Global Controls: Audio & Reset */}
        <div className="ft-header-actions">
          <button
            type="button"
            onClick={() => setAudioEnabled(prev => !prev)}
            title={audioEnabled ? (isAr ? 'كتم الصوت' : 'Mute Speech') : (isAr ? 'تفعيل الصوت' : 'Enable Speech')}
            className={`ft-audio-toggle-btn ${audioEnabled ? 'is-active' : ''}`}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{audioEnabled ? (isAr ? 'الصوت مفعّل' : 'Voice ON') : (isAr ? 'مكتوم' : 'Muted')}</span>
          </button>

          {status !== 'idle' && (
            <button
              type="button"
              onClick={handleReset}
              className="ft-reset-btn"
            >
              <RotateCcw size={14} />
              <span>{isAr ? 'إعادة المحاكمة' : 'Reset'}</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Preset Actions Bar & 100+ Topics ── */}
      {status === 'idle' && (
        <div className="ft-presets-row">
          <div className="ft-preset-actions-group">
            <button
              type="button"
              onClick={handleRandomTopic}
              className={`ft-random-btn ${justRandomized ? 'is-flashing' : ''}`}
              title={isAr ? 'اختر مفهوماً عشوائياً من الـ 100+' : 'Pick a random concept from 100+ topics'}
            >
              <Dices size={15} className={justRandomized ? 'animate-spin' : ''} />
              <span>{isAr ? 'فكرة عشوائية 🎲' : 'Random 🎲'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="ft-library-btn"
              title={isAr ? 'تصفح مكتبة الـ 100+ مفهوم الكاملة' : 'Browse full 100+ concept library'}
            >
              <BookOpen size={15} />
              <span>{isAr ? 'مكتبة المفاهيم (100+)' : '100+ Topics Library'}</span>
            </button>
          </div>

          <div className="ft-presets-divider" aria-hidden="true" />

          <div className="ft-preset-chips-list">
            {FEATURED_TOPICS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="ft-preset-chip"
              >
                {isAr ? preset.ar : preset.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Section (Concept & Explanation) ── */}
      <section className="ft-input-section">
        <div className="ft-form-group">
          <label className="ft-input-label">
            {isAr ? 'مفهوم المرافعة (الموضوع)' : 'Concept or Topic'}
          </label>
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            disabled={status === 'deliberating' || status === 'speaking'}
            placeholder={isAr ? 'اكتب المفهوم هنا (مثال: الثقوب السوداء، العودية...)' : 'e.g. Quantum Computing, TCP/IP, Transformer Attention...'}
            className="ft-text-input"
          />
        </div>

        <div className="ft-form-group">
          <div className="ft-label-row">
            <label className="ft-input-label">
              {isAr ? 'شرحك البسيط (مرافعتك)' : 'Your Plain-Language Explanation'}
            </label>
            <span className="ft-char-counter">
              {explanation.length} {isAr ? 'حرف' : 'chars'}
            </span>
          </div>

          <textarea
            rows={4}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            disabled={status === 'deliberating' || status === 'speaking'}
            placeholder={
              isAr
                ? 'اشرح المبدأ كما لو كنت تشرحه لشخص ذكي في الثانية عشرة من عمره. تجنب الاختباء خلف المصطلحات الإنجليزية الصعبة...'
                : 'Explain this concept from first principles. Pretend you are teaching someone bright without a technical degree. Strip away jargon...'
            }
            className="ft-textarea"
          />
        </div>

        {/* Submit Action Row */}
        <div className="ft-submit-row">
          <div className="ft-reward-hint">
            <ShieldCheck size={16} className="ft-reward-hint-icon" />
            <span>
              {isAr ? 'المكافأة: +50 نقطة خبرة XP و +20 عملة ذهبية' : 'Reward: +50 XP & +20 Gold Coins'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleStartTribunal}
            disabled={!explanation.trim() || status === 'deliberating' || status === 'speaking'}
            className="ft-submit-btn"
          >
            {status === 'deliberating' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{isAr ? 'القضاة يتداولون...' : 'Judges Deliberating...'}</span>
              </>
            ) : status === 'speaking' ? (
              <>
                <Volume2 size={16} className="animate-pulse" />
                <span>{isAr ? 'جلسة الاستماع نشطة...' : 'Deliberation in Session...'}</span>
              </>
            ) : (
              <>
                <Scale size={16} />
                <span>{isAr ? 'المثول أمام المحكمة' : 'Present to Tribunal'}</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* ── Deliberation Banner ── */}
      {status === 'deliberating' && (
        <div className="ft-deliberation-banner">
          <div className="ft-deliberation-info">
            <Loader2 size={20} className="animate-spin" style={{ color: '#818cf8' }} />
            <div>
              <div className="ft-deliberation-title">
                {isAr ? 'هيئة المحكمة تستعرض مرافعتك بالذكاء الاصطناعي...' : 'Tribunal AI is analyzing your reasoning...'}
              </div>
              <div className="ft-deliberation-sub">
                {isAr ? 'تقييم فوري من البروفيسور المتشكك، والطفل الفضولي، والمهندس العملي' : 'Live evaluation of logical rigor, jargon-free simplicity, and practical limits'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', fontFamily: 'monospace' }}>
            {isAr ? 'جاري التحليل...' : 'Evaluating...'}
          </span>
        </div>
      )}

      {/* ── Playback Progress Banner ── */}
      {status === 'speaking' && (
        <div className="ft-playback-banner">
          <div className="ft-playback-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={16} style={{ color: '#818cf8' }} className="animate-pulse" />
              {activeJudge?.image ? (
                <img
                  src={activeJudge.image}
                  alt=""
                  className="ft-active-judge-mini-avatar"
                  style={{ objectPosition: activeJudge.imagePosition || 'center' }}
                  onError={(e) => {
                    if (activeJudge.imageAr && !e.target.dataset.triedAr) {
                      e.target.dataset.triedAr = 'true';
                      e.target.src = activeJudge.imageAr;
                    } else {
                      e.target.style.display = 'none';
                    }
                  }}
                />
              ) : activeJudge ? (
                <activeJudge.IconComponent size={16} style={{ color: '#818cf8' }} />
              ) : null}
              <span>
                {isAr
                  ? `جلسة الاستماع (${activeJudgeIndex + 1} من 3): ${activeJudge ? activeJudge.nameAr : ''}`
                  : `Tribunal Hearing (${activeJudgeIndex + 1} of 3): ${activeJudge ? activeJudge.name : ''}`}
              </span>
            </span>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#818cf8' }}>
              {playbackProgress}%
            </span>
          </div>
          <div className="ft-progress-track">
            <div
              className="ft-progress-fill"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── 3 JUDGES CARDS GRID (Highlight / Karaoke Effect) ── */}
      <section className="ft-judges-section">
        <div className="ft-section-title">
          <span>{isAr ? 'أعضاء هيئة المحكمة الثلاثة' : 'The Three Tribunal Judges'}</span>
          {aiProvider && (
            <span className="ft-ai-live-badge">
              <Sparkles size={12} />
              <span>{aiProvider}</span>
            </span>
          )}
        </div>

        <div className="ft-judges-grid">
          {TRIBUNAL_JUDGES.map((judge) => {
            const isSpeaking = activeSpeaker === judge.id;
            const isOtherSpeaking = Boolean(activeSpeaker && activeSpeaker !== judge.id);
            const feedbackText = critiques[judge.id];

            return (
              <div
                key={judge.id}
                className={`ft-judge-card theme-${judge.colorName} ${
                  isSpeaking ? 'is-speaking' : isOtherSpeaking ? 'is-dimmed' : 'is-idle'
                }`}
              >
                {/* Active Speaking Indicator Badge */}
                {isSpeaking && (
                  <div className="ft-speaking-pill">
                    <span className="ft-speaking-dot" />
                    <span>{isAr ? 'يتحدث الآن' : 'SPEAKING'}</span>
                    <AudioVisualizerBars />
                  </div>
                )}

                {/* Judge Header */}
                <div>
                  <div className="ft-judge-header">
                    <div className="ft-judge-avatar">
                      {judge.image && (
                        <img
                          src={judge.image}
                          alt=""
                          className="ft-judge-avatar-img"
                          style={{ objectPosition: judge.imagePosition || 'center' }}
                          onError={(e) => {
                            if (judge.imageAr && !e.target.dataset.triedAr) {
                              e.target.dataset.triedAr = 'true';
                              e.target.src = judge.imageAr;
                            } else {
                              e.target.style.display = 'none';
                              const fallback = e.target.parentElement?.querySelector('.ft-judge-avatar-fallback');
                              if (fallback) fallback.style.display = 'flex';
                            }
                          }}
                        />
                      )}
                      <div
                        className="ft-judge-avatar-fallback"
                        style={{ display: judge.image ? 'none' : 'flex' }}
                      >
                        <judge.IconComponent size={24} className="ft-judge-icon" />
                      </div>
                    </div>
                    <div>
                      <h4 className="ft-judge-name">
                        {isAr ? judge.nameAr : judge.name}
                      </h4>
                      <div className="ft-judge-archetype">
                        {isAr ? judge.archetypeAr : judge.archetype}
                      </div>
                    </div>
                  </div>

                  {/* Persona Motto */}
                  <div className="ft-judge-motto">
                    {isAr ? judge.coreMottoAr : judge.coreMotto}
                  </div>

                  {/* Critique Bubble */}
                  <div className={`ft-critique-box ${isSpeaking ? 'is-speaking-box' : ''}`}>
                    {feedbackText ? (
                      <p>{feedbackText}</p>
                    ) : (
                      <p style={{ fontStyle: 'italic', opacity: 0.6 }}>
                        {isAr
                          ? 'بانتظار مرافعتك لإصدار الحكم...'
                          : 'Awaiting your explanation to deliberate...'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Score Breakdown pill (when in verdict status) */}
                {status === 'verdict' && (
                  <div className="ft-judge-score-row">
                    <span>
                      {judge.id === 'skeptic_professor'
                        ? (isAr ? 'دقة المنطق' : 'Logical Rigor')
                        : judge.id === 'curious_child'
                        ? (isAr ? 'وضوح التشبيه' : 'Analogy Clarity')
                        : (isAr ? 'الجدوى العملية' : 'Practical Utility')}
                    </span>
                    <span className="ft-score-num">
                      {judge.id === 'skeptic_professor'
                        ? scores.logic
                        : judge.id === 'curious_child'
                        ? scores.simplicity
                        : scores.practicality}
                      %
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── RPG REWARD & VERDICT BANNER ── */}
      {status === 'verdict' && (
        <section className="ft-verdict-banner">
          <div className="ft-verdict-left">
            <div className="ft-trophy-icon-box">
              <Award size={32} />
            </div>
            <div>
              <div className="ft-verdict-title-row">
                <h4>
                  {isAr ? 'تم اجتياز المحاكمة بنجاح!' : 'Feynman Tribunal: PASSED!'}
                </h4>
                <span className="ft-verdict-score-pill">
                  {overallAverageScore}%
                </span>
              </div>
              <p className="ft-verdict-desc">
                {isAr
                  ? 'وافقت هيئة القضاة على تبسيطك وحصلت على تقدير خبير التبسيط المعرفي.'
                  : 'The judges reached consensus. Your conceptual breakdown was certified!'}
              </p>
            </div>
          </div>

          <div className="ft-verdict-rewards">
            <div className="ft-badge-xp">
              <Zap size={16} />
              <span>+50 XP</span>
            </div>

            <div className="ft-badge-gold">
              <Coins size={16} />
              <span>+20 {isAr ? 'عملة' : 'Gold'}</span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="ft-try-again-btn"
            >
              <RotateCcw size={14} />
              <span>{isAr ? 'مفهوم جديد' : 'Try Another Concept'}</span>
            </button>
          </div>
        </section>
      )}

      {/* ── 100+ CONCEPTS GRAND LIBRARY MODAL ── */}
      {isLibraryOpen && (
        <div className="ft-modal-overlay" onClick={() => setIsLibraryOpen(false)}>
          <div
            className="ft-modal-content"
            onClick={(e) => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="ft-modal-header">
              <div className="ft-modal-title-group">
                <div className="ft-modal-icon-badge">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h3>
                    {isAr ? 'أرشيف مفاهيم محكمة فاينمان (100+ موضوع)' : 'The Feynman Concepts Archives (100+ Topics)'}
                  </h3>
                  <p>
                    {isAr
                      ? 'اختر أي مفهوم لتعبئة الشرح الفوري وتجربة نقد القضاة الثلاثة بنقرة واحدة'
                      : 'Select any foundational topic to instantly load a Feynman explanation for live tribunal defense'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="ft-modal-close-btn"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="ft-modal-controls">
              <div className="ft-modal-search-box">
                <Search size={16} className="ft-modal-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isAr
                      ? 'ابحث في أكثر من 100 مفهوم (مثل: كمومي، كريسبر، ذاكرة، خوارزمية...)'
                      : 'Search 100+ topics (e.g., Quantum, CRISPR, Memory, Recursion, DNS...)'
                  }
                  className="ft-modal-search-input"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="ft-modal-search-clear"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="ft-modal-category-pills">
                {TOPIC_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`ft-category-pill ${selectedCategory === cat.id ? 'is-active' : ''}`}
                  >
                    {isAr ? cat.ar : cat.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Topics Grid */}
            <div className="ft-modal-topics-grid">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => handleApplyPreset(topic)}
                    className="ft-topic-card"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="ft-topic-card-header">
                      <span className="ft-topic-cat-badge">
                        {topic.category.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="ft-topic-select-cta">
                        {isAr ? 'اختيار ←' : 'Select →'}
                      </span>
                    </div>
                    <h4 className="ft-topic-title">
                      {isAr ? topic.ar : topic.en}
                    </h4>
                    <p className="ft-topic-snippet">
                      {isAr ? topic.sampleAr : topic.sampleEn}
                    </p>
                  </div>
                ))
              ) : (
                <div className="ft-empty-search">
                  <p>{isAr ? 'لا توجد مواضيع مطابقة للبحث' : 'No topics match your search query'}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="ft-modal-footer">
              <span>
                {isAr
                  ? `المعروض: ${filteredTopics.length} من إجمالي ${FEYNMAN_TOPICS.length} مفهوم`
                  : `Showing ${filteredTopics.length} of ${FEYNMAN_TOPICS.length} total concepts`}
              </span>
              <button
                type="button"
                onClick={() => {
                  handleRandomTopic();
                  setIsLibraryOpen(false);
                }}
                className="ft-modal-random-action"
              >
                <Dices size={14} />
                <span>{isAr ? 'فكرة عشوائية وإغلاق 🎲' : 'Pick Random & Close 🎲'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
