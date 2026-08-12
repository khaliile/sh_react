import { useState, useEffect, useRef } from 'react';
import { useTimeTracker, useNotify } from '../hooks/useAppHooks';
import { playTimerComplete } from '../utils/sounds';
import ZenFocusOverlay from './ZenFocusOverlay';

const PRESETS = [
  { label: '25m', mins: 25,  color: '#ef4444', mode: 'pomodoro', group: 'pomodoro' },
  { label: '5m',  mins: 5,   color: '#10b981', mode: 'break',    group: 'break'    },
  { label: '15m', mins: 15,  color: '#f59e0b', mode: 'break',    group: 'break'    },
  { label: '1h',  mins: 60,  color: '#0ea5e9', mode: 'study',    group: 'study'    },
  { label: '2h',  mins: 120, color: '#3b82f6', mode: 'study',    group: 'study'    },
  { label: '3h',  mins: 180, color: '#6366f1', mode: 'study',    group: 'study'    },
  { label: '4h',  mins: 240, color: '#8b5cf6', mode: 'study',    group: 'study'    },
  { label: '5h',  mins: 300, color: '#a78bfa', mode: 'study',    group: 'study'    },
];

const PRESET_GROUPS = [
  { key: 'pomodoro', label: 'Pomodoro' },
  { key: 'break',    label: 'Break'    },
  { key: 'study',    label: 'Study'    },
];

// Web Audio API: short ascending beep (no external file required).
function playCompletionSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
      osc.start(start);
      osc.stop(start + 0.18);
    });
  } catch (e) {
    // audio context not available, fail silently
  }
}

