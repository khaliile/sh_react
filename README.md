# ⚔️ Study Hub — RPG Dashboard

> A gamified, RPG-powered personal productivity and study management application. Bridges rigorous daily time-blocking (curriculum roadmaps, schedule routines, deep work timers) with addictive RPG game loops (XP, leveling, coins, daily boss battles, virtual pet familiars, quests, flashcards, item shop, and custom themes).

---

## 🌟 Key Highlights

- 🐉 **Focus Familiar (Virtual Pet)**: Slumbering egg that evolves across 4 stages as you log study hours, granting passive buffs.
- ⚔️ **Daily Boss Battle**: Fight the *Procrastination Demon* (1,000 HP) by finishing tasks and study blocks.
- 📜 **Weekly Quest Board & Milestones**: Earn coins and XP by completing focus goals, streaks, and flashcard reviews.
- 🃏 **Flashcard Spaced Repetition Arena**: Master Data Science, Mathematics, and English concepts with interactive decks.
- ⏱️ **Focus Timer & Ambient Soundscapes**: Stopwatch & Pomodoro timer with procedural ambient soundscapes, active task tagging, and Picture-in-Picture (PiP) mode.
- 📅 **Interactive Schedule & Curriculum Roadmaps**: Real-time time-blocking routines and dedicated learning roadmaps (Mathematics, Data Science, English).
- 🌌 **Cosmos Experimental Hub**: 7 data-driven analytics tools including Study Aura, Entropy Score, Mirror Mode, Sleep Debt, Dead Hours Graveyard, Clone Best Day, and Study Footprint.
- 🎨 **15+ Custom CSS Themes**: Unlockable palettes from Midnight OLED and Cyberpunk Neon to Celestial God.
- 🖥️ **Cross-Platform & Offline Ready**: Runs as a standard Web App, PWA, Electron Desktop App, or lightweight C# WebView executable.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** (`react`, `react-dom`) | Modern hook-based UI components |
| **Routing** | **React Router DOM v7** (`react-router-dom`) | Single-page client routing via `HashRouter` |
| **Build & Bundling** | **Vite 8** (`vite`, `@vitejs/plugin-react`) | Lightning-fast HMR and optimized asset builds |
| **Desktop Environment** | **Electron 34** (`electron`, `@electron/packager`) | Native Windows desktop packaging |
| **Alternative Desktop Launcher** | **C# / .NET** (`launcher.cs`) | Embedded HTTP server + Microsoft Edge App Mode (`StudyHub.exe`) |
| **PWA & Caching** | **Vite PWA** (`vite-plugin-pwa`, `workbox`) | Service worker caching and offline capabilities |
| **Data Visualizations** | **Recharts** (`recharts`) | Interactive bar charts, pie charts, and gauges |
| **Icons & Audio** | **React Icons** + Web Audio API | Vector icons, synthesized ambient noise, and SFX |
| **Styling** | **Vanilla CSS** (`App.css`, `index.css`) | Dynamic theme variables (`data-theme`) & animations |

---

## 📂 Project Structure

