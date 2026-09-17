import React, { useState, useMemo } from 'react';
import {
  FaUser, FaRunning, FaBed, FaBolt, FaStar, FaChartLine,
  FaFire, FaClock, FaBrain, FaExchangeAlt, FaInfoCircle,
  FaTrophy, FaArrowUp, FaArrowDown, FaMinus, FaSun
} from 'react-icons/fa';
import { GiPortal, GiMultipleTargets, GiTimeTrap } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealStudyData } from '../utils/studyDataService';
import './ParallelMePage.css';

function buildTimelines(data, isRTL) {
  const { streak, totalHours, level, sessionCount } = data;
  return [
    {
      id: 'current',
      type: 'current',
      name: isRTL ? 'أنت (الآن)' : 'You (Now)',
      label: isRTL ? 'الخط الزمني الحالي' : 'Current timeline',
      icon: <FaUser />,
      color: '#818cf8',
      accentBg: 'rgba(99,102,241,0.08)',
      accentBorder: 'rgba(99,102,241,0.3)',
      stat: `${Math.round(totalHours)}${isRTL ? ' س' : 'h'}`,
      statLabel: isRTL ? 'ساعات المذاكرة' : 'Studied',
      description: isRTL
        ? 'هذه نسختك الحالية بناءً على سجلات دراستك الواقعية المسجلة.'
        : 'This is who you are today based on your real study data.',
      metrics: [
        { label: isRTL ? 'إجمالي الساعات' : 'Total Hours', val: `${Math.round(totalHours)}${isRTL ? ' س' : 'h'}`, delta: 0 },
        { label: isRTL ? 'أيام الاستمرار' : 'Streak',      val: `${streak}${isRTL ? ' يوم' : 'd'}`,               delta: 0 },
        { label: isRTL ? 'المستوى' : 'Level',              val: `LV ${level}`,                                     delta: 0 },
        { label: isRTL ? 'عدد الجلسات' : 'Sessions',       val: `${sessionCount}`,                                delta: 0 },
      ]
    },
    {
      id: 'best',
      type: 'best',
      name: isRTL ? 'أفضل نسخة منك' : 'Best You',
      label: isRTL ? '+2 ساعة يومياً لـ 30 يوماً' : '+2h/day for 30 days',
      icon: <FaBolt />,
      color: '#4ade80',
      accentBg: 'rgba(34,197,94,0.06)',
      accentBorder: 'rgba(34,197,94,0.3)',
      stat: `${Math.round(totalHours + 60)}${isRTL ? ' س' : 'h'}`,
      statLabel: isRTL ? 'كان بإمكانك' : 'Would Have',
      description: isRTL
        ? 'لو أنك أضفت ساعتين إضافيتين من المذاكرة المركزة كل يوم خلال الشهر الماضي.'
        : 'If you had studied 2 more hours every day for the last 30 days.',
      metrics: [
        { label: isRTL ? 'إجمالي الساعات' : 'Total Hours', val: `${Math.round(totalHours + 60)}${isRTL ? ' س' : 'h'}`, delta: 60, positive: true },
        { label: isRTL ? 'أيام الاستمرار' : 'Streak',      val: `${streak + 14}${isRTL ? ' يوم' : 'd'}`,               delta: 14, positive: true },
        { label: isRTL ? 'المستوى' : 'Level',              val: `LV ${level + 4}`,                                     delta: 4,  positive: true },
        { label: isRTL ? 'عدد الجلسات' : 'Sessions',       val: `${sessionCount + 30}`,                                delta: 30, positive: true },
      ]
    },
    {
      id: 'lazy',
      type: 'lazy',
      name: isRTL ? 'النسخة المتكاسلة' : 'Lazy You',
      label: isRTL ? '–1 ساعة يومياً لـ 30 يوماً' : '–1h/day for 30 days',
      icon: <FaBed />,
      color: '#f87171',
      accentBg: 'rgba(239,68,68,0.06)',
      accentBorder: 'rgba(239,68,68,0.25)',
      stat: `${Math.max(0, Math.round(totalHours - 30))}${isRTL ? ' س' : 'h'}`,
      statLabel: isRTL ? 'كان سيكون' : 'Would Have',
      description: isRTL
        ? 'لو أنك خفضت ساعة يومياً وفرطت في سلاسل استمرارك لصالح التسويف.'
        : 'If you had skipped 1 hour every day and broken your streaks.',
      metrics: [
        { label: isRTL ? 'إجمالي الساعات' : 'Total Hours', val: `${Math.max(0, Math.round(totalHours - 30))}${isRTL ? ' س' : 'h'}`, delta: -30, positive: false },
        { label: isRTL ? 'أيام الاستمرار' : 'Streak',      val: `${Math.max(0, streak - 8)}${isRTL ? ' يوم' : 'd'}`,                  delta: -8,  positive: false },
        { label: isRTL ? 'المستوى' : 'Level',              val: `LV ${Math.max(1, level - 2)}`,                                         delta: -2,  positive: false },
        { label: isRTL ? 'عدد الجلسات' : 'Sessions',       val: `${Math.max(0, sessionCount - 12)}`,                                   delta: -12, positive: false },
      ]
    },
    {
      id: 'grind',
      type: 'grind',
      name: isRTL ? 'وضع الطحن الأقصى' : 'Grind Mode',
      label: isRTL ? '+4 ساعات يومياً — أقصى طاقة' : '+4h/day — max effort',
      icon: <FaFire />,
      color: '#fbbf24',
      accentBg: 'rgba(251,191,36,0.06)',
      accentBorder: 'rgba(251,191,36,0.3)',
      stat: `${Math.round(totalHours + 120)}${isRTL ? ' س' : 'h'}`,
      statLabel: isRTL ? 'كان بإمكانك' : 'Would Have',
      description: isRTL
        ? 'وضع الاجتهاد المطلق — 4 ساعات إضافية يومياً بأعلى سرعة إنجاز ممكنة.'
        : 'Full grind mode — 4 extra hours every day, maximum velocity.',
      metrics: [
        { label: isRTL ? 'إجمالي الساعات' : 'Total Hours', val: `${Math.round(totalHours + 120)}${isRTL ? ' س' : 'h'}`, delta: 120, positive: true },
        { label: isRTL ? 'أيام الاستمرار' : 'Streak',      val: `${streak + 30}${isRTL ? ' يوم' : 'd'}`,                  delta: 30,  positive: true },
        { label: isRTL ? 'المستوى' : 'Level',              val: `LV ${level + 10}`,                                        delta: 10,  positive: true },
        { label: isRTL ? 'عدد الجلسات' : 'Sessions',       val: `${sessionCount + 60}`,                                   delta: 60,  positive: true },
      ]
    },
    {
      id: 'balanced',
      type: 'balanced',
      name: isRTL ? 'النسخة المتوازنة الذكية' : 'Balanced You',
      label: isRTL ? 'توازن مثالي بين العمل والراحة' : 'Optimal work-rest ratio',
      icon: <FaStar />,
      color: '#22d3ee',
      accentBg: 'rgba(6,182,212,0.06)',
      accentBorder: 'rgba(6,182,212,0.3)',
      stat: `${Math.round(totalHours + 45)}${isRTL ? ' س' : 'h'}`,
      statLabel: isRTL ? 'كان بإمكانك' : 'Would Have',
      description: isRTL
        ? 'إيقاع ذكي مستدام — مذاكرة مكثفة 5 أيام ويومان للتعافي والتأمل دون احتراق.'
        : 'Smart pacing — studies 5 days, recovers 2 — sustainable peak performance.',
      metrics: [
        { label: isRTL ? 'إجمالي الساعات' : 'Total Hours', val: `${Math.round(totalHours + 45)}${isRTL ? ' س' : 'h'}`, delta: 45, positive: true },
        { label: isRTL ? 'أيام الاستمرار' : 'Streak',      val: `${streak + 20}${isRTL ? ' يوم' : 'd'}`,                 delta: 20, positive: true },
        { label: isRTL ? 'المستوى' : 'Level',              val: `LV ${level + 6}`,                                        delta: 6,  positive: true },
        { label: isRTL ? 'عدد الجلسات' : 'Sessions',       val: `${sessionCount + 40}`,                                  delta: 40, positive: true },
      ]
    },
    {
      id: 'deep_focus',
      type: 'deep_focus',
      name: isRTL ? 'التركيز العميق النقي' : 'Deep Focus',
      label: isRTL ? 'جلسات تدفق ذهني بدون مشتتات' : 'Zero distractions / Flow state',
      icon: <FaBrain />,
      color: '#a855f7',
      accentBg: 'rgba(168,85,247,0.06)',
      accentBorder: 'rgba(168,85,247,0.3)',
      stat: `${Math.round(totalHours + 75)}${isRTL ? ' س' : 'h'}`,
      statLabel: isRTL ? 'كان بإمكانك' : 'Would Have',
      description: isRTL
        ? 'لو أنك قضيت كل جلسة مذاكرة في وضع التدفق الكامل وحجبت الهواتف والمشتتات تماماً.'
        : 'If you had turned every session into pure uninterrupted flow with zero distractions.',
      metrics: [
        { label: isRTL ? 'إجمالي الساعات' : 'Total Hours', val: `${Math.round(totalHours + 75)}${isRTL ? ' س' : 'h'}`, delta: 75, positive: true },
        { label: isRTL ? 'أيام الاستمرار' : 'Streak',      val: `${streak + 21}${isRTL ? ' يوم' : 'd'}`,                 delta: 21, positive: true },
        { label: isRTL ? 'المستوى' : 'Level',              val: `LV ${level + 7}`,                                        delta: 7,  positive: true },
        { label: isRTL ? 'عدد الجلسات' : 'Sessions',       val: `${sessionCount + 35}`,                                  delta: 35, positive: true },
      ]
    },
    {
      id: 'early_bird',
      type: 'early_bird',
      name: isRTL ? 'رائد الفجر الباكر' : 'Early Bird',
      label: isRTL ? 'ساعة الفجر الذهبية يومياً' : '1 golden sunrise hour daily',
      icon: <FaSun />,
      color: '#f97316',
      accentBg: 'rgba(249,115,22,0.06)',
      accentBorder: 'rgba(249,115,22,0.3)',
      stat: `${Math.round(totalHours + 30)}${isRTL ? ' س' : 'h'}`,
      statLabel: isRTL ? 'كان بإمكانك' : 'Would Have',
      description: isRTL
        ? 'لو أنك استيقظت قبل الجميع وبدأت يومك بساعة تركيز ذهبية هادئة دون أي مقاطعة.'
        : 'If you had conquered the sunrise with one golden uninterrupted hour of study every morning.',
      metrics: [
        { label: isRTL ? 'إجمالي الساعات' : 'Total Hours', val: `${Math.round(totalHours + 30)}${isRTL ? ' س' : 'h'}`, delta: 30, positive: true },
        { label: isRTL ? 'أيام الاستمرار' : 'Streak',      val: `${streak + 28}${isRTL ? ' يوم' : 'd'}`,                 delta: 28, positive: true },
        { label: isRTL ? 'المستوى' : 'Level',              val: `LV ${level + 5}`,                                        delta: 5,  positive: true },
        { label: isRTL ? 'عدد الجلسات' : 'Sessions',       val: `${sessionCount + 30}`,                                  delta: 30, positive: true },
      ]
    },
    {
      id: 'atomic',
      type: 'atomic',
      name: isRTL ? 'صانع العادات الذرية' : 'Atomic Habits',
      label: isRTL ? 'عادة 30 دقيقة لا تنكسر أبداً' : 'Unbreakable 30m micro-habit',
      icon: <FaRunning />,
      color: '#ec4899',
      accentBg: 'rgba(236,72,153,0.06)',
      accentBorder: 'rgba(236,72,153,0.3)',
      stat: `${Math.round(totalHours + 15)}${isRTL ? ' س' : 'h'}`,
      statLabel: isRTL ? 'كان بإمكانك' : 'Would Have',
      description: isRTL
        ? 'لو أنك التزمت بحد أدنى مقدس 30 دقيقة يومياً دون كسر السلسلة حتى في أشد أيامك انشغالاً.'
        : 'If you had protected an unbroken 30-minute daily micro-habit even on your busiest days.',
      metrics: [
        { label: isRTL ? 'إجمالي الساعات' : 'Total Hours', val: `${Math.round(totalHours + 15)}${isRTL ? ' س' : 'h'}`, delta: 15, positive: true },
        { label: isRTL ? 'أيام الاستمرار' : 'Streak',      val: `${streak + 30}${isRTL ? ' يوم' : 'd'}`,                 delta: 30, positive: true },
        { label: isRTL ? 'المستوى' : 'Level',              val: `LV ${level + 3}`,                                        delta: 3,  positive: true },
        { label: isRTL ? 'عدد الجلسات' : 'Sessions',       val: `${sessionCount + 30}`,                                  delta: 30, positive: true },
      ]
    },
  ];
}

