export const scheduleRoutine = [
  { id: "t0", start: "05:00", end: "05:30", task: "Morning Spirituals (Fajr, Quran)" },
  { id: "t1", start: "05:30", end: "06:00", task: "Mind Preparation (Coffee, No Phone)" },
  { id: "t2", start: "06:00", end: "11:00", task: "Morning Core Focus: Mathematics / Python (5h)", isStudy: true },
  { id: "t3", start: "11:00", end: "14:00", task: "Energy Recharge, Lunch & Dhuhr Break (3h)" },
  { id: "t4", start: "14:00", end: "17:00", task: "Afternoon Mathematics / Python (3h)", isStudy: true },
  { id: "t5", start: "17:00", end: "18:00", task: " Asr Break (1h)" },
  { id: "t6", start: "18:00", end: "20:00", task: "Evening Block: Languages (English - 2h)", isStudy: true },
  { id: "t7", start: "20:00", end: "21:15", task: "Escape & Reward (Hobbies, Sports) + Maghrib" },
  { id: "t8", start: "21:15", end: "22:15", task: "Spiritual Serenity & Daily Review" },
  { id: "t9", start: "22:15", end: "05:00", task: "Sleep" }
];

const genDays = (cat, tasks) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const obj = {};
  days.forEach(d => { obj[d] = { cat, tasks: [...tasks] }; });
  return obj;
};

export const roadmapsData = {
  math: {
    title: "Mathematics",
    theme: "math",
    ...genDays("Go", [
      "2 hour",
      "2 hour",
      "2 hour",
      "2 hour",
    ]),
  },

  ds: {
    title: "Data Science & Engineering",
    theme: "ds",
    ...genDays("Go", [
      "2 hour",
      "2 hour",
      "2 hour",
      "2 hour",
    ]),
  },

  english: {
  title: "English Fluency",
  theme: "english",
  Monday: {
    cat: "Reading",
    tasks: [
      "Read an easy story or article about your hobbies (1 hour)",
      "Skim the text to understand the main story (1 hour)"
    ]
  },
  Tuesday: {
    cat: "Writing",
    tasks: [
      "Write a short journal entry about your day (1 hour)",
      "Write a friendly message to introduce yourself or practice grammar (1 hour)"
    ]
  },
  Wednesday: {
    cat: "Listening",
    tasks: [
      "Listen to an English podcast or watch a YouTube video with subtitles (1 hour)",
      "Write down and practice key phrases you heard and liked (1 hour)"
    ]
  },
  Thursday: {
    cat: "Speaking",
    tasks: [
      "Practice speaking aloud and repeating sentences from your favorite show (1 hour)",
      "Record yourself talking about your favorite movie or topic (1 hour)"
    ]
  },
  Friday: {
    cat: "Grammar",
    tasks: [
      "Review simple tenses and practice making daily questions (1 hour)",
      "Do a fun online grammar quiz to test your progress (1 hour)"
    ]
  },
  Saturday: {
    cat: "Vocabulary",
    tasks: [
      "Learn 10 useful daily words and practice using them in sentences (1 hour)",
      "Review and test yourself on all the new vocabulary saved this week (1 hour)"
    ]
  },
  Sunday: {
    cat: "Weekly Review",
    tasks: [
      "Look back at your notes and test your memory with a word game (1 hour)",
      "Reflect on your progress and plan study goals for next week (1 hour)"
    ]
  }
}
};

export const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
