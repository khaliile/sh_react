import { useState, useEffect, useCallback } from 'react';
import { useAppStorage, computeStreak } from './useAppHooks';
import { todayKeyAt } from '../utils/dateKey';

/**
 * Detects streak breaks and manages the Abyss dungeon state.
 * When a streak breaks (had study history but today/yesterday = 0), the Abyss activates.
 * To escape: complete 2h study + 10 flashcard reviews within 24h.
 */
export function useAbyssState() {
  const [abyssData, setAbyssData] = useAppStorage('app_abyss_state', {
    active: false,
    activatedAt: null,
    studyMinutes: 0,
    flashcardsReviewed: 0,
    escaped: false,
  });

  const [timeLog] = useAppStorage('app_time_log', { byDate: {}, sessions: [] });

  // Check if streak just broke
  useEffect(() => {
    if (abyssData.active || abyssData.escaped) return;

    const byDate = timeLog?.byDate || {};
    const streak = computeStreak(byDate);

    // We only activate abyss if: streak is 0 AND there's historical data (not a new user)
    if (streak === 0) {
      // Check if user has any historical data (was active before)
      const hasHistory = Object.keys(byDate).some(k => (byDate[k] || 0) > 0);
      // Check yesterday specifically
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = todayKeyAt(yesterday);
      const hadYesterday = (byDate[yKey] || 0) > 0;

      if (hasHistory && !hadYesterday) {
        // Check if we activated abyss recently (don't re-activate today's already escaped)
        const escapedToday = abyssData.escaped &&
          abyssData.activatedAt &&
          new Date(abyssData.activatedAt).toDateString() === new Date().toDateString();

        if (!escapedToday) {
          setAbyssData({
            active: true,
            activatedAt: Date.now(),
            studyMinutes: 0,
            flashcardsReviewed: 0,
            escaped: false,
          });
        }
      }
    }
  }, [timeLog, abyssData.active, abyssData.escaped]);

  // Expire abyss after 48h if not escaped (grace period)
  useEffect(() => {
    if (!abyssData.active || !abyssData.activatedAt) return;
    const elapsed = Date.now() - abyssData.activatedAt;
    if (elapsed > 48 * 60 * 60 * 1000) {
      setAbyssData(prev => ({ ...prev, active: false, escaped: true }));
    }
  }, [abyssData.active, abyssData.activatedAt]);

  const addAbyssStudyMinutes = useCallback((minutes) => {
    if (!abyssData.active) return;
    setAbyssData(prev => {
      const newMinutes = (prev.studyMinutes || 0) + minutes;
      const newCards = prev.flashcardsReviewed || 0;
      const escaped = newMinutes >= 120 && newCards >= 10;
      return { ...prev, studyMinutes: newMinutes, escaped, active: !escaped };
    });
  }, [abyssData.active, setAbyssData]);

  const addAbyssFlashcards = useCallback((count = 1) => {
    if (!abyssData.active) return;
    setAbyssData(prev => {
      const newCards = (prev.flashcardsReviewed || 0) + count;
      const newMinutes = prev.studyMinutes || 0;
      const escaped = newMinutes >= 120 && newCards >= 10;
      return { ...prev, flashcardsReviewed: newCards, escaped, active: !escaped };
    });
  }, [abyssData.active, setAbyssData]);

  const forceEscape = useCallback(() => {
    setAbyssData(prev => ({ ...prev, active: false, escaped: true }));
  }, [setAbyssData]);

  const studyProgress = Math.min(100, ((abyssData.studyMinutes || 0) / 120) * 100);
  const flashcardProgress = Math.min(100, ((abyssData.flashcardsReviewed || 0) / 10) * 100);
  const overallProgress = (studyProgress + flashcardProgress) / 2;

  return {
    abyssActive: abyssData.active,
    studyMinutes: abyssData.studyMinutes || 0,
    flashcardsReviewed: abyssData.flashcardsReviewed || 0,
    studyProgress,
    flashcardProgress,
    overallProgress,
    activatedAt: abyssData.activatedAt,
    addAbyssStudyMinutes,
    addAbyssFlashcards,
    forceEscape,
  };
}
