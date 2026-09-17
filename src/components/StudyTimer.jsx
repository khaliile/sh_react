import { useState, useEffect, useRef, useCallback } from 'react';
import { useTimeTracker, useNotify, useRoutineSchedule } from '../hooks/useAppHooks';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useActiveTask } from '../hooks/useActiveTask';
import { scheduleRoutine as defaultRoutine, roadmapsData } from '../data/constants';
import { playTimerComplete } from '../utils/sounds';
import { useLanguage } from '../contexts/LanguageContext';
import { translateTask } from '../utils/taskTranslations';
import {
  SOUND_PRESETS,
  playSoundscape,
  stopSoundscape,
  setSoundscapeVolume,
  getActiveSoundscape,
  isSoundscapePlaying,
  getSoundscapeVolume
} from '../utils/soundscapes';
import {
  FaHeadphones, FaVolumeUp, FaVolumeMute, FaPlay, FaPause,
  FaBrain, FaCloudRain, FaFire, FaWater, FaWaveSquare, FaCoffee,
  FaBolt, FaStar, FaStopwatch
} from 'react-icons/fa';
import ZenFocusOverlay from './ZenFocusOverlay';
import PipTimerWidget from './PipTimerWidget';

const SOUND_ICONS = {
  binaural: <FaBrain />,
  rain: <FaCloudRain />,
  campfire: <FaFire />,
  ocean: <FaWater />,
  cyberpunk: <FaWaveSquare />,
  brown: <FaCoffee />,
};

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

function computeRemaining(state) {
  if (state.completed) return 0;
  if (state.running && state.deadline != null) {
    return Math.max(0, Math.floor((state.deadline - Date.now()) / 1000));
  }
  if (state.pausedRemaining != null) return Math.max(0, state.pausedRemaining);
  return state.target; // idle
}

