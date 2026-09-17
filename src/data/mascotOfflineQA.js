/**
 * mascotOfflineQA.js
 *
 * Predefined Q&A database and event responses when LLM APIs are offline or unreachable.
 */

import { CHARACTER_BREAK_END_MESSAGES, CHARACTER_BREAK_END_MESSAGES_AR } from './mascotConfig';

export const OFFLINE_QA_DATABASE = {
  // Study & Productivity (English)
  'how to study': 'Focus on active recall and spaced repetition. Break study sessions into 25-50 minute blocks with short breaks. Test yourself frequently instead of just re-reading.',
  'study tips': 'Use the Feynman Technique: explain concepts in simple terms. Practice retrieval instead of recognition. Study in different locations to strengthen memory.',
  'motivation': 'Remember why you started. Break big goals into small wins. Celebrate progress, not perfection. You\'re building your future one study session at a time.',
  'focus': 'Eliminate distractions. Put phone away. Use website blockers. Start with 5 minutes of deep focus, then gradually increase. Your brain is a muscle - train it.',
  'procrastination': 'Start with just 2 minutes. The hardest part is beginning. Use the 5-second rule: count 5-4-3-2-1 and GO. Action creates motivation, not the other way around.',
  
  // Time Management
  'pomodoro': 'Pomodoro: 25 min focus + 5 min break. After 4 rounds, take 15-30 min break. Adjust timing to your rhythm. The key is consistent, focused work.',
  'time management': 'Plan tomorrow tonight. Use time-blocking. Prioritize 3 most important tasks. Say no to distractions. Track where time actually goes.',
  'break time': 'Stand up. Stretch. Walk around. Look away from screen. Hydrate. Do jumping jacks. Step outside. Let your brain rest - it needs it.',
  
  // Learning Techniques
  'active recall': 'Close your notes. Write everything you remember. Check what you missed. Repeat. This struggle is learning. Your brain grows when you retrieve.',
  'spaced repetition': 'Review after 1 day, 3 days, 7 days, 14 days, 30 days. Your brain needs time to consolidate. Spacing beats cramming every time.',
  'memory': 'Use mnemonics. Create stories. Link to what you know. Teach others. Draw diagrams. Sleep well - memories consolidate during sleep.',
  
  // Character-based responses
  'law': 'ROOM! Strategic planning beats raw effort. Study like you\'re preparing for battle - analyze your weaknesses and eliminate them one by one.',
  'kaido': 'Worororo! Only the strong survive! Push through the pain. Your limits are illusions. Break them!',
  'luffy': 'I\'m gonna be the King of Students! Never give up! Even if it\'s hard, keep going! Your dreams are worth it!',
  
  // General
  'hello': 'Hey there! I\'m here to support your study journey. What do you need help with?',
  'help': 'I can help with: study tips, focus techniques, motivation, time management, learning strategies. What\'s on your mind?',
  'thank you': 'You\'re welcome! Keep up the great work. I believe in you!',
  'thanks': 'Anytime! You\'ve got this. Stay focused and keep pushing forward!',
};

// Arabic translations for offline mode
export const OFFLINE_QA_DATABASE_AR = {
  'كيف أدرس': 'ركز على الاستدعاء النشط والتكرار المتباعد. قسم جلسات الدراسة إلى كتل 25-50 دقيقة مع فترات راحة قصيرة. اختبر نفسك بشكل متكرر بدلاً من مجرد إعادة القراءة.',
  'نصائح دراسة': 'استخدم تقنية فاينمان: اشرح المفاهيم بمصطلحات بسيطة. مارس الاسترجاع بدلاً من التعرف. ادرس في أماكن مختلفة لتقوية الذاكرة.',
  'تحفيز': 'تذكر لماذا بدأت. قسم الأهداف الكبيرة إلى انتصارات صغيرة. احتفل بالتقدم وليس الكمال. أنت تبني مستقبلك جلسة دراسية واحدة في كل مرة.',
  'تركيز': 'تخلص من المشتتات. ضع الهاتف بعيداً. استخدم حاجبات المواقع. ابدأ بـ 5 دقائق من التركيز العميق ثم زد تدريجياً. دماغك عضلة - درّبه.',
  'مماطلة': 'ابدأ بدقيقتين فقط. الجزء الأصعب هو البداية. استخدم قاعدة الـ 5 ثوانٍ: عد 5-4-3-2-1 وانطلق! الفعل يخلق التحفيز وليس العكس.',
  'بومودورو': 'بومودورو: 25 دقيقة تركيز + 5 دقائق راحة. بعد 4 جولات خذ راحة 15-30 دقيقة. اضبط التوقيت حسب إيقاعك. المفتاح هو العمل المركز والمستمر.',
  'إدارة وقت': 'خطط للغد الليلة. استخدم تقسيم الوقت. حدد أولويات 3 مهام أهم. قل لا للمشتتات. تتبع أين يذهب الوقت فعلياً.',
  'استراحة': 'قف. تمدد. تجول. ابعد نظرك عن الشاشة. اشرب الماء. قم ببعض القفزات. اخرج للخارج. دع دماغك يرتاح - يحتاجه.',
  'استدعاء نشط': 'أغلق ملاحظاتك. اكتب كل ما تتذكره. تحقق مما فاتك. كرر. هذا الكفاح هو التعلم. دماغك ينمو عندما تسترجع.',
  'تكرار متباعد': 'راجع بعد يوم واحد و3 أيام و7 أيام و14 يوماً و30 يوماً. دماغك يحتاج وقتاً لترسيخ المعلومات. التباعد يتفوق على الحشو دائماً.',
  'ذاكرة': 'استخدم التذكيرات. أنشئ قصصاً. اربط بما تعرفه. علّم الآخرين. ارسم مخططات. نم جيداً - الذكريات تترسخ أثناء النوم.',
  'مرحبا': 'مرحباً! أنا هنا لدعم رحلتك الدراسية. بماذا يمكنني مساعدتك؟',
  'مساعدة': 'يمكنني المساعدة في: نصائح الدراسة، تقنيات التركيز، التحفيز، إدارة الوقت، استراتيجيات التعلم. ما الذي يشغل بالك؟',
  'شكرا': 'على الرحب والسعة! واصل العمل الرائع. أنا أؤمن بك!',
};

