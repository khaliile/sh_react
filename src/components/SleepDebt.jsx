import { useMemo } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';
import { todayKey } from '../utils/dateKey';
import { useLanguage } from '../contexts/LanguageContext';

const IDEAL = 8;

function calcDebt(sleepLog) {
  const keys = Object.keys(sleepLog).sort();
  let debt = 0;
  for (const key of keys) {
    const slept = parseFloat(sleepLog[key]) || 0;
    debt += IDEAL - slept;          // accumulate
    debt = Math.max(0, debt * 0.8); // partial overnight recovery
  }
  return Math.round(Math.max(0, debt) * 10) / 10;
}

function getCapacity(debt) {
  return Math.max(40, Math.round(100 - debt * 12));
}

const RECS = [
  { min: 85, text: 'Learn new material', icon: '+', color: '#10b981' },
  { min: 65, text: 'Practice problems', icon: '~', color: '#f59e0b' },
  { min: 0,  text: 'Review only — rest tonight', icon: '-', color: '#ef4444' },
];

export default function SleepDebt() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const todayKey_ = todayKey();
  const [sleepLog, setSleepLog] = useAppStorage('app_sleep_log', {});
  const todaySleep = sleepLog[todayKey_] ?? 7;

  const logSleep = (val) => setSleepLog(prev => ({ ...prev, [todayKey_]: parseFloat(val) }));

  const debt = useMemo(() => calcDebt(sleepLog), [sleepLog]);
  const capacity = getCapacity(debt);
  
  const RECS = [
    { min: 85, text: isAr ? 'تعلم مواد جديدة' : 'Learn new material', icon: '+', color: '#10b981' },
    { min: 65, text: isAr ? 'حل تمارين' : 'Practice problems', icon: '~', color: '#f59e0b' },
    { min: 0,  text: isAr ? 'مراجعة فقط — ارتح الليلة' : 'Review only — rest tonight', icon: '-', color: '#ef4444' },
  ];
  
  const rec = RECS.find(r => capacity >= r.min);

  const weekAvg = useMemo(() => {
    const vals = Object.entries(sleepLog)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7)
      .map(([, v]) => parseFloat(v));
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : null;
  }, [sleepLog]);

  const daysLogged = Object.keys(sleepLog).length;

  return (
    <div className="arena-card sleep-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">{isAr ? 'حاسبة ديون النوم' : 'Sleep Debt Calculator'}</h3>
          <p className="arena-card-sub">{isAr ? 'القدرة المعرفية بناءً على علم النوم' : 'Cognitive capacity based on sleep science'}</p>
        </div>
        <div className="sleep-cap-badge" style={{ color: rec.color, background: rec.color + '22' }}>
          {capacity}%
        </div>
      </div>

      <div className="sleep-body">
        {/* Brain battery */}
        <div className="sleep-battery-wrap">
          <div className="sleep-battery">
            <div className="sleep-battery-nub" />
            <div className="sleep-battery-inner">
              <div
                className="sleep-battery-fill"
                style={{
                  height: `${capacity}%`,
                  background: `linear-gradient(to top, ${rec.color}, ${rec.color}99)`,
                  boxShadow: `0 0 12px ${rec.color}66`,
                }}
              />
              <div className="sleep-battery-pct">{capacity}%</div>
            </div>
          </div>
          <div className="sleep-rec-box">
            <div className="sleep-rec-icon">{rec.icon}</div>
            <div className="sleep-rec-label">{isAr ? 'توصية اليوم' : "Today's recommendation"}</div>
            <div className="sleep-rec-text" style={{ color: rec.color }}>{rec.text}</div>
          </div>
        </div>

        {/* Sleep input */}
        <div className="sleep-input-section">
          <div className="sleep-input-label">
            {isAr ? 'نوم الليلة الماضية: ' : "Last night's sleep: "}
            <strong style={{ color: rec.color }}>{todaySleep}h</strong>
          </div>
          <input
            type="range"
            min="3" max="12" step="0.5"
            value={todaySleep}
            onChange={e => logSleep(e.target.value)}
            className="sleep-slider"
            style={{ '--sc': rec.color }}
          />
          <div className="sleep-slider-labels">
            <span>3h</span>
            <span>6h</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>
              {isAr ? '8س (مثالي)' : '8h (ideal)'}
            </span>
            <span>10h</span>
            <span>12h</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="sleep-stats">
        <div className="sleep-stat">
          <span className="ss-val">{debt}h</span>
          <span className="ss-lbl">{isAr ? 'ديون النوم' : 'Sleep debt'}</span>
        </div>
        <div className="sleep-stat">
          <span className="ss-val">{weekAvg !== null ? `${weekAvg}h` : '—'}</span>
          <span className="ss-lbl">{isAr ? 'متوسط 7 أيام' : '7-day avg'}</span>
        </div>
        <div className="sleep-stat">
          <span className="ss-val">{daysLogged}</span>
          <span className="ss-lbl">{isAr ? 'أيام مسجلة' : 'Days tracked'}</span>
        </div>
      </div>
    </div>
  );
}
