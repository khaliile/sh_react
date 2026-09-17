import { useCallback } from 'react';
import { useAppStorage } from './useAppHooks';
import { useRpgStorage } from './useRpgStorage';

export const PET_STAGES = [
  {
    stage: 1,
    title: 'Mystic Egg',
    titleKey: 'focus.stageMysticEgg',
    minHours: 0,
    maxHours: 5,
    avatarKey: 'egg',
    color: '#a78bfa',
    aura: 'rgba(167, 139, 250, 0.25)',
    descKey: 'focus.petDesc1',
    buffKey: 'focus.petBuff1',
  },
  {
    stage: 2,
    title: 'Chibi Drake',
    titleKey: 'focus.stageChibiDrake',
    minHours: 5,
    maxHours: 25,
    avatarKey: 'drake',
    color: '#38bdf8',
    aura: 'rgba(56, 189, 248, 0.3)',
    descKey: 'focus.petDesc2',
    buffKey: 'focus.petBuff2',
  },
  {
    stage: 3,
    title: 'Spirit Guardian',
    titleKey: 'focus.stageSpiritGuardian',
    minHours: 25,
    maxHours: 60,
    avatarKey: 'guardian',
    color: '#34d399',
    aura: 'rgba(52, 211, 153, 0.35)',
    descKey: 'focus.petDesc3',
    buffKey: 'focus.petBuff3',
  },
  {
    stage: 4,
    title: 'Astral Elder Dragon',
    titleKey: 'focus.stageAstralElderDragon',
    minHours: 60,
    maxHours: 9999,
    avatarKey: 'dragon',
    color: '#f59e0b',
    aura: 'rgba(245, 158, 11, 0.4)',
    descKey: 'focus.petDesc4',
    buffKey: 'focus.petBuff4',
  },
];

export function usePetStorage() {
  const [log] = useAppStorage('app_time_log', { byDate: {}, sessions: [] });
  const { coins, addXpAndCoins } = useRpgStorage();

  const [petData, setPetData] = useAppStorage('app_focus_pet', {
    name: 'Ember',
    happiness: 100,
    energy: 100,
    totalPets: 0,
    totalFeeds: 0,
    lastPetDate: null,
  });

  // Calculate total lifetime hours from log
  const totalMinutes = Object.values(log.byDate || {}).reduce((acc, m) => acc + (typeof m === 'number' ? m : 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);

  // Compute current stage
  let currentStageObj = PET_STAGES[0];
  for (const s of PET_STAGES) {
    if (totalHours >= s.minHours) {
      currentStageObj = s;
    }
  }

  const nextStageObj = PET_STAGES.find(s => s.stage === currentStageObj.stage + 1);
  const hoursIntoCurrentStage = totalHours - currentStageObj.minHours;
  const stageHourSpan = (nextStageObj ? nextStageObj.minHours : currentStageObj.minHours + 40) - currentStageObj.minHours;
  const evolutionProgress = Math.min(100, Math.round((hoursIntoCurrentStage / Math.max(1, stageHourSpan)) * 100));

  const petFamiliar = useCallback(() => {
    setPetData(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      totalPets: (prev.totalPets || 0) + 1,
      lastPetDate: Date.now(),
    }));
  }, [setPetData]);

  const feedFamiliar = useCallback((coinCost = 15) => {
    if (coins < coinCost) {
      return { success: false, message: 'Not enough coins to buy familiar treats!' };
    }
    addXpAndCoins(10, -coinCost, 'Fed Familiar');
    setPetData(prev => ({
      ...prev,
      happiness: 100,
      energy: Math.min(100, prev.energy + 30),
      totalFeeds: (prev.totalFeeds || 0) + 1,
    }));
    return { success: true, message: `${petData.name || 'Your Familiar'} loved the treat!` };
  }, [coins, addXpAndCoins, petData.name, setPetData]);

  const renameFamiliar = useCallback((newName) => {
    if (!newName || !newName.trim()) return;
    setPetData(prev => ({ ...prev, name: newName.trim() }));
  }, [setPetData]);

  return {
    petData,
    stage: currentStageObj,
    nextStage: nextStageObj,
    totalHours,
    evolutionProgress,
    petFamiliar,
    feedFamiliar,
    renameFamiliar,
  };
}