```
sh_react_local/
├── public/                 # Static assets, favicons, PWA icons
├── src/
│   ├── assets/             # Images and design assets
│   ├── components/         # 32 modular UI components
│   │   ├── AchievementsGrid.jsx    # Badges and milestones
│   │   ├── ActivityHeatmap.jsx     # 60-day GitHub-style study grid
│   │   ├── AmbientPlayer.jsx       # Synthesizer audio engine
│   │   ├── BossBattleCard.jsx      # Daily Procrastination Demon boss
│   │   ├── BrainWakeup.jsx         # Rapid mental math & warmup mini-game
│   │   ├── CloneBestDay.jsx        # Peak performance replication tool
│   │   ├── DailyNotesDrawer.jsx    # Slide-out daily journaling notebook
│   │   ├── DailySpin.jsx           # Daily bonus fortune wheel
│   │   ├── DeadHoursGraveyard.jsx  # Wasted time slots analytics
│   │   ├── EntropyScore.jsx        # Routine consistency metric
│   │   ├── FlashcardArena.jsx      # Spaced repetition flashcards
│   │   ├── FocusFamiliar.jsx       # Virtual pet evolution system
│   │   ├── InventoryModal.jsx      # Consumables backpack
│   │   ├── MirrorMode.jsx          # Past vs present trajectory reflection
│   │   ├── MoodTracker.jsx         # Energy and focus correlation logger
│   │   ├── Navbar.jsx              # Header with live stats and navigation
│   │   ├── PipTimerWidget.jsx      # Picture-in-Picture mini timer
│   │   ├── QuestBoard.jsx          # Weekly RPG quests & bounties
│   │   ├── RoutineEditorModal.jsx  # Daily routine schedule customizer
│   │   ├── ShadowRival.jsx         # Ghost race vs previous week performance
│   │   ├── ShopModal.jsx           # Consumable items store
│   │   ├── SleepDebt.jsx           # Cognitive rest and fatigue tracker
│   │   ├── StudyAura.jsx           # Generative weekly focus aura
│   │   ├── StudyFootprint.jsx      # Multi-dimensional radar skill chart
│   │   ├── StudyPassport.jsx       # Study milestone travel stamps
│   │   ├── StudyTimer.jsx          # Core stopwatch / pomodoro module
│   │   ├── ThemeShopModal.jsx      # 15+ unlockable CSS themes
│   │   ├── WeeklyGoalPlanner.jsx   # Weekly hours goal and progress gauge
│   │   └── ZenFocusOverlay.jsx     # Distraction-free full-screen mode
│   ├── data/
│   │   ├── constants.js            # Default routine & roadmap curricula
│   │   ├── flashcards.js           # Flashcard deck database
│   │   └── quotes.js               # Daily motivational quotes
│   ├── hooks/
│   │   ├── useActiveTask.js        # Active target focus task across views
│   │   ├── useAppHooks.js          # Storage, live clock, time logger, streak
│   │   ├── useConfetti.js          # Celebration animations
│   │   ├── useInventoryStorage.js  # Backpack consumables & buff timers
│   │   ├── usePetStorage.js        # Familiar stages, feeding & happiness
│   │   ├── useQuestStorage.js      # Quest progress calculation
│   │   └── useRpgStorage.js        # XP, Leveling, Coins, Boss HP, Theme sync
│   ├── pages/
│   │   ├── ArenaPage.jsx           # RPG Overview, quests, flashcards, boss
│   │   ├── CosmosPage.jsx          # 7 experimental data science analytics
│   │   ├── DashboardPage.jsx       # Timer, heatmaps, goal planner, charts
│   │   ├── RoadmapPage.jsx         # Subject learning roadmaps (Math/DS/English)
│   │   └── SchedulePage.jsx        # Daily routine time-blocking & live clock
│   ├── utils/
│   │   ├── dateKey.js              # Date and week key formatting
│   │   ├── sounds.js               # Web Audio sound effects
│   │   └── soundscapes.js          # Procedural ambient sound generators
│   ├── App.jsx                     # Top-level Router & midnight rollover handler
│   ├── App.css                     # Comprehensive styles and themes
│   ├── index.css                   # Global CSS reset
│   └── main.jsx                    # Application entry point
├── dist/                           # Production web bundle
├── launcher.cs                     # C# HTTP Server & Edge App Launcher source
├── main.cjs                        # Electron main process entry
├── StudyHub.exe                    # Precompiled Windows standalone binary
├── package.json                    # Dependencies and scripts
└── vite.config.js                  # Vite configuration & PWA manifest
```

---

## 🧭 Page Overview

### 1. ⚔️ Arena (`/arena` / `/`)
- **Focus Familiar**: Watch your pet grow from *Mystic Egg* 🥚 → *Chibi Drake* 🐣 → *Spirit Guardian* 🐺 → *Astral Elder Dragon* 🐉.
- **Quest Board**: Complete weekly challenges (120-min study marathon, 500 boss damage, 3-day streak) for bonus loot.
- **Flashcard Arena**: Interactive flashcards covering ML theory, linear algebra, calculus, and language fluency.
- **Boss Battle**: Deal damage to the *Procrastination Demon* with every task and study session completed.
- **Mini-Games**: Brain Wakeup cognitive drills, Daily Spin wheel, Shadow Rival ghost competitor, and Study Passport stamps.

