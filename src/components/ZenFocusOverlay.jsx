import { useEffect } from 'react';
import { FaHeadphones, FaPlay, FaPause } from 'react-icons/fa';

function fmt(secs) {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function ZenFocusOverlay({
  isOpen,
  onClose,
  taskName = 'Deep Focus Session',
  remainingSeconds = 1500,
  targetSeconds = 1500,
  running = false,
  onPause,
  onResume,
  onAdd5Mins,
  isAudioPlaying = false,
  onToggleAudio,
  soundscapeId = 'binaural',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pct = targetSeconds > 0 ? Math.min(100, Math.round(((targetSeconds - remainingSeconds) / targetSeconds) * 100)) : 0;

  return (
    <div className="zen-overlay">
      <div className="zen-ambient-bg" />

      <div className="zen-top-bar">
        {onToggleAudio && (
          <button
            className={`zen-audio-toggle ${isAudioPlaying ? 'active' : ''}`}
            onClick={onToggleAudio}
            title={isAudioPlaying ? 'Pause Ambient Sound' : 'Play Ambient Sound'}
          >
            <FaHeadphones />
            <span>{isAudioPlaying ? 'Audio Playing' : 'Audio Muted'}</span>
            {isAudioPlaying ? <FaPause style={{ fontSize: '0.75rem' }} /> : <FaPlay style={{ fontSize: '0.75rem' }} />}
          </button>
        )}

        <button className="zen-exit-btn" onClick={onClose} title="Exit Zen Mode (ESC)">
          Exit Zen Mode &times;
        </button>
      </div>

      <div className="zen-content">
        <div className="zen-badge-tag">Zen Focus Mode</div>
        <h2 className="zen-task-title">{taskName}</h2>

        <div className={`zen-clock-container ${running ? 'pulsing' : ''}`}>
          <div className="zen-clock-time">{fmt(remainingSeconds)}</div>
          <div className="zen-clock-sub">remaining of {fmt(targetSeconds)} ({pct}%)</div>
        </div>

        <div className="zen-progress-bar">
          <div className="zen-progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="zen-controls">
          {running ? (
            <button className="zen-btn primary" onClick={onPause}>Pause</button>
          ) : (
            <button className="zen-btn primary" onClick={onResume}>Resume</button>
          )}

          {onAdd5Mins && (
            <button className="zen-btn secondary" onClick={onAdd5Mins}>+5 Min</button>
          )}
        </div>

        <div className="zen-hint">Press ESC to exit fullscreen focus</div>
      </div>
    </div>
  );
}
