import { useMemo, useState, lazy, Suspense } from 'react';
import { FaDownload, FaClipboardList, FaBullseye, FaClock, FaFire, FaCheckCircle, FaStar, FaTasks, FaBolt, FaChartPie, FaShieldAlt, FaBrain } from 'react-icons/fa';
import { useTimeTracker, useWeeklyGoal, useRoutineSchedule, useLiveClock, formatMinutes, computeStreak, lastNDays } from '../hooks/useAppHooks';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useActiveTask } from '../hooks/useActiveTask';
import { roadmapsData, scheduleRoutine as defaultRoutine } from '../data/constants';
import { useLanguage } from '../contexts/LanguageContext';
import { translateTask } from '../utils/taskTranslations';

// Lazy load heavy components
const StudyTimer = lazy(() => import('../components/StudyTimer'));
const ActivityHeatmap = lazy(() => import('../components/ActivityHeatmap'));
const AchievementsGrid = lazy(() => import('../components/AchievementsGrid'));
const MoodTracker = lazy(() => import('../components/MoodTracker'));
const WeeklyGoalPlanner = lazy(() => import('../components/WeeklyGoalPlanner'));
const ExportDataModal = lazy(() => import('../components/ExportDataModal'));
const WeeklyReportCard = lazy(() => import('../components/WeeklyReportCard'));

function slotMinutes(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = String(start).split(':').map(Number);
  const [eh, em] = String(end).split(':').map(Number);
  let mins = ((eh || 0) * 60 + (em || 0)) - ((sh || 0) * 60 + (sm || 0));
  if (mins <= 0) mins += 24 * 60;
  return mins;
}

