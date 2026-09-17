/**
 * storagePruner.js
 * Comprehensive LocalStorage Quota Protection & Maintenance Utility
 *
 * Prevents QuotaExceededError crashes by estimating usage, safely writing to storage,
 * and automatically pruning non-critical / stale cache entries when storage is constrained.
 */

const ESTIMATED_MAX_QUOTA_BYTES = 5 * 1024 * 1024; // 5MB standard browser quota

/**
 * Calculates current total LocalStorage byte usage.
 * @returns {{ usedBytes: number, totalBytes: number, percentUsed: number }}
 */
export function getStorageUsage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { usedBytes: 0, totalBytes: ESTIMATED_MAX_QUOTA_BYTES, percentUsed: 0 };
  }

  try {
    let totalChars = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        totalChars += key.length + val.length;
      }
    }
    // In UTF-16, characters in localStorage consume ~2 bytes each
    const usedBytes = totalChars * 2;
    const percentUsed = Math.min(100, Math.round((usedBytes / ESTIMATED_MAX_QUOTA_BYTES) * 100));

    return { usedBytes, totalBytes: ESTIMATED_MAX_QUOTA_BYTES, percentUsed };
  } catch {
    return { usedBytes: 0, totalBytes: ESTIMATED_MAX_QUOTA_BYTES, percentUsed: 0 };
  }
}

/**
 * Determines if storage is approaching quota limit (>80% full).
 * @returns {boolean}
 */
export function isStorageQuotaLow() {
  const { percentUsed } = getStorageUsage();
  return percentUsed >= 80;
}

/**
 * Automatically prunes stale, ephemeral, or overly verbose logs.
 * Preserves user credentials, RPG progression, inventory, themes, and goals.
 *
 * @returns {number} Estimated bytes freed
 */
export function pruneStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return 0;

  const initialUsage = getStorageUsage().usedBytes;

  try {
    // 1. Trim Boss Trial recent question IDs (keep latest 15)
    const recentQRaw = localStorage.getItem('boss_trial_recent_q_ids');
    if (recentQRaw) {
      try {
        const qList = JSON.parse(recentQRaw);
        if (Array.isArray(qList) && qList.length > 15) {
          localStorage.setItem('boss_trial_recent_q_ids', JSON.stringify(qList.slice(-15)));
        }
      } catch {
        localStorage.removeItem('boss_trial_recent_q_ids');
      }
    }

    // 2. Compact Mood Log (keep only last 45 days)
    const moodLogRaw = localStorage.getItem('app_mood_log');
    if (moodLogRaw) {
      try {
        const moodLog = JSON.parse(moodLogRaw);
        if (Array.isArray(moodLog) && moodLog.length > 45) {
          localStorage.setItem('app_mood_log', JSON.stringify(moodLog.slice(-45)));
        }
      } catch {
        /* keep existing on parse failure */
      }
    }

    // 3. Compact Time Log (keep daily records, prune micro-snapshots older than 90 days)
    const timeLogRaw = localStorage.getItem('app_time_log');
    if (timeLogRaw) {
      try {
        const timeLog = JSON.parse(timeLogRaw);
        if (timeLog && typeof timeLog === 'object' && timeLog.byDate) {
          const keys = Object.keys(timeLog.byDate);
          if (keys.length > 120) {
            keys.sort();
            const keepKeys = new Set(keys.slice(-120));
            const trimmedByDate = {};
            for (const k of keepKeys) {
              trimmedByDate[k] = timeLog.byDate[k];
            }
            timeLog.byDate = trimmedByDate;
            localStorage.setItem('app_time_log', JSON.stringify(timeLog));
          }
        }
      } catch {
        /* keep existing on parse failure */
      }
    }

    // 4. Remove any stale temporary keys
    const tempKeys = ['app_temp_preview', 'app_cache_eval', 'temp_flashcard_session'];
    for (const k of tempKeys) {
      if (localStorage.getItem(k) !== null) {
        localStorage.removeItem(k);
      }
    }
  } catch (err) {
    console.warn('[storagePruner] Warning during pruneStorage:', err);
  }

  const finalUsage = getStorageUsage().usedBytes;
  return Math.max(0, initialUsage - finalUsage);
}

/**
 * Safely writes to localStorage with automatic quota management.
 * If QuotaExceededError is thrown, prunes non-critical data and retries once.
 *
 * @param {string} key
 * @param {string} value
 * @returns {boolean} True if successfully stored, false otherwise
 */
export function safeSetItem(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    const isQuotaError =
      err instanceof DOMException &&
      (err.code === 22 ||
        err.code === 1014 ||
        err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED');

    if (isQuotaError) {
      console.warn(`[storagePruner] LocalStorage quota exceeded writing key "${key}". Running pruner...`);
      const freed = pruneStorage();

      try {
        localStorage.setItem(key, value);
        console.info(`[storagePruner] Successfully wrote "${key}" after freeing ~${freed} bytes.`);
        return true;
      } catch (retryErr) {
        console.error(`[storagePruner] Critical: Unable to save "${key}" even after pruning:`, retryErr);

        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(
            new CustomEvent('storage-quota-critical', {
              detail: { key, error: retryErr }
            })
          );
        }
        return false;
      }
    }

    console.warn(`[storagePruner] Unexpected error setting localStorage key "${key}":`, err);
    return false;
  }
}
