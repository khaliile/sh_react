import { useState, useEffect, useRef } from 'react';
import {
  FaClock,
  FaSyncAlt,
  FaEdit,
  FaBullseye,
  FaPlay,
  FaCalendarDay,
  FaSun,
  FaMoon,
  FaPray,
  FaCoffee,
  FaBook,
  FaDumbbell,
  FaCode,
  FaUtensils,
  FaBed,
  FaStar,
  FaCheck,
  FaPlus,
  FaRegStickyNote,
  FaFutbol,
} from 'react-icons/fa';
import { MdSelfImprovement } from 'react-icons/md';
import { useLiveClock, useRoutineSchedule, useSlotNotes } from '../hooks/useAppHooks';
import { useActiveTask } from '../hooks/useActiveTask';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { getQuoteOfTheDay } from '../data/quotes';
import { useConfettiOn } from '../hooks/useConfetti';
import { scheduleRoutine as defaultRoutine } from '../data/constants';
import { playTick, playFanfare } from '../utils/sounds';
import RoutineEditorModal from '../components/RoutineEditorModal';
import SlotNoteModal, { FEELING_MAP } from '../components/SlotNoteModal';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translateTask, translateCategory, translateNote } from '../utils/taskTranslations';
import './SchedulePage.css';

/* ─── Helpers ─────────────────────────────────────────────── */
function toMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function durationLabel(start, end, isAr = false) {
  const s = toMinutes(start);
  let e = toMinutes(end);
  if (e <= s) e += 24 * 60;
  const diff = e - s;
  if (diff < 60) return isAr ? `${diff} دقيقة` : `${diff}m`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (isAr) {
    return m ? `${h} س ${m} د` : `${h} س`;
  }
  return m ? `${h}h ${m}m` : `${h}h`;
}

function getGreeting(isAr = false) {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { label: isAr ? 'صباح الخير' : 'Good morning', Icon: FaSun };
  if (h >= 12 && h < 17) return { label: isAr ? 'مساء الخير' : 'Good afternoon', Icon: FaSun };
  if (h >= 17 && h < 21) return { label: isAr ? 'مساء الخير' : 'Good evening', Icon: FaSun };
  return { label: isAr ? 'طابت ليلتك' : 'Good night', Icon: FaMoon };
}

function getShortTaskTitle(task = '') {
  const t = task.toLowerCase();
  if (t.includes('morning spirituals') || t.includes('fajr')) return 'Morning Spirituals (Fajr)';
  if (t.includes('mind prep')) return 'Mind Prep (No Phone)';
  if (t.includes('morning core focus') || (t.includes('core focus') && t.includes('math'))) return 'Morning Core : Math / Py (5h)';
  if (t.includes('energy recharge') || t.includes('lunch')) return 'Energy Recharge & Lunch';
  if (t.includes('afternoon math')) return 'Afternoon Math/Python';
  if (t.includes('asr break')) return 'Asr Break';
  if (t.includes('evening block') || t.includes('english')) return 'English (2h)';
  if (t.includes('escape & reward') || t.includes('hobbies')) return 'Reward & Maghrib';
  if (t.includes('spiritual serenity') || t.includes('daily review')) return 'Serenity & Review';
  if (t.includes('sleep')) return 'Sleep';
  return task;
}

