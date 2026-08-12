import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useAppStorage, lastNDays } from '../hooks/useAppHooks';

function getWeekData(byDate) {
  return lastNDays(byDate, 7);
}

function getBestWeek(byDate) {
  // Slide a 7-day window over all dates to find the week with highest total
  const keys = Object.keys(byDate).sort();
  if (keys.length === 0) return null;
  let bestTotal = 0, bestStart = null;
  for (let i = 0; i < keys.length; i++) {
    let total = 0;
    const startDate = new Date(keys[i]);
    for (let j = 0; j < 7; j++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + j);
      const k = d.toISOString().slice(0, 10);
      total += (byDate[k] || 0);
    }
    if (total > bestTotal) { bestTotal = total; bestStart = keys[i]; }
  }
  if (!bestStart) return null;
  // Build 7-day array from best week start
  const out = [];
  const start = new Date(bestStart);
  for (let j = 0; j < 7; j++) {
    const d = new Date(start);
    d.setDate(d.getDate() + j);
    const k = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    out.push({ day: label, mins: byDate[k] || 0 });
  }
  return { days: out, total: bestTotal, startDate: bestStart };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const curr = payload.find(p => p.dataKey === 'current')?.value || 0;
  const best = payload.find(p => p.dataKey === 'ghost')?.value || 0;
  const fmt = m => m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`;
  return (
    <div style={{ background: '#111', border: '1px solid #333', padding: '8px 12px', borderRadius: 8, fontSize: '0.75rem' }}>
      <div style={{ color: '#aaa', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#3b82f6' }}>You: {fmt(curr)}</div>
      <div style={{ color: '#a78bfa' }}>Ghost: {fmt(best)}</div>
      {curr > best
        ? <div style={{ color: '#10b981', marginTop: 4 }}>Ahead by {fmt(curr - best)}</div>
        : curr < best
        ? <div style={{ color: '#ef4444', marginTop: 4 }}>Behind by {fmt(best - curr)}</div>
        : <div style={{ color: '#f59e0b', marginTop: 4 }}>Tied!</div>}
    </div>
  );
};

export default function ShadowRival({ log }) {
  const byDate = log?.byDate || {};

  const currentWeek = useMemo(() => getWeekData(byDate), [byDate]);
  const bestWeek    = useMemo(() => getBestWeek(byDate), [byDate]);

  const chartData = useMemo(() => {
    return currentWeek.map((d, i) => ({
      day:     d.day,
      current: d.minutes,
      ghost:   bestWeek?.days[i]?.mins || 0,
    }));
  }, [currentWeek, bestWeek]);

  const currTotal = currentWeek.reduce((s, d) => s + d.minutes, 0);
  const bestTotal = bestWeek?.total || 0;
  const ahead = currTotal - bestTotal;
  const fmt = m => m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`;

  const statusColor = ahead > 0 ? '#10b981' : ahead < 0 ? '#ef4444' : '#f59e0b';
  const statusText  = ahead > 0 ? `+${fmt(ahead)} ahead of your ghost` : ahead < 0 ? `${fmt(-ahead)} behind your ghost` : 'Tied with your ghost!';

  return (
    <div className="arena-card rival-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">Shadow Rival</h3>
          <p className="arena-card-sub">Race your best ever week</p>
        </div>
        <div className="rival-status-badge" style={{ background: `${statusColor}22`, color: statusColor, borderColor: `${statusColor}44` }}>
          {bestTotal === 0 ? 'No ghost yet' : ahead >= 0 ? 'Winning' : 'Losing'}
        </div>
      </div>

      {bestTotal === 0 ? (
        <div className="rival-empty">
          <div className="rival-ghost-icon">[ ]</div>
          <div>Log study time this week to create your first ghost!</div>
        </div>
      ) : (
        <>
          <div className="rival-scores">
            <div className="rival-score-block">
              <span className="rival-score-val" style={{ color: '#3b82f6' }}>{fmt(currTotal)}</span>
              <span className="rival-score-label">You (this week)</span>
            </div>
            <div className="rival-vs">VS</div>
            <div className="rival-score-block">
              <span className="rival-score-val" style={{ color: '#a78bfa' }}>{fmt(bestTotal)}</span>
              <span className="rival-score-label">Ghost (best week)</span>
            </div>
          </div>
          <div className="rival-status" style={{ color: statusColor }}>{statusText}</div>

          <div style={{ width: '100%', height: 150, marginTop: 12 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} barGap={2} barCategoryGap="25%">
                <CartesianGrid stroke="#1e1e1e" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#555" tick={{ fontSize: 11 }} />
                <YAxis stroke="#555" tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v/60)}h`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="current" name="You"   fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="ghost"   name="Ghost" fill="#a78bfa" radius={[4,4,0,0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rival-legend">
            <span className="rival-legend-dot" style={{ background: '#3b82f6' }} /> You
            <span className="rival-legend-dot" style={{ background: '#a78bfa', marginLeft: 12 }} /> Ghost
          </div>
        </>
      )}
    </div>
  );
}
