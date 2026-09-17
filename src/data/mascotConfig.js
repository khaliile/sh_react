/**
 * mascotConfig.js
 *
 * Mascot character configurations, personality system prompts,
 * canonical event dialogs, and offline fallback generation.
 */

import { MASCOT_CHARACTERS } from './mascotCharacters';
import { ANIME_CHARACTERS } from './inventoryData';
import { getAvatarPath } from './animeAvatars';

const ARABIC_RE = /[\u0600-\u06FF]/;

export function getMascotConfig(charId) {
  if (!charId) return MASCOT_CHARACTERS.chrollo;
  if (MASCOT_CHARACTERS[charId]) {
    return MASCOT_CHARACTERS[charId];
  }
  const found = (ANIME_CHARACTERS || []).find(c => c.id === charId);
  if (found) {
    return {
      id: found.id,
      name: found.name,
      gender: 'male',
      series: found.series,
      imageUrl: getAvatarPath(found.id),
      defaultAura: found.seriesColor || '#38bdf8',
      defaultVoice: 'en_US-ryan-medium',
      greetingEn: `I am ${found.name} from ${found.series}. "${found.quote || 'Let us achieve greatness today.'}" Let's begin!`,
      greetingAr: `أنا ${found.name} من ${found.series}. "${found.quote || 'لنحقق أهدافنا اليوم!'}" لنبدأ العمل!`,
      systemPrompt: `You are ${found.name} from ${found.series}—${found.title || ''}!
CHARACTER ESSENCE: ${found.desc || ''}
Your famous quote: "${found.quote || ''}".
RESPONSE STYLE:
- Speak in-character as ${found.name}.
- Keep answers under 3 sentences, inspiring the user in their focus and studies.`,
      offlineWisdom: [
        { triggers: ['hello', 'hi'], en: found.quote || `Stay determined and focused on your goals.`, ar: 'حافظ على عزيمتك وتركيزك على أهدافك.' }
      ]
    };
  }
  return MASCOT_CHARACTERS.chrollo || Object.values(MASCOT_CHARACTERS)[0];
}

export const CHARACTERS = new Proxy(MASCOT_CHARACTERS, {
  get(target, prop) {
    if (typeof prop === 'string') {
      if (prop in target) return target[prop];
      const dyn = getMascotConfig(prop);
      if (dyn) return dyn;
    }
    return target[prop];
  }
});

// ── Canonical Event Fallback Mapping ─────────────────────────────────────────
export const EVENT_CANONICAL_LINES = {
  APP_START: 'Welcome back. The operation resumes — calm, focused, and mathematically inevitable.',
  SESSION_START: 'Objective established. 25 minutes of absolute focus begins now. Eliminate all friction.',
  TIMER_PAUSED: 'Activity halted. Is this a strategic recovery break or a lapse in focus? Realign immediately.',
  TASK_STALLED: 'Task stalled. The initial scope was miscalculated. Breaking down into micro-steps now.',
  TASK_OVERDUE: 'Task stalled. The initial scope was miscalculated. Breaking down into micro-steps now.',
  TASK_COMPLETED: 'Objective achieved. Metrics updated. Queuing the next logical priority.',
  POMODORO_FINISHED: 'Objective achieved. Metrics updated. Queuing the next logical priority.',
  IDLE_ALERT: 'Inactivity detected. Time is a non-renewable asset. Resume or reschedule.',
  FATIGUE_ALERT: 'Cognitive threshold reached. Initiate a 5-minute tactical recovery break.',
  DISTRACTION_LOGGED: 'Distraction registered. Adjusting protocol to safeguard current session efficiency.',
  BREAK_END: 'Recovery concluded. Return to the battlefield; your next focus session is active.',
};

