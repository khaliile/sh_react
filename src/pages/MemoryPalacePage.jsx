import React, { useState, useMemo } from 'react';
import {
  FaPlus, FaTrash, FaCheckCircle, FaClock, FaBook,
  FaLightbulb, FaSearch, FaTimes, FaEdit, FaSave
} from 'react-icons/fa';
import { GiGreekTemple, GiScrollQuill, GiCrystalBall, GiAncientSword } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import './MemoryPalacePage.css';

const ROOMS = [
  { id: 'library',      nameEn: 'The Alchemist Library',     nameAr: 'مكتبة الخيميائي',         icon: <GiScrollQuill />,    color: '#f59e0b', bg: 'rgba(245,158,11,0.06)',   border: 'rgba(245,158,11,0.3)' },
  { id: 'observatory',  nameEn: 'Grand Observatory',          nameAr: 'المرصد الكبير',            icon: <GiCrystalBall />,    color: '#818cf8', bg: 'rgba(99,102,241,0.06)',   border: 'rgba(99,102,241,0.3)' },
  { id: 'archive',      nameEn: 'Cyberpunk Archive',          nameAr: 'الأرشيف الرقمي',          icon: <FaBook />,           color: '#22d3ee', bg: 'rgba(6,182,212,0.06)',    border: 'rgba(6,182,212,0.3)'  },
  { id: 'forge',        nameEn: 'Forge of Mastery',           nameAr: 'مصهر الإتقان',            icon: <GiAncientSword />,   color: '#f87171', bg: 'rgba(239,68,68,0.06)',    border: 'rgba(239,68,68,0.3)'  },
];

function getDecayLevel(addedAt) {
  const days = (Date.now() - addedAt) / 86400000;
  if (days < 1)  return { level: 0, label: 'Fresh', labelAr: 'طازج', color: '#4ade80' };
  if (days < 3)  return { level: 1, label: '1-Day Review Due', labelAr: 'مراجعة اليوم', color: '#a3e635' };
  if (days < 7)  return { level: 2, label: 'Fading Fast', labelAr: 'يتلاشى!', color: '#fbbf24' };
  if (days < 14) return { level: 3, label: 'Dusty & Dim', labelAr: 'غبار النسيان', color: '#f97316' };
  return            { level: 4, label: 'FORGOTTEN', labelAr: 'في خطر', color: '#f87171' };
}

function loadAnchors() {
  try { return JSON.parse(localStorage.getItem('memory_palace_anchors') || '{}'); }
  catch { return {}; }
}
function saveAnchors(data) {
  try { localStorage.setItem('memory_palace_anchors', JSON.stringify(data)); } catch {}
}

