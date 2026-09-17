import { useCallback } from 'react';
import { useAppStorage } from './useAppHooks';

// ─── 5 Daily Prayers (no emojis — icons handled in UI) ───────────────────────
export const SALAT_LIST = [
  { id: 'fajr',    nameAr: 'الفجر',   nameEn: 'Fajr',    time: '05:00' },
  { id: 'dhuhr',   nameAr: 'الظهر',   nameEn: 'Dhuhr',   time: '12:00' },
  { id: 'asr',     nameAr: 'العصر',   nameEn: 'Asr',     time: '15:30' },
  { id: 'maghrib', nameAr: 'المغرب',  nameEn: 'Maghrib', time: '18:00' },
  { id: 'isha',    nameAr: 'العشاء',  nameEn: 'Isha',    time: '20:00' },
];

// ─── Badge Store ──────────────────────────────────────────────────────────────
export const SALAT_BADGES = [
  {
    id: 'khushoo',
    nameAr: 'شارة الخشوع',
    nameEn: 'Khushoo Badge',
    descAr: 'صلّيت 5 صلوات في يوم واحد',
    descEn: 'Prayed all 5 prayers in one day',
    cost: 5,
    rarity: 'rare',
  },
  {
    id: 'mosque_walker',
    nameAr: 'شارة المسجد',
    nameEn: 'Mosque Walker',
    descAr: 'صلّيت في المسجد 10 مرات',
    descEn: 'Prayed in mosque 10 times',
    cost: 20,
    rarity: 'epic',
  },
  {
    id: 'fajr_warrior',
    nameAr: 'محارب الفجر',
    nameEn: 'Fajr Warrior',
    descAr: 'صلّيت الفجر 7 أيام متتالية',
    descEn: 'Prayed Fajr 7 days in a row',
    cost: 35,
    rarity: 'legendary',
  },
  {
    id: 'jama3a_master',
    nameAr: 'سيد الجماعة',
    nameEn: "Jama'a Master",
    descAr: 'صلّيت جميع صلوات اليوم بالمسجد',
    descEn: 'All 5 prayers in mosque in one day',
    cost: 50,
    rarity: 'mythic',
  },
];