// Character-specific BREAK_END messages
export const CHARACTER_BREAK_END_MESSAGES = {
  'Law': 'ROOM! Break over. Time to return to strategic focus. Let\'s dominate the next session.',
  'Kaido': 'Worororo! Rest time is done! Now show me your strength! Back to crushing your goals!',
  'Luffy': 'Break\'s over! Time to get back to our adventure! Let\'s go full power!',
  'Gojo': 'Break complete. Time to return to limitless focus. Show them what you\'re made of.',
  'Eren': 'Tatakae! Rest is over. Fight! Get back to your mission. Keep moving forward!',
  'Sukuna': 'Playtime\'s over. Return to your task, or face my disappointment.',
  'Zoro': 'Break finished. Time to train harder. Back to cutting through obstacles.',
  'Itachi': 'Recovery complete. Those who endure hardship become stronger. Resume.',
  'Levi': 'Break over. Get back to work. No time for slacking.',
  'Madara': 'Your break ends now. Return to the battlefield of productivity.',
  'Kakashi': 'Break finished. Time to get serious again. Back to your studies.',
  'Naruto': 'Break\'s done! Believe it! Time to give it everything we\'ve got!',
  'Mikasa': 'Rest complete. Back to training. Stay focused and strong.',
  'Robin': 'Break concluded. Knowledge awaits. Return to your studies.',
  'Gon': 'Break time over! Let\'s get back to learning! I\'m fired up!',
  'Killua': 'Rest finished. Time to focus again. Show them your skills.',
  'Hisoka': 'Playtime concluded~ Back to sharpening your abilities. â™¦',
  'Kurapika': 'Recovery complete. The mission continues. Resume your focus.',
  'Chrollo': 'Break over. Return to acquiring knowledge. Patience and precision.',
  // Female Characters
  'Nami': 'Break\'s over! The wind is favorable—let\'s get back on course!',
  'Tsunade': 'Break\'s done! Back to training—weakness is not an option!',
  'Yoruichi': 'Break time\'s over! Let\'s see if you got faster during the rest!',
  'Erza': 'Break complete! Requip your focus and return to the battlefield!',
  'Hinata': 'Um... break is over. L-let\'s keep going together, okay?',
  'Mai': 'Break\'s done. Back to work. No complaining.',
  'Maki': 'Break\'s over! Get up and fight! Weakness is a choice!',
};

// Arabic character-specific BREAK_END messages
export const CHARACTER_BREAK_END_MESSAGES_AR = {
  'Law': 'انتهت الاستراحة. حان وقت العودة للتركيز الاستراتيجي. لندمر الجلسة القادمة.',
  'Kaido': 'وورورورو! انتهى وقت الراحة! الآن أرني قوتك! عد لسحق أهدافك!',
  'Luffy': 'انتهت الاستراحة! حان وقت العودة لمغامرتنا! لنذهب بكامل القوة!',
  'Gojo': 'انتهت الاستراحة. حان وقت العودة للتركيز اللامحدود. أرهم ما أنت مصنوع منه.',
  'Eren': 'تاتاكاي! انتهت الراحة. قاتل! عد لمهمتك. استمر في التقدم!',
  'Sukuna': 'انتهى وقت اللعب. عد لمهمتك، أو واجه خيبة أملي.',
  'Zoro': 'انتهت الاستراحة. حان وقت التدريب الأقوى. عد لقطع العقبات.',
  'Itachi': 'اكتمل التعافي. من يتحمل المشقة يصبح أقوى. استأنف.',
  'Levi': 'انتهت الاستراحة. عد للعمل. لا وقت للكسل.',
  'Madara': 'ينتهي استراحتك الآن. عد لساحة معركة الإنتاجية.',
  'Kakashi': 'انتهت الاستراحة. حان وقت الجدية مرة أخرى. عد لدراستك.',
  'Naruto': 'انتهت الاستراحة! صدقني! حان وقت بذل كل ما لدينا!',
  'Mikasa': 'اكتمل الراحة. عد للتدريب. ابق مركزاً وقوياً.',
  'Robin': 'انتهت الاستراحة. المعرفة في انتظارك. عد لدراستك.',
  'Gon': 'انتهى وقت الاستراحة! لنعد للتعلم! أنا متحمس!',
  'Killua': 'انتهت الراحة. حان وقت التركيز مجدداً. أرهم مهاراتك.',
  'Hisoka': 'انتهى وقت اللعب~ عد لشحذ قدراتك. ♦',
  'Kurapika': 'اكتمل التعافي. تستمر المهمة. استأنف تركيزك.',
  'Chrollo': 'انتهت الاستراحة. عد لاكتساب المعرفة. الصبر والدقة.',
  // Female Characters
  'Nami': 'انْتَهَتِ الاسْتِرَاحَةُ! الرِّيحُ مُوَاتِيَةٌ—لِنَعُدْ إِلَى الطَّرِيقِ!',
  'Tsunade': 'انْتَهَتِ الاسْتِرَاحَةُ! عُودُوا لِلتَّدْرِيبِ—الضَّعْفُ لَيْسَ خِيَاراً!',
  'Yoruichi': 'انْتَهَى وَقْتُ الاسْتِرَاحَةِ! لِنَرَى إِنْ أَصْبَحْتَ أَسْرَعَ!',
  'Erza': 'اكْتَمَلَتِ الاسْتِرَاحَةُ! جَهِّزْ تَرْكِيزَكَ وَعُدْ لِلْمَعْرَكَةِ!',
  'Hinata': 'أ-انْتَهَتِ الاسْتِرَاحَةُ... لِنُكْمِلْ مَعاً، حَسَناً؟',
  'Mai': 'انْتَهَتِ الاسْتِرَاحَةُ. عُدْ لِلْعَمَلِ. لا شَكْوَى.',
  'Maki': 'انْتَهَتِ الاسْتِرَاحَةُ! قُمْ وَقَاتِلْ! الضَّعْفُ اخْتِيَارٌ!',
};

