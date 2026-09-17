import { useMemo } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';
import { useLanguage } from '../contexts/LanguageContext';

function variance(arr) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length;
}

function computeEntropy(sessions) {
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const recent = (sessions || []).filter(s => s.ts > cutoff);
  if (recent.length < 2) return { score: null, timeVar: 0, lengthVar: 0, variety: 0, categories: [] };

  // Hour-of-day variance: std across sessions (max possible variance ~36 for 0-23 uniform)
  const hours = recent.map(s => new Date(s.ts).getHours());
  const timeVar = Math.min(variance(hours) / 36, 1);

  // Session length variance: std across sessions
  const lengths = recent.map(s => s.minutes || 0);
  const lengthVar = Math.min(variance(lengths) / 3600, 1);

  // Subject variety: unique categories / 4
  const cats = new Set(recent.map(s => s.category || 'study'));
  const variety = Math.min(cats.size / 4, 1);

  const raw = timeVar * 40 + lengthVar * 35 + variety * 25;
  const score = Math.round(Math.min(100, Math.max(0, raw * 100)));

  return {
    score,
    timeVar: Math.round(timeVar * 100),
    lengthVar: Math.round(lengthVar * 100),
    variety: Math.round(variety * 100),
    categories: [...cats],
  };
}

export default function EntropyScore() {
  const [log] = useAppStorage('app_time_log', { byDate: {}, sessions: [] });
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const result = useMemo(() => computeEntropy(log.sessions), [log.sessions]);

  if (result.score === null) {
    return (
      <div className="arena-card entropy-card">
        <div className="arena-card-header">
          <div>
            <h3 className="arena-card-title">{isAr ? 'درجة العشوائية' : 'Entropy Score'}</h3>
            <p className="arena-card-sub">{isAr ? 'تحليل الأنماط الدراسية: فوضوية مقابل صارمة' : 'Chaotic vs. rigid study pattern analysis'}</p>
          </div>
        </div>
        <div className="entropy-empty">
          <div className="entropy-empty-icon">~</div>
          <p>{isAr ? 'سجل جلستين على الأقل لحساب درجة العشوائية.' : 'Log at least 2 sessions to calculate your entropy.'}</p>
        </div>
      </div>
    );
  }

  const { score, timeVar, lengthVar, variety, categories } = result;
  const zone = score < 25 ? 'robot' : score > 65 ? 'chaos' : 'green';
  const ZONES = {
    robot: { 
      label: isAr ? 'وضع الروبوت' : 'Robot Mode',
      color: '#ef4444',
      desc: isAr ? 'صارم جداً — جدولك بلا تنوع. غيّر أوقات وطول الجلسات لتجنب الإرهاق.' : 'Too rigid — your schedule has zero variety. Mix up session times and lengths to avoid burnout.'
    },
    green: { 
      label: isAr ? 'المنطقة الخضراء' : 'Green Zone',
      color: '#10b981',
      desc: isAr ? 'توازن مثالي بين الاتساق والتنوع. هنا يعمل ذوو الأداء الأفضل.' : 'Perfect balance of consistency and variety. This is where peak performers operate.'
    },
    chaos: { 
      label: isAr ? 'وضع الفوضى' : 'Chaos Mode',
      color: '#f59e0b',
      desc: isAr ? 'مشتت جداً — اصنع كتل أكثر قابلية للتنبؤ. الاتساق يبني الزخم.' : 'Too scattered — build more predictable blocks. Consistency builds momentum.'
    },
  };
  const cfg = ZONES[zone];

  // Needle position: 0 deg = leftmost, 180 deg = rightmost
  const needleAngle = (score / 100) * 180;
  const rad = (needleAngle - 180) * (Math.PI / 180);
  const nx = 100 + 65 * Math.cos(rad);
  const ny = 100 + 65 * Math.sin(rad);

  return (
    <div className="arena-card entropy-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">{isAr ? 'درجة العشوائية' : 'Entropy Score'}</h3>
          <p className="arena-card-sub">{isAr ? 'ما مدى فوضوية أو صرامة أنماط دراستك؟' : 'How chaotic vs. rigid are your study patterns?'}</p>
        </div>
        <div className="entropy-badge" style={{ color: cfg.color, background: cfg.color + '22' }}>
          {cfg.label}
        </div>
      </div>

      <div className="entropy-gauge-wrap">
        <svg className="entropy-gauge" viewBox="0 0 200 110" aria-label={`Entropy score: ${score}`}>
          {/* Background arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e1e2e" strokeWidth="16" strokeLinecap="round"/>
          {/* Zone arcs */}
          <path d="M 20 100 A 80 80 0 0 1 76 28.6" fill="none" stroke="#ef444433" strokeWidth="16" strokeLinecap="round"/>
          <path d="M 76 28.6 A 80 80 0 0 1 124 28.6" fill="none" stroke="#10b98133" strokeWidth="16" strokeLinecap="round"/>
          <path d="M 124 28.6 A 80 80 0 0 1 180 100" fill="none" stroke="#f59e0b33" strokeWidth="16" strokeLinecap="round"/>
          {/* Zone labels */}
          <text x="14" y="116" textAnchor="middle" fill="#ef4444" fontSize="7" fontWeight="600">ROBOT</text>
          <text x="100" y="14" textAnchor="middle" fill="#10b981" fontSize="7" fontWeight="600">ZONE</text>
          <text x="186" y="116" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="600">CHAOS</text>
          {/* Needle */}
          <line x1="100" y1="100" x2={nx} y2={ny} stroke={cfg.color} strokeWidth="3" strokeLinecap="round"/>
          <circle cx="100" cy="100" r="7" fill={cfg.color} opacity="0.9"/>
          {/* Score */}
          <text x="100" y="86" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="800">{score}</text>
          <text x="100" y="97" textAnchor="middle" fill="#666" fontSize="8">/100</text>
        </svg>
      </div>

      <p className="entropy-desc">{cfg.desc}</p>

      <div className="entropy-factors">
        {[
          { label: isAr ? 'تنوع الوقت' : 'Time Variety', val: timeVar, color: '#3b82f6' },
          { label: isAr ? 'تنوع المدة' : 'Length Variety', val: lengthVar, color: '#8b5cf6' },
          { label: isAr ? 'مزيج المواد' : 'Subject Mix', val: variety, color: '#10b981' },
        ].map(f => (
          <div key={f.label} className="entropy-factor">
            <span className="ef-label">{f.label}</span>
            <div className="ef-bar">
              <div className="ef-fill" style={{ width: `${f.val}%`, background: f.color }} />
            </div>
            <span className="ef-val">{f.val}%</span>
          </div>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="entropy-cats">
          {categories.map(c => (
            <span key={c} className="entropy-cat-chip">{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}
