import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FaTrophy,
  FaBolt,
  FaCoins,
  FaHeart,
  FaVolumeUp,
  FaVolumeMute,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaLightbulb,
  FaSpinner,
} from 'react-icons/fa';
import { GiCrossedSwords } from 'react-icons/gi';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useQuestStorage } from '../hooks/useQuestStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { formatBattleLogText } from '../utils/battleLogTranslations';
import { todayKey } from '../utils/dateKey';
import { getRandomCombatQuestion } from '../data/bossCombatQuestions';
import './BossBattle.css';

// ==========================================
// TYPEWRITER HOOK
// ==========================================
function useTypewriter(text, speed = 40) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);

  return { displayed, done };
}

// ==========================================
// QUEST ICON MAP
// ==========================================
const getQuestIcon = (t, iconKey) => {
  const icons = {
    marathon: t('dailyBoss.iconSprint'),
    energy: t('dailyBoss.iconFire'),
    sword: t('dailyBoss.iconSword'),
    flame: t('dailyBoss.iconFlame'),
    cards: t('dailyBoss.iconCards'),
  };
  return icons[iconKey] || t('dailyBoss.iconTask');
};

// ==========================================
// DIALOGUE BOX
// ==========================================
function DialogueBox({ quote, speakerName, PortraitIcon }) {
  const { displayed, done } = useTypewriter(quote, 40);
  return (
    <div className="boss-dialogue-box">
      <div className="boss-dialogue-portrait">
        {PortraitIcon && <PortraitIcon className="boss-portrait-icon" />}
      </div>
      <div className="boss-dialogue-text">
        <span className="boss-speaker-name">{speakerName}</span>
        <p className="boss-quote-body">
          {displayed}
          {!done && <span className="boss-cursor">|</span>}
        </p>
      </div>
    </div>
  );
}

export const getAssetUrl = (path) => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${path.replace(/^\/+/, '')}`;
};

// ==========================================
// UNIFIED BOSS BATTLE COMPONENT
// ==========================================
const BossBattleView = React.memo(function BossBattleView({
  name,
  title,
  typeTag = 'DAILY BOSS',
  PortraitIcon,
  soundPath,
  videoPath,
  quotes = [],
  accentColor = '#ef4444',
  accentBorder = 'rgba(185,28,28,0.3)',
  accentGlow = 'rgba(185,28,28,0.4)',
  finishEventType = 'TEACH_BOSS_FINISHED',
  bossId = 'teach',
}) {
  const { boss: teachBoss, doflamingoBoss, attackLog, damageBoss, addXpAndCoins } = useRpgStorage();
  const boss = bossId === 'doflamingo' ? (doflamingoBoss || { maxHp: 1200, currentHp: 1200, level: 60, defeated: false }) : teachBoss;
  const { quests } = useQuestStorage();
  const { t, lang, language } = useLanguage();
  const isAr = lang === 'ar' || language === 'ar' || document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';

  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const bossFinishedDispatchedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(
    () => (quotes.length > 0 ? Math.floor(Math.random() * quotes.length) : 0)
  );
  const [isHit, setIsHit] = useState(false);

  // ── AI Critical Strike Trial State ─────────────────────────────────────────
  const strikeDateKey = `boss_ai_strike_date_${bossId || 'teach'}`;
  const [isStrikeDoneToday, setIsStrikeDoneToday] = useState(() => {
    try {
      return localStorage.getItem(strikeDateKey) === todayKey();
    } catch {
      return false;
    }
  });

  // Keep state synchronized if bossId changes or day changes
  useEffect(() => {
    const checkStrikeDate = () => {
      try {
        const stored = localStorage.getItem(strikeDateKey);
        setIsStrikeDoneToday(stored === todayKey());
      } catch {
        setIsStrikeDoneToday(false);
      }
    };
    checkStrikeDate();
    window.addEventListener('day-changed', checkStrikeDate);
    return () => window.removeEventListener('day-changed', checkStrikeDate);
  }, [strikeDateKey]);

  const [trialOpen, setTrialOpen] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialQuestion, setTrialQuestion] = useState(null);
  const [trialAnswered, setTrialAnswered] = useState(false);
  const [trialSelectedOption, setTrialSelectedOption] = useState(null);
  const [trialToast, setTrialToast] = useState(null);

  // Lock background scroll when trial modal is open
  useEffect(() => {
    if (!trialOpen) return;

    const wrapper = document.querySelector('.view-wrapper');
    const origBodyOverflow = document.body.style.overflow;
    const origDocOverflow = document.documentElement.style.overflow;
    const origWrapperOverflow = wrapper ? wrapper.style.overflow : '';

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (wrapper) wrapper.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setTrialOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origDocOverflow;
      if (wrapper) wrapper.style.overflow = origWrapperOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [trialOpen]);

  const triggerTrialToast = (msg, type = 'success') => {
    setTrialToast({ msg, type });
    setTimeout(() => setTrialToast(null), 3000);
  };

  const handleStartAITrial = async () => {
    if (boss.defeated) {
      triggerTrialToast(t('dailyBoss.bossAlreadyDefeated'), 'info');
      return;
    }
    if (isStrikeDoneToday) {
      triggerTrialToast(isAr ? 'تم تنفيذ ضربة اليوم بنجاح! ستتوفر غداً.' : 'Critical strike completed for today! Returns tomorrow.', 'info');
      return;
    }

    setTrialOpen(true);
    setTrialLoading(true);
    setTrialQuestion(null);
    setTrialAnswered(false);
    setTrialSelectedOption(null);

    try {
      const targetLang = isAr ? 'Arabic' : 'English';
      // Gather some context from notes if available
      let noteContext = '';
      try {
        const savedNotes = JSON.parse(localStorage.getItem('study_hub_notes') || '[]');
        if (savedNotes.length > 0) {
          noteContext = savedNotes.slice(0, 3).map(n => `Title: ${n.title}\nContent: ${n.content.slice(0, 200)}`).join('\n\n');
        }
      } catch {}

      const VERCEL_AI_KEY = import.meta.env.VITE_VERCEL_AI_KEY || '';
      const randomSeed = Math.floor(Math.random() * 1000000);
      const systemPrompt = `You are the anime RPG Boss "${name}" (${title}).