export default function StudyTimer() {
  const { addMinutes } = useTimeTracker();
  const { addXpAndCoins } = useRpgStorage();
  const { permission, requestPermission } = useNotify();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const { schedule } = useRoutineSchedule(defaultRoutine);
  const { activeTaskName, isManual, selectTask, resetToAuto } = useActiveTask();
  const STORAGE_KEY = 'app_study_timer';

  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        if (s && s.target) return s;
      }
    } catch { /* noop */ }
    return { target: 0, deadline: null, pausedRemaining: null, completed: false, label: 'Study Session' };
  });

  const [customMin, setCustomMin] = useState('');
  const [isZenOpen, setIsZenOpen] = useState(false);
  // Tracks how many 25-min blocks have auto-paused so far in this session
  const [pomodoroBlocksDone, setPomodoroBlocksDone] = useState(0);
  // Whether we are currently paused AT a 25-min boundary (vs manually paused)
  const [isPomodoroPaused, setIsPomodoroPaused] = useState(false);
  const pomodoroBlocksDoneRef = useRef(0);
  useEffect(() => { pomodoroBlocksDoneRef.current = pomodoroBlocksDone; }, [pomodoroBlocksDone]);

  // Soundscape audio integration state
  const [soundscapeId, setSoundscapeId] = useState(() => {
    return localStorage.getItem('app_timer_soundscape') || getActiveSoundscape() || 'binaural';
  });
  const [isAudioPlaying, setIsAudioPlaying] = useState(() => isSoundscapePlaying());
  const [autoPlayAudio, setAutoPlayAudio] = useState(() => {
    const saved = localStorage.getItem('app_timer_autoplay_audio');
    return saved !== null ? saved === 'true' : true;
  });
  const [soundVolume, setSoundVolume] = useState(() => getSoundscapeVolume());

  // Listen to soundscape changes across components
  useEffect(() => {
    const handleSoundChange = (e) => {
      if (e.detail) {
        setIsAudioPlaying(Boolean(e.detail.isPlaying));
        if (e.detail.active) setSoundscapeId(e.detail.active);
        if (typeof e.detail.volume === 'number') setSoundVolume(e.detail.volume);
      }
    };
    window.addEventListener('soundscape-changed', handleSoundChange);
    return () => window.removeEventListener('soundscape-changed', handleSoundChange);
  }, []);

  const handleSelectSoundscape = (id) => {
    setSoundscapeId(id);
    try { localStorage.setItem('app_timer_soundscape', id); } catch { /* noop */ }
    if (isAudioPlaying || state.running) {
      playSoundscape(id, soundVolume);
    }
  };

  const handleToggleSoundPlay = () => {
    if (isAudioPlaying) {
      stopSoundscape();
    } else {
      playSoundscape(soundscapeId, soundVolume);
    }
  };

  const handleToggleAutoPlay = () => {
    const next = !autoPlayAudio;
    setAutoPlayAudio(next);
    try { localStorage.setItem('app_timer_autoplay_audio', String(next)); } catch { /* noop */ }
  };

  const handleSoundVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setSoundVolume(val);
    setSoundscapeVolume(val);
  };

  // Force re-render every second while running so the display ticks down.
  const [, force] = useState(0);
  const forceUpdate = useCallback(() => force(x => (x + 1) & 0x7fffffff), []);

  const completedRef = useRef(false);
  const targetRef = useRef(state.target);
  const labelRef = useRef(state.label);
  const deadlineRef = useRef(state.deadline);
  const addMinutesRef = useRef(addMinutes);
  const addXpAndCoinsRef = useRef(addXpAndCoins);
  const forceUpdateRef = useRef(forceUpdate);
  const setStateRef = useRef(setState);

  useEffect(() => { targetRef.current = state.target; }, [state.target]);
  useEffect(() => { labelRef.current = state.label; }, [state.label]);
  useEffect(() => { deadlineRef.current = state.deadline; }, [state.deadline]);
  useEffect(() => { addMinutesRef.current = addMinutes; }, [addMinutes]);
  useEffect(() => { addXpAndCoinsRef.current = addXpAndCoins; }, [addXpAndCoins]);
  useEffect(() => { forceUpdateRef.current = forceUpdate; }, [forceUpdate]);
  useEffect(() => { setStateRef.current = setState; }, [setState]);

  // ── 25-min Pomodoro block checkpoint detector ────────────────────────────────
  // Fires a mascot event and auto-pauses whenever elapsed time crosses a 25-min
  // boundary, but only when the total target is >= 25 min.
  const POMODORO_BLOCK_SECS = 25 * 60; // 1500 s
  useEffect(() => {
    if (!state.running || !state.deadline || state.completed) return;
    if (targetRef.current < POMODORO_BLOCK_SECS) return; // pure <25-min timers use the full-complete handler

    // Compute which block we're in right now
    const elapsedNow = Math.max(0, targetRef.current - Math.max(0, Math.floor((state.deadline - Date.now()) / 1000)));
    const currentBlock = Math.floor(elapsedNow / POMODORO_BLOCK_SECS); // 0-indexed block already completed
    const nextBlockElapsed = (currentBlock + 1) * POMODORO_BLOCK_SECS;
    if (nextBlockElapsed >= targetRef.current) return; // last partial block — let full-complete handler take over

    const msUntilNextBoundary = Math.max(0, (nextBlockElapsed - elapsedNow) * 1000);

    const id = setTimeout(() => {
      // Guard: only fire if timer is still running and this block hasn't been counted
      if (pomodoroBlocksDoneRef.current <= currentBlock) {
        const blockNumber = currentBlock + 1;
        pomodoroBlocksDoneRef.current = blockNumber;
        setPomodoroBlocksDone(blockNumber);
        setIsPomodoroPaused(true);

        // Auto-pause
        setStateRef.current(prev => {
          if (!prev.running || prev.deadline == null) return prev;
          const rem = Math.max(0, Math.floor((prev.deadline - Date.now()) / 1000));
          return { ...prev, running: false, deadline: null, pausedRemaining: rem };
        });
        stopSoundscape();
        playTimerComplete();

        // Fire mascot event
        try {
          const todayKey = new Date().toISOString().slice(0, 10);
          const rawLog = localStorage.getItem('app_time_log');
          const parsedLog = rawLog ? JSON.parse(rawLog) : null;
          const todayMins = parsedLog?.byDate?.[todayKey] || 0;
          window.dispatchEvent(new CustomEvent('pomodoro-complete', {
            detail: {
              completedMins: 25,
              taskName: labelRef.current,
              todayTotalMins: todayMins + blockNumber * 25,
              blockNumber,
              totalBlocks: Math.ceil(targetRef.current / POMODORO_BLOCK_SECS),
            },
          }));
        } catch { /* noop */ }
      }
    }, msUntilNextBoundary);

    return () => clearTimeout(id);
  // Re-arm whenever running/deadline changes (after resume, etc.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.running, state.deadline, state.completed]);

  // Detect completion
  useEffect(() => {
    if (!state.running || !state.deadline || state.completed) return;
    const delay = Math.max(0, state.deadline - Date.now());
    const id = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      const mins = Math.max(1, Math.round(targetRef.current / 60));
      const taskName = labelRef.current;

      const taskLower = (taskName || '').toLowerCase();
      let category = 'routine';
      // Combo Multiplier calculation
      let comboMultiplier = 1.0;
      let comboName = 'Standard';
      if (mins >= 60) {
        comboMultiplier = 2.0;
        comboName = 'ULTRA COMBO (2.0x XP)';
      } else if (mins >= 30) {
        comboMultiplier = 1.5;
        comboName = 'SUPER COMBO (1.5x XP)';
      } else if (mins >= 15) {
        comboMultiplier = 1.2;
        comboName = 'FOCUS COMBO (1.2x XP)';
      }

      const effectiveXp = Math.round(mins * 2 * comboMultiplier);
      const earnedCoins = Math.round(mins / 2);

      addMinutesRef.current(mins, { category, task: taskName });
      addXpAndCoinsRef.current(effectiveXp, earnedCoins, `${taskName} [${comboName}]`);

      // Trigger Loot Drop & Session Complete global events
      window.dispatchEvent(new CustomEvent('loot-drop'));
      window.dispatchEvent(new CustomEvent('timer-session-complete', {
        detail: { mins, taskName, effectiveXp, comboMultiplier }
      }));

      // Stop background soundscape and play victory chime
      stopSoundscape();
      playTimerComplete();

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try { new Notification('Session complete!', { body: `${mins} minutes logged. +${effectiveXp} XP (${comboName})` }); } catch { /* noop */ }
      }

      // --- Mascot auto-speak bridge ---
      // Read today's running total from localStorage (safe: addMinutesRef already fired).
      try {
        const todayKey = new Date().toISOString().slice(0, 10);
        const rawLog = localStorage.getItem('app_time_log');
        const parsedLog = rawLog ? JSON.parse(rawLog) : null;
        const todayMins = (parsedLog?.byDate?.[todayKey] || 0) + mins; // include this session
        
        // Check if this was a break timer (5min or 15min)
        const isBreakTimer = labelRef.current && (
          labelRef.current.toLowerCase().includes('break') || 
          mins === 5 || 
          mins === 15
        );
        
        if (isBreakTimer) {
          // Dispatch BREAK_END event for mascot
          window.dispatchEvent(new CustomEvent('mascot-event', {
            detail: {
              type: 'BREAK_END',
              userMessage: `Break finished (${mins} min)`,
            },
          }));
        } else {
          // Regular pomodoro/study complete
          window.dispatchEvent(new CustomEvent('pomodoro-complete', {
            detail: { completedMins: mins, taskName, todayTotalMins: todayMins },
          }));
        }
      } catch { /* noop — mascot trigger is best-effort */ }
      // --------------------------------

      setStateRef.current(prev => ({
        ...prev,
        running: false,
        completed: true,
        deadline: null,
        pausedRemaining: 0,
      }));
    }, delay);
    return () => clearTimeout(id);
  }, [state.deadline, state.running, state.completed]);

  // 1-second tick while running
  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(forceUpdate, 1000);
    return () => clearInterval(id);
  }, [state.running, forceUpdate]);

  // Persist state
  useEffect(() => {
    try {
      if (state.target === 0) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* noop */ }
  }, [state]);

  // Auto-sync label with activeTaskName while idle
  useEffect(() => {
    if (state.target === 0 && !state.running && activeTaskName && state.label !== activeTaskName) {
      setState(prev => ({ ...prev, label: activeTaskName }));
    }
  }, [activeTaskName, state.target, state.running, state.label]);

  // ── Derived Pomodoro block stats ─────────────────────────────────────────────
  const remaining = computeRemaining(state);
  const elapsed = Math.max(0, state.target - remaining);
  const progress = state.target > 0 ? Math.min(100, (elapsed / state.target) * 100) : 0;

  // How many 25-min blocks fit in the total target (0 if target < 25m)
  const totalPomoBlocks = state.target > 0 ? Math.floor(state.target / (25 * 60)) : 0;
  // Which block is the user currently in (1-indexed, 0 = before first block)
  const currentBlock = state.target > 0 ? Math.floor(elapsed / (25 * 60)) : 0;

  // ── Mascot event bridge helper ──────────────────────────────────────────────
  const dispatchMascotEvent = (eventType, extra = {}) => {
    try {
      window.dispatchEvent(new CustomEvent('mascot-event', {
        detail: { eventType, ...extra },
      }));
    } catch { /* noop */ }
  };

  // ── Actions ─────────────────────────────────────────────────────────────────
  const start = useCallback(async (mins, overrideLabel) => {
    const labelToUse = overrideLabel || state.label || activeTaskName || 'Study Session';
    completedRef.current = false;
    setPomodoroBlocksDone(0);
    pomodoroBlocksDoneRef.current = 0;
    setIsPomodoroPaused(false);
    const target = mins * 60;
    setState({
      target,
      deadline: Date.now() + target * 1000,
      pausedRemaining: null,
      completed: false,
      running: true,
      label: labelToUse,
    });

    // Auto-play ambient audio when timer starts
    if (autoPlayAudio && soundscapeId) {
      playSoundscape(soundscapeId, soundVolume);
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await requestPermission();
    }

    // Tell mascot a new session just started
    dispatchMascotEvent('SESSION_START', { taskName: labelToUse, userMessage: `${mins}-minute session on: ${labelToUse}` });
  }, [state.label, activeTaskName, autoPlayAudio, soundscapeId, soundVolume, requestPermission, dispatchMascotEvent]);

  const pause = useCallback(() => {
    setState(prev => {
      if (!prev.running || prev.deadline == null) return prev;
      const rem = Math.max(0, Math.floor((prev.deadline - Date.now()) / 1000));
      return { ...prev, running: false, deadline: null, pausedRemaining: rem };
    });
    if (autoPlayAudio) {
      stopSoundscape();
    }
    // Tell mascot the timer was manually paused
    dispatchMascotEvent('TIMER_PAUSED', { taskName: labelRef.current });
  }, [autoPlayAudio, dispatchMascotEvent]);

  const resume = useCallback(() => {
    const wasInBreak = isPomodoroPaused;
    setState(prev => {
      if (prev.running || prev.completed) return prev;
      const rem = prev.pausedRemaining != null ? prev.pausedRemaining : prev.target;
      return { ...prev, running: true, deadline: Date.now() + rem * 1000, pausedRemaining: null };
    });
    setIsPomodoroPaused(false);
    if (autoPlayAudio && soundscapeId) {
      playSoundscape(soundscapeId, soundVolume);
    }
    if (wasInBreak) {
      dispatchMascotEvent('BREAK_END', { taskName: labelRef.current });
    }
  }, [autoPlayAudio, soundscapeId, soundVolume, isPomodoroPaused, dispatchMascotEvent]);

  const reset = useCallback(() => {
    completedRef.current = false;
    setPomodoroBlocksDone(0);
    pomodoroBlocksDoneRef.current = 0;
    setIsPomodoroPaused(false);
    // Tell mascot the session was reset
    if (state.target > 0) { // only fire if a session was actually running
      dispatchMascotEvent('TIMER_RESET', { taskName: labelRef.current });
    }
    setState({
      target: 0,
      deadline: null,
      pausedRemaining: null,
      completed: false,
      running: false,
      label: activeTaskName || 'Study Session',
    });
    stopSoundscape();
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }, [activeTaskName, dispatchMascotEvent]);

  const add5Mins = useCallback(() => {
    setState(prev => {
      if (prev.completed) return prev;
      const newTarget = prev.target + 300;
      if (prev.running && prev.deadline != null) {
        return { ...prev, target: newTarget, deadline: prev.deadline + 300 * 1000 };
      }
      const newPaused = (prev.pausedRemaining != null ? prev.pausedRemaining : prev.target) + 300;
      return { ...prev, target: newTarget, pausedRemaining: newPaused };
    });
  }, []);

  // Mid-session reminders
  const [activeReminders, setActiveReminders] = useState([]);
  const addReminder = useCallback((mins) => {
    const id = setTimeout(() => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try { new Notification(`${mins}min reminder`, { body: `Still going on: ${labelRef.current}` }); }
        catch { /* noop */ }
      }
    }, mins * 60 * 1000);
    setActiveReminders(prev => [...prev, id]);
  }, []);

  const handleReset = useCallback(() => {
    activeReminders.forEach(clearTimeout);
    setActiveReminders([]);
    reset();
  }, [activeReminders, reset]);

  const handleNotifyBtn = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  // Command palette event bridge
  useEffect(() => {
    const handleCmdPomodoro25 = () => start(25, activeTaskName);
    const handleCmdTimer60 = () => start(60, activeTaskName);
    const handleCmdStop = () => reset();
    const handleQuickLog2h = () => {
      addMinutes(120, { category: 'ds', task: 'Quick Focus (2h)' });
      addXpAndCoins(240, 60, 'Quick Focus Session (2h)');
      window.dispatchEvent(new CustomEvent('loot-drop'));
    };

    window.addEventListener('cmd-start-pomodoro-25', handleCmdPomodoro25);
    window.addEventListener('cmd-start-timer-60', handleCmdTimer60);
    window.addEventListener('cmd-stop-timer', handleCmdStop);
    window.addEventListener('cmd-quick-log-2h', handleQuickLog2h);

    return () => {
      window.removeEventListener('cmd-start-pomodoro-25', handleCmdPomodoro25);
      window.removeEventListener('cmd-start-timer-60', handleCmdTimer60);
      window.removeEventListener('cmd-stop-timer', handleCmdStop);
      window.removeEventListener('cmd-quick-log-2h', handleQuickLog2h);
    };
  }, [activeTaskName, addMinutes, addXpAndCoins, start, reset]);

  const notifyGranted = permission === 'granted';
  const notifyDenied = permission === 'denied';
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // ── Render soundscape focus bar ─────────────────────────────────────────────
  const renderSoundscapeBar = () => {
    const activeObj = SOUND_PRESETS.find(p => p.id === soundscapeId);
    return (
      <div className="timer-soundscape-bar">
        <div className="soundscape-bar-header">
          <div className="soundscape-title-left">
            <FaHeadphones className={`soundscape-icon-head ${isAudioPlaying ? 'pulse' : ''}`} />
            <span className="soundscape-title-text">{t('timer.focusSoundscapes')}</span>
            <span className="soundscape-active-badge">
              {isAudioPlaying ? `${t('timer.playing')} ${activeObj?.name || soundscapeId}` : t('timer.ready')}
            </span>
          </div>

          <div className="soundscape-bar-actions">
            <label className="soundscape-autoplay-toggle" title={t('timer.autoPlayWithTimer')}>
              <input
                type="checkbox"
                checked={autoPlayAudio}
                onChange={handleToggleAutoPlay}
              />
              <span>{t('timer.autoPlayWithTimer')}</span>
            </label>

            <button
              className={`soundscape-play-toggle-btn ${isAudioPlaying ? 'active-playing' : ''}`}
              onClick={handleToggleSoundPlay}
              title={isAudioPlaying ? t('timer.pauseSound') : t('timer.playAudio')}
            >
              {isAudioPlaying ? (
                <>
                  <FaPause style={{ fontSize: '0.75rem' }} />
                  <span>{t('timer.pauseSound')}</span>
                  <div className="sound-wave-bars mini">
                    <span className="bar b1" />
                    <span className="bar b2" />
                    <span className="bar b3" />
                  </div>
                </>
              ) : (
                <>
                  <FaPlay style={{ fontSize: '0.75rem' }} />
                  <span>{t('timer.playAudio')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="soundscape-presets-chips">
          {SOUND_PRESETS.map(preset => {
            const isSelected = soundscapeId === preset.id;
            const translatedName = t(`timer.soundPresets.${preset.id}`) || preset.name;
            return (
              <button
                key={preset.id}
                className={`soundscape-chip ${isSelected ? 'selected' : ''} ${isSelected && isAudioPlaying ? 'playing' : ''}`}
                onClick={() => handleSelectSoundscape(preset.id)}
                title={preset.desc}
              >
                <span className="chip-icon">{SOUND_ICONS[preset.id] || <FaHeadphones />}</span>
                <span className="chip-name">{translatedName}</span>
              </button>
            );
          })}
        </div>

        {isAudioPlaying && (
          <div className="soundscape-mini-vol">
            {soundVolume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={handleSoundVolumeChange}
              className="soundscape-vol-slider"
            />
            <span className="soundscape-vol-pct">{Math.round(soundVolume * 100)}%</span>
          </div>
        )}
      </div>
    );
  };

  // ── Idle state ──────────────────────────────────────────────────────────────
  if (state.target === 0) {
    return (
      <div className="dash-card timer-card">
        <div className="timer-header">
          <div>
            <h3>{t('timer.title')}</h3>
            <div className="timer-active-target-badge">
              {t('timer.targetTask')} <strong>{translateTask(activeTaskName, isAr)}</strong>
              <span className={`active-mode-tag ${isManual ? 'mode-manual' : 'mode-auto'}`}>
                {isManual ? `  ${t('timer.selected')}` : ` ${t('timer.auto')}`}
              </span>
            </div>
          </div>

          <div className="timer-header-right">
            <button
              className="quick-btn action-btn zen-launch-btn"
              onClick={() => {
                if (state.target === 0) start(25, activeTaskName);
                setIsZenOpen(true);
              }}
            >
              {t('timer.zenMode')}
            </button>
            <button
              className={`notify-btn ${notifyGranted ? 'notif-granted' : notifyDenied ? 'notif-denied' : ''}`}
              onClick={handleNotifyBtn}
              title={
                notifyGranted ? t('timer.notificationsEnabled') :
                notifyDenied  ? t('timer.notificationsBlocked') :
                t('timer.enableNotifications')
              }
              aria-label={notifyGranted ? t('timer.notificationsEnabled') : t('timer.enableNotifications')}
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

        {/* Task Selection Dropdown */}
        <div className="timer-task-picker">
          <label className="picker-label">{t('timer.selectTask')}</label>
          <select
            className="task-select-dropdown"
            value={activeTaskName}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '__auto__') {
                resetToAuto();
              } else {
                selectTask(val, { source: 'timer-picker' });
              }
            }}
          >
            <optgroup label={t('timer.autoMode')}>
              <option value="__auto__">{t('timer.autoSchedule')}</option>
            </optgroup>
            <optgroup label={t('timer.todaysSchedule')}>
              {schedule.map(s => (
                <option key={s.id} value={s.task}>
                  {s.start} - {s.end}: {translateTask(s.task, isAr)}
                </option>
              ))}
            </optgroup>
            {Object.entries(roadmapsData).map(([key, roadmap]) => {
              const dayTasks = roadmap[todayName]?.tasks || [];
              if (dayTasks.length === 0) return null;
              return (
                <optgroup key={key} label={`${roadmap.title} (${todayName})`}>
                  {dayTasks.map((tItem, idx) => (
                    <option key={`${key}-${idx}`} value={tItem}>
                      {translateTask(tItem, isAr)}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        {/* Focus Audio Soundscapes Bar */}
        {renderSoundscapeBar()}

        <p className="dash-sub-hint">{t('timer.pickDuration')}</p>

        {/* Grouped presets */}
        <div className="timer-preset-groups">
          {PRESET_GROUPS.map(group => {
            const groupPresets = PRESETS.filter(p => p.group === group.key);
            return (
              <div key={group.key} className="preset-group">
                <span className="preset-group-label">{t(`timer.${group.key}`)}</span>
                <div className="preset-group-btns">
                  {groupPresets.map(p => (
                    <button
                      key={p.mins}
                      className="preset-btn"
                      style={{ borderColor: p.color, color: p.color }}
                      onClick={() => start(p.mins, activeTaskName)}
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
            placeholder={t('timer.placeholderTime')}
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            className="hm-input"
            inputMode="numeric"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const parsed = parseHM(customMin);
                if (parsed > 0) { start(parsed, activeTaskName); setCustomMin(''); }
              }
            }}
          />
          <button
            className="timer-btn primary small"
            onClick={() => {
              const parsed = parseHM(customMin);
              if (parsed > 0) { start(parsed, activeTaskName); setCustomMin(''); }
            }}
          >
            {t('timer.start')}
          </button>
        </div>
      </div>
    );
  }

  // ── Active / paused / completed state ────────────────────────────────────────
  return (
    <div className={`dash-card timer-card ${state.completed ? 'timer-completed' : ''}`}>
      <div className="timer-header">
        <div>
          <h3>{state.label}</h3>
          <div className="timer-active-target-badge">
            <span className={`active-mode-tag ${isManual ? 'mode-manual' : 'mode-auto'}`}>
              {isManual ? ' Manual' : ' Auto'}
            </span>
          </div>
        </div>
        <div className="timer-header-right">
          {!state.completed && (
            <PipTimerWidget
              taskName={state.label}
              remainingSeconds={remaining}
              totalSeconds={state.target}
              isRunning={state.running}
            />
          )}
          {!state.completed && (
            <button className="quick-btn action-btn zen-launch-btn" onClick={() => setIsZenOpen(true)}>
              Zen Mode
            </button>
          )}
          {!state.completed && (
            <span className={`timer-badge ${state.running ? 'badge-running' : 'badge-paused'}`}>
              {state.running ? 'Running' : 'Paused'}
            </span>
          )}
          {state.completed && <span className="timer-badge badge-done">Done</span>}
        </div>
      </div>

      <div className={`timer-display ${state.running ? 'running' : ''}`}>
        {/* Dynamic Combo Multiplier Badge */}
        {state.target >= 900 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 800,
            marginBottom: '8px',
            background: state.target >= 3600 ? 'rgba(239, 68, 68, 0.15)' : state.target >= 1800 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)',
            border: `1px solid ${state.target >= 3600 ? '#ef4444' : state.target >= 1800 ? '#f59e0b' : '#38bdf8'}`,
            color: state.target >= 3600 ? '#f87171' : state.target >= 1800 ? '#fbbf24' : '#38bdf8',
            boxShadow: `0 0 12px ${state.target >= 3600 ? 'rgba(239,68,68,0.3)' : state.target >= 1800 ? 'rgba(245,158,11,0.3)' : 'rgba(56,189,248,0.3)'}`
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {state.target >= 3600 ? <><FaFire /> ULTRA COMBO (2.0x XP)</> : state.target >= 1800 ? <><FaBolt /> SUPER COMBO (1.5x XP)</> : <><FaStar /> FOCUS COMBO (1.2x XP)</>}
            </span>
          </div>
        )}
        <div className="timer-time">{fmt(remaining)}</div>
        <div className="timer-label">remaining of {fmt(state.target)}</div>

        {/* ── Pomodoro multi-point progress bar ── */}
        <div className="pomo-progress-wrapper">
          <div className="pomo-progress-bar">
            <div className="pomo-progress-fill" style={{ width: `${progress}%` }} />
            {/* Checkpoint tick marks — one per 25-min boundary (not at 0% or 100%) */}
            {totalPomoBlocks > 1 && Array.from({ length: totalPomoBlocks - 1 }, (_, i) => {
              const pct = ((i + 1) * 25 * 60 / state.target) * 100;
              const isDone = (i + 1) <= pomodoroBlocksDone;
              return (
                <div
                  key={i}
                  className={`pomo-tick ${isDone ? 'pomo-tick-done' : ''}`}
                  style={{ left: `${pct}%` }}
                  title={`Pomodoro ${i + 1} checkpoint`}
                />
              );
            })}
          </div>
          {/* Block indicator pills */}
          {totalPomoBlocks > 0 && (
            <div className="pomo-block-row">
              {Array.from({ length: totalPomoBlocks }, (_, i) => (
                <span
                  key={i}
                  className={`pomo-block-pill ${
                    i < pomodoroBlocksDone ? 'pill-done' :
                    i === currentBlock && state.running ? 'pill-active' : 'pill-pending'
                  }`}
                  title={`Block ${i + 1}: 25 min`}
                />
              ))}
              <span className="pomo-block-label">
                {pomodoroBlocksDone}/{totalPomoBlocks} blocks
              </span>
            </div>
          )}
        </div>

        {/* Auto-pause banner */}
        {isPomodoroPaused && !state.running && !state.completed && (
          <div className="pomo-pause-banner">
            <span className="pomo-pause-icon"><FaStopwatch /></span>
            <div>
              <div className="pomo-pause-title">Pomodoro block {pomodoroBlocksDone} complete!</div>
              <div className="pomo-pause-sub">Take a short break, then press <strong>Resume</strong> to continue.</div>
            </div>
          </div>
        )}

        <div className="timer-controls">
          {state.running ? (
            <button className="timer-btn" onClick={pause}>Pause</button>
          ) : !state.completed && elapsed > 0 ? (
            <button className="timer-btn primary" onClick={resume}>Resume</button>
          ) : !state.completed ? (
            <button className="timer-btn primary" onClick={() => {
              setState(s => ({ ...s, running: true, deadline: Date.now() + s.target * 1000, pausedRemaining: null }));
              if (autoPlayAudio && soundscapeId) playSoundscape(soundscapeId, soundVolume);
            }}>Start</button>
          ) : null}
          <button className="timer-btn secondary" onClick={handleReset}>Reset</button>
        </div>

        {/* Ambient focus soundscape controls while active */}
        {!state.completed && renderSoundscapeBar()}

        {/* Mid-session reminders */}
        {state.running && notifyGranted && !state.completed && (
          <div className="reminder-row">
            <span className="reminder-label">Remind in:</span>
            {[15, 30, 60].map(m => (
              <button key={m} className="quick-btn reminder-btn" onClick={() => addReminder(m)}>
                {m}m
              </button>
            ))}
          </div>
        )}

        {state.completed && (
          <div className="timer-complete-banner">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="timer-complete-icon">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div>
              <div className="timer-complete-title">Study session complete!</div>
              <div className="timer-complete-sub">{Math.round(state.target / 60)} minutes auto-logged to your dashboard.</div>
            </div>
          </div>
        )}
      </div>

      <ZenFocusOverlay
        isOpen={isZenOpen}
        onClose={() => setIsZenOpen(false)}
        taskName={state.label}
        remainingSeconds={remaining}
        targetSeconds={state.target}
        running={state.running}
        onPause={pause}
        onResume={resume}
        onAdd5Mins={add5Mins}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleSoundPlay}
        soundscapeId={soundscapeId}
      />
    </div>
  );
}
