import { useCallback, useMemo } from 'react';
import { useAppStorage } from './useAppHooks';
import { currentWeekKey } from '../utils/dateKey';
import { useRpgStorage } from './useRpgStorage';
import { playFanfare } from '../utils/sounds';
import { useLanguage } from '../contexts/LanguageContext';

const DEFAULT_QUEST_TEMPLATES = [
  {
    id: 'marathon_120',
    titleKey: 'quest.deepFocus',
    descKey: 'quest.deepFocusDesc',
    iconKey: 'marathon',
    target: 120,
    unit: 'mins',
    rewardCoins: 150,
    rewardXp: 300,
    type: 'session_duration',
  },
  {
    id: 'weekly_goal_600',
    titleKey: 'quest.knowledgeForge',
    descKey: 'quest.knowledgeForgeDesc',
    iconKey: 'energy',
    target: 600,
    unit: 'mins',
    rewardCoins: 200,
    rewardXp: 400,
    type: 'weekly_minutes',
  },
  {
    id: 'demon_500',
    titleKey: 'quest.baneDistractions',
    descKey: 'quest.baneDistractionsDesc',
    iconKey: 'sword',
    target: 500,
    unit: 'dmg',
    rewardCoins: 180,
    rewardXp: 350,
    type: 'boss_damage',
  },
  {
    id: 'streak_master_3',
    titleKey: 'quest.unbrokenDiscipline',
    descKey: 'quest.unbrokenDisciplineDesc',
    iconKey: 'flame',
    target: 3,
    unit: 'days',
    rewardCoins: 120,
    rewardXp: 250,
    type: 'streak',
  },
  {
    id: 'flashcard_review_15',
    titleKey: 'quest.grandInquisitor',
    descKey: 'quest.grandInquisitorDesc',
    iconKey: 'cards',
    target: 15,
    unit: 'cards',
    rewardCoins: 100,
    rewardXp: 200,
    type: 'flashcards',
  },
];

export function useQuestStorage() {
  const weekKey = currentWeekKey();
  const { addXpAndCoins, boss } = useRpgStorage();
  const { t } = useLanguage();
  const [log] = useAppStorage('app_time_log', { byDate: {}, sessions: [] });
  const [flashcardStats] = useAppStorage('app_flashcards_stats', { totalReviews: 0 });

  const [questState, setQuestState] = useAppStorage('app_rpg_quests', {
    weekKey,
    claimed: {},
  });

  // Calculate live progress for each quest
  const weeklyMins = useMemo(() => {
    return Object.values(log.sessions || []).reduce((sum, s) => sum + (s.minutes || 0), 0);
  }, [log.sessions]);

  const maxSingleSession = useMemo(() => {
    let max = 0;
    (log.sessions || []).forEach(s => {
      if (s.minutes > max) max = s.minutes;
    });
    return max;
  }, [log.sessions]);

  const bossDamageDealt = Math.max(0, 1000 - (boss?.currentHp || 0));

  const streakDays = useMemo(() => {
    const dates = Object.keys(log.byDate || {}).sort();
    return dates.length > 0 ? Math.min(7, dates.length) : 0;
  }, [log.byDate]);

  const [customAiQuests, setCustomAiQuests] = useAppStorage('app_custom_ai_quests', []);

  const quests = useMemo(() => {
    const allTemplates = [...DEFAULT_QUEST_TEMPLATES, ...customAiQuests];

    return allTemplates.map(q => {
      let progress = 0;
      if (q.type === 'session_duration') progress = Math.min(q.target, maxSingleSession);
      else if (q.type === 'weekly_minutes') progress = Math.min(q.target, weeklyMins);
      else if (q.type === 'boss_damage') progress = Math.min(q.target, bossDamageDealt);
      else if (q.type === 'streak') progress = Math.min(q.target, streakDays);
      else if (q.type === 'flashcards') progress = Math.min(q.target, flashcardStats.totalReviews || 0);
      else if (q.type === 'custom_study') progress = Math.min(q.target, weeklyMins);
      else progress = Math.min(q.target, q.progress || 0);

      const isCompleted = progress >= q.target;
      const isClaimed = Boolean(questState.claimed?.[q.id]);

      // Translate titles and descriptions
      const title = q.titleKey ? t(q.titleKey) : (q.title || 'Quest');
      const desc = q.descKey ? t(q.descKey) : (q.desc || '');

      return {
        ...q,
        title,
        desc,
        progress,
        isCompleted,
        isClaimed,
      };
    });
  }, [DEFAULT_QUEST_TEMPLATES, customAiQuests, maxSingleSession, weeklyMins, bossDamageDealt, streakDays, flashcardStats.totalReviews, questState.claimed, t]);

  const claimQuest = useCallback((questId) => {
    const q = quests.find(item => item.id === questId);
    if (!q || !q.isCompleted || q.isClaimed) return { success: false, message: 'Quest cannot be claimed' };

    addXpAndCoins(q.rewardXp, q.rewardCoins, `Quest: ${q.title}`);
    try {
      playFanfare();
    } catch { }

    setQuestState(prev => ({
      ...prev,
      claimed: {
        ...(prev.claimed || {}),
        [questId]: true,
      },
    }));

    return { success: true, message: `Claimed +${q.rewardCoins} Coins & +${q.rewardXp} XP!` };
  }, [quests, addXpAndCoins, setQuestState]);

  const addCustomAiQuests = useCallback((newQuests) => {
    setCustomAiQuests(prev => [...prev, ...newQuests]);
  }, [setCustomAiQuests]);

  const clearCustomAiQuests = useCallback(() => {
    setCustomAiQuests([]);
  }, [setCustomAiQuests]);

  const claimableCount = quests.filter(q => q.isCompleted && !q.isClaimed).length;

  return {
    quests,
    claimQuest,
    claimableCount,
    addCustomAiQuests,
    clearCustomAiQuests,
    hasCustomQuests: customAiQuests.length > 0,
  };
}