function fmt(secs) {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function parseHM(str) {
  if (!str) return 0;
  const trimmed = String(str).trim();
  const colon = trimmed.match(/^(\d{1,2}):(\d{1,2})$/);
  if (colon) {
    const h = parseInt(colon[1], 10);
    const m = parseInt(colon[2], 10);
    if (Number.isFinite(h) && Number.isFinite(m) && m < 60) return h * 60 + m;
    return 0;
  }
  const plain = parseInt(trimmed, 10);
  return Number.isFinite(plain) && plain > 0 ? plain : 0;
}

function formatHM(mins) {
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
}

export default function StudyTimer() {
  const { addMinutes } = useTimeTracker();
  const { permission, requestPermission, scheduleReminder } = useNotify();
  const STORAGE_KEY = 'app_study_timer';

  const [target, setTarget] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { const s = JSON.parse(saved); return s.target || 0; }
    } catch { /* noop */ }
    return 0;
  });
  const [elapsed, setElapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).elapsed || 0;
    } catch { /* noop */ }
    return 0;
  });
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return !!JSON.parse(saved).completed;
    } catch { /* noop */ }
    return false;
  });
  const [customMin, setCustomMin] = useState('');
  const [notifPerm, setNotifPerm] = useState(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  });
  const [sessionLabel, setSessionLabel] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).label || 'Study Session';
    } catch { /* noop */ }
    return 'Study Session';
  });
  const intervalRef = useRef(null);
  const completedRef = useRef(completed);
  // Track active reminder timeouts so we can cancel them on reset
  const reminderTimersRef = useRef([]);

  // Persist active session
  useEffect(() => {
    if (target === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        target, elapsed, completed, label: sessionLabel,
      }));
    } catch { /* noop */ }
  }, [target, elapsed, completed, sessionLabel]);

  // Tick loop
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= target && !completedRef.current) {
          completedRef.current = true;
          setRunning(false);
          setCompleted(true);
          const mins = Math.max(1, Math.round(target / 60));
          addMinutes(mins, { category: 'study', task: sessionLabel });
          // Play timer complete sound
          playTimerComplete();
          // Browser notification
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try { new Notification('Session complete!', { body: `${mins} minutes logged.` }); }
            catch { /* noop */ }
          }
        }
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, target, addMinutes, sessionLabel]);

  const start = async (mins, label = 'Study Session') => {
    setTarget(mins * 60);
    setElapsed(0);
    setRunning(true);
    setCompleted(false);
    setSessionLabel(label);
    completedRef.current = false;
    // Auto-request notification permission on first timer start
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await requestPermission();
    }
  };

  const pause = () => setRunning(false);
  const resume = () => setRunning(true);
  const reset = () => {
    setRunning(false);
    setTarget(0);
    setElapsed(0);
    setCompleted(false);
    completedRef.current = false;
    setSessionLabel('Study Session');
    // Clear any pending reminder timeouts
    reminderTimersRef.current.forEach(clearTimeout);
    reminderTimersRef.current = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  };

  const handleNotifyBtn = async () => {
    await requestPermission();
  };

  // "Remind me in X min" — schedule a mid-session notification
  const addReminder = (mins) => {
    const id = setTimeout(() => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(`${mins}min reminder`, {
            body: `Still going on: ${sessionLabel}`,
          });
        } catch { /* noop */ }
      }
    }, mins * 60 * 1000);
    reminderTimersRef.current.push(id);
  };

  const [isZenOpen, setIsZenOpen] = useState(false);

  const add5Mins = () => {
    setTarget(prev => prev + 300);
  };

  const remaining = Math.max(0, target - elapsed);
  const progress = target > 0 ? Math.min(100, (elapsed / target) * 100) : 0;

  const notifyGranted = permission === 'granted';
  const notifyDenied = permission === 'denied';

  // ── Idle state ──────────────────────────────────────────────────────────────
  if (target === 0) {
    return (
      <div className="dash-card timer-card">
        <div className="timer-header">
          <h3>Study Timer</h3>
          <div className="timer-header-right">
            <button
              className="quick-btn action-btn zen-launch-btn"
              onClick={() => {
                if (target === 0) start(25, '25m Pomodoro');
                setIsZenOpen(true);
              }}
            >
              Zen Mode
            </button>
            <button
              className={`notify-btn ${notifyGranted ? 'notif-granted' : notifyDenied ? 'notif-denied' : ''}`}
              onClick={handleNotifyBtn}
              title={
                notifyGranted ? 'Notifications enabled' :
                notifyDenied  ? 'Notifications blocked — check browser settings' :
                'Enable browser notifications'
              }
              aria-label={notifyGranted ? 'Notifications enabled' : 'Enable notifications'}
              disabled={notifyDenied}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                {notifyGranted && <circle cx="19" cy="5" r="3" fill="#10b981" stroke="none"/>}
              </svg>
            </button>
          </div>
        </div>
        <p className="dash-sub-hint">Pick a duration. Time auto-logs when the timer hits zero.</p>

        {/* Grouped presets */}
        <div className="timer-preset-groups">
          {PRESET_GROUPS.map(group => {
            const groupPresets = PRESETS.filter(p => p.group === group.key);
            return (
              <div key={group.key} className="preset-group">
                <span className="preset-group-label">{group.label}</span>
                <div className="preset-group-btns">
                  {groupPresets.map(p => (
                    <button
                      key={p.mins}
                      className="preset-btn"
                      style={{ borderColor: p.color, color: p.color }}
                      onClick={() => start(p.mins, `${p.label} ${p.mode}`)}
                    >
                      <span className="preset-label">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="custom-input">
          <input
            type="text"
            placeholder="H:MM  (e.g. 5:00, 2:30, 0:45)"
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            className="hm-input"
            inputMode="numeric"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const parsed = parseHM(customMin);
                if (parsed > 0) { start(parsed, `${formatHM(parsed)} session`); setCustomMin(''); }
              }
            }}
          />
          <button
            className="timer-btn primary small"
            onClick={() => {
              const parsed = parseHM(customMin);
              if (parsed > 0) { start(parsed, `${formatHM(parsed)} session`); setCustomMin(''); }
            }}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // ── Active / paused / completed state ────────────────────────────────────────
  return (
    <div className={`dash-card timer-card ${completed ? 'timer-completed' : ''}`}>
      <div className="timer-header">
        <h3>{sessionLabel}</h3>
        <div className="timer-header-right">
          {!completed && (
            <button className="quick-btn action-btn zen-launch-btn" onClick={() => setIsZenOpen(true)}>
              Zen Mode
            </button>
          )}
          {!completed && (
            <span className={`timer-badge ${running ? 'badge-running' : 'badge-paused'}`}>
              {running ? 'Running' : 'Paused'}
            </span>
          )}
          {completed && <span className="timer-badge badge-done">Done</span>}
        </div>
      </div>

      <div className={`timer-display ${running ? 'running' : ''}`}>
        <div className="timer-time">{fmt(remaining)}</div>
        <div className="timer-label">remaining of {fmt(target)}</div>

        <div className="timer-progress-bar">
          <div className="timer-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="timer-controls">
          {running ? (
            <button className="timer-btn" onClick={pause}>Pause</button>
          ) : !completed && elapsed > 0 ? (
            <button className="timer-btn primary" onClick={resume}>Resume</button>
          ) : !completed ? (
            <button className="timer-btn primary" onClick={() => setRunning(true)}>Start</button>
          ) : null}
          <button className="timer-btn secondary" onClick={reset}>Reset</button>
        </div>

        {/* Mid-session reminders — only show while running and notifications granted */}
        {running && notifyGranted && !completed && (
          <div className="reminder-row">
            <span className="reminder-label">Remind in:</span>
            {[15, 30, 60].map(m => (
              <button key={m} className="quick-btn reminder-btn" onClick={() => addReminder(m)}>
                {m}m
              </button>
            ))}
          </div>
        )}

        {completed && (
          <div className="timer-complete-banner">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="timer-complete-icon">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div>
              <div className="timer-complete-title">Study session complete!</div>
              <div className="timer-complete-sub">{Math.round(target / 60)} minutes auto-logged to your dashboard.</div>
            </div>
          </div>
        )}
      </div>

      <ZenFocusOverlay
        isOpen={isZenOpen}
        onClose={() => setIsZenOpen(false)}
        taskName={sessionLabel}
        remainingSeconds={remaining}
        targetSeconds={target}
        running={running}
        onPause={pause}
        onResume={resume}
        onAdd5Mins={add5Mins}
      />
    </div>
  );
}