// ── AUTOMATIC PERSONALITY-BASED RESPONSES (No API needed) ────────────────────
// These trigger immediately for each event type based on character personality  
export const AUTO_PERSONALITY_RESPONSES = {
  // ── SESSION START (Pomodoro begins) ──
  SESSION_START: {
    'robin': {
      en: ['The excavation begins. Focus your mind.', 'Let us uncover the truth. 25 minutes of deep research.', 'Silence and focus. The search starts now.'],
      ar: ['بدأ التنقيب. ركز عقلك.', 'دعنا نكشف الحقيقة. 25 دقيقة من البحث العميق.', 'هدوء وتركيز. يبدأ البحث الآن.']
    },
    'chrollo': {
      en: ['Operation initiated. 25 minutes of absolute focus.', 'The plan begins. Eliminate all distractions.', 'Protocol active. Execute with precision.'],
      ar: ['بدأت العملية. 25 دقيقة من التركيز المطلق.', 'تبدأ الخطة الآن. أزل كل المشتتات.', 'البروتوكول نشط. نفذ بدقة عالية.']
    },
    'luffy': {
      en: ['Yosh! Focus mode on! Let\'s go!', '25 minutes! Full power, shishishi!', 'Gomu Gomu no Study Session! Let\'s do this!'],
      ar: ['يوش! وضع التركيز يعمل! لننطلق!', '25 دقيقة! بكامل القوة، شيشيشي!', 'جلسة مذاكرة غومو غومو! لنبدأ!']
    },
    'zoro': {
      en: ['Draw your focus. 25 minutes begins now.', 'No looking away. Sharpen your mind.', 'Training session active. Stay disciplined.'],
      ar: ['استحضر تركيزك. تبدأ 25 دقيقة الآن.', 'لا تلتفت بعيداً. اشحذ عقلك.', 'جلسة التدريب نشطة. ابق منضبطاً.']
    },
    'gojo': {
      en: ['Domain Expansion: Infinite Focus!', '25 minutes starts now. You got this, genius!', 'Time to show everyone why you\'re the best!'],
      ar: ['توسع النطاق: التركيز اللانهائي!', 'تبدأ 25 دقيقة الآن. أنت عبقري وستفعلها!', 'حان الوقت لتريهم لماذا أنت الأفضل!']
    },
    'sukuna': {
      en: ['Open Domain. Let us see your focus.', 'Do not disappoint me. 25 minutes of complete dedication.'],
      ar: ['افتح النطاق. دعنا نرى تركيزك.', 'لا تخيب أملي. 25 دقيقة من التفاني التام.']
    },
    'naruto': {
      en: ['Shadow Clone Focus Jutsu! Let\'s do this, dattebayo!', '25 minutes of hard training starts now!'],
      ar: ['جوتسو نسخ الظل للتركيز! لنفعلها، داتيبايو!', '25 دقيقة من التدريب الشاق تبدأ الآن!']
    },
    'law': {
      en: ['ROOM! Surgery begins. Maintain absolute precision.', 'Focus block active. Zero mistakes.', 'The operation has begun.'],
      ar: ['غرفة! تبدأ الجراحة. حافظ على الدقة التامة.', 'كتلة التركيز نشطة. صفر أخطاء.', 'بدأت العملية.']
    },
    'nami': {
      en: ['Set course for full productivity! 25 minutes on the clock!', 'Smooth sailing ahead. Let\'s get to work!'],
      ar: ['اضبط المسار للإنتاجية الكاملة! 25 دقيقة على العداد!', 'إبحار سلس في انتظارنا. لنبدأ العمل!']
    }
  },

  // ── POMODORO FINISHED (25 min complete) ──
  POMODORO_FINISHED: {
    'robin': {
      en: ['Fascinating progress. Another chapter uncovered.', '25 minutes completed. A true scholar\'s focus.', 'Well done. Knowledge deepens with every session.'],
      ar: ['تقدم مذهل. تم كشف فصل آخر من المعرفة.', 'اكتملت 25 دقيقة. تركيز عالم حقيقي.', 'أحسنت. المعرفة تتعمق مع كل جلسة.']
    },
    'luffy': {
      en: ['Meat time! Pomodoro done!', 'Gear 5 focus! That was awesome!', 'Shishishi! 25 minutes crushed!'],
      ar: ['وقت اللحم! تم إكمال البومودورو!', 'تركيز الجير 5! كان رائعاً!', 'شيشيشي! سحقنا 25 دقيقة!']
    },
    'zoro': {
      en: ['25 minutes of sword discipline complete.', 'Session finished. Never stop training.', 'Good focus. Keep your blade sharp.'],
      ar: ['25 دقيقة من انضباط السيف اكتملت.', 'انتهت الجلسة. لا تتوقف عن التدريب.', 'تركيز جيد. حافظ على حدة سيفك.']
    },
    'gojo': {
      en: ['Limitless focus complete! Brilliant work.', '25 minutes in the Void. Easy win.', 'Piece of cake! That\'s why we\'re the strongest.'],
      ar: ['اكتمل التركيز اللامحدود! عمل رائع.', '25 دقيقة في الفراغ. فوز سهل.', 'أمر بسيط! لهذا نحن الأقوى.']
    },
    'sukuna': {
      en: ['Domain maintained for 25 minutes.', 'Session done. Your focus satisfies me.', 'Hmph, a worthy effort.'],
      ar: ['تم الحفاظ على النطاق لمدة 25 دقيقة.', 'انتهت الجلسة. تركيزك يرضيني.', 'همف، جهد جدير بالاهتمام.']
    },
    'naruto': {
      en: ['Dattebayo! 25 minutes crushed!', 'Shadow Clone study session complete!', 'Never give up! On to the next round!'],
      ar: ['داتيبايو! سحقنا 25 دقيقة!', 'اكتملت جلسة تدريب نسخ الظل!', 'لا نستسلم أبداً! إلى الجولة التالية!']
    },
    'chrollo': {
      en: ['Perfect. Plan advances.', 'Objective complete.', 'Flawless execution.'],
      ar: ['مثالي. الخطة تتقدم.', 'الهدف مكتمل.', 'تنفيذ لا تشوبه شائبة.']
    },
    'law': {
      en: ['ROOM! Surgery complete.', 'Operation successful.', 'Victory secured.'],
      ar: ['غرفة! العملية مكتملة.', 'العملية ناجحة.', 'النصر مضمون.']
    },
    'kaido': {
      en: ['Worororo! Pure power!', 'Warrior strength!', 'Conqueror spirit!'],
      ar: ['وورورو! قوة خالصة!', 'قوة المحارب!', 'روح الفاتح!']
    },
    'nami': {
      en: ['Treasure found!', 'Perfect navigation!', 'Gold collected!'],
      ar: ['وجد الكنز!', 'ملاحة مثالية!', 'ذهب محصود!']
    },
    'tsunade': {
      en: ['Hokage power!', 'Will of Fire!', 'Ninja strength!'],
      ar: ['قوة الهوكاجي!', 'إرادة النار!', 'قوة النينجا!']
    },
    'yoruichi': {
      en: ['Lightning speed!', 'Shunpo mastery!', 'Perfect technique!'],
      ar: ['سرعة البرق!', 'إتقان الشونبو!', 'تقنية مثالية!']
    },
    'erza': {
      en: ['Knight discipline!', 'Blade sharp!', 'Victory earned!'],
      ar: ['انضباط الفارس!', 'السيف حاد!', 'نصر مستحق!']
    }
  },

  // ── TASK COMPLETED (Celebration) ──
  TASK_COMPLETED: {
    'robin': {
      en: ['A puzzle solved. Excellent work.', 'Target completed. The truth reveals itself.', 'Nicely analyzed and executed.'],
      ar: ['تم حل اللغز. عمل ممتاز.', 'اكتمل الهدف. الحقيقة تكشف عن نفسها.', 'تحليل وتنفيذ متقن.']
    },
    'luffy': {
      en: ['Gomu Gomu no Victory! Target smashed!', 'Yosh! One step closer to Pirate King!', 'Sugoi! Next task, bring it on!'],
      ar: ['نصر غومو غومو! تم سحق الهدف!', 'يوش! خطوة أقرب لملك القراصنة!', 'سوووغوي! هات المهمة التالية!']
    },
    'zoro': {
      en: ['One cut, task done.', 'Nothing happened. Just daily training.', 'Target sliced through cleanly.'],
      ar: ['قطعة واحدة، تمت المهمة.', 'لم يحدث شيء. فقط تدريب يومي.', 'تم قطع الهدف بنظافة.']
    },
    'gojo': {
      en: ['Too easy! That\'s why I\'m the strongest.', 'Domain Expansion: Task Obliterated!', 'Another task wiped out effortlessly!'],
      ar: ['سهل جداً! لهذا أنا الأقوى.', 'توسع النطاق: تم محو المهمة!', 'مهمة أخرى تم مسحها بلا عناء!']
    },
    'sukuna': {
      en: ['Dismantled. The task is no more.', 'A swift execution.', 'Know your place, task obliterated.'],
      ar: ['تم التفكيك. لا وجود للمهمة بعد الآن.', 'تنفيذ سريع وحاسم.', 'تم محو المهمة بالكامل.']
    },
    'naruto': {
      en: ['Rasengan! Task finished!', 'Believe it! We conquered that mission!', 'Hokage-level execution!'],
      ar: ['راسينغان! انتهت المهمة!', 'صدقني! قهرنا هذه المهمة!', 'تنفيذ بمستوى الهوكاجي!']
    },
    'chrollo': {
      en: ['Task eliminated.', 'Perfect execution.', 'Next target ready.'],
      ar: ['المهمة منتهية.', 'تنفيذ مثالي.', 'الهدف التالي جاهز.']
    },
    'law': {
      en: ['ROOM! Mission done!', 'Perfect operation!', 'Sharp focus!'],
      ar: ['غرفة! المهمة تمت!', 'عملية مثالية!', 'تركيز حاد!']
    },
    'kaido': {
      en: ['Worororo! Thunder Bagua smash!', 'Crushed like an insect!', 'Victory is ours!'],
      ar: ['وورورو! ضربة رعدية ساحقة!', 'سحقناها كالحشرة!', 'النصر لنا!']
    },
    'nami': {
      en: ['Yatta! New treasure!', 'Skills growing!', 'Amazing work!'],
      ar: ['ياتا! كنز جديد!', 'المهارات تنمو!', 'عمل مدهش!']
    },
    'tsunade': {
      en: ['Yosh! Mission done!', 'True ninja spirit!', 'Legendary work!'],
      ar: ['يوش! المهمة تمت!', 'روح النينجا الحقيقية!', 'عمل أسطوري!']
    },
    'yoruichi': {
      en: ['Ara ara~ perfect!', 'Lightning speed!', 'Flawless technique!'],
      ar: ['آرا آرا~ مثالي!', 'سرعة البرق!', 'تقنية لا تشوبها شائبة!']
    },
    'erza': {
      en: ['Victory achieved!', 'Knight\'s honor!', 'Mission complete!'],
      ar: ['تم النصر!', 'شرف الفارس!', 'المهمة مكتملة!']
    }
  },

  // ── FLASHCARD COMPLETED ──
  FLASHCARD_COMPLETED: {
    'robin': {
      en: ['Historical fact memorized.', 'Your memory rivals the ancient archives.', 'Knowledge safely preserved.'],
      ar: ['تم حفظ المعلومة في الأرشيف.', 'ذاكرتك تضاهي المخطوطات القديمة.', 'المعرفة محفوظة بأمان.']
    },
    'luffy': {
      en: ['Brain getting stronger! Shishishi!', 'Gomu Gomu no Recall! Nailed it!', 'Awesome! Memory power up!'],
      ar: ['دماغي يزداد قوة! شيشيشي!', 'استرجاع غومو غومو! أتقنتها!', 'رائع! طاقة الذاكرة ارتفعت!']
    },
    'zoro': {
      en: ['Card conquered.', 'Mind as sharp as Enma.', 'Next flashcard, hurry.'],
      ar: ['تم غزو البطاقة.', 'العقل حاد مثل سيف إنما.', 'البطاقة التالية، بسرعة.']
    },
    'gojo': {
      en: ['Six Eyes saw right through that card!', 'Instant recall! You\'re a genius.', 'Limitless memory active!'],
      ar: ['العيون الست اخترقت البطاقة فوراً!', 'استرجاع فوري! أنت عبقري.', 'الذاكرة اللامحدودة نشطة!']
    },
    'sukuna': {
      en: ['Knowledge assimilated.', 'Cleaved through that question.', 'Adequate memory.'],
      ar: ['تم استيعاب المعرفة.', 'تم قطع هذا السؤال.', 'ذاكرة ملائمة.']
    },
    'naruto': {
      en: ['Got it right, dattebayo!', 'Memory jutsu mastered!', 'One more card down!'],
      ar: ['أجبت بشكل صحيح، داتيبايو!', 'أتقنت جوتسو الذاكرة!', 'سقطت بطاقة أخرى!']
    },
    'chrollo': {
      en: ['Knowledge indexed into the book.', 'Instant recall confirmed.', 'Mental archive expanded.'],
      ar: ['تمت فهرسة المعرفة في الكتاب.', 'تم تأكيد الاسترجاع الفوري.', 'الأرشيف الفكري توسع.']
    },
    'law': {
      en: ['ROOM! Precision recall.', 'Correct diagnosis.', 'Memory surgery clean.'],
      ar: ['غرفة! استرجاع دقيق.', 'تشخيص صحيح.', 'جراحة الذاكرة نظيفة.']
    },
    'nami': {
      en: ['Treasure fact remembered!', 'Card mastered!', 'Smart move!'],
      ar: ['تم تذكر معلومة ثمينة!', 'تمت السيطرة على البطاقة!', 'حركة ذكية!']
    },
    'tsunade': {
      en: ['Sharp mind!', 'Medical-grade precision!', 'Keep recalling!'],
      ar: ['عقل حاد!', 'دقة بمستوى طبي!', 'واصل الاسترجاع!']
    }
  },

  // ── TIMER PAUSED (Where are you going?) ──
  TIMER_PAUSED: {
    'robin': {
      en: ['Pausing? Take care not to leave the mystery half-solved.', 'Lost in thought, or losing focus? Return soon.'],
      ar: ['توقفت مؤقتاً؟ احرص ألا تترك اللغز دون حل.', 'شارد في التفكير، أم تشتت تركيزك؟ عد قريباً.']
    },
    'luffy': {
      en: ['Oi! Where are you going?! Let\'s finish!', 'Don\'t give up now! Come back!'],
      ar: ['أوي! إلى أين تذهب؟! لنكمل!', 'لا تستسلم الآن! عد!']
    },
    'zoro': {
      en: ['Oi, training isn\'t over yet.', 'Don\'t wander off. Back to the blade.'],
      ar: ['أوي، التدريب لم ينتهِ بعد.', 'لا تتجول بعيداً. عد إلى السيف.']
    },
    'gojo': {
      en: ['Where you going? We were just getting started!', 'Don\'t pause now, show me that limitless energy!'],
      ar: ['إلى أين أنت ذاهب؟ كنا بدأنا للتو!', 'لا تتوقف الآن، أرني تلك الطاقة اللامحدودة!']
    },
    'chrollo': {
      en: ['Where are you going?', 'Plan needs focus.', 'Return immediately.'],
      ar: ['إلى أين تذهب؟', 'الخطة تحتاج تركيز.', 'عد فوراً.']
    },
    'law': {
      en: ['ROOM! Come back!', 'Operation incomplete!', 'Resume now!'],
      ar: ['غرفة! عد!', 'العملية غير مكتملة!', 'استأنف الآن!']
    },
    'kaido': {
      en: ['Oi! No fleeing!', 'Fight like warrior!', 'Get back here!'],
      ar: ['أوي! لا هروب!', 'حارب كمحارب!', 'عد هنا!']
    },
    'nami': {
      en: ['Come back!', 'Treasure waiting!', 'Stay on course!'],
      ar: ['عد!', 'الكنز ينتظر!', 'ابق على المسار!']
    },
    'tsunade': {
      en: ['Hey! Get back!', 'Ninja never quits!', 'Stay strong!'],
      ar: ['مهلاً! عد!', 'النينجا لا يستسلم!', 'ابق قوياً!']
    },
    'yoruichi': {
      en: ['Ara~ come back!', 'Show your speed!', 'No slowing down!'],
      ar: ['آرا~ عد!', 'أظهر سرعتك!', 'لا تبطئ!']
    },
    'erza': {
      en: ['Wait, soldier!', 'No retreat!', 'Fight with honor!'],
      ar: ['انتظر أيها الجندي!', 'لا تراجع!', 'حارب بشرف!']
    }
  },

  // ── BREAK END (Return to work) ──  
  BREAK_END: {
    'robin': {
      en: ['The break is over. History awaits your discovery.', 'Rest concluded. Return to your studies.'],
      ar: ['انتهت الاستراحة. المعرفة بانتظار اكتشافك.', 'انتهت الراحة. عد إلى دراستك.']
    },
    'luffy': {
      en: ['Break\'s over! Time for adventure!', 'Let\'s go full power again!'],
      ar: ['انتهت الاستراحة! وقت المغامرة!', 'لننطلق بكامل قوتنا مجدداً!']
    },
    'zoro': {
      en: ['Break finished. Back to training.', 'Sharpen your mind and resume.'],
      ar: ['انتهت الاستراحة. عودة للتدريب.', 'اشحذ عقلك واستأنف.']
    },
    'gojo': {
      en: ['Break complete! Ready to be the strongest?', 'Back to limitless focus!'],
      ar: ['اكتملت الاستراحة! جاهز لنكون الأقوى؟', 'عد للتركيز اللامحدود!']
    },
    'chrollo': {
      en: ['Break over. Resume.', 'Back to operation.', 'Focus session active.'],
      ar: ['انتهت الاستراحة. استأنف.', 'عد للعملية.', 'جلسة التركيز نشطة.']
    },
    'law': {
      en: ['ROOM! Back to work!', 'Strategic focus!', 'Maximum efficiency!'],
      ar: ['غرفة! عد للعمل!', 'تركيز استراتيجي!', 'كفاءة قصوى!']
    },
    'nami': {
      en: ['Let\'s sail ahead!', 'Fresh energy!', 'Next goal awaits!'],
      ar: ['لنبحر قدماً!', 'طاقة جديدة!', 'الهدف التالي ينتظر!']
    },
    'tsunade': {
      en: ['Will of Fire!', 'Full strength!', 'Train harder!'],
      ar: ['إرادة النار!', 'قوة كاملة!', 'تدرب بقوة!']
    },
    'yoruichi': {
      en: ['Lightning mode!', 'Speed up!', 'Show technique!'],
      ar: ['وضع البرق!', 'أسرع!', 'أظهر التقنية!']
    },
    'erza': {
      en: ['Armor on!', 'Battle ready!', 'Honor awaits!'],
      ar: ['الدرع جاهز!', 'جاهز للمعركة!', 'الشرف ينتظر!']
    }
  }
};

