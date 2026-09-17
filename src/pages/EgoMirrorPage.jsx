import React, { useState, useMemo } from 'react';
import {
  FaChartBar, FaBrain, FaBolt, FaFire, FaClock,
  FaCheckCircle, FaTimesCircle, FaBalanceScale, FaInfoCircle, FaEye, FaExclamationCircle
} from 'react-icons/fa';
import { GiMirrorMirror, GiCrystalBall } from 'react-icons/gi';
import { MdFlipToFront } from 'react-icons/md';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealStudyData } from '../utils/studyDataService';
import './EgoMirrorPage.css';

const TRAITS_DATA = [
  { key: 'consistency', labelEn: 'Consistency',    labelAr: 'الاستمرارية',        selfKey: 'self_consistency' },
  { key: 'discipline',  labelEn: 'Discipline',     labelAr: 'الانضباط الذاتي',     selfKey: 'self_discipline' },
  { key: 'focus',       labelEn: 'Deep Focus',     labelAr: 'التركيز العميق',      selfKey: 'self_focus' },
  { key: 'creativity',  labelEn: 'Creativity',     labelAr: 'التنوع والإبداع',    selfKey: 'self_creativity' },
  { key: 'speed',       labelEn: 'Learning Speed', labelAr: 'سرعة التعلم',        selfKey: 'self_speed' },
  { key: 'resilience',  labelEn: 'Resilience',     labelAr: 'الصمود والمواظبة',    selfKey: 'self_resilience' },
];

function calculateDataTraits(data) {
  if (!data.hasAnyData) {
    return {
      consistency: 0,
      discipline: 0,
      focus: 0,
      creativity: 0,
      speed: 0,
      resilience: 0,
    };
  }

  const { streak, totalHours, completedTasksCount, subjectMap } = data;
  const numSubjects = Object.keys(subjectMap || {}).length;

  return {
    consistency: Math.min(100, Math.round((streak / 14) * 100)),
    discipline:  Math.min(100, Math.round((completedTasksCount / 10) * 100)),
    focus:       Math.min(100, Math.round((totalHours / 20) * 100)),
    creativity:  Math.min(100, Math.round((numSubjects / 5) * 100)),
    speed:       Math.min(100, Math.round((totalHours / 15) * 100)),
    resilience:  Math.min(100, streak >= 3 ? 50 + streak * 5 : streak * 15),
  };
}

function readSelfTraits() {
  const result = {};
  TRAITS_DATA.forEach(t => {
    try {
      const stored = localStorage.getItem(t.selfKey);
      result[t.key] = stored !== null ? parseInt(stored, 10) : 70;
    } catch {
      result[t.key] = 70;
    }
  });
  return result;
}

