import React, { useMemo, useState, useEffect } from 'react';
import {
  FaBroadcastTower, FaWifi, FaSignal, FaCalendarAlt,
  FaClock, FaFire, FaChartBar, FaCircle
} from 'react-icons/fa';
import { GiRadioTower, GiSoundWaves } from 'react-icons/gi';
import { MdSignalCellular4Bar } from 'react-icons/md';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealStudyData } from '../utils/studyDataService';
import './SignalTowerPage.css';

const DAYS_DATA = [
  { en: 'Mon', ar: 'الإثنين' },
  { en: 'Tue', ar: 'الثلاثاء' },
  { en: 'Wed', ar: 'الأربعاء' },
  { en: 'Thu', ar: 'الخميس' },
  { en: 'Fri', ar: 'الجمعة' },
  { en: 'Sat', ar: 'السبت' },
  { en: 'Sun', ar: 'الأحد' },
];

const NUM_BARS = 32;

function getSignalStrength(sig, isRTL) {
  if (sig >= 75) return { label: isRTL ? 'إشارة قوية جداً' : 'Strong Signal', cls: 'strong' };
  if (sig >= 45) return { label: isRTL ? 'إشارة معتدلة' : 'Moderate Signal', cls: 'moderate' };
  if (sig >= 20) return { label: isRTL ? 'إشارة ضعيفة' : 'Weak Signal', cls: 'weak' };
  if (sig > 0) return { label: isRTL ? 'إشارة متقطعة' : 'Faint Signal', cls: 'weak' };
  return { label: isRTL ? 'انقطاع البث (0%)' : 'No Signal (0%)', cls: 'silent' };
}

function SpectrumBars({ signal }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 120);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="signal-spectrum">
      {Array.from({ length: NUM_BARS }, (_, i) => {
        const center = NUM_BARS / 2;
        const dist = Math.abs(i - center) / center;
        const base = signal / 100;
        const noise = Math.sin((i + tick) * 0.4) * 0.15 + Math.sin((i * 1.3 + tick * 0.7)) * 0.1;
        const height = Math.max(6, (base * (1 - dist * 0.4) + noise) * 100);

        const hue = 180 + dist * 40;
        const sat = 70 + base * 30;
        return (
          <div
            key={i}
            className="signal-bar"
            style={{
              height: `${height}%`,
              background: `hsl(${hue}, ${sat}%, ${35 + base * 25}%)`,
              animationDelay: `${i * 0.04}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function SignalTowerPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const data = useMemo(() => getRealStudyData(), []);
  const signal = data.hasAnyData
    ? Math.min(100, Math.round((data.streak / 14) * 50 + (data.totalHours / 20) * 50))
    : 0;
  const strength = getSignalStrength(signal, isRTL);

  const freqLabels = ['88.0', '92.0', '96.0', '100.0', '104.0'];

  return (
    <div className={`signal-tower ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="signal-header">
        <h1>
          <GiRadioTower style={{ display: 'inline', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem', verticalAlign: 'middle' }} />
          {isRTL ? 'برج الإشارة — بث الانضباط' : 'Signal Tower'}
        </h1>
        <p>
          {isRTL
            ? 'بث حي لمواظبتك وعاداتك اليومية — ما مدى قوة إرسالك وتردد إنجازك؟'
            : 'Your daily habit consistency broadcast — how strong is your transmission?'}
        </p>
        <span className="signal-badge">
          <FaBroadcastTower style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
          {isRTL ? 'البث المباشر نشط' : 'Live Broadcasting'}
        </span>
      </div>

      {/* ── Main Signal Meter ── */}
      <div className="signal-meter-section">
        <div className="signal-meter-header">
          <h2>
            <GiSoundWaves style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
            {isRTL ? 'طيف الترددات الذهنية' : 'Frequency Spectrum'}
          </h2>
          <div className={`signal-strength-badge ${strength.cls}`}>
            <FaSignal style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} /> {strength.label}
          </div>
        </div>

        <div className="signal-big-num">
          <div className="val">{signal}%</div>
          <div className="label">
            <FaCircle style={{ fontSize: '0.5rem', color: '#22d3ee', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
            {isRTL ? 'قوة الإشارة الإجمالية' : 'Signal Strength'}
          </div>
        </div>

        <SpectrumBars signal={signal} />

        <div className="signal-freq-row">
          {freqLabels.map(f => <span key={f}>{f} MHz</span>)}
        </div>
      </div>

      {/* ── Week Grid ── */}
      <div className="signal-week-grid">
        <h3>
          <FaCalendarAlt style={{ color: '#22d3ee', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
          {isRTL ? 'قوة الإشارة على مدار الأسبوع' : 'Weekly Signal Strength'}
        </h3>
        {DAYS_DATA.map((d, i) => {
          const val = data.byDay[i] || 0;
          const pct = Math.round((val / data.maxDay) * 100);
          const bars = 20;
          const filled = Math.round((pct / 100) * bars);
          const dayName = isRTL ? d.ar : d.en;
          return (
            <div className="signal-day-row" key={d.en}>
              <span className="signal-day-label">{dayName}</span>
              <div className="signal-day-bars">
                {Array.from({ length: bars }, (_, j) => {
                  const active = j < filled;
                  const hue = active ? 180 : 215;
                  return (
                    <div
                      key={j}
                      className="signal-day-bar"
                      style={{
                        background: active
                          ? `hsl(${hue}, 80%, ${40 + (j / bars) * 20}%)`
                          : 'rgba(255,255,255,0.05)'
                      }}
                    />
                  );
                })}
              </div>
              <span className="signal-day-pct">{val.toFixed(1)}{isRTL ? ' س' : 'h'}</span>
            </div>
          );
        })}
      </div>

      {/* ── Stats ── */}
      <div className="signal-stats">
        <div className="signal-stat">
          <div className="signal-stat-icon"><FaFire /></div>
          <div className="signal-stat-val">{data.streak}{isRTL ? ' يوم' : 'd'}</div>
          <div className="signal-stat-label">{isRTL ? 'أيام الاستمرار' : 'Streak'}</div>
        </div>
        <div className="signal-stat">
          <div className="signal-stat-icon"><FaClock /></div>
          <div className="signal-stat-val">{Math.round(data.totalHours)}{isRTL ? ' س' : 'h'}</div>
          <div className="signal-stat-label">{isRTL ? 'إجمالي الساعات' : 'Total Hours'}</div>
        </div>
        <div className="signal-stat">
          <div className="signal-stat-icon"><FaChartBar /></div>
          <div className="signal-stat-val">{data.sessionCount}</div>
          <div className="signal-stat-label">{isRTL ? 'الجلسات' : 'Sessions'}</div>
        </div>
        <div className="signal-stat">
          <div className="signal-stat-icon"><MdSignalCellular4Bar style={{ fontSize: '1.3rem' }} /></div>
          <div className="signal-stat-val">{signal}%</div>
          <div className="signal-stat-label">{isRTL ? 'الإشارة' : 'Signal'}</div>
        </div>
      </div>
    </div>
  );
}
