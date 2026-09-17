import React, { useState, useMemo } from 'react';
import {
  FaSnowflake, FaFire, FaPlus, FaTrash, FaLock, FaUnlock,
  FaClock, FaCheckCircle, FaPauseCircle, FaPlayCircle, FaBullseye
} from 'react-icons/fa';
import { GiIceCube, GiFlame, GiIceberg } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealStudyData } from '../utils/studyDataService';
import './CryoChamberPage.css';

function buildInitialGoals(realData) {
  const { todayMinutes, todayHours, dailyGoalHours, streak, completedTasksCount, totalHours } = realData;
  const goalMinutes = (dailyGoalHours || 5) * 60;
  const studyProgress = goalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100)) : 0;
  const streakProgress = Math.min(100, Math.round((streak / 7) * 100));
  const tasksProgress = Math.min(100, Math.round((completedTasksCount / 10) * 100));
  const totalHoursGoal = 100;
  const totalHoursProgress = Math.min(100, Math.round(((totalHours || 0) / totalHoursGoal) * 100));

  return [
    {
      id: 'daily-study',
      nameEn: 'Daily Study Target',
      nameAr: 'هدف المذاكرة اليومي',
      descEn: `${todayHours}h completed of ${dailyGoalHours}h daily goal`,
      descAr: `أنجزت ${todayHours} س من أصل ${dailyGoalHours} س كهدف يومي`,
      progress: studyProgress,
      color: '#60a5fa',
      frozen: false,
    },
    {
      id: 'weekly-streak',
      nameEn: '7-Day Study Streak',
      nameAr: 'سلسلة 7 أيام متتالية',
      descEn: `${streak} days active streak towards 7d milestone`,
      descAr: `${streak} أيام استمرار نحو إنجاز 7 أيام`,
      progress: streakProgress,
      color: '#a78bfa',
      frozen: false,
    },
    {
      id: 'tasks-roadmap',
      nameEn: 'Schedule & Tasks Progress',
      nameAr: 'إنجاز مهام الجدول والمناهج',
      descEn: `${completedTasksCount} tasks completed in current study progress`,
      descAr: `${completedTasksCount} مهام مكتملة في مسارك الدراسي الحالي`,
      progress: tasksProgress,
      color: '#34d399',
      frozen: false,
    },
    {
      id: 'total-hours',
      nameEn: 'Total Study Hours',
      nameAr: 'إجمالي ساعات المذاكرة',
      descEn: `${totalHours || 0}h studied — target: ${totalHoursGoal}h milestone`,
      descAr: `${totalHours || 0} ساعة مذاكرة — الهدف: ${totalHoursGoal} ساعة`,
      progress: totalHoursProgress,
      color: '#fb923c',
      frozen: false,
    },
  ];
}

