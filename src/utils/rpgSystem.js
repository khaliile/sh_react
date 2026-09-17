// Study RPG System - XP, Levels, Gamification & Character Mastery
const RPG_STATS_KEY = 'study_hub_rpg_stats';
const CHARACTER_RPG_STATS_KEY = 'study_hub_character_rpg_stats';

// XP Requirements for each level (exponential growth)
export const XP_TABLE = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  450,   // Level 4
  700,   // Level 5
  1000,  // Level 6
  1350,  // Level 7
  1750,  // Level 8
  2200,  // Level 9
  2700,  // Level 10
  3250,  // Level 11
  3850,  // Level 12
  4500,  // Level 13
  5200,  // Level 14
  5950,  // Level 15
  6750,  // Level 16
  7600,  // Level 17
  8500,  // Level 18
  9450,  // Level 19
  10450, // Level 20
];

// XP Reward Values (Big points for tasks, lower for pomodoro & flashcards)
export const XP_REWARDS = {
  CHAT_MESSAGE: 1,           // +1 XP per chatbot message sent
  STUDY_SESSION_5MIN: 10,    // +10 XP for 5-min focus
  STUDY_SESSION_15MIN: 20,   // +20 XP for 15-min focus  
  STUDY_SESSION_25MIN: 30,   // +30 XP for 25-min Pomodoro (moderate focus gain)
  FLASHCARD_REVIEW: 15,      // +15 XP for reviewing a flashcard
  TASK_COMPLETED: 150,       // +150 XP for completing a daily task (BIG reward!)
  DAILY_STREAK: 150,         // +150 XP for daily streak
  ACHIEVEMENT_UNLOCK: 200,   // +200 XP for special achievements
};

// Default Character RPG state
const DEFAULT_CHAR_STATE = {
  xp: 0,
  level: 1,
  completedTasks: 0,
  studySessions: 0,
  flashcardReviews: 0,
  totalStudyMinutes: 0,
  achievements: [],
  lastActivity: Date.now(),
  version: '2.0'
};

/** Get the currently equipped avatar id */
export const getActiveCharacterId = () => {
  try {
    const invRaw = localStorage.getItem('app_rpg_inventory');
    if (invRaw) {
      const inv = JSON.parse(invRaw);
      if (inv.equippedAvatar) return inv.equippedAvatar;
    }
  } catch { /* noop */ }
  return 'chrollo';
};