export default function DashboardPage({ checkedItems, setCheckedItems }) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const { log, todayMinutes, resetLog } = useTimeTracker();
  const [goalHours, setGoalHours] = useWeeklyGoal();
  const { schedule } = useRoutineSchedule(defaultRoutine);
  const { clock } = useLiveClock(schedule);
  const { resetRpgProgress } = useRpgStorage();
  const { activeTaskName, isManual, selectTask, resetToAuto } = useActiveTask();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  // Daily mascot study goal — shared with FloatingMascot via localStorage
  const [dailyMascotGoal, setDailyMascotGoal] = useState(() => {
    const raw = localStorage.getItem('app_daily_study_goal_hours');
    const n = raw ? Number(raw) : 5;
    return Number.isFinite(n) && n >= 1 ? n : 5;
  });
  const handleDailyGoalChange = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n) || n < 1) return;
    setDailyMascotGoal(n);
    localStorage.setItem('app_daily_study_goal_hours', String(n));
  };

  const handleResetChecklists = () => {
    if (window.confirm("Uncheck all task checkboxes for this week?\n\n(Note: Your logged study hours, streaks, Cosmos analytics, and achievements will NOT be deleted)")) {
      if (setCheckedItems) setCheckedItems({});
    }
  };

  const handleResetData = () => {
    if (window.confirm("Clear ALL lifetime logged hours, streak, and reset everything to factory default?")) {
      resetLog();
      resetRpgProgress();
      if (setCheckedItems) setCheckedItems({});
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const todaysSlots = useMemo(() => {
    return schedule.map(slot => {
      const id = `routine-${today}-${slot.id}`;
      return {
        id,
        slot,
        checked: !!checkedItems[id],
        minutes: slotMinutes(slot.start, slot.end),
        isStudy: !!slot.isStudy,
      };
    });
  }, [today, checkedItems, schedule]);

  // Count study minutes from routine checklist + roadmap tasks + timer sessions
  const routineStudyToday = todaysSlots.reduce((s, x) => s + (x.checked && x.isStudy ? x.minutes : 0), 0);
  const totalToday = Math.max(todayMinutes || 0, routineStudyToday);
  const checkedCount = todaysSlots.filter(x => x.checked).length;

  const weekData = useMemo(() => lastNDays(log.byDate, 7), [log.byDate]);
  const weekTotal = weekData.reduce((s, d) => s + d.minutes, 0);
  const weekGoalMins = (goalHours || 56) * 60;
  const streak = useMemo(() => computeStreak(log.byDate), [log.byDate]);

  const completionStats = useMemo(() => {
    let total = 0, done = 0;
    Object.entries(roadmapsData).forEach(([key, roadmap]) => {
      const day = roadmap[today];
      if (!day) return;
      total += day.tasks.length;
      day.tasks.forEach((_, idx) => {
        if (checkedItems[`${key}-${today}-${idx}`]) done++;
      });
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [today, checkedItems]);

  return (
    <section className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-title-block">
          <div className="dashboard-title-row">
            <span className="dashboard-icon-badge">
              <FaChartPie />
            </span>
            <h1>{t('dashboard.title')}</h1>
          </div>
          <p className="dashboard-sub">
            <FaBrain className="dashboard-sub-icon" />
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="export-data-btn"
            onClick={() => setIsReportCardOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
            }}
            title="Generate & print official weekly performance report card"
          >
            <FaClipboardList /> {t('dashboard.weeklyReport')}
          </button>
          <button
            className="export-data-btn"
            onClick={() => setIsExportModalOpen(true)}
            title="Export daily and weekly study logs, analytics, and JSON backups"
          >
            <FaDownload />
            {t('dashboard.exportData')}
          </button>
          <button className="reset-checklist-btn" onClick={handleResetChecklists} title="Uncheck task checkboxes for this week (keeps all logged hours, streak, and Cosmos analytics)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {t('dashboard.resetChecklists')}
          </button>
          <button className="reset-data-btn" onClick={handleResetData} title="Clear all lifetime data, logged hours, streak, and progress">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            {t('dashboard.resetAllData')}
          </button>
        </div>
      </header>

      {/* Export Data Modal */}
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Weekly Performance Report Card Modal */}
      {isReportCardOpen && (
        <WeeklyReportCard onClose={() => setIsReportCardOpen(false)} />
      )}

      {/* Active Task Banner */}
      <div className={`dash-active-banner ${isManual ? 'manual' : 'auto'}`}>
        <div className="dash-active-left">
          <span className="live-radar-dot"></span>
          <span className="dash-active-label">{t('dashboard.activeTargetNow', { clock })}</span>
          <span className="dash-active-task-name">{translateTask(activeTaskName, isAr)}</span>
          <span className={`active-mode-tag ${isManual ? 'mode-manual' : 'mode-auto'}`}>
            {isManual ? ` ${t('dashboard.manualSelection')}` : ` ${t('dashboard.autoSchedule')}`}
          </span>
        </div>
        {isManual && (
          <button className="reset-auto-btn" onClick={resetToAuto}>
            <FaBolt style={{ fontSize: '0.7rem' }} /> {t('dashboard.resetToAuto')}
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-header-flex">
            <span className="stat-label">{t('dashboard.todayStudyTime')}</span>
            <div className="stat-icon-badge primary">
              <FaClock />
            </div>
          </div>
          <span className="stat-value">{formatMinutes(totalToday)}</span>
          <span className="stat-foot">{t('dashboard.slotsDone', { done: checkedCount, total: todaysSlots.length })}</span>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-header-flex">
            <span className="stat-label">{t('analytics.thisWeek')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                className="goal-target-badge"
                onClick={() => {
                  const val = window.prompt("Enter new weekly goal (hours):", goalHours);
                  if (val) {
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num > 0 && num <= 168) setGoalHours(num);
                  }
                }}
                title="Click to edit weekly goal target"
              >
                {t('dashboard.targetLabel', { n: goalHours })}
              </button>
              <div className="stat-icon-badge success">
                <FaBullseye />
              </div>
            </div>
          </div>
          <span className="stat-value">{formatMinutes(weekTotal)}</span>
          <span className="stat-foot">{t('dashboard.ofTarget', { n: goalHours })}</span>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: `${Math.min(100, (weekTotal / weekGoalMins) * 100)}%`, background: '#10b981' }} />
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-header-flex">
            <span className="stat-label">{t('dashboard.roadmapTasks')}</span>
            <div className="stat-icon-badge warning">
              <FaTasks />
            </div>
          </div>
          <span className="stat-value">{completionStats.done}/{completionStats.total}</span>
          <span className="stat-foot">{t('dashboard.completeToday', { pct: completionStats.pct })}</span>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${completionStats.pct}%`, background: '#f59e0b' }} /></div>
        </div>

        <div className="stat-card stat-streak">
          <div className="stat-header-flex">
            <span className="stat-label">{t('dashboard.streak')}</span>
            <div className="stat-icon-badge streak">
              <FaFire />
            </div>
          </div>
          <span className="stat-value">{streak} {streak === 1 ? t('common.day') : t('common.days')}</span>
          <span className="stat-foot">{streak >= 7 ? t('dashboard.onFire') : t('dashboard.keepGoing')}</span>
        </div>
      </div>

      <Suspense fallback={<div style={{minHeight:'200px'}} />}>
        <StudyTimer />
      </Suspense>

      <Suspense fallback={<div style={{minHeight:'150px'}} />}>
        <div className="dash-row">
          <MoodTracker />
          <WeeklyGoalPlanner sessionLog={log.sessions} />
        </div>
      </Suspense>

      {/* Daily Mascot Goal — shared with FloatingMascot via localStorage */}
      <div className="dash-card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="stat-icon-badge warning" style={{ width: 34, height: 34, fontSize: '0.9rem' }}>
              <FaStar />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{t('dashboard.dailyMascotGoal')}</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t('dashboard.mascotGoalSub')}
              </p>
            </div>
          </div>
          <select
            value={dailyMascotGoal}
            onChange={e => handleDailyGoalChange(e.target.value)}
            className="mascot-goal-select"
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
              <option key={h} value={h}>{h} {h > 1 ? t('dashboard.hours') : t('dashboard.hour')}</option>
            ))}
          </select>
        </div>
      </div>

            <Suspense fallback={<div style={{minHeight:'200px'}} />}>
        <ActivityHeatmap byDate={log.byDate} />
      </Suspense>

      <Suspense fallback={<div style={{minHeight:'150px'}} />}>
        <AchievementsGrid log={log} checkedItems={checkedItems} goalHours={goalHours} />
      </Suspense>
    </section>
  );
}
