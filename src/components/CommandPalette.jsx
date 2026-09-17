import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { FaSearch } from 'react-icons/fa';
import './CommandPalette.css';

// ── Command Registry ─────────────────────────────────────────────────────────
const RAW_COMMANDS = [
  { id: 'nav-dashboard', labelKey: 'palette.goDashboard', defaultLabel: 'Go to Dashboard', icon: '', categoryKey: 'palette.navigate', defaultCategory: 'Navigate', action: 'navigate', target: '/dashboard' },
  { id: 'nav-arena', labelKey: 'palette.goArena', defaultLabel: 'Go to Arena', icon: '', categoryKey: 'palette.navigate', defaultCategory: 'Navigate', action: 'navigate', target: '/' },
  { id: 'nav-schedule', labelKey: 'palette.goSchedule', defaultLabel: 'Go to Schedule', icon: '', categoryKey: 'palette.navigate', defaultCategory: 'Navigate', action: 'navigate', target: '/schedule' },
  { id: 'nav-cosmos', labelKey: 'palette.goCosmos', defaultLabel: 'Go to Cosmos', icon: '', categoryKey: 'palette.navigate', defaultCategory: 'Navigate', action: 'navigate', target: '/cosmos' },
  { id: 'nav-analytics', labelKey: 'palette.goAnalytics', defaultLabel: 'Go to Analytics', icon: '', categoryKey: 'palette.navigate', defaultCategory: 'Navigate', action: 'navigate', target: '/analytics' },
  { id: 'nav-skills', labelKey: 'palette.goSkills', defaultLabel: 'Go to Skill Trees', icon: '', categoryKey: 'palette.navigate', defaultCategory: 'Navigate', action: 'navigate', target: '/skills' },
  { id: 'nav-math', labelKey: 'palette.goMath', defaultLabel: 'Go to Math Roadmap', icon: '', categoryKey: 'palette.navigate', defaultCategory: 'Navigate', action: 'navigate', target: '/math' },
  { id: 'nav-ds', labelKey: 'palette.goDs', defaultLabel: 'Go to Data Science', icon: '', categoryKey: 'palette.navigate', defaultCategory: 'Navigate', action: 'navigate', target: '/data-science' },
  { id: 'nav-english', labelKey: 'palette.goEnglish', defaultLabel: 'Go to English Roadmap', icon: '', categoryKey: 'palette.navigate', defaultCategory: 'Navigate', action: 'navigate', target: '/english' },
  { id: 'nav-notes', labelKey: 'palette.openNotes', defaultLabel: 'Open Notes', icon: '', categoryKey: 'palette.navigate', defaultCategory: 'Navigate', action: 'navigate', target: '/note' },
  { id: 'timer-25', labelKey: 'palette.startPomodoro', defaultLabel: 'Start 25-min Pomodoro', icon: '', categoryKey: 'palette.timer', defaultCategory: 'Timer', action: 'event', target: 'cmd-start-pomodoro-25' },
  { id: 'timer-60', labelKey: 'palette.startHour', defaultLabel: 'Start 1h Focus Session', icon: '', categoryKey: 'palette.timer', defaultCategory: 'Timer', action: 'event', target: 'cmd-start-timer-60' },
  { id: 'timer-stop', labelKey: 'palette.stopTimer', defaultLabel: 'Stop Timer', icon: '', categoryKey: 'palette.timer', defaultCategory: 'Timer', action: 'event', target: 'cmd-stop-timer' },
  { id: 'theme-toggle', labelKey: 'palette.toggleTheme', defaultLabel: 'Toggle Dark/Light', icon: '', categoryKey: 'palette.settings', defaultCategory: 'Settings', action: 'event', target: 'cmd-toggle-theme' },
];

function fuzzyMatch(query, text) {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const commands = useMemo(() => {
    return RAW_COMMANDS.map(c => ({
      ...c,
      label: t(c.labelKey) || c.defaultLabel,
      category: t(c.categoryKey) || c.defaultCategory
    }));
  }, [t]);

  // Open on Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(v => !v);
        setQuery('');
        setSelected(0);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const filtered = commands.filter(c =>
    fuzzyMatch(query, c.label) || fuzzyMatch(query, c.category)
  );

  // Group by category
  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  // Flat list for keyboard nav
  const flat = filtered;

  const execute = useCallback((cmd) => {
    setIsOpen(false);
    setQuery('');
    if (cmd.action === 'navigate') {
      navigate(cmd.target);
    } else if (cmd.action === 'event') {
      window.dispatchEvent(new CustomEvent(cmd.target));
    }
  }, [navigate]);

  useEffect(() => {
    const handler = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(v => Math.min(v + 1, flat.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(v => Math.max(v - 1, 0)); }
      if (e.key === 'Enter' && flat[selected]) execute(flat[selected]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, flat, selected, execute]);

  if (!isOpen) return null;

  return (
    <div className="cp-backdrop" onClick={() => setIsOpen(false)}>
      <div className="cp-panel" onClick={e => e.stopPropagation()}>
        <div className="cp-search-row">
          <span className="cp-search-icon"><FaSearch /></span>
          <input
            ref={inputRef}
            className="cp-input"
            placeholder={t('palette.placeholder')}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
          />
          <span className="cp-kbd">ESC</span>
        </div>

        <div className="cp-results">
          {Object.entries(grouped).map(([cat, cmds]) => (
            <div key={cat}>
              <div className="cp-group-label">{cat}</div>
              {cmds.map(cmd => {
                const globalIdx = flat.indexOf(cmd);
                return (
                  <div
                    key={cmd.id}
                    className={`cp-item ${globalIdx === selected ? 'active' : ''}`}
                    onClick={() => execute(cmd)}
                    onMouseEnter={() => setSelected(globalIdx)}
                  >
                    <span className="cp-item-icon">{cmd.icon}</span>
                    <span className="cp-item-label">{cmd.label}</span>
                    <span className="cp-item-cat">{cmd.category}</span>
                  </div>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#334155', fontSize: '0.85rem' }}>
              {t('palette.noCommands')}
            </div>
          )}
        </div>

        <div className="cp-footer">
          <span className="cp-footer-hint">↑↓ Navigate</span>
          <span className="cp-footer-hint">↵ Execute</span>
          <span className="cp-footer-hint">ESC Close</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#1e3a5f' }}>Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}
