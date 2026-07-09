export const scheduleRoutine = [
  { id: "t0", start: "04:39", end: "05:30", task: "Morning Spirituals (Fajr, Quran)" },
  { id: "t1", start: "05:30", end: "06:00", task: "Mind Preparation (Coffee, No Phone)" },
  { id: "t2", start: "06:00", end: "10:00", task: "Morning Mathematics & Statistics (4h)" },
  { id: "t3", start: "10:00", end: "11:30", task: "Energy Recharge (Nap & Breakfast)" },
  { id: "t4", start: "11:30", end: "13:30", task: "Programming & Data Science (Python - 2h)" },
  { id: "t5", start: "13:30", end: "14:00", task: "Dhuhr Prayer Break" },
  { id: "t6", start: "14:00", end: "16:00", task: "PySpark & Big Data Learning (2h)" },
  { id: "t7", start: "16:00", end: "17:00", task: "Project Building" },
  { id: "t8", start: "17:00", end: "17:30", task: "Asr Prayer Break" },
  { id: "t9", start: "17:30", end: "19:30", task: "Evening Block: Languages (English - 2h)" },
  { id: "t10", start: "19:30", end: "20:45", task: "Escape & Reward (Hobbies, Sports)" },
  { id: "t11", start: "20:45", end: "21:15", task: "Maghrib Prayer & Evening Athkar" },
  { id: "t12", start: "21:15", end: "22:15", task: "Spiritual Serenity & Planning" },
  { id: "t13", start: "22:15", end: "23:59", task: "Ishaa Prayer & Sleep" }
];

export const roadmapsData = {
  math: {
    title: "Mathematics & Statistics", theme: "math",
    Monday: { cat: "Linear Algebra", tasks: ["Vector Spaces & Subspaces", "Matrix Multiplication & Inverses"] },
    Tuesday: { cat: "Calculus", tasks: ["Limits & Continuity", "Derivatives & Chain Rule"] },
    Wednesday: { cat: "Mathematical Analysis", tasks: ["Sequences & Series", "Convergence Tests"] },
    Thursday: { cat: "Differential Calculus", tasks: ["Gradient, Divergence & Curl", "Line & Surface Integrals"] },
    Friday: { cat: "Statistics Basics", tasks: ["Descriptive Statistics", "Central Limit Theorem"] },
    Saturday: { cat: "Hypothesis Testing", tasks: ["T-Tests & ANOVA", "P-Values"] },
    Sunday: { cat: "Econometrics", tasks: ["AB Testing Basics", "Linear Regression"] }
  },
  ds: {
    title: "Data Science & Engineering", theme: "ds",
    Monday: { cat: "Coding Fundamentals", tasks: ["Learn Python Basics", "Lists, Dicts, Tuples"] },
    Tuesday: { cat: "Data Structures", tasks: ["Time Complexity (Big O)", "Arrays & Linked Lists"] },
    Wednesday: { cat: "SQL & Databases", tasks: ["Relational Database Fundamentals", "SQL Joins & Subqueries"] },
    Thursday: { cat: "Exploratory Data Analysis", tasks: ["Data Understanding", "Handling Missing Values"] },
    Friday: { cat: "Data Analysis Tools", tasks: ["Pandas Operations", "NumPy Arrays"] },
    Saturday: { cat: "Machine Learning", tasks: ["Supervised Learning", "Linear Regression"] },
    Sunday: { cat: "Deep Learning", tasks: ["Neural Networks Intro", "Deployment Basics"] }
  },
  english: {
    title: "English Fluency ", theme: "english",
    Monday: { cat: "Reading", tasks: ["Tech documentation reading", "Practice skimming tech blogs", "Vocabulary from context"] },
    Tuesday: { cat: "Writing", tasks: ["Formal email drafting", "Structured essay writing", "Code documentation practice"] },
    Wednesday: { cat: "Listening", tasks: ["Technical podcasts", "Native speaker lectures", "Note-taking practice"] },
    Thursday: { cat: "Speaking", tasks: ["Shadowing native speakers", "Project pitch recording", "Verbal code explanations"] },
    Friday: { cat: "Grammar", tasks: ["Tense consistency", "Complex sentence structures", "Active/Passive voice usage"] },
    Saturday: { cat: "Vocabulary / Idioms", tasks: ["Technical collocations", "Idiomatic expressions", "Professional phrasal verbs"] },
    Sunday: { cat: "Weekly Review / Debugging", tasks: ["Error analysis & correction", "Performance reflection", "Goal setting for next week"] }
  }
};

export const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];