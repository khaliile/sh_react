import { useMemo, useState } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';

function fmt(m) {
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (!h) return `${rem}m`;
  if (!rem) return `${h}h`;
  return `${h}h ${rem}m`;
}

export default function CloneBestDay() {
  const [log] = useAppStorage('app_time_log', { byDate: {}, sessions: [] });
  const [cloneData, setCloneData] = useAppStorage('app_clone_suggestion', null);
  const [cloned, setCloned] = useState(false);

  const bestDay = useMemo(() => {
    const byDate = log.byDate || {};
    const entries = Object.entries(byDate);
    if (!entries.length) return null;

    const [date, mins] = entries.reduce((best, cur) => cur[1] > best[1] ? cur : best);
    const sessions = (log.sessions || []).filter(s => s.date === date);
    const daysAgo = Math.round((Date.now() - new Date(date).getTime()) / (86400 * 1000));

    return { date, mins, sessions, daysAgo };
  }, [log]);

  const handleClone = () => {
    if (!bestDay) return;
    setCloneData({
      sourceDate: bestDay.date,
      sourceMins: bestDay.mins,
      sessions: bestDay.sessions.map(s => ({ task: s.task, category: s.category, minutes: s.minutes })),
      clonedAt: Date.now(),
    });
    setCloned(true);
    setTimeout(() => setCloned(false), 2500);
  };

  return (
    <div className="arena-card clone-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">Clone Your Best Day</h3>
          <p className="arena-card-sub">Summon the ghost of your peak performance</p>
        </div>
      </div>

      {!bestDay ? (
        <div className="clone-empty">
          <div className="clone-empty-icon">[ ]</div>
          <p>Log some study time to find your best day.</p>
        </div>
      ) : (
        <>
          <div className="clone-best-card">
            <div className="clone-date-label">
              Personal Best
            </div>
            <div className="clone-date-full">
              {new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="clone-metrics">
              <div className="clone-metric">
                <span className="cm-val">{fmt(bestDay.mins)}</span>
                <span className="cm-lbl">Total studied</span>
              </div>
              <div className="clone-metric">
                <span className="cm-val">{bestDay.sessions.length}</span>
                <span className="cm-lbl">Sessions</span>
              </div>
              <div className="clone-metric">
                <span className="cm-val">{bestDay.daysAgo === 0 ? 'Today' : `${bestDay.daysAgo}d ago`}</span>
                <span className="cm-lbl">When</span>
              </div>
            </div>

            {bestDay.sessions.length > 0 && (
              <div className="clone-session-list">
                {bestDay.sessions.slice(0, 5).map((s, i) => (
                  <div key={i} className="clone-session-row">
                    <span className="csr-dot" />
                    <span className="csr-label">{s.task || s.category || 'Study'}</span>
                    <span className="csr-time">{fmt(s.minutes)}</span>
                  </div>
                ))}
                {bestDay.sessions.length > 5 && (
                  <div className="clone-session-more">+{bestDay.sessions.length - 5} more sessions</div>
                )}
              </div>
            )}
          </div>

          <button
            className={`clone-btn ${cloned ? 'clone-btn-success' : ''}`}
            onClick={handleClone}
          >
            {cloned ? 'Cloned — Today\'s plan saved!' : 'Clone This Day'}
          </button>

          {cloneData && !cloned && (
            <p className="clone-hint">
              Last cloned: {new Date(cloneData.clonedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' '}· Source: {fmt(cloneData.sourceMins)} day
            </p>
          )}
        </>
      )}
    </div>
  );
}
