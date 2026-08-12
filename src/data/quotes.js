// Quote of the day — 21 quotes grouped in 3 per weekday.
// Each day picks a different quote based on the week number,
// so the quote rotates every week on the same day.
export const quotesByDay = {
  // Monday
  1: [
    { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  ],
  // Tuesday
  2: [
    { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "Motivation gets you going. Discipline keeps you growing.", author: "John C. Maxwell" },
  ],
  // Wednesday
  3: [
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Every master was once a disaster.", author: "T. Harv Eker" },
    { text: "Learning is not attained by chance; it must be sought for with ardor.", author: "Abigail Adams" },
  ],
  // Thursday
  4: [
    { text: "Small steps in the right direction can turn out to be the biggest step of your life.", author: "Unknown" },
    { text: "Progress is progress, no matter how small.", author: "Unknown" },
    { text: "Inch by inch, life's a cinch. Yard by yard, life is hard.", author: "John Bytheway" },
  ],
  // Friday
  5: [
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  ],
  // Saturday
  6: [
    { text: "Rest and self-care are so important. When you take time to replenish your spirit, it allows you to serve others from the overflow.", author: "Eleanor Brownn" },
    { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
    { text: "Take rest; a field that has rested gives a bountiful crop.", author: "Ovid" },
  ],
  // Sunday
  0: [
    { text: "Rest when you're weary. Refresh and renew yourself, then get back to work.", author: "Ralph Marston" },
    { text: "Sunday clears away the rust of the whole week.", author: "Joseph Addison" },
    { text: "Recharge your batteries so you can be at your best tomorrow.", author: "Unknown" },
  ],
};

/**
 * Returns today's quote, rotating weekly so the same day of the week
 * gets a different quote each week (cycles every 3 weeks).
 */
export function getQuoteOfTheDay() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const quotes = quotesByDay[dayOfWeek] || quotesByDay[1];

  // Get ISO week number for weekly rotation
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
  const idx = weekNumber % quotes.length;

  return quotes[idx];
}
