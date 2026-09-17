import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  useParams
} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AppUIProvider } from './contexts/AppUIContext';

import {
  useAppStorage,
  useDayWatcher
} from './hooks/useAppHooks';

import { currentWeekKey } from './utils/dateKey';

import { useDayNightCycle } from './hooks/useDayNightCycle';

import { lazyWithRetry } from './utils/lazyWithRetry';


// Code-split pages for instant initial load and fast navigation
const ArenaPage = lazyWithRetry(() => import('./pages/ArenaPage'));
const SchedulePage = lazyWithRetry(() => import('./pages/SchedulePage'));
const DashboardPage = lazyWithRetry(() => import('./pages/DashboardPage'));
const AnalyticsPage = lazyWithRetry(() => import('./pages/AnalyticsPage'));
const SkillTreePage = lazyWithRetry(() => import('./pages/SkillTreePage'));
const EnglishSkillTree = lazyWithRetry(() => import('./pages/EnglishSkillTree'));
const InternetSkillTree = lazyWithRetry(() => import('./pages/InternetSkillTree'));
const DeepLearningSkillTree = lazyWithRetry(() => import('./pages/DeepLearningSkillTree'));
const MachineLearningSkillTree = lazyWithRetry(() => import('./pages/MachineLearningSkillTree'));
const SQLSkillTree = lazyWithRetry(() => import('./pages/SQLSkillTree'));
const MathSkillTree = lazyWithRetry(() => import('./pages/MathSkillTree'));
const DataStructuresSkillTree = lazyWithRetry(() => import('./pages/DataStructuresSkillTree'));
const AISkillTree = lazyWithRetry(() => import('./pages/AISkillTree'));
const CosmosPage = lazyWithRetry(() => import('./pages/CosmosPage'));
const Note = lazyWithRetry(() => import('./pages/Note'));
const RoadmapPage = lazyWithRetry(() => import('./pages/RoadmapPage'));
const AIVoiceCoachPage = lazyWithRetry(() => import('./pages/AIVoiceCoachPage'));
const SanctumPage = lazyWithRetry(() => import('./pages/SanctumPage'));
const SalatPage = lazyWithRetry(() => import('./pages/SalatPage'));

// Mind Lab Pages
const DNALabPage = lazyWithRetry(() => import('./pages/DNALabPage'));
const FlowRiverPage = lazyWithRetry(() => import('./pages/FlowRiverPage'));
const EgoMirrorPage = lazyWithRetry(() => import('./pages/EgoMirrorPage'));
const ProphecyBoardPage = lazyWithRetry(() => import('./pages/ProphecyBoardPage'));
const BountyHuntPage = lazyWithRetry(() => import('./pages/BountyHuntPage'));
const ParallelMePage = lazyWithRetry(() => import('./pages/ParallelMePage'));
const CryoChamberPage = lazyWithRetry(() => import('./pages/CryoChamberPage'));
const OraclePage = lazyWithRetry(() => import('./pages/OraclePage'));
const SignalTowerPage = lazyWithRetry(() => import('./pages/SignalTowerPage'));
const FutureLetterPage = lazyWithRetry(() => import('./pages/FutureLetterPage'));
const StudyMultiversePage = lazyWithRetry(() => import('./pages/StudyMultiversePage'));

// Arcane Vault Pages
const MemoryPalacePage = lazyWithRetry(() => import('./pages/MemoryPalacePage'));
const ChronoAlchemistPage = lazyWithRetry(() => import('./pages/ChronoAlchemistPage'));
const BlackBoxPage = lazyWithRetry(() => import('./pages/BlackBoxPage'));
const BloodPactPage = lazyWithRetry(() => import('./pages/BloodPactPage'));
const TowerOfBabelPage = lazyWithRetry(() => import('./pages/TowerOfBabelPage'));
const FeynmanTribunalPage = lazyWithRetry(() => import('./pages/FeynmanTribunalPage'));

// Global Features & Overlay Components
const FloatingMascot = lazyWithRetry(() => import('./components/FloatingMascot'));
const LootBoxModal = lazyWithRetry(() => import('./components/LootBoxModal'));
const AbyssOverlay = lazyWithRetry(() => import('./components/AbyssOverlay'));
const CommandPalette = lazyWithRetry(() => import('./components/CommandPalette'));
const StudyWhisper = lazyWithRetry(() => import('./components/StudyWhisper'));
const AIApiTesterModal = lazyWithRetry(() => import('./components/AIApiTesterModal'));

