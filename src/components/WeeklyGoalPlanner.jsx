import { useState } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';

const SUBJECTS = [
  { key: 'math',    label: 'Math',         color: '#3b82f6' },
  { key: 'ds',      label: 'Data Science', color: '#10b981' },
  { key: 'english', label: 'English',      color: '#f59e0b' },
  { key: 'routine', label: 'Routine',      color: '#a78bfa' },
];

const DEFAULT_GOALS = { math: 10, ds: 12, english: 6, routine: 28 };

function getWeekKey() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const mon = new Date(now.setDate(diff));
  return mon.toISOString().slice(0, 10);
}

export default function WeeklyGoalPlanner({ sessionLog }) {
  const [goals, setGoals] = useGoals();
  const [editKey, setEditKey] = useState(null);
  const [editVal, setEditVal] = useState('');

  const weekKey = getWeekKey();

  // Aggregate minutes per subject from session log for this week
  const weekActual = {};
  SUBJECTS.forEach(s => weekActual[s.key] = 0);
  (sessionLog || []).forEach(sess => {
    if (sess.date >= weekKey && sess.category && weekActual[sess.category] !== undefined) {
      weekActual[sess.category] += (sess.minutes || 0);
    }
  });

  const startEdit = (key, current) => {
    setEditKey(key);
    setEditVal(String(current));
  };

  const commitEdit = () => {
    const num = parseFloat(editVal);
    if (!isNaN(num) && num > 0 && num <= 100) {
      setGoals(prev => ({ ...prev, [editKey]: num }));
    }
    setEditKey(null);
  };

  const totalGoalMins = SUBJECTS.reduce((s, sub) => s + (goals[sub.key] || 0) * 60, 0);
  const totalActualMins = SUBJECTS.reduce((s, sub) => s + (weekActual[sub.key] || 0), 0);
  const totalPct = totalGoalMins > 0 ? Math.min(100, Math.round((totalActualMins / totalGoalMins) * 100)) : 0;

  return (
    <div className="dash-card goal-planner-card">
      <div className="goal-planner-header">
        <h3>Weekly Goal Planner</h3>
        <span className="goal-planner-week">Week of {weekKey}</span>
      </div>
      <p className="dash-sub-hint">Set per-subject targets and track your weekly progress.</p>

      <div className="goal-planner-subjects">
        {SUBJECTS.map(sub => {
          const goalH = goals[sub.key] || 0;
          const goalMins = goalH * 60;
          const actual = weekActual[sub.key] || 0;
          const pct = goalMins > 0 ? Math.min(100, Math.round((actual / goalMins) * 100)) : 0;
          const actualH = (actual / 60).toFixed(1);

          return (
            <div key={sub.key} className="goal-subject-row">
              <div className="goal-subject-info">
                <div className="goal-subject-name" style={{ color: sub.color }}>{sub.label}</div>
                <div className="goal-subject-nums">
                  <span className="goal-actual">{actualH}h</span>
                  <span className="goal-sep"> / </span>
                  {editKey === sub.key ? (
                    <input
                      className="goal-edit-input"
                      type="number"
                      value={editVal}
                      min={1} max={100}
                      onChange={e => setEditVal(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditKey(null); }}
                      autoFocus
                    />
                  ) : (
                    <button
                      className="goal-target-inline"
                      style={{ color: sub.color }}
                      onClick={() => startEdit(sub.key, goalH)}
                      title="Click to edit target"
                    >
                      {goalH}h
                    </button>
                  )}
                  <span className="goal-pct-badge" style={{ background: `${sub.color}22`, color: sub.color }}>{pct}%</span>
                </div>
              </div>
              <div className="goal-bar">
                <div
                  className="goal-bar-fill"
                  style={{ width: `${pct}%`, background: sub.color, opacity: pct >= 100 ? 1 : 0.8 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall summary */}
      <div className="goal-summary-row">
        <span className="goal-summary-label">Total this week</span>
        <span className="goal-summary-vals">
          {(totalActualMins / 60).toFixed(1)}h of {(totalGoalMins / 60).toFixed(0)}h
          <span className="goal-pct-badge" style={{ background: 'rgba(255,255,255,0.07)', color: '#aaa' }}>{totalPct}%</span>
        </span>
      </div>
      <div className="goal-bar goal-total-bar">
        <div className="goal-bar-fill goal-total-fill" style={{ width: `${totalPct}%` }} />
      </div>
    </div>
  );
}

function useGoals() {
  return useAppStorage('app_weekly_subject_goals', DEFAULT_GOALS);
}
