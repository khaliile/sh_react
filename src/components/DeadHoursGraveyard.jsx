import { useMemo } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';

const EPITAPHS = [
  'Here lies a forgotten day',
  'Lost to the void',
  'Never to return',
  'Time claimed by distraction',
  'No sessions logged',
  'The void took this one',
  'Wasted potential',
  'Consumed by inertia',
];

export default function DeadHoursGraveyard() {
  const [log] = useAppStorage('app_time_log', { byDate: {} });

  const graves = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const mins = log.byDate?.[key] || 0;
      if (mins === 0) {
        const epitaphIdx = (d.getDate() + d.getMonth()) % EPITAPHS.length;
        result.push({
          key,
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
          epitaph: EPITAPHS[epitaphIdx],
          daysAgo: i,
        });
      }
    }
    return result.slice(0, 15);
  }, [log.byDate]);

  const totalLostHours = graves.length * 14; // ~14 usable study hours per day

  return (
    <div className="arena-card graveyard-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">Dead Hours Graveyard</h3>
          <p className="arena-card-sub">Days lost to the void — never coming back</p>
        </div>
        {graves.length > 0 && (
          <div className="graveyard-total-badge">
            ~{totalLostHours}h lost
          </div>
        )}
      </div>

      {graves.length === 0 ? (
        <div className="graveyard-empty">
          <div className="graveyard-trophy">[ ]</div>
          <div className="graveyard-empty-title">No graves this month!</div>
          <div className="graveyard-empty-sub">You've studied every day in the last 30. Legendary.</div>
        </div>
      ) : (
        <div className="graveyard-scene">
          <div className="graveyard-sky" />
          <div className="graveyard-moon" />

          <div className="graveyard-stones-wrap">
            {graves.map((g, i) => (
              <div
                key={g.key}
                className={`tombstone ts-var-${(i % 3) + 1}`}
                style={{ '--ts-delay': `${i * 0.12}s`, '--ts-depth': `${Math.floor(i / 5)}` }}
                title={`${g.label} — ${g.epitaph}`}
              >
                <div className="ts-arch" />
                <div className="ts-body">
                  <div className="ts-rip">R.I.P</div>
                  <div className="ts-date">{g.dayName}</div>
                  <div className="ts-date2">{g.label}</div>
                  <div className="ts-cross">+</div>
                </div>
                <div className="ts-base" />
              </div>
            ))}
          </div>

          <div className="graveyard-ground-wrap">
            <div className="graveyard-fog fog-a" />
            <div className="graveyard-fog fog-b" />
            <div className="graveyard-ground" />
          </div>
        </div>
      )}

      <div className="graveyard-footer">
        <strong>{graves.length}</strong> lost {graves.length === 1 ? 'day' : 'days'} in the last 30 —{' '}
        <strong>~{totalLostHours} study hours</strong> gone forever
      </div>
    </div>
  );
}
