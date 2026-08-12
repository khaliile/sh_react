import { useAppStorage } from '../hooks/useAppHooks';

// Countries sorted by unlock threshold (cumulative study hours)
const PASSPORT_COUNTRIES = [
  { code: 'JP', name: 'Japan',           flag: '🇯🇵', hours: 1,   avg: '9h/day' },
  { code: 'KR', name: 'South Korea',     flag: '🇰🇷', hours: 3,   avg: '10h/day' },
  { code: 'CN', name: 'China',           flag: '🇨🇳', hours: 5,   avg: '9h/day' },
  { code: 'SG', name: 'Singapore',       flag: '🇸🇬', hours: 8,   avg: '8.5h/day' },
  { code: 'FI', name: 'Finland',         flag: '🇫🇮', hours: 12,  avg: '8h/day' },
  { code: 'DE', name: 'Germany',         flag: '🇩🇪', hours: 16,  avg: '7.5h/day' },
  { code: 'IN', name: 'India',           flag: '🇮🇳', hours: 20,  avg: '9h/day' },
  { code: 'EE', name: 'Estonia',         flag: '🇪🇪', hours: 25,  avg: '7h/day' },
  { code: 'NL', name: 'Netherlands',     flag: '🇳🇱', hours: 30,  avg: '7h/day' },
  { code: 'CA', name: 'Canada',          flag: '🇨🇦', hours: 35,  avg: '6.5h/day' },
  { code: 'AU', name: 'Australia',       flag: '🇦🇺', hours: 40,  avg: '6h/day' },
  { code: 'FR', name: 'France',          flag: '🇫🇷', hours: 50,  avg: '7h/day' },
  { code: 'SE', name: 'Sweden',          flag: '🇸🇪', hours: 60,  avg: '6.5h/day' },
  { code: 'CH', name: 'Switzerland',     flag: '🇨🇭', hours: 70,  avg: '7h/day' },
  { code: 'NO', name: 'Norway',          flag: '🇳🇴', hours: 80,  avg: '6h/day' },
  { code: 'IL', name: 'Israel',          flag: '🇮🇱', hours: 90,  avg: '7.5h/day' },
  { code: 'US', name: 'United States',   flag: '🇺🇸', hours: 100, avg: '6.5h/day' },
  { code: 'GB', name: 'United Kingdom',  flag: '🇬🇧', hours: 110, avg: '6h/day' },
  { code: 'TW', name: 'Taiwan',          flag: '🇹🇼', hours: 120, avg: '9h/day' },
  { code: 'IE', name: 'Ireland',         flag: '🇮🇪', hours: 130, avg: '6h/day' },
  { code: 'NZ', name: 'New Zealand',     flag: '🇳🇿', hours: 140, avg: '5.5h/day' },
  { code: 'DK', name: 'Denmark',         flag: '🇩🇰', hours: 150, avg: '6h/day' },
  { code: 'AT', name: 'Austria',         flag: '🇦🇹', hours: 160, avg: '6.5h/day' },
  { code: 'CZ', name: 'Czechia',         flag: '🇨🇿', hours: 175, avg: '6h/day' },
  { code: 'PT', name: 'Portugal',        flag: '🇵🇹', hours: 190, avg: '5.5h/day' },
  { code: 'ES', name: 'Spain',           flag: '🇪🇸', hours: 200, avg: '5.5h/day' },
  { code: 'IT', name: 'Italy',           flag: '🇮🇹', hours: 215, avg: '5.5h/day' },
  { code: 'PL', name: 'Poland',          flag: '🇵🇱', hours: 230, avg: '6.5h/day' },
  { code: 'BR', name: 'Brazil',          flag: '🇧🇷', hours: 250, avg: '5h/day' },
  { code: 'AR', name: 'Argentina',       flag: '🇦🇷', hours: 270, avg: '5h/day' },
  { code: 'MX', name: 'Mexico',          flag: '🇲🇽', hours: 290, avg: '5h/day' },
  { code: 'ZA', name: 'South Africa',    flag: '🇿🇦', hours: 310, avg: '5h/day' },
  { code: 'NG', name: 'Nigeria',         flag: '🇳🇬', hours: 330, avg: '6h/day' },
  { code: 'EG', name: 'Egypt',           flag: '🇪🇬', hours: 350, avg: '5.5h/day' },
  { code: 'MA', name: 'Morocco',         flag: '🇲🇦', hours: 400, avg: '5h/day' },
  { code: 'SA', name: 'Saudi Arabia',    flag: '🇸🇦', hours: 450, avg: '5h/day' },
  { code: 'AE', name: 'UAE',             flag: '🇦🇪', hours: 500, avg: '6h/day' },
];

export default function StudyPassport({ log }) {
  // Compute total hours from log
  const totalMins = Object.values(log?.byDate || {}).reduce((s, m) => s + m, 0);
  const totalHours = Math.floor(totalMins / 60);

  const unlocked = PASSPORT_COUNTRIES.filter(c => totalHours >= c.hours);
  const locked   = PASSPORT_COUNTRIES.filter(c => totalHours < c.hours);
  const next     = locked[0];

  const hoursToNext = next ? next.hours - totalHours : 0;

  return (
    <div className="arena-card passport-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">Study Passport</h3>
          <p className="arena-card-sub">Every hour unlocks a new country</p>
        </div>
        <div className="passport-counter">
          <span className="passport-num">{unlocked.length}</span>
          <span className="passport-denom">/{PASSPORT_COUNTRIES.length}</span>
          <span className="passport-label">countries</span>
        </div>
      </div>

      <div className="passport-hours-row">
        <span className="passport-hours-val">{totalHours}h</span>
        <span className="passport-hours-label">total study time</span>
        {next && (
          <span className="passport-next-hint">
            +{hoursToNext}h → <span className="passport-next-flag">{next.flag}</span> {next.name}
          </span>
        )}
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="passport-section-label">Unlocked ({unlocked.length})</div>
      )}
      <div className="passport-grid">
        {unlocked.map(c => (
          <div key={c.code} className="passport-country unlocked" title={`${c.name} — avg ${c.avg}`}>
            <span className="passport-flag">{c.flag}</span>
            <span className="passport-name">{c.name}</span>
            <span className="passport-avg">{c.avg}</span>
            <div className="passport-stamp">✓</div>
          </div>
        ))}

        {/* Next 6 locked */}
        {locked.slice(0, 6).map(c => (
          <div key={c.code} className="passport-country locked" title={`Unlock at ${c.hours}h total`}>
            <span className="passport-flag passport-flag-locked">{c.flag}</span>
            <span className="passport-name passport-locked-name">{c.hours}h needed</span>
            <div className="passport-lock">[ ]</div>
          </div>
        ))}
      </div>

      {locked.length > 6 && (
        <div className="passport-more">+{locked.length - 6} more countries to unlock</div>
      )}
    </div>
  );
}
