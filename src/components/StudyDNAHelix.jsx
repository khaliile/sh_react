import { useMemo } from 'react';
import { useTimeTracker } from '../hooks/useAppHooks';
import { useLanguage } from '../contexts/LanguageContext';
import './StudyDNAHelix.css';

const SUBJECT_COLORS = {
  math:    '#ef4444',
  ds:      '#3b82f6',
  english: '#10b981',
  general: '#8b5cf6',
};

function getDominantSubject(sessions) {
  const counts = { math: 0, ds: 0, english: 0, general: 0 };
  sessions.forEach(s => {
    const cat = (s.category || 'general').toLowerCase();
    if (cat.includes('math')) counts.math++;
    else if (cat.includes('data') || cat.includes('science') || cat.includes('ds')) counts.ds++;
    else if (cat.includes('english') || cat.includes('lang')) counts.english++;
    else counts.general++;
  });
  return Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a, ['general', 0])[0];
}

export default function StudyDNAHelix() {
  const { log } = useTimeTracker();
  const { t } = useLanguage();

  const helixData = useMemo(() => {
    const byDate = log?.byDate || {};
    const sessions = log?.sessions || [];

    // Build last 30 days as "base pairs"
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const minutes = byDate[key] || 0;
      const daySessions = sessions.filter(s => s.date === key);
      const subject = getDominantSubject(daySessions);
      days.push({ key, minutes, subject, color: SUBJECT_COLORS[subject], date: d });
    }
    return days;
  }, [log]);

  const maxMinutes = Math.max(...helixData.map(d => d.minutes), 1);

  // SVG helix parameters
  const W = 600;
  const H = 320;
  const centerX = W / 2;
  const amplitude = 80;
  const verticalSpacing = H / helixData.length;

  const leftStrand = helixData.map((day, i) => {
    const t = (i / helixData.length) * Math.PI * 4; // 2 full twists
    const y = i * verticalSpacing + verticalSpacing / 2;
    const x = centerX + Math.sin(t) * amplitude;
    return { ...day, x, y, t };
  });

  const rightStrand = helixData.map((day, i) => {
    const t = (i / helixData.length) * Math.PI * 4 + Math.PI;
    const y = i * verticalSpacing + verticalSpacing / 2;
    const x = centerX + Math.sin(t) * amplitude;
    return { ...day, x, y, t };
  });

  return (
    <div className="dna-helix-card">
        <div className="dna-helix-title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12c0-4 4-8 10-8s10 4 10 8-4 8-10 8S2 16 2 12z"/>
            <path d="M12 4c2 2 4 5 4 8s-2 6-4 8"/>
            <path d="M12 4C10 6 8 9 8 12s2 6 4 8"/>
          </svg>
          {t('helixDNA.title')}
        </div>
        <div className="dna-helix-heading">{t('helixDNA.heading')}</div>
        <div className="dna-helix-sub">{t('helixDNA.sub')}</div>

        <div className="dna-legend">
          {Object.entries(SUBJECT_COLORS).map(([sub, color]) => (
            <div key={sub} className="dna-legend-item">
              <div className="dna-legend-dot" style={{ background: color }} />
              {sub.charAt(0).toUpperCase() + sub.slice(1)}
            </div>
          ))}
          <div className="dna-legend-item">
            <div className="dna-legend-dot" style={{ background: 'var(--border-color)' }} />
            {t('helixDNA.missedDay')}
          </div>
        </div>

        <div className="dna-helix-wrap">
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
            {/* Background glow */}
            <defs>
              <radialGradient id="dna-bg-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.05" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width={W} height={H} fill="url(#dna-bg-glow)" />

            {/* Backbone connections */}
            {leftStrand.slice(0, -1).map((pt, i) => (
              <line
                key={`lb-${i}`}
                x1={pt.x} y1={pt.y}
                x2={leftStrand[i + 1].x} y2={leftStrand[i + 1].y}
                stroke="#a78bfa" strokeWidth={1.5} opacity={0.2}
              />
            ))}
            {rightStrand.slice(0, -1).map((pt, i) => (
              <line
                key={`rb-${i}`}
                x1={pt.x} y1={pt.y}
                x2={rightStrand[i + 1].x} y2={rightStrand[i + 1].y}
                stroke="#a78bfa" strokeWidth={1.5} opacity={0.2}
              />
            ))}

            {/* Base pairs (horizontal rungs) */}
            {leftStrand.map((lpt, i) => {
              const rpt = rightStrand[i];
              const day = helixData[i];
              const hasStudy = day.minutes > 0;
              const pairColor = hasStudy ? day.color : '#334155';
              const pairOpacity = hasStudy ? 0.5 + (day.minutes / maxMinutes) * 0.5 : 0.12;
              const pairWidth = hasStudy ? 1 + (day.minutes / maxMinutes) * 2 : 0.5;

              return (
                <g key={`pair-${i}`}>
                  <line
                    x1={lpt.x} y1={lpt.y}
                    x2={rpt.x} y2={rpt.y}
                    stroke={pairColor}
                    strokeWidth={pairWidth}
                    opacity={pairOpacity}
                    style={{ animation: hasStudy ? `dna-pair-pulse ${2 + i % 3}s ease-in-out infinite` : 'none' }}
                  />
                  <title>{day.key}: {Math.round(day.minutes / 60 * 10) / 10}h ({day.subject})</title>
                </g>
              );
            })}

            {/* Left strand nodes */}
            {leftStrand.map((pt, i) => {
              const day = helixData[i];
              const r = day.minutes > 0 ? 3 + (day.minutes / maxMinutes) * 4 : 2;
              return (
                <circle
                  key={`ln-${i}`}
                  cx={pt.x} cy={pt.y} r={r}
                  fill={day.minutes > 0 ? day.color : 'var(--bg-hover)'}
                  stroke={day.minutes > 0 ? day.color : 'var(--border-color)'}
                  strokeWidth={1}
                  opacity={day.minutes > 0 ? 0.9 : 0.3}
                  style={{ filter: day.minutes > 120 ? `drop-shadow(0 0 4px ${day.color})` : 'none' }}
                >
                  <title>{day.key}: {Math.round(day.minutes / 60 * 10) / 10}h</title>
                </circle>
              );
            })}

            {/* Right strand nodes */}
            {rightStrand.map((pt, i) => {
              const day = helixData[i];
              const r = day.minutes > 0 ? 3 + (day.minutes / maxMinutes) * 4 : 2;
              return (
                <circle
                  key={`rn-${i}`}
                  cx={pt.x} cy={pt.y} r={r}
                  fill={day.minutes > 0 ? day.color : 'var(--bg-hover)'}
                  stroke={day.minutes > 0 ? day.color : 'var(--border-color)'}
                  strokeWidth={1}
                  opacity={day.minutes > 0 ? 0.9 : 0.3}
                  style={{ filter: day.minutes > 120 ? `drop-shadow(0 0 4px ${day.color})` : 'none' }}
                >
                  <title>{day.key}: {Math.round(day.minutes / 60 * 10) / 10}h</title>
                </circle>
              );
            })}

            {/* Date labels at ends */}
            {[0, Math.floor(helixData.length / 2), helixData.length - 1].map(i => (
              <text
                key={`label-${i}`}
                x={centerX}
                y={leftStrand[i]?.y || 0}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize={8}
                dy={-6}
              >
                {helixData[i]?.key?.slice(5)}
              </text>
            ))}
          </svg>
        </div>
      </div>
  );
}
