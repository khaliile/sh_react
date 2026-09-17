import { useCallback, useEffect } from 'react';
import { useAppStorage } from './useAppHooks';
import { useRpgStorage } from './useRpgStorage';
import { MASCOT_CHARACTERS } from '../data/mascotCharacters';

import {
  CONSUMABLE_ITEMS,
  ANIME_CHARACTERS,
  ANIME_COLLECTIBLES,
  RARITY_ORDER,
  RARITY_COLORS,
  SERIES_LIST,
} from '../data/inventoryData';

export {
  CONSUMABLE_ITEMS,
  ANIME_CHARACTERS,
  ANIME_COLLECTIBLES,
  RARITY_ORDER,
  RARITY_COLORS,
  SERIES_LIST,
};

export function useInventoryStorage() {
  const { coins, addXpAndCoins } = useRpgStorage();

  const [inventory, setInventory] = useAppStorage('app_rpg_inventory', {
    items: {},
    activeBuffs: {
      doubleXpUntil: 0,
      streakShields: 0,
    },
    collectibles: {
      chrollo: true,
      robin: true,
    },
    equippedAvatar: 'chrollo',
  });

  // Ensure Robin and Chrollo are guaranteed starters and remove legacy unpurchased Luffy unlock
  useEffect(() => {
    if (!localStorage.getItem('app_robin_chrollo_default_unlocked_v1')) {
      setInventory(prev => {
        const nextCollectibles = { ...(prev?.collectibles || {}) };
        delete nextCollectibles.luffy;
        nextCollectibles.chrollo = true;
        nextCollectibles.robin = true;
        return {
          ...prev,
          collectibles: nextCollectibles,
          equippedAvatar: prev?.equippedAvatar === 'luffy' ? 'chrollo' : (prev?.equippedAvatar || 'chrollo'),
        };
      });
      localStorage.setItem('app_robin_chrollo_default_unlocked_v1', 'true');
    }
  }, [setInventory]);

  // ── v2 reset: lock all characters except Chrollo & Robin, wipe items & buffs ──
  useEffect(() => {
    if (!localStorage.getItem('app_inventory_reset_v2')) {
      setInventory({
        items: {},
        activeBuffs: { doubleXpUntil: 0, streakShields: 0 },
        collectibles: { chrollo: true, robin: true },
        equippedAvatar: 'chrollo',
      });
      try {
        localStorage.setItem('mascot_character', 'chrollo');
        localStorage.removeItem('mascot_character_user_chosen');
      } catch { /* noop */ }
      localStorage.setItem('app_inventory_reset_v2', 'true');
      // Also ensure v1 flag is set so it doesn't overwrite again
      localStorage.setItem('app_robin_chrollo_default_unlocked_v1', 'true');
    }
  }, [setInventory]);

  const now = Date.now();
  const isDoubleXpActive = Boolean(inventory.activeBuffs?.doubleXpUntil && inventory.activeBuffs.doubleXpUntil > now);
  const doubleXpRemainingMins = isDoubleXpActive ? Math.max(1, Math.round((inventory.activeBuffs.doubleXpUntil - now) / 60000)) : 0;
  const streakShieldCount = inventory.activeBuffs?.streakShields || 0;

  // Single source of truth for active avatar
  const equippedAvatar = inventory.equippedAvatar || localStorage.getItem('mascot_character') || 'chrollo';
  
  // Guarantee starters & equipped avatar are in collectibles, all others locked until bought
  const collectibles = {
    chrollo: true,
    robin: true,
    ...(inventory.collectibles || {}),
    [equippedAvatar]: true,
  };

  const buyItem = useCallback((itemId) => {
    const item = CONSUMABLE_ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Unknown item' };
    if (coins < item.cost) return { success: false, message: `Need ${item.cost - coins} more coins` };

    addXpAndCoins(5, -item.cost, `Bought ${item.name}`);
    setInventory(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [itemId]: (prev.items?.[itemId] || 0) + 1,
      },
    }));

    return { success: true, message: `Purchased ${item.name}!` };
  }, [coins, addXpAndCoins, setInventory]);

  const buyCollectible = useCallback((characterId) => {
    const char = ANIME_CHARACTERS.find(c => c.id === characterId) || MASCOT_CHARACTERS[characterId];
    if (!char) return { success: false, message: 'Unknown character' };
    if (inventory.collectibles?.[characterId]) {
      return { success: false, message: `${char.name} is already in your vault!` };
    }
    const cost = char.cost || 250;
    if (coins < cost) return { success: false, message: `Need ${cost - coins} more coins for ${char.name}` };

    addXpAndCoins(35, -cost, `Recruited ${char.name}`);
    setInventory(prev => ({
      ...prev,
      collectibles: {
        ...(prev.collectibles || {}),
        [characterId]: true,
      },
      equippedAvatar: characterId, // Auto-equip on purchase!
    }));

    try {
      localStorage.setItem('mascot_character', characterId);
      localStorage.setItem('mascot_character_user_chosen', '1');
      const mascot = MASCOT_CHARACTERS[characterId];
      if (mascot?.defaultAura) localStorage.setItem('mascot_aura_color', mascot.defaultAura);
      if (mascot?.defaultVoice) localStorage.setItem('mascot_voice_id', mascot.defaultVoice);
      window.dispatchEvent(new CustomEvent('character-equipped', { detail: { characterId } }));
    } catch { /* noop */ }

    return { success: true, message: `Recruited ${char.name}! Equipped on profile & chatbot!` };
  }, [coins, inventory.collectibles, addXpAndCoins, setInventory]);

  const equipAvatar = useCallback((characterId) => {
    const char = ANIME_CHARACTERS.find(c => c.id === characterId) || MASCOT_CHARACTERS[characterId];
    if (!char) return { success: false, message: 'Unknown character' };
    if (!collectibles[characterId]) {
      return { success: false, message: `Unlock ${char.name} from the shop first!` };
    }

    setInventory(prev => ({
      ...prev,
      equippedAvatar: characterId,
    }));

    try {
      localStorage.setItem('mascot_character', characterId);
      localStorage.setItem('mascot_character_user_chosen', '1');
      const mascot = MASCOT_CHARACTERS[characterId];
      if (mascot?.defaultAura) localStorage.setItem('mascot_aura_color', mascot.defaultAura);
      if (mascot?.defaultVoice) localStorage.setItem('mascot_voice_id', mascot.defaultVoice);
      window.dispatchEvent(new CustomEvent('character-equipped', { detail: { characterId } }));
    } catch { /* noop */ }

    return { success: true, message: `Equipped ${char.name} on profile & chatbot!` };
  }, [collectibles, setInventory]);

  const useItem = useCallback((itemId, callbacks = {}) => {
    const count = inventory.items?.[itemId] || 0;
    if (count <= 0) return { success: false, message: 'You do not own this item' };

    const item = CONSUMABLE_ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Unknown item' };

    let msg = `Used ${item.name}!`;

    setInventory(prev => {
      const nextItems = { ...prev.items, [itemId]: prev.items[itemId] - 1 };
      if (nextItems[itemId] <= 0) delete nextItems[itemId];

      const nextBuffs = { ...(prev.activeBuffs || {}) };

      if (item.type === 'buff') {
        const base = Math.max(Date.now(), nextBuffs.doubleXpUntil || 0);
        nextBuffs.doubleXpUntil = base + (item.durationMs || 7200000);
        const hrs = Math.round((item.durationMs || 7200000) / 3600000);
        msg = `${item.name} activated — ${hrs}h of 2× XP!`;
      } else if (item.type === 'shield') {
        nextBuffs.streakShields = (nextBuffs.streakShields || 0) + 1;
        msg = `Nakama Bond activated! Streak shields: ${nextBuffs.streakShields}`;
      }

      return { ...prev, items: nextItems, activeBuffs: nextBuffs };
    });

    if (item.type === 'instant_damage' && callbacks.onBossBomb) {
      callbacks.onBossBomb(item.damage || 500);
    }
    if (item.type === 'instant_minutes' && callbacks.onTimeWarp) {
      callbacks.onTimeWarp(item.minutes || 45);
    }
    if (item.type === 'pet_buff' && callbacks.onPetTreat) {
      callbacks.onPetTreat();
    }

    return { success: true, message: msg };
  }, [inventory.items, setInventory]);

  return {
    items: inventory.items || {},
    collectibles,
    equippedAvatar,
    availableShopItems: CONSUMABLE_ITEMS,
    availableCharacters: ANIME_CHARACTERS,
    activeBuffs: {
      isDoubleXpActive,
      doubleXpRemainingMins,
      streakShieldCount,
    },
    buyItem,
    buyCollectible,
    equipAvatar,
    useItem,
  };
}
