import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FaDna, FaFlask, FaBrain, FaClock, FaFire, FaBolt,
  FaAtom, FaStar, FaChartBar, FaRedo, FaLock, FaUnlock
} from 'react-icons/fa';
import { GiDna1, GiMolecule, GiDna2 } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealStudyData } from '../utils/studyDataService';
import './DNALabPage.css';

const SUBJECTS_DATA = [
  { key: 'math',       labelEn: 'Mathematics',    labelAr: 'الرياضيات',        color: '#00ffcc', color2: '#00c3ff' },
  { key: 'coding',     labelEn: 'Programming',    labelAr: 'البرمجة',          color: '#a78bfa', color2: '#7c3aed' },
  { key: 'science',    labelEn: 'Science',        labelAr: 'العلوم',           color: '#34d399', color2: '#059669' },
  { key: 'english',    labelEn: 'English',        labelAr: 'اللغة الإنجليزية', color: '#fbbf24', color2: '#f59e0b' },
  { key: 'ds',         labelEn: 'Data Science',   labelAr: 'علوم البيانات',    color: '#f472b6', color2: '#ec4899' },
  { key: 'focus',      labelEn: 'Deep Focus',     labelAr: 'التركيز العميق',   color: '#60a5fa', color2: '#3b82f6' },
];

const MUTATIONS_DATA = [
  { id: 'night-owl', labelEn: 'Night Owl', labelAr: 'بومة الليل', effectEn: '+20% evening focus', effectAr: '+20% تركيز مسائي', icon: <FaBolt /> },
  { id: 'marathon',  labelEn: 'Marathon',  labelAr: 'العداء الطويل', effectEn: '+15% long sessions', effectAr: '+15% للجلسات الطويلة', icon: <FaFire /> },
  { id: 'sprinter',  labelEn: 'Sprinter',  labelAr: 'العداء السريع', effectEn: '+30% short bursts', effectAr: '+30% للجلسات السريعة', icon: <FaBolt /> },
  { id: 'polymath',  labelEn: 'Polymath',  labelAr: 'الموسوعي',    effectEn: '+10% all subjects',  effectAr: '+10% لكل المواد', icon: <FaBrain /> },
];

function DNAHelixSVG({ traits, animate }) {
  const width = 260;
  const height = 420;
  const cx = width / 2;
  const steps = 14;
  const stepH = height / steps;
  const amplitude = 60;

  const nodes = useMemo(() => {
    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps;
      const y = i * stepH;
      const xA = cx + Math.sin(t * Math.PI * 3) * amplitude;
      const xB = cx - Math.sin(t * Math.PI * 3) * amplitude;
      const subIdx = i % SUBJECTS_DATA.length;
      return { y, xA, xB, color: SUBJECTS_DATA[subIdx].color, color2: SUBJECTS_DATA[subIdx].color2 };
    });
  }, []);

  return (
    <svg className="dna-helix-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <filter id="dna-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="dnaGradA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00ffcc" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="dnaGradB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00c3ff" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {/* Strand A */}
      <polyline
        points={nodes.map(n => `${n.xA},${n.y}`).join(' ')}
        fill="none"
        stroke="url(#dnaGradA)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#dna-glow)"
        opacity="0.9"
      />
      {/* Strand B */}
      <polyline
        points={nodes.map(n => `${n.xB},${n.y}`).join(' ')}
        fill="none"
        stroke="url(#dnaGradB)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#dna-glow)"
        opacity="0.9"
      />

      {/* Base Pairs */}
      {nodes.slice(0, -1).map((n, i) => {
        const next = nodes[i + 1];
        const midY = (n.y + next.y) / 2;
        const midXA = (n.xA + next.xA) / 2;
        const midXB = (n.xB + next.xB) / 2;
        return (
          <line
            key={i}
            x1={midXA} y1={midY}
            x2={midXB} y2={midY}
            stroke={n.color}
            strokeWidth="1.5"
            opacity="0.5"
            strokeDasharray="4 3"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.xA} cy={n.y} r="6" fill={n.color} filter="url(#dna-glow)" className={animate ? 'dna-node' : ''} />
          <circle cx={n.xB} cy={n.y} r="6" fill={n.color2} filter="url(#dna-glow)" className={animate ? 'dna-node' : ''} />
        </g>
      ))}
    </svg>
  );
}

