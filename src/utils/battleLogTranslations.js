/**
 * Battle Log Translation Utility
 * Seamlessly converts battle log entries between Arabic and English based on the active UI language.
 */

// Common task/reason translations
const REASON_TRANSLATIONS = {
  // English to Arabic
  'Task': 'مهمة',
  'Daily Task': 'مهمة يومية',
  'Boss Bomb': 'قنبلة الزعيم',
  'AI Combat Trial': 'تحدي قتال الذكاء الاصطناعي',
  'Combat Trial': 'تحدي القتال',
  'Deep Focus': 'التركيز العميق',
  'The Deep Focus Marathon': 'ماراثون التركيز العميق',
  'Weekly Knowledge Forge': 'كفاح المعرفة الأسبوعي',
  'Bane of Distractions': 'قاهر المشتتات',
  'Unbroken Discipline': 'انضباط متواصل',
  'The Grand Inquisitor': 'المحقق الأكبر',
  'Flashcard Arena': 'ساحة البطاقات',
  'Sloth Slayer': 'قاتل الكسل',
  'Deep Focus Sprint': 'سباق التركيز العميق',
  'Recall Master': 'سيد الاسترجاع',
  'Immortal Streak': 'سلسلة المجد',
  'Scholar Surge': 'طفرة المعرفة',
  'Mathematics': 'الرياضيات',
  'Data Science': 'علم البيانات',
  'Machine Learning': 'تعلم الآلة',
  'Deep Learning': 'التعلم العميق',
  'Artificial Intelligence': 'الذكاء الاصطناعي',
  'Trial Success': 'نجاح التحدي',

  // Arabic to English
  'مهمة': 'Task',
  'مهمة يومية': 'Daily Task',
  'قنبلة الزعيم': 'Boss Bomb',
  'تحدي قتال الذكاء الاصطناعي': 'AI Combat Trial',
  'تحدي القتال': 'Combat Trial',
  'التركيز العميق': 'Deep Focus',
  'ماراثون التركيز العميق': 'The Deep Focus Marathon',
  'كفاح المعرفة الأسبوعي': 'Weekly Knowledge Forge',
  'قاهر المشتتات': 'Bane of Distractions',
  'انضباط متواصل': 'Unbroken Discipline',
  'المحقق الأكبر': 'The Grand Inquisitor',
  'ساحة البطاقات': 'Flashcard Arena',
  'قاتل الكسل': 'Sloth Slayer',
  'سباق التركيز العميق': 'Deep Focus Sprint',
  'سيد الاسترجاع': 'Recall Master',
  'سلسلة المجد': 'Immortal Streak',
  'طفرة المعرفة': 'Scholar Surge',
  'الرياضيات': 'Mathematics',
  'علم البيانات': 'Data Science',
  'تعلم الآلة': 'Machine Learning',
  'التعلم العميق': 'Deep Learning',
  'الذكاء الاصطناعي': 'Artificial Intelligence',
  'نجاح التحدي': 'Trial Success',
};

export function translateReason(reason, isAr) {
  if (!reason) return isAr ? 'مهمة' : 'Task';
  
  const trimmed = String(reason).trim();
  if (REASON_TRANSLATIONS[trimmed]) {
    return REASON_TRANSLATIONS[trimmed];
  }

  // Handle dynamic strings like "Defeated Marshall D. Teach's Trial" or "Landed AI Strike vs Doflamingo"
  if (isAr) {
    if (/Teach/i.test(trimmed) && /Trial/i.test(trimmed)) return 'تحدي تيتش الحاسِم';
    if (/Doflamingo/i.test(trimmed) && /Trial/i.test(trimmed)) return 'تحدي دوفلامينغو الحاسِم';
    if (/Chrollo/i.test(trimmed) && /Trial/i.test(trimmed)) return 'تحدي كرولو الحاسِم';
    if (/Critical Strike/i.test(trimmed)) return 'ضربة قتالية حاسمة';
    if (/AI Strike/i.test(trimmed)) return 'ضربة الذكاء الاصطناعي';
    if (/Study session/i.test(trimmed)) return 'جلسة دراسية';
    if (/Flashcard/i.test(trimmed)) return 'مراجعة بطاقات';
  } else {
    if (/تيتش/i.test(trimmed) && /تحدي/i.test(trimmed)) return "Teach's Combat Trial";
    if (/دوفلامينغو/i.test(trimmed) && /تحدي/i.test(trimmed)) return "Doflamingo's Combat Trial";
    if (/كرولو/i.test(trimmed) && /تحدي/i.test(trimmed)) return "Chrollo's Combat Trial";
    if (/ضربة حاسمة/i.test(trimmed)) return 'Critical Strike';
    if (/جلسة دراسية/i.test(trimmed)) return 'Study Session';
    if (/بطاقات/i.test(trimmed)) return 'Flashcard Review';
  }

  return trimmed;
}

