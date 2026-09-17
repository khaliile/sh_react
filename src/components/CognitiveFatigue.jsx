import { useMemo } from 'react';
import { useTimeTracker } from '../hooks/useAppHooks';
import { FaBrain, FaBook, FaBed, FaBolt } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import './CognitiveFatigue.css';

/**
 * Reads sleep debt + today's study hours + mood data
 * to estimate remaining "Cognitive Runway" before performance drop.
 */
export default function CognitiveFatigue() {
  const { log, todayMinutes } = useTimeTracker();
  const { t } = useLanguage();

  const analysis = useMemo(() => {
    const byDate = log?.byDate || {};

    // Average daily study over last 7 days (excluding today)
    const last7 = [];
    const now = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      last7.push(byDate[key] || 0);
    }
    const avgDailyMin = last7.reduce((s, v) => s + v, 0) / 7;

    // Get sleep debt estimate
    let sleepDebt = 0;
    try {
      const sd = JSON.parse(localStorage.getItem('app_sleep_debt') || 'null');
      sleepDebt = sd?.totalDebt || 0;
    } catch { /* ignore */ }

    // Get mood score (0-10)
    let moodScore = 7;
    try {
      const md = JSON.parse(localStorage.getItem('app_mood_log') || 'null');
      if (md) {
        const todayKey = now.toISOString().split('T')[0];
        const todayMood = md[todayKey];
        if (todayMood?.energy) moodScore = todayMood.energy;
      }
    } catch { /* ignore */ }

    // Estimate max productive minutes per day based on history + sleep
    const baseCapacity = Math.max(120, avgDailyMin * 1.1);
    const sleepPenalty = Math.min(60, sleepDebt * 15); // Each hour of sleep debt costs 15 min
    const moodMultiplier = 0.6 + (moodScore / 10) * 0.6;
    const adjustedCapacity = (baseCapacity - sleepPenalty) * moodMultiplier;

    // Runway = how many minutes of deep work remain
    const runway = Math.max(0, Math.round(adjustedCapacity - todayMinutes));
    const crashRisk = Math.min(100, Math.round(((adjustedCapacity - runway) / adjustedCapacity) * 100));

    let status = 'peak';
    let statusLabel = 'Peak Focus Zone';
    let statusColor = '#10b981';
    if (runway < 30) { status = 'critical'; statusLabel = 'Critical — Rest Needed'; statusColor = '#ef4444'; }
    else if (runway < 90) { status = 'warning'; statusLabel = 'Fading — Plan a Break'; statusColor = '#f59e0b'; }

    return { runway, crashRisk, status, statusLabel, statusColor, adjustedCapacity, moodScore, sleepDebt };
  }, [log, todayMinutes]);

  const runwayHrs = Math.floor(analysis.runway / 60);
  const runwayMins = analysis.runway % 60;

  return (
    <div
      className="cf-card"
      data-status={analysis.status}
      style={{ '--cf-status-color': analysis.statusColor }}
    >
        <div>
          <div className="cf-title">
            <FaBrain style={{ fontSize: '0.85rem' }} /> {t('cognitive.title')}
          </div>
          <div className="cf-heading">{t('cognitive.heading')}</div>

          <div className="cf-runway-display">
            <div className="cf-runway-number">
              {runwayHrs > 0 ? `${runwayHrs}h ${runwayMins}m` : `${analysis.runway}m`}
            </div>
            <div className="cf-runway-unit">{t('cognitive.runway')}</div>
            <div className="cf-status-badge">{analysis.statusLabel}</div>
          </div>

          {/* Crash risk bar */}
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
            {t('cognitive.fatigueLoad')}: {analysis.crashRisk}%
          </div>
          <div className="cf-bar-track">
            <div className="cf-bar-fill" style={{ '--w': `${analysis.crashRisk}%` }} />
          </div>

          {/* Factor breakdown */}
          <div style={{ marginTop: 14, marginBottom: 6, fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
            {t('cognitive.factors')}
          </div>

          <div className="cf-factor-row">
            <div className="cf-factor-label"><FaBook style={{ color: '#38bdf8', fontSize: '0.75rem' }} /> {t('cognitive.todayStudy')}</div>
            <div className="cf-factor-bar-track">
              <div className="cf-factor-bar" style={{ width: `${Math.min(100, (todayMinutes / 420) * 100)}%`, background: '#3b82f6' }} />
            </div>
            <div className="cf-factor-value">{Math.round(todayMinutes)}m</div>
          </div>

          <div className="cf-factor-row">
            <div className="cf-factor-label"><FaBed style={{ color: '#a78bfa', fontSize: '0.75rem' }} /> {t('cognitive.sleepDebt')}</div>
            <div className="cf-factor-bar-track">
              <div className="cf-factor-bar" style={{ width: `${Math.min(100, (analysis.sleepDebt / 8) * 100)}%`, background: '#ef4444' }} />
            </div>
            <div className="cf-factor-value">{analysis.sleepDebt}h</div>
          </div>

          <div className="cf-factor-row">
            <div className="cf-factor-label"><FaBolt style={{ color: '#10b981', fontSize: '0.75rem' }} /> {t('cognitive.energyLevel')}</div>
            <div className="cf-factor-bar-track">
              <div className="cf-factor-bar" style={{ width: `${analysis.moodScore * 10}%`, background: '#10b981' }} />
            </div>
            <div className="cf-factor-value">{analysis.moodScore}/10</div>
          </div>
        </div>

        <div className="cf-tip">
          {analysis.status === 'peak'
            ? t('cognitive.peakTip')
            : analysis.status === 'warning'
              ? t('cognitive.warningTip')
              : t('cognitive.criticalTip')}
        </div>
      </div>
  );
}
