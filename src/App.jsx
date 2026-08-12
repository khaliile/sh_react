import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import DaySelector from './components/DaySelector';
import SchedulePage from './pages/SchedulePage';
import RoadmapPage from './pages/RoadmapPage';
import DashboardPage from './pages/DashboardPage';
import ArenaPage from './pages/ArenaPage';
import CosmosPage from './pages/CosmosPage';
import { useAppStorage } from './hooks/useAppHooks';
import './App.css';

function AppContent() {
  const [currentDay, setCurrentDay] = useState(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [checkedItems, setCheckedItems] = useAppStorage('app_progress_state', {});
  const toggleCheck = (id) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const hideSelector = isDashboard || location.pathname === '/';

  return (
    <div className="app-container">
      <Navbar />
      {!hideSelector && <DaySelector currentDay={currentDay} setCurrentDay={setCurrentDay} />}
      <main className="view-wrapper fade-in">
        <Routes>
          <Route path="/" element={<ArenaPage />} />
          <Route path="/schedule" element={<SchedulePage currentDay={currentDay} checkedItems={checkedItems} toggleCheck={toggleCheck} />} />
          <Route path="/dashboard" element={<DashboardPage checkedItems={checkedItems} setCheckedItems={setCheckedItems} />} />
          <Route path="/math" element={<RoadmapPage type="math" currentDay={currentDay} checkedItems={checkedItems} toggleCheck={toggleCheck} />} />
          <Route path="/data-science" element={<RoadmapPage type="ds" currentDay={currentDay} checkedItems={checkedItems} toggleCheck={toggleCheck} />} />
          <Route path="/english" element={<RoadmapPage type="english" currentDay={currentDay} checkedItems={checkedItems} toggleCheck={toggleCheck} />} />
          <Route path="/arena" element={<ArenaPage />} />
          <Route path="/cosmos" element={<CosmosPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}