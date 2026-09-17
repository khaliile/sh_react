import { useState, useMemo, useEffect, useRef } from 'react';
import {
  FaCalculator,
  FaDatabase,
  FaBook,
  FaCalendarAlt,
  FaCheckCircle,
  FaPlay,
  FaBullseye,
  FaClock,
  FaLayerGroup,
  FaCheck,
  FaFire,
  FaStar,
  FaTrophy,
  FaLightbulb,
  FaChevronRight,
} from 'react-icons/fa';
import { roadmapsData } from '../data/constants';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useActiveTask } from '../hooks/useActiveTask';
import { useTimeTracker, parseMinutesFromTask } from '../hooks/useAppHooks';
import { playTick, playFanfare } from '../utils/sounds';
import { useConfettiOn } from '../hooks/useConfetti';
import { useLanguage } from '../contexts/LanguageContext';
import { translateTask, translateCategory } from '../utils/taskTranslations';
import './RoadmapPage.css';

/* ── Theme config ──────────────────────────────────────────────── */
const THEME_CONFIG = {
  math: {
    icon: <FaCalculator />,
    label: 'Mathematics',
    labelAr: 'الرياضيات',
    color: '#3b82f6',
    tipTitle: 'Study Tip',
    tipTitleAr: 'نصيحة دراسية',
    tip: 'Break complex problems into smaller steps. Review mistakes before moving on.',
    tipAr: 'قسّم المسائل المعقدة إلى خطوات أصغر. راجع أخطاءك دائماً قبل الانتقال إلى المسألة التالية.',
  },
  ds: {
    icon: <FaDatabase />,
    label: 'Data Science',
    labelAr: 'علم البيانات',
    color: '#10b981',
    tipTitle: 'Pro Tip',
    tipTitleAr: 'نصيحة احترافية',
    tip: 'Practice on real datasets. Build projects to solidify your understanding.',
    tipAr: 'تدرّب على مجموعات بيانات حقيقية. أنشئ مشاريع برمجية متكاملة لترسيخ فهمك.',
  },
  english: {
    icon: <FaBook />,
    label: 'English',
    labelAr: 'اللغة الإنجليزية',
    color: '#d97706',
    tipTitle: 'Learning Tip',
    tipTitleAr: 'نصيحة تعليمية',
    tip: 'Immerse yourself daily. Reading, writing, and speaking all compound over time.',
    tipAr: 'انغمس يومياً في اللغة. القراءة والكتابة والاستماع والتحدث تبني الطلاقة تدريجياً.',
  },
};

const THEME_TAILWIND = {
  math: {
    iconColor: 'text-blue-500',
    progressGradient: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    tipCard: 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-800/40 text-blue-600 dark:text-blue-400',
  },
  ds: {
    iconColor: 'text-emerald-500',
    progressGradient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    tipCard: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400',
  },
  english: {
    iconColor: 'text-amber-500',
    progressGradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
    tipCard: 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40 text-amber-700 dark:text-amber-400',
  },
};

