/**
 * appDataSnapshot.js
 * Collects all relevant application data from localStorage into a structured
 * snapshot that can be injected into an AI system prompt.
 *
 * This is the "intelligence layer" — it gives the AI coach full context
 * about the user's study progress, RPG stats, habits, and goals.
 */

function safeGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Returns a rich structured snapshot of all app data.
 * @returns {object} Full context snapshot
 */
export function getAppDataSnapshot() {
  // ── RPG State ──────────────────────────────────────────────────────────────
  const rpg = safeGet('app_rpg_state', {
    xp: 0,
    coins: 0,
    currentTheme: 'default',
    boss: null,
    attackLog: [],
  });

  const level = Math.floor((rpg.xp || 0) / 250) + 1;
  const currentLevelXp = (rpg.xp || 0) % 250;
  const nextLevelXp = 250;
  const xpPercent = Math.round((currentLevelXp / nextLevelXp) * 100);

  const boss = rpg.boss || {};
  const bossHpPercent = boss.maxHp
    ? Math.round(((boss.maxHp - (boss.currentHp || boss.maxHp)) / boss.maxHp) * 100)
    : 0;

  // ── Study Time Log ─────────────────────────────────────────────────────────
  const timeLog = safeGet('app_time_log', { byDate: {}, sessions: [] });

  const todayKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const todayMinutes = (timeLog.byDate || {})[todayKey]
    ? Object.values((timeLog.byDate || {})[todayKey]).reduce((s, v) => s + (v || 0), 0)
    : (timeLog.sessions || [])
        .filter(s => s.date === todayKey)
        .reduce((sum, s) => sum + (s.minutes || 0), 0);

  const weeklyMinutes = Object.values(timeLog.sessions || []).reduce(
    (sum, s) => sum + (s.minutes || 0),
    0
  );

  const longestSession = (timeLog.sessions || []).reduce(
    (max, s) => Math.max(max, s.minutes || 0),
    0
  );

  const studyDays = Object.keys(timeLog.byDate || {}).sort();
  let streak = 0;
  if (studyDays.length > 0) {
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (timeLog.byDate?.[k]) streak++;
      else if (i > 0) break;
    }
  }

  // ── Quests ─────────────────────────────────────────────────────────────────
  const questState = safeGet('app_rpg_quests', { claimed: {} });
  const flashcardStats = safeGet('app_flashcards_stats', { totalReviews: 0 });

  const bossDamageDealt = Math.max(0, (boss.maxHp || 1000) - (boss.currentHp || boss.maxHp || 1000));

  const quests = [
    {
      id: 'marathon_120',
      title: 'Deep Focus Marathon',
      desc: 'Log 120+ continuous study minutes',
      progress: Math.min(120, longestSession),
      target: 120,
      unit: 'min',
    },
    {
      id: 'weekly_goal_600',
      title: 'Weekly Knowledge Forge',
      desc: '600 min of study this week',
      progress: Math.min(600, weeklyMinutes),
      target: 600,
      unit: 'min',
    },
    {
      id: 'demon_500',
      title: 'Bane of Distractions',
      desc: '500 damage to the boss',
      progress: Math.min(500, bossDamageDealt),
      target: 500,
      unit: 'dmg',
    },
    {
      id: 'streak_master_3',
      title: 'Unbroken Discipline',
      desc: '3-day study streak',
      progress: Math.min(3, streak),
      target: 3,
      unit: 'days',
    },
    {
      id: 'flashcard_review_15',
      title: 'The Grand Inquisitor',
      desc: '15 flashcard reviews',
      progress: Math.min(15, flashcardStats.totalReviews || 0),
      target: 15,
      unit: 'cards',
    },
  ].map(q => ({
    ...q,
    isComplete: q.progress >= q.target,
    isClaimed: Boolean(questState.claimed?.[q.id]),
    percent: Math.round((q.progress / q.target) * 100),
  }));

  // ── Schedule / Progress ────────────────────────────────────────────────────
  const checkedItems = safeGet('app_progress_state', {});
  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  // Today's weekday
  const weekdayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Try to find current schedule slot
  const scheduleRoutine = [
    { id: 't0', start: '05:00', end: '05:30', task: 'Morning Spirituals (Fajr, Quran)' },
    { id: 't1', start: '05:30', end: '06:00', task: 'Mind Preparation (Coffee, No Phone)' },
    { id: 't2', start: '06:00', end: '11:00', task: 'Morning Core Focus: Mathematics / Python (5h)', isStudy: true },
    { id: 't3', start: '11:00', end: '14:00', task: 'Energy Recharge, Lunch & Dhuhr Break (3h)' },
    { id: 't4', start: '14:00', end: '17:00', task: 'Afternoon Mathematics / Python (3h)', isStudy: true },
    { id: 't5', start: '17:00', end: '18:00', task: 'Asr Break (1h)' },
    { id: 't6', start: '18:00', end: '20:00', task: 'Evening Block: Languages (English - 2h)', isStudy: true },
    { id: 't7', start: '20:00', end: '21:15', task: 'Escape & Reward (Hobbies, Sports) + Maghrib' },
    { id: 't8', start: '21:15', end: '22:15', task: 'Spiritual Serenity & Daily Review' },
    { id: 't9', start: '22:15', end: '05:00', task: 'Sleep' },
  ];

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const currentSlot = scheduleRoutine.find(s => {
    const [sh, sm] = s.start.split(':').map(Number);
    const [eh, em] = s.end.split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (end > start) return nowMins >= start && nowMins < end;
    return nowMins >= start || nowMins < end;
  });

  // ── Mood ───────────────────────────────────────────────────────────────────
  const moodData = safeGet('app_mood_log', {});
  const todayMood = moodData[todayKey] || null;

  // ── RPG Character / inventory ──────────────────────────────────────────────
  const inventory = safeGet('app_rpg_inventory', {});
  const equippedCharacter = safeGet('app_rpg_equipped_character', null);

  const hours24 = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  const time12 = `${hours12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  const time24 = `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const periodEn = hours24 >= 21 ? 'night' : hours24 >= 17 ? 'evening' : hours24 >= 12 ? 'afternoon' : 'morning';
  const periodAr = hours24 >= 21 ? 'ليلاً' : hours24 >= 17 ? 'مساءً' : hours24 >= 12 ? 'ظهراً' : 'صباحاً';

  const arabicHours = {
    1: 'الواحدة',
    2: 'الثانية',
    3: 'الثالثة',
    4: 'الرابعة',
    5: 'الخامسة',
    6: 'السادسة',
    7: 'السابعة',
    8: 'الثامنة',
    9: 'التاسعة',
    10: 'العاشرة',
    11: 'الحادية عشرة',
    12: 'الثانية عشرة',
  };

  const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayNameAr = arabicDays[now.getDay()];

  let minTextAr = '';
  if (minutes === 0) {
    minTextAr = 'تماماً';
  } else if (minutes === 15) {
    minTextAr = 'والربع';
  } else if (minutes === 20) {
    minTextAr = 'والثلث';
  } else if (minutes === 30) {
    minTextAr = 'والنصف';
  } else if (minutes === 45) {
    minTextAr = 'وخمس وأربعون دقيقة';
  } else {
    minTextAr = `و ${minutes} دقيقة`;
  }

  const spelledAr = `الساعة ${arabicHours[hours12]} ${minTextAr} ${periodAr} (يوم ${dayNameAr})`;
  const spelledEn = `It is ${hours12}:${String(minutes).padStart(2, '0')} ${ampm} on ${weekdayName} ${periodEn}`;

  // ── Return snapshot ────────────────────────────────────────────────────────
  return {
    date: {
      today: todayKey,
      weekday: weekdayName,
      dayNameAr,
      time: time12,
      time24,
      spelledAr,
      spelledEn,
    },
    rpg: {
      xp: rpg.xp || 0,
      level,
      currentLevelXp,
      nextLevelXp,
      xpPercent,
      coins: rpg.coins || 0,
      theme: rpg.currentTheme || 'default',
    },
    boss: {
      name: boss.name || 'Procrastination Demon',
      maxHp: boss.maxHp || 1000,
      currentHp: boss.currentHp ?? (boss.maxHp || 1000),
      damageDealt: bossDamageDealt,
      hpPercent: bossHpPercent,
      defeated: boss.defeated || false,
      level: boss.level || 1,
    },
    study: {
      todayMinutes,
      weeklyMinutes,
      longestSession,
      streak,
      studyDaysCount: studyDays.length,
      recentSessions: (timeLog.sessions || []).slice(-5).map(s => ({
        date: s.date,
        minutes: s.minutes,
        subject: s.subject || s.task || 'General',
      })),
    },
    quests,
    schedule: {
      currentSlot: currentSlot
        ? `${currentSlot.start}–${currentSlot.end}: ${currentSlot.task}`
        : 'No active slot',
      completedTasksToday: completedCount,
      isStudyTime: currentSlot?.isStudy || false,
    },
    mood: todayMood,
    character: equippedCharacter,
  };
}