// Get automatic personality response for an event
export function getAutoPersonalityResponse(eventType, characterId, isArabic = false) {
  const responses = AUTO_PERSONALITY_RESPONSES[eventType];
  if (!responses || !responses[characterId]) return null;
  
  const langResponses = responses[characterId][isArabic ? 'ar' : 'en'];
  if (!langResponses || langResponses.length === 0) return null;
  
  // Return random response from the personality options
  return langResponses[Math.floor(Math.random() * langResponses.length)];
}

export const EVENT_CANONICAL_LINES_AR = {
  APP_START: 'مرحباً بعودتك. العملية تستأنف — هادئة، مركزة، وحتمية.',
  SESSION_START: 'تم تحديد الهدف. تبدأ الآن 25 دقيقة من التركيز المطلق. أزل كل المشتتات.',
  TIMER_PAUSED: 'توقف النشاط. هل هذه استراحة تعافٍ استراتيجية أم تراجع في التركيز؟ أعد ضبط مسارك فوراً.',
  TASK_STALLED: 'المهمة متعثرة. تم تقدير النطاق الأولي بشكل غير دقيق. جاري تقسيمها إلى خطوات مصغرة الآن.',
  TASK_OVERDUE: 'المهمة متعثرة. تم تقدير النطاق الأولي بشكل غير دقيق. جاري تقسيمها إلى خطوات مصغرة الآن.',
  TASK_COMPLETED: 'تم تحقيق الهدف وتحديث المؤشرات. ننتقل الآن إلى الأولوية المنطقية التالية.',
  POMODORO_FINISHED: 'تم تحقيق الهدف وتحديث المؤشرات. ننتقل الآن إلى الأولوية المنطقية التالية.',
  IDLE_ALERT: 'تم رصد حالة خمول. الوقت مورد غير قابل للتجديد. استأنف عملك أو أعد جدولته.',
  FATIGUE_ALERT: 'تم الوصول إلى الحد الذهني الأقصى. ابدأ استراحة تعافٍ تكتيكية لمدة 5 دقائق.',
  DISTRACTION_LOGGED: 'تم تسجيل التشتت. جاري تعديل الخطة لحماية كفاءة الجلسة الحالية.',
  BREAK_END: 'انتهت فترة التعافي. عد إلى ميدان العمل؛ جلستك التركيزية التالية نشطة الآن.',
};