// Find best match for offline Q&A
export function findOfflineResponse(userMessage, characterName = 'Law', isArabic = false) {
  const msg = (userMessage || '').toLowerCase().trim();
  const database = isArabic ? OFFLINE_QA_DATABASE_AR : OFFLINE_QA_DATABASE;
  
  // Direct matches
  for (const [key, answer] of Object.entries(database)) {
    if (msg.includes(key)) {
      return answer;
    }
  }
  
  // Character-specific fallback
  if (isArabic) {
    const characterResponsesAR = {
      'Law': 'ROOM! أنا غير متصل حالياً، لكنني ما زلت أتتبع تقدمك. استمر في الدراسة - الجهد الاستراتيجي يتراكم مع الوقت.',
      'Kaido': 'وورورورو! حتى بدون اتصال، أرى قوتك تنمو. استمر في التقدم للأمام!',
      'Luffy': 'قد أكون غير متصل، لكنني أؤمن بك! استمر نحو أحلامك!',
      'Gojo': 'حتى بدون اتصالي، إمكاناتك لا حدود لها. استمر في التدريب.',
      'Eren': 'تاتاكاي! قاتل! حتى بدون اتصال، المهمة مستمرة. استمر في التقدم.',
    };
    return characterResponsesAR[characterName] || 'أنا غير متصل حالياً، لكنني ما زلت هنا لدعمك. استمر في العمل الرائع!';
  } else {
    const characterResponses = {
      'Law': 'ROOM! I\'m currently offline, but I\'m still tracking your progress. Keep studying - strategic effort compounds over time.',
      'Kaido': 'Worororo! Even offline, I see your strength growing. Keep pushing forward!',
      'Luffy': 'I might be offline, but I believe in you! Keep going towards your dreams!',
      'Gojo': 'Even without my connection, your potential is limitless. Keep training.',
      'Eren': 'Tatakae! Fight! Even offline, the mission continues. Keep moving forward.',
    };
    return characterResponses[characterName] || 'I\'m currently offline, but I\'m still here supporting you. Keep up the great work!';
  }
}

// Offline event responses (timer, pomodoro, etc.)
export function generateOfflineEventResponse(eventType, characterName, appState, isArabic = false) {
  if (isArabic) {
    const responsesAR = {
      TIMER_START: [
        'بدأ المؤقت. لنجعل هذه الجلسة مهمة!',
        'تم تفعيل وضع التركيز. أنت قادر على هذا!',
        'الوقت يمر. حان الوقت للسيطرة على جلسة الدراسة هذه!',
      ],
      POMODORO_FINISHED: [
        'بومودورو مكتمل! أحسنت. خذ استراحتك - لقد كسبتها.',
        'انتهت الجلسة! تركيز رائع. استرح للجولة القادمة.',
        'انتصار آخر! ثباتك يبني شيئاً عظيماً.',
      ],
      BREAK_END: (CHARACTER_BREAK_END_MESSAGES_AR && CHARACTER_BREAK_END_MESSAGES_AR[characterName])
        ? [CHARACTER_BREAK_END_MESSAGES_AR[characterName]]
        : [
            'انتهت الاستراحة! عد إلى الدراسة. أنت قوي!',
            'وقت الراحة انتهى. حان وقت التركيز من جديد!',
            'انتهت فترة التعافي. عد إلى المعركة!',
          ],
      STUDY_MILESTONE: [
        `${appState?.studyHours || 0} ساعة مسجلة اليوم. تفانيك يظهر!`,
        'ساعة أخرى مسجلة. أنت تبني زخماً لا يوقف.',
        'تم تسجيل التقدم. كل ساعة استثمار في مستقبلك.',
      ],
    };
    const options = responsesAR[eventType] || ['استمر! جهدك مهم.'];
    return options[Math.floor(Math.random() * options.length)];
  } else {
    const responses = {
      TIMER_START: [
        'Timer started. Let\'s make this session count!',
        'Focus mode activated. You\'ve got this!',
        'The clock is ticking. Time to dominate this study session!',
      ],
      POMODORO_FINISHED: [
        'Pomodoro complete! Well done. Take your break - you earned it.',
        'Session finished! Great focus. Rest up for the next round.',
        'Another victory! Your consistency is building something great.',
      ],
      BREAK_END: (CHARACTER_BREAK_END_MESSAGES && CHARACTER_BREAK_END_MESSAGES[characterName])
        ? [CHARACTER_BREAK_END_MESSAGES[characterName]]
        : [
            'Break over! Time to get back to work. Let\'s do this!',
            'Rest complete. Back to crushing your goals!',
            'Break finished. Return to focus mode. You\'ve got this!',
          ],
      STUDY_MILESTONE: [
        `${appState?.studyHours || 0}h tracked today. Your dedication is showing!`,
        'Another hour logged. You\'re building unstoppable momentum.',
        'Progress recorded. Every hour is an investment in your future.',
      ],
    };
    const options = responses[eventType] || ['Keep going! Your effort matters.'];
    return options[Math.floor(Math.random() * options.length)];
  }
}
