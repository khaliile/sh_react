import React, { useState, useEffect } from 'react';
import { 
  FaBullseye, FaClock, FaCheckCircle, FaFire, FaBolt, FaGraduationCap, FaCoins
} from 'react-icons/fa';
import { GiCrossedSwords } from 'react-icons/gi';
import { useTimeTracker } from '../hooks/useAppHooks';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useLanguage } from '../contexts/LanguageContext';
import './MissionImpossible.css';

const ROTATION_HOURS = 48;

const CHALLENGE_TEMPLATES = [
  { id: 'm1', labelKey: 'mi.deepFocus', target: 240, type: 'study', xp: 300, coins: 80 },
  { id: 'm2', labelKey: 'mi.recallMaster', target: 15, type: 'cards', xp: 200, coins: 50 },
  { id: 'm3', labelKey: 'mi.slothSlayer', target: 500, type: 'boss', xp: 250, coins: 70 },
  { id: 'm4', labelKey: 'mi.immortalStreak', target: 2, type: 'streak', xp: 200, coins: 60 },
  { id: 'm5', labelKey: 'mi.scholarSurge', target: 450, type: 'xp', xp: 250, coins: 75 },
];

function generateMissions(seed) {
  const selected = [];
  for (let i = 0; i < 3; i++) {
    const idx = (seed + i * 2) % CHALLENGE_TEMPLATES.length;
    selected.push(CHALLENGE_TEMPLATES[idx]);
  }
  return selected;
}

export default function MissionImpossible() {
  const { log, todayMinutes } = useTimeTracker();
  const { xp, addXpAndCoins } = useRpgStorage();
  const { t } = useLanguage();
  const streak = log?.streak || 0;

  const [missionState, setMissionState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('app_mission_impossible') || 'null');
      if (saved && saved.expiresAt > Date.now()) {
        if (saved.missions && saved.missions.some(m => m.label && !m.labelKey)) {
          localStorage.removeItem('app_mission_impossible');
        } else {
          return saved;
        }
      }
    } catch {}
    const now = Date.now();
    const seed = Math.floor(now / (ROTATION_HOURS * 3600 * 1000));
    const missions = generateMissions(seed);
    const initial = {
      seed,
      expiresAt: now + ROTATION_HOURS * 3600 * 1000,
      missions,
      progress: {},
      completed: false,
    };
    localStorage.setItem('app_mission_impossible', JSON.stringify(initial));
    return initial;
  });

  const [justWon, setJustWon] = useState(false);

  // Sync progress
  useEffect(() => {
    const { missions, progress } = missionState;
    let flashcardsDone = 0;
    try {
      const reviewStats = JSON.parse(localStorage.getItem('app_flashcard_reviews') || '{}');
      flashcardsDone = reviewStats.todayCount || 0;
    } catch {}

    let bossDmgToday = 0;
    try {
      const boss = JSON.parse(localStorage.getItem('app_rpg_state') || '{}')?.boss;
      bossDmgToday = boss?.damageDealtToday || todayMinutes * 2;
    } catch {}

    const newProgress = { ...progress };

    missions.forEach(m => {
      let val = 0;
      if (m.type === 'study')  val = todayMinutes;
      if (m.type === 'cards')  val = flashcardsDone;
      if (m.type === 'streak') val = streak;
      if (m.type === 'xp')     val = xp % 1000;
      if (m.type === 'boss')   val = bossDmgToday;
      newProgress[m.id] = Math.min(m.target, val);
    });

    const allDone = missions.every(m => (newProgress[m.id] || 0) >= m.target);

    if (allDone && !missionState.completed) {
      const totalXp = missions.reduce((s, m) => s + m.xp, 0);
      const totalCoins = missions.reduce((s, m) => s + m.coins, 0);
      addXpAndCoins(totalXp, totalCoins, 'Mission Impossible Jackpot');
      setJustWon(true);
      setMissionState(prev => ({ ...prev, progress: newProgress, completed: true }));
      localStorage.setItem('app_mission_impossible', JSON.stringify({ ...missionState, progress: newProgress, completed: true }));
      setTimeout(() => setJustWon(false), 5000);
    } else {
      setMissionState(prev => ({ ...prev, progress: newProgress }));
    }
  }, [todayMinutes, xp, streak]);

  // Time remaining
  const msLeft = Math.max(0, missionState.expiresAt - Date.now());
  const hoursLeft = Math.floor(msLeft / 3600000);
  const minsLeft = Math.floor((msLeft % 3600000) / 60000);

  const totalXpReward = missionState.missions.reduce((s, m) => s + m.xp, 0);
  const totalCoinsReward = missionState.missions.reduce((s, m) => s + m.coins, 0);

  const completedCount = missionState.missions.filter((m) => (missionState.progress[m.id] || 0) >= m.target).length;
  const overallProgressPct = Math.round((completedCount / 3) * 100);

  const getMissionIcon = (type) => {
    switch (type) {
      case 'study': return <FaClock style={{ color: '#3b82f6' }} />;
      case 'cards': return <FaGraduationCap style={{ color: '#10b981' }} />;
      case 'boss': return <GiCrossedSwords style={{ color: '#ef4444' }} />;
      case 'streak': return <FaFire style={{ color: '#f59e0b' }} />;
      case 'xp': return <FaBolt style={{ color: '#8b5cf6' }} />;
      default: return <FaBullseye style={{ color: '#6366f1' }} />;
    }
  };

  return (
    <div className="arena-card mi-card">
      {/* Header */}
      <div className="mi-compact-header">
        <div className="mi-compact-title">
          <div className="mi-compact-icon">
            <FaBullseye />
          </div>
          <span>{t('mi.title')}</span>
        </div>
        <div className="mi-compact-timer">
          <FaClock style={{ fontSize: '11px' }} />
          <span>{hoursLeft}h {minsLeft}m</span>
        </div>
      </div>

      {/* Rewards & Progress Overview */}
      <div className="mi-progress-overview">
        <div className="mi-completed-badge">
          {completedCount === 3 ? <FaCheckCircle style={{ color: '#10b981' }} /> : null}
          <span>{completedCount}/3 {t('common.completed') || 'Completed'}</span>
        </div>
        <div className="mi-rewards-chips">
          <div className="mi-reward-chip xp">
            <FaBolt style={{ fontSize: '10px' }} />
            <span>+{totalXpReward} XP</span>
          </div>
          <div className="mi-reward-chip coins">
            <FaCoins style={{ fontSize: '10px' }} />
            <span>+{totalCoinsReward} {t('mi.goldCoins')}</span>
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="mi-progress-track">
        <div 
          className="mi-progress-fill"
          style={{ width: `${overallProgressPct}%` }}
        />
      </div>

      {/* Missions List */}
      <div className="mi-missions-compact">
        {missionState.missions.map(m => {
          const val = missionState.progress[m.id] || 0;
          const isComplete = val >= m.target;
          const itemPct = Math.min(100, Math.round((val / m.target) * 100));

          return (
            <div key={m.id} className={`mi-mission-row ${isComplete ? 'complete' : ''}`}>
              <div className="mi-mission-type-icon">
                {getMissionIcon(m.type)}
              </div>
              <div className="mi-mission-content">
                <div className="mi-mission-top">
                  <span className="mi-mission-name">{t(m.labelKey)}</span>
                  <span className="mi-mission-progress-pill">
                    {isComplete ? <FaCheckCircle style={{ marginInlineEnd: 4, color: '#10b981' }} /> : null}
                    {val} / {m.target}
                  </span>
                </div>
                <div className="mi-mission-subtrack">
                  <div className="mi-mission-subfill" style={{ width: `${itemPct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