/**
 * Formats the snapshot into a human-readable string for the AI system prompt.
 * @param {object} snap - Result of getAppDataSnapshot()
 * @param {'en'|'ar'} [lang='en'] - Target language
 * @returns {string}
 */
export function formatSnapshotForAI(snap, lang = 'en') {
  const isAr = lang === 'ar';
  const h = m => isAr ? `${Math.floor(m / 60)} ساعة و ${m % 60} دقيقة` : `${Math.floor(m / 60)}h ${m % 60}min`;
  const bar = (v, t) => {
    const pct = Math.min(100, Math.round((v / Math.max(t, 1)) * 100));
    return `${v}/${t} (${pct}%)`;
  };

  const questLines = snap.quests
    .map(q => {
      const status = q.isClaimed ? (isAr ? 'تم استلام المكافأة' : 'CLAIMED') : q.isComplete ? (isAr ? 'مكتمل' : 'COMPLETE') : `${q.percent}%`;
      return `  - ${q.title}: ${bar(q.progress, q.target)} ${status}`;
    })
    .join('\n');

  const recentLines = snap.study.recentSessions.length
    ? snap.study.recentSessions
        .map(s => `  - ${s.date}: ${s.minutes}min (${s.subject})`)
        .join('\n')
    : (isAr ? '  - لا توجد جلسات حديثة مسجلة' : '  - No recent sessions recorded');

  if (isAr) {
    return `
=== بيانات الطالب الحالية ===
التاريخ والوقت الحالي: ${snap.date.spelledAr}

الملف الشخصي:
  المستوى: ${snap.rpg.level} | نقاط الخبرة XP: ${snap.rpg.currentLevelXp}/${snap.rpg.nextLevelXp} (${snap.rpg.xpPercent}%)
  إجمالي نقاط الخبرة XP: ${snap.rpg.xp} | العملات: ${snap.rpg.coins}

وحش اليوم (${snap.boss.name}):
  الصحة الحالية: ${snap.boss.currentHp}/${snap.boss.maxHp} HP | الضرر المحدث: ${snap.boss.damageDealt} (${snap.boss.hpPercent}%)
  الحالة: ${snap.boss.defeated ? 'تمت هزيمته بنجاح!' : 'ما زال حياً — استمر في إنجاز المهام لإلحاق الضرر به!'}

وقت الدراسة:
  اليوم: ${h(snap.study.todayMinutes)} | هذا الأسبوع: ${h(snap.study.weeklyMinutes)}
  أطول جلسة دراسة: ${h(snap.study.longestSession)}
  سلسلة الأيام المتتالية: ${snap.study.streak} يوم

المهام المنجزة اليوم: ${snap.schedule.completedTasksToday}

الكويستات النشطة:
${questLines}
=== نهاية البيانات ===
`.trim();
  }

  return `
=== STUDENT DATA SNAPSHOT ===
CURRENT DATE & TIME: ${snap.date.spelledEn}

RPG PROFILE:
  Level ${snap.rpg.level} | XP: ${snap.rpg.currentLevelXp}/${snap.rpg.nextLevelXp} (${snap.rpg.xpPercent}%)
  Total XP: ${snap.rpg.xp} | Coins: ${snap.rpg.coins}

TODAY'S BOSS (${snap.boss.name} Lv.${snap.boss.level}):
  HP: ${snap.boss.currentHp}/${snap.boss.maxHp} | Damage dealt: ${snap.boss.damageDealt} (${snap.boss.hpPercent}%)
  Status: ${snap.boss.defeated ? 'DEFEATED today!' : 'Still alive — complete tasks to deal damage!'}

STUDY TIME:
  Today: ${h(snap.study.todayMinutes)} | This week: ${h(snap.study.weeklyMinutes)}
  Longest session: ${h(snap.study.longestSession)}
  Current streak: ${snap.study.streak} consecutive day(s)

TASKS:
  Tasks completed today: ${snap.schedule.completedTasksToday}

QUESTS:
${questLines}
=== END SNAPSHOT ===
`.trim();
}