export default function ParallelMePage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const data = useMemo(() => getRealStudyData(), []);
  const timelines = useMemo(() => buildTimelines(data, isRTL), [data, isRTL]);
  const [selected, setSelected] = useState('best');

  const active = timelines.find(t => t.id === selected) || timelines[0];

  return (
    <div className={`parallel-me ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="parallel-header">
        <h1>
          <GiPortal style={{ display: 'inline', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem', verticalAlign: 'middle' }} />
          {isRTL ? 'أنا الموازي — عوالمك البديلة' : 'Parallel Me'}
        </h1>
        <p>
          {isRTL
            ? '8 نسخ بديلة منك بناءً على مسارات وقرارات مختلفة — استكشف أكوان إمكاناتك وقدراتك'
            : '8 alternate versions of you based on different choices — explore the multiverse of your potential'}
        </p>
        <span className="parallel-badge">
          <GiMultipleTargets style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
          {isRTL ? 'تحليل الأبعاد الموازية (8 عوالم)' : 'Multiverse Analysis (8 Timelines)'}
        </span>
      </div>

      {/* ── Timeline Selector ── */}
      <div className="parallel-portal-section">
        <div className="parallel-timelines">
          {timelines.map(t => (
            <div
              key={t.id}
              className={`parallel-timeline-card ${selected === t.id ? 'active' : ''}`}
              data-type={t.type}
              onClick={() => setSelected(t.id)}
            >
              <div className="parallel-card-icon" style={{ color: t.color }}>{t.icon}</div>
              <div className="parallel-card-name">{t.name}</div>
              <div className="parallel-card-label">{t.label}</div>
              <div className="parallel-card-stat" style={{ color: t.color }}>{t.stat}</div>
              <div className="parallel-card-stat-label">{t.statLabel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail Panel ── */}
      {active && (
        <div
          className="parallel-detail"
          style={{ background: active.accentBg, borderColor: active.accentBorder }}
        >
          <div className="parallel-detail-header">
            <div className="parallel-detail-icon" style={{ color: active.color }}>{active.icon}</div>
            <div>
              <div className="parallel-detail-title" style={{ color: active.color }}>{active.name}</div>
              <p className="parallel-detail-sub">{active.description}</p>
            </div>
          </div>

          <div className="parallel-compare-grid">
            {active.metrics.map(m => (
              <div className="parallel-compare-item" key={m.label}>
                <div className="parallel-compare-label">{m.label}</div>
                <div className="parallel-compare-val" style={{ color: active.color }}>{m.val}</div>
                {m.delta !== 0 ? (
                  <div className={`parallel-compare-delta ${m.positive ? 'positive' : 'negative'}`}>
                    {m.positive ? <FaArrowUp /> : <FaArrowDown />}
                    {' '}{m.delta > 0 ? '+' : ''}{m.delta}
                  </div>
                ) : (
                  <div className="parallel-compare-delta neutral">
                    <FaMinus /> {isRTL ? 'الخط المرجعي' : 'baseline'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {active.id !== 'current' && (
            <div
              className="parallel-divergence-note"
              style={{ [isRTL ? 'borderRight' : 'borderLeft']: `4px solid ${active.color}` }}
            >
              <FaInfoCircle style={{ color: active.color, flexShrink: 0, fontSize: '1.1rem' }} />
              <span>
                {isRTL
                  ? 'تفرع هذا المسار الزمني قبل 30 يومًا. كل قرار تتخذه اليوم يقرّبك خطوة من إحدى هذه النسخ.'
                  : 'This timeline diverged 30 days ago. Every choice you make today shifts you closer to one of these versions.'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
