import { useAppStorage, computeStreak } from '../hooks/useAppHooks';

function getAuraState(streak, todayMins) {
  if (todayMins >= 120 || streak >= 7) return 'blazing';
  if (todayMins >= 30 || streak >= 3) return 'focused';
  if (todayMins > 0 || streak > 0) return 'awakening';
  return 'dormant';
}

const AURA_CONFIG = {
  dormant:   { label: 'Dormant',   icon: '—', desc: 'No activity yet — start studying to awaken your aura' },
  awakening: { label: 'Awakening', icon: '~', desc: 'Your aura stirs — keep the momentum going' },
  focused:   { label: 'Focused',   icon: '>', desc: 'Deep focus activated — golden pulse mode' },
  blazing:   { label: 'Blazing',   icon: '*', desc: 'Peak performance — your aura blazes at full power!' },
};

export default function StudyAura({ mini = false }) {
  const [log] = useAppStorage('app_time_log', { byDate: {}, sessions: [] });
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMins = log.byDate?.[todayKey] || 0;
  const streak = computeStreak(log.byDate || {});
  const state = getAuraState(streak, todayMins);
  const cfg = AURA_CONFIG[state];

  if (mini) {
    return (
      <span className={`aura-orb-mini aura-mini-${state}`} title={`Study Aura: ${cfg.label}`} />
    );
  }

  const todayHrs = (todayMins / 60).toFixed(1);

  return (
    <div className="arena-card aura-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">Study Aura</h3>
          <p className="arena-card-sub">Your ambient presence — shaped by consistency</p>
        </div>
        <div className={`aura-state-badge aura-badge-${state}`}>{cfg.label}</div>
      </div>

      <div className="aura-center">
        <div className={`aura-orb-wrap aura-wrap-${state}`}>
          <div className={`aura-ring aura-ring-3 aura-ring3-${state}`} />
          <div className={`aura-ring aura-ring-2 aura-ring2-${state}`} />
          <div className={`aura-ring aura-ring-1 aura-ring1-${state}`} />
          <div className={`aura-core aura-core-${state}`}>
            <span className="aura-emoji">{cfg.icon}</span>
          </div>
        </div>
      </div>

      <p className="aura-desc">{cfg.desc}</p>

      <div className="aura-stats-row">
        <div className="aura-stat">
          <span className="aura-stat-val">{streak}</span>
          <span className="aura-stat-lbl">day streak</span>
        </div>
        <div className="aura-stat">
          <span className="aura-stat-val">{todayHrs}h</span>
          <span className="aura-stat-lbl">today</span>
        </div>
        <div className="aura-stat">
          <span className="aura-stat-val">{cfg.emoji}</span>
          <span className="aura-stat-lbl">{state}</span>
        </div>
      </div>
    </div>
  );
}
