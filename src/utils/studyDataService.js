import { todayKey, todayKeyAt } from './dateKey';
import { computeStreak } from '../hooks/useAppHooks';

/**
 * Reads actual study records, progress, and RPG data from localStorage.
 * No fake default numbers: if the user has never studied, returns 0s accurately.
 */
export function getRealStudyData() {
  let timeLog = { byDate: {}, sessions: [] };
  try {
    const raw = localStorage.getItem('app_time_log');
    if (raw) timeLog = JSON.parse(raw);
  } catch {}

  let checkedItems = {};
  try {
    const raw = localStorage.getItem('app_progress_state');
    if (raw) checkedItems = JSON.parse(raw);
  } catch {}

  let rpgState = { xp: 0, level: 1 };
  try {
    const raw = localStorage.getItem('app_rpg_state');
    if (raw) rpgState = JSON.parse(raw);
  } catch {}

  let dailyGoalHours = 5;
  try {
    const raw = localStorage.getItem('app_daily_study_goal_hours');
    if (raw && Number(raw) > 0) dailyGoalHours = Number(raw);
  } catch {}

  const byDate = timeLog.byDate || {};
  const sessions = Array.isArray(timeLog.sessions) ? timeLog.sessions : [];

  // Calculate total minutes across all dates
  const totalMinutes = Object.values(byDate).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Real streak
  const streak = computeStreak(byDate);

  // Completed tasks count from app_progress_state
  const completedTasksCount = Object.values(checkedItems).filter(Boolean).length;

  // Today's minutes & hours
  const today = todayKey();
  const todayMinutes = Number(byDate[today] || 0);
  const todayHours = Math.round((todayMinutes / 60) * 10) / 10;

  // Past 7 days (Monday..Sunday of current week)
  const byDay = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - dayOfWeek + i);
    const k = todayKeyAt(d);
    byDay[i] = Math.round(((Number(byDate[k]) || 0) / 60) * 10) / 10;
  }

  const weekTotalHours = byDay.reduce((acc, h) => acc + h, 0);
  const weekAvgHours = Math.round((weekTotalHours / 7) * 10) / 10;

  // Subjects breakdown & peak hour from sessions
  const subjectMap = {};
  let peakHour = 20;
  let topSubject = 'General';

  if (sessions.length > 0) {
    const hourBuckets = Array(24).fill(0);
    sessions.forEach(s => {
      const sub = s.category || s.subject || s.task || 'General';
      const mins = Number(s.minutes) || 0;
      subjectMap[sub] = (subjectMap[sub] || 0) + mins * 60; // in seconds
      if (s.ts) {
        const h = new Date(s.ts).getHours();
        hourBuckets[h] += mins;
      }
    });

    const sortedSubjects = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]);
    if (sortedSubjects.length > 0) {
      topSubject = sortedSubjects[0][0];
    }

    const maxMins = Math.max(...hourBuckets);
    if (maxMins > 0) {
      peakHour = hourBuckets.indexOf(maxMins);
    }
  }

  const level = rpgState.level || (Math.floor((rpgState.xp || 0) / 250) + 1);
  const xp = rpgState.xp || 0;

  const hasAnyData = totalMinutes > 0 || completedTasksCount > 0 || streak > 0 || sessions.length > 0;

  return {
    totalMinutes,
    totalHours,
    todayMinutes,
    todayHours,
    dailyGoalHours,
    streak,
    sessions,
    sessionCount: sessions.length,
    completedTasksCount,
    checkedItems,
    byDate,
    byDay,
    weekAvgHours,
    subjectMap,
    topSubject,
    peakHour,
    level,
    xp,
    hasAnyData,
  };
}