export function formatBattleLogText(log, t, isAr) {
  if (!log) return '';

  // 1. Structured log object
  if (typeof log === 'object' && log.type) {
    switch (log.type) {
      case 'newDay': {
        const hp = log.hp || 1000;
        const tasks = log.tasks || 20;
        return t ? t('dailyBoss.newDayBossRestored', { hp, tasks }) : (
          isAr
            ? `يوم جديد! تمت استعادة الزعيم إلى ${hp} صحة — ${tasks} مهمة لإلحاق الضرر الكامل!`
            : `New Day! Boss restored to ${hp} HP — ${tasks} tasks to deal full damage!`
        );
      }
      case 'damage': {
        const dmg = log.dmg || 0;
        const reason = translateReason(log.reason, isAr);
        const current = log.current ?? 0;
        const max = log.max || 1000;
        return t ? t('dailyBoss.bossAtHp', { dmg, reason, current, max }) : (
          isAr
            ? `-${dmg} صحة (${reason}) — الزعيم عند ${current}/${max}`
            : `-${dmg} HP (${reason}) — Boss at ${current}/${max}`
        );
      }
      case 'defeated': {
        const coins = log.coins || 150;
        const xp = log.xp || 500;
        return t ? t('dailyBoss.bossDefeated', { coins, xp }) : (
          isAr
            ? `تم هزيمة الزعيم! جميع المهام مكتملة! +${coins} عملة و +${xp} XP!`
            : `Boss Defeated! All tasks complete! +${coins} Coins & +${xp} XP!`
        );
      }
      case 'defeatedShort': {
        const coins = log.coins || 150;
        const xp = log.xp || 500;
        return t ? t('dailyBoss.bossDefeatedShort', { coins, xp }) : (
          isAr
            ? `تم هزيمة الزعيم! +${coins} عملة و +${xp} XP!`
            : `Boss Defeated! +${coins} Coins & +${xp} XP!`
        );
      }
      case 'criticalStrike': {
        return t ? t('dailyBoss.criticalStrike') : (
          isAr
            ? 'ضربة حاسمة! -200 صحة للزعيم (+100 XP، +30 ذهب)!'
            : 'CRITICAL STRIKE! -200 HP to Boss (+100 XP, +30 Gold)!'
        );
      }
      case 'bossBlocked': {
        return t ? t('dailyBoss.bossBlocked') : (
          isAr
            ? 'صدّ الزعيم الهجوم! راجع الشرح.'
            : 'Boss blocked the attack! Review the explanation.'
        );
      }
      case 'newChallenger': {
        const lvl = log.level || log.lvl || 1;
        return isAr
          ? `ظهر متحدٍ جديد: زعيم المستوى ${lvl}!`
          : `New Challenger Appeared: Level ${lvl} Boss!`;
      }
      default:
        break;
    }
  }

  // 2. String-based log or legacy log parsing
  const rawText = typeof log === 'string' ? log : (log.text || '');
  if (!rawText) return '';

  // Pattern: New Day / يوم جديد
  const newDayMatch = rawText.match(/(?:New Day!?\s*Boss restored to|يوم جديد!?\s*تمت استعادة الزعيم إلى)\s*(\d+)\s*(?:HP|صحة)\s*(?:—|-)\s*(\d+)\s*(?:tasks|مهمة)/i);
  if (newDayMatch) {
    const hp = newDayMatch[1];
    const tasks = newDayMatch[2];
    return t ? t('dailyBoss.newDayBossRestored', { hp, tasks }) : (
      isAr
        ? `يوم جديد! تمت استعادة الزعيم إلى ${hp} صحة — ${tasks} مهمة لإلحاق الضرر الكامل!`
        : `New Day! Boss restored to ${hp} HP — ${tasks} tasks to deal full damage!`
    );
  }

  // Pattern: Damage / ضرر: -50 HP (Reason) — Boss at 950/1000 OR -50 صحة (السبب) — الزعيم عند 950/1000
  const dmgMatch = rawText.match(/[-−](\d+)\s*(?:HP|صحة)\s*\((.*?)\)\s*(?:—|-)\s*(?:Boss at|الزعيم عند|صحة الزعيم)\s*(\d+)\/(\d+)/i);
  if (dmgMatch) {
    const dmg = dmgMatch[1];
    const rawReason = dmgMatch[2];
    const current = dmgMatch[3];
    const max = dmgMatch[4];
    const reason = translateReason(rawReason, isAr);
    return t ? t('dailyBoss.bossAtHp', { dmg, reason, current, max }) : (
      isAr
        ? `-${dmg} صحة (${reason}) — الزعيم عند ${current}/${max}`
        : `-${dmg} HP (${reason}) — Boss at ${current}/${max}`
    );
  }

  // Pattern: Boss Defeated / تم هزيمة الزعيم
  if (/Boss Defeated|تم هزيمة الزعيم/i.test(rawText)) {
    const coinsMatch = rawText.match(/\+(\d+)\s*(?:Coins|ذهب|عملة|عملات)/i);
    const xpMatch = rawText.match(/\+(\d+)\s*(?:XP|خبرة)/i);
    const coins = coinsMatch ? coinsMatch[1] : 150;
    const xp = xpMatch ? xpMatch[1] : 500;
    const isShort = !/All tasks complete|جميع المهام/i.test(rawText);
    if (isShort) {
      return t ? t('dailyBoss.bossDefeatedShort', { coins, xp }) : (
        isAr ? `تم هزيمة الزعيم! +${coins} عملة و +${xp} XP!` : `Boss Defeated! +${coins} Coins & +${xp} XP!`
      );
    }
    return t ? t('dailyBoss.bossDefeated', { coins, xp }) : (
      isAr ? `تم هزيمة الزعيم! جميع المهام مكتملة! +${coins} عملة و +${xp} XP!` : `Boss Defeated! All tasks complete! +${coins} Coins & +${xp} XP!`
    );
  }

  // Pattern: Critical Strike / ضربة حاسمة
  if (/CRITICAL STRIKE|ضربة حاسمة/i.test(rawText)) {
    return t ? t('dailyBoss.criticalStrike') : (
      isAr
        ? 'ضربة حاسمة! -200 صحة للزعيم (+100 XP، +30 ذهب)!'
        : 'CRITICAL STRIKE! -200 HP to Boss (+100 XP, +30 Gold)!'
    );
  }

  // Pattern: Blocked / صد الهجوم
  if (/Boss blocked|صدّ? الزعيم/i.test(rawText)) {
    return t ? t('dailyBoss.bossBlocked') : (
      isAr ? 'صدّ الزعيم الهجوم! راجع الشرح.' : 'Boss blocked the attack! Review the explanation.'
    );
  }

  // Pattern: New Challenger / متحدٍ جديد
  const challengerMatch = rawText.match(/(?:New Challenger Appeared:\s*Level|ظهر متحدٍ جديد:\s*زعيم المستوى)\s*(\d+)/i);
  if (challengerMatch) {
    const lvl = challengerMatch[1];
    return isAr
      ? `ظهر متحدٍ جديد: زعيم المستوى ${lvl}!`
      : `New Challenger Appeared: Level ${lvl} Boss!`;
  }

  return rawText;
}
