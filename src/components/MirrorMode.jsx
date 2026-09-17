import { useMemo } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';
import { todayKey, todayKeyAt } from '../utils/dateKey';
import { useLanguage } from '../contexts/LanguageContext';

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_NAMES_AR = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

function fmt(m) {
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (!h) return `${rem}m`;
  if (!rem) return `${h}h`;
  return `${h}h ${rem}m`;
}

export default function MirrorMode() {
  const [log] = useAppStorage('app_time_log', { byDate: {}, sessions: [] });
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  const todayKey_ = todayKey();
  const todayDow = new Date().getDay();
  const todayName = isAr ? DAY_NAMES_AR[todayDow] : DAY_NAMES[todayDow];

  const {
    todayMins,
    pastAvg,
    pastByNow,
    diff,
    ahead,
    weekCount,
  } = useMemo(() => {
    const byDate = log.byDate || {};
    const todayMins = byDate[todayKey_] || 0;

    // Collect past same-weekday dates (last 4 weeks)
    const pastDays = [];
    for (let w = 1; w <= 4; w++) {
      const d = new Date();
      d.setDate(d.getDate() - w * 7);
      const key = todayKeyAt(d);
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
  }, [log, todayKey_]);

  const maxMins = Math.max(pastAvg || 0, todayMins, 1);
  const todayPct = Math.min(100, (todayMins / maxMins) * 100);
  const pastPct = Math.min(100, ((pastAvg || 0) / maxMins) * 100);
  const nowPct = Math.min(100, ((pastByNow || 0) / maxMins) * 100);

  return (
    <div className="arena-card mirror-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">{isAr ? 'وضع المرآة' : 'Mirror Mode'}</h3>
          <p className="arena-card-sub">
            {isAr ? `أنت مقابل نفسك السابقة في أيام ${todayName}` : `You vs. past-you on ${todayName}s`}
          </p>
        </div>
        {ahead !== null && (
          <div className={`mirror-badge ${ahead ? 'mirror-ahead' : 'mirror-behind'}`}>
            {ahead ? (isAr ? '▲ متقدم' : '▲ Ahead') : (isAr ? '▼ متأخر' : '▼ Behind')}
          </div>
        )}
      </div>

      {pastAvg === null ? (
        <div className="mirror-empty">
          <div className="mirror-empty-icon">[ ]</div>
          <p>
            {isAr 
              ? `تحتاج إلى يوم ${todayName} واحد سابق مسجل لتوليد شبحك.`
              : `Need at least 1 previous ${todayName} logged to generate your ghost.`}
          </p>
        </div>
      ) : (
        <>
          <div className="mirror-race-arena">
            {/* Today */}
            <div className="mirror-racer-row">
              <div className="mirror-racer-meta">
                <span className="mirror-racer-name">{isAr ? 'أنت — اليوم' : 'You — Today'}</span>
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
                <span className="mirror-racer-name">{isAr ? 'أنت السابق (حتى الآن)' : 'Past You (by now)'}</span>
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
                <span className="mirror-racer-name">
                  {isAr ? `متوسط ${todayName} السابق (يوم كامل)` : `Past ${todayName} avg (full day)`}
                </span>
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
                ? (isAr 
                    ? `أنت تتفوق على نفسك السابقة بـ ${fmt(diff)} الآن — استمر!`
                    : `You're beating past you by ${fmt(diff)} right now — keep it up!`)
                : (isAr
                    ? `كان لديك ${fmt(Math.abs(diff))} أكثر في هذا الوقت — حان وقت اللحاق!`
                    : `Past you had ${fmt(Math.abs(diff))} more at this time — time to catch up!`)}
            </div>
          )}

          <div className="mirror-footer">
            {isAr 
              ? `بناءً على آخر ${weekCount} ${todayName}${weekCount !== 1 ? '' : ''}`
              : `Based on your last ${weekCount} ${todayName}${weekCount !== 1 ? 's' : ''}`}
          </div>
        </>
      )}
    </div>
  );
}