export default function RoadmapPage({ type, currentDay, checkedItems, toggleCheck }) {
  const roadmap = roadmapsData[type];
  const { addXpAndCoins } = useRpgStorage();
  const { activeTaskName, selectTask } = useActiveTask();
  const { addMinutes, removeMinutes } = useTimeTracker();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const translatedDay = t(`days.${currentDay.toLowerCase()}`);
  const dayData = roadmap?.[currentDay];

  const { total, completed, percentage } = useMemo(() => {
    if (!dayData || !dayData.tasks) return { total: 0, completed: 0, percentage: 0 };
    const tot = dayData.tasks.length;
    const comp = dayData.tasks.filter((_, idx) => checkedItems[`${type}-${currentDay}-${idx}`]).length;
    return { total: tot, completed: comp, percentage: tot > 0 ? (comp / tot) * 100 : 0 };
  }, [dayData, checkedItems, type, currentDay]);

  const allDone = completed === total && total > 0;
  useConfettiOn(allDone);

  const fanfareFiredRef = useRef(false);
  useEffect(() => {
    if (allDone && !fanfareFiredRef.current) {
      fanfareFiredRef.current = true;
      setTimeout(() => playFanfare(), 200);
    }
    if (!allDone) fanfareFiredRef.current = false;
  }, [allDone]);

  const handleTaskToggle = (id, task, currentlyDone) => {
    const minutes = parseMinutesFromTask(task) || 60;
    if (!currentlyDone) {
      playTick();
      addMinutes(minutes, { category: type, task, source: 'roadmap', taskId: id });
      addXpAndCoins(40, 8, task);
      try {
        window.dispatchEvent(new CustomEvent('mascot-event', {
          detail: {
            eventType: 'TASK_COMPLETED',
            taskName: task,
            userMessage: `Completed roadmap objective in ${roadmap?.title || type}: ${task}`
          }
        }));
      } catch { /* noop */ }
    } else {
      removeMinutes(minutes, { category: type, task, source: 'roadmap', taskId: id });
    }
    toggleCheck(id);
  };

  const handleSelectActive = (task) => {
    selectTask(task, { category: type, source: 'roadmap' });
  };

  const themeConf = THEME_CONFIG[type] || {
    icon: <FaLayerGroup />, label: roadmap?.title || type, labelAr: roadmap?.title || type, color: '#6366f1',
    tipTitle: 'Tip', tipTitleAr: 'نصيحة دراسية', tip: 'Stay focused and consistent.', tipAr: 'حافظ على تركيزك واستمرارك يومياً.',
  };
  const themeStyles = THEME_TAILWIND[type] || THEME_TAILWIND.math;

  /* SVG ring math */
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;

  /* Streak (simple placeholder) */
  const streak = completed > 0 ? `${completed}/${total}` : '0';

  if (!roadmap) return (
    <div className="rm-page">
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        {isAr ? 'الصفحة غير موجودة' : 'Page not found'}
      </div>
    </div>
  );
  if (!dayData) return (
    <div className="rm-page">
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        {isAr ? 'لا توجد مهام مجدولة لهذا اليوم.' : 'No tasks scheduled for today.'}
      </div>
    </div>
  );

  return (
    <div className={`rm-page theme-${roadmap.theme || type}`}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`rm-hero theme-${roadmap.theme || type}`}>
        {/* Decorative orb */}
        <div className={`rm-hero-orb orb-${roadmap.theme || type}`} />

        <div className="rm-hero-left">
          {/* Breadcrumb */}
          <div className="rm-breadcrumb">
            <span>{isAr ? 'مركز الدراسة' : 'Study Hub'}</span>
            <span className="rm-breadcrumb-dot" />
            <span>{isAr ? (themeConf.labelAr || themeConf.label) : themeConf.label}</span>
            <span className="rm-breadcrumb-dot" />
            <span>{translatedDay || currentDay}</span>
          </div>

          {/* Badge */}
          <span className={`rm-subject-badge badge-${roadmap.theme || type}`}>
            {themeConf.icon}
            {dayData.cat === 'Go' ? t('roadmap.catGo') : translateCategory(dayData.cat, isAr)}
          </span>

          {/* Title */}
          <h1 className="rm-hero-title">
            {isAr ? (
              t(`roadmap.${type}Track`)
            ) : (
              <>
                {themeConf.label}{' '}
                <span className="rm-title-accent">Roadmap</span>
              </>
            )}
          </h1>

          {/* Meta chips */}
          <div className="rm-hero-meta">
            <span className="rm-meta-chip">
              <FaCalendarAlt />
              {translatedDay || currentDay}
            </span>
            <span className="rm-meta-chip">
              <FaClock />
              {isAr ? `${total * 2} س مخططة` : `${total * 2}h planned`}
            </span>
            <span className="rm-meta-chip">
              <FaLayerGroup />
              {isAr ? `${total} مهام` : `${total} tasks`}
            </span>
          </div>
        </div>

        {/* Ring progress */}
        <div className="rm-hero-right">
          <div className="rm-ring-wrapper">
            <svg className="rm-ring-svg" viewBox="0 0 100 100">
              <circle className="rm-ring-track" cx="50" cy="50" r={r} />
              <circle
                className="rm-ring-fill"
                cx="50" cy="50" r={r}
                strokeDasharray={circ}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="rm-ring-center">
              <span className="rm-ring-pct">{Math.round(percentage)}%</span>
              <span className="rm-ring-lbl">{isAr ? 'مكتمل' : 'Done'}</span>
            </div>
          </div>
          <span className="rm-ring-caption">
            {isAr ? `${completed} من أصل ${total} مهام` : `${completed} of ${total} tasks`}
          </span>
        </div>
      </div>

      {/* ── Main Layout: Left (Stats + Tasks), Right (Right-Side Panel) ── */}
      <div className="rm-body">

        {/* Left Column: Top 3 Stats + Objectives Panel */}
        <div className="rm-main-col">
          
          {/* Top 3 Stats Strip */}
          <div className="rm-stats-strip-3">
            <div className="rm-stat-item">
              <span className="rm-stat-icon"><FaLayerGroup /></span>
              <span className="rm-stat-value">{total}</span>
              <span className="rm-stat-label">{isAr ? 'إجمالي المهام' : 'Total Tasks'}</span>
            </div>
            <div className="rm-stat-item">
              <span className="rm-stat-icon"><FaCheckCircle /></span>
              <span className="rm-stat-value">{completed}</span>
              <span className="rm-stat-label">{isAr ? 'المكتملة' : 'Completed'}</span>
            </div>
            <div className="rm-stat-item">
              <span className="rm-stat-icon"><FaClock /></span>
              <span className="rm-stat-value">{total * 2}{isAr ? ' س' : 'h'}</span>
              <span className="rm-stat-label">{isAr ? 'وقت الدراسة' : 'Study Time'}</span>
            </div>
          </div>

          {/* Task Panel */}
          <div className={`rm-task-panel theme-${roadmap.theme || type}`}>
            <p className="rm-panel-title">{isAr ? 'أهداف اليوم' : "Today's Objectives"}</p>

            {allDone && (
              <div className={`rm-all-done-banner theme-${roadmap.theme || type}`}>
                <span className="rm-done-icon"><FaTrophy /></span>
                <div className="rm-done-text">
                  <strong>{isAr ? 'اكتملت جميع المهام!' : 'All tasks complete!'}</strong>
                  <span>{isAr ? 'عمل رائع اليوم! حافظ على هذا الزخم غداً.' : 'Outstanding work today. Keep the momentum going tomorrow.'}</span>
                </div>
              </div>
            )}

            {dayData.tasks.map((task, idx) => {
              const id = `${type}-${currentDay}-${idx}`;
              const isDone = !!checkedItems[id];
              const isActive = activeTaskName === task;

              return (
                <div
                  key={idx}
                  className={`rm-task-card${isDone ? ' tc-done' : ''}${isActive ? ' tc-active' : ''} theme-${roadmap.theme || type}`}
                >
                  {/* Custom checkbox */}
                  <label className="rm-checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleTaskToggle(id, task, isDone)}
                    />
                    <span className="rm-check-ui">
                      <FaCheck />
                    </span>
                  </label>

                  {/* Number badge */}
                  <span className="rm-task-num">{idx + 1}</span>

                  {/* Content */}
                  <div className="rm-task-content" onClick={() => handleSelectActive(task)}>
                    <div className="rm-task-name">{translateTask(task, isAr)}</div>
                    <div className="rm-task-sub">
                      <FaClock style={{ fontSize: '9px' }} />
                      {parseMinutesFromTask(task) || 120} {isAr ? 'د' : 'min'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="rm-task-actions">
                    {isActive ? (
                      <span className={`rm-active-badge theme-${roadmap.theme || type}`}>
                        <FaBullseye style={{ fontSize: '9px' }} />
                        {t('roadmap.activeNow')}
                      </span>
                    ) : (
                      <button
                        className="rm-do-now-btn"
                        onClick={() => handleSelectActive(task)}
                        title={t('roadmap.doNowTooltip')}
                      >
                        <FaPlay style={{ fontSize: '9px' }} />
                        {t('roadmap.doNow')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right-Side Panel ────── */}
        <aside className="rm-right-panel">
          
          {/* Top Progress Stat */}
          <div className="rm-stat-progress-header">
            <span className="rm-stat-icon"><FaFire /></span>
            <span className="rm-stat-value">{streak}</span>
            <span className="rm-stat-label">{isAr ? 'التقدم' : 'Progress'}</span>
          </div>

          {/* Panel Content Body */}
          <div className="rm-right-panel-body">

            {/* Daily Progress Section with Progress Bar */}
            <div className="rm-sidebar-section">
              <div className="rm-sidebar-heading">
                {isAr ? 'التقدم اليومي' : 'Daily Progress'}
              </div>
              <div className="rm-progress-bar-row">
                <div className="rm-progress-bar-label">
                  <span>{isAr ? (themeConf.labelAr || themeConf.label) : themeConf.label}</span>
                  <span>{Math.round(percentage)}%</span>
                </div>
                <div className="rm-progress-bar-track">
                  <div
                    className="rm-progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Task Breakdown Section */}
            <div className="rm-sidebar-section">
              <div className="rm-sidebar-heading">
                {isAr ? 'تفاصيل المهام' : 'Task Breakdown'}
              </div>
              <div className="rm-task-breakdown-list">
                {dayData.tasks.map((task, idx) => {
                  const id = `${type}-${currentDay}-${idx}`;
                  const isDone = !!checkedItems[id];
                  return (
                    <div
                      key={idx}
                      className={`rm-task-breakdown-item ${isDone ? 'tbi-done' : ''}`}
                    >
                      <span className="rm-task-breakdown-name">
                        {translateTask(task, isAr)}
                      </span>
                      <span className="rm-task-breakdown-time">
                        {parseMinutesFromTask(task) || 120} {isAr ? 'د' : 'min'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Study Tip Box at the bottom */}
            <div className="rm-sidebar-section" style={{ marginTop: 'auto' }}>
              <div className="rm-sidebar-heading">
                {isAr ? 'نصيحة' : 'Tip'}
              </div>
              <div className="rm-tip-box">
                <div className="rm-tip-header">
                  <FaLightbulb />
                  <span>{isAr ? (themeConf.tipTitleAr || 'نصيحة دراسية') : (themeConf.tipTitle || 'PRO TIP')}</span>
                </div>
                <p className="rm-tip-text">
                  {isAr ? (themeConf.tipAr || themeConf.tip) : themeConf.tip}
                </p>
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}