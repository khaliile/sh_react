import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DaySelector from './components/DaySelector';
import SchedulePage from './pages/SchedulePage';
import RoadmapPage from './pages/RoadmapPage';
import DashboardPage from './pages/DashboardPage';
import { useAppStorage } from './hooks/useAppHooks';
import './App.css';

export default function App() {
  const [currentDay, setCurrentDay] = useState(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [checkedItems, setCheckedItems] = useAppStorage('app_progress_state', {});
  const toggleCheck = (id) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <DaySelector currentDay={currentDay} setCurrentDay={setCurrentDay} />
        <main className="view-wrapper fade-in">
          <Routes>
            <Route path="/" element={<SchedulePage currentDay={currentDay} checkedItems={checkedItems} toggleCheck={toggleCheck} />} />
            <Route path="/dashboard" element={<DashboardPage checkedItems={checkedItems} />} />
            <Route path="/math" element={<RoadmapPage type="math" currentDay={currentDay} checkedItems={checkedItems} toggleCheck={toggleCheck} />} />
            <Route path="/data-science" element={<RoadmapPage type="ds" currentDay={currentDay} checkedItems={checkedItems} toggleCheck={toggleCheck} />} />
            <Route path="/english" element={<RoadmapPage type="english" currentDay={currentDay} checkedItems={checkedItems} toggleCheck={toggleCheck} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}