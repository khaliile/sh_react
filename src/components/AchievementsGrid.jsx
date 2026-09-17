import { useMemo } from 'react';
import { FaStar } from 'react-icons/fa';
import { computeStreak } from '../hooks/useAppHooks';
import { useLanguage } from '../contexts/LanguageContext';

const ACHIEVEMENTS_LIST = [
  {
    id: 'first_step',
    titleKey: 'achievements.items.firstStep.title',
    descKey: 'achievements.items.firstStep.description',
    check: (log) => Object.values(log.byDate || {}).some(m => m > 0),
  },
  {
    id: 'streak_3',
    titleKey: 'achievements.items.streak3.title',
    descKey: 'achievements.items.streak3.description',
    check: (log) => computeStreak(log.byDate) >= 3,
  },
  {
    id: 'streak_7',
    titleKey: 'achievements.items.streak7.title',
    descKey: 'achievements.items.streak7.description',
    check: (log) => computeStreak(log.byDate) >= 7,
  },
  {
    id: 'century_club',
    titleKey: 'achievements.items.centuryClub.title',
    descKey: 'achievements.items.centuryClub.description',
    check: (log) => {
      const totalMins = Object.values(log.byDate || {}).reduce((a, b) => a + b, 0);
      return totalMins >= 6000;
    },
  },
  {
    id: 'target_hitter',
    titleKey: 'achievements.items.goalCrusher.title',
    descKey: 'achievements.items.goalCrusher.description',
    check: (log, checkedItems, goalHours) => {
      const weekMins = Object.values(log.byDate || {}).slice(-7).reduce((a, b) => a + b, 0);
      return weekMins >= (goalHours * 60);
    },
  },
  {
    id: 'polymath',
    titleKey: 'achievements.items.polymath.title',
    descKey: 'achievements.items.polymath.description',
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
  const { t } = useLanguage();
  
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
        <h3>{t('achievements.title')}</h3>
        <span className="badge-count-text">{t('achievements.unlockedCount', { count: unlockedCount, total: achievements.length })}</span>
      </div>

      <div className="achievements-grid-list">
        {achievements.map(a => (
          <div key={a.id} className={`achievement-item ${a.unlocked ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">
              <FaStar style={{ color: a.unlocked ? '#f59e0b' : 'var(--text-muted)' }} />
            </div>
            <div className="achievement-info">
              <div className="achievement-title">{t(a.titleKey)}</div>
              <div className="achievement-desc">{t(a.descKey)}</div>
            </div>
            {a.unlocked && <span className="unlocked-pill">{t('achievements.unlocked')}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
