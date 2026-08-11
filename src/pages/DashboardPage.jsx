import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useTimeTracker, formatMinutes, computeStreak, lastNDays } from '../hooks/useAppHooks';
import { roadmapsData, scheduleRoutine } from '../data/constants';

// Compute minutes between two HH:MM strings.
function slotMinutes(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export default function DashboardPage({ checkedItems }) {
  const { log } = useTimeTracker();

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Build today's slot list with checked status + minutes
  const todaysSlots = useMemo(() => {
    return scheduleRoutine.map(slot => {
      const id = `routine-${today}-${slot.id}`;
      return {
        id,
        slot,
        checked: !!checkedItems[id],
        minutes: slotMinutes(slot.start, slot.end),
      };
    });
  }, [today, checkedItems]);

  const totalToday = todaysSlots.reduce((s, x) => s + (x.checked ? x.minutes : 0), 0);
  const checkedCount = todaysSlots.filter(x => x.checked).length;

  const weekData = useMemo(() => lastNDays(log.byDate, 7), [log.byDate]);
  const weekTotal = weekData.reduce((s, d) => s + d.minutes, 0);
  const weekGoal = 7 * 8 * 60;
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
        <h1>Dashboard</h1>
        <p className="dashboard-sub">Your hours, calculated automatically from your schedule.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <span className="stat-label">Today</span>
          <span className="stat-value">{formatMinutes(totalToday)}</span>
          <span className="stat-foot">{checkedCount}/{todaysSlots.length} slots done</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">This Week</span>
          <span className="stat-value">{formatMinutes(weekTotal)}</span>
          <span className="stat-foot">of {formatMinutes(weekGoal)} target</span>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${Math.min(100, (weekTotal / weekGoal) * 100)}%`, background: '#10b981' }} /></div>
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
          <h3>Last 7 Days</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={weekData}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" tickFormatter={(v) => `${Math.round(v / 60)}h`} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} formatter={(v) => formatMinutes(v)} />
                <Bar dataKey="minutes" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-card">
          <h3>Time by Category</h3>
          {categoryData.length === 0 ? (
            <div className="empty-state">Log some time to see your breakdown.</div>
          ) : (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(e) => `${e.name}: ${formatMinutes(e.value)}`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} formatter={(v) => formatMinutes(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
