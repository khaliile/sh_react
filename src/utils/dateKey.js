// Local-date key helper. Returns YYYY-MM-DD using the user's local timezone
// (NOT UTC like Date.prototype.toISOString does). Fixes the 1-hour-late bug
// for users east of UTC during the midnight-1am window.
export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKeyAt(date) {
  if (!date) return todayKey();
  const d = (date instanceof Date) ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function currentWeekKey() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const mon = new Date(now);
  mon.setDate(diff);
  return todayKeyAt(mon);
}

