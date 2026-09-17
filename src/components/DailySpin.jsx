import { useState, useRef } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { todayKey } from '../utils/dateKey';

const CHALLENGES = [
  // Extra Reading & Videos (Max 30 min)
  { id: 'read_book_20',  text: 'Read a book for 20 min', icon: 'B', xp: 30 },
  { id: 'watch_vid_15',  text: 'Watch a study video for 15 min', icon: 'V', xp: 20 },
  { id: 'read_doc_10',   text: 'Read documentation for 10 min', icon: 'D', xp: 15 },
  { id: 'watch_tech_30', text: 'Watch a tech tutorial for 30 min', icon: 'V', xp: 40 },

  // English
  { id: 'eng_30', text: 'Study extra 30 min on English', icon: 'E', xp: 40 },
  { id: 'eng_15', text: 'Study extra 15 min on English', icon: 'E', xp: 20 },

  // Math & Data Science
  { id: 'math_30', text: 'Solve math for 30 min', icon: 'M', xp: 40 },
  { id: 'ds_20',   text: 'Practice Data Science for 20 min', icon: 'DS', xp: 30 },

  // Quick Focus
  { id: 'focus_20', text: 'Focus on 1 task for 20 min', icon: 'F', xp: 25 },
  { id: 'summary_15', text: 'Write a quick summary for 15 min', icon: 'S', xp: 20 }
];

// Seeded pick from challenges based on today's date
function getTodayChallenge() {
  const today = todayKey();
  const seed  = today.split('-').reduce((a, b) => a + parseInt(b), 0);
  return CHALLENGES[seed % CHALLENGES.length];
}

const WHEEL_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#a78bfa', '#ec4899', '#06b6d4', '#84cc16',
  '#6366f1', '#14b8a6'
];

export default function DailySpin() {
  const { t } = useLanguage();
  const todayKey_ = todayKey();
  const [spinLog, setSpinLog] = useAppStorage('app_spin_log', {});
  const { addXpAndCoins } = useRpgStorage();

  const todayEntry = spinLog[todayKey_];
  const todayChallenge = getTodayChallenge();

  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [showResult, setShowResult] = useState(!!todayEntry);
  const [justCompleted, setJustCompleted] = useState(false);
  const wheelRef = useRef(null);

  const spin = () => {
    if (spinning || todayEntry) return;
    setSpinning(true);
    const spins = 5 + Math.random() * 3;
    const targetIdx = CHALLENGES.indexOf(todayChallenge);
    const segAngle = 360 / CHALLENGES.length;
    const targetAngle = 360 - (targetIdx * segAngle + segAngle / 2);
    const finalAngle = angle + spins * 360 + targetAngle;
    setAngle(finalAngle);
    setTimeout(() => {
      setSpinning(false);
      setShowResult(true);
      setSpinLog(prev => ({ ...prev, [todayKey_]: { id: todayChallenge.id, spun: true, done: false, ts: Date.now() } }));
    }, 3500);
  };

  const markDone = () => {
    setSpinLog(prev => ({ ...prev, [todayKey_]: { ...prev[todayKey_], done: true } }));
    addXpAndCoins(todayChallenge.xp, Math.round(todayChallenge.xp / 5), `Daily Challenge: ${todayChallenge.text}`);
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 2000);
  };

  const totalXP = Object.values(spinLog).filter(e => e.done).reduce((s, e) => {
    const ch = CHALLENGES.find(c => c.id === e.id);
    return s + (ch?.xp || 0);
  }, 0);

  const alreadyDone = todayEntry?.done;

  return (
    <div className="arena-card spin-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">{t('spin.title')}</h3>
          <p className="arena-card-sub">{t('spin.subtitle')}</p>
        </div>
        <div className="spin-xp-badge">
          <span className="spin-xp-val">{totalXP}</span>
          <span className="spin-xp-label">XP</span>
        </div>
      </div>

      {/* Wheel */}
      <div className="wheel-wrapper">
        <div className="wheel-pointer">▼</div>
        <div
          ref={wheelRef}
          className="spin-wheel"
          style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 1)' : 'none' }}
        >
          {CHALLENGES.map((ch, i) => {
            const segAngle = 360 / CHALLENGES.length;
            const rotate = i * segAngle;
            return (
              <div
                key={ch.id}
                className="wheel-segment"
                style={{
                  '--seg-color': WHEEL_COLORS[i],
                  transform: `rotate(${rotate}deg)`,
                }}
              >
                <div className="wheel-segment-inner" style={{ background: WHEEL_COLORS[i] }}>
                  <span className="wheel-seg-icon">{ch.icon}</span>
                </div>
              </div>
            );
          })}
        </div>

        {!spinning && !showResult && (
          <button className="spin-btn" onClick={spin}>
            {t('spin.spin')}
          </button>
        )}
        {spinning && (
          <div className="spin-center-msg">{t('spin.spinning')}</div>
        )}
        {showResult && !spinning && (
          <div className="spin-center-result">{todayChallenge.icon}</div>
        )}
      </div>

      {/* Result */}
      {showResult && !spinning && (
        <div className={`spin-result ${alreadyDone ? 'spin-result-done' : ''}`}>
          <div className="spin-result-label">{t('spin.todaysChallenge')}</div>
          <div className="spin-result-text">{todayChallenge.text}</div>
          <div className="spin-result-xp">{t('spin.completionXp', { xp: todayChallenge.xp })}</div>

          {alreadyDone ? (
            <div className="spin-done-banner">
              {justCompleted ? t('spin.xpEarned') : t('spin.completed')}
            </div>
          ) : (
            <button className="spin-complete-btn" onClick={markDone}>
              {t('spin.markComplete', { xp: todayChallenge.xp })}
            </button>
          )}
        </div>
      )}

      {!showResult && !spinning && (
        <div className="spin-idle-hint">{t('spin.idleHint')}</div>
      )}
    </div>
  );
}