export default function MemoryPalacePage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const [anchors, setAnchors] = useState(loadAnchors);
  const [activeRoom, setActiveRoom] = useState('library');
  const [newText, setNewText] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [searchQ, setSearchQ] = useState('');

  const room = ROOMS.find(r => r.id === activeRoom);
  const roomAnchors = anchors[activeRoom] || [];

  const filtered = useMemo(() =>
    roomAnchors.filter(a => a.text.toLowerCase().includes(searchQ.toLowerCase())),
    [roomAnchors, searchQ]
  );

  const addAnchor = () => {
    if (!newText.trim()) return;
    const entry = { id: Date.now(), text: newText.trim(), addedAt: Date.now(), reviewed: 0 };
    const updated = { ...anchors, [activeRoom]: [entry, ...(anchors[activeRoom] || [])] };
    setAnchors(updated);
    saveAnchors(updated);
    setNewText('');
  };

  const reviewAnchor = (id) => {
    const updated = {
      ...anchors,
      [activeRoom]: roomAnchors.map(a =>
        a.id === id ? { ...a, addedAt: Date.now(), reviewed: (a.reviewed || 0) + 1 } : a
      )
    };
    setAnchors(updated);
    saveAnchors(updated);
  };

  const deleteAnchor = (id) => {
    const updated = { ...anchors, [activeRoom]: roomAnchors.filter(a => a.id !== id) };
    setAnchors(updated);
    saveAnchors(updated);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    const updated = {
      ...anchors,
      [activeRoom]: roomAnchors.map(a => a.id === id ? { ...a, text: editText.trim() } : a)
    };
    setAnchors(updated);
    saveAnchors(updated);
    setEditId(null);
    setEditText('');
  };

  const totalAnchors = Object.values(anchors).flat().length;
  const urgentCount = Object.values(anchors).flat().filter(a => getDecayLevel(a.addedAt).level >= 3).length;

  return (
    <div className={`memory-palace ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mp-header">
        <h1>
          <GiGreekTemple style={{ display: 'inline', marginRight: isRTL ? 0 : '0.5rem', marginLeft: isRTL ? '0.5rem' : 0, verticalAlign: 'middle' }} />
          {isRTL ? 'قصر الذاكرة' : 'Memory Palace'}
        </h1>
        <p>
          {isRTL
            ? 'أودع مفاتيح المعرفة في غرف ذهنية مكانية — راجعها قبل أن تتلاشى بمنحنى إيبنهاوس'
            : 'Deposit knowledge anchors in spatial rooms — review them before the Ebbinghaus curve erases them'}
        </p>
        <div className="mp-header-stats">
          <span className="mp-stat-badge">
            <FaBook style={{ marginRight: '0.3rem' }} />
            {totalAnchors} {isRTL ? 'مرساة' : 'Anchors'}
          </span>
          {urgentCount > 0 && (
            <span className="mp-stat-badge urgent">
              <FaClock style={{ marginRight: '0.3rem' }} />
              {urgentCount} {isRTL ? 'تحتاج مراجعة عاجلة!' : 'Need Review Now!'}
            </span>
          )}
        </div>
      </div>

      {/* Room Selector */}
      <div className="mp-rooms-row">
        {ROOMS.map(r => (
          <button
            key={r.id}
            className={`mp-room-btn ${activeRoom === r.id ? 'active' : ''}`}
            style={{ '--room-color': r.color }}
            onClick={() => setActiveRoom(r.id)}
          >
            <span className="mp-room-icon" style={{ color: r.color }}>{r.icon}</span>
            <span className="mp-room-name">{isRTL ? r.nameAr : r.nameEn}</span>
            <span className="mp-room-count" style={{ background: r.color }}>{(anchors[r.id] || []).length}</span>
          </button>
        ))}
      </div>

      {/* Active Room Panel */}
      <div className="mp-room-panel" style={{ borderColor: room.border }}>
        <div className="mp-room-panel-header" style={{ background: room.bg }}>
          <span style={{ color: room.color, fontSize: '1.5rem' }}>{room.icon}</span>
          <div>
            <div className="mp-room-panel-title" style={{ color: room.color }}>
              {isRTL ? room.nameAr : room.nameEn}
            </div>
            <div className="mp-room-panel-sub">
              {isRTL ? 'المكان الذهني المرتبط بهذه المعرفة' : 'The mental space associated with this knowledge'}
            </div>
          </div>
        </div>

        <div className="mp-search-row">
          <FaSearch className="mp-search-icon" />
          <input
            className="mp-search-input"
            placeholder={isRTL ? 'ابحث في مراساك...' : 'Search anchors...'}
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          {searchQ && <FaTimes className="mp-search-clear" onClick={() => setSearchQ('')} />}
        </div>

        <div className="mp-add-row">
          <input
            className="mp-add-input"
            placeholder={isRTL ? 'اكتب مرساةً معرفية — مفهوم، معادلة، قاعدة...' : 'Drop a knowledge anchor — concept, formula, rule...'}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addAnchor()}
          />
          <button className="mp-add-btn" onClick={addAnchor} style={{ background: room.color }}>
            <FaPlus />
          </button>
        </div>

        <div className="mp-anchors-list">
          {filtered.length === 0 ? (
            <div className="mp-empty">
              <GiGreekTemple style={{ fontSize: '3rem', color: '#475569', marginBottom: '0.75rem' }} />
              <p>{isRTL ? 'الغرفة فارغة — أودع أول مرساة معرفية لك' : 'Room is empty — drop your first knowledge anchor'}</p>
            </div>
          ) : (
            filtered.map(anchor => {
              const decay = getDecayLevel(anchor.addedAt);
              return (
                <div key={anchor.id} className={`mp-anchor-card decay-${decay.level}`}>
                  <div className="mp-anchor-decay-bar" style={{ background: decay.color }} />
                  <div className="mp-anchor-body">
                    {editId === anchor.id ? (
                      <div className="mp-edit-row">
                        <input
                          className="mp-edit-input"
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit(anchor.id)}
                          autoFocus
                        />
                        <button className="mp-icon-btn save" onClick={() => saveEdit(anchor.id)}><FaSave /></button>
                        <button className="mp-icon-btn cancel" onClick={() => setEditId(null)}><FaTimes /></button>
                      </div>
                    ) : (
                      <p className="mp-anchor-text">{anchor.text}</p>
                    )}
                    <div className="mp-anchor-meta">
                      <span className="mp-decay-badge" style={{ color: decay.color }}>
                        <FaClock style={{ marginRight: '0.25rem' }} />
                        {isRTL ? decay.labelAr : decay.label}
                      </span>
                      <span className="mp-reviews">
                        {anchor.reviewed || 0} {isRTL ? 'مراجعة' : 'reviews'}
                      </span>
                    </div>
                  </div>
                  <div className="mp-anchor-actions">
                    <button className="mp-icon-btn review" onClick={() => reviewAnchor(anchor.id)} title={isRTL ? 'راجعت هذا!' : 'Reviewed!'}>
                      <FaCheckCircle />
                    </button>
                    <button className="mp-icon-btn edit" onClick={() => { setEditId(anchor.id); setEditText(anchor.text); }}>
                      <FaEdit />
                    </button>
                    <button className="mp-icon-btn delete" onClick={() => deleteAnchor(anchor.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Decay Legend */}
      <div className="mp-legend">
        <div className="mp-legend-title">
          <FaLightbulb style={{ marginRight: '0.4rem', color: '#fbbf24' }} />
          {isRTL ? 'منحنى النسيان — إيبنهاوس' : 'Ebbinghaus Forgetting Curve'}
        </div>
        <div className="mp-legend-items">
          {[
            { color: '#4ade80', label: isRTL ? '< يوم — طازج' : '< 1 day — Fresh' },
            { color: '#a3e635', label: isRTL ? '1-3 أيام — راجع قريباً' : '1-3 days — Review Soon' },
            { color: '#fbbf24', label: isRTL ? '3-7 أيام — يتلاشى' : '3-7 days — Fading' },
            { color: '#f97316', label: isRTL ? '7-14 يوم — في خطر' : '7-14 days — Danger' },
            { color: '#f87171', label: isRTL ? '14+ يوم — منسي' : '14+ days — Forgotten' },
          ].map(item => (
            <div key={item.color} className="mp-legend-item">
              <div className="mp-legend-dot" style={{ background: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