### 2. 📅 Schedule (`/schedule`)
- Time-blocked schedule slots with live activity tracking.
- Interactive checkboxes linked directly to boss damage and XP rewards.
- Full custom routine editor to create, reorder, or delete custom time blocks.
- Slide-out Daily Notes drawer for end-of-day journaling.

### 3. 📊 Dashboard (`/dashboard`)
- **Study Timer**: Integrated stopwatch and Pomodoro timer with ambient soundscapes (Rain, Coffee Shop, White Noise, Lofi Drone) and PiP support.
- **Visual Analytics**: Recharts weekly study bar chart, category breakdown pie chart, and 60-day GitHub-style Activity Heatmap.
- **Goal Tracking & Milestones**: Configurable weekly hour target and achievement badge showcase.

### 4. 📚 Roadmaps (`/math`, `/data-science`, `/english`)
- Dedicated daily curriculum checklists for Mathematics, Data Science & Engineering, and English Fluency.
- **"Do Now" Task Targeting**: Direct button to target any roadmap item in the live study timer.

### 5. 🌌 Cosmos Hub (`/cosmos`)
- **Study Aura**: Dynamic generative color aura based on focus intensity and subject balance.
- **Entropy Score**: Mathematical regularity rating of your daily routine.
- **Mirror Mode**: Real-time trajectory comparison against past performance.
- **Sleep Debt Tracker**: Fatigue and optimal focus modeling.
- **Clone Best Day**: Single-click routine duplication from your highest-performing day.
- **Dead Hours Graveyard**: Identifies time intervals prone to distraction.
- **Study Footprint**: Multi-dimensional radar chart representing domain mastery.

---

## 💎 Economy, Inventory & Themes

### 🎒 Consumables & Items
| Item | Icon | Effect |
| :--- | :---: | :--- |
| **Potion of 2× XP** | 🧪 | Doubles all XP earned for 2 hours |
| **Streak Shield Aegis** | 🛡️ | Automatically protects streak if a day is missed |
| **Astral Boss Bomb** | 💣 | Instantly inflicts 250 HP damage to the Procrastination Demon |
| **Hourglass of Haste** | ⏳ | Instantly credits +30 deep focus study minutes |
| **Royal Familiar Feast** | 🍖 | Restores Focus Familiar happiness and energy to 100% |

### 🎨 Unlockable Themes
Choose from 15 custom themes powered by CSS variables:
*Dark Void*, *Midnight OLED*, *Cyberpunk Neon*, *Tokyo Crimson*, *Dracula Eclipse*, *Synthwave Dusk*, *Nordic Frost*, *Sunset Amber*, *Emerald Matrix*, *Amethyst Nebula*, *Oceanic Abyss*, *Royal Gold*, *Espresso Mocha*, *Phantom Violet*, and *Celestial God*.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes bundled with Node.js)

### Installation
1. Clone or download the repository:
   ```bash
   git clone <repo-url>
   cd sh_react_local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server (`http://localhost:5173`) with HMR |
| `npm run build` | Compiles production assets into `/dist` directory |
| `npm run preview` | Previews the production build locally |
| `npm run desktop` | Builds the project and launches the Electron desktop app |
| `npm run electron:start`| Starts Electron directly pointing to current build |
| `npm run electron:pack` | Packages a standalone Windows x64 `.exe` desktop application |

---

## 💾 Data & Persistence

- **Local-First**: All user data (XP, coins, inventory, streaks, logged sessions, notes, routine modifications) is persisted securely in the browser/desktop `localStorage`.
- **Automatic Midnight Rollover**: Built-in clock watcher detects `00:00` date changes live, cleanly resetting daily checklists and regenerating the daily boss challenge without wiping historical analytics.
- **Data Export & Reset**: Includes safe weekly checklist resetting and full factory reset options in the Dashboard settings.