export function generateFallback(prompt, activeChar, eventType = '', forceArabic = false) {
  const isArabic = forceArabic || ARABIC_RE.test(prompt || '');
  
  // Special handling for BREAK_END: use character-specific messages
  if (eventType === 'BREAK_END') {
    const characterMessage = isArabic 
      ? CHARACTER_BREAK_END_MESSAGES_AR[activeChar]
      : CHARACTER_BREAK_END_MESSAGES[activeChar];
    if (characterMessage) return characterMessage;
  }
  
  if (eventType && EVENT_CANONICAL_LINES[eventType] && eventType !== 'USER_CHAT') {
    return isArabic
      ? (EVENT_CANONICAL_LINES_AR[eventType] || EVENT_CANONICAL_LINES[eventType])
      : EVENT_CANONICAL_LINES[eventType];
  }

  const charData = CHARACTERS[activeChar] || CHARACTERS.chrollo;
  const list = charData.offlineWisdom || [];
  if (!list.length) return isArabic ? 'بدأت العملية. حافظ على تركيزك المطلق.' : 'Protocol engaged. Maintain absolute focus on the active objective.';
  const searchStr = `${eventType || ''} ${prompt || ''}`.toLowerCase().trim();
  const matched = list.filter((item) =>
    item.triggers?.some((t) => searchStr.includes(t.toLowerCase()))
  );
  // Pick a random matching wisdom entry or random list entry to avoid repetition
  const pool = matched.length > 0 ? matched : list;
  const entry = pool[Math.floor(Math.random() * pool.length)] || list[0];
  return isArabic ? (entry.ar || entry.en) : (entry.en || entry.ar);
}