export default function DNALabPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const data = useMemo(() => getRealStudyData(), []);
  const [activeMutation, setActiveMutation] = useState(null);
  const [animating, setAnimating] = useState(true);

  const traits = useMemo(() => {
    if (!data.hasAnyData) {
      return { consistency: 0, intensity: 0, breadth: 0, endurance: 0, focus: 0, rhythm: 0 };
    }
    return {
      consistency: Math.min(100, Math.round((data.streak / 14) * 100)),
      intensity: Math.min(100, Math.round((data.totalHours / 30) * 100)),
      breadth: Math.min(100, Math.round((Object.keys(data.subjectMap).length / 4) * 100)),
      endurance: Math.min(100, Math.round((data.totalHours / 20) * 100)),
      focus: Math.min(100, Math.round((data.todayMinutes / 120) * 100)),
      rhythm: Math.min(100, data.streak > 0 ? Math.min(100, data.streak * 15) : 0),
    };
  }, [data]);

  const barData = [
    { label: isRTL ? 'الاستمرارية' : 'Consistency', pct: traits.consistency, color: '#00ffcc' },
    { label: isRTL ? 'الكثافة' : 'Intensity',       pct: traits.intensity,   color: '#a78bfa' },
    { label: isRTL ? 'التنوع' : 'Breadth',           pct: traits.breadth,     color: '#f472b6' },
    { label: isRTL ? 'التحمل' : 'Endurance',         pct: traits.endurance,   color: '#fbbf24' },
    { label: isRTL ? 'التركيز' : 'Focus',           pct: traits.focus,       color: '#60a5fa' },
    { label: isRTL ? 'الإيقاع' : 'Rhythm',           pct: traits.rhythm,      color: '#34d399' },
  ];

  return (
    <div className={`dna-lab ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="dna-lab-header">
        <h1>
          <GiDna2 style={{ display: 'inline', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem', verticalAlign: 'middle' }} />
          {isRTL ? 'مختبر الحمض النووي' : 'DNA Lab'}
        </h1>
        <p>{isRTL ? 'هويتك الدراسية مشفرة في لولب حمض نووي حي وفريد' : 'Your study identity encoded as a living double helix'}</p>
        <span className="dna-lab-badge">
          <FaAtom style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
          {data.hasAnyData ? (isRTL ? 'التحليل الجيني نشط' : 'Genetic Analysis Active') : (isRTL ? 'في انتظار جلستك الأولى (0%)' : 'Awaiting first session (0%)')}
        </span>
      </div>

      <div className="dna-lab-grid">

        {/* ── Helix Section ── */}
        <div className="dna-helix-section">
          <div className="dna-helix-canvas-wrap">
            <DNAHelixSVG traits={traits} animate={animating} />
          </div>

          <div className="dna-helix-info">
            <h2>
              <GiDna1 style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
              {isRTL ? 'حمضك النووي الدراسي' : 'Your Study DNA'}
            </h2>
            <p>
              {isRTL
                ? 'يمثل كل زوج قاعدي في لولبك سمة دراسية فريدة. اللون والمسافات والالتواء تشفر عاداتك وساعات ذروتك وقوتك في المواد لتكوين بصمة وراثية خاصة بك.'
                : 'Each base pair on your helix represents a unique study trait. The color, spacing, and twist encode your habits, peak hours, and subject strengths into a one-of-a-kind genetic fingerprint.'}
            </p>

            <div className="dna-legend">
              {SUBJECTS_DATA.map(s => (
                <div className="dna-legend-item" key={s.key}>
                  <div className="dna-legend-dot" style={{ background: s.color, color: s.color }} />
                  <span className="dna-legend-label">{isRTL ? s.labelAr : s.labelEn}</span>
                  <span className="dna-legend-val" style={{ color: s.color }}>
                    {Math.round((data.subjectMap[s.key] || 0) / 3600 * 10) / 10}h
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setAnimating(a => !a)}
                style={{
                  background: 'rgba(0,255,204,0.1)', border: '1px solid rgba(0,255,204,0.3)',
                  color: '#00ffcc', borderRadius: '10px', padding: '0.5rem 1rem',
                  cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}
              >
                {animating ? <FaLock /> : <FaUnlock />}
                {animating
                  ? (isRTL ? 'إيقاف حركة اللولب' : 'Pause Helix')
                  : (isRTL ? 'تحريك اللولب' : 'Animate Helix')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Trait Bars ── */}
        <div className="dna-bar-section">
          <h3>
            <FaChartBar style={{ color: '#00ffcc' }} />
            {isRTL ? 'الملف الجيني للسمات' : 'Genetic Trait Profile'}
          </h3>
          {barData.map(b => (
            <div className="dna-bar-row" key={b.label}>
              <span className="dna-bar-label">{b.label}</span>
              <div className="dna-bar-track">
                <div
                  className="dna-bar-fill"
                  style={{ width: `${b.pct}%`, background: `linear-gradient(90deg, ${b.color}88, ${b.color})` }}
                />
              </div>
              <span className="dna-bar-pct">{Math.round(b.pct)}%</span>
            </div>
          ))}
        </div>

        {/* ── Quick Trait Cards ── */}
        <div className="dna-trait-card">
          <div className="dna-trait-icon"><FaClock /> {isRTL ? 'ساعة الذروة' : 'Peak Hour'}</div>
          <div className="dna-trait-title">{isRTL ? 'النمط الزمني' : 'Chronotype'}</div>
          <div className="dna-trait-value" style={{ color: '#00ffcc' }}>
            {data.hasAnyData ? `${data.peakHour}:00` : (isRTL ? 'في الانتظار' : 'Pending')}
          </div>
          <p className="dna-trait-desc">
            {data.hasAnyData
              ? (isRTL
                ? `يظهر حمضك النووي أعلى تنشيط عصبي في ساعات ${data.peakHour >= 18 ? 'المساء' : 'ما بعد الظهر'}.`
                : `Your DNA shows peak neural activation at ${data.peakHour >= 18 ? 'evening' : 'afternoon'} hours.`)
              : (isRTL
                ? 'ابدأ جلساتك الأولى ليحدد التطبيق ساعات ذروتك العصبية.'
                : 'Log sessions to discover your peak neural focus window.')}
          </p>
        </div>

        <div className="dna-trait-card">
          <div className="dna-trait-icon"><FaFire /> {isRTL ? 'جين الاستمرار' : 'Streak Gene'}</div>
          <div className="dna-trait-title">{isRTL ? 'أليل المواظبة' : 'Consistency Allele'}</div>
          <div className="dna-trait-value" style={{ color: '#fbbf24' }}>
            {data.streak}{isRTL ? ' يوم' : 'd'}
          </div>
          <p className="dna-trait-desc">
            {data.streak >= 7
              ? (isRTL ? 'جين مواظبة سائد — سمة نادرة وقوية.' : 'Dominant consistency gene — rare trait.')
              : data.streak > 0
              ? (isRTL ? 'جين مواظبة متنحي — قابل للترقية.' : 'Recessive streak gene — can be upgraded.')
              : (isRTL ? 'لم تبدأ السلسلة بعد. أول يوم دراسي ينشط الجين.' : 'Streak not started yet. Day 1 activates this gene.')}
          </p>
        </div>

        <div className="dna-trait-card">
          <div className="dna-trait-icon"><GiMolecule /> {isRTL ? 'إجمالي المعرفة' : 'Total Synthesis'}</div>
          <div className="dna-trait-title">{isRTL ? 'جزيئات التعلم' : 'Knowledge Molecules'}</div>
          <div className="dna-trait-value" style={{ color: '#a78bfa' }}>
            {data.totalHours}{isRTL ? ' س' : 'h'}
          </div>
          <p className="dna-trait-desc">
            {isRTL ? 'إجمالي الساعات المعرفية المركبة في الذاكرة طويلة المدى.' : 'Total study hours synthesized into long-term memory.'}
          </p>
        </div>

        <div className="dna-trait-card">
          <div className="dna-trait-icon"><FaStar /> {isRTL ? 'رتبة الجينوم' : 'DNA Grade'}</div>
          <div className="dna-trait-title">{isRTL ? 'تقييم الحمض النووي' : 'Genome Score'}</div>
          <div className="dna-trait-value" style={{ color: '#f472b6' }}>
            {!data.hasAnyData ? 'C' : data.streak >= 14 ? 'S+' : data.streak >= 7 ? 'A' : data.streak >= 3 ? 'B' : 'C'}
          </div>
          <p className="dna-trait-desc">
            {data.hasAnyData
              ? (isRTL ? 'الدرجة المركبة الناتجة عن تعبيرات السمات الحقيقية.' : 'Composite grade from real trait expressions.')
              : (isRTL ? 'رتبة البداية للمتعلمين الجدد. ترتفع مع الجلسات.' : 'Starting tier for new learners. Levels up with study.')}
          </p>
        </div>

        {/* ── Mutations ── */}
        <div className="dna-mutation-section">
          <h3>
            <FaFlask style={{ color: '#a78bfa' }} />
            {isRTL ? 'الطفرات السلوكية — انقر للتفعيل' : 'Behavioral Mutations — Click to Activate'}
          </h3>
          <div className="dna-mutation-grid">
            {MUTATIONS_DATA.map(m => (
              <div
                key={m.id}
                className={`dna-mutation-item ${activeMutation === m.id ? 'active' : ''}`}
                onClick={() => setActiveMutation(activeMutation === m.id ? null : m.id)}
              >
                <span className="dna-mutation-emoji">{m.icon}</span>
                <span className="dna-mutation-name">{isRTL ? m.labelAr : m.labelEn}</span>
                <span className="dna-mutation-effect">{isRTL ? m.effectAr : m.effectEn}</span>
              </div>
            ))}
          </div>
          {activeMutation && (
            <div style={{
              marginTop: '1rem', padding: '0.75rem 1rem',
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '10px', color: '#a78bfa', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <FaRedo />
              {isRTL
                ? <span>تم تفعيل طفرة <strong>{MUTATIONS_DATA.find(m => m.id === activeMutation)?.labelAr}</strong>. جارٍ إعادة ضبط اللولب...</span>
                : <span>Mutation <strong>{MUTATIONS_DATA.find(m => m.id === activeMutation)?.labelEn}</strong> applied. Helix reconfiguring...</span>}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