Challenge the student with an academic trivia question based on their study notes or computer science, data science, machine learning, mathematics, or algorithms.
Random seed: ${randomSeed}.
CRITICAL: Generate a completely novel question every time. Do not repeat standard introductory questions.

CRITICAL INSTRUCTION: You MUST generate all fields (boss_taunt, question, options, explanation) strictly in ${targetLang}.

You MUST return ONLY a JSON object with this exact structure:
{
  "boss_taunt": "A dramatic 1-sentence in-character taunt in ${targetLang}",
  "question": "A multiple choice question in ${targetLang}",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_index": 0,
  "explanation": "1-sentence explanation in ${targetLang}"
}
No markdown code fences, output pure JSON only.`;

      const userPrompt = noteContext 
        ? `Generate a combat challenge in ${targetLang} from my notes:\n\n${noteContext}`
        : `Generate a distinct academic combat challenge in ${targetLang} testing Machine Learning, Data Structures, Algorithms, or Mathematics.`;

      const payload = {
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.8
      };

      let parsed = null;

      // 1. Direct Gateway URL
      try {
        const res = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${VERCEL_AI_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });

        const data = await res.json();
        const safeParseJson = (str) => {
          if (!str) return null;
          const firstBrace = str.indexOf('{');
          const lastBrace = str.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            try {
              return JSON.parse(str.slice(firstBrace, lastBrace + 1));
            } catch {}
          }
          try {
            const clean = str.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
            return JSON.parse(clean);
          } catch {}
          return null;
        };

        if (res.ok) {
          const raw = data?.choices?.[0]?.message?.content || '';
          parsed = safeParseJson(raw);
        }
      } catch (err) {
        console.warn('[Boss Battle AI] Direct Vercel failed, trying local proxy:', err.message);
      }

      // 2. Local Proxy fallback
      if (!parsed) {
        try {
          const res = await fetch('http://localhost:8000/api/ai-gateway', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10000),
          });
          if (res.ok) {
            const data = await res.json();
            const raw = data?.choices?.[0]?.message?.content || '';
            const firstBrace = raw.indexOf('{');
            const lastBrace = raw.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              try {
                parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
              } catch {}
            }
            if (!parsed) {
              try {
                const clean = raw.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
                parsed = JSON.parse(clean);
              } catch {}
            }
          }
        } catch (proxyErr) {
          console.warn('[Boss Battle AI] Local proxy failed:', proxyErr.message);
        }
      }

      // 3. Diverse offline fallback from questions pool (never repeats consecutive questions)
      if (!parsed || !parsed.question || !Array.isArray(parsed.options) || parsed.options.length < 2) {
        parsed = getRandomCombatQuestion(isAr);
      } else {
        // Shuffle options so correct answer position is varied
        const correctText = parsed.options[parsed.correct_index ?? 0];
        const shuffled = [...parsed.options].sort(() => Math.random() - 0.5);
        const newIdx = shuffled.indexOf(correctText);
        parsed.options = shuffled;
        parsed.correct_index = newIdx >= 0 ? newIdx : 0;
      }

      // 4. Language validation — ensure response matches active UI language
      if (parsed && parsed.question) {
        const arabicChars = (parsed.question.match(/[\u0600-\u06FF]/g) || []).length;
        const latinChars = (parsed.question.match(/[a-zA-Z]/g) || []).length;
        if (isAr && latinChars > arabicChars) {
          parsed = getRandomCombatQuestion(true);
        } else if (!isAr && arabicChars > latinChars) {
          parsed = getRandomCombatQuestion(false);
        }
      }

      setTrialQuestion(parsed);
    } catch (err) {
      triggerTrialToast(`Failed to summon boss trial: ${err.message}`, 'error');
      setTrialOpen(false);
    } finally {
      setTrialLoading(false);
    }
  };


  const handleSelectTrialOption = (idx) => {
    if (trialAnswered || !trialQuestion) return;
    setTrialAnswered(true);
    setTrialSelectedOption(idx);

    const isCorrect = idx === trialQuestion.correct_index;
    if (isCorrect) {
      // Trigger boss damage - exactly 200 HP as requested
      damageBoss(200, `${name} AI Critical Strike`, bossId);
      addXpAndCoins(100, 30, `Defeated ${name}'s Trial`);
      setIsHit(true);
      setTimeout(() => setIsHit(false), 1200);

      // Record once per day in localStorage
      const today = todayKey();
      try {
        localStorage.setItem(strikeDateKey, today);
      } catch {}
      setIsStrikeDoneToday(true);

      triggerTrialToast(t('dailyBoss.criticalStrike'), 'success');

      try {
        window.dispatchEvent(new CustomEvent('mascot-event', {
          detail: {
            eventType: 'TASK_COMPLETED',
            taskName: `AI Strike vs ${name}`,
            userMessage: `Landed a 200 Critical Strike on ${name} in the Combat Trial!`
          }
        }));
      } catch {}
    } else {
      triggerTrialToast(t('dailyBoss.bossBlocked'), 'warning');
    }
  };


  const soundSrc = soundPath ? getAssetUrl(soundPath) : '';
  const videoSrc = videoPath ? getAssetUrl(videoPath) : '';

  // Play boss intro sound ONLY AFTER mascot finishes opening greeting
  useEffect(() => {
    if (!soundSrc) return;
    let hasPlayed = false;

    const playBossAudio = () => {
      if (hasPlayed) return;
      hasPlayed = true;

      const audio = new Audio(soundSrc);
      audio.volume = 0.65;
      audioRef.current = audio;

      const dispatchFinished = () => {
        if (bossFinishedDispatchedRef.current) return;
        bossFinishedDispatchedRef.current = true;
        if (finishEventType) {
          window.dispatchEvent(
            new CustomEvent('mascot-event', {
              detail: { eventType: finishEventType, userMessage: '' },
            })
          );
        }
      };

      audio.onended = dispatchFinished;
      audio.onerror = dispatchFinished;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMuted(false);
            setAudioStarted(true);
          })
          .catch(() => {
            setIsMuted(true);
            setAudioStarted(false);
          });
      }
    };

    window.addEventListener('mascot-greeting-finished', playBossAudio, { once: true });
    const fallbackTimer = setTimeout(playBossAudio, 6000);

    return () => {
      window.removeEventListener('mascot-greeting-finished', playBossAudio);
      clearTimeout(fallbackTimer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [soundSrc, finishEventType]);

  // Video autoplay helper
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoSrc) return;
    v.muted = true;
    v.src = videoSrc;
    v.play().catch(() => {
      const retry = () => { v.play().catch(() => {}); };
      v.addEventListener('canplay', retry, { once: true });
    });
  }, [videoSrc]);

  // Rotate quotes
  useEffect(() => {
    if (quotes.length <= 1) return;
    const iv = setInterval(() => {
      setQuoteIndex(i => (i + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(iv);
  }, [quotes.length]);

  // Flash hit animation whenever HP drops
  const prevHp = useRef(boss.currentHp);
  useEffect(() => {
    if (boss.currentHp < prevHp.current) {
      setIsHit(true);
      setTimeout(() => setIsHit(false), 320);
    }
    prevHp.current = boss.currentHp;
  }, [boss.currentHp]);

  const toggleMute = () => {
    let audio = audioRef.current;
    if (!audio && soundSrc) {
      audio = new Audio(soundSrc);
      audio.volume = 0.65;
      audioRef.current = audio;
    }
    if (!audio) return;

    if (!audioStarted || audio.paused) {
      audio.currentTime = 0;
      audio.muted = false;
      audio.play().catch(() => {});
      setAudioStarted(true);
      setIsMuted(false);
    } else {
      const next = !isMuted;
      audio.muted = next;
      setIsMuted(next);
    }
  };

  const hpPct = Math.max(0, Math.min(100, Math.round((boss.currentHp / boss.maxHp) * 100)));

  const statusBadge = useMemo(() => {
    if (boss.defeated)
      return { label: t('dailyBoss.defeated'), color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: '#10b981' };
    if (hpPct <= 30)
      return { label: t('dailyBoss.critical'), color: '#38bdf8', bg: 'rgba(56,189,248,0.15)', border: '#38bdf8' };
    if (hpPct <= 70)
      return { label: t('dailyBoss.vulnerable'), color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: '#f59e0b' };
    return { label: t('dailyBoss.enraged'), color: accentColor, bg: `${accentColor}26`, border: accentColor };
  }, [boss.defeated, hpPct, accentColor, t]);

  const hpBarGradient = useMemo(() => {
    if (hpPct > 70) return `linear-gradient(90deg, #dc2626 0%, ${accentColor} 100%)`;
    if (hpPct > 30) return 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)';
    if (hpPct > 0)  return 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)';
    return 'linear-gradient(90deg, #059669 0%, #10b981 100%)';
  }, [hpPct, accentColor]);

  const cssVars = {
    '--boss-accent': accentColor,
    '--boss-border': accentBorder,
    '--boss-glow': accentGlow,
  };

  return (
    <div className="arena-card boss-card" style={cssVars}>
      {/* HEADER */}
      <div className="boss-header">
        <div className="boss-title-group">
          <span className="boss-type-tag">
            {PortraitIcon && <PortraitIcon style={{ marginRight: 5 }} />} {t('dailyBoss.dailyBoss')}
          </span>
          <h2 className="boss-name">{name}</h2>
          <p className="boss-subtitle">{title}</p>
        </div>
        <div className="boss-status-group">
          <span className="boss-level-pill">{t('dailyBoss.lvlBoss', { lvl: boss.level || 50 })}</span>
          <span
            className="boss-state-badge"
            style={{
              color: statusBadge.color,
              background: statusBadge.bg,
              borderColor: statusBadge.border,
            }}
          >
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* ROW */}
      <div className="boss-row">
        {/* VIDEO CONTAINER */}
        <div className={`boss-video-container ${isHit ? 'boss-video-hit' : ''}`}>
          <video
            ref={videoRef}
            className="boss-video"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="boss-video-overlay" />

          {/* MUTE BUTTON */}
          <button
            className={`boss-mute-btn ${!audioStarted ? 'boss-mute-pulse' : ''}`}
            onClick={toggleMute}
            title={!audioStarted ? 'Click to enable boss voice' : isMuted ? 'Unmute' : 'Mute'}
            aria-label="Toggle sound"
          >
            {isMuted || !audioStarted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          {!audioStarted && <span className="boss-audio-hint">{t('dailyBoss.clickForVoice')}</span>}

          {/* DIALOGUE */}
          {quotes.length > 0 && (
            <DialogueBox
              quote={quotes[quoteIndex]}
              speakerName={name}
              PortraitIcon={PortraitIcon}
            />
          )}
        </div>

        {/* STATS PANEL */}
        <div className="boss-stats-panel">
          {/* HP BAR */}
          <div className="boss-hp-section">
            <div className="boss-hp-labels">
              <span className="boss-hp-title">
                <FaHeart style={{ color: accentColor, marginRight: 5, fontSize: '0.85rem' }} />
                {t('dailyBoss.bossHealth')}
              </span>
              <span className="boss-hp-pct" style={{ color: statusBadge.color }}>
                {boss.currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()} HP ({hpPct}%)
              </span>
            </div>
            <div className="boss-hp-track">
              <div
                className="boss-hp-fill"
                style={{ width: `${hpPct}%`, background: hpBarGradient }}
              />
            </div>
            {boss.defeated && (
              <div className="boss-victory-inline">
                <FaTrophy style={{ color: '#facc15', marginRight: 6 }} />
                {t('dailyBoss.bossDefeatedToday')}
              </div>
            )}
          </div>

          {/* REWARDS STRIP */}
          <div className="boss-rewards-strip">
            <span className="boss-rewards-label">{t('dailyBoss.defeatRewards')}</span>
            <div className="boss-reward-item">
              <FaCoins className="boss-reward-icon gold" />
              <span>+{boss.goldReward || 150} {t('dailyBoss.gold')}</span>
            </div>
            <div className="boss-reward-item">
              <FaBolt className="boss-reward-icon xp" />
              <span>+{boss.xpReward || 500} XP</span>
            </div>
            <div className="boss-reward-item">
              <FaTrophy style={{ color: '#a855f7' }} />
              <span>{t('dailyBoss.legendaryTrophy')}</span>
            </div>
          </div>

          {/* AI CRITICAL STRIKE ACTION BANNER (Hidden once completed today or if boss is defeated) */}
          {!isStrikeDoneToday && !boss.defeated && (
            <div className="boss-ai-strike-wrapper">
              <button
                type="button"
                className={`boss-ai-strike-btn${trialLoading ? ' boss-ai-strike-btn--loading' : ''}`}
                onClick={handleStartAITrial}
                disabled={trialLoading}
                title={isAr ? "أجب عن التحدي الأكاديمي لتوجيه ضربة حاسمة بـ 200 ضرر!" : "Summon an AI academic combat question. Answering correctly deals 200 Critical Strike damage!"}
              >
                <div className="boss-ai-strike-left">
                  <div className="boss-ai-strike-icon-box">
                    {trialLoading ? (
                      <FaSpinner className="boss-ai-strike-spinner" />
                    ) : (
                      <FaBolt className="boss-ai-strike-bolt" />
                    )}
                  </div>
                  <div className="boss-ai-strike-text-block">
                    <div className="boss-ai-strike-heading-row">
                      <span className="boss-ai-strike-title">
                        {trialLoading
                          ? t('dailyBoss.aiSummoning')
                          : (isAr ? 'تحدي الضربة الحاسمة بالذكاء الاصطناعي' : 'AI Critical Strike Trial')}
                      </span>
                      <span className="boss-ai-strike-badge">-200 HP</span>
                    </div>
                    <span className="boss-ai-strike-sub">
                      {isAr ? 'أجب عن التحدي الأكاديمي لتوجيه ضربة قاضية للزعيم (-200 صحة، مرة يومياً)' : 'Solve combat trivia to inflict massive critical damage (-200 HP, once daily)'}
                    </span>
                  </div>
                </div>
                <div className="boss-ai-strike-cta-pill">
                  {trialLoading ? (
                    <span>{isAr ? 'جاري التحضير...' : 'Summoning...'}</span>
                  ) : (
                    <>
                      <span>{isAr ? 'بدء التحدي' : 'Strike Now'}</span>
                      <GiCrossedSwords style={{ fontSize: '0.82rem' }} />
                    </>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* AUTO TASKS LIST */}
          <div className="boss-auto-tasks">
            <h4 className="boss-tasks-title">
              <GiCrossedSwords style={{ marginRight: 6, color: accentColor }} />
              {t('dailyBoss.attackQuests')}
            </h4>
            <div className="boss-quest-list">
              {quests.slice(0, 3).map((q) => {
                const icon = getQuestIcon(t, q.iconKey);
                const progressPct = Math.min(100, Math.round((q.progress / q.total) * 100));
                
                // Translate unit
                let unitText = q.unit;
                if (q.unit === 'mins') unitText = t('dailyBoss.mins');
                else if (q.unit === 'dmg') unitText = t('dailyBoss.dmg');
                else if (q.unit === 'days') unitText = t('common.days');
                else if (q.unit === 'cards') unitText = 'cards'; // or add translation if needed
                
                return (
                  <div
                    key={q.id}
                    className={`boss-quest-item ${q.claimed ? 'boss-quest-claimed' : q.completed ? 'boss-quest-done' : ''}`}
                  >
                    <span className="boss-quest-icon">{icon}</span>
                    <div className="boss-quest-body">
                      <div className="boss-quest-top">
                        <span className="boss-quest-title">{q.title}</span>
                        <span className="boss-quest-prog">
                          {q.progress}/{q.total} {unitText}
                        </span>
                      </div>
                      <div className="boss-quest-bar-track">
                        <div
                          className="boss-quest-bar-fill"
                          style={{
                            width: `${progressPct}%`,
                            background: q.completed ? '#10b981' : accentColor,
                          }}
                        />
                      </div>
                    </div>
                    {q.claimed ? (
                      <FaCheckCircle className="boss-q-check claimed" title="Claimed" />
                    ) : q.completed ? (
                      <FaTrophy className="boss-q-check done" title="Ready to claim!" />
                    ) : (
                      <FaClock style={{ color: '#475569', fontSize: '0.75rem', flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BATTLE LOG */}
          <div className="boss-battle-log-section">
            <h5 className="boss-log-title">
              <FaBolt style={{ marginRight: 5, color: '#f59e0b', fontSize: '0.65rem' }} />
              {t('dailyBoss.recentActions')}
            </h5>
            <div className="boss-log-list">
              {attackLog.length === 0 ? (
                <div className="boss-log-entry boss-log-info">
                  {t('dailyBoss.noActionsYet')}
                </div>
              ) : (
                attackLog.slice(0, 5).map((log) => {
                  // Translate timestamp labels
                  let timestamp = log.ts;
                  if (log.ts === 'DAILY') timestamp = t('dailyBoss.timestampDaily');
                  else if (log.ts === 'VICTORY') timestamp = t('dailyBoss.timestampVictory');
                  else if (log.ts === 'NEW') timestamp = t('dailyBoss.timestampNew');
                  
                  const logText = formatBattleLogText(log, t, isAr);

                  return (
                    <div key={log.id} className="boss-log-entry">
                      <span className="boss-log-ts">[{timestamp}]</span> {logText}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── AI COMBAT TRIAL MODAL ────────────────────────────────────────── */}
      {trialOpen && createPortal(
        <div className="boss-trial-overlay" style={cssVars} onClick={() => setTrialOpen(false)}>
          <div className="boss-trial-modal" style={{ borderColor: accentColor }} onClick={e => e.stopPropagation()}>
            {/* Top Close 'X' Button */}
            <button
              type="button"
              className="boss-trial-modal-close-icon"
              onClick={() => setTrialOpen(false)}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            {trialToast && (
              <div className={`boss-trial-toast boss-trial-toast--${trialToast.type}`}>
                {trialToast.msg}
              </div>
            )}

            <div className="boss-trial-header">
              <div className="boss-trial-title">
                <div className="boss-trial-title-icon-box" style={{ background: `${accentColor}22`, color: accentColor }}>
                  <GiCrossedSwords />
                </div>
                <div>
                  <span className="boss-trial-title-text">{t('dailyBoss.combatTrial', { name })}</span>
                  <div className="boss-trial-title-sub">
                    {isAr ? 'مواجهة معرفية أكاديمية مباشرة' : 'Academic Combat Duel · Instant Damage'}
                  </div>
                </div>
              </div>
              <span className="boss-trial-reward-pill">
                {t('dailyBoss.hpReward')}
              </span>
            </div>

            {trialLoading && (
              <div className="boss-trial-loading-state">
                <FaSpinner className="boss-trial-loading-spinner" style={{ color: accentColor }} />
                <p className="boss-trial-loading-text">{t('dailyBoss.aiPreparing')}</p>
              </div>
            )}

            {!trialLoading && trialQuestion && (
              <div className="boss-trial-body">
                {trialQuestion.boss_taunt && (
                  <div className="boss-trial-taunt" style={{ borderInlineStartColor: accentColor }}>
                    <div className="boss-trial-taunt-speaker">{name}</div>
                    <p className="boss-trial-taunt-quote">"{trialQuestion.boss_taunt}"</p>
                  </div>
                )}

                <div className="boss-trial-question-card">
                  <div className="boss-trial-question-badge">
                    {isAr ? 'سؤال التحدي' : 'Combat Question'}
                  </div>
                  <div className="boss-trial-question">
                    {trialQuestion.question}
                  </div>
                </div>

                <div className="boss-trial-options">
                  {trialQuestion.options?.map((opt, idx) => {
                    const isSelected = trialSelectedOption === idx;
                    const isCorrect = idx === trialQuestion.correct_index;
                    let stateClass = '';

                    if (trialAnswered) {
                      if (isCorrect) stateClass = 'trial-correct';
                      else if (isSelected) stateClass = 'trial-wrong';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectTrialOption(idx)}
                        disabled={trialAnswered}
                        className={`boss-trial-option-btn ${stateClass}`}
                      >
                        <span className="boss-trial-opt-idx">{String.fromCharCode(65 + idx)}</span>
                        <span className="boss-trial-opt-text">{opt}</span>
                        {trialAnswered && isCorrect && (
                          <FaCheckCircle className="boss-trial-opt-status-icon correct" />
                        )}
                        {trialAnswered && isSelected && !isCorrect && (
                          <FaTimes className="boss-trial-opt-status-icon wrong" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {trialAnswered && (
                  <div className="boss-trial-explanation-box">
                    <div className="boss-trial-explanation-header">
                      <FaLightbulb className="boss-trial-explanation-icon" />
                      <strong>{t('dailyBoss.explanation')}</strong>
                    </div>
                    <div className="boss-trial-explanation-text">
                      {trialQuestion.explanation}
                    </div>
                  </div>
                )}

                <div className="boss-trial-footer">
                  {trialAnswered && trialSelectedOption === trialQuestion.correct_index && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '999px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#10b981',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                    }}>
                      <FaCheckCircle />
                      <span>{isAr ? 'تم توجيه الضربة الحاسمة (-200 صحة)! اكتمل تحدي اليوم بنجاح' : 'Critical Strike Landed (-200 HP)! Today\'s trial complete.'}</span>
                    </div>
                  )}
                  {trialAnswered && trialSelectedOption !== trialQuestion.correct_index && !isStrikeDoneToday && !boss.defeated && (
                    <button
                      type="button"
                      onClick={handleStartAITrial}
                      className="boss-trial-next-btn"
                    >
                      <FaBolt />
                      <span>{isAr ? 'محاولة سؤال آخر' : 'Try Another Question'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setTrialOpen(false)}
                    className="boss-trial-close-btn"
                  >
                    {t('dailyBoss.close')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

export default BossBattleView;

