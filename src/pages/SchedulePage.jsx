import { useLiveClock } from '../hooks/useAppHooks';
import { scheduleRoutine } from '../data/constants';

export default function SchedulePage({ currentDay, checkedItems, toggleCheck }) {
  const { clock, currentTask } = useLiveClock(scheduleRoutine);
  return (
    <section>
      <header className="header-section">
        <div className="header-flex"><h1>Schedule</h1><div className="time-display">{clock}</div></div>
        <div className="current-card"><span className="card-label">Active Target Window</span><div className="current-task-text">{currentTask}</div></div>
      </header>
      <div className="schedule-grid">
        {scheduleRoutine.map(slot => {
          const id = `routine-${currentDay}-${slot.id}`;
          return (
            <div key={slot.id} className={`grid-task-card ${currentTask === slot.task ? 'active' : ''} ${checkedItems[id] ? 'completed' : ''}`}>
              <div className="grid-task-header">
                <span className="task-time">{slot.start} — {slot.end}</span>
                <label className="checkbox-wrapper"><input type="checkbox" checked={!!checkedItems[id]} onChange={() => toggleCheck(id)} /><span className="custom-checkbox"></span></label>
              </div>
              <span className="grid-task-name">{slot.task}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}