import { todayKey, currentWeekKey, todayKeyAt } from './dateKey';
import { formatMinutes } from '../hooks/useAppHooks';
import { roadmapsData } from '../data/constants';
import { loadRPGStats } from './rpgSystem';
import { loadQuests } from './questStorage';

/**
 * Gather complete Daily Data Snapshot
 */
export function getDailyExportData(dateKey = todayKey()) {
  const now = new Date();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // 1. Study log & sessions
  let studyLog = { byDate: {}, sessions: [] };
  try {
    const rawLog = localStorage.getItem('app_study_log');
    if (rawLog) studyLog = JSON.parse(rawLog);
  } catch (e) {
    console.warn('Error reading app_study_log:', e);
  }

  const dayMinutes = (studyLog.byDate && studyLog.byDate[dateKey]) || 0;
  const daySessions = (studyLog.sessions || []).filter(s => s.date === dateKey);

  // 2. Goal target
  const dailyGoalHours = Number(localStorage.getItem('app_daily_study_goal_hours') || 5);
  const dailyGoalMins = dailyGoalHours * 60;
  const goalProgressPct = Math.min(100, Math.round((dayMinutes / Math.max(1, dailyGoalMins)) * 100));

  // 3. Category breakdown for today
  const categoryMinutes = {
    routine: 0,
    math: 0,
    ds: 0,
    english: 0,
    other: 0,
  };
  daySessions.forEach(sess => {
    const cat = sess.category || 'other';
    if (categoryMinutes[cat] !== undefined) {
      categoryMinutes[cat] += (sess.minutes || 0);
    } else {
      categoryMinutes.other += (sess.minutes || 0);
    }
  });

  // 4. Completed tasks for today
  let checkedItems = {};
  try {
    const rawChecked = localStorage.getItem('app_progress_state');
    if (rawChecked) checkedItems = JSON.parse(rawChecked);
  } catch (e) {}

  const completedRoadmapTasks = [];
  Object.entries(roadmapsData || {}).forEach(([subjectKey, subjectObj]) => {
    const dayObj = subjectObj[weekday];
    if (dayObj && Array.isArray(dayObj.tasks)) {
      dayObj.tasks.forEach((task, idx) => {
        const taskId = `${subjectKey}-${weekday}-${idx}`;
        if (checkedItems[taskId]) {
          completedRoadmapTasks.push({
            subject: subjectKey,
            task: task.text || task.title || task,
            taskId,
          });
        }
      });
    }
  });

  // 5. RPG Stats
  const rpgStats = loadRPGStats();

  // 6. Quests
  const quests = loadQuests();
  const completedQuests = quests.filter(q => q.completed);

  return {
    type: 'daily',
    date: dateKey,
    formattedDate,
    weekday,
    generatedAt: new Date().toISOString(),
    summary: {
      totalMinutes: dayMinutes,
      totalHoursFormatted: formatMinutes(dayMinutes),
      dailyGoalHours,
      goalProgressPct,
      sessionsCount: daySessions.length,
      completedTasksCount: completedRoadmapTasks.length,
      completedQuestsCount: completedQuests.length,
    },
    categoryBreakdown: {
      math: { minutes: categoryMinutes.math, formatted: formatMinutes(categoryMinutes.math) },
      dataScience: { minutes: categoryMinutes.ds, formatted: formatMinutes(categoryMinutes.ds) },
      english: { minutes: categoryMinutes.english, formatted: formatMinutes(categoryMinutes.english) },
      routine: { minutes: categoryMinutes.routine, formatted: formatMinutes(categoryMinutes.routine) },
      other: { minutes: categoryMinutes.other, formatted: formatMinutes(categoryMinutes.other) },
    },
    sessions: daySessions.map(s => ({
      task: s.task || 'General Focus',
      category: s.category || 'general',
      minutes: s.minutes || 0,
      formattedTime: formatMinutes(s.minutes || 0),
      timestamp: s.timestamp || null,
    })),
    completedTasks: completedRoadmapTasks,
    rpg: {
      character: rpgStats.characterName || 'Chrollo',
      level: rpgStats.level || 1,
      totalXP: rpgStats.totalXP || 0,
      rankTitle: rpgStats.rankTitle || 'Novice Scholar',
    },
  };
}

/**
 * Gather complete Weekly Data Snapshot
 */
