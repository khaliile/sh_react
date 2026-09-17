/**
 * migrations.js
 *
 * All one-time localStorage data migrations live here.
 * Called ONCE synchronously from main.jsx before React renders,
 * so no component ever sees stale/un-migrated data.
 *
 * Rules:
 *  - Every migration is guarded by a unique, versioned flag key.
 *  - Migrations are append-only — never delete or renumber them.
 *  - Keep each migration small and focused.
 */

const ls = window.localStorage;

function get(key) {
  try { return ls.getItem(key); } catch { return null; }
}
function set(key, val) {
  try { ls.setItem(key, val); } catch { /* noop */ }
}
function remove(key) {
  try { ls.removeItem(key); } catch { /* noop */ }
}
function getJSON(key) {
  try { const v = ls.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function setJSON(key, val) {
  try { ls.setItem(key, JSON.stringify(val)); } catch { /* noop */ }
}

export function runMigrations() {
  // ── M1: Reset XP & coins to 0 for fresh start (v2026) ───────────────────
  if (!get('app_reset_zero_coins_xp_v2026')) {
    const rpg = getJSON('app_rpg_state');
    if (rpg && typeof rpg === 'object') {
      rpg.xp = 0;
      rpg.coins = 0;
      setJSON('app_rpg_state', rpg);
    }
    remove('study_hub_character_rpg_stats');
    remove('study_hub_rpg_stats');
    set('app_reset_zero_coins_xp_v2026', 'true');
  }

  // ── M2: Lock all shop themes — player must earn coins to unlock ──────────
  // Unified flag (replaces old app_themes_strict_lock_v9 AND app_themes_strict_locked_final_v10)
  if (!get('app_themes_strict_locked_final_v10')) {
    const rpg = getJSON('app_rpg_state');
    if (rpg && typeof rpg === 'object') {
      rpg.unlockedThemes = ['default'];
      rpg.currentTheme = 'default';
      setJSON('app_rpg_state', rpg);
    }
    // Also set the old key so useRpgStorage's guard (if any remains) won't re-run
    set('app_themes_strict_lock_v9', 'true');
    set('app_themes_strict_locked_final_v10', 'true');
  }

  // ── M3: Unlock starter characters Chrollo & Robin; retire Luffy ─────────
  if (!get('app_inventory_robin_chrollo_v12')) {
    const inv = getJSON('app_rpg_inventory');
    if (inv && typeof inv === 'object') {
      inv.collectibles = {
        ...(inv.collectibles || {}),
        chrollo: true,
        robin: true,
      };
      delete inv.collectibles?.luffy;
      if (!inv.equippedAvatar || inv.equippedAvatar === 'luffy') {
        inv.equippedAvatar = 'chrollo';
      }
      setJSON('app_rpg_inventory', inv);
    }
    set('app_inventory_robin_chrollo_v12', 'true');
  }

  // ── M4: Safety cap — coins should never exceed 5000 legitimately ─────────
  const rpg = getJSON('app_rpg_state');
  if (rpg && typeof rpg === 'object' && typeof rpg.coins === 'number' && rpg.coins >= 5000) {
    rpg.coins = 0;
    setJSON('app_rpg_state', rpg);
  }
  // ── M5: Mascot cleanups & model sanitization ────────────────────────────
  if (!get('app_mascot_migration_v2026')) {
    if (get('mascot_character') === 'robin' && !get('mascot_character_user_chosen')) {
      remove('mascot_character');
    }
    if (get('mascot_tts_engine') === 'browser' && !get('mascot_tts_engine_user_chosen')) {
      remove('mascot_tts_engine');
    }
    const voice = get('mascot_voice_id');
    if ((voice === 'en_GB-alba-medium' || voice === 'en_US-ryan-high') && !get('mascot_voice_id_user_chosen')) {
      remove('mascot_voice_id');
    }
    if (get('robin_llm_provider') === 'demo') {
      set('robin_llm_provider', 'openrouter');
    }
    const storedModel = get('robin_llm_model');
    if (storedModel && (storedModel.includes('gemini') || storedModel === 'OpenRouter' || !storedModel.trim())) {
      set('robin_llm_model', 'meta-llama/llama-3.2-3b-instruct:free');
    }
    set('app_mascot_migration_v2026', 'true');
  }

  // ── M6: Reset stale grid keys for Bounty Hunt & Cryo Chamber ─────────────
  if (!get('app_grid_sync_v2026_bounties_cryo_v2')) {
    remove('bounty_habits');
    remove('cryo_goals');
    set('app_grid_sync_v2026_bounties_cryo_v2', 'true');
  }
}
