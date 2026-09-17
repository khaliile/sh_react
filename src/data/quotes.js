// Quote of the day — 21 quotes grouped in 3 per weekday.
// Each day picks a different quote based on the week number,
// so the quote rotates every week on the same day.
export const quotesByDay = {
  // Monday
  1: [
    { 
      text: "Discipline is the bridge between goals and accomplishment.", 
      author: "Jim Rohn",
      textAr: "الانضباط هو الجسر بين الأهداف والإنجاز.",
      authorAr: "جيم رون"
    },
    { 
      text: "The secret of getting ahead is getting started.", 
      author: "Mark Twain",
      textAr: "سر التقدم هو البدء.",
      authorAr: "مارك توين"
    },
    { 
      text: "You don't have to be great to start, but you have to start to be great.", 
      author: "Zig Ziglar",
      textAr: "لا يجب أن تكون عظيماً لتبدأ، لكن عليك أن تبدأ لتصبح عظيماً.",
      authorAr: "زيغ زيغلار"
    },
  ],
  // Tuesday
  2: [
    { 
      text: "We are what we repeatedly do. Excellence is not an act, but a habit.", 
      author: "Aristotle",
      textAr: "نحن ما نفعله بشكل متكرر. التميز ليس فعلاً، بل عادة.",
      authorAr: "أرسطو"
    },
    { 
      text: "Success is the sum of small efforts repeated day in and day out.", 
      author: "Robert Collier",
      textAr: "النجاح هو مجموع الجهود الصغيرة المتكررة يوماً بعد يوم.",
      authorAr: "روبرت كوليير"
    },
    { 
      text: "Motivation gets you going. Discipline keeps you growing.", 
      author: "John C. Maxwell",
      textAr: "الحافز يجعلك تبدأ. الانضباط يجعلك تنمو.",
      authorAr: "جون سي ماكسويل"
    },
  ],
  // Wednesday
  3: [
    { 
      text: "The expert in anything was once a beginner.", 
      author: "Helen Hayes",
      textAr: "كل خبير في أي مجال كان في يوم ما مبتدئاً.",
      authorAr: "هيلين هايز"
    },
    { 
      text: "Every master was once a disaster.", 
      author: "T. Harv Eker",
      textAr: "كل خبير كان في يوم من الأيام كارثة.",
      authorAr: "تي هارف إيكر"
    },
    { 
      text: "Learning is not attained by chance; it must be sought for with ardor.", 
      author: "Abigail Adams",
      textAr: "التعلم لا يُكتسب بالصدفة؛ يجب السعي إليه بشغف.",
      authorAr: "أبيجيل آدامز"
    },
  ],
  // Thursday
  4: [
    { 
      text: "Small steps in the right direction can turn out to be the biggest step of your life.", 
      author: "Unknown",
      textAr: "الخطوات الصغيرة في الاتجاه الصحيح قد تصبح أكبر خطوة في حياتك.",
      authorAr: "غير معروف"
    },
    { 
      text: "Progress is progress, no matter how small.", 
      author: "Unknown",
      textAr: "التقدم هو تقدم، مهما كان صغيراً.",
      authorAr: "غير معروف"
    },
    { 
      text: "Inch by inch, life's a cinch. Yard by yard, life is hard.", 
      author: "John Bytheway",
      textAr: "شبراً شبراً، الحياة سهلة. ذراعاً ذراعاً، الحياة صعبة.",
      authorAr: "جون بايثوي"
    },
  ],
  // Friday
  5: [
    { 
      text: "Don't watch the clock; do what it does. Keep going.", 
      author: "Sam Levenson",
      textAr: "لا تراقب الساعة؛ افعل ما تفعله. استمر.",
      authorAr: "سام ليفينسون"
    },
    { 
      text: "The only way to do great work is to love what you do.", 
      author: "Steve Jobs",
      textAr: "الطريقة الوحيدة للقيام بعمل عظيم هي أن تحب ما تفعله.",
      authorAr: "ستيف جوبز"
    },
    { 
      text: "Push yourself, because no one else is going to do it for you.", 
      author: "Unknown",
      textAr: "ادفع نفسك، لأن لا أحد سيفعل ذلك من أجلك.",
      authorAr: "غير معروف"
    },
  ],
  // Saturday
  6: [
    { 
      text: "Rest and self-care are so important. When you take time to replenish your spirit, it allows you to serve others from the overflow.", 
      author: "Eleanor Brownn",
      textAr: "الراحة والعناية بالنفس مهمان جداً. عندما تأخذ وقتاً لتجديد روحك، فإن ذلك يتيح لك خدمة الآخرين من الفيض.",
      authorAr: "إليانور براون"
    },
    { 
      text: "Almost everything will work again if you unplug it for a few minutes, including you.", 
      author: "Anne Lamott",
      textAr: "كل شيء تقريباً سيعمل مرة أخرى إذا فصلته لبضع دقائق، بما في ذلك أنت.",
      authorAr: "آن لاموت"
    },
    { 
      text: "Take rest; a field that has rested gives a bountiful crop.", 
      author: "Ovid",
      textAr: "خذ قسطاً من الراحة؛ الحقل الذي استراح يعطي محصولاً وفيراً.",
      authorAr: "أوفيد"
    },
  ],
  // Sunday
  0: [
    { 
      text: "Rest when you're weary. Refresh and renew yourself, then get back to work.", 
      author: "Ralph Marston",
      textAr: "استرح عندما تكون متعباً. جدد وانعش نفسك، ثم عد إلى العمل.",
      authorAr: "رالف مارستون"
    },
    { 
      text: "Sunday clears away the rust of the whole week.", 
      author: "Joseph Addison",
      textAr: "الأحد يزيل صدأ الأسبوع بأكمله.",
      authorAr: "جوزيف أديسون"
    },
    { 
      text: "Recharge your batteries so you can be at your best tomorrow.", 
      author: "Unknown",
      textAr: "أعد شحن بطارياتك حتى تكون في أفضل حالاتك غداً.",
      authorAr: "غير معروف"
    },
  ],
};

/**
 * Returns today's quote, rotating weekly so the same day of the week
 * gets a different quote each week (cycles every 3 weeks).
 */
export function getQuoteOfTheDay(lang = 'en') {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const quotes = quotesByDay[dayOfWeek] || quotesByDay[1];

  // Get ISO week number for weekly rotation
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
  const idx = weekNumber % quotes.length;

  const quote = quotes[idx];
  
  // Return Arabic version if language is Arabic
  if (lang === 'ar') {
    return {
      text: quote.textAr || quote.text,
      author: quote.authorAr || quote.author
    };
  }
  
  return {
    text: quote.text,
    author: quote.author
  };
}