// ─── Rarity Colors ────────────────────────────────────────────────────────────
export const BADGE_RARITY_COLORS = {
  rare:      { border: '#3b82f6', text: '#3b82f6',  label: 'Rare',      labelAr: 'نادر'    },
  epic:      { border: '#8b5cf6', text: '#8b5cf6',  label: 'Epic',      labelAr: 'ملحمي'   },
  legendary: { border: '#f59e0b', text: '#f59e0b',  label: 'Legendary', labelAr: 'أسطوري'  },
  mythic:    { border: '#ec4899', text: '#ec4899',  label: 'Mythic',    labelAr: 'خرافي'   },
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSalatStorage() {
  const [salatData, setSalatData] = useAppStorage('app_salat_state', {
    totalPoints: 0,
    dailyChecks: {},
    azkarChecks: {},
    ownedBadges: [],
    stats: { totalMosquePrayers: 0 },
  });

  const today = todayStr();
  const todayChecks = salatData.dailyChecks?.[today] || {};
  const todayAzkar = salatData.azkarChecks?.[today] || { morning: false, evening: false };

  const getPrayerState = useCallback((prayerId) => {
    return todayChecks[prayerId] || { done: false, mosque: false };
  }, [todayChecks]);

  const getAzkarState = useCallback((type) => {
    return !!todayAzkar[type];
  }, [todayAzkar]);

  const todayPoints = SALAT_LIST.reduce((acc, p) => {
    const s = todayChecks[p.id] || {};
    if (s.mosque) return acc + 2;
    if (s.done)   return acc + 1;
    return acc;
  }, 0);

  const todayDoneCount   = SALAT_LIST.filter(p => { const s = todayChecks[p.id] || {}; return s.done || s.mosque; }).length;
  const todayMosqueCount = SALAT_LIST.filter(p => (todayChecks[p.id] || {}).mosque).length;
  const todayAzkarDoneCount = (todayAzkar.morning ? 1 : 0) + (todayAzkar.evening ? 1 : 0);

  // Toggle prayer done (+1) — unchecking also clears mosque
  const togglePrayer = useCallback((prayerId) => {
    setSalatData(prev => {
      const prevDay   = prev.dailyChecks?.[today] || {};
      const prevState = prevDay[prayerId] || { done: false, mosque: false };
      const newDone   = !prevState.done;
      const newMosque = newDone ? prevState.mosque : false; // clear mosque if unchecking

      const oldPts = prevState.mosque ? 2 : prevState.done ? 1 : 0;
      const newPts = newMosque ? 2 : newDone ? 1 : 0;

      return {
        ...prev,
        totalPoints: Math.max(0, (prev.totalPoints || 0) + (newPts - oldPts)),
        dailyChecks: {
          ...prev.dailyChecks,
          [today]: { ...prevDay, [prayerId]: { done: newDone, mosque: newMosque } },
        },
      };
    });
  }, [setSalatData, today]);

  // Toggle mosque (+2) — requires done first; unchecking downgrades to +1
  const toggleMosque = useCallback((prayerId) => {
    setSalatData(prev => {
      const prevDay   = prev.dailyChecks?.[today] || {};
      const prevState = prevDay[prayerId] || { done: false, mosque: false };
      if (!prevState.done && !prevState.mosque) return prev; // guard: must be prayed first

      const newMosque = !prevState.mosque;
      const newDone   = newMosque ? true : prevState.done;

      const oldPts = prevState.mosque ? 2 : prevState.done ? 1 : 0;
      const newPts = newMosque ? 2 : newDone ? 1 : 0;

      const mosqueDelta = newMosque ? 1 : -1;

      return {
        ...prev,
        totalPoints: Math.max(0, (prev.totalPoints || 0) + (newPts - oldPts)),
        stats: {
          ...prev.stats,
          totalMosquePrayers: Math.max(0, (prev.stats?.totalMosquePrayers || 0) + mosqueDelta),
        },
        dailyChecks: {
          ...prev.dailyChecks,
          [today]: { ...prevDay, [prayerId]: { done: newDone, mosque: newMosque } },
        },
      };
    });
  }, [setSalatData, today]);

  // Toggle Azkar (+2 SP)
  const toggleAzkar = useCallback((type) => {
    setSalatData(prev => {
      const prevDayAzkar = prev.azkarChecks?.[today] || { morning: false, evening: false };
      const currentVal   = !!prevDayAzkar[type];
      const newVal       = !currentVal;
      const ptsDelta     = newVal ? 2 : -2;

      return {
        ...prev,
        totalPoints: Math.max(0, (prev.totalPoints || 0) + ptsDelta),
        azkarChecks: {
          ...prev.azkarChecks,
          [today]: {
            ...prevDayAzkar,
            [type]: newVal,
          }
        }
      };
    });
  }, [setSalatData, today]);

  // Set Azkar explicitly (e.g. from reader modal complete)
  const setAzkarDone = useCallback((type, done = true) => {
    setSalatData(prev => {
      const prevDayAzkar = prev.azkarChecks?.[today] || { morning: false, evening: false };
      const currentVal   = !!prevDayAzkar[type];
      if (currentVal === done) return prev;
      const ptsDelta = done ? 2 : -2;

      return {
        ...prev,
        totalPoints: Math.max(0, (prev.totalPoints || 0) + ptsDelta),
        azkarChecks: {
          ...prev.azkarChecks,
          [today]: {
            ...prevDayAzkar,
            [type]: done,
          }
        }
      };
    });
  }, [setSalatData, today]);

  // Buy a badge with SP
  const buyBadge = useCallback((badgeId) => {
    const badge = SALAT_BADGES.find(b => b.id === badgeId);
    if (!badge) return { success: false, msg: 'Badge not found' };
    const owned = salatData.ownedBadges || [];
    if (owned.includes(badgeId)) return { success: false, msg: isAr => isAr ? 'تملكها بالفعل' : 'Already owned' };
    if ((salatData.totalPoints || 0) < badge.cost)
      return { success: false, msg: (isAr) => isAr ? `تحتاج ${badge.cost - (salatData.totalPoints || 0)} نقطة إضافية` : `Need ${badge.cost - (salatData.totalPoints || 0)} more SP` };

    setSalatData(prev => ({
      ...prev,
      totalPoints: (prev.totalPoints || 0) - badge.cost,
      ownedBadges: [...(prev.ownedBadges || []), badgeId],
    }));
    return { success: true, msg: (isAr) => isAr ? `تم فتح ${badge.nameAr}!` : `Unlocked ${badge.nameEn}!` };
  }, [salatData, setSalatData]);

  return {
    totalPoints:    salatData.totalPoints || 0,
    todayPoints,
    todayDoneCount,
    todayMosqueCount,
    todayAzkarDoneCount,
    ownedBadges:    salatData.ownedBadges || [],
    stats:          salatData.stats || {},
    getPrayerState,
    getAzkarState,
    togglePrayer,
    toggleMosque,
    toggleAzkar,
    setAzkarDone,
    buyBadge,
  };
}
