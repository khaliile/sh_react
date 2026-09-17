import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function RoutineEditorModal({
  isOpen,
  onClose,
  schedule = [],
  initialEditingId = null,
  addSlot,
  updateSlot,
  deleteSlot,
  resetToDefault,
}) {
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editTask, setEditTask] = useState('');
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  useEffect(() => {
    if (initialEditingId && schedule) {
      const slot = schedule.find(s => s.id === initialEditingId);
      if (slot) {
        setEditingId(slot.id);
        setEditStart(slot.start || '09:00');
        setEditEnd(slot.end || '10:00');
        setEditTask(slot.task || '');
      }
    } else {
      setEditingId(null);
    }
  }, [initialEditingId, schedule]);

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    const taskTitle = newTask.trim();
    if (!taskTitle) return;
    addSlot({ start: newStart, end: newEnd, task: taskTitle });
    setNewTask('');

    try {
      window.dispatchEvent(new CustomEvent('mascot-event', {
        detail: {
          eventType: 'TASK_CREATED',
          taskName: taskTitle,
          userMessage: `New quest scheduled for ${newStart} - ${newEnd}: ${taskTitle}`
        }
      }));
    } catch { /* noop */ }
  };

  const startEditing = (slot) => {
    setEditingId(slot.id);
    setEditStart(slot.start || '09:00');
    setEditEnd(slot.end || '10:00');
    setEditTask(slot.task || '');
  };

  const saveEditing = (id) => {
    if (!editTask.trim()) return;
    updateSlot(id, { start: editStart, end: editEnd, task: editTask.trim() });
    setEditingId(null);
  };

  // Ensure slots are always ordered chronologically from start time
  const slotList = Array.isArray(schedule)
    ? [...schedule].sort((a, b) => (a.start || '').localeCompare(b.start || ''))
    : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isAr ? 'محرر الروتين المخصص' : 'Custom Routine Editor'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <p className="dash-sub-hint">{isAr ? 'أضف أو عدّل أو احذف فترات زمنية لجدول روتينك اليومي.' : 'Add, edit, or remove time slots for your daily schedule routine.'}</p>

        <form className="add-slot-form" onSubmit={handleAdd}>
          <div className="form-inputs">
            <div className="time-range-group flex flex-row items-center whitespace-nowrap">
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
            </div>
            <input
              type="text"
              placeholder={isAr ? 'اسم المهمة (مثال: دراسة معمقة Python)' : 'Task name (e.g. Deep Study Python)'}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="task-input"
              required
            />
          </div>
          <button type="submit" className="timer-btn primary small">{isAr ? 'إضافة فترة' : 'Add Slot'}</button>
        </form>

        <div className="slot-editor-list">
          {slotList.map(slot => (
            <div key={slot.id} className="editor-slot-row">
              {editingId === slot.id ? (
                <div className="edit-inline-form flex flex-row items-center whitespace-nowrap">
                  <div className="time-range-group flex flex-row items-center whitespace-nowrap">
                    <input
                      type="time"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      className="time-input"
                    />
                    <span className="time-sep">-</span>
                    <input
                      type="time"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      className="time-input"
                    />
                  </div>
                  <input
                    type="text"
                    value={editTask}
                    onChange={(e) => setEditTask(e.target.value)}
                    className="task-input"
                  />
                  <div className="edit-actions-group flex flex-row items-center gap-1">
                    <button
                      type="button"
                      className="quick-btn"
                      onClick={() => saveEditing(slot.id)}
                    >
                      {isAr ? 'حفظ' : 'Save'}
                    </button>
                    <button type="button" className="quick-btn" onClick={() => setEditingId(null)}>{isAr ? 'إلغاء' : 'Cancel'}</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="slot-info flex flex-row items-center gap-3">
                    <span className="slot-time-badge">{slot.start} — {slot.end}</span>
                    <span className="slot-title-text">{slot.task}</span>
                  </div>
                  <div className="slot-actions">
                    <button className="quick-btn" onClick={() => startEditing(slot)}>{isAr ? 'تعديل' : 'Edit'}</button>
                    <button
                      className="quick-btn danger"
                      onClick={() => {
                        deleteSlot(slot.id);
                        try {
                          window.dispatchEvent(new CustomEvent('mascot-event', {
                            detail: {
                              eventType: 'TASK_DELETED',
                              taskName: slot.task || 'Routine Slot',
                              userMessage: `Deleted quest: ${slot.task || 'Slot'}`
                            }
                          }));
                        } catch { /* noop */ }
                      }}
                    >
                      {isAr ? 'حذف' : 'Delete'}
                    </button>
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
              if (window.confirm(isAr ? 'إعادة ضبط الجدول إلى المهام الافتراضية الأصلية؟' : 'Reset schedule back to original default tasks?')) {
                resetToDefault();
              }
            }}
          >
            {isAr ? 'إعادة ضبط إلى الافتراضي' : 'Reset to Default'}
          </button>
          <button className="timer-btn primary small" onClick={onClose}>{isAr ? 'تم' : 'Done'}</button>
        </div>
      </div>
    </div>
  );
}