function saveSelfTrait(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

function getDelta(self, data, hasAnyData, isRTL) {
  if (!hasAnyData) {
    return { label: isRTL ? 'في انتظار البيانات' : 'Pending Data', cls: 'neutral', icon: <FaInfoCircle /> };
  }
  if (self > data + 15) return { label: isRTL ? 'ثقة مفرطة' : 'Overconfident', cls: 'negative', icon: <FaTimesCircle /> };
  if (self < data - 15) return { label: isRTL ? 'تقليل من النفس' : 'Underestimating', cls: 'negative', icon: <FaTimesCircle /> };
  return { label: isRTL ? 'متطابق بدقة' : 'Calibrated', cls: 'positive', icon: <FaCheckCircle /> };
}

export default function EgoMirrorPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const realData = useMemo(() => getRealStudyData(), []);
  const dataTraits = useMemo(() => calculateDataTraits(realData), [realData]);
  const [selfTraits, setSelfTraits] = useState(readSelfTraits);
  const [revealed, setRevealed] = useState(false);

  const handleSelfChange = (key, selfKey, value) => {
    const val = Number(value);
    setSelfTraits(prev => ({ ...prev, [key]: val }));
    saveSelfTrait(selfKey, val);
  };

  const verdictMessage = useMemo(() => {
    if (!realData.hasAnyData) {
      return isRTL
        ? 'لا توجد جلسات دراسية أو مهام مسجلة حتى الآن في التطبيق (0 ساعة، 0 جلسات). تقديرك الذاتي مسجل باليسار، ولكن مرآة البيانات تبدأ من 0%. أنجز أولى جلساتك لتفعيل المقارنة الصادقة!'
        : 'No study sessions or tasks logged yet in the application (0 hours, 0 sessions). Your self-rating is saved on the left, but the real data mirror starts at 0%. Complete your first session to calibrate your honest comparison!';
    }

    const diffs = TRAITS_DATA.map(t => Math.abs((selfTraits[t.key] ?? 70) - (dataTraits[t.key] ?? 0)));
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

    if (isRTL) {
      if (avgDiff < 10) return 'وعي ذاتي استثنائي! تقييمك لنفسك يتطابق بدقة عالية مع بيانات أدائك الواقعية.';
      if (avgDiff < 20) return 'فروقات طفيفة بين التقدير والواقع. بعض السمات تختلف قليلاً عن أرقامك — راجع المقارنة بالأسفل.';
      if (avgDiff < 35) return 'فجوة متوسطة بين تصورك الذهني وواقع أرقامك. هذا النمط شائع جداً، استخدم البيانات لإعادة المعايرة.';
      return 'فجوة واسعة تم رصدها. تقييمك الشخصي وسجلات أدائك الفعلية تحكيان قصتين مختلفتين تماماً. واجه المرآة بصدق.';
    } else {
      if (avgDiff < 10) return 'You have excellent self-awareness. Your perception closely matches your actual performance data.';
      if (avgDiff < 20) return 'Slight miscalibration detected. Some traits differ from your data — examine the gaps below.';
      if (avgDiff < 35) return 'Moderate gap between self-image and reality. This is the most common pattern. Use the data to recalibrate.';
      return 'Significant gap detected. Your self-perception and performance data tell very different stories. Embrace the mirror.';
    }
  }, [selfTraits, dataTraits, realData, isRTL]);

  return (
    <div className={`ego-mirror ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="ego-mirror-header">
        <h1>
          <GiMirrorMirror style={{ display: 'inline', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem', verticalAlign: 'middle' }} />
          {isRTL ? 'مرآة الأنا الصادقة' : 'Ego Mirror'}
        </h1>
        <p>
          {isRTL
            ? 'مقارنة شفافة بين من تظن نفسك عليه وبين ما تكشفه بياناتك الفعلية'
            : 'Who you think you are vs who your data says you are'}
        </p>
        <span className="ego-badge">
          <FaEye style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
          {realData.hasAnyData
            ? (isRTL ? `${realData.totalHours} س و ${realData.completedTasksCount} مهمة مسجلة` : `${realData.totalHours}h & ${realData.completedTasksCount} tasks logged`)
            : (isRTL ? 'بيانات التطبيق فارغة حالياً (0%)' : 'App data is empty (0%)')}
        </span>
      </div>

      <div className="ego-split">
        {/* ── Left: Self Assessment ── */}
        <div className="ego-panel self">
          <div className="ego-panel-title">
            <FaBrain />
            {isRTL ? 'من تعتقد أنك أنت' : 'Who You Think You Are'}
          </div>
          <p className="ego-panel-sub">
            {isRTL ? 'حرّك المؤشرات لتقييم مستواك بصدق تام' : 'Drag each slider to rate yourself honestly'}
          </p>

          <div className="ego-trait-list">
            {TRAITS_DATA.map(t => {
              const val = selfTraits[t.key] ?? 70;
              const label = isRTL ? t.labelAr : t.labelEn;
              return (
                <div className="ego-trait-row" key={t.key}>
                  <span className="ego-trait-name">{label}</span>
                  <div className="ego-self-item">
                    <input
                      type="range" min="0" max="100" value={val}
                      className="ego-self-slider"
                      onChange={e => handleSelfChange(t.key, t.selfKey, e.target.value)}
                    />
                    <span className="ego-self-num">{val}%</span>
                  </div>
                  <div className="ego-trait-bar-wrap">
                    <div className="ego-trait-track">
                      <div className="ego-trait-fill" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="ego-divider">
          <div className="ego-divider-line" />
          <div className="ego-divider-icon"><FaBalanceScale /></div>
          <div className="ego-divider-line" />
        </div>

        {/* ── Right: Data Says ── */}
        <div className="ego-panel data">
          <div className="ego-panel-title">
            <FaChartBar />
            {isRTL ? 'ما تقوله البيانات الواقعية عنك' : 'What Data Says You Are'}
          </div>
          <p className="ego-panel-sub">
            {realData.hasAnyData
              ? (isRTL ? `محسوبة من ${realData.totalHours} ساعة و ${realData.completedTasksCount} مهمة` : `Calculated from ${realData.totalHours}h & ${realData.completedTasksCount} tasks`)
              : (isRTL ? 'لم يتم تسجيل ساعات أو مهام دراسية بعد (0%)' : 'No study hours or tasks logged yet (0%)')}
          </p>

          {!revealed ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <GiCrystalBall style={{ fontSize: '3rem', color: '#a855f7', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {isRTL
                  ? 'هل أنت مستعد لمواجهة أرقامك الواقعية المسجلة؟'
                  : 'Ready to see your real recorded numbers?'}
              </p>
              <button
                onClick={() => setRevealed(true)}
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  border: 'none', color: '#fff',
                  borderRadius: '12px', padding: '0.75rem 2rem',
                  cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: '0 0 20px rgba(168,85,247,0.4)'
                }}
              >
                <MdFlipToFront /> {isRTL ? 'كشف الحقيقة بالأرقام' : 'Reveal My Truth'}
              </button>
            </div>
          ) : (
            <div className="ego-trait-list">
              {TRAITS_DATA.map(t => {
                const val = Math.round(dataTraits[t.key] ?? 0);
                const label = isRTL ? t.labelAr : t.labelEn;
                return (
                  <div className="ego-trait-row" key={t.key}>
                    <span className="ego-trait-name">{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', width: '34px', textAlign: isRTL ? 'left' : 'right' }}>{val}%</span>
                    </div>
                    <div className="ego-trait-bar-wrap">
                      <div className="ego-trait-track">
                        <div className="ego-trait-fill" style={{ width: `${val}%` }} />
                      </div>
                      <span className="ego-trait-pct">{val}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Verdict ── */}
      {revealed && (
        <div className="ego-verdict">
          <div className="ego-verdict-title">
            <FaInfoCircle /> {isRTL ? 'الحكم التحليلي الصادق' : 'Analysis Verdict'}
          </div>
          <p className="ego-verdict-text">{verdictMessage}</p>
          <div className="ego-delta-grid">
            {TRAITS_DATA.map(t => {
              const selfVal = selfTraits[t.key] ?? 70;
              const dataVal = Math.round(dataTraits[t.key] ?? 0);
              const diff = selfVal - dataVal;
              const delta = getDelta(selfVal, dataVal, realData.hasAnyData, isRTL);
              const label = isRTL ? t.labelAr : t.labelEn;
              return (
                <div className="ego-delta-item" key={t.key}>
                  <div className="ego-delta-label">{label}</div>
                  <div className={`ego-delta-value ${!realData.hasAnyData ? 'neutral' : (diff > 15 ? 'negative' : diff < -15 ? 'negative' : 'positive')}`}>
                    {!realData.hasAnyData ? `${selfVal}%` : `${diff > 0 ? '+' : ''}${diff}%`}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    {delta.icon} {delta.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
