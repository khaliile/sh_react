import { useMemo } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function fmt(m) {
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (!h) return `${rem}m`;
  if (!rem) return `${h}h`;
  return `${h}h ${rem}m`;
}

export default function MirrorMode() {
  const [log] = useAppStorage('app_time_log', { byDate: {}, sessions: [] });

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayDow = new Date().getDay();
  const todayName = DAY_NAMES[todayDow];

  const {
    todayMins,
    pastDays,
    pastAvg,
    pastByNow,
    diff,
    ahead,
    weekCount,
  } = useMemo(() => {
    const byDate = log.byDate || {};
    const todayMins = byDate[todayKey] || 0;

    // Collect past same-weekday dates (last 4 weeks)
    const pastDays = [];
    for (let w = 1; w <= 4; w++) {
      const d = new Date();
      d.setDate(d.getDate() - w * 7);
      const key = d.toISOString().slice(0, 10);
      if (byDate[key] !== undefined) {
        pastDays.push({ key, mins: byDate[key] });
      }
    }

    if (!pastDays.length) {
      return { todayMins, pastDays: [], pastAvg: null, pastByNow: null, diff: null, ahead: null, weekCount: 0 };
    }

    const pastAvg = Math.round(pastDays.reduce((s, d) => s + d.mins, 0) / pastDays.length);

    // Estimate where past-you was at this exact time of day
    const now = new Date();
    const minuteOfDay = now.getHours() * 60 + now.getMinutes();
    const studyDayLength = 16 * 60; // 6am-10pm = 16h productive window
    const fractionElapsed = Math.min(minuteOfDay / studyDayLength, 1);
    const pastByNow = Math.round(pastAvg * fractionElapsed);

    const diff = todayMins - pastByNow;
    const ahead = diff >= 0;

    return { todayMins, pastDays, pastAvg, pastByNow, diff, ahead, weekCount: pastDays.length };
  }, [log, todayKey]);

  const maxMins = Math.max(pastAvg || 0, todayMins, 1);
  const todayPct = Math.min(100, (todayMins / maxMins) * 100);
  const pastPct = Math.min(100, ((pastAvg || 0) / maxMins) * 100);
  const nowPct = Math.min(100, ((pastByNow || 0) / maxMins) * 100);

  return (
    <div className="arena-card mirror-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">Mirror Mode</h3>
          <p className="arena-card-sub">You vs. past-you on {todayName}s</p>
        </div>
        {ahead !== null && (
          <div className={`mirror-badge ${ahead ? 'mirror-ahead' : 'mirror-behind'}`}>
            {ahead ? '▲ Ahead' : '▼ Behind'}
          </div>
        )}
      </div>

      {pastAvg === null ? (
        <div className="mirror-empty">
          <div className="mirror-empty-icon">[ ]</div>
          <p>Need at least 1 previous {todayName} logged to generate your ghost.</p>
        </div>
      ) : (
        <>
          <div className="mirror-race-arena">
            {/* Today */}
            <div className="mirror-racer-row">
              <div className="mirror-racer-meta">
                <span className="mirror-racer-name">You — Today</span>
                <span className="mirror-racer-val">{fmt(todayMins)}</span>
              </div>
              <div className="mirror-track">
                <div className="mirror-bar mirror-bar-you" style={{ width: `${todayPct}%` }}>
                  <span className="mirror-bar-tip"> </span>
                </div>
              </div>
            </div>

            {/* Past you — by this time of day */}
            <div className="mirror-racer-row">
              <div className="mirror-racer-meta">
                <span className="mirror-racer-name">Past You (by now)</span>
                <span className="mirror-racer-val">{fmt(pastByNow || 0)}</span>
              </div>
              <div className="mirror-track">
                <div className="mirror-bar mirror-bar-ghost" style={{ width: `${nowPct}%` }}>
                  <span className="mirror-bar-tip"> </span>
                </div>
              </div>
            </div>

            {/* Past full day avg */}
            <div className="mirror-racer-row mirror-racer-dim">
              <div className="mirror-racer-meta">
                <span className="mirror-racer-name">Past {todayName} avg (full day)</span>
                <span className="mirror-racer-val">{fmt(pastAvg)}</span>
              </div>
              <div className="mirror-track">
                <div className="mirror-bar mirror-bar-avg" style={{ width: `${pastPct}%` }} />
              </div>
            </div>
          </div>

          {diff !== null && (
            <div className={`mirror-verdict ${ahead ? 'verdict-ahead' : 'verdict-behind'}`}>
              {ahead
                ? `You're beating past you by ${fmt(diff)} right now — keep it up!`
                : `Past you had ${fmt(Math.abs(diff))} more at this time — time to catch up!`}
            </div>
          )}

          <div className="mirror-footer">
            Based on your last {weekCount} {todayName}{weekCount !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}
