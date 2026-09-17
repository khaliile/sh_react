import { useState, useEffect, useCallback } from 'react';

/**
 * Returns the current time-of-day period based on the current hour.
 * Updates every minute.
 */
export function useDayNightCycle() {
  const getPeriod = useCallback(() => {
    const h = new Date().getHours();
    if (h >= 6 && h < 9)   return 'dawn';
    if (h >= 9 && h < 17)  return 'day';
    if (h >= 17 && h < 21) return 'dusk';
    if (h >= 21)            return 'night';
    return 'danger'; // 0–6 AM
  }, []);

  const [period, setPeriod] = useState(getPeriod);

  useEffect(() => {
    const tick = () => setPeriod(getPeriod());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [getPeriod]);

  return period;
}