// ── Dynamic Skill Tree Routing Map ──────────────────────────────────────────
const SKILL_TREE_MAP = {
  'data-science': SkillTreePage,
  'english': EnglishSkillTree,
  'internet': InternetSkillTree,
  'deep-learning': DeepLearningSkillTree,
  'machine-learning': MachineLearningSkillTree,
  'sql': SQLSkillTree,
  'math': MathSkillTree,
  'data-structures': DataStructuresSkillTree,
  'ai': AISkillTree,
};

function DynamicSkillTree() {
  const { trackId } = useParams();
  const SkillComponent = SKILL_TREE_MAP[trackId] || SkillTreePage;
  return <SkillComponent />;
}

function DynamicRoadmap({ currentDay, checkedItems, toggleCheck }) {
  const { type } = useParams();
  const validTypes = ['math', 'ds', 'english'];
  const roadmapType = validTypes.includes(type) ? type : 'ds';
  return (
    <RoadmapPage
      type={roadmapType}
      currentDay={currentDay}
      checkedItems={checkedItems}
      toggleCheck={toggleCheck}
    />
  );
}

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-spinner" />
      Loading...
    </div>
  );
}

function AppContent() {
  const dayInfo = useDayWatcher();
  const timePeriod = useDayNightCycle();
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('app_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleCollapse = useCallback((val) => {
    setIsSidebarCollapsed(val);
    localStorage.setItem('app_sidebar_collapsed', val ? 'true' : 'false');
  }, []);

  const [currentDay, setCurrentDay] = useState(dayInfo.weekday);
  const [isLootModalOpen, setIsLootModalOpen] = useState(false);
  const [isAiTesterOpen, setIsAiTesterOpen] = useState(false);
  const [lootReward, setLootReward] = useState(null);

  useEffect(() => {
    const handleOpenTester = () => setIsAiTesterOpen(true);
    window.addEventListener('cmd-open-ai-tester', handleOpenTester);
    return () => window.removeEventListener('cmd-open-ai-tester', handleOpenTester);
  }, []);

  const [checkedItems, setCheckedItems] = useAppStorage(
    'app_progress_state',
    {}
  );

  const [progressWeek, setProgressWeek] = useAppStorage(
    'app_progress_week_key',
    currentWeekKey()
  );

  // Sync Day/Night cycle time-of-day attribute on root document
  useEffect(() => {
    document.documentElement.setAttribute('data-time-period', timePeriod);
  }, [timePeriod]);

  // Global Loot Drop & World Map Event Listeners
  useEffect(() => {
    const handleLootDrop = (e) => {
      setLootReward(e.detail?.reward || null);
      setIsLootModalOpen(true);
    };

    window.addEventListener('loot-drop', handleLootDrop);

    return () => {
      window.removeEventListener('loot-drop', handleLootDrop);
    };
  }, []);

  // Auto-roll active day at midnight 00:00 live
  useEffect(() => {
    setCurrentDay(dayInfo.weekday);
  }, [dayInfo.weekday]);

  // Cleanly cycle task checklists for each new week without affecting historical analytics
  useEffect(() => {
    const thisWeek = currentWeekKey();
    if (progressWeek !== thisWeek) {
      setCheckedItems({});
      setProgressWeek(thisWeek);
    }
  }, [progressWeek, setCheckedItems, setProgressWeek]);

  const toggleCheck = useCallback((id) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, [setCheckedItems]);

  const location = useLocation();

  // Instant scroll to top on route change and initial mount
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      
      const wrapper = document.querySelector('.view-wrapper');
      if (wrapper) {
        wrapper.scrollTop = 0;
      }
      
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [location.pathname]);

  const isDashboard = location.pathname === '/dashboard';
  const isAnalytics = location.pathname === '/analytics';
  const isSchedule = location.pathname === '/schedule';
  const isSkillTree =
    location.pathname === '/skills' ||
    location.pathname === '/skill-tree' ||
    location.pathname.startsWith('/skills/') ||
    location.pathname.startsWith('/skill-tree/');

  const hideSelector =
    isDashboard ||
    isAnalytics ||
    isSkillTree ||
    location.pathname === '/';

  return (
    <div className={`app-shell ${isRTL ? 'rtl' : ''} ${isSkillTree ? 'skill-tree-route' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Modern Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Viewport Shell — edge-to-edge, no top bar */}
      <div className="app-main-viewport">

        {/* Main Application Content */}
        <main className={`app-content-view view-wrapper fade-in ${isSkillTree ? 'skill-tree-route full-bleed' : ''} ${isSchedule ? 'schedule-route' : ''}`}>
          <Suspense fallback={<PageLoader />}>
            <Routes>

            {/* Home */}
            <Route
              path="/"
              element={<ArenaPage />}
            />

            {/* Schedule */}
            <Route
              path="/schedule"
              element={
                <SchedulePage
                  currentDay={currentDay}
                  checkedItems={checkedItems}
                  toggleCheck={toggleCheck}
                />
              }
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  checkedItems={checkedItems}
                  setCheckedItems={setCheckedItems}
                />
              }
            />

            {/* Analytics Hub */}
            <Route
              path="/analytics"
              element={<AnalyticsPage />}
            />

            {/* Subject Roadmaps */}
            <Route
              path="/math"
              element={
                <RoadmapPage
                  type="math"
                  currentDay={currentDay}
                  checkedItems={checkedItems}
                  toggleCheck={toggleCheck}
                />
              }
            />
            <Route
              path="/data-science"
              element={
                <RoadmapPage
                  type="ds"
                  currentDay={currentDay}
                  checkedItems={checkedItems}
                  toggleCheck={toggleCheck}
                />
              }
            />
            <Route
              path="/english"
              element={
                <RoadmapPage
                  type="english"
                  currentDay={currentDay}
                  checkedItems={checkedItems}
                  toggleCheck={toggleCheck}
                />
              }
            />
            <Route
              path="/roadmap/:type"
              element={
                <DynamicRoadmap
                  currentDay={currentDay}
                  checkedItems={checkedItems}
                  toggleCheck={toggleCheck}
                />
              }
            />

            {/* Arena */}
            <Route
              path="/arena"
              element={<ArenaPage />}
            />

            {/* Cosmos */}
            <Route
              path="/cosmos"
              element={<CosmosPage />}
            />

            {/* Dynamic Skill Tree Routing (no hash, clean URLs) */}
            <Route
              path="/skills"
              element={<SkillTreePage />}
            />
            <Route
              path="/skills/:trackId"
              element={<DynamicSkillTree />}
            />
            <Route
              path="/skill-tree"
              element={<SkillTreePage />}
            />
            <Route
              path="/skill-tree/:trackId"
              element={<DynamicSkillTree />}
            />

            {/* Notes */}
            <Route
              path="/note"
              element={<Note />}
            />

            {/* AI Voice Coach standalone page */}
            <Route
              path="/coach"
              element={<AIVoiceCoachPage />}
            />

            {/* The Forbidden Sanctum */}
            <Route
              path="/sanctum"
              element={<SanctumPage />}
            />

            {/* Daily Prayer Tracker */}
            <Route
              path="/salat"
              element={<SalatPage />}
            />

            {/* ── Mind Lab Routes ── */}
            <Route path="/dna-lab"       element={<DNALabPage />} />
            <Route path="/flow-river"    element={<FlowRiverPage />} />
            <Route path="/ego-mirror"    element={<EgoMirrorPage />} />
            <Route path="/prophecy"      element={<ProphecyBoardPage />} />
            <Route path="/bounty-hunt"   element={<BountyHuntPage />} />
            <Route path="/parallel-me"   element={<ParallelMePage />} />
            <Route path="/cryo-chamber"  element={<CryoChamberPage />} />
            <Route path="/oracle"        element={<OraclePage />} />
            <Route path="/signal-tower"  element={<SignalTowerPage />} />
            <Route path="/future-letter" element={<FutureLetterPage />} />
            <Route path="/multiverse"    element={<StudyMultiversePage />} />

            {/* Arcane Vault */}
            <Route path="/feynman-tribunal" element={<FeynmanTribunalPage />} />
            <Route path="/memory-palace"    element={<MemoryPalacePage />} />
            <Route path="/chrono-alchemist" element={<ChronoAlchemistPage />} />
            <Route path="/black-box"        element={<BlackBoxPage />} />
            <Route path="/blood-pact"       element={<BloodPactPage />} />
            <Route path="/tower-of-babel"   element={<TowerOfBabelPage />} />

            {/* Fallback */}
            <Route
              path="*"
              element={<ArenaPage />}
            />

          </Routes>
        </Suspense>
        </main>
      </div>

      {/* Persistent Global Floating Shimeji Mascot */}
      <Suspense fallback={null}>
        <FloatingMascot />
      </Suspense>

      {/* Global Outside-the-Box Overlays & Systems */}
      <Suspense fallback={null}>
        {isLootModalOpen && (
          <LootBoxModal
            reward={lootReward}
            onClose={() => {
              setIsLootModalOpen(false);
              setLootReward(null);
            }}
          />
        )}
        {isAiTesterOpen && (
          <AIApiTesterModal
            isOpen={isAiTesterOpen}
            onClose={() => setIsAiTesterOpen(false)}
          />
        )}
        <AbyssOverlay />
        <CommandPalette />
        <StudyWhisper />
      </Suspense>

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <Router>
          <AppUIProvider>
            <AppContent />
          </AppUIProvider>
        </Router>
      </ErrorBoundary>
    </LanguageProvider>
  );
}
