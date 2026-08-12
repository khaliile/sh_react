import { useState } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';

const MOODS = [
  { value: 5, label: 'Amazing', icon: '🔥', color: '#10b981' },
  { value: 4, label: 'Good',    icon: '😊', color: '#3b82f6' },
  { value: 3, label: 'Okay',    icon: '😐', color: '#f59e0b' },
  { value: 2, label: 'Tired',   icon: '😴', color: '#a78bfa' },
  { value: 1, label: 'Rough',   icon: '😣', color: '#ef4444' },
];

const ENERGY = [
  { value: 3, label: 'High',   color: '#10b981' },
  { value: 2, label: 'Medium', color: '#f59e0b' },
  { value: 1, label: 'Low',    color: '#ef4444' },
];

function last7DaysMood(moodLog) {
  const out = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    const key = dd.toISOString().slice(0, 10);
    const label = dd.toLocaleDateString('en-US', { weekday: 'short' });
    const entry = moodLog[key];
    out.push({ date: key, label, mood: entry?.mood || 0, energy: entry?.energy || 0, note: entry?.note || '' });
  }
  return out;
}

export default function MoodTracker() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const [moodLog, setMoodLog] = useAppStorage('app_mood_log', {});
  const [moodNote, setMoodNote] = useState('');
  const [saved, setSaved] = useState(false);

  const todayEntry = moodLog[todayKey] || {};
  const [selectedMood, setSelectedMood] = useState(todayEntry.mood || 0);
  const [selectedEnergy, setSelectedEnergy] = useState(todayEntry.energy || 0);

  const save = () => {
    if (!selectedMood) return;
    setMoodLog(prev => ({
      ...prev,
      [todayKey]: { mood: selectedMood, energy: selectedEnergy, note: moodNote, ts: Date.now() }
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const history = last7DaysMood(moodLog);
  const moodColors = { 5: '#10b981', 4: '#3b82f6', 3: '#f59e0b', 2: '#a78bfa', 1: '#ef4444', 0: '#333' };
  const moodIcons = { 5: '🔥', 4: '😊', 3: '😐', 2: '😴', 1: '😣', 0: '—' };

  return (
    <div className="dash-card mood-card">
      <h3>Mood &amp; Energy</h3>
      <p className="dash-sub-hint">How are you feeling today? Logged once per day.</p>

      <div className="mood-section-label">How is your mood?</div>
      <div className="mood-picker">
        {MOODS.map(m => (
          <button
            key={m.value}
            className={`mood-btn ${selectedMood === m.value ? 'mood-active' : ''}`}
            style={{ '--mood-color': m.color }}
            onClick={() => setSelectedMood(m.value)}
            title={m.label}
          >
            <span className="mood-icon">{m.icon}</span>
            <span className="mood-label">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="mood-section-label">Energy level?</div>
      <div className="energy-picker">
        {ENERGY.map(e => (
          <button
            key={e.value}
            className={`energy-btn ${selectedEnergy === e.value ? 'energy-active' : ''}`}
            style={{ '--energy-color': e.color }}
            onClick={() => setSelectedEnergy(e.value)}
          >
            <span className="energy-bar-preview">
              {Array.from({ length: e.value }).map((_, i) => (
                <span key={i} className="energy-bar-seg" style={{ background: e.color }} />
              ))}
            </span>
            {e.label}
          </button>
        ))}
      </div>

      <input
        className="mood-note-input"
        placeholder="Optional note (e.g. great workout, stressed about exam...)"
        value={moodNote}
        onChange={e => setMoodNote(e.target.value)}
        maxLength={100}
      />

      <button
        className={`mood-save-btn ${saved ? 'mood-saved' : ''}`}
        onClick={save}
        disabled={!selectedMood}
      >
        {saved ? 'Saved!' : "Log Today's Mood"}
      </button>

      <div className="mood-history">
        <div className="mood-history-label">Last 7 days</div>
        <div className="mood-history-row">
          {history.map(d => (
            <div key={d.date} className="mood-history-day" title={`${d.label}: ${MOODS.find(m => m.value === d.mood)?.label || 'No entry'}${d.note ? ' — ' + d.note : ''}`}>
              <div
                className="mood-history-dot"
                style={{ background: moodColors[d.mood] || '#333' }}
              >
                <span className="mood-history-icon">{moodIcons[d.mood]}</span>
              </div>
              <span className="mood-history-daylabel">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
