import { useState } from 'react';
import { FaSkull, FaSkullCrossbones, FaBookOpen, FaClone, FaDoorOpen } from 'react-icons/fa';
import { useAbyssState } from '../hooks/useAbyssState';
import './AbyssOverlay.css';

export default function AbyssOverlay() {
  const {
    abyssActive, studyMinutes, flashcardsReviewed,
    studyProgress, flashcardProgress,
    activatedAt, forceEscape
  } = useAbyssState();

  const [now] = useState(() => Date.now());

  const [skulls] = useState(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: Math.random() * 90 + 5,
    delay: Math.random() * 6,
    duration: 4 + Math.random() * 6,
    size: 16 + Math.random() * 24,
    opacity: 0.15 + Math.random() * 0.35,
  })));

  const [particles] = useState(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    bottom: Math.random() * 30,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 10,
    size: 2 + Math.random() * 4,
  })));

  const timeInAbyss = activatedAt ? Math.floor((now - activatedAt) / 3600000) : 0;

  if (!abyssActive) return null;

  return (
    <>
      {/* Background overlay */}
      <div className="abyss-overlay" />
      <div className="abyss-vignette" />

      {/* Floating skulls */}
      {skulls.map(s => (
        <div key={s.id} className="abyss-skull" style={{
          left: `${s.left}%`, bottom: '-60px', fontSize: `${s.size}px`,
          '--dur': `${s.duration}s`, '--delay': `${s.delay}s`, '--op': s.opacity,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}><FaSkull /></div>
      ))}

      {/* Rising particles */}
      {particles.map(p => (
        <div key={p.id} className="abyss-particle" style={{
          left: `${p.left}%`, bottom: `${p.bottom}%`,
          width: p.size, height: p.size, opacity: 0.4,
          '--dur': `${p.duration}s`, '--delay': `${p.delay}s`,
        }} />
      ))}

      {/* Redemption Panel */}
      <div className="abyss-panel">
        <div className="abyss-panel-title"><FaSkullCrossbones style={{ marginRight: 6 }} /> THE ABYSS — Hour {timeInAbyss}</div>
        <div className="abyss-panel-heading">Streak Broken!</div>
        <div className="abyss-panel-sub">
          Complete the redemption quest to escape.<br />Your soul is trapped until you prove yourself.
        </div>

        <div className="abyss-quest-row">
          <div className="abyss-quest-label"><FaBookOpen style={{ marginRight: 4 }} /> Study 2h</div>
          <div className="abyss-bar-track">
            <div className="abyss-bar-fill" style={{ width: `${studyProgress}%` }} />
          </div>
          <div className="abyss-bar-pct">{Math.round(studyProgress)}%</div>
        </div>
        <div style={{ fontSize: '0.65rem', color: '#6b2121', marginBottom: 8, paddingLeft: 2 }}>
          {studyMinutes}/120 min studied
        </div>

        <div className="abyss-quest-row">
          <div className="abyss-quest-label"><FaClone style={{ marginRight: 4 }} /> 10 Cards</div>
          <div className="abyss-bar-track">
            <div className="abyss-bar-fill" style={{ width: `${flashcardProgress}%` }} />
          </div>
          <div className="abyss-bar-pct">{Math.round(flashcardProgress)}%</div>
        </div>
        <div style={{ fontSize: '0.65rem', color: '#6b2121', marginBottom: 4, paddingLeft: 2 }}>
          {flashcardsReviewed}/10 flashcards reviewed
        </div>

        <button className="abyss-escape-btn" onClick={forceEscape} title="Skip the Abyss (no rewards)">
          <FaDoorOpen style={{ marginRight: 6 }} /> Skip (forfeit escape reward)
        </button>
      </div>
    </>
  );
}