/** Load all character stats mapping from localStorage */
export const getAllCharacterRPGStats = () => {
  try {
    if (!localStorage.getItem('app_reset_zero_coins_xp_v2026')) {
      localStorage.removeItem(CHARACTER_RPG_STATS_KEY);
      localStorage.removeItem(RPG_STATS_KEY);
      return {};
    }
    const stored = localStorage.getItem(CHARACTER_RPG_STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[RPG System] Failed to load character stats mapping:', e);
  }
  return {};
};

/** Save all character stats mapping to localStorage */
export const saveAllCharacterRPGStats = (mapping) => {
  try {
    localStorage.setItem(CHARACTER_RPG_STATS_KEY, JSON.stringify(mapping));
    return true;
  } catch (e) {
    console.warn('[RPG System] Failed to save character stats mapping:', e);
    return false;
  }
};

/**
 * Load RPG stats for a specific character (defaults to currently equipped avatar).
 * New characters start at 0 XP (Level 1). Existing characters keep their XP across days.
 */
export const loadRPGStats = (characterId = null) => {
  const charId = characterId || getActiveCharacterId();
  try {
    const allStats = getAllCharacterRPGStats();
    
    if (allStats[charId]) {
      const charData = { ...DEFAULT_CHAR_STATE, ...allStats[charId] };
      charData.level = calculateLevel(charData.xp);
      return charData;
    }

    // Migration fallback for legacy single-character stats
    const storedLegacy = localStorage.getItem(RPG_STATS_KEY);
    if (storedLegacy && charId === 'luffy') {
      try {
        const legacyData = JSON.parse(storedLegacy);
        const migrated = {
          ...DEFAULT_CHAR_STATE,
          ...legacyData,
          level: calculateLevel(legacyData.xp || 0),
        };
        allStats[charId] = migrated;
        saveAllCharacterRPGStats(allStats);
        return migrated;
      } catch { /* noop */ }
    }

    // New character starts at 0 XP
    const newCharState = { ...DEFAULT_CHAR_STATE };
    allStats[charId] = newCharState;
    saveAllCharacterRPGStats(allStats);
    return newCharState;
  } catch (error) {
    console.warn('[RPG System] Failed to load RPG stats, using defaults:', error);
    return { ...DEFAULT_CHAR_STATE };
  }
};

/**
 * Save RPG stats for a specific character (defaults to currently equipped avatar).
 */
export const saveRPGStats = (rpgStats, characterId = null) => {
  const charId = characterId || getActiveCharacterId();
  try {
    const allStats = getAllCharacterRPGStats();
    const dataToSave = {
      ...DEFAULT_CHAR_STATE,
      ...rpgStats,
      lastActivity: Date.now(),
      version: '2.0'
    };
    allStats[charId] = dataToSave;
    saveAllCharacterRPGStats(allStats);

    // Keep legacy key updated as well for summary
    localStorage.setItem(RPG_STATS_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.warn('[RPG System] Failed to save RPG stats:', error);
    return false;
  }
};

export const calculateLevel = (xp) => {
  for (let level = XP_TABLE.length - 1; level >= 0; level--) {
    if (xp >= XP_TABLE[level]) {
      return level + 1;
    }
  }
  return 1;
};

export const getXPForNextLevel = (currentLevel) => {
  if (currentLevel >= XP_TABLE.length) {
    return (XP_TABLE[XP_TABLE.length - 1] || 4350) + (currentLevel - XP_TABLE.length + 1) * 1000;
  }
  return XP_TABLE[currentLevel] || ((XP_TABLE[XP_TABLE.length - 1] || 4350) + 1000);
};

export const getXPProgress = (xp, level) => {
  const safeLevel = Math.max(1, level || 1);
  const currentLevelXP = XP_TABLE[safeLevel - 1] || 0;
  const nextLevelXP = getXPForNextLevel(safeLevel);
  const progressXP = Math.max(0, (xp || 0) - currentLevelXP);
  const requiredXP = Math.max(100, nextLevelXP - currentLevelXP);
  
  return {
    current: progressXP,
    required: requiredXP,
    percentage: Math.min(Math.max((progressXP / requiredXP) * 100, 0), 100)
  };
};

/**
 * Award XP to the specified character (or active equipped avatar).
 * Persists cumulatively day after day.
 */
export const awardXP = (amount, reason = '', characterId = null) => {
  const charId = characterId || getActiveCharacterId();
  const currentStats = loadRPGStats(charId);
  const newXP = currentStats.xp + amount;
  const oldLevel = currentStats.level;
  const newLevel = calculateLevel(newXP);
  
  const updatedStats = {
    ...currentStats,
    xp: newXP,
    level: newLevel
  };
  
  // Track specific activities
  if (reason.includes('study') || reason.includes('pomodoro')) {
    updatedStats.studySessions += 1;
  }
  if (reason.includes('task') || reason.includes('routine') || reason.includes('roadmap')) {
    updatedStats.completedTasks += 1;
  }
  if (reason.includes('flashcard')) {
    updatedStats.flashcardReviews = (updatedStats.flashcardReviews || 0) + 1;
  }
  
  saveRPGStats(updatedStats, charId);
  
  const progress = getXPProgress(newXP, newLevel);
  const result = {
    characterId: charId,
    xpAwarded: amount,
    newXP,
    newLevel,
    leveledUp: newLevel > oldLevel,
    oldLevel,
    reason,
    progress
  };

  // Broadcast event so Navbar, Mascot & all widgets update live
  try {
    window.dispatchEvent(new CustomEvent('rpg-xp-gained', { detail: result }));
  } catch { /* noop */ }
  
  return result;
};

export const resetRPGStats = (characterId = null) => {
  try {
    const charId = characterId || getActiveCharacterId();
    const allStats = getAllCharacterRPGStats();
    allStats[charId] = { ...DEFAULT_CHAR_STATE };
    saveAllCharacterRPGStats(allStats);
    console.log(`[RPG System] RPG stats reset for character: ${charId}`);
    return true;
  } catch (error) {
    console.warn('[RPG System] Failed to reset RPG stats:', error);
    return false;
  }
};

// Character-specific level up reactions
export const getLevelUpReaction = (character, newLevel, isArabic = false) => {
  const reactions = {
    'luffy': {
      en: [
        `GEAR 5 LEVEL ${newLevel}! Gomu Gomu no Mastery! King of Students!`,
        `Sugoi! Level ${newLevel}! My brain is bursting with energy! Shishishi!`,
        `Level ${newLevel} unlocked! Meat feast celebration time!`
      ],
      ar: [
        `المستوى ${newLevel}! قوة المحرك الخامس! ملك الطلاب!`,
        `سوووغوي! المستوى ${newLevel}! عقلي ممتلئ بالطاقة! شيشيشي!`,
        `تم فتح المستوى ${newLevel}! وقت وليمة اللحم!`
      ]
    },
    'zoro': {
      en: [
        `Level ${newLevel}. My blade and mind cut through anything.`,
        `Level ${newLevel} achieved. Nothing happened, just pure discipline.`,
        `Level ${newLevel}. King of Hell focus sharpened to perfection.`
      ],
      ar: [
        `المستوى ${newLevel}. سيفي وعقلي يقطعان كل صعوبة.`,
        `تم تحقيق المستوى ${newLevel}. لم يحدث شيء، فقط انضباط خالص.`,
        `المستوى ${newLevel}. تركيز ملك الجحيم مصقول بإتقان.`
      ]
    },
    'gojo': {
      en: [
        `Level ${newLevel}! Throughout heaven and earth, we alone are honored!`,
        `Level ${newLevel} reached! Infinite knowledge unlocked! Too easy!`,
        `Six Eyes confirm Level ${newLevel}! Limitless mental capacity!`
      ],
      ar: [
        `المستوى ${newLevel}! بين السماء والأرض، نحن المميزون!`,
        `تم الوصول للمستوى ${newLevel}! معرفة لا محدودة! سهل جداً!`,
        `العيون الست تؤكد المستوى ${newLevel}! قدرة ذهنية لا نهائية!`
      ]
    },
    'chrollo': {
      en: [
        `Level ${newLevel}. Your intellectual capacity expands according to plan.`,
        `Excellent. Level ${newLevel} achieved through systematic dedication.`,
        `Perfect. Your mental acuity reaches Level ${newLevel}. The strategy unfolds.`
      ],
      ar: [
        `المستوى ${newLevel}. قدرتك الفكرية تتوسع وفق الخطة.`,
        `ممتاز. تم تحقيق المستوى ${newLevel} من خلال التفاني المنهجي.`,
        `مثالي. حدة ذهنك تصل للمستوى ${newLevel}. الاستراتيجية تتكشف.`
      ]
    },
    'law': {
      en: [
        `ROOM! Level ${newLevel} surgery complete. Your tactical mind evolves.`,
        `Level ${newLevel} achieved. Your strategic precision increases exponentially.`,
        `Perfect operation. Level ${newLevel} unlocked through disciplined focus.`
      ],
      ar: [
        `غرفة! اكتملت جراحة المستوى ${newLevel}. عقلك التكتيكي يتطور.`,
        `تم تحقيق المستوى ${newLevel}. دقتك الاستراتيجية تزداد أضعافاً.`,
        `عملية مثالية. تم فتح المستوى ${newLevel} من خلال التركيز المنضبط.`
      ]
    },
    'kaido': {
      en: [
        `Worororo! Level ${newLevel}! Your power grows like a true beast!`,
        `Level ${newLevel}! That's the strength I want to see! Keep fighting!`,
        `Magnificent! Level ${newLevel} proves you're getting stronger! Worororo!`
      ],
      ar: [
        `وورورو! المستوى ${newLevel}! قوتك تنمو كوحش حقيقي!`,
        `المستوى ${newLevel}! هذه القوة التي أريد رؤيتها! واصل القتال!`,
        `رائع! المستوى ${newLevel} يثبت أنك تصبح أقوى! وورورو!`
      ]
    },
    'sukuna': {
      en: [
        `Level ${newLevel}. Stand proud, your mental domain expands.`,
        `Level ${newLevel} reached. You amuse me with this relentless growth.`,
        `Malevolent intellect reaches Level ${newLevel}. Keep conquering.`
      ],
      ar: [
        `المستوى ${newLevel}. قف فخوراً، نطاقك الفكري يتوسع.`,
        `تم الوصول للمستوى ${newLevel}. تسعدني بهذا النمو المتواصل.`,
        `الذكاء الحاسم يصل للمستوى ${newLevel}. واصل السيطرة.`
      ]
    },
    'naruto': {
      en: [
        `Dattebayo! Level ${newLevel}! That's my ninja way!`,
        `Level ${newLevel}! Nine-Tails focus power unleashed! Believe it!`,
        `Level ${newLevel} unlocked! We're gonna become the greatest!`
      ],
      ar: [
        `داتيبايو! المستوى ${newLevel}! هذا طريقي في النينجا!`,
        `المستوى ${newLevel}! قوة تركيز الكيوبي انطلقت! صدقني!`,
        `تم فتح المستوى ${newLevel}! سنصبح الأعظم على الإطلاق!`
      ]
    },
    'nami': {
      en: [
        `Amazing! Level ${newLevel}! You're collecting knowledge like precious treasure!`,
        `Level ${newLevel}! Your skills are worth more than any gold!`,
        `Wonderful! Level ${newLevel} unlocked! Your dedication is truly valuable!`
      ],
      ar: [
        `مدهش! المستوى ${newLevel}! تجمع المعرفة ككنوز ثمينة!`,
        `المستوى ${newLevel}! مهاراتك تستحق أكثر من أي ذهب!`,
        `رائع! تم فتح المستوى ${newLevel}! إخلاصك ثمين حقاً!`
      ]
    },
    'tsunade': {
      en: [
        `Yosh! Level ${newLevel}! Your willpower burns with the strength of fire!`,
        `Level ${newLevel} achieved! This is true ninja dedication!`,
        `Excellent! Level ${newLevel}! Your mental strength rivals any jutsu!`
      ],
      ar: [
        `يوش! المستوى ${newLevel}! قوة إرادتك تحترق بقوة النار!`,
        `تم تحقيق المستوى ${newLevel}! هذا تفان النينجا الحقيقي!`,
        `ممتاز! المستوى ${newLevel}! قوتك الذهنية تنافس أي جوتسو!`
      ]
    },
    'robin': {
      en: [
        `Level ${newLevel}. Another layer of ancient knowledge uncovered.`,
        `Fascinating. Reaching Level ${newLevel} reveals deeper truths.`,
        `Level ${newLevel} achieved. The mystery of mastery unravels beautifully.`
      ],
      ar: [
        `المستوى ${newLevel}. طبقة أخرى من المعرفة القديمة تم كشفها.`,
        `مثير للاهتمام. الوصول للمستوى ${newLevel} يكشف حقائق أعمق.`,
        `تم تحقيق المستوى ${newLevel}. لغز الإتقان يتكشف بشكل جميل.`
      ]
    }
  };
  
  const charKey = (character || '').toLowerCase();
  const characterReactions = reactions[charKey] || reactions['chrollo'] || reactions['luffy'];
  const langReactions = characterReactions[isArabic ? 'ar' : 'en'] || characterReactions['en'];
  return langReactions[Math.floor(Math.random() * langReactions.length)];
};

// XP gain reactions (shorter, for frequent rewards)
export const getXPGainReaction = (character, xpAmount, reason = '', isArabic = false) => {
  const reactions = {
    'luffy': {
      en: [`+${xpAmount} XP! Gomu Gomu no Power!`, `+${xpAmount} XP! One step closer to Pirate King!`, `Shishishi! +${xpAmount} XP earned!`],
      ar: [`+${xpAmount} نقطة خبرة! قوة غومو غومو!`, `+${xpAmount} نقطة خبرة! خطوة أقرب لملك القراصنة!`, `شيشيشي! +${xpAmount} نقطة خبرة مكتسبة!`]
    },
    'zoro': {
      en: [`+${xpAmount} XP. Blade sharpened.`, `+${xpAmount} XP. Training continues.`, `Nothing happened. +${xpAmount} XP.`],
      ar: [`+${xpAmount} نقطة خبرة. السيف صُقل.`, `+${xpAmount} نقطة خبرة. التدريب مستمر.`, `لم يحدث شيء. +${xpAmount} نقطة خبرة.`]
    },
    'gojo': {
      en: [`+${xpAmount} XP! Limitless power!`, `Too easy! +${xpAmount} XP.`, `Six Eyes saw that: +${xpAmount} XP!`],
      ar: [`+${xpAmount} نقطة خبرة! قوة لا نهائية!`, `سهل جداً! +${xpAmount} نقطة خبرة.`, `العيون الست رصدت ذلك: +${xpAmount} نقطة خبرة!`]
    },
    'chrollo': {
      en: [`+${xpAmount} XP. Progress measured.`, 'Intellectual growth detected.', 'Knowledge accumulates systematically.'],
      ar: [`+${xpAmount} نقطة خبرة. التقدم محسوب.`, 'تم رصد نمو فكري.', 'المعرفة تتراكم منهجياً.']
    },
    'robin': {
      en: [`+${xpAmount} XP excavated.`, 'Knowledge from the void recorded.', `A valuable finding: +${xpAmount} XP.`],
      ar: [`+${xpAmount} نقطة خبرة منقّب عنها.`, 'معرفة من المجهول سُجلت.', `اكتشاف قيّم: +${xpAmount} نقطة خبرة.`]
    },
    'law': {
      en: [`+${xpAmount} XP. Tactical advancement.`, 'ROOM! Experience gained.', 'Strategic development noted.'],
      ar: [`+${xpAmount} نقطة خبرة. تقدم تكتيكي.`, 'غرفة! خبرة مكتسبة.', 'تطوير استراتيجي ملحوظ.']
    },
    'kaido': {
      en: [`+${xpAmount} XP! Getting stronger!`, 'Power increases! Worororo!', 'Beast-like growth!'],
      ar: [`+${xpAmount} نقطة خبرة! تزداد قوة!`, 'تزداد القوة! وورورو!', 'نمو كالوحوش!']
    },
    'nami': {
      en: [`+${xpAmount} XP treasure found!`, 'Knowledge gold collected!', 'Valuable experience gained!'],
      ar: [`تم العثور على كنز +${xpAmount} نقطة خبرة!`, 'تم جمع ذهب المعرفة!', 'خبرة قيمة مكتسبة!']
    },
    'tsunade': {
      en: [`+${xpAmount} XP! Will of Fire!`, 'Ninja spirit grows!', 'Mental strength increased!'],
      ar: [`+${xpAmount} نقطة خبرة! إرادة النار!`, 'روح النينجا تنمو!', 'القوة الذهنية تزداد!']
    }
  };
  
  const charKey = (character || '').toLowerCase();
  const characterReactions = reactions[charKey] || reactions['chrollo'] || reactions['luffy'];
  const langReactions = characterReactions[isArabic ? 'ar' : 'en'] || characterReactions['en'];
  return langReactions[Math.floor(Math.random() * langReactions.length)];
};