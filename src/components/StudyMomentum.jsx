import React, { useMemo } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';
import { useLanguage } from '../contexts/LanguageContext';
import { todayKeyAt, todayKey } from '../utils/dateKey';
import {
  FaFire,
  FaRocket,
  FaBolt,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from 'react-icons/fa';
import './StudyMomentum.css';

export default function StudyMomentum() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [log] = useAppStorage('app_time_log', { byDate: {} });

  const {
    currentStreak,
    longestStreak,
    momentum,
    state,
    last7Days,
  } = useMemo(() => {
    const byDate = log?.byDate || {};
    const today = new Date();

    // 1. Current Streak calculation
    let currentStreak = 0;
    const todayMins = byDate[todayKey()] || 0;
    const startOffset = todayMins > 0 ? 0 : 1;

    // If studied today, count starting today; if not yet, count starting yesterday if active
    for (let i = startOffset; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = todayKeyAt(d);
      if ((byDate[key] || 0) > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    // If user studied today and offset started at 1, add today
    if (startOffset === 0 && todayMins > 0) {
      // already counted
    } else if (todayMins > 0) {
      currentStreak += 1;
    }

    // 2. Longest Streak calculation
    let longestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = todayKeyAt(d);
      if ((byDate[key] || 0) > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    // 3. Last 7 Days Activity & Comparison
    let last7Sum = 0;
    let prev7Sum = 0;
    const days = [];

    // Arabic day initials: Sun (ح), Mon (ن), Tue (ث), Wed (ر), Thu (خ), Fri (ج), Sat (س)
    const arDayLetters = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
    const enDayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = todayKeyAt(d);
      const mins = byDate[key] || 0;
      last7Sum += mins;

      const dayIdx = d.getDay();
      days.push({
        dateKey: key,
        minutes: mins,
        hasStudied: mins > 0,
        isToday: i === 0,
        letter: isAr ? arDayLetters[dayIdx] : enDayLetters[dayIdx],
      });
    }

    for (let i = 7; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = todayKeyAt(d);
      prev7Sum += byDate[key] || 0;
    }

    // 4. Robust Momentum Calculation
    let calcMomentum = 0;
    let calcState = 'dormant';

    if (last7Sum === 0 && prev7Sum === 0) {
      calcMomentum = 0;
      calcState = 'dormant';
    } else if (prev7Sum === 0 && last7Sum > 0) {
      calcMomentum = 100;
      calcState = 'accelerating';
    } else if (last7Sum === 0 && prev7Sum > 0) {
      calcMomentum = -100;
      calcState = 'cooling';
    } else {
      const delta = Math.round(((last7Sum - prev7Sum) / prev7Sum) * 100);
      calcMomentum = Math.max(-100, Math.min(200, delta));

      if (calcMomentum >= 20) {
        calcState = 'accelerating';
      } else if (calcMomentum > 0) {
        calcState = 'growing';
      } else if (calcMomentum >= -20) {
        calcState = 'steady';
      } else {
        calcState = 'cooling';
      }
    }

    return {
      currentStreak,
      longestStreak,
      momentum: calcMomentum,
      state: calcState,
      last7Days: days,
    };
  }, [log?.byDate, isAr]);

  // Visual Configuration by State
  const cfg = useMemo(() => {
    const configs = {
      dormant: {
        label: isAr ? 'خامد' : 'Dormant',
        badgeClass: 'momentum-badge-dormant',
        color: '#94a3b8',
        desc: isAr
          ? 'لا يوجد نشاط مسجل — ادرس اليوم لتشغيل محرك الزخم'
          : 'No activity logged — study today to ignite your momentum',
        Icon: FaFire,
        TrendIcon: FaMinus,
      },
      accelerating: {
        label: isAr ? 'متسارع' : 'Accelerating',
        badgeClass: 'momentum-badge-accelerating',
        color: '#10b981',
        desc: isAr
          ? 'أنت في أعلى مستويات التسارع والتركيز!'
          : 'Peak acceleration! You are building unstoppable momentum!',
        Icon: FaRocket,
        TrendIcon: FaArrowUp,
      },
      growing: {
        label: isAr ? 'متزايد' : 'Growing',
        badgeClass: 'momentum-badge-growing',
        color: '#0ea5e9',
        desc: isAr
          ? 'وتيرة متصاعدة — حافظ على قوة اندفاعك'
          : 'Gaining speed — keep pushing forward!',
        Icon: FaBolt,
        TrendIcon: FaArrowUp,
      },
      steady: {
        label: isAr ? 'مستقر' : 'Steady',
        badgeClass: 'momentum-badge-steady',
        color: '#f59e0b',
        desc: isAr
          ? 'أداء متزن ومستقر — استمر بثبات'
          : 'Solid consistency — hold your steady pace!',
        Icon: FaFire,
        TrendIcon: FaMinus,
      },
      cooling: {
        label: isAr ? 'متباطئ' : 'Cooling',
        badgeClass: 'momentum-badge-cooling',
        color: '#f43f5e',
        desc: isAr
          ? 'تباطأ الزخم قليلاً — جلسة اليوم ستعيده للقمة'
          : 'Momentum dipping — study today to reignite the spark!',
        Icon: FaFire,
        TrendIcon: FaArrowDown,
      },
    };
    return configs[state] || configs.dormant;
  }, [state, isAr]);

  // SVG Gauge calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.15
  // Gauge fill percentage: when dormant, 12%; otherwise scale with momentum & streak
  const gaugePercent = state === 'dormant'
    ? 0.08
    : Math.min(1, Math.max(0.15, (currentStreak / 14) * 0.5 + (Math.max(0, momentum) / 100) * 0.5));
  const strokeDashoffset = circumference - gaugePercent * circumference;

  // Meter bar position
  const meterWidth = Math.min(50, Math.abs(momentum) / 2);
  const meterLeft = momentum >= 0 ? 50 : 50 - meterWidth;

  const IconComponent = cfg.Icon;
  const TrendIconComponent = cfg.TrendIcon;

  return (
    <div className="arena-card momentum-card">
      {/* ── Header ── */}
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">{isAr ? 'زخم الدراسة' : 'Study Momentum'}</h3>
          <p className="arena-card-sub">{isAr ? 'اتساق وتسارع الأداء' : 'Consistency & acceleration tracking'}</p>
        </div>
        <div className={`momentum-status-badge ${cfg.badgeClass}`}>
          {cfg.label}
        </div>
      </div>

      {/* ── Center Gauge Area ── */}
      <div className="momentum-center">
        <div className="momentum-gauge-wrap">
          <svg className="momentum-svg-gauge" viewBox="0 0 120 120">
            {/* Background track */}
            <circle
              className="momentum-gauge-bg"
              cx="60"
              cy="60"
              r={radius}
            />
            {/* Ambient Glow */}
            <circle
              className="momentum-gauge-bar momentum-gauge-glow"
              cx="60"
              cy="60"
              r={radius}
              stroke={cfg.color}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
            {/* Active arc */}
            <circle
              className="momentum-gauge-bar"
              cx="60"
              cy="60"
              r={radius}
              stroke={cfg.color}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          {/* Central orb */}
          <div className={`momentum-core momentum-core-${state}`}>
            <IconComponent className="momentum-core-icon" />
          </div>
        </div>

        {/* Streak number & tag */}
        <div className="momentum-streak-banner">
          <span className="momentum-streak-count">{currentStreak}</span>
          <span className="momentum-streak-tag">
            {isAr ? 'يوم تتابع' : 'Day Streak'}
          </span>
        </div>

        {/* Actionable insight description */}
        <p className="momentum-desc">{cfg.desc}</p>
      </div>

      {/* ── 7-Day Velocity Ribbon & Meter ── */}
      <div className="momentum-ribbon-wrap">
        <div className="momentum-week-days">
          {last7Days.map((day, i) => (
            <div key={i} className="momentum-day-col">
              <span className="momentum-day-lbl">{day.letter}</span>
              <div
                className={`momentum-day-pill ${day.hasStudied ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
                title={`${day.dateKey}: ${day.minutes}m`}
              />
            </div>
          ))}
        </div>

        {/* Dual-Direction Velocity Meter */}
        <div className="momentum-meter-container">
          <div className="momentum-meter-track">
            <div className="momentum-meter-divider" />
            <div
              className="momentum-meter-fill"
              style={{
                left: `${meterLeft}%`,
                width: `${meterWidth}%`,
                background: cfg.color,
                boxShadow: `0 0 8px ${cfg.color}`,
              }}
            />
          </div>
          <div className="momentum-meter-legend">
            <span>{isAr ? 'تباطؤ' : '-100%'}</span>
            <span className="momentum-meter-legend-val" style={{ color: cfg.color }}>
              {momentum > 0 ? `+${momentum}%` : `${momentum}%`}
            </span>
            <span>{isAr ? 'تسارع' : '+100%'}</span>
          </div>
        </div>
      </div>

      {/* ── Footer Stats Row (3 Columns) ── */}
      <div className="momentum-stats-row">
        <div className="momentum-stat-item">
          <span className="momentum-stat-val">{currentStreak}</span>
          <span className="momentum-stat-lbl">{isAr ? 'حالي' : 'Current'}</span>
        </div>
        <div className="momentum-stat-item">
          <span className="momentum-stat-val">{longestStreak}</span>
          <span className="momentum-stat-lbl">{isAr ? 'أطول' : 'Best'}</span>
        </div>
        <div className="momentum-stat-item">
          <span className="momentum-stat-val" style={{ color: cfg.color }}>
            <TrendIconComponent style={{ fontSize: '0.75rem' }} />
            {momentum > 0 ? `+${momentum}%` : `${momentum}%`}
          </span>
          <span className="momentum-stat-lbl">{isAr ? 'التسارع' : 'Velocity'}</span>
        </div>
      </div>
    </div>
  );
}
