import { useState, useEffect, useRef } from 'react';
import { useLiveClock, useTimeTracker, useRoutineSchedule, parseMinutesFromTask } from '../hooks/useAppHooks';
import { getQuoteOfTheDay } from '../data/quotes';
import { useConfettiOn } from '../hooks/useConfetti';
import { scheduleRoutine as defaultRoutine } from '../data/constants';
import { playTick, playFanfare } from '../utils/sounds';
import RoutineEditorModal from '../components/RoutineEditorModal';
import DailyNotesDrawer from '../components/DailyNotesDrawer';

function ProgressRing({ checked, total }) {
  const pct = total ? Math.round((checked / total) * 100) : 0;
  const r = 14;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  const stroke =
    pct === 0 ? 'var(--border-color)' :
    pct === 100 ? '#10b981' :
    pct >= 50 ? '#3b82f6' :
    '#6366f1';

  return (
    <div className="progress-ring" title={`${checked}/${total} tasks done today`}>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--border-color)" strokeWidth="3" />
        <circle
          cx="18" cy="18" r={r} fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s ease' }}
        />
      </svg>
      <span className="progress-ring-text">{pct}%</span>
    </div>
  );
}

export default function SchedulePage({ currentDay, checkedItems, toggleCheck }) {
  const { schedule, addSlot, updateSlot, deleteSlot, resetToDefault } = useRoutineSchedule(defaultRoutine);
  const { clock, currentTask } = useLiveClock(schedule);
  const quote = getQuoteOfTheDay();
  const { addMinutes } = useTimeTracker();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  // Scope checked count to only this day's schedule items (not roadmap tasks)
  const routineIds = schedule.map(s => `routine-${currentDay}-${s.id}`);
  const checkedCount = routineIds.filter(id => !!checkedItems[id]).length;
  const allDone = checkedCount === schedule.length && schedule.length > 0;

  useConfettiOn(allDone);

  const fanfareFiredRef = useRef(false);
  useEffect(() => {
    if (allDone && !fanfareFiredRef.current) {
      fanfareFiredRef.current = true;
      setTimeout(() => playFanfare(), 200);
    }
    if (!allDone) {
      fanfareFiredRef.current = false;
    }
  }, [allDone]);

  const handleToggle = (id, slot, isChecked) => {
    if (!isChecked) {
      toggleCheck(id);
      return;
    }
    playTick();

    const minutes =
      parseMinutesFromTask(slot.task) ??
      Math.max(15, Math.round(
        (toMinutes(slot.end) - toMinutes(slot.start)) * 0.6
      ));
    addMinutes(minutes, { category: 'routine', task: slot.task });
    toggleCheck(id);
  };

  return (
    <section>
      <header className="header-section">
        <div className="header-flex">
          <div className="header-actions">
            <h1>Schedule</h1>
            <div className="header-btns-group">
              <button className="quick-btn action-btn" onClick={() => setIsNotesOpen(true)}>
                Daily Notes
              </button>
              <button className="quick-btn action-btn" onClick={() => setIsEditorOpen(true)}>
                Edit Routine
              </button>
            </div>
          </div>
          <ProgressRing checked={checkedCount} total={schedule.length} />
        </div>
        <div className="current-card">
          <span className="card-label">Active Target Window</span>
          <div className="current-task-text">{currentTask}</div>
        </div>
      </header>

      <div className="schedule-grid">
        {schedule.map(slot => {
          const id = `routine-${currentDay}-${slot.id}`;
          return (
            <div key={slot.id} className={`grid-task-card ${currentTask === slot.task ? 'active' : ''} ${checkedItems[id] ? 'completed' : ''}`}>
              <div className="grid-task-header">
                <span className="task-time">{slot.start} — {slot.end}</span>
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={!!checkedItems[id]}
                    onChange={() => handleToggle(id, slot, !checkedItems[id])}
                  />
                  <span className="custom-checkbox"></span>
                </label>
              </div>
              <span className="grid-task-name">{slot.task}</span>
            </div>
          );
        })}
      </div>

      <footer className="quote-footer">
        <blockquote>"{quote.text}"</blockquote>
        <cite>— {quote.author}</cite>
      </footer>

      <RoutineEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        schedule={schedule}
        addSlot={addSlot}
        updateSlot={updateSlot}
        deleteSlot={deleteSlot}
        resetToDefault={resetToDefault}
      />

      <DailyNotesDrawer
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        currentDay={currentDay}
      />
    </section>
  );
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
