export const scheduleRoutine = [
  { id: "t0", start: "05:00", end: "05:30", task: "Morning Spirituals (Fajr, Quran)" },
  { id: "t1", start: "05:30", end: "06:00", task: "Mind Preparation (Coffee, No Phone)" },
  { id: "t2", start: "06:00", end: "11:00", task: "Morning Core Focus: Mathematics / Python (5h)" },
  { id: "t3", start: "11:00", end: "14:00", task: "Energy Recharge, Lunch & Dhuhr Break (3h)" },
  { id: "t4", start: "14:00", end: "17:00", task: "Afternoon  Mathematics / Python (3h)" },
  { id: "t5", start: "17:00", end: "18:00", task: " Asr Break (1h)" },
  { id: "t6", start: "18:00", end: "20:00", task: "Evening Block: Languages (English - 2h)" },
  { id: "t7", start: "20:00", end: "21:15", task: "Escape & Reward (Hobbies, Sports) + Maghrib" },
  { id: "t8", start: "21:15", end: "22:15", task: "Spiritual Serenity & Daily Review" },
  { id: "t9", start: "22:15", end: "23:59", task: "Ishaa Prayer & Sleep" }
];

export const roadmapsData = {
  math: {
    title: "Mathematics", theme: "math",
    Monday: { cat:" Mathematics", tasks: [" you know what you should do respect to you "] },
    Tuesday: { cat:" Mathematics", tasks: [" you know what you should do respect to you "] },
    Wednesday: { cat:" Mathematics ", tasks: [" you know what you should do respect to you "] },
    Thursday: { cat:" Mathematics ", tasks: [" you know what you should do respect to you "] },
    Friday: { cat:" Mathematics ", tasks: [" you know what you should do respect to you "] },
    Saturday: { cat:" Mathematics", tasks: [" you know what you should do respect to you "] },
    Sunday: { cat:" Mathematics", tasks: [" you know what you should do respect to you "] }
  },
  ds: {
    title: "Data Science & Engineering", theme: "ds",
    Monday: { cat: "Python", tasks: ["you know what you should do respect to you"] },
    Tuesday: { cat: "Python ", tasks: ["you know what you should do respect to you"] },
    Wednesday: { cat: "Python", tasks: ["you know what you should do respect to you"] },
    Thursday: { cat: "Python  ", tasks: ["you know what you should do respect to you"] },
    Friday: { cat: "Python  ", tasks: ["you know what you should do respect to you"] },
    Saturday: { cat: "Python ", tasks: ["you know what you should do respect to you"] },
    Sunday: { cat: "Python ", tasks: ["you know what you should do respect to you"] }
  },
  english: {
    title: "English Fluency", theme: "english",
    Monday: {
      cat: "Reading (القراءة)",
      tasks: [
        "Read an easy story or an article about your hobbies (50 mins)",
        "Skim the text to understand the main story (40 mins)",
        "Save 5 interesting new words you like (30 mins)"
      ]
    },
    Tuesday: {
      cat: "Writing (الكتابة)",
      tasks: [
        "Write a short journal entry about your day (40 mins)",
        "Write a friendly message to introduce yourself (50 mins)",
        "Check your spelling and simple grammar (30 mins)"
      ]
    },
    Wednesday: {
      cat: "Listening (الاستماع)",
      tasks: [
        "Listen to a fun English podcast or song (40 mins)",
        "Watch a short YouTube video with subtitles (50 mins)",
        "Write down 3 phrases you heard and liked (30 mins)"
      ]
    },
    Thursday: {
      cat: "Speaking (التحدث)",
      tasks: [
        "Practice speaking aloud in front of a mirror (40 mins)",
        "Repeat cool sentences from your favorite show (50 mins)",
        "Record yourself talking about your favorite movie (30 mins)"
      ]
    },
    Friday: {
      cat: "Grammar (القواعد)",
      tasks: [
        "Review simple tenses with easy examples (40 mins)",
        "Practice making simple daily questions (40 mins)",
        "Do a fun online quiz to check your progress (40 mins)"
      ]
    },
    Saturday: {
      cat: "Vocabulary (المفردات)",
      tasks: [
        "Learn 10 useful words for daily conversations (40 mins)",
        "Practice using new words in simple sentences (50 mins)",
        "Review the favorite words you saved this week (30 mins)"
      ]
    },
    Sunday: {
      cat: "Weekly Review (المراجعة الأسبوعية)",
      tasks: [
        "Look back at your notes and see your progress (50 mins)",
        "Test your memory with a quick word game (40 mins)",
        "Plan a relaxing study goal for next week (30 mins)"
      ]
    }
  }
};

export const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];