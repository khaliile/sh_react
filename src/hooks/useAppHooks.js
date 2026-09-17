import { useState, useEffect, useCallback, useRef } from 'react';
import { todayKey, todayKeyAt } from '../utils/dateKey';
import { safeSetItem } from '../utils/storagePruner';

export function useAppStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed = JSON.parse(item);
      return parsed ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  // Keep a ref to the latest storedValue so setValue can stay stable.
  const storedValueRef = useRef(storedValue);
  useEffect(() => { storedValueRef.current = storedValue; }, [storedValue]);

  const setValue = useCallback((value) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      try {
        const ok = safeSetItem(key, JSON.stringify(valueToStore));
        if (ok) {
          window.dispatchEvent(new CustomEvent(`app-storage-${key}`, { detail: valueToStore }));
        }
      } catch { /* noop */ }
      return valueToStore;
    });
  }, [key]);

  useEffect(() => {
    const handleStorageUpdate = (e) => {
      if (e?.detail !== undefined) {
        setStoredValue(e.detail);
      }
    };
    window.addEventListener(`app-storage-${key}`, handleStorageUpdate);
    return () => window.removeEventListener(`app-storage-${key}`, handleStorageUpdate);
  }, [key]);

  return [storedValue, setValue];
}

// Hook: watch for day/date rollover at 00:00 midnight live in desktop/browser app
export function useDayWatcher() {
  const [dayInfo, setDayInfo] = useState(() => ({
    dateKey: todayKey(),
    weekday: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  }));

  useEffect(() => {
    let lastDate = todayKey();
    const checkDate = () => {
      const currentDate = todayKey();
      if (currentDate !== lastDate) {
        lastDate = currentDate;
        const newWeekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        setDayInfo({ dateKey: currentDate, weekday: newWeekday });
        try {
          window.dispatchEvent(new CustomEvent('day-changed', { detail: { dateKey: currentDate, weekday: newWeekday } }));
        } catch { /* noop */ }
      }
    };

    const timer = setInterval(checkDate, 30000); // Check every 30s instead of 2s
    return () => clearInterval(timer);
  }, []);

  return dayInfo;
}

export function useLiveClock(routine) {
  const [timeData, setTimeData] = useState(() => {
    const now = new Date();
    return { clock: now.toTimeString().split(' ')[0].slice(0, 5), currentTask: '...', isManual: false };
  });

  const lastDataRef = useRef(timeData);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      let manual = null;
      try {
        const saved = localStorage.getItem('app_manual_active_task');
        if (saved) manual = JSON.parse(saved);
      } catch { /* noop */ }

      // Robust slot finding (daytime, overnight e.g. 22:15 - 05:00, and gaps)
      const list = (routine && Array.isArray(routine) && routine.length > 0) ? routine : [];
      let autoTask = "Free Time";

      const currentSlot = list.find(s => {
        if (!s || !s.start || !s.end) return false;
        const [sH, sM] = String(s.start).trim().split(':').map(Number);
        const [eH, eM] = String(s.end).trim().split(':').map(Number);
        if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return false;
        const startMins = sH * 60 + sM;
        const endMins = eH * 60 + eM;
        if (endMins > startMins) {
          return mins >= startMins && mins < endMins;
        } else if (endMins < startMins) {
          return mins >= startMins || mins < endMins;
        } else {
          return mins === startMins;
        }
      });

      if (currentSlot && currentSlot.task) {
        autoTask = currentSlot.task;
      } else if (list.length > 0) {
        const sorted = [...list].map(s => {
          const [sH, sM] = (s.start || '00:00').trim().split(':').map(Number);
          return { ...s, startMins: (sH || 0) * 60 + (sM || 0) };
        }).sort((a, b) => a.startMins - b.startMins);
        const next = sorted.find(s => s.startMins > mins) || sorted[0];
        if (next && next.task) autoTask = `${next.task} (Starts at ${next.start})`;
      }

      const currentTask = manual?.name ? manual.name : autoTask;
      const isManual = !!manual?.name;
      const newClock = now.toTimeString().split(' ')[0].slice(0, 5);

      // Only update state if something actually changed to avoid re-rendering entire pages 60 times/min
      if (
        !lastDataRef.current ||
        lastDataRef.current.clock !== newClock ||
        lastDataRef.current.currentTask !== currentTask ||
        lastDataRef.current.isManual !== isManual
      ) {
        const nextData = { clock: newClock, currentTask, isManual };
        lastDataRef.current = nextData;
        setTimeData(nextData);
      }
    };

    update();
    const timer = setInterval(update, 5000); // Check every 5s instead of 1s
    window.addEventListener('active-task-changed', update);
    window.addEventListener('storage', update);

    return () => {
      clearInterval(timer);
      window.removeEventListener('active-task-changed', update);
      window.removeEventListener('storage', update);
    };
  }, [routine]);
  return timeData;
}

