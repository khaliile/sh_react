import { useState, useEffect } from 'react';

export function useAppStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; }
    catch (e) { return initialValue; }
  });
  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };
  return [storedValue, setValue];
}

export function useLiveClock(routine) {
  const [timeData, setTimeData] = useState({ clock: "00:00", currentTask: "..." });
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const task = routine.find(s => {
        const [sH, sM] = s.start.split(':').map(Number);
        const [eH, eM] = s.end.split(':').map(Number);
        return mins >= (sH * 60 + sM) && mins < (eH * 60 + eM);
      });
      setTimeData({ clock: now.toTimeString().split(' ')[0].slice(0,5), currentTask: task?.task || "Free Time" });
    };
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [routine]);
  return timeData;
}

// Time tracker: tracks per-day total study minutes + per-session logs.
// Storage shape: { byDate: { 'YYYY-MM-DD': minutes }, sessions: [{ date, minutes, category, task, ts }] }
export function useTimeTracker() {
  const todayKey = new Date().toISOString().slice(0, 10);
  const [log, setLog] = useAppStorage('app_time_log', { byDate: {}, sessions: [] });

  const todayMinutes = log.byDate[todayKey] || 0;

  const addMinutes = (minutes, meta = {}) => {
    if (!minutes || minutes <= 0) return;
    setLog(prev => {
      const next = { ...prev };
      next.byDate = { ...prev.byDate, [todayKey]: (prev.byDate[todayKey] || 0) + minutes };
      next.sessions = [
        { date: todayKey, minutes, ts: Date.now(), ...meta },
        ...(prev.sessions || []),
      ].slice(0, 500); // cap history
      return next;
    });
  };

  const setMinutesToday = (minutes) => {
    setLog(prev => ({ ...prev, byDate: { ...prev.byDate, [todayKey]: Math.max(0, minutes) } }));
  };

  const resetLog = () => {
    setLog({ byDate: {}, sessions: [] });
  };

  return { log, todayMinutes, addMinutes, setMinutesToday, resetLog };
}

// Helper: parse "(NN min)" or "(NNh)" from task strings.
export function parseMinutesFromTask(task) {
  if (!task) return null;
  const m1 = task.match(/\((\d+)\s*min\)/i);
  if (m1) return parseInt(m1[1], 10);
  const m2 = task.match(/\((\d+(?:\.\d+)?)\s*h\)/i);
  if (m2) return Math.round(parseFloat(m2[1]) * 60);
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
    const key = d.toISOString().slice(0, 10);
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
export function lastNDays(byDate, n = 7) {
  const out = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    const key = dd.toISOString().slice(0, 10);
    const label = dd.toLocaleDateString('en-US', { weekday: 'short' });
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
    const key = dd.toISOString().slice(0, 10);
    const label = dd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    out.push({ date: key, label, minutes: byDate[key] || 0 });
  }
  return out;
}

// Hook: custom editable routine schedule
export function useRoutineSchedule(defaultSchedule) {
  const [schedule, setSchedule] = useAppStorage('app_routine_schedule', defaultSchedule);

  const addSlot = (newSlot) => {
    setSchedule(prev => [...prev, { ...newSlot, id: `t${Date.now()}` }]);
  };

  const updateSlot = (id, updatedFields) => {
    setSchedule(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  const deleteSlot = (id) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  const resetToDefault = () => {
    setSchedule(defaultSchedule);
  };

  return { schedule, addSlot, updateSlot, deleteSlot, resetToDefault };
}

// Hook: daily reflections & study notes
export function useDailyNotes(currentDayKey) {
  const [notes, setNotes] = useAppStorage('app_daily_notes', {});
  const todayKey = currentDayKey || new Date().toISOString().slice(0, 10);

  const currentNote = notes[todayKey] || { text: '', tags: [] };

  const saveNote = (text, tags = []) => {
    setNotes(prev => ({
      ...prev,
      [todayKey]: { text, tags, updatedAt: Date.now() }
    }));
  };

  return { currentNote, saveNote, allNotes: notes };
}

// Hook: customizable weekly hours goal (in hours, default 56)
export function useWeeklyGoal() {
  const [goalHours, setGoalHours] = useAppStorage('app_weekly_goal', 56);
  return [goalHours, setGoalHours];
}