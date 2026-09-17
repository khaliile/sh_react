import { useState, useEffect, useCallback } from 'react';
import { useRoutineSchedule } from './useAppHooks';
import { scheduleRoutine as defaultRoutine } from '../data/constants';

const STORAGE_KEY = 'app_manual_active_task';
const MANUAL_EXPIRY_MS = 45 * 60 * 1000; // 45 minutes auto-expiration

function getStoredManualTask() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (!parsed || !parsed.name) return null;

    // Check expiration so tasks selected hours ago don't remain locked forever
    if (parsed.selectedAt && (Date.now() - parsed.selectedAt > MANUAL_EXPIRY_MS)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getAutoTaskFromSchedule(schedule) {
  const routine = (schedule && Array.isArray(schedule) && schedule.length > 0) ? schedule : defaultRoutine;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();

  // 1. Check for exact active slot (including overnight slots e.g. 22:15 - 05:00)
  const activeSlot = routine.find(s => {
    if (!s || !s.start || !s.end) return false;
    const [sH, sM] = String(s.start).trim().split(':').map(Number);
    const [eH, eM] = String(s.end).trim().split(':').map(Number);
    if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return false;

    const startMins = sH * 60 + sM;
    const endMins = eH * 60 + eM;

    if (endMins > startMins) {
      // Normal daytime slot (e.g., 06:00 to 11:00)
      return mins >= startMins && mins < endMins;
    } else if (endMins < startMins) {
      // Overnight slot spanning past midnight (e.g., 22:15 to 05:00)
      return mins >= startMins || mins < endMins;
    } else {
      return mins === startMins;
    }
  });

  if (activeSlot && activeSlot.task) {
    return activeSlot.task;
  }

  // 2. Fallback: If in a gap between slots, find the next upcoming task
  const parsedSlots = routine.map(s => {
    const [sH, sM] = (s.start || '00:00').trim().split(':').map(Number);
    return { ...s, startMins: (sH || 0) * 60 + (sM || 0) };
  }).sort((a, b) => a.startMins - b.startMins);

  const nextSlot = parsedSlots.find(s => s.startMins > mins) || parsedSlots[0];
  if (nextSlot && nextSlot.task) {
    return `${nextSlot.task} (Starts at ${nextSlot.start})`;
  }

  return "Free Time";
}

export function useActiveTask() {
  const { schedule } = useRoutineSchedule(defaultRoutine);
  const [manualTask, setManualTaskState] = useState(getStoredManualTask);
  const [autoTask, setAutoTask] = useState(() => getAutoTaskFromSchedule(schedule));

  // Periodically check if auto schedule slot transitioned (checks every 10s, only re-renders on change)
  useEffect(() => {
    const updateAuto = () => {
      const nextTask = getAutoTaskFromSchedule(schedule);
      setAutoTask(prev => (prev === nextTask ? prev : nextTask));
    };
    updateAuto();
    const timer = setInterval(updateAuto, 10000);
    return () => clearInterval(timer);
  }, [schedule]);

  // Sync across tabs and custom events
  useEffect(() => {
    const handleSync = () => {
      setManualTaskState(getStoredManualTask());
    };
    window.addEventListener('active-task-changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('active-task-changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const selectTask = useCallback((taskName, details = {}) => {
    if (!taskName) return;

    // Toggle off back to auto if clicking the currently active manual task
    if (manualTask && manualTask.name === taskName) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch { /* noop */ }
      setManualTaskState(null);
      window.dispatchEvent(new CustomEvent('active-task-changed', { detail: null }));
      return;
    }

    const taskObj = {
      name: taskName,
      id: details.id || null,
      category: details.category || 'general',
      source: details.source || 'user',
      selectedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(taskObj));
    } catch { /* noop */ }
    setManualTaskState(taskObj);
    window.dispatchEvent(new CustomEvent('active-task-changed', { detail: taskObj }));
  }, [manualTask]);

  const resetToAuto = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* noop */ }
    setManualTaskState(null);
    window.dispatchEvent(new CustomEvent('active-task-changed', { detail: null }));
  }, []);

  const isManual = !!manualTask?.name;
  const activeTaskName = isManual ? manualTask.name : autoTask;

  return {
    activeTaskName,
    manualTask,
    autoTask,
    isManual,
    selectTask,
    resetToAuto,
  };
}