// Time tracker: tracks per-day total study minutes + per-session logs.
// Storage shape: { byDate: { 'YYYY-MM-DD': minutes }, sessions: [{ date, minutes, category, task, ts }] }
export function useTimeTracker() {
  const [log, setLog] = useAppStorage('app_time_log', { byDate: {}, sessions: [] });
  const key = todayKey();
  const todayMinutes = log.byDate[key] || 0;

  const addMinutes = useCallback((minutes, meta = {}) => {
    if (!minutes || minutes <= 0) return;
    const k = todayKey();
    setLog(prev => {
      const next = { ...prev };
      next.byDate = { ...prev.byDate, [k]: (prev.byDate[k] || 0) + minutes };
      next.sessions = [
        { date: k, minutes, ts: Date.now(), ...meta },
        ...(prev.sessions || []),
      ].slice(0, 500); // cap history
      return next;
    });
  }, [setLog]);

  const removeMinutes = useCallback((minutes, meta = {}) => {
    if (!minutes || minutes <= 0) return;
    const k = todayKey();
    setLog(prev => {
      const next = { ...prev };
      next.byDate = { ...prev.byDate, [k]: Math.max(0, (prev.byDate[k] || 0) - minutes) };

      const prevSessions = Array.isArray(prev.sessions) ? [...prev.sessions] : [];
      let remainingToRemove = minutes;

      // 1. First attempt exact match by taskId if provided
      if (meta.taskId) {
        const idx = prevSessions.findIndex(s => s.taskId === meta.taskId && s.date === k);
        if (idx !== -1) {
          const sess = prevSessions[idx];
          if (sess.minutes <= remainingToRemove) {
            remainingToRemove -= sess.minutes;
            prevSessions.splice(idx, 1);
          } else {
            prevSessions[idx] = { ...sess, minutes: sess.minutes - remainingToRemove };
            remainingToRemove = 0;
          }
        }
      }

      // 2. If still remaining, match by category on today's date
      if (remainingToRemove > 0 && meta.category) {
        for (let i = 0; i < prevSessions.length; i++) {
          const s = prevSessions[i];
          if (s.date === k && s.category === meta.category) {
            if (s.minutes <= remainingToRemove) {
              remainingToRemove -= s.minutes;
              prevSessions.splice(i, 1);
              i--;
            } else {
              prevSessions[i] = { ...s, minutes: s.minutes - remainingToRemove };
              remainingToRemove = 0;
              break;
            }
            if (remainingToRemove <= 0) break;
          }
        }
      }

      // 3. Fallback: match any session for today
      if (remainingToRemove > 0) {
        for (let i = 0; i < prevSessions.length; i++) {
          const s = prevSessions[i];
          if (s.date === k) {
            if (s.minutes <= remainingToRemove) {
              remainingToRemove -= s.minutes;
              prevSessions.splice(i, 1);
              i--;
            } else {
              prevSessions[i] = { ...s, minutes: s.minutes - remainingToRemove };
              break;
            }
            if (remainingToRemove <= 0) break;
          }
        }
      }

      next.sessions = prevSessions;
      return next;
    });
  }, [setLog]);

  const setMinutesToday = useCallback((minutes) => {
    const k = todayKey();
    setLog(prev => ({ ...prev, byDate: { ...prev.byDate, [k]: Math.max(0, minutes) } }));
  }, [setLog]);

  const resetLog = useCallback(() => {
    setLog({ byDate: {}, sessions: [] });
  }, [setLog]);

  return { log, todayMinutes, addMinutes, removeMinutes, setMinutesToday, resetLog };
}

