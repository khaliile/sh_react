import { useEffect, useCallback } from 'react';
import { useAppStorage } from './useAppHooks';
import { todayKey } from '../utils/dateKey';
import { roadmapsData, scheduleRoutine } from '../data/constants';
import { awardXP } from '../utils/rpgSystem';
import {
  TEACH_MAX_HP,
  DOFLAMINGO_MAX_HP,
  TEACH_REWARD_COINS,
  TEACH_REWARD_XP,
  DOFLAMINGO_REWARD_COINS,
  DOFLAMINGO_REWARD_XP,
  xpToLevel,
} from '../data/gameBalance';

const AVAILABLE_THEMES = [
  { id: 'default', name: 'Dark Void', cost: 0, tag: 'Starter', preview: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', colors: ['#0f172a', '#1e293b', '#3b82f6', '#f8fafc'] },
  { id: 'oled', name: 'Midnight OLED', cost: 75, tag: 'Tier 1', preview: 'linear-gradient(135deg, #000000 0%, #0c1829 60%, #38bdf8 100%)', colors: ['#000000', '#08080c', '#38bdf8', '#f0f9ff'] },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', cost: 150, tag: 'Tier 1', preview: 'linear-gradient(135deg, #09090b 0%, #06b6d4 50%, #f43f5e 100%)', colors: ['#09090b', '#121217', '#06b6d4', '#ec4899'] },
  { id: 'crimson', name: 'Tokyo Crimson', cost: 200, tag: 'Tier 1', preview: 'linear-gradient(135deg, #140508 0%, #881337 55%, #f43f5e 100%)', colors: ['#0f0507', '#19090d', '#e11d48', '#ffe4e6'] },
  { id: 'dracula', name: 'Dracula Eclipse', cost: 250, tag: 'Tier 2', preview: 'linear-gradient(135deg, #181a20 0%, #44475a 50%, #bd93f9 100%)', colors: ['#181a20', '#21222c', '#bd93f9', '#f8f8f2'] },
  { id: 'synthwave', name: 'Synthwave Dusk', cost: 300, tag: 'Tier 2', preview: 'linear-gradient(135deg, #150920 0%, #d946ef 55%, #8b5cf6 100%)', colors: ['#150920', '#201030', '#d946ef', '#fae8ff'] },
  { id: 'nordic', name: 'Nordic Frost', cost: 350, tag: 'Tier 2', preview: 'linear-gradient(135deg, #081420 0%, #1e3a5f 50%, #38bdf8 100%)', colors: ['#081420', '#0f2338', '#38bdf8', '#f0f9ff'] },
  { id: 'amber', name: 'Sunset Amber', cost: 400, tag: 'Tier 2', preview: 'linear-gradient(135deg, #140702 0%, #c2410c 50%, #fb923c 100%)', colors: ['#140702', '#220d04', '#f97316', '#ffedd5'] },
  { id: 'emerald', name: 'Emerald Matrix', cost: 450, tag: 'Tier 3', preview: 'linear-gradient(135deg, #021e17 0%, #10b981 50%, #059669 100%)', colors: ['#021e17', '#042f24', '#10b981', '#ecfdf5'] },
  { id: 'amethyst', name: 'Amethyst Nebula', cost: 500, tag: 'Tier 3', preview: 'linear-gradient(135deg, #100720 0%, #581c87 50%, #a855f7 100%)', colors: ['#100720', '#1c0d38', '#a855f7', '#faf5ff'] },
  { id: 'oceanic', name: 'Oceanic Abyss', cost: 550, tag: 'Tier 3', preview: 'linear-gradient(135deg, #02121c 0%, #083344 50%, #06b6d4 100%)', colors: ['#02121c', '#062030', '#06b6d4', '#ecfeff'] },
  { id: 'gold', name: 'Royal Gold', cost: 600, tag: 'Tier 4', preview: 'linear-gradient(135deg, #16130b 0%, #f59e0b 50%, #eab308 100%)', colors: ['#16130b', '#262010', '#f59e0b', '#fefce8'] },
  { id: 'mocha', name: 'Espresso Mocha', cost: 650, tag: 'Tier 4', preview: 'linear-gradient(135deg, #120d08 0%, #452414 50%, #d97706 100%)', colors: ['#120d08', '#20160e', '#d97706', '#fef3c7'] },
  { id: 'phantom', name: 'Phantom Violet', cost: 750, tag: 'Tier 4', preview: 'linear-gradient(135deg, #08080d 0%, #2e1065 50%, #7c3aed 100%)', colors: ['#08080d', '#131120', '#7c3aed', '#f5f3ff'] },
  { id: 'celestial', name: 'Celestial God', cost: 1000, tag: 'Mythic', preview: 'linear-gradient(135deg, #070010 0%, #6b21a8 35%, #ec4899 70%, #38bdf8 100%)', colors: ['#070010', '#150024', '#ec4899', '#38bdf8'] },
];


/** Count all completable tasks for a given day name (e.g. "Tuesday") */
function calcDailyTaskCount(dayName) {
  // Default schedule slots
  let total = scheduleRoutine.length;

  // Roadmap tasks for this day across all roadmaps
  Object.values(roadmapsData).forEach(roadmap => {
    const day = roadmap[dayName];
    if (day?.tasks) total += day.tasks.length;
  });

  // Fixed arena activities: BrainWakeup + DailySpin
  total += 2;

  return Math.max(1, total);
}

const todayStr = todayKey;
const todayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

const freshBoss = (level = 1) => {
  const taskCount = calcDailyTaskCount(todayName());
  const dmgPerTask = TEACH_MAX_HP / taskCount;
  return {
    id: 'teach',
    name: 'Marshall D. Teach',
    title: 'Emperor of Darkness',
    maxHp: TEACH_MAX_HP,
    currentHp: TEACH_MAX_HP,     // starts full, goes down as tasks done
    level,
    rewardCoins: TEACH_REWARD_COINS,
    rewardXp: TEACH_REWARD_XP,
    defeated: false,
    lastResetDate: todayStr(),
    dailyTaskCount: taskCount,  // total tasks today
    dmgPerTask,                 // damage each task deals = 1000 / taskCount
  };
};

const freshDoflamingoBoss = (level = 2) => {
  const taskCount = calcDailyTaskCount(todayName());
  const dmgPerTask = DOFLAMINGO_MAX_HP / taskCount;
  return {
    id: 'doflamingo',
    name: 'Donquixote Doflamingo',
    title: 'Heavenly Demon',
    maxHp: DOFLAMINGO_MAX_HP,
    currentHp: DOFLAMINGO_MAX_HP,
    level: 60,
    rewardCoins: DOFLAMINGO_REWARD_COINS,
    rewardXp: DOFLAMINGO_REWARD_XP,
    defeated: false,
    lastResetDate: todayStr(),
    dailyTaskCount: taskCount,
    dmgPerTask,
  };
};

export function useRpgStorage() {
  const [rpgData, setRpgData] = useAppStorage('app_rpg_state', {
    xp: 0,
    coins: 0,
    currentTheme: 'default',
    unlockedThemes: ['default'],
    boss: freshBoss(1),
    doflamingoBoss: freshDoflamingoBoss(2),
    attackLog: [],
  });

  // Exponential level curve — early levels are fast, later levels scale up
  // See src/data/gameBalance.js for the formula and examples
  const { level, currentLevelXp, nextLevelXp } = xpToLevel(rpgData.xp);

  // Sync theme
  useEffect(() => {
    const activeAppTheme = localStorage.getItem('app_theme');
    if (activeAppTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
      return;
    }
    document.documentElement.setAttribute('data-theme', rpgData.currentTheme || 'default');
  }, [rpgData.currentTheme]);

  // ── Daily reset: new day OR missing new fields → fresh boss ─────────────────
  const checkAndResetBoss = useCallback(() => {
    const today = todayStr();
    setRpgData(prev => {
      const b = prev.boss;
      const db = prev.doflamingoBoss;
      const isNewDay = !b?.lastResetDate || b.lastResetDate !== today;
      const isMigration = !b || b.dmgPerTask === undefined || !db;

      if (isNewDay || isMigration) {
        const prevLevel = b?.level || 1;
        const newBoss = freshBoss(prevLevel);
        const newDoflamingo = freshDoflamingoBoss(2);
        return {
          ...prev,
          boss: newBoss,
          doflamingoBoss: newDoflamingo,
          attackLog: isNewDay && !isMigration
            ? [{
                id: Date.now(),
                text: ` New Day! Boss restored to ${TEACH_MAX_HP} HP — ${newBoss.dailyTaskCount} tasks to deal full damage!`,
                ts: 'DAILY',
              }]
            : (prev.attackLog || []),
        };
      }
      return prev;
    });
  }, [setRpgData]);

  useEffect(() => {
    checkAndResetBoss();
    window.addEventListener('day-changed', checkAndResetBoss);
    return () => window.removeEventListener('day-changed', checkAndResetBoss);
  }, [checkAndResetBoss]);

  // ── v2 reset: zero out XP, coins, and boss progress ──────────────────────────
  useEffect(() => {
    if (!localStorage.getItem('app_rpg_reset_v2')) {
      try {
        localStorage.removeItem('study_hub_character_rpg_stats');
        localStorage.removeItem('study_hub_rpg_stats');
      } catch { /* noop */ }
      setRpgData({
        xp: 0,
        coins: 0,
        currentTheme: 'default',
        unlockedThemes: ['default'],
        boss: freshBoss(1),
        doflamingoBoss: freshDoflamingoBoss(2),
        attackLog: [],
      });
      localStorage.setItem('app_rpg_reset_v2', 'true');
    }
  }, [setRpgData]);


  /**
   * Call this whenever any task is completed.
   * Damage = 1000 / totalDailyTasks, so completing every task = boss at 0 HP.
   */
  const addXpAndCoins = useCallback((xpAmount, coinAmount = Math.round(xpAmount / 5), reason = '') => {
    if (!xpAmount && !coinAmount) return;

    let effectiveXp = xpAmount;
    if (xpAmount > 0) {
      try {
        const invRaw = localStorage.getItem('app_rpg_inventory');
        if (invRaw) {
          const inv = JSON.parse(invRaw);
          if (inv?.activeBuffs?.doubleXpUntil && inv.activeBuffs.doubleXpUntil > Date.now()) {
            effectiveXp = xpAmount * 2;
          }
        }
      } catch { }

      // Award XP to active equipped character in the RPG System
      awardXP(effectiveXp, reason);
    }

    setRpgData(prev => {
      let nextXp = prev.xp + effectiveXp;
      let nextCoins = prev.coins + coinAmount;
      let boss = { ...prev.boss };
      let doflamingoBoss = { ...(prev.doflamingoBoss || freshDoflamingoBoss(2)) };
      let attackLog = [...(prev.attackLog || [])];

      if (!boss.defeated && effectiveXp > 0) {
        // Each task deals exactly dmgPerTask (1000 / total tasks today)
        const dmg = Math.round(boss.dmgPerTask || (TEACH_MAX_HP / (boss.dailyTaskCount || 20)));
        const newHp = Math.max(0, boss.currentHp - dmg);

        boss = { ...boss, currentHp: newHp };

        attackLog.unshift({
          id: Date.now(),
          text: `-${dmg} HP (${reason || 'Task'}) — Marshall D. Teach at ${newHp}/${TEACH_MAX_HP}`,
          ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        attackLog = attackLog.slice(0, 10);

        if (newHp === 0 && !boss.defeated) {
          boss.defeated = true;
          nextCoins += boss.rewardCoins;
          nextXp += boss.rewardXp;
          attackLog.unshift({
            id: Date.now() + 1,
            text: `Marshall D. Teach Defeated! Donquixote Doflamingo Awakens! +${boss.rewardCoins} Coins & +${boss.rewardXp} XP!`,
            ts: 'VICTORY',
          });
          try {
            window.dispatchEvent(new CustomEvent('boss-defeated', { detail: { bossId: 'teach' } }));
          } catch {}
        }
      } else if (boss.defeated && !doflamingoBoss.defeated && effectiveXp > 0) {
        // Teach is already defeated! Damage Doflamingo (Phase 2)
        const dmg = Math.round(doflamingoBoss.dmgPerTask || (doflamingoBoss.maxHp / (doflamingoBoss.dailyTaskCount || 20)));
        const newHp = Math.max(0, doflamingoBoss.currentHp - dmg);

        doflamingoBoss = { ...doflamingoBoss, currentHp: newHp };

        attackLog.unshift({
          id: Date.now(),
          text: `-${dmg} HP (${reason || 'Task'}) — Doflamingo at ${newHp}/${doflamingoBoss.maxHp}`,
          ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        attackLog = attackLog.slice(0, 10);

        if (newHp === 0 && !doflamingoBoss.defeated) {
          doflamingoBoss.defeated = true;
          nextCoins += doflamingoBoss.rewardCoins;
          nextXp += doflamingoBoss.rewardXp;
          attackLog.unshift({
            id: Date.now() + 1,
            text: `Donquixote Doflamingo Defeated! Daily Boss Arena Cleared! +${doflamingoBoss.rewardCoins} Coins & +${doflamingoBoss.rewardXp} XP!`,
            ts: 'VICTORY',
          });
          try {
            window.dispatchEvent(new CustomEvent('boss-defeated', { detail: { bossId: 'doflamingo' } }));
          } catch {}
        }
      }

      return { ...prev, xp: nextXp, coins: nextCoins, boss, doflamingoBoss, attackLog };
    });
  }, [setRpgData]);

  const damageBoss = useCallback((dmgAmount = 200, reason = 'Boss Bomb', targetBossId = null) => {
    setRpgData(prev => {
      let boss = { ...prev.boss };
      let doflamingoBoss = { ...(prev.doflamingoBoss || freshDoflamingoBoss(2)) };
      let attackLog = [...(prev.attackLog || [])];
      let nextCoins = prev.coins;
      let nextXp = prev.xp;

      const isDoflamingo = targetBossId === 'doflamingo' || (boss.defeated && !targetBossId);

      if (isDoflamingo) {
        if (doflamingoBoss.defeated) return prev;
        const newHp = Math.max(0, doflamingoBoss.currentHp - dmgAmount);
        doflamingoBoss = { ...doflamingoBoss, currentHp: newHp };

        attackLog.unshift({
          id: Date.now(),
          text: `-${dmgAmount} HP (${reason}) — Doflamingo at ${newHp}/${doflamingoBoss.maxHp}`,
          ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        attackLog = attackLog.slice(0, 10);

        if (newHp === 0 && !doflamingoBoss.defeated) {
          doflamingoBoss.defeated = true;
          nextCoins += doflamingoBoss.rewardCoins;
          nextXp += doflamingoBoss.rewardXp;
          attackLog.unshift({
            id: Date.now() + 1,
            text: `Donquixote Doflamingo Defeated! +${doflamingoBoss.rewardCoins} Coins & +${doflamingoBoss.rewardXp} XP!`,
            ts: 'VICTORY',
          });
          try {
            window.dispatchEvent(new CustomEvent('boss-defeated', { detail: { bossId: 'doflamingo' } }));
          } catch {}
        }
      } else {
        if (boss.defeated) return prev;
        const newHp = Math.max(0, boss.currentHp - dmgAmount);
        boss = { ...boss, currentHp: newHp };

        attackLog.unshift({
          id: Date.now(),
          text: `-${dmgAmount} HP (${reason}) — Marshall D. Teach at ${newHp}/${TEACH_MAX_HP}`,
          ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        attackLog = attackLog.slice(0, 10);

        if (newHp === 0 && !boss.defeated) {
          boss.defeated = true;
          nextCoins += boss.rewardCoins;
          nextXp += boss.rewardXp;
          attackLog.unshift({
            id: Date.now() + 1,
            text: `Marshall D. Teach Defeated! Donquixote Doflamingo Awakens! +${boss.rewardCoins} Coins & +${boss.rewardXp} XP!`,
            ts: 'VICTORY',
          });
          try {
            window.dispatchEvent(new CustomEvent('boss-defeated', { detail: { bossId: 'teach' } }));
          } catch {}
        }
      }

      return { ...prev, xp: nextXp, coins: nextCoins, boss, doflamingoBoss, attackLog };
    });
  }, [setRpgData]);

  const buyTheme = useCallback((themeId) => {
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
    if (!theme) return { success: false, message: 'Invalid theme' };
    const unlocked = rpgData.unlockedThemes || ['default'];
    if (unlocked.includes(themeId)) return { success: false, message: 'Theme already unlocked' };
    if ((rpgData.coins || 0) < theme.cost) return { success: false, message: `Need ${theme.cost - (rpgData.coins || 0)} more coins` };

    const nextCoins = Math.max(0, (rpgData.coins || 0) - theme.cost);
    const nextUnlocked = [...unlocked, themeId];

    setRpgData(prev => ({
      ...prev,
      coins: nextCoins,
      unlockedThemes: nextUnlocked,
      currentTheme: themeId,
    }));

    try {
      localStorage.setItem('app_theme', themeId);
      localStorage.setItem('app_rpg_theme', themeId);
      document.documentElement.setAttribute('data-theme', themeId);
      document.body.setAttribute('data-theme', themeId);
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: themeId } }));
    } catch { /* noop */ }

    return { success: true, message: `Unlocked & Equipped ${theme.name}!` };
  }, [rpgData.coins, rpgData.unlockedThemes, setRpgData]);

  const equipTheme = useCallback((themeId) => {
    const unlocked = rpgData.unlockedThemes || ['default'];
    if (!unlocked.includes(themeId)) return { success: false, message: 'Theme is locked. Unlock it with coins first!' };
    
    setRpgData(prev => ({ ...prev, currentTheme: themeId }));

    try {
      localStorage.setItem('app_theme', themeId);
      localStorage.setItem('app_rpg_theme', themeId);
      document.documentElement.setAttribute('data-theme', themeId);
      document.body.setAttribute('data-theme', themeId);
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: themeId } }));
    } catch { /* noop */ }

    return { success: true, message: `Equipped ${themeId} theme!` };
  }, [rpgData.unlockedThemes, setRpgData]);

  const resetBoss = useCallback(() => {
    const prevLevel = rpgData.boss?.level || 1;
    const newBoss = freshBoss(prevLevel + 1);
    setRpgData(prev => ({
      ...prev,
      boss: newBoss,
      attackLog: [{ id: Date.now(), text: `New Challenger Appeared: Level ${prevLevel + 1} Boss!`, ts: 'NEW' }],
    }));
  }, [rpgData.boss, setRpgData]);

  const resetRpgProgress = useCallback(() => {
    try {
      localStorage.removeItem('study_hub_character_rpg_stats');
      localStorage.removeItem('study_hub_rpg_stats');
    } catch { /* noop */ }
    setRpgData({
      xp: 0,
      coins: 0,
      currentTheme: rpgData.currentTheme || 'default',
      unlockedThemes: rpgData.unlockedThemes || ['default'],
      boss: freshBoss(1),
      attackLog: [],
    });
  }, [rpgData.currentTheme, rpgData.unlockedThemes, setRpgData]);

  const activeBoss = rpgData.boss || freshBoss(1);
  const activeDoflamingo = rpgData.doflamingoBoss || freshDoflamingoBoss(2);

  return {
    xp: rpgData.xp,
    level,
    currentLevelXp,
    nextLevelXp,
    coins: rpgData.coins,
    currentTheme: rpgData.currentTheme,
    unlockedThemes: rpgData.unlockedThemes,
    availableThemes: AVAILABLE_THEMES,
    boss: activeBoss,
    doflamingoBoss: activeDoflamingo,
    attackLog: rpgData.attackLog || [],
    addXpAndCoins,
    damageBoss,
    buyTheme,
    equipTheme,
    resetBoss,
    resetRpgProgress,
  };
}
