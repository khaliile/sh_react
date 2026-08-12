import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useTimeTracker, useWeeklyGoal, useRoutineSchedule, formatMinutes, computeStreak, lastNDays } from '../hooks/useAppHooks';
import { roadmapsData, scheduleRoutine as defaultRoutine } from '../data/constants';
import StudyTimer from '../components/StudyTimer';
import ActivityHeatmap from '../components/ActivityHeatmap';
import AchievementsGrid from '../components/AchievementsGrid';
import MoodTracker from '../components/MoodTracker';
import WeeklyGoalPlanner from '../components/WeeklyGoalPlanner';

function slotMinutes(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export default function DashboardPage({ checkedItems, setCheckedItems }) {
  const { log, resetLog } = useTimeTracker();
  const [goalHours, setGoalHours] = useWeeklyGoal();
  const { schedule } = useRoutineSchedule(defaultRoutine);

  const handleResetData = () => {
    if (window.confirm("Reset all logged hours, streak, and progress to 0?")) {
      resetLog();
      if (setCheckedItems) setCheckedItems({});
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const todaysSlots = useMemo(() => {
    return schedule.map(slot => {
      const id = `routine-${today}-${slot.id}`;
      return {
        id,
        slot,
        checked: !!checkedItems[id],
        minutes: slotMinutes(slot.start, slot.end),
      };
    });
  }, [today, checkedItems, schedule]);

  const totalToday = todaysSlots.reduce((s, x) => s + (x.checked ? x.minutes : 0), 0);
  const checkedCount = todaysSlots.filter(x => x.checked).length;

  const weekData = useMemo(() => lastNDays(log.byDate, 7), [log.byDate]);
  const weekTotal = weekData.reduce((s, d) => s + d.minutes, 0);
  const weekGoalMins = (goalHours || 56) * 60;
  const streak = useMemo(() => computeStreak(log.byDate), [log.byDate]);

  const completionStats = useMemo(() => {
    let total = 0, done = 0;
    Object.entries(roadmapsData).forEach(([key, roadmap]) => {
      const day = roadmap[today];
      if (!day) return;
      total += day.tasks.length;
      day.tasks.forEach((_, idx) => {
        if (checkedItems[`${key}-${today}-${idx}`]) done++;
      });
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [today, checkedItems]);

  const categoryData = useMemo(() => {
    const counts = { routine: 0, math: 0, ds: 0, english: 0 };
    Object.values(log.sessions || []).forEach(s => {
      if (counts[s.category] !== undefined) counts[s.category] += s.minutes;
    });
    return Object.entries(counts).map(([k, v]) => ({
      name: k === 'ds' ? 'Data Science' : k === 'routine' ? 'Routine' : k.charAt(0).toUpperCase() + k.slice(1),
      value: v,
    })).filter(x => x.value > 0);
  }, [log.sessions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <section className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-sub">Your hours, calculated automatically from your schedule.</p>
        </div>
        <button className="reset-data-btn" onClick={handleResetData} title="Reset all progress & logged time to zero">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Reset Data
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <span className="stat-label">Today</span>
          <span className="stat-value">{formatMinutes(totalToday)}</span>
          <span className="stat-foot">{checkedCount}/{todaysSlots.length} slots done</span>
        </div>

        <div className="stat-card">
          <div className="stat-header-flex">
            <span className="stat-label">This Week</span>
            <button
              className="goal-target-badge"
              onClick={() => {
                const val = window.prompt("Enter new weekly goal (hours):", goalHours);
                if (val) {
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && num > 0 && num <= 168) setGoalHours(num);
                }
              }}
              title="Click to edit weekly goal target"
            >
              Target: {goalHours}h
            </button>
          </div>
          <span className="stat-value">{formatMinutes(weekTotal)}</span>
          <span className="stat-foot">of {goalHours}h target</span>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: `${Math.min(100, (weekTotal / weekGoalMins) * 100)}%`, background: '#10b981' }} />
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Roadmap Tasks</span>
          <span className="stat-value">{completionStats.done}/{completionStats.total}</span>
          <span className="stat-foot">{completionStats.pct}% complete today</span>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${completionStats.pct}%`, background: '#f59e0b' }} /></div>
        </div>

        <div className="stat-card stat-streak">
          <span className="stat-label">Streak</span>
          <span className="stat-value">{streak} {streak === 1 ? 'day' : 'days'}</span>
          <span className="stat-foot">{streak >= 7 ? 'On fire' : 'Keep going'}</span>
        </div>
      </div>

      <StudyTimer />

      <ActivityHeatmap byDate={log.byDate} />

      <AchievementsGrid log={log} checkedItems={checkedItems} goalHours={goalHours} />

      <div className="dash-row">
        <MoodTracker />
        <WeeklyGoalPlanner sessionLog={log.sessions} />
      </div>

      <div className="dash-card">
        <h3>Today's Schedule Breakdown</h3>
        <p className="dash-sub-hint">Times calculated from your schedule (click checkboxes on the Schedule page).</p>
        <ul className="slot-list">
          {todaysSlots.map(({ id, slot, checked, minutes }) => (
            <li key={id} className={`slot-row ${checked ? 'slot-done' : ''}`}>
              <div className="slot-time">{slot.start} - {slot.end}</div>
              <div className="slot-name">{slot.task}</div>
              <div className="slot-mins">
                <span className="slot-mins-val">{formatMinutes(minutes)}</span>
                <span className={`slot-status ${checked ? 'status-on' : 'status-off'}`}>{checked ? 'logged' : 'pending'}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="dash-row">
        <div className="dash-card">
          <h3>Last 7 Days Activity</h3>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <BarChart data={weekData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#777" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#777" tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 60)}h`} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(17, 17, 17, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
                  formatter={(v) => formatMinutes(v)}
                />
                <Bar dataKey="minutes" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-card">
          <h3>Time by Category</h3>
          {categoryData.length === 0 ? (
            <div className="empty-state">Log some time to see your breakdown.</div>
          ) : (
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(17, 17, 17, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
                    formatter={(v) => formatMinutes(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
