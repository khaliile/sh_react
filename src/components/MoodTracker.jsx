import { useState } from 'react';
import { FaFire, FaSmile, FaMeh, FaMoon, FaFrown, FaCheck } from 'react-icons/fa';
import { useAppStorage } from '../hooks/useAppHooks';
import { todayKey, todayKeyAt } from '../utils/dateKey';
import { useLanguage } from '../contexts/LanguageContext';

const MOODS = [
  { value: 5, labelKey: 'amazing', icon: <FaFire />, color: '#10b981' },
  { value: 4, labelKey: 'good',    icon: <FaSmile />, color: '#3b82f6' },
  { value: 3, labelKey: 'okay',    icon: <FaMeh />, color: '#f59e0b' },
  { value: 2, labelKey: 'tired',   icon: <FaMoon />, color: '#a78bfa' },
  { value: 1, labelKey: 'rough',   icon: <FaFrown />, color: '#ef4444' },
];

const ENERGY = [
  { value: 3, labelKey: 'high',   color: '#10b981' },
  { value: 2, labelKey: 'medium', color: '#f59e0b' },
  { value: 1, labelKey: 'low',    color: '#ef4444' },
];

function last7DaysMood(moodLog) {
  const out = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    const key = todayKeyAt(dd);
    const label = dd.toLocaleDateString('en-US', { weekday: 'short' });
    const entry = moodLog[key];
    out.push({ date: key, label, mood: entry?.mood || 0, energy: entry?.energy || 0, note: entry?.note || '' });
  }
  return out;
}

export default function MoodTracker() {
  const { t } = useLanguage();
  const todayKey_ = todayKey();
  const [moodLog, setMoodLog] = useAppStorage('app_mood_log', {});
  const [moodNote, setMoodNote] = useState('');
  const [saved, setSaved] = useState(false);

  const todayEntry = moodLog[todayKey_] || {};
  const [selectedMood, setSelectedMood] = useState(todayEntry.mood || 0);
  const [selectedEnergy, setSelectedEnergy] = useState(todayEntry.energy || 0);

  const save = () => {
    if (!selectedMood) return;
    setMoodLog(prev => ({
      ...prev,
      [todayKey_]: { mood: selectedMood, energy: selectedEnergy, note: moodNote, ts: Date.now() }
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const history = last7DaysMood(moodLog);
  const moodColors = { 5: '#10b981', 4: '#3b82f6', 3: '#f59e0b', 2: '#a78bfa', 1: '#ef4444', 0: '#333' };
  const moodIcons = { 5: <FaFire />, 4: <FaSmile />, 3: <FaMeh />, 2: <FaMoon />, 1: <FaFrown />, 0: '—' };

  return (
    <div className="dash-card mood-card">
      <h3>{t('mood.title')}</h3>
      <p className="dash-sub-hint">{t('mood.subtitle')}</p>

      <div className="mood-section-label">{t('mood.howMood')}</div>
      <div className="mood-picker">
        {MOODS.map(m => (
          <button
            key={m.value}
            className={`mood-btn ${selectedMood === m.value ? 'mood-active' : ''}`}
            style={{ '--mood-color': m.color }}
            onClick={() => setSelectedMood(m.value)}
            title={t(`mood.moods.${m.labelKey}`)}
          >
            <span className="mood-icon" style={{ color: m.color }}>{m.icon}</span>
            <span className="mood-label">{t(`mood.moods.${m.labelKey}`)}</span>
          </button>
        ))}
      </div>

      <div className="mood-section-label">{t('mood.howEnergy')}</div>
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
            {t(`mood.energy.${e.labelKey}`)}
          </button>
        ))}
      </div>

      <input
        className="mood-note-input"
        placeholder={t('mood.notePlaceholder')}
        value={moodNote}
        onChange={e => setMoodNote(e.target.value)}
        maxLength={100}
      />

      <button
        className={`mood-save-btn ${saved ? 'mood-saved' : ''}`}
        onClick={save}
        disabled={!selectedMood}
      >
        {saved ? <FaCheck /> : t('mood.logButton')}
      </button>

      <div className="mood-history">
        <div className="mood-history-label">{t('mood.last7Days')}</div>
        <div className="mood-history-row">
          {history.map(d => (
            <div key={d.date} className="mood-history-day" title={`${d.label}: ${MOODS.find(m => m.value === d.mood)?.labelKey || 'No entry'}${d.note ? ' — ' + d.note : ''}`}>
              <div
                className="mood-history-dot"
                style={{
                  background: d.mood ? moodColors[d.mood] : 'var(--border-color)',
                  color: d.mood ? '#ffffff' : 'var(--text-muted)',
                  boxShadow: d.mood ? `0 0 8px ${moodColors[d.mood]}40` : 'none'
                }}
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
