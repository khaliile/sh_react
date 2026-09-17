import { useState } from 'react';
import {
  FaRegStickyNote,
  FaTimes,
  FaPlus,
  FaClock,
  FaCheck,
  FaTrashAlt,
  FaFire,
  FaSmile,
  FaBolt,
  FaMeh,
  FaTired,
  FaTag,
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { translateTask } from '../utils/taskTranslations';

export const FEELING_MAP = {
  fire:  { Icon: FaFire,  color: '#f59e0b', label: 'Energized', labelAr: 'متحمس' },
  smile: { Icon: FaSmile, color: '#10b981', label: 'Focused', labelAr: 'مركّز' },
  bolt:  { Icon: FaBolt,  color: '#3b82f6', label: 'Productive', labelAr: 'مُنتج' },
  meh:   { Icon: FaMeh,   color: '#8b5cf6', label: 'Steady', labelAr: 'مستقر' },
  tired: { Icon: FaTired, color: '#ef4444', label: 'Tired', labelAr: 'مجهد' },
};

const TAG_OPTIONS = [
  { en: 'Target', ar: 'هدف' },
  { en: 'Achievement', ar: 'إنجاز' },
  { en: 'Reminder', ar: 'تذكير' },
  { en: 'Study Tip', ar: 'نصيحة دراسية' },
];

export default function SlotNoteModal({ isOpen, onClose, slot, notes, onAddNote, onDeleteNote }) {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState('smile');
  const [selectedTag, setSelectedTag] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  if (!isOpen || !slot) return null;

  const handleAdd = (e) => {
    e?.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(slot.id, newNoteText.trim(), selectedFeeling, selectedTag);
    setNewNoteText('');
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1600);
  };

  return (
    <div className="sp2-modal-overlay" onClick={onClose} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="sp2-note-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sp2-note-modal-header">
          <div className="sp2-note-modal-title-wrap">
            <div className="sp2-note-modal-badge">
              <FaRegStickyNote size={13} /> {isAr ? 'ملاحظات الفترة الزمنية' : 'Routine Block Notes'}
            </div>
            <h3 className="sp2-note-modal-title">{translateTask(slot.task, isAr)}</h3>
            <div className="sp2-note-modal-time">
              <FaClock size={11} style={{ marginRight: isAr ? 0 : 4, marginLeft: isAr ? 4 : 0 }} />
              {slot.start} – {slot.end}
            </div>
          </div>
          <button className="sp2-close-btn" onClick={onClose} title={isAr ? 'إغلاق' : 'Close'}>
            <FaTimes size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="sp2-note-modal-body">
          {/* Existing Notes on this Slot */}
          <div className="sp2-note-modal-section-label">
            {isAr ? `ملاحظات هذه الفترة (${notes.length})` : `Notes on this block (${notes.length})`}
          </div>

          {notes.length === 0 ? (
            <div className="sp2-note-empty-state">
              <FaRegStickyNote size={22} style={{ opacity: 0.35, marginBottom: 5 }} />
              <p>{isAr ? 'لا توجد ملاحظات لهذه الفترة بعد.' : 'No notes for this block yet.'}</p>
              <span>{isAr ? 'حدد هدفاً، اكتب تذكيرات، أو سجّل تقدمك بالأسفل!' : 'Set a target, write reminders, or track your progress below!'}</span>
            </div>
          ) : (
            <div className="sp2-note-items-list">
              {notes.map((note) => {
                const feelingObj = FEELING_MAP[note.feeling] || FEELING_MAP.smile;
                const FIcon = feelingObj?.Icon || FaSmile;
                const fLabel = isAr ? (feelingObj?.labelAr || feelingObj?.label) : feelingObj?.label;

                return (
                  <div key={note.id} className="sp2-note-item-card">
                    <div className="sp2-note-item-content">
                      <div className="sp2-note-item-header">
                        {FIcon && (
                          <span
                            className="sp2-note-item-feeling"
                            style={{ color: feelingObj.color, borderColor: feelingObj.color }}
                            title={fLabel}
                          >
                            <FIcon size={11} />
                            <span>{fLabel}</span>
                          </span>
                        )}
                        {note.tag && (
                          <span className="sp2-note-item-tag">
                            <FaTag size={9} /> {note.tag}
                          </span>
                        )}
                        {note.createdAt && (
                          <span className="sp2-note-item-date">
                            {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="sp2-note-item-text">{note.text}</p>
                    </div>
                    <button
                      className="sp2-note-delete-btn"
                      onClick={() => onDeleteNote(slot.id, note.id)}
                      title="Delete this note"
                    >
                      <FaTrashAlt size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Note Section */}
          <form className="sp2-note-form" onSubmit={handleAdd}>
            <div className="sp2-note-modal-section-label">
              {isAr ? 'إضافة ملاحظة وشعور جديد' : 'Add a new note & feeling'}
            </div>

            {/* Feeling Selector */}
            <div className="sp2-feeling-selector-wrap">
              <span className="sp2-feeling-title">
                {isAr ? 'ما هو شعورك تجاه هذه الفترة؟' : 'How do you feel about this block?'}
              </span>
              <div className="sp2-feeling-btn-row">
                {Object.entries(FEELING_MAP).map(([key, { Icon: FIcon, color, label, labelAr }]) => {
                  const isSelected = selectedFeeling === key;
                  const fLabel = isAr ? (labelAr || label) : label;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`sp2-feeling-btn ${isSelected ? 'sp2-feeling-btn-active' : ''}`}
                      onClick={() => setSelectedFeeling(key)}
                      style={isSelected ? { borderColor: color, color } : {}}
                      title={fLabel}
                    >
                      <FIcon size={14} />
                      <span className="sp2-feeling-btn-label">{fLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Tag Selector */}
            <div className="sp2-tag-selector-row">
              <span className="sp2-tag-label">{isAr ? 'الوسم:' : 'Tag:'}</span>
              {TAG_OPTIONS.map(item => {
                const tagVal = isAr ? item.ar : item.en;
                const isSelected = selectedTag === tagVal;
                return (
                  <button
                    key={item.en}
                    type="button"
                    className={`sp2-tag-pill ${isSelected ? 'sp2-tag-pill-active' : ''}`}
                    onClick={() => setSelectedTag(isSelected ? '' : tagVal)}
                  >
                    {tagVal}
                  </button>
                );
              })}
            </div>

            {/* Textarea */}
            <textarea
              className="sp2-textarea"
              placeholder={isAr ? 'مثال: حل 3 مسائل برمجية، قراءة 5 صفحات، شرب الماء...' : 'e.g. Solve 3 LeetCode problems, read 5 pages of notes, stay hydrated...'}
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              rows={3}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />

            <div className="sp2-note-form-actions">
              <button
                type="submit"
                className="sp2-add-note-submit-btn"
                disabled={!newNoteText.trim()}
              >
                <FaPlus size={11} /> {isAr ? 'حفظ الملاحظة' : 'Save Note'}
              </button>
              {addedToast && (
                <span className="sp2-note-toast">
                  <FaCheck size={11} /> {isAr ? 'تم الحفظ في الفترة!' : 'Saved to block!'}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sp2-note-modal-footer">
          <span>{isAr ? 'يتم حفظ الملاحظات مباشرة في قاعدة البيانات المحلية.' : 'Notes are saved directly to your local database.'}</span>
        </div>
      </div>
    </div>
  );
}
