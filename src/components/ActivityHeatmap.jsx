import { useMemo } from 'react';
import { last60Days, formatMinutes } from '../hooks/useAppHooks';

export default function ActivityHeatmap({ byDate }) {
  const days = useMemo(() => last60Days(byDate || {}), [byDate]);

  const getIntensityClass = (mins) => {
    if (!mins || mins <= 0) return 'level-0';
    if (mins < 60) return 'level-1';     // < 1h
    if (mins < 180) return 'level-2';    // 1-3h
    if (mins < 300) return 'level-3';    // 3-5h
    return 'level-4';                    // 5h+
  };

  const totalMinutes = days.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="dash-card heatmap-card">
      <div className="heatmap-header">
        <div>
          <h3>Activity Heatmap</h3>
          <span className="heatmap-sub">Past 60 days study consistency &bull; {formatMinutes(totalMinutes)} total</span>
        </div>
        <div className="heatmap-legend">
          <span className="legend-label">Less</span>
          <span className="square level-0" title="0m" />
          <span className="square level-1" title="< 1h" />
          <span className="square level-2" title="1-3h" />
          <span className="square level-3" title="3-5h" />
          <span className="square level-4" title="5h+" />
          <span className="legend-label">More</span>
        </div>
      </div>

      <div className="heatmap-grid">
        {days.map(d => (
          <div
            key={d.date}
            className={`heatmap-cell ${getIntensityClass(d.minutes)}`}
            title={`${d.label} (${d.date}): ${d.minutes ? formatMinutes(d.minutes) : 'No time logged'}`}
          />
        ))}
      </div>
    </div>
  );
}
