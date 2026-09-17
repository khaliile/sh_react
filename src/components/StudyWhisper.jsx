import { useEffect, useRef } from 'react';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useTimeTracker, computeStreak } from '../hooks/useAppHooks';
import { useQuestStorage } from '../hooks/useQuestStorage';

const WHISPER_LINES = (ctx) => [
  `You earned ${ctx.xp.toLocaleString()} XP total. Level ${ctx.level} scholar — keep climbing!`,
  `Your ${ctx.streak}-day streak is no accident. This is who you are now.`,
  `${Math.round(ctx.todayMinutes)} minutes of focused work today. Your future self is grateful.`,
  `Take a 5-minute break. Hydrate. Then return stronger.`,
  `One more session. That's all it takes to change everything.`,
  `Discipline is choosing what you want most over what you want now.`,
  `Every second you spent in that session is an investment that compounds forever.`,
  `You showed up today. That's more than most people will ever do.`,
  `The study grind is quiet. The results are loud. Trust the process.`,
  `Deep work done. You're ${ctx.level} levels into your journey. The next level awaits.`,
];

export default function StudyWhisper() {
  const { xp, level } = useRpgStorage();
  const { log, todayMinutes } = useTimeTracker();
  const streak = computeStreak(log?.byDate || {});

  const lastSpokenRef = useRef(0);
  const enabledRef = useRef(() => {
    const saved = localStorage.getItem('app_study_whisper_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    const speak = () => {
      // Throttle: don't speak more than once per 5 minutes
      if (Date.now() - lastSpokenRef.current < 5 * 60 * 1000) return;
      const enabled = localStorage.getItem('app_study_whisper_enabled') !== 'false';
      if (!enabled) return;

      const ctx = { xp, level, streak, todayMinutes };
      const lines = WHISPER_LINES(ctx);
      const line = lines[Math.floor(Math.random() * lines.length)];

      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(line);
          u.rate = 0.85;
          u.pitch = 1.05;
          u.volume = 0.65;
          // Try to pick a pleasant voice
          const voices = window.speechSynthesis.getVoices();
          const preferred = voices.find(v =>
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('karen')
          );
          if (preferred) u.voice = preferred;
          window.speechSynthesis.speak(u);
          lastSpokenRef.current = Date.now();
        }
      } catch { /* noop */ }
    };

    // Listen for Pomodoro completion and block completion events
    window.addEventListener('pomodoro-complete', speak);
    window.addEventListener('timer-session-complete', speak);
    window.addEventListener('pomodoro-block-complete', speak);

    return () => {
      window.removeEventListener('pomodoro-complete', speak);
      window.removeEventListener('timer-session-complete', speak);
      window.removeEventListener('pomodoro-block-complete', speak);
    };
  }, [xp, level, streak, todayMinutes]);

  // No UI — this is a purely ambient audio component
  return null;
}
