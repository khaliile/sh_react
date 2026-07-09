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