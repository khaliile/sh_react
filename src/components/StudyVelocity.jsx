import { useMemo } from 'react';
import { useTimeTracker } from '../hooks/useAppHooks';
import { useLanguage } from '../contexts/LanguageContext';
import { FaRocket, FaTachometerAlt, FaChartLine, FaFire } from 'react-icons/fa';
import { todayKeyAt } from '../utils/dateKey';
import './StudyVelocity.css';

export default function StudyVelocity() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const { log } = useTimeTracker();

  const velocityData = useMemo(() => {
    const byDate = log?.byDate || {};
    const today = new Date();

    // Calculate last 7 days detailed data (oldest to newest)
    const last7Days = [];
    let last7Total = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = todayKeyAt(d);
      const mins = byDate[key] || 0;
      last7Total += mins;
      const dayLabel = d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'narrow' });
      const fullDayLabel = d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short' });
      last7Days.push({
        date: d,
        key,
        dayLabel,
        fullDayLabel,
        mins,
        isToday: i === 0
      });
    }
    const last7Avg = Math.round(last7Total / 7);

    // Calculate previous 7 days (days 8-14)
    let prev7Total = 0;
    for (let i = 7; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = todayKeyAt(d);
      prev7Total += byDate[key] || 0;
    }
    const prev7Avg = Math.round(prev7Total / 7);

    // Calculate acceleration/velocity percentage
    let velocityChange;
    if (prev7Avg === 0 && last7Avg === 0) {
      velocityChange = 0;
    } else if (prev7Avg === 0 && last7Avg > 0) {
      velocityChange = 100;
    } else {
      velocityChange = Math.round(((last7Avg - prev7Avg) / prev7Avg) * 100);
    }

    // Today's output vs average
    const todayKey = todayKeyAt(today);
    const todayMins = byDate[todayKey] || 0;
    const todayVsAvg = last7Avg === 0 ? 0 : Math.round(((todayMins - last7Avg) / last7Avg) * 100);

    // Peak day in last 7 days
    let peakDay = { day: '', mins: 0 };
    for (const d of last7Days) {
      if (d.mins > peakDay.mins) {
        peakDay = {
          day: d.fullDayLabel,
          mins: d.mins
        };
      }
    }

    const maxDayMins = Math.max(...last7Days.map(d => d.mins), 60);

    return {
      last7Days,
      last7Avg,
      prev7Avg,
      last7Total,
      maxDayMins,
      velocityChange,
      todayMins,
      todayVsAvg,
      peakDay,
      hasData: last7Total > 0 || todayMins > 0
    };
  }, [log?.byDate, isAr]);

  const getVelocityStatus = () => {
    const { velocityChange, hasData } = velocityData;
    if (!hasData) {
      return {
        label: t('velocity.steadyPace') || (isAr ? 'سرعة مستقرة' : 'Steady Velocity'),
        color: '#8b5cf6',
        icon: <FaTachometerAlt />,
        rating: isAr ? 'خط الأساس' : 'BASELINE',
        tip: t('velocity.emptyTip')
      };
    }
    if (velocityChange >= 25) {
      return {
        label: t('velocity.strongAcc') || (isAr ? 'تسارع قوي' : 'Strong Acceleration'),
        color: '#10b981',
        icon: <FaRocket />,
        rating: isAr ? 'سرعة فائقة' : 'HYPER DRIVE',
        tip: t('velocity.acceleratingTip')
      };
    } else if (velocityChange > 0) {
      return {
        label: t('velocity.slightAcc') || (isAr ? 'تسارع خفيف' : 'Slight Acceleration'),
        color: '#3b82f6',
        icon: <FaChartLine />,
        rating: isAr ? 'تسارع نشط' : 'ACCELERATING',
        tip: t('velocity.slightUpTip')
      };
    } else if (velocityChange === 0) {
      return {
        label: t('velocity.steadyPace') || (isAr ? 'سرعة مستقرة' : 'Steady Velocity'),
        color: '#8b5cf6',
        icon: <FaTachometerAlt />,
        rating: isAr ? 'وتيرة متوازنة' : 'CRUISE PACE',
        tip: t('velocity.steadyTip')
      };
    } else if (velocityChange > -20) {
      return {
        label: t('velocity.slightDec') || (isAr ? 'تباطؤ خفيف' : 'Slight Deceleration'),
        color: '#f59e0b',
        icon: <FaTachometerAlt />,
        rating: isAr ? 'تباطؤ طفيف' : 'DECELERATING',
        tip: t('velocity.deceleratingTip')
      };
    } else {
      return {
        label: t('velocity.strongDec') || (isAr ? 'تباطؤ قوي' : 'Strong Deceleration'),
        color: '#ef4444',
        icon: <FaFire />,
        rating: isAr ? 'تراجع كبير' : 'LOW DRIFT',
        tip: t('velocity.deceleratingTip')
      };
    }
  };

  const status = getVelocityStatus();
  const formatMins = (m) => {
    if (!m) return `0${isAr ? 'د' : 'm'}`;
    if (m >= 60) {
      const hrs = Math.floor(m / 60);
      const rem = m % 60;
      return rem > 0 
        ? `${hrs}${isAr ? 'س' : 'h'} ${rem}${isAr ? 'د' : 'm'}` 
        : `${hrs}${isAr ? 'س' : 'h'}`;
    }
    return `${m}${isAr ? 'د' : 'm'}`;
  };

  return (
    <div className="velocity-card" style={{ '--velocity-color': status.color }}>
        <div>
          {/* Header */}
          <div className="velocity-title">
            <FaTachometerAlt style={{ fontSize: '0.85rem' }} /> {t('velocity.title')}
          </div>
          <div className="velocity-heading">{t('velocity.heading')}</div>
          <div className="velocity-sub">{t('velocity.subtitle')}</div>

          {/* Acceleration Hero Status */}
          <div className="velocity-hero">
            <div className="velocity-hero-icon">
              {status.icon}
            </div>
            <div className="velocity-hero-content">
              <div className="velocity-hero-label">
                <span>{status.label}</span>
                <span className="velocity-hero-badge">{status.rating}</span>
              </div>
              <div className="velocity-hero-sub">
                {velocityData.hasData ? (
                  <>
                    <strong style={{ color: status.color }}>
                      {velocityData.velocityChange > 0 ? '+' : ''}{velocityData.velocityChange}%
                    </strong>{' '}
                    {t('velocity.change')} {isAr ? 'مقارنة بالأسبوع السابق' : 'vs previous week'}
                  </>
                ) : (
                  t('velocity.emptySub')
                )}
              </div>
            </div>
          </div>

          {/* 7-Day Velocity Sparkline / Daily Distribution */}
          <div className="velocity-spark-section">
            <div className="velocity-spark-header">
              <span>{isAr ? 'توزيع الأيام الـ 7 الأخيرة' : '7-Day Output Flow'}</span>
              <span>{formatMins(velocityData.last7Total)} {isAr ? 'إجمالي' : 'total'}</span>
            </div>
            <div className="velocity-spark-bars">
              {velocityData.last7Days.map((d) => {
                const heightPct = velocityData.maxDayMins > 0 
                  ? Math.max(8, Math.min(100, Math.round((d.mins / velocityData.maxDayMins) * 100)))
                  : 8;
                const isPeak = velocityData.peakDay.mins > 0 && d.mins === velocityData.peakDay.mins;
                const barColor = isPeak
                  ? '#f59e0b'
                  : d.isToday
                    ? '#a78bfa'
                    : d.mins > 0
                      ? '#3b82f6'
                      : 'rgba(255, 255, 255, 0.15)';

                return (
                  <div key={d.key} className="velocity-spark-col" title={`${d.fullDayLabel}: ${formatMins(d.mins)}`}>
                    <div className="velocity-spark-track">
                      <div
                        className="velocity-spark-fill"
                        style={{
                          height: `${d.mins > 0 ? heightPct : 12}%`,
                          background: barColor,
                          opacity: d.mins > 0 ? 1 : 0.4
                        }}
                      />
                    </div>
                    <span className={`velocity-spark-lbl ${d.isToday ? 'today' : ''}`}>
                      {d.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2x2 Metric Grid */}
          <div className="velocity-grid">
            <div className="velocity-box">
              <span className="velocity-box-lbl">{t('velocity.avg7Days')}</span>
              <span className="velocity-box-val">{formatMins(velocityData.last7Avg)}</span>
            </div>

            <div className="velocity-box">
              <span className="velocity-box-lbl">{t('velocity.todayVsAvg')}</span>
              <span
                className="velocity-box-val"
                style={{
                  color: velocityData.todayVsAvg > 0 ? '#10b981' : velocityData.todayVsAvg < 0 ? '#ef4444' : 'inherit'
                }}
              >
                {velocityData.todayVsAvg > 0 ? '+' : ''}{velocityData.todayVsAvg}%
              </span>
            </div>

            <div className="velocity-box">
              <span className="velocity-box-lbl">{t('velocity.prev7Days')}</span>
              <span className="velocity-box-val" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
                {formatMins(velocityData.prev7Avg)}
              </span>
            </div>

            <div className="velocity-box">
              <span className="velocity-box-lbl">{t('velocity.peakDay')}</span>
              <span className="velocity-box-val" style={{ fontSize: '0.92rem', color: '#f59e0b' }}>
                {velocityData.peakDay.mins > 0 ? `${velocityData.peakDay.day} (${formatMins(velocityData.peakDay.mins)})` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Actionable Coaching Tip */}
        <div className="velocity-tip">
          {status.tip}
        </div>
      </div>
  );
}
