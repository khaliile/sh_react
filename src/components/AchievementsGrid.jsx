import { useMemo } from 'react';
import { computeStreak } from '../hooks/useAppHooks';

const ACHIEVEMENTS_LIST = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Log your first study session',
    check: (log) => Object.values(log.byDate || {}).some(m => m > 0),
  },
  {
    id: 'streak_3',
    title: '3-Day Streak',
    description: 'Maintain a 3-day study streak',
    check: (log) => computeStreak(log.byDate) >= 3,
  },
  {
    id: 'streak_7',
    title: '7-Day Legend',
    description: 'Maintain a 7-day study streak',
    check: (log) => computeStreak(log.byDate) >= 7,
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Log 100+ total hours of study',
    check: (log) => {
      const totalMins = Object.values(log.byDate || {}).reduce((a, b) => a + b, 0);
      return totalMins >= 6000;
    },
  },
  {
    id: 'target_hitter',
    title: 'Goal Crusher',
    description: 'Reach 100% of your weekly hours goal',
    check: (log, checkedItems, goalHours) => {
      const weekMins = Object.values(log.byDate || {}).slice(-7).reduce((a, b) => a + b, 0);
      return weekMins >= (goalHours * 60);
    },
  },
  {
    id: 'polymath',
    title: 'Polymath',
    description: 'Complete tasks in Math, Data Science & English',
    check: (log, checkedItems) => {
      const keys = Object.keys(checkedItems || {}).filter(k => checkedItems[k]);
      const hasMath = keys.some(k => k.startsWith('math-'));
      const hasDs = keys.some(k => k.startsWith('ds-'));
      const hasEng = keys.some(k => k.startsWith('english-'));
      return hasMath && hasDs && hasEng;
    },
  },
];

export default function AchievementsGrid({ log, checkedItems, goalHours = 56 }) {
  const achievements = useMemo(() => {
    return ACHIEVEMENTS_LIST.map(a => {
      const unlocked = a.check(log, checkedItems, goalHours);
      return { ...a, unlocked };
    });
  }, [log, checkedItems, goalHours]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="dash-card achievements-card">
      <div className="achievements-header">
        <h3>Achievements</h3>
        <span className="badge-count-text">{unlockedCount}/{achievements.length} Unlocked</span>
      </div>

      <div className="achievements-grid-list">
        {achievements.map(a => (
          <div key={a.id} className={`achievement-item ${a.unlocked ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">
              {a.unlocked ? '★' : '☆'}
            </div>
            <div className="achievement-info">
              <div className="achievement-title">{a.title}</div>
              <div className="achievement-desc">{a.description}</div>
            </div>
            {a.unlocked && <span className="unlocked-pill">Unlocked</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
