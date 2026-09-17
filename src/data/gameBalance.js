/**
 * gameBalance.js
 *
 * Single source of truth for all RPG game balance constants.
 * Import from here — never hardcode these values inline.
 */

// ── Boss Health Points ───────────────────────────────────────────────────────
/** Phase 1 boss (Marshall D. Teach) max HP */
export const TEACH_MAX_HP = 1000;

/** Phase 2 boss (Donquixote Doflamingo) max HP */
export const DOFLAMINGO_MAX_HP = 1200;

// ── Boss Rewards ─────────────────────────────────────────────────────────────
export const TEACH_REWARD_COINS = 250;
export const TEACH_REWARD_XP    = 500;

export const DOFLAMINGO_REWARD_COINS = 350;
export const DOFLAMINGO_REWARD_XP    = 700;

// ── XP & Levelling ───────────────────────────────────────────────────────────
/**
 * XP required to reach a given level from 0.
 * Uses a soft exponential curve: early levels are fast, later levels slow down.
 *
 * Formula: XP_for_level(n) = BASE * n * (1 + SCALE * (n - 1))
 *   n=1  →   0 XP (start)
 *   n=2  → 300 XP
 *   n=5  → 1800 XP
 *   n=10 → 4950 XP
 *   n=20 → 13800 XP
 *   n=50 → 88500 XP
 */
const XP_BASE  = 250;  // XP for level 2
const XP_SCALE = 0.2;  // how steeply cost grows per level

/**
 * Total XP required to have reached `level` (1-indexed).
 * Level 1 = 0 XP, level 2 = XP_BASE, level n grows with SCALE.
 */
export function xpForLevel(level) {
  if (level <= 1) return 0;
  const n = level - 1; // number of levels completed
  return Math.round(XP_BASE * n * (1 + XP_SCALE * (n - 1)));
}

/**
 * Derive level + within-level progress from a raw XP total.
 * Returns { level, currentLevelXp, nextLevelXp }
 */
export function xpToLevel(totalXp) {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level++;
  const currentLevelXp = totalXp - xpForLevel(level);
  const nextLevelXp    = xpForLevel(level + 1) - xpForLevel(level);
  return { level, currentLevelXp, nextLevelXp };
}