export const SELF_MOTIVATION_MESSAGES = {
  'robin': {
    en: [
      'Uncovering knowledge takes patience.',
      'Every minute studied is wisdom earned.',
      'Stay curious. The answer is close.',
      'Calm minds discover the deepest secrets.',
    ],
    ar: [
      'كشف الحقيقة يتطلب صبراً.',
      'كل دقيقة دراسة هي حكمة مكتسبة.',
      'ابق فضولياً، فالإجابة قريبة.',
      'العقول الهادئة تكتشف أعمق الأسرار.',
    ],
  },
  'chrollo': {
    en: [
      'Plan proceeding.',
      'Focus yields results.',
      'Stay systematic.',
      'Progress confirmed.',
    ],
    ar: [
      'الخطة تسير.',
      'التركيز يحقق نتائج.',
      'ابق منهجياً.',
      'التقدم مؤكد.',
    ],
  },
  'law': {
    en: [
      'ROOM! Keep operating.',
      'Strategy working.',
      'Maintain precision.',
      'Victory approaching.',
    ],
    ar: [
      'غرفة! واصل العملية.',
      'الاستراتيجية تعمل.',
      'حافظ على الدقة.',
      'النصر يقترب.',
    ],
  },
  'nami': {
    en: [
      'Treasure building!',
      'Perfect course!',
      'Keep sailing!',
      'Gold accumulating!',
    ],
    ar: [
      'الكنز يتراكم!',
      'مسار مثالي!',
      'واصل الإبحار!',
      'الذهب يتجمع!',
    ],
  },
  'tsunade': {
    en: [
      'Ninja dedication!',
      'Will of Fire!',
      'Growing stronger!',
      'True warrior!',
    ],
    ar: [
      'تفان النينجا!',
      'إرادة النار!',
      'تقوى أكثر!',
      'محارب حقيقي!',
    ],
  },
};