function loadGoals(realData) {
  const initial = buildInitialGoals(realData);
  try {
    const saved = localStorage.getItem('cryo_goals');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const parsedIds = new Set(parsed.map(g => g.id));
        const missing = initial.filter(g => !parsedIds.has(g.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          saveGoals(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch {}
  return initial;
}

function saveGoals(goals) {
  try {
    localStorage.setItem('cryo_goals', JSON.stringify(goals));
  } catch {}
}

export default function CryoChamberPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const realData = useMemo(() => getRealStudyData(), []);
  const [goals, setGoals] = useState(() => loadGoals(realData));
  const [newGoal, setNewGoal] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const frozenCount = goals.filter(g => g.frozen).length;
  const activeCount = goals.filter(g => !g.frozen).length;

  const toggleFreeze = (id) => {
    const nowStr = new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const updated = goals.map(g => {
      if (g.id === id) {
        const willFreeze = !g.frozen;
        return {
          ...g,
          frozen: willFreeze,
          frozenDate: willFreeze ? nowStr : undefined,
        };
      }
      return g;
    });
    setGoals(updated);
    saveGoals(updated);
  };

  const removeGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    saveGoals(updated);
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const colors = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f472b6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const goal = {
      id: `goal_${Date.now()}`,
      nameEn: newGoal.trim(),
      nameAr: newGoal.trim(),
      descEn: newDesc.trim() || 'Custom goal',
      descAr: newDesc.trim() || 'هدف مخصص',
      progress: 0,
      color,
      frozen: false,
    };
    const updated = [...goals, goal];
    setGoals(updated);
    saveGoals(updated);
    setNewGoal('');
    setNewDesc('');
  };

  const resetToLiveMetrics = () => {
    const fresh = buildInitialGoals(realData);
    setGoals(fresh);
    saveGoals(fresh);
  };

  return (
    <div className={`cryo-chamber ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="cryo-header">
        <h1>
          <GiIceberg style={{ display: 'inline', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem', verticalAlign: 'middle' }} />
          {isRTL ? 'غرفة التجميد — تجميد الأهداف زمنياً' : 'Cryo Chamber'}
        </h1>
        <p>
          {isRTL
            ? 'جمّد أي هدف دراسي لحمايته من الانقطاع — واحتفظ بنسبة إنجازه بدقة لاستئنافها لاحقاً'
            : 'Pause any goal and freeze it in time — protect your progress and resume whenever ready'}
        </p>
        <span className="cryo-badge">
          <FaSnowflake style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
          {isRTL ? `${frozenCount} أهداف قيد التجميد` : `${frozenCount} Goals Frozen`}
        </span>
      </div>

      {/* ── Stats ── */}
      <div className="cryo-stats" style={{ marginBottom: '2rem' }}>
        <div className="cryo-stat">
          <div className="cryo-stat-icon"><FaPlayCircle /></div>
          <div className="cryo-stat-val">{activeCount}</div>
          <div className="cryo-stat-label">{isRTL ? 'قيد المتابعة' : 'Active'}</div>
        </div>
        <div className="cryo-stat">
          <div className="cryo-stat-icon"><FaSnowflake style={{ color: '#93c5fd' }} /></div>
          <div className="cryo-stat-val">{frozenCount}</div>
          <div className="cryo-stat-label">{isRTL ? 'مجمّد' : 'Frozen'}</div>
        </div>
        <div className="cryo-stat">
          <div className="cryo-stat-icon"><FaCheckCircle style={{ color: '#4ade80' }} /></div>
          <div className="cryo-stat-val">{goals.length}</div>
          <div className="cryo-stat-label">{isRTL ? 'إجمالي الأهداف' : 'Total'}</div>
        </div>
      </div>

      {/* ── Cryo Pods ── */}
      <div className="cryo-grid">
        {goals.map(g => {
          const name = isRTL ? (g.nameAr || g.nameEn || g.name) : (g.nameEn || g.name);
          const desc = isRTL ? (g.descAr || g.descEn || g.desc) : (g.descEn || g.desc);
          const progress = Math.min(100, Math.max(0, g.progress ?? 0));
          return (
            <div key={g.id} className={`cryo-pod ${g.frozen ? 'frozen' : 'active'}`}>
              {g.frozen && (
                <div className="cryo-frozen-stamp">
                  <FaSnowflake /> {isRTL ? `مجمّد (${g.frozenDate || 'الآن'})` : `Frozen (${g.frozenDate || 'Now'})`}
                </div>
              )}
              <div className="cryo-pod-icon" style={{ color: g.frozen ? '#93c5fd' : g.color }}>
                {g.frozen ? <GiIceCube /> : <FaBullseye />}
              </div>
              <div className="cryo-pod-name">{name}</div>
              <p className="cryo-pod-desc">{desc}</p>

              <div className="cryo-progress-wrap">
                <div className="cryo-progress-label">
                  <span>{isRTL ? 'نسبة التقدم' : 'Progress'}</span>
                  <span style={{ fontWeight: 700 }}>{progress}%</span>
                </div>
                <div className="cryo-progress-track">
                  <div
                    className="cryo-progress-fill"
                    style={{
                      width: `${progress}%`,
                      background: g.frozen
                        ? 'linear-gradient(90deg, #60a5fa88, #93c5fd)'
                        : `linear-gradient(90deg, ${g.color}88, ${g.color})`
                    }}
                  />
                </div>
              </div>

              <div className="cryo-pod-actions">
                <button
                  className={`cryo-btn ${g.frozen ? 'thaw' : 'freeze'}`}
                  onClick={() => toggleFreeze(g.id)}
                >
                  {g.frozen
                    ? <><GiFlame /> {isRTL ? 'إذابة واستئناف' : 'Thaw Goal'}</>
                    : <><FaSnowflake /> {isRTL ? 'تجميد مؤقت' : 'Freeze It'}</>
                  }
                </button>
                <button className="cryo-btn remove" onClick={() => removeGoal(g.id)} title={isRTL ? 'حذف الهدف' : 'Delete goal'}>
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add Goal ── */}
      <div className="cryo-add-section">
        <h3><FaPlus /> {isRTL ? 'إضافة هدف جديد إلى الكبسولات' : 'Add Goal to Chamber'}</h3>
        <div className="cryo-add-row">
          <input
            className="cryo-input"
            placeholder={isRTL ? 'اسم الهدف...' : 'Goal name...'}
            value={newGoal}
            onChange={e => setNewGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()}
          />
          <input
            className="cryo-input"
            placeholder={isRTL ? 'وصف مختصر...' : 'Short description...'}
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()}
          />
          <button className="cryo-add-btn" onClick={addGoal}>
            <GiIceberg /> {isRTL ? 'إضافة' : 'Add'}
          </button>
        </div>
        <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
          <button
            onClick={resetToLiveMetrics}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#60a5fa',
              fontSize: '0.78rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRTL ? 'مزامنة وإعادة تعيين الأهداف لبيانات التطبيق الحالية' : 'Sync and reset to current app metrics'}
          </button>
        </div>
      </div>
    </div>
  );
}