function getSlotMeta(task = '') {
  const t = task.toLowerCase();
  if (t.includes('fajr') || t.includes('quran') || t.includes('spiritual') || t.includes('pray') || t.includes('dhuhr') || t.includes('asr') || t.includes('maghrib') || t.includes('isha'))
    return { Icon: FaPray, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', category: 'Spiritual' };
  if (t.includes('sleep') || t.includes('rest'))
    return { Icon: FaBed, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)', category: 'Rest' };
  if (t.includes('coffee') || t.includes('mind prep') || t.includes('preparation'))
    return { Icon: FaCoffee, color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)', category: 'Morning Prep' };
  if (t.includes('core focus') || (t.includes('mathematics / python') && !t.includes('afternoon')))
    return { Icon: FaCode, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', category: 'Core Focus' };
  if (t.includes('math') || t.includes('python') || t.includes('code') || t.includes('programming') || t.includes('afternoon'))
    return { Icon: FaCode, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', category: 'Study' };
  if (t.includes('lunch') || t.includes('energy') || t.includes('break') || t.includes('recharge'))
    return { Icon: FaUtensils, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', category: 'Break' };
  if (t.includes('english') || t.includes('language') || t.includes('evening block'))
    return { Icon: FaBook, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', category: 'Language' };
  if (t.includes('escape') || t.includes('hobby') || t.includes('hobbies') || t.includes('sport') || t.includes('reward'))
    return { Icon: FaFutbol, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', category: 'Personal Growth' };
  if (t.includes('review') || t.includes('serenity') || t.includes('daily review'))
    return { Icon: FaMoon, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', category: 'Reflection' };
  if (t.includes('workout') || t.includes('gym') || t.includes('exercise'))
    return { Icon: FaDumbbell, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', category: 'Fitness' };
  return { Icon: FaBullseye, color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)', category: 'General' };
}

/* ─── Circular Progress Ring ─────────────────────────────── */
function ProgressRing({ checked, total }) {
  const pct = total ? Math.round((checked / total) * 100) : 0;
  const r = 17;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const stroke = '#10b981';

  return (
    <div className="sp2-progress-ring" title={`${checked}/${total} tasks done (${pct}%)`}>
      <svg width="42" height="42" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={r} fill="none" stroke="var(--border-color)" strokeWidth="3" />
        <circle
          cx="21" cy="21" r={r} fill="none"
          stroke={stroke} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 21 21)"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s ease' }}
        />
      </svg>
      <span className="sp2-progress-text">{pct}%</span>
    </div>
  );
}

/* ─── Main Schedule Page ────────────────────────────────────── */
export default function SchedulePage({ currentDay, checkedItems, toggleCheck }) {
  const { schedule, addSlot, updateSlot, deleteSlot, resetToDefault } = useRoutineSchedule(defaultRoutine);
  const { clock } = useLiveClock(schedule);
  const { activeTaskName, autoTask, isManual, selectTask, resetToAuto } = useActiveTask();
  const { dayNotes, addNote, deleteNote, getSlotNotes } = useSlotNotes(currentDay);
  const { addXpAndCoins } = useRpgStorage();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const quote = getQuoteOfTheDay(lang);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [selectedSlotForNote, setSelectedSlotForNote] = useState(null);

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
    if (!allDone) fanfareFiredRef.current = false;
  }, [allDone]);

  const handleToggle = (e, id, slot, isChecked) => {
    e.stopPropagation();
    if (!isChecked) { toggleCheck(id); return; }
    playTick();
    addXpAndCoins(50, 10, slot?.task || 'Routine Task');
    toggleCheck(id);
    try {
      window.dispatchEvent(new CustomEvent('mascot-event', {
        detail: { eventType: 'TASK_COMPLETED', taskName: slot?.task || 'Routine Task', userMessage: `Completed: ${slot?.task}` }
      }));
    } catch { /* noop */ }
  };

  const handleTaskClick = (slot) => selectTask(slot.task, { id: slot.id, category: 'routine' });
  const handleOpenEditor = (slotId = null) => { setEditingSlotId(slotId); setIsEditorOpen(true); };

  const activeSlot = schedule.find(s => s.task === activeTaskName) || schedule.find(s => s.task === autoTask) || schedule[0];
  const { label: greetLabel, Icon: GreetIcon } = getGreeting(isAr);

  return (
    <section className="sp2-container" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Top Header Bar ── */}
      <header className="sp2-header">
        <div className="sp2-header-left">
          {/* <h1 className="sp2-title">{isAr ? 'الجدول' : 'Schedule'}</h1> */}
          <div className="sp2-header-btns">
            <button className="sp2-hbtn sp2-hbtn-today">
              <FaCalendarDay size={12} /> {isAr ? 'اليوم' : 'Today'}
            </button>
            <button className="sp2-hbtn" onClick={() => handleOpenEditor(null)}>
              <FaEdit size={12} /> {isAr ? 'تعديل الروتين' : 'Edit Routine'}
            </button>
          </div>
        </div>
        <div className="sp2-header-right">
          <div className="sp2-clock-display">
            <FaClock size={12} style={{ color: 'var(--text-muted)' }} />
            {clock}
          </div>
          <ProgressRing checked={checkedCount} total={schedule.length} />
        </div>
      </header>

      {/* ── Main Schedule Content ── */}
      <div className="sp2-main-col">
        {/* ── Compact Focus Card with Integrated Greeting (Always Dark) ── */}
        {activeSlot && (
          <div className={`sp2-focus-card ${isManual ? 'sp2-focus-manual' : ''}`}>
            <div className="sp2-focus-inner">
              {/* Embedded compact greeting line */}
              <div className="sp2-focus-greeting-row">
                <span className="sp2-focus-greet-text">
                  {isAr ? `${greetLabel}، خليل` : `${greetLabel}, Khalil`}
                  <span className="sp2-greet-icon-badge">
                    <GreetIcon size={14} />
                  </span>
                </span>
                <span className="sp2-focus-greet-sub">
                  {isAr ? 'إليك خطتك لهذا اليوم. حافظ على تركيزك واجعلها ذات قيمة.' : "Here's your plan for today. Stay focused and make it count."}
                </span>
              </div>

              {/* Focus Task & Meta Details */}
              <div className="sp2-focus-main-row">
                <div className="sp2-focus-info">
                  <div className="sp2-focus-header-line">
                    <div className="sp2-rpg-focus-badge">
                      <span className="sp2-rpg-pulse-dot" />
                      <FaBullseye size={10} className="sp2-rpg-focus-icon" />
                      <span className="sp2-rpg-badge-text">{isAr ? 'التركيز الحالي' : 'CURRENT FOCUS'}</span>
                    </div>
                    <div className="sp2-focus-task">{translateTask(activeSlot.task, isAr)}</div>
                  </div>
                  <div className="sp2-focus-meta">
                    <span className="sp2-meta-pill">
                      <FaClock size={10} /> {activeSlot.start} – {activeSlot.end}
                    </span>
                    <span className="sp2-meta-pill">
                      <FaBullseye size={10} /> {durationLabel(activeSlot.start, activeSlot.end, isAr)}
                    </span>
                    <span className="sp2-meta-pill sp2-meta-cat">
                      <MdSelfImprovement size={12} /> {translateCategory(getSlotMeta(activeSlot.task).category, isAr)}
                    </span>
                    {isManual && (
                      <button className="sp2-sync-btn" onClick={resetToAuto}>
                        <FaSyncAlt size={9} /> {isAr ? `مزامنة (${clock})` : `Sync (${clock})`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Scenic Night Campfire SVG Illustration */}
            <svg className="sp2-focus-scene" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Stars */}
              <circle cx="30" cy="14" r="1" fill="#ffffff" opacity="0.8" />
              <circle cx="65" cy="10" r="1.3" fill="#ffffff" opacity="0.9" />
              <circle cx="100" cy="18" r="1" fill="#ffffff" opacity="0.7" />
              <circle cx="135" cy="12" r="1.3" fill="#ffffff" opacity="0.85" />
              <circle cx="170" cy="20" r="1" fill="#ffffff" opacity="0.6" />
              <circle cx="200" cy="12" r="1.2" fill="#ffffff" opacity="0.75" />
              {/* Crescent Moon */}
              <path d="M120 6 A 8 8 0 0 0 128 17 A 10 10 0 1 1 120 6 Z" fill="#fef08a" opacity="0.9" />
              {/* Shoreline water */}
              <path d="M0 68 Q 110 65 220 68 L220 80 L0 80 Z" fill="#02110c" />
              {/* Silhouetted Trees */}
              <path d="M15 68 L22 35 L29 68 Z" fill="#03160e" />
              <path d="M25 68 L30 42 L35 68 Z" fill="#041a11" />
              <path d="M185 68 L192 33 L199 68 Z" fill="#03160e" />
              <path d="M196 68 L202 40 L208 68 Z" fill="#041a11" />
              {/* Campfire glow */}
              <circle cx="110" cy="62" r="18" fill="url(#fire-glow-compact)" />
              <defs>
                <radialGradient id="fire-glow-compact" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                  <stop offset="60%" stopColor="#ef4444" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Firewood */}
              <line x1="103" y1="65" x2="117" y2="61" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
              <line x1="103" y1="61" x2="117" y2="65" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
              {/* Flame */}
              <path d="M107 63 Q 110 53 112 57 Q 114 50 116 59 Q 117 56 115 63 Z" fill="#f59e0b" />
              <path d="M109 63 Q 111 56 112 59 Q 114 55 113 63 Z" fill="#fef08a" />
            </svg>

            <div className="sp2-focus-action-wrap">
              <button className="sp2-focus-timer-btn" onClick={() => navigate('/dashboard')}>
                <FaPlay size={10} />
                {isAr ? 'ابدأ مؤقت التركيز' : 'Start Focus Timer'}
              </button>
            </div>
          </div>
        )}

        {/* ── Today's Timeline Header ── */}
        <div className="sp2-timeline-header">
          {/* <span className="sp2-timeline-title">{isAr ? 'جدول اليوم' : "TODAY'S TIMELINE"}</span> */}
        </div>

        {/* ── Modern 12-Column Grid of Routine Boxes (3 rows total, Sleep on last row) ── */}
        <div className="sp2-timeline-grid">
          {schedule.map((slot, index) => {
            const id = `routine-${currentDay}-${slot.id}`;
            const isSelected = isManual && activeTaskName === slot.task;
            const isCurrentTimeSlot = !isManual ? activeTaskName === slot.task : autoTask === slot.task;
            const isDone = !!checkedItems[id];
            const { Icon: SlotIcon, color, bg } = getSlotMeta(slot.task);
            const slotNotes = getSlotNotes(slot.id);
            const latestNote = slotNotes[0];
            const isLastSlot = index === schedule.length - 1;
            const isSleepSlot = isLastSlot || slot.task.toLowerCase().includes('sleep');
            const spanClass = isSleepSlot ? 'sp2-box-span-12' : 'sp2-box-span-4';
            const shortTitle = getShortTaskTitle(slot.task);

            return (
              <div
                key={slot.id}
                className={`sp2-box-card ${spanClass} ${isSleepSlot ? 'sp2-box-sleep' : ''} ${isSelected ? 'sp2-box-selected' : isCurrentTimeSlot ? 'sp2-box-live' : ''} ${isDone ? 'sp2-box-done' : ''}`}
                onClick={() => handleTaskClick(slot)}
                title={isSelected ? (isAr ? 'انقر للعودة للساعة المباشرة' : 'Click to switch to live clock') : (isAr ? 'انقر لتعيين كهدف تركيز' : 'Click to set as focus')}
              >
                {/* Left: Category Icon + Time, Title & Note Snippet */}
                <div className="sp2-box-left">
                  <span className="sp2-box-icon" style={{ background: bg, color }}>
                    <SlotIcon size={14} />
                  </span>
                  <div className="sp2-box-info">
                    <div className="sp2-box-time">
                      <span className="sp2-box-time-dot" style={{ background: isDone ? '#10b981' : color }} />
                      {slot.start} – {slot.end}
                    </div>
                    <div className="sp2-box-title" title={slot.task}>
                      {translateTask(shortTitle, isAr)}
                    </div>

                    {/* Note Snippet with feeling icon (only shown when a note exists) */}
                    {latestNote && (
                      <div
                        className="sp2-box-note-snippet"
                        onClick={(e) => { e.stopPropagation(); setSelectedSlotForNote(slot); }}
                        title={`"${translateNote(latestNote.text, isAr)}" (${isAr ? 'انقر للعرض أو التعديل' : 'click to view/edit'})`}
                      >
                        {(() => {
                          const feelingObj = latestNote.feeling ? FEELING_MAP[latestNote.feeling] : null;
                          const FIcon = feelingObj ? feelingObj.Icon : FaRegStickyNote;
                          return (
                            <span className="sp2-note-snippet-feeling" style={{ color: feelingObj ? feelingObj.color : '#6366f1' }}>
                              <FIcon size={10} />
                            </span>
                          );
                        })()}
                        <span className="sp2-note-snippet-text">"{translateNote(latestNote.text, isAr)}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Badges, Colorful Note Button & Checkbox */}
                <div className="sp2-box-right">
                  {isCurrentTimeSlot && !isSelected && (
                    <span className="sp2-live-badge">{isAr ? 'الآن مباشر' : 'LIVE NOW'}</span>
                  )}

                  {isSelected && (
                    <span className="sp2-selected-badge">{isAr ? 'محدد' : 'Selected'}</span>
                  )}

                  {/* Colorful Note Action Button on EVERY Box */}
                  <button
                    className={`sp2-box-note-btn ${slotNotes.length > 0 ? 'sp2-box-note-btn-has' : 'sp2-box-note-btn-add'}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedSlotForNote(slot); }}
                    title={slotNotes.length > 0 ? `${slotNotes.length} ${isAr ? 'ملاحظة' : (slotNotes.length > 1 ? 'notes' : 'note')} (${isAr ? 'انقر للعرض أو التعديل' : 'click to view/edit'})` : (isAr ? 'إنشاء ملاحظة لهذه الفترة' : 'Create note for this block')}
                  >
                    {slotNotes.length > 0 ? (
                      <>
                        <FaRegStickyNote size={11} />
                        <span className="sp2-note-badge-count">{slotNotes.length}</span>
                      </>
                    ) : (
                      <span>{isAr ? '+ ملاحظة' : '+ Note'}</span>
                    )}
                  </button>

                  {/* Custom Checkbox */}
                  <label className="sp2-checkbox-label" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={e => handleToggle(e, id, slot, !isDone)}
                    />
                    <span className="sp2-check-box">
                      {isDone && <FaCheck size={8} />}
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Motivational Quote Card ── */}
        <div className="sp2-quote-card">
          <span className="sp2-quote-mark">“</span>
          <div className="sp2-quote-body">
            <p className="sp2-quote-text">
              "{quote?.text || 'Push yourself, because no one else is going to do it for you.'}"
            </p>
            {quote?.author && (
              <span className="sp2-quote-author">— {quote.author}</span>
            )}
          </div>
        </div>
      </div>

      {/* Routine Editor Modal */}
      <RoutineEditorModal
        isOpen={isEditorOpen}
        onClose={() => { setIsEditorOpen(false); setEditingSlotId(null); }}
        initialEditingId={editingSlotId}
        schedule={schedule}
        addSlot={addSlot}
        updateSlot={updateSlot}
        deleteSlot={deleteSlot}
        resetToDefault={resetToDefault}
      />

      {/* Enhanced Routine Slot Note Modal */}
      <SlotNoteModal
        isOpen={!!selectedSlotForNote}
        onClose={() => setSelectedSlotForNote(null)}
        slot={selectedSlotForNote}
        notes={selectedSlotForNote ? getSlotNotes(selectedSlotForNote.id) : []}
        onAddNote={addNote}
        onDeleteNote={deleteNote}
      />
    </section>
  );
}
