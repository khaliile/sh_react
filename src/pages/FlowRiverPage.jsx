import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FaWater, FaBolt, FaSnowflake, FaChartArea, FaTachometerAlt,
  FaHistory, FaPlay, FaPause, FaFire, FaBrain, FaStopwatch, FaInfoCircle
} from 'react-icons/fa';
import { GiWaves, GiRiver, GiWaterDrop } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealStudyData } from '../utils/studyDataService';
import './FlowRiverPage.css';

const DAYS_DATA = [
  { en: 'Mon', ar: 'الإثنين' },
  { en: 'Tue', ar: 'الثلاثاء' },
  { en: 'Wed', ar: 'الأربعاء' },
  { en: 'Thu', ar: 'الخميس' },
  { en: 'Fri', ar: 'الجمعة' },
  { en: 'Sat', ar: 'السبت' },
  { en: 'Sun', ar: 'الأحد' },
];

function getRiverState(speed, isRTL) {
  if (speed >= 75) return { label: isRTL ? 'تدفق عميق وقوي' : 'Deep Flow', cls: 'deep', icon: <FaBolt /> };
  if (speed >= 45) return { label: isRTL ? 'تركيز عالٍ' : 'Focused', cls: 'focused', icon: <FaFire /> };
  if (speed >= 20) return { label: isRTL ? 'تدفق هادئ' : 'Steady Flow', cls: 'scattered', icon: <FaBrain /> };
  if (speed > 0) return { label: isRTL ? 'جريان بطيء' : 'Slow Current', cls: 'scattered', icon: <GiWaterDrop /> };
  return { label: isRTL ? 'ساكن / في انتظار الجلسة' : 'Calm / Idle', cls: 'frozen', icon: <FaSnowflake /> };
}

function RiverSVG({ speed }) {
  const animDur = speed > 0 ? Math.max(0.6, 3.2 - (speed / 100) * 2.5) + 's' : '999s';
  const waveAmp = speed > 0 ? Math.max(6, (speed / 100) * 35) : 3;
  const opacity = speed > 0 ? 0.45 + (speed / 100) * 0.5 : 0.3;

  const buildWavePath = (offset, amp) => {
    const pts = [];
    for (let x = 0; x <= 900; x += 30) {
      const y = 110 + Math.sin((x / 120) + offset) * amp;
      pts.push(`${x},${y}`);
    }
    return `M0,200 L0,${110 - amp} C${pts.join(' ')} L900,200 Z`;
  };

  return (
    <svg className="flow-svg" viewBox="0 0 900 200" preserveAspectRatio="none">
      <defs>
        <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#0284c7" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="riverGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#0284c7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Back wave */}
      <path d={buildWavePath(0.5, waveAmp * 0.7)} fill="url(#riverGrad2)" opacity={opacity * 0.65}>
        <animate attributeName="d"
          values={`${buildWavePath(0, waveAmp * 0.7)};${buildWavePath(Math.PI, waveAmp * 0.7)};${buildWavePath(Math.PI * 2, waveAmp * 0.7)}`}
          dur={animDur} repeatCount="indefinite" />
      </path>

      {/* Main wave */}
      <path d={buildWavePath(0, waveAmp)} fill="url(#riverGrad)" opacity={opacity}>
        <animate attributeName="d"
          values={`${buildWavePath(0, waveAmp)};${buildWavePath(Math.PI, waveAmp)};${buildWavePath(Math.PI * 2, waveAmp)}`}
          dur={animDur} repeatCount="indefinite" />
      </path>

      {/* Shimmer highlights */}
      {speed > 25 && Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i}
          cx={100 + i * 150} cy={105 + (i % 3 - 1) * 12}
          rx="24" ry="4"
          fill="rgba(255,255,255,0.4)"
          opacity="0.75"
        >
          <animate attributeName="cx"
            values={`${-50 + i * 150};${900 + 50}`}
            dur={`${1.4 + i * 0.35}s`}
            begin={`${i * 0.3}s`}
            repeatCount="indefinite" />
        </ellipse>
      ))}

      {/* Ice/Frost overlay when 0 */}
      {speed === 0 && (
        <rect x="0" y="0" width="900" height="200"
          fill="rgba(224,242,254,0.18)"
          stroke="rgba(147,197,253,0.3)"
          strokeWidth="1"
        />
      )}
    </svg>
  );
}

