import { useLiveClock, useTimeTracker, parseMinutesFromTask } from '../hooks/useAppHooks';
import { scheduleRoutine } from '../data/constants';

export default function SchedulePage({ currentDay, checkedItems, toggleCheck }) {
  const { clock, currentTask } = useLiveClock(scheduleRoutine);
  const { addMinutes } = useTimeTracker();

  // When user checks a task, auto-log its estimated minutes.
  // If no estimate in the task string, fall back to slot duration (end - start).
  const handleToggle = (id, slot, isChecked) => {
    if (!isChecked) {
      // un-checking: just toggle, don't double-add
      toggleCheck(id);
      return;
    }
    const minutes =
      parseMinutesFromTask(slot.task) ??
      Math.max(15, Math.round(
        (toMinutes(slot.end) - toMinutes(slot.start)) * 0.6 // assume ~60% of slot is study
      ));
    addMinutes(minutes, { category: 'routine', task: slot.task });
    toggleCheck(id);
  };

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
    </section>
  );
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