export function getWeeklyExportData() {
  const weekKey = currentWeekKey();
  const now = new Date();
  
  // Calculate Monday of current week
  const day = now.getDay();
  const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diffToMon);

  const daysList = [];
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dKey = todayKeyAt(d);
    weekDates.push(dKey);
    daysList.push({
      dateKey: dKey,
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      fullWeekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
      dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  // 1. Study Log
  let studyLog = { byDate: {}, sessions: [] };
  try {
    const rawLog = localStorage.getItem('app_study_log');
    if (rawLog) studyLog = JSON.parse(rawLog);
  } catch (e) {}

  let weeklyTotalMinutes = 0;
  const categoryMinutes = { routine: 0, math: 0, ds: 0, english: 0, other: 0 };
  const dailyBreakdown = daysList.map(item => {
    const mins = (studyLog.byDate && studyLog.byDate[item.dateKey]) || 0;
    weeklyTotalMinutes += mins;
    return {
      ...item,
      minutes: mins,
      formattedHours: formatMinutes(mins),
    };
  });

  // Category totals for this week's dates
  (studyLog.sessions || []).forEach(sess => {
    if (weekDates.includes(sess.date)) {
      const cat = sess.category || 'other';
      if (categoryMinutes[cat] !== undefined) {
        categoryMinutes[cat] += (sess.minutes || 0);
      } else {
        categoryMinutes.other += (sess.minutes || 0);
      }
    }
  });

  // 2. Weekly Goal
  const weeklyGoalHours = Number(localStorage.getItem('app_weekly_goal_hours') || 56);
  const weeklyGoalMins = weeklyGoalHours * 60;
  const goalProgressPct = Math.min(100, Math.round((weeklyTotalMinutes / Math.max(1, weeklyGoalMins)) * 100));

  // 3. RPG & Quests
  const rpgStats = loadRPGStats();
  const quests = loadQuests();
  const completedQuests = quests.filter(q => q.completed);

  const startDateStr = daysList[0].dateFormatted;
  const endDateStr = daysList[6].dateFormatted;

  return {
    type: 'weekly',
    weekKey,
    dateRange: `${startDateStr} – ${endDateStr}, ${now.getFullYear()}`,
    generatedAt: new Date().toISOString(),
    summary: {
      totalMinutes: weeklyTotalMinutes,
      totalHoursFormatted: formatMinutes(weeklyTotalMinutes),
      weeklyGoalHours,
      goalProgressPct,
      averageDailyMinutes: Math.round(weeklyTotalMinutes / 7),
      averageDailyFormatted: formatMinutes(Math.round(weeklyTotalMinutes / 7)),
      activeDaysCount: dailyBreakdown.filter(d => d.minutes > 0).length,
    },
    dailyBreakdown,
    categoryBreakdown: {
      math: { minutes: categoryMinutes.math, formatted: formatMinutes(categoryMinutes.math) },
      dataScience: { minutes: categoryMinutes.ds, formatted: formatMinutes(categoryMinutes.ds) },
      english: { minutes: categoryMinutes.english, formatted: formatMinutes(categoryMinutes.english) },
      routine: { minutes: categoryMinutes.routine, formatted: formatMinutes(categoryMinutes.routine) },
      other: { minutes: categoryMinutes.other, formatted: formatMinutes(categoryMinutes.other) },
    },
    rpg: {
      character: rpgStats.characterName || 'Chrollo',
      level: rpgStats.level || 1,
      totalXP: rpgStats.totalXP || 0,
      rankTitle: rpgStats.rankTitle || 'Novice Scholar',
      completedQuestsCount: completedQuests.length,
    },
  };
}

/**
 * Gather complete Monthly Data Snapshot (Past 30 Days)
 */
export function getMonthlyExportData() {
  const now = new Date();
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // 30 Days array
  const daysList = [];
  const monthDates = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dKey = todayKeyAt(d);
    monthDates.push(dKey);
    daysList.push({
      dateKey: dKey,
      dayNumber: d.getDate(),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  let studyLog = { byDate: {}, sessions: [] };
  try {
    const rawLog = localStorage.getItem('app_study_log');
    if (rawLog) studyLog = JSON.parse(rawLog);
  } catch (e) {}

  let monthlyTotalMinutes = 0;
  const categoryMinutes = { routine: 0, math: 0, ds: 0, english: 0, other: 0 };
  const dailyBreakdown = daysList.map(item => {
    const mins = (studyLog.byDate && studyLog.byDate[item.dateKey]) || 0;
    monthlyTotalMinutes += mins;
    return {
      ...item,
      minutes: mins,
      formattedHours: formatMinutes(mins),
    };
  });

  (studyLog.sessions || []).forEach(sess => {
    if (monthDates.includes(sess.date)) {
      const cat = sess.category || 'other';
      if (categoryMinutes[cat] !== undefined) {
        categoryMinutes[cat] += (sess.minutes || 0);
      } else {
        categoryMinutes.other += (sess.minutes || 0);
      }
    }
  });

  const weeklyGoalHours = Number(localStorage.getItem('app_weekly_goal_hours') || 56);
  const monthlyEstimatedGoalHours = Math.round(weeklyGoalHours * 4.28);
  const monthlyGoalMins = monthlyEstimatedGoalHours * 60;
  const goalProgressPct = Math.min(100, Math.round((monthlyTotalMinutes / Math.max(1, monthlyGoalMins)) * 100));

  const rpgStats = loadRPGStats();
  const quests = loadQuests();
  const completedQuests = quests.filter(q => q.completed);

  return {
    type: 'monthly',
    monthName,
    dateRange: `${daysList[0].dateFormatted} – ${daysList[29].dateFormatted}, ${now.getFullYear()}`,
    generatedAt: new Date().toISOString(),
    summary: {
      totalMinutes: monthlyTotalMinutes,
      totalHoursFormatted: formatMinutes(monthlyTotalMinutes),
      monthlyGoalHours: monthlyEstimatedGoalHours,
      goalProgressPct,
      averageDailyMinutes: Math.round(monthlyTotalMinutes / 30),
      averageDailyFormatted: formatMinutes(Math.round(monthlyTotalMinutes / 30)),
      activeDaysCount: dailyBreakdown.filter(d => d.minutes > 0).length,
      consistencyRatePct: Math.round((dailyBreakdown.filter(d => d.minutes > 0).length / 30) * 100),
    },
    dailyBreakdown,
    categoryBreakdown: {
      math: { minutes: categoryMinutes.math, formatted: formatMinutes(categoryMinutes.math) },
      dataScience: { minutes: categoryMinutes.ds, formatted: formatMinutes(categoryMinutes.ds) },
      english: { minutes: categoryMinutes.english, formatted: formatMinutes(categoryMinutes.english) },
      routine: { minutes: categoryMinutes.routine, formatted: formatMinutes(categoryMinutes.routine) },
      other: { minutes: categoryMinutes.other, formatted: formatMinutes(categoryMinutes.other) },
    },
    rpg: {
      character: rpgStats.characterName || 'Chrollo',
      level: rpgStats.level || 1,
      totalXP: rpgStats.totalXP || 0,
      rankTitle: rpgStats.rankTitle || 'Novice Scholar',
      completedQuestsCount: completedQuests.length,
    },
  };
}

/**
 * Convert export data to formatted Markdown text
 */
export function formatDataAsMarkdown(data) {
  if (data.type === 'daily') {
    return `# 📊 Daily Study Report: ${data.formattedDate} (${data.weekday})
*Generated: ${new Date(data.generatedAt).toLocaleString()}*

---

## 🎯 Daily Summary
- **Total Study Time**: ${data.summary.totalHoursFormatted} (${data.summary.totalMinutes} minutes)
- **Daily Target**: ${data.summary.dailyGoalHours}h (${data.summary.goalProgressPct}% achieved)
- **Sessions Completed**: ${data.summary.sessionsCount}
- **Roadmap Tasks Done**: ${data.summary.completedTasksCount}
- **Quests Completed**: ${data.summary.completedQuestsCount}

---

## 📚 Time by Subject & Category
| Category | Time | Minutes |
| :--- | :--- | :--- |
| 🧮 Mathematics | ${data.categoryBreakdown.math.formatted} | ${data.categoryBreakdown.math.minutes}m |
| 🤖 Data Science | ${data.categoryBreakdown.dataScience.formatted} | ${data.categoryBreakdown.dataScience.minutes}m |
| 🇬🇧 English | ${data.categoryBreakdown.english.formatted} | ${data.categoryBreakdown.english.minutes}m |
| ⏱️ Routine Blocks | ${data.categoryBreakdown.routine.formatted} | ${data.categoryBreakdown.routine.minutes}m |
| 📌 Other Tasks | ${data.categoryBreakdown.other.formatted} | ${data.categoryBreakdown.other.minutes}m |

---

## ⏱️ Focus Sessions Today
${data.sessions.length === 0 ? '_No individual sessions recorded for today._' : data.sessions.map((s, idx) => `${idx + 1}. **${s.task}** (${s.category}) — \`${s.formattedTime}\``).join('\n')}

---

## ⚔️ RPG & Scholar Status
- **Character**: ${data.rpg.character}
- **Rank / Title**: ${data.rpg.rankTitle}
- **Level**: Lv.${data.rpg.level}
- **Lifetime XP**: ${data.rpg.totalXP.toLocaleString()} XP
`;
  }

  if (data.type === 'monthly') {
    return `# 🗓️ Monthly Study Report: ${data.monthName} (${data.dateRange})
*Generated: ${new Date(data.generatedAt).toLocaleString()}*

---

## 🏆 Monthly Summary
- **Total Monthly Hours**: ${data.summary.totalHoursFormatted} (${data.summary.totalMinutes} minutes)
- **Monthly Pacing Goal**: ${data.summary.monthlyGoalHours}h (${data.summary.goalProgressPct}% achieved)
- **Daily Average**: ${data.summary.averageDailyFormatted} / day
- **Consistency Score**: ${data.summary.consistencyRatePct}% (${data.summary.activeDaysCount} / 30 active days)

---

## 📚 Monthly Subject Distribution
- **Mathematics**: ${data.categoryBreakdown.math.formatted} (${data.categoryBreakdown.math.minutes}m)
- **Data Science**: ${data.categoryBreakdown.dataScience.formatted} (${data.categoryBreakdown.dataScience.minutes}m)
- **English**: ${data.categoryBreakdown.english.formatted} (${data.categoryBreakdown.english.minutes}m)
- **Routine Blocks**: ${data.categoryBreakdown.routine.formatted} (${data.categoryBreakdown.routine.minutes}m)
- **Other**: ${data.categoryBreakdown.other.formatted} (${data.categoryBreakdown.other.minutes}m)

---

## 📅 Daily Timeline
| Date | Weekday | Logged Time |
| :--- | :--- | :--- |
${data.dailyBreakdown.map(d => `| ${d.dateFormatted} | ${d.weekday} | \`${d.formattedHours}\` |`).join('\n')}
`;
  }

  // Weekly Report
  return `# 📈 Weekly Performance Report: ${data.dateRange} (${data.weekKey})
*Generated: ${new Date(data.generatedAt).toLocaleString()}*

---

## 🏆 Executive Summary
- **Total Study Time**: ${data.summary.totalHoursFormatted} (${data.summary.totalMinutes} minutes)
- **Weekly Goal**: ${data.summary.weeklyGoalHours}h (${data.summary.goalProgressPct}% of goal)
- **Daily Average**: ${data.summary.averageDailyFormatted} / day
- **Active Study Days**: ${data.summary.activeDaysCount} / 7 days

---

## 📅 Daily Breakdown (Monday – Sunday)
| Day | Date | Hours Logged | Minutes |
| :--- | :--- | :--- | :--- |
${data.dailyBreakdown.map(d => `| **${d.fullWeekday}** | ${d.dateFormatted} | \`${d.formattedHours}\` | ${d.minutes}m |`).join('\n')}

---

## 📚 Subject Distribution
- **Mathematics**: ${data.categoryBreakdown.math.formatted} (${data.categoryBreakdown.math.minutes}m)
- **Data Science**: ${data.categoryBreakdown.dataScience.formatted} (${data.categoryBreakdown.dataScience.minutes}m)
- **English**: ${data.categoryBreakdown.english.formatted} (${data.categoryBreakdown.english.minutes}m)
- **Routine Blocks**: ${data.categoryBreakdown.routine.formatted} (${data.categoryBreakdown.routine.minutes}m)
- **Other**: ${data.categoryBreakdown.other.formatted} (${data.categoryBreakdown.other.minutes}m)

---

## ⚔️ Scholar Growth
- **Mascot Partner**: ${data.rpg.character}
- **Current Level**: Level ${data.rpg.level} (${data.rpg.rankTitle})
- **Total Accumulated XP**: ${data.rpg.totalXP.toLocaleString()} XP
- **Completed Quests**: ${data.rpg.completedQuestsCount} quests
`;
}

/**
 * Convert export data to CSV format
 */
export function formatDataAsCSV(data) {
  if (data.type === 'daily') {
    const rows = [
      ['Date', 'Weekday', 'Total Time', 'Total Minutes', 'Goal (Hours)', 'Goal Progress (%)'],
      [data.date, data.weekday, data.summary.totalHoursFormatted, data.summary.totalMinutes, data.summary.dailyGoalHours, `${data.summary.goalProgressPct}%`],
      [],
      ['Category', 'Time Formatted', 'Minutes'],
      ['Mathematics', data.categoryBreakdown.math.formatted, data.categoryBreakdown.math.minutes],
      ['Data Science', data.categoryBreakdown.dataScience.formatted, data.categoryBreakdown.dataScience.minutes],
      ['English', data.categoryBreakdown.english.formatted, data.categoryBreakdown.english.minutes],
      ['Routine Blocks', data.categoryBreakdown.routine.formatted, data.categoryBreakdown.routine.minutes],
      ['Other', data.categoryBreakdown.other.formatted, data.categoryBreakdown.other.minutes],
      [],
      ['Session Number', 'Task Name', 'Category', 'Duration Formatted', 'Duration (Minutes)'],
    ];

    if (data.sessions.length > 0) {
      data.sessions.forEach((s, i) => {
        rows.push([i + 1, `"${(s.task || '').replace(/"/g, '""')}"`, s.category, s.formattedTime, s.minutes]);
      });
    } else {
      rows.push(['No sessions recorded', '', '', '', '']);
    }

    return rows.map(r => r.join(',')).join('\n');
  }

  if (data.type === 'monthly') {
    const rows = [
      ['Month', 'Date Range', 'Total Time', 'Total Minutes', 'Monthly Goal (Hours)', 'Goal Progress (%)', 'Daily Average', 'Consistency (%)'],
      [`"${data.monthName}"`, `"${data.dateRange}"`, data.summary.totalHoursFormatted, data.summary.totalMinutes, data.summary.monthlyGoalHours, `${data.summary.goalProgressPct}%`, data.summary.averageDailyFormatted, `${data.summary.consistencyRatePct}%`],
      [],
      ['Date', 'Weekday', 'Hours Logged', 'Minutes'],
    ];

    data.dailyBreakdown.forEach(d => {
      rows.push([d.dateKey, d.weekday, d.formattedHours, d.minutes]);
    });

    rows.push([]);
    rows.push(['Category', 'Time Formatted', 'Minutes']);
    rows.push(['Mathematics', data.categoryBreakdown.math.formatted, data.categoryBreakdown.math.minutes]);
    rows.push(['Data Science', data.categoryBreakdown.dataScience.formatted, data.categoryBreakdown.dataScience.minutes]);
    rows.push(['English', data.categoryBreakdown.english.formatted, data.categoryBreakdown.english.minutes]);
    rows.push(['Routine', data.categoryBreakdown.routine.formatted, data.categoryBreakdown.routine.minutes]);
    rows.push(['Other', data.categoryBreakdown.other.formatted, data.categoryBreakdown.other.minutes]);

    return rows.map(r => r.join(',')).join('\n');
  }

  // Weekly CSV
  const rows = [
    ['Week Identifier', 'Date Range', 'Total Time', 'Total Minutes', 'Weekly Goal (Hours)', 'Goal Progress (%)', 'Daily Average'],
    [data.weekKey, `"${data.dateRange}"`, data.summary.totalHoursFormatted, data.summary.totalMinutes, data.summary.weeklyGoalHours, `${data.summary.goalProgressPct}%`, data.summary.averageDailyFormatted],
    [],
    ['Day', 'Date', 'Hours Logged', 'Minutes'],
  ];

  data.dailyBreakdown.forEach(d => {
    rows.push([d.fullWeekday, d.dateKey, d.formattedHours, d.minutes]);
  });

  rows.push([]);
  rows.push(['Category', 'Time Formatted', 'Minutes']);
  rows.push(['Mathematics', data.categoryBreakdown.math.formatted, data.categoryBreakdown.math.minutes]);
  rows.push(['Data Science', data.categoryBreakdown.dataScience.formatted, data.categoryBreakdown.dataScience.minutes]);
  rows.push(['English', data.categoryBreakdown.english.formatted, data.categoryBreakdown.english.minutes]);
  rows.push(['Routine', data.categoryBreakdown.routine.formatted, data.categoryBreakdown.routine.minutes]);
  rows.push(['Other', data.categoryBreakdown.other.formatted, data.categoryBreakdown.other.minutes]);

  return rows.map(r => r.join(',')).join('\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(content, fileName, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