export default function FlowRiverPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const data = useMemo(() => getRealStudyData(), []);

  // Compute real default flow speed based on today's study minutes vs daily goal
  const initialSpeed = useMemo(() => {
    if (!data.hasAnyData || data.todayMinutes === 0) return 0;
    const goalMins = (data.dailyGoalHours || 5) * 60;
    return Math.min(100, Math.max(15, Math.round((data.todayMinutes / goalMins) * 100)));
  }, [data]);

  const [speed, setSpeed] = useState(initialSpeed);
  const [isLive, setIsLive] = useState(false);
  const riverState = getRiverState(speed, isRTL);
  const maxDay = Math.max(...data.byDay, 0.1);

  // Live fluctuation when user enables live mode
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setSpeed(s => Math.max(10, Math.min(100, s + (Math.random() - 0.45) * 8)));
    }, 2000);
    return () => clearInterval(interval);
  }, [isLive]);

  const riverColors = ['#ef4444', '#f97316', '#fbbf24', '#4ade80', '#22d3ee', '#818cf8', '#f472b6'];

  return (
    <div className={`flow-river ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flow-river-header">
        <h1>
          <GiRiver style={{ display: 'inline', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem', verticalAlign: 'middle' }} />
          {isRTL ? 'نهر التدفق الذهني' : 'Flow River'}
        </h1>
        <p>
          {isRTL
            ? 'حالة تركيزك مجسدة كنهر يجري — يتدفق بقوة مع الاندماج ويهدأ حين تتوقف الجلسات'
            : 'Your focus state visualized as a living river — fast when deep, calm when idle'}
        </p>
        <span className="flow-badge">
          <GiWaves style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
          {data.todayMinutes > 0
            ? (isRTL ? `${data.todayHours} س مذاكرة اليوم` : `${data.todayHours}h studied today`)
            : (isRTL ? 'في انتظار جلستك الأولى اليوم' : 'Awaiting today session')}
        </span>
      </div>

      {/* ── Stats Row ── */}
      <div className="flow-stats-row">
        <div className="flow-stat-card">
          <div className="flow-stat-icon"><FaTachometerAlt /></div>
          <div className="flow-stat-value">{Math.round(speed)}%</div>
          <div className="flow-stat-label">{isRTL ? 'سرعة التدفق' : 'Flow Speed'}</div>
        </div>
        <div className="flow-stat-card">
          <div className="flow-stat-icon"><FaStopwatch /></div>
          <div className="flow-stat-value">{data.totalHours}{isRTL ? ' س' : 'h'}</div>
          <div className="flow-stat-label">{isRTL ? 'إجمالي التركيز' : 'Total Focus'}</div>
        </div>
        <div className="flow-stat-card">
          <div className="flow-stat-icon"><FaFire /></div>
          <div className="flow-stat-value">{data.streak}{isRTL ? ' يوم' : 'd'}</div>
          <div className="flow-stat-label">{isRTL ? 'أيام الاستمرار' : 'Streak'}</div>
        </div>
        <div className="flow-stat-card">
          <div className="flow-stat-icon"><GiWaterDrop /></div>
          <div className="flow-stat-value">{data.sessionCount}</div>
          <div className="flow-stat-label">{isRTL ? 'الجلسات المسجلة' : 'Sessions'}</div>
        </div>
      </div>

      {/* ── River Scene ── */}
      <div className="flow-river-scene">
        <div className="flow-scene-header">
          <h2>
            <FaWater style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
            {isRTL ? 'المحاكاة البصرية للنهر' : 'Live River Visualization'}
          </h2>
          <div className={`flow-state-badge ${riverState.cls}`}>
            {riverState.icon} &nbsp; {riverState.label}
          </div>
        </div>

        <div className="flow-svg-container">
          <RiverSVG speed={speed} />
        </div>

        <div className="flow-controls">
          <span className="flow-control-label">
            <FaTachometerAlt style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
            {isRTL ? 'محاكاة سرعة التدفق يدويًا:' : 'Simulate Flow Speed:'}
          </span>
          <input
            type="range" min="0" max="100" value={speed}
            className="flow-speed-slider"
            style={{ '--val': `${speed}%` }}
            onChange={e => { setSpeed(Number(e.target.value)); setIsLive(false); }}
          />
          <span className="flow-speed-value">{Math.round(speed)}%</span>
          <button
            onClick={() => setIsLive(l => !l)}
            style={{
              background: isLive ? 'rgba(34,197,94,0.15)' : 'rgba(14,165,233,0.1)',
              border: `1px solid ${isLive ? 'rgba(34,197,94,0.4)' : 'rgba(14,165,233,0.3)'}`,
              color: isLive ? '#4ade80' : '#0284c7',
              borderRadius: '8px', padding: '0.35rem 0.85rem',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.35rem'
            }}
          >
            {isLive ? <FaPause /> : <FaPlay />}
            {isLive ? (isRTL ? 'إيقاف المحاكاة' : 'Pause Live') : (isRTL ? 'محاكاة الجريان' : 'Go Live')}
          </button>
        </div>
      </div>

      {/* ── History Map ── */}
      <div className="flow-history-section">
        <h3>
          <FaHistory style={{ color: '#22d3ee', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
          {isRTL ? 'خريطة تدفق الأسبوع الحالي' : "This Week's Flow Map"}
        </h3>
        <div className="flow-map-grid">
          {DAYS_DATA.map((d, i) => {
            const val = data.byDay[i] || 0;
            const pct = data.maxDay > 0 ? (val / data.maxDay) * 100 : 0;
            const color = riverColors[i];
            const label = isRTL ? d.ar : d.en;
            return (
              <div className="flow-map-day" key={d.en}>
                <div className="flow-map-bar-wrap">
                  <div
                    className="flow-map-bar"
                    style={{
                      height: `${Math.max(val > 0 ? 10 : 4, pct)}%`,
                      background: val > 0 ? `linear-gradient(to top, ${color}88, ${color})` : 'rgba(100,116,139,0.15)',
                      boxShadow: val > 0 ? `0 0 12px ${color}44` : 'none'
                    }}
                    title={`${label}: ${val.toFixed(1)}${isRTL ? ' س' : 'h'}`}
                  />
                </div>
                <span className="flow-map-label">{label}</span>
                <span style={{ fontSize: '0.7rem', color: val > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>
                  {val.toFixed(1)}{isRTL ? ' س' : 'h'}
                </span>
              </div>
            );
          })}
        </div>
        {!data.hasAnyData && (
          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            <FaInfoCircle style={{ margin: '0 0.3rem', verticalAlign: 'middle' }} />
            {isRTL
              ? 'لم يتم تسجيل ساعات دراسية بعد في التطبيق. ابدأ جلسة من المؤقت أو الجدول لترى النهر يرتفع ويتدفق!'
              : 'No study hours logged yet in the application. Start a session from the Timer or Schedule to watch the river rise!'}
          </div>
        )}
      </div>
    </div>
  );
}
