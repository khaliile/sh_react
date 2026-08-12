import { useMemo, useState } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';

// 50 world cities with approximate percentage positions on a flat map (x=0 left→right=100, y=0 top→bottom=100)
const CITIES = [
  { name: 'New York',       country: 'USA',          region: 'Americas', x: 26, y: 37 },
  { name: 'London',         country: 'UK',           region: 'Europe',   x: 48, y: 27 },
  { name: 'Paris',          country: 'France',       region: 'Europe',   x: 49, y: 30 },
  { name: 'Tokyo',          country: 'Japan',        region: 'Asia',     x: 83, y: 35 },
  { name: 'Sydney',         country: 'Australia',    region: 'Oceania',  x: 84, y: 72 },
  { name: 'Cairo',          country: 'Egypt',        region: 'Africa',   x: 56, y: 43 },
  { name: 'Mumbai',         country: 'India',        region: 'Asia',     x: 67, y: 47 },
  { name: 'Beijing',        country: 'China',        region: 'Asia',     x: 79, y: 33 },
  { name: 'São Paulo',      country: 'Brazil',       region: 'Americas', x: 34, y: 65 },
  { name: 'Moscow',         country: 'Russia',       region: 'Europe',   x: 58, y: 24 },
  { name: 'Lagos',          country: 'Nigeria',      region: 'Africa',   x: 49, y: 53 },
  { name: 'Mexico City',    country: 'Mexico',       region: 'Americas', x: 20, y: 46 },
  { name: 'Seoul',          country: 'South Korea',  region: 'Asia',     x: 82, y: 34 },
  { name: 'Istanbul',       country: 'Turkey',       region: 'Europe',   x: 57, y: 34 },
  { name: 'Buenos Aires',   country: 'Argentina',    region: 'Americas', x: 31, y: 74 },
  { name: 'Dubai',          country: 'UAE',          region: 'Asia',     x: 63, y: 44 },
  { name: 'Singapore',      country: 'Singapore',    region: 'Asia',     x: 76, y: 57 },
  { name: 'Nairobi',        country: 'Kenya',        region: 'Africa',   x: 59, y: 55 },
  { name: 'Los Angeles',    country: 'USA',          region: 'Americas', x: 13, y: 39 },
  { name: 'Berlin',         country: 'Germany',      region: 'Europe',   x: 52, y: 26 },
  { name: 'Toronto',        country: 'Canada',       region: 'Americas', x: 24, y: 33 },
  { name: 'Johannesburg',   country: 'South Africa', region: 'Africa',   x: 57, y: 68 },
  { name: 'Bangkok',        country: 'Thailand',     region: 'Asia',     x: 75, y: 50 },
  { name: 'Tehran',         country: 'Iran',         region: 'Asia',     x: 63, y: 37 },
  { name: 'Dhaka',          country: 'Bangladesh',   region: 'Asia',     x: 72, y: 44 },
  { name: 'Lima',           country: 'Peru',         region: 'Americas', x: 25, y: 62 },
  { name: 'Bogotá',         country: 'Colombia',     region: 'Americas', x: 27, y: 57 },
  { name: 'Madrid',         country: 'Spain',        region: 'Europe',   x: 47, y: 33 },
  { name: 'Rome',           country: 'Italy',        region: 'Europe',   x: 52, y: 35 },
  { name: 'Oslo',           country: 'Norway',       region: 'Europe',   x: 50, y: 20 },
  { name: 'Cape Town',      country: 'South Africa', region: 'Africa',   x: 53, y: 73 },
  { name: 'Casablanca',     country: 'Morocco',      region: 'Africa',   x: 46, y: 39 },
  { name: 'Manila',         country: 'Philippines',  region: 'Asia',     x: 80, y: 49 },
  { name: 'Jakarta',        country: 'Indonesia',    region: 'Asia',     x: 77, y: 59 },
  { name: 'Taipei',         country: 'Taiwan',       region: 'Asia',     x: 80, y: 40 },
  { name: 'Riyadh',         country: 'Saudi Arabia', region: 'Asia',     x: 61, y: 44 },
  { name: 'Athens',         country: 'Greece',       region: 'Europe',   x: 54, y: 36 },
  { name: 'Warsaw',         country: 'Poland',       region: 'Europe',   x: 54, y: 25 },
  { name: 'Accra',          country: 'Ghana',        region: 'Africa',   x: 47, y: 53 },
  { name: 'Vancouver',      country: 'Canada',       region: 'Americas', x: 12, y: 30 },
  { name: 'Miami',          country: 'USA',          region: 'Americas', x: 24, y: 44 },
  { name: 'Addis Ababa',    country: 'Ethiopia',     region: 'Africa',   x: 59, y: 53 },
  { name: 'Santiago',       country: 'Chile',        region: 'Americas', x: 27, y: 73 },
  { name: 'Auckland',       country: 'New Zealand',  region: 'Oceania',  x: 90, y: 77 },
  { name: 'Colombo',        country: 'Sri Lanka',    region: 'Asia',     x: 70, y: 53 },
  { name: 'Kyiv',           country: 'Ukraine',      region: 'Europe',   x: 56, y: 26 },
  { name: 'Amsterdam',      country: 'Netherlands',  region: 'Europe',   x: 50, y: 26 },
  { name: 'Karachi',        country: 'Pakistan',     region: 'Asia',     x: 65, y: 43 },
  { name: 'Chicago',        country: 'USA',          region: 'Americas', x: 23, y: 36 },
  { name: 'Kuala Lumpur',   country: 'Malaysia',     region: 'Asia',     x: 75, y: 55 },
];

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = Math.abs(seed) || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = ((s * 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const REGION_COLORS = {
  Americas: '#3b82f6',
  Europe:   '#a78bfa',
  Africa:   '#f59e0b',
  Asia:     '#10b981',
  Oceania:  '#ec4899',
};

export default function StudyFootprint() {
  const [log] = useAppStorage('app_time_log', { byDate: {} });
  const [hovered, setHovered] = useState(null);

  const { flags, totalHours, countryCount, regionCount } = useMemo(() => {
    const byDate = log.byDate || {};
    const totalMins = Object.values(byDate).reduce((s, m) => s + m, 0);
    const totalHours = Math.floor(totalMins / 60);

    const shuffled = seededShuffle(CITIES, 2026);
    const flags = shuffled.slice(0, Math.min(totalHours, CITIES.length));

    const countries = new Set(flags.map(f => f.country));
    const regions = new Set(flags.map(f => f.region));

    return { flags, totalHours, countryCount: countries.size, regionCount: regions.size };
  }, [log.byDate]);

  return (
    <div className="arena-card footprint-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">Study Footprint</h3>
          <p className="arena-card-sub">Every hour studied plants a flag in a new city</p>
        </div>
        <div className="footprint-hour-badge">{totalHours}h → {flags.length} cities</div>
      </div>

      <div className="footprint-map-outer">
        <div className="footprint-map">
          {/* Grid lines */}
          {[20, 40, 60, 80].map(x => (
            <div key={`v${x}`} className="fp-vline" style={{ left: `${x}%` }} />
          ))}
          {[33, 66].map(y => (
            <div key={`h${y}`} className="fp-hline" style={{ top: `${y}%` }} />
          ))}

          {/* Equator label */}
          <div className="fp-equator-label">— Equator —</div>

          {/* Flags */}
          {flags.map((city, i) => (
            <div
              key={city.name}
              className="fp-flag"
              style={{
                left: `${city.x}%`,
                top: `${city.y}%`,
                '--fi': i,
                '--fc': REGION_COLORS[city.region] || '#fff',
              }}
              onMouseEnter={() => setHovered(city)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="fp-pin" />
              {hovered?.name === city.name && (
                <div className="fp-tooltip">
                  <strong>{city.name}</strong>
                  <span>{city.country}</span>
                </div>
              )}
            </div>
          ))}

          {/* Hover globe icon if no flags yet */}
          {flags.length === 0 && (
            <div className="fp-empty-msg">Study more to plant your first flag!</div>
          )}
        </div>
      </div>

      {/* Region legend */}
      <div className="fp-legend">
        {Object.entries(REGION_COLORS).map(([region, color]) => {
          const count = flags.filter(f => f.region === region).length;
          return (
            <div key={region} className="fp-legend-item" style={{ opacity: count > 0 ? 1 : 0.3 }}>
              <span className="fp-legend-dot" style={{ background: color }} />
              <span>{region} ({count})</span>
            </div>
          );
        })}
      </div>

      <div className="footprint-stats">
        <div className="fp-stat">
          <span className="fp-val">{flags.length}</span>
          <span className="fp-lbl">Cities</span>
        </div>
        <div className="fp-stat">
          <span className="fp-val">{countryCount}</span>
          <span className="fp-lbl">Countries</span>
        </div>
        <div className="fp-stat">
          <span className="fp-val">{regionCount}</span>
          <span className="fp-lbl">Continents</span>
        </div>
        <div className="fp-stat">
          <span className="fp-val">{CITIES.length - flags.length}</span>
          <span className="fp-lbl">Undiscovered</span>
        </div>
      </div>
    </div>
  );
}
