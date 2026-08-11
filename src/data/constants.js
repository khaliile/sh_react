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
    ...genDays("Linear Algebra", [
      "Watch 3Blue1Brown: Vectors (10 min)",
      "Watch 3Blue1Brown: Linear combinations (10 min)",
      "Practice: solve 3 exercises from MIT 18.06 Lec 1 (60 min)",
      "Review notes + summarize key idea in your words (20 min)"
    ]),
  },

  ds: {
    title: "Data Science & Engineering",
    theme: "ds",
    Monday: {
      cat: "Python Basics",
      tasks: [
        "CS50P Lecture 1 + short exercises (90 min)",
        "Automate the Boring Stuff: Ch 1 (60 min)",
        "Solve 5 easy problems on Exercism.io (60 min)",
        "Review + take notes on key syntax (30 min)"
      ]
    },
    Tuesday: {
      cat: "Python Practice",
      tasks: [
        "CS50P Lecture 2 + exercises (90 min)",
        "Build: small script (calculator / to-do) (90 min)",
        "Read Automate Ch 2: flow control (60 min)",
        "Review code with Gemini (tutor mode) (20 min)"
      ]
    },
    Wednesday: {
      cat: "Pandas + NumPy",
      tasks: [
        "Kaggle Pandas Micro-Course: Lessons 1-3 (90 min)",
        "Practice on tips.csv dataset (60 min)",
        "Read Wes McKinney Ch 5: Getting Started (60 min)",
        "Write 5 pandas operations from memory (30 min)"
      ]
    },
    Thursday: {
      cat: "Data Visualization",
      tasks: [
        "Kaggle Data Visualization Course (90 min)",
        "Build 3 charts on a real dataset (90 min)",
        "Read matplotlib docs: pyplot tutorial (60 min)",
        "Save best chart as portfolio piece (20 min)"
      ]
    },
    Friday: {
      cat: "SQL Fundamentals",
      tasks: [
        "SQLBolt: Lessons 1-6 (60 min)",
        "Mode Analytics Tutorial: Lesson 1 (60 min)",
        "Practice: 10 SQL queries on sample DB (60 min)",
        "Rest + read SQL for Data Analysis intro (30 min)"
      ]
    },
    Saturday: {
      cat: "Statistics",
      tasks: [
        "StatQuest: Statistics Fundamentals playlist Lec 1-3 (60 min)",
        "Watch: Khan Academy - Descriptive Statistics (60 min)",
        "Practice: mean/median/stddev by hand (60 min)",
        "Summarize 3 key concepts in your notes (30 min)"
      ]
    },
    Sunday: {
      cat: "Weekly Review",
      tasks: [
        "Review all week's notes (60 min)",
        "Identify 3 weak areas + plan fixes (30 min)",
        "Push all code to GitHub (30 min)",
        "Plan next week's focus (40 min)",
        "Celebrate what you completed (20 min)"
      ]
    }
  },

  english: {
    title: "English Fluency",
    theme: "english",
    Monday: {
      cat: "Reading",
      tasks: [
        "Read an easy story or article about your hobbies (50 min)",
        "Skim the text to understand the main story (40 min)",
        "Save 5 interesting new words you like (30 min)"
      ]
    },
    Tuesday: {
      cat: "Writing",
      tasks: [
        "Write a short journal entry about your day (40 min)",
        "Write a friendly message to introduce yourself (50 min)",
        "Check your spelling and simple grammar (30 min)"
      ]
    },
    Wednesday: {
      cat: "Listening",
      tasks: [
        "Listen to a fun English podcast or song (40 min)",
        "Watch a short YouTube video with subtitles (50 min)",
        "Write down 3 phrases you heard and liked (30 min)"
      ]
    },
    Thursday: {
      cat: "Speaking",
      tasks: [
        "Practice speaking aloud in front of a mirror (40 min)",
        "Repeat cool sentences from your favorite show (50 min)",
        "Record yourself talking about your favorite movie (30 min)"
      ]
    },
    Friday: {
      cat: "Grammar",
      tasks: [
        "Review simple tenses with easy examples (40 min)",
        "Practice making simple daily questions (40 min)",
        "Do a fun online quiz to check your progress (40 min)"
      ]
    },
    Saturday: {
      cat: "Vocabulary",
      tasks: [
        "Learn 10 useful words for daily conversations (40 min)",
        "Practice using new words in simple sentences (50 min)",
        "Review the favorite words you saved this week (30 min)"
      ]
    },
    Sunday: {
      cat: "Weekly Review",
      tasks: [
        "Look back at your notes and see your progress (50 min)",
        "Test your memory with a quick word game (40 min)",
        "Plan a relaxing study goal for next week (30 min)"
      ]
    }
  }
};

export const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