// Helper: parse "(NN min)", "(NNh)", "2 hour", "2 hours", "1.5h" from task strings.
export function parseMinutesFromTask(task) {
  if (!task || typeof task !== 'string') return null;

  // 1. Minute patterns (e.g. "(30 min)", "(45 mins)", "30 min", "45 minutes", "(20m)")
  const minParen = task.match(/\((\d+)\s*(?:min|mins|minute|minutes|m)\)/i);
  if (minParen) return parseInt(minParen[1], 10);

  const minPlain = task.match(/\b(\d+)\s*(?:min|mins|minute|minutes)\b/i);
  if (minPlain) return parseInt(minPlain[1], 10);

  // 2. Hour patterns (e.g. "(5h)", "(1.5h)", "(2 hour)", "(2 hours)", "2 hour", "2 hours", "2hr", "2hrs", "5h")
  const hrParen = task.match(/\((\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\)/i);
  if (hrParen) return Math.round(parseFloat(hrParen[1]) * 60);

  const hrPlain = task.match(/\b(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i);
  if (hrPlain) return Math.round(parseFloat(hrPlain[1]) * 60);

  return null;
}

// Helper: format minutes as "Xh Ym"
export function formatMinutes(mins) {
  const m = Math.max(0, Math.round(mins || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
}

// Helper: compute streak (consecutive days with at least 1 minute logged).
export function computeStreak(byDate) {
  if (!byDate) return 0;
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = todayKeyAt(d);
    if ((byDate[key] || 0) > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Hook: notification permission state + helpers.
export function useNotify() {
  const [permission, setPermission] = useState(() => {
    try { return Notification?.permission ?? 'default'; }
    catch { return 'default'; }
  });

  const requestPermission = async () => {
    try {
      if (typeof Notification === 'undefined') return 'denied';
      if (Notification.permission !== 'default') {
        setPermission(Notification.permission);
        return Notification.permission;
      }
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      return 'denied';
    }
  };

  // Schedule a browser notification after `delayMs` milliseconds.
  const scheduleReminder = (title, body, delayMs) => {
    if (typeof Notification === 'undefined') return;
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        try { new Notification(title, { body, icon: '/favicon.ico' }); }
        catch { /* noop */ }
      }
    }, delayMs);
  };

  return { permission, requestPermission, scheduleReminder };
}

// Helper: last N days totals for a chart.
export function lastNDays(byDate, n = 7, locale = 'en-US') {
  const out = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    const key = todayKeyAt(dd);
    const label = dd.toLocaleDateString(locale, { weekday: 'short' });
    out.push({ date: key, day: label, minutes: byDate[key] || 0 });
  }
  return out;
}

// Helper: last 60 days totals for activity heatmap grid.
export function last60Days(byDate) {
  const out = [];
  const d = new Date();
  for (let i = 59; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    const key = todayKeyAt(dd);
    const label = dd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    out.push({ date: key, label, minutes: byDate[key] || 0 });
  }
  return out;
}

// Hook: custom editable routine schedule with automatic code-defaults sync
export function useRoutineSchedule(defaultSchedule) {
  const [schedule, setSchedule] = useAppStorage('app_routine_schedule', defaultSchedule);
  const [defaultSig, setDefaultSig] = useAppStorage('app_routine_default_sig', '');

  // Synchronize when constants.js changes in code (unless user manually customized slots)
  useEffect(() => {
    try {
      const currentSig = JSON.stringify(defaultSchedule);
      const isCustomized = window.localStorage.getItem('app_routine_is_customized') === 'true';
      if (!isCustomized && defaultSig && defaultSig !== currentSig) {
        setSchedule(defaultSchedule);
        setDefaultSig(currentSig);
      } else if (!defaultSig) {
        setDefaultSig(currentSig);
      }
    } catch { /* noop */ }
  }, [defaultSchedule, defaultSig, setDefaultSig, setSchedule]);

  const addSlot = (newSlot) => {
    try { window.localStorage.setItem('app_routine_is_customized', 'true'); } catch { /* noop */ }
    setSchedule(prev => {
      const list = Array.isArray(prev) ? prev : defaultSchedule;
      return [...list, { ...newSlot, id: `t${Date.now()}` }];
    });
  };

  const updateSlot = (id, updatedFields) => {
    try { window.localStorage.setItem('app_routine_is_customized', 'true'); } catch { /* noop */ }
    setSchedule(prev => {
      const list = Array.isArray(prev) ? prev : defaultSchedule;
      return list.map(s => s.id === id ? { ...s, ...updatedFields } : s);
    });
  };

  const deleteSlot = (id) => {
    try { window.localStorage.setItem('app_routine_is_customized', 'true'); } catch { /* noop */ }
    setSchedule(prev => {
      const list = Array.isArray(prev) ? prev : defaultSchedule;
      return list.filter(s => s.id !== id);
    });
  };

  const resetToDefault = () => {
    try {
      window.localStorage.removeItem('app_routine_is_customized');
      window.localStorage.setItem('app_routine_default_sig', JSON.stringify(defaultSchedule));
    } catch { /* noop */ }
    setSchedule(defaultSchedule);
  };

  const safeSchedule = Array.isArray(schedule) && schedule.length > 0 ? schedule : defaultSchedule;

  return { schedule: safeSchedule, addSlot, updateSlot, deleteSlot, resetToDefault };
}

// Hook: daily reflections & study notes
export function useDailyNotes(currentDayKey) {
  const [notes, setNotes] = useAppStorage('app_daily_notes', {});
  const key = currentDayKey || todayKey();

  const currentNote = notes[key] || { text: '', tags: [] };

  const saveNote = (text, tags = [], extra = {}) => {
    const k = currentDayKey || todayKey();
    setNotes(prev => ({
      ...prev,
      [k]: {
        ...(prev[k] || {}),
        text,
        tags: Array.isArray(tags) ? tags : [],
        ...extra,
        updatedAt: Date.now()
      }
    }));
  };

  return { currentNote, saveNote, allNotes: notes };
}

// Hook: customizable weekly hours goal (in hours, default 70 = 10h study/day × 7)
export function useWeeklyGoal() {
  const [goalHours, setGoalHours] = useAppStorage('app_weekly_goal', 70);
  return [goalHours, setGoalHours];
}

// Default seed notes for initial schedule blocks display
const DEFAULT_SLOT_NOTES_SEED = {
  t0: [{ id: 'sn-seed-0', text: 'Surah Al-Kahf & morning adhkar', feeling: 'smile', tag: 'Spiritual', createdAt: Date.now() }],
  t1: [{ id: 'sn-seed-1', text: 'No phone before 9 AM, brew dark roast', feeling: 'fire', tag: 'Prep', createdAt: Date.now() }],
  t2: [{ id: 'sn-seed-2', text: 'Solve 3 LeetCode DP problems, finish ch. 4', feeling: 'fire', tag: 'Study', createdAt: Date.now() }],
  t4: [{ id: 'sn-seed-4', text: 'Review graph algorithms & practice recursion', feeling: 'smile', tag: 'Study', createdAt: Date.now() }],
  t6: [{ id: 'sn-seed-6', text: 'English podcast & 20 vocabulary flashcards', feeling: 'smile', tag: 'Language', createdAt: Date.now() }],
  t7: [{ id: 'sn-seed-7', text: '30 min workout & outdoor walk', feeling: 'fire', tag: 'Reward', createdAt: Date.now() }],
  t8: [{ id: 'sn-seed-8', text: 'Daily reflection & set tomorrow priorities', feeling: 'smile', tag: 'Review', createdAt: Date.now() }],
};

// Hook: schedule slot-specific notes
export function useSlotNotes(currentDayKey) {
  const [slotNotesMap, setSlotNotesMap] = useAppStorage('app_slot_notes', {});
  const k = currentDayKey || todayKey();

  const dayNotes = slotNotesMap[k] !== undefined ? slotNotesMap[k] : DEFAULT_SLOT_NOTES_SEED;

  const addNote = (slotId, text, feeling = null, tag = null) => {
    if (!text || !text.trim()) return;
    const newNote = {
      id: `sn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: text.trim(),
      feeling: feeling || null,
      tag: tag || null,
      createdAt: Date.now(),
    };
    setSlotNotesMap(prev => {
      const currentDayMap = prev[k] !== undefined ? prev[k] : DEFAULT_SLOT_NOTES_SEED;
      const currentList = currentDayMap[slotId] || [];
      return {
        ...prev,
        [k]: {
          ...currentDayMap,
          [slotId]: [newNote, ...currentList]
        }
      };
    });
  };

  const deleteNote = (slotId, noteId) => {
    setSlotNotesMap(prev => {
      const currentDayMap = prev[k] !== undefined ? prev[k] : DEFAULT_SLOT_NOTES_SEED;
      const currentList = currentDayMap[slotId] || [];
      return {
        ...prev,
        [k]: {
          ...currentDayMap,
          [slotId]: currentList.filter(n => n.id !== noteId)
        }
      };
    });
  };

  const getSlotNotes = (slotId) => {
    return dayNotes[slotId] || [];
  };

  return { dayNotes, addNote, deleteNote, getSlotNotes };
}

