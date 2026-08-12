import { useState, useEffect } from 'react';
import { useDailyNotes } from '../hooks/useAppHooks';

export default function DailyNotesDrawer({ isOpen, onClose, currentDay }) {
  const { currentNote, saveNote } = useDailyNotes();
  const [text, setText] = useState(currentNote.text || '');
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    setText(currentNote.text || '');
  }, [currentNote]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveNote(text);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const insertTag = (tag) => {
    setText(prev => `${prev}\n- [${tag}]: `);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h3>Daily Study Reflections</h3>
            <span className="dash-sub-hint">{currentDay} Journal Note</span>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="notes-tags-bar">
          <button className="quick-btn" onClick={() => insertTag('WIN')}>+ Win</button>
          <button className="quick-btn" onClick={() => insertTag('LEARNING')}>+ Learning</button>
          <button className="quick-btn" onClick={() => insertTag('BLOCKER')}>+ Blocker</button>
        </div>

        <textarea
          className="notes-textarea"
          placeholder="Write your study wins, key concepts learned, or challenges today..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="drawer-footer">
          <span className="save-status">{savedStatus ? 'Saved to local storage ✓' : ''}</span>
          <div className="drawer-actions">
            <button className="timer-btn primary small" onClick={handleSave}>Save Note</button>
            <button className="timer-btn secondary small" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
