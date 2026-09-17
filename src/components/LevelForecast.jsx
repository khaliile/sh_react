import { useMemo } from 'react';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useTimeTracker } from '../hooks/useAppHooks';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { FaLevelUpAlt } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import './LevelForecast.css';

export default function LevelForecast() {
  const { xp, level, currentLevelXp, nextLevelXp } = useRpgStorage();
  const { log } = useTimeTracker();
  const { t } = useLanguage();

  const { chartData, daysUntilNext, daysWithQuest, avgDailyXP } = useMemo(() => {
    const sessions = log?.sessions || [];

    // Compute daily XP from sessions (using study minutes → XP: ~10 XP per minute)
    const dayMap = {};
    sessions.forEach(s => {
      if (!s.ts) return;
      const d = new Date(s.ts).toISOString().split('T')[0];
      dayMap[d] = (dayMap[d] || 0) + Math.round((s.minutes || 0) * 1.5);
    });

    const last7Keys = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const last7XP = last7Keys.map(k => dayMap[k] || 0);
    const avgDailyXP = Math.max(10, last7XP.reduce((s, v) => s + v, 0) / 7);

    const xpToNext = nextLevelXp - currentLevelXp;
    const daysUntilNext = Math.ceil(xpToNext / avgDailyXP);
    const questBonus = 200; // avg quest reward
    const daysWithQuest = Math.ceil(Math.max(1, xpToNext - questBonus) / avgDailyXP);

    // Build 14-day forecast chart
    const chartData = [];
    let cumulativeXP = xp;
    for (let i = 0; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const label = i === 0 ? 'Today' : `+${i}d`;
      chartData.push({
        day: label,
        xp: Math.round(cumulativeXP),
        levelThreshold: level * nextLevelXp,
        nextLevelXP: (level) * nextLevelXp,
      });
      cumulativeXP += avgDailyXP;
    }

    return { chartData, daysUntilNext, daysWithQuest, avgDailyXP };
  }, [xp, level, currentLevelXp, nextLevelXp, log]);

  const levelLineXP = level * nextLevelXp;

  return (
    <div className="lf-card">
        <div className="lf-title">
          <FaLevelUpAlt style={{ fontSize: '0.85rem' }} /> {t('levelForecast.title')}
        </div>
        <div className="lf-heading">{t('levelForecast.heading')}</div>

        <div className="lf-current-level">
          <div className="lf-level-chip">
            <div className="lf-chip-value">Lv.{level}</div>
            <div className="lf-chip-label">{t('levelForecast.current')}</div>
          </div>
          <div className="lf-level-chip">
            <div className="lf-chip-value">{xp.toLocaleString()}</div>
            <div className="lf-chip-label">{t('levelForecast.totalXP')}</div>
          </div>
          <div className="lf-level-chip">
            <div className="lf-chip-value">Lv.{level + 1}</div>
            <div className="lf-chip-label">{t('levelForecast.target')}</div>
          </div>
        </div>

        <div className="lf-forecast-row">
          <div className="lf-forecast-box" style={{ borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.08)' }}>
            <div className="lf-forecast-days" style={{ color: '#818cf8' }}>{daysUntilNext}d</div>
            <div className="lf-forecast-label" style={{ color: '#6366f1' }}>{t('levelForecast.atCurrentPace')}</div>
          </div>
          <div className="lf-forecast-box" style={{ borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.08)' }}>
            <div className="lf-forecast-days" style={{ color: '#10b981' }}>{daysWithQuest}d</div>
            <div className="lf-forecast-label" style={{ color: '#059669' }}>{t('levelForecast.withWeeklyQuest')}</div>
          </div>
        </div>

        <div className="lf-avg">{t('levelForecast.avgXP', { n: Math.round(avgDailyXP) })}</div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="lf-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={2} stroke="var(--border-color)" />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} stroke="var(--border-color)" />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.72rem', color: 'var(--text-primary)' }}
              formatter={(v) => [`${v.toLocaleString()} XP`, 'Total XP']}
            />
            <ReferenceLine y={levelLineXP} stroke="#818cf8" strokeDasharray="4 4" label={{ value: `Lv.${level + 1}`, fill: '#818cf8', fontSize: 9 }} />
            <Area type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={2} fill="url(#lf-grad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
  );
}

