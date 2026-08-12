import { useState } from 'react';

export default function RoutineEditorModal({ isOpen, onClose, schedule, addSlot, updateSlot, deleteSlot, resetToDefault }) {
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addSlot({ start: newStart, end: newEnd, task: newTask.trim() });
    setNewTask('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Custom Routine Editor</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <p className="dash-sub-hint">Add, edit, or remove time slots for your daily schedule routine.</p>

        <form className="add-slot-form" onSubmit={handleAdd}>
          <div className="form-inputs">
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="time-input"
              required
            />
            <span className="time-sep">-</span>
            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="time-input"
              required
            />
            <input
              type="text"
              placeholder="Task name (e.g. Deep Study Python)"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="task-input"
              required
            />
          </div>
          <button type="submit" className="timer-btn primary small">Add Slot</button>
        </form>

        <div className="slot-editor-list">
          {schedule.map(slot => (
            <div key={slot.id} className="editor-slot-row">
              {editingId === slot.id ? (
                <div className="edit-inline-form">
                  <input
                    type="time"
                    defaultValue={slot.start}
                    id={`start-${slot.id}`}
                    className="time-input"
                  />
                  <span className="time-sep">-</span>
                  <input
                    type="time"
                    defaultValue={slot.end}
                    id={`end-${slot.id}`}
                    className="time-input"
                  />
                  <input
                    type="text"
                    defaultValue={slot.task}
                    id={`task-${slot.id}`}
                    className="task-input"
                  />
                  <button
                    className="quick-btn"
                    onClick={() => {
                      const start = document.getElementById(`start-${slot.id}`).value;
                      const end = document.getElementById(`end-${slot.id}`).value;
                      const task = document.getElementById(`task-${slot.id}`).value;
                      updateSlot(slot.id, { start, end, task });
                      setEditingId(null);
                    }}
                  >
                    Save
                  </button>
                  <button className="quick-btn" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <div className="slot-info">
                    <span className="slot-time-badge">{slot.start} - {slot.end}</span>
                    <span className="slot-title-text">{slot.task}</span>
                  </div>
                  <div className="slot-actions">
                    <button className="quick-btn" onClick={() => setEditingId(slot.id)}>Edit</button>
                    <button className="quick-btn danger" onClick={() => deleteSlot(slot.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button
            className="timer-btn secondary small"
            onClick={() => {
              if (window.confirm("Reset schedule back to original default tasks?")) {
                resetToDefault();
              }
            }}
          >
            Reset to Default
          </button>
          <button className="timer-btn primary small" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
