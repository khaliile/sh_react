import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaBars, FaTimes, FaSun, FaMoon, FaChevronDown, FaChevronRight,
  FaCalculator, FaDatabase, FaBook, FaBrain, FaRobot, FaNetworkWired, FaProjectDiagram,
  FaChartLine, FaCalendarAlt, FaChartPie, FaCompass, FaSearch
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import AnimeFaceAvatar from './AnimeFaceAvatar';
import ShopModal from './ShopModal';
import { loadRPGStats, getXPProgress } from '../utils/rpgSystem';
import { useInventoryStorage, ANIME_CHARACTERS } from '../hooks/useInventoryStorage';
import { getCharacterDisplayName } from '../utils/characterTranslations';

const Navbar = React.memo(function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  const [isSkillTracksOpen, setIsSkillTracksOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopInitialTab, setShopInitialTab] = useState('avatars');
  const [rpgStats, setRpgStats] = useState(null);
  const dropdownRef = useRef(null);
  const dashboardMenuRef = useRef(null);
  const skillTracksRef = useRef(null);
  const lastStatsUpdateRef = useRef(0);
  
  const { t, lang, toggleLang } = useLanguage();
  const isRTL = lang === 'ar';

  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'default');
  const loc = useLocation();
  
  const { equippedAvatar } = useInventoryStorage();
  const activeChar = ANIME_CHARACTERS.find(c => c.id === equippedAvatar) || ANIME_CHARACTERS[0];
  const charDisplayName = getCharacterDisplayName(activeChar, isRTL);

  const openShop = (tab = 'avatars') => {
    setShopInitialTab(tab);
    setIsShopOpen(true);
  };

  useEffect(() => {
    const handleOpenShop = (e) => {
      openShop(e?.detail?.tab || 'avatars');
    };
    window.addEventListener('open-shop', handleOpenShop);
    window.addEventListener('open-shop-modal', handleOpenShop);
    return () => {
      window.removeEventListener('open-shop', handleOpenShop);
      window.removeEventListener('open-shop-modal', handleOpenShop);
    };
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const activeTheme = localStorage.getItem('app_theme') || theme || 'default';
      document.documentElement.setAttribute('data-theme', activeTheme);
      document.body.setAttribute('data-theme', activeTheme);
      const root = document.documentElement;
      root.style.setProperty('--force-theme-update', Date.now().toString());
    };
    applyTheme();
  }, [theme, loc.pathname]);

  useEffect(() => {
    const updateStats = () => {
      const stats = loadRPGStats(equippedAvatar);
      setRpgStats(stats);
      lastStatsUpdateRef.current = Date.now();
    };
    updateStats();
    const handleXPGain = () => {
      const now = Date.now();
      if (now - lastStatsUpdateRef.current < 200) return;
      setTimeout(updateStats, 0);
    };
    window.addEventListener('rpg-xp-gained', handleXPGain);
    return () => window.removeEventListener('rpg-xp-gained', handleXPGain);
  }, [equippedAvatar]);

  useEffect(() => {
    setIsOpen(false);
    setIsSubjectsOpen(false);
    setIsDashboardMenuOpen(false);
    setIsSkillTracksOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsSubjectsOpen(false);
      if (dashboardMenuRef.current && !dashboardMenuRef.current.contains(e.target)) setIsDashboardMenuOpen(false);
      if (skillTracksRef.current && !skillTracksRef.current.contains(e.target)) setIsSkillTracksOpen(false);
    };
    if (isSubjectsOpen || isDashboardMenuOpen || isSkillTracksOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSubjectsOpen, isDashboardMenuOpen, isSkillTracksOpen]);

  const toggleSkillTracksMenu = () => {
    setIsSkillTracksOpen(prev => {
      if (!prev) {
        setIsDashboardMenuOpen(false);
        setIsSubjectsOpen(false);
      }
      return !prev;
    });
  };

  const toggleDashboardMenu = () => {
    setIsDashboardMenuOpen(prev => {
      if (!prev) {
        setIsSkillTracksOpen(false);
        setIsSubjectsOpen(false);
      }
      return !prev;
    });
  };

  const toggleSubjectsMenu = () => {
    setIsSubjectsOpen(prev => {
      if (!prev) {
        setIsSkillTracksOpen(false);
        setIsDashboardMenuOpen(false);
      }
      return !prev;
    });
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? (localStorage.getItem('app_rpg_theme') || 'default') : 'light';
      localStorage.setItem('app_theme', next);
      document.documentElement.setAttribute('data-theme', next);
      document.body.setAttribute('data-theme', next);
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: next } }));
      return next;
    });
  };

  useEffect(() => {
    const handleThemeEvent = (e) => {
      const next = e?.detail?.theme || localStorage.getItem('app_theme') || 'default';
      setTheme(next);
      document.documentElement.setAttribute('data-theme', next);
      document.body.setAttribute('data-theme', next);
    };
    window.addEventListener('theme-changed', handleThemeEvent);
    window.addEventListener('storage', handleThemeEvent);
    return () => {
      window.removeEventListener('theme-changed', handleThemeEvent);
      window.removeEventListener('storage', handleThemeEvent);
    };
  }, []);

  const mainLinks = [{ path: '/', label: t('nav.arena') }];

  const dashboardLinks = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: <FaChartLine style={{ color: '#38bdf8' }} />, desc: 'Core timers, targets & heatmap' },
    { path: '/schedule', label: t('nav.schedule'), icon: <FaCalendarAlt style={{ color: '#f59e0b' }} />, desc: 'Daily routine & time blocking' },
    { path: '/analytics', label: t('nav.analytics'), icon: <FaChartPie style={{ color: '#10b981' }} />, desc: 'Predictive fatigue & DNA forensics' },
    { path: '/cosmos', label: t('nav.cosmos'), icon: <FaCompass style={{ color: '#a855f7' }} />, desc: 'Astral aura & energy scores' },
  ];

  const nestedSkillTracks = [
    {
      id: 'foundations',
      label: t('nav.foundations'),
      category: true,
      color: '#38bdf8',
      children: [
        { path: '/skills/english', label: t('nav.englishSkills'), icon: <FaBook style={{ color: '#f59e0b' }} />, desc: 'Communication & Vocabulary' },
        { path: '/skills/math', label: t('nav.mathSkills'), icon: <FaCalculator style={{ color: '#06b6d4' }} />, desc: 'Core Mathematical Concepts' },
      ]
    },
    {
      id: 'data-infrastructure',
      label: t('nav.dataInfra'),
      category: true,
      color: '#10b981',
      children: [
        { path: '/skills/data-science', label: t('nav.dsSkills'), icon: <FaDatabase style={{ color: '#3b82f6' }} />, desc: 'Analytics & Statistics' },
        { path: '/skills/data-structures', label: t('nav.dataStructuresSkills') || 'Data Structures', icon: <FaProjectDiagram style={{ color: '#8b5cf6' }} />, desc: 'Algorithms & Trees' },
        { path: '/skills/internet', label: t('nav.networking'), icon: <FaNetworkWired style={{ color: '#10b981' }} />, desc: 'Network Infrastructure' },
      ]
    },
    {
      id: 'ai-summit',
      label: t('nav.aiSummit'),
      category: true,
      color: '#a855f7',
      children: [
        { path: '/skills/machine-learning', label: t('nav.machineLearning'), icon: <FaRobot style={{ color: '#ec4899' }} />, desc: 'ML Fundamentals' },
        { path: '/skills/deep-learning', label: t('nav.deepLearning'), icon: <FaBrain style={{ color: '#a855f7' }} />, desc: 'Neural Networks' },
        { path: '/skills/ai', label: t('nav.ai'), icon: <FaRobot style={{ color: '#f59e0b' }} />, desc: 'Local LLMs & Agents' },
      ]
    },
  ];

  const allSkillPaths = nestedSkillTracks.flatMap(cat => cat.children?.map(child => child.path) || []);
  const subjectLinks = [
    { path: '/math', label: t('nav.math'), icon: <FaCalculator style={{ color: '#38bdf8' }} />, desc: 'Calculus, Linear Algebra & Probabilities' },
    { path: '/data-science', label: t('nav.dataScience'), icon: <FaDatabase style={{ color: '#ec4899' }} />, desc: 'Machine Learning, Python & Statistics' },
    { path: '/english', label: t('nav.english'), icon: <FaBook style={{ color: '#f59e0b' }} />, desc: 'Fluency, Active Recall & Vocabulary' },
    { path: '/note', label: t('nav.notes'), icon: <FaBook style={{ color: '#14d431ff' }} />, desc: 'Notes' },
  ];

  const isSubjectActive = subjectLinks.some(s => s.path === loc.pathname);
  const isDashboardActive = dashboardLinks.some(d => d.path === loc.pathname);
  const isSkillTrackActive = !isSubjectActive && !isDashboardActive && allSkillPaths.some(path => loc.pathname.includes(path.split('/').pop()));

  const xpProgress = rpgStats ? getXPProgress(rpgStats.xp, rpgStats.level) : { current: 0, required: 100, percentage: 0 };

  return (
    <header className="navbar-wrapper">
      <nav className={`navbar ${isRTL ? 'rtl' : ''}`}>
        
        {/* ── Left Floating Island: Avatar Profile Card ── */}
        <div className="nav-left-zone">
          <button
            onClick={() => openShop('avatars')}
            className="nav-avatar-card"
            title={`${charDisplayName} · ${isRTL ? 'المستوى' : 'Level'} ${rpgStats?.level || 1} (${xpProgress.current}/${xpProgress.required} XP)`}
            style={{ '--char-color': activeChar.seriesColor || '#f59e0b' }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div className="nav-avatar-ring">
                <AnimeFaceAvatar
                  id={equippedAvatar || 'luffy'}
                  size={34}
                  borderColor={activeChar.seriesColor || '#f59e0b'}
                  glow={true}
                />
              </div>
            </div>

            {rpgStats && (
              <div className="nav-avatar-info">
                <div className="nav-avatar-name-row">
                  <span className="nav-char-name">{charDisplayName}</span>
                  <span className="nav-lv-pill">LV {rpgStats.level}</span>
                </div>
                <div className="nav-xp-track">
                  <div
                    className="nav-xp-fill"
                    style={{
                      width: `${Math.min(100, Math.max(5, xpProgress.percentage))}%`,
                      background: `linear-gradient(90deg, ${activeChar.seriesColor || '#f59e0b'}, #eab308)`
                    }}
                  />
                </div>
              </div>
            )}
          </button>
        </div>

        {/* ── Right Floating Island: Nav Links & Dropdowns ── */}
        <div className="nav-right-zone">
          <button
            className="nav-mobile-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div className={`nav-links-island ${isOpen ? 'mobile-open' : ''}`}>
            {mainLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-island-link ${loc.pathname === link.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Consolidated Skill Trees Multi-Track Cascading Dropdown */}
            <div className="nav-dropdown-wrapper" ref={skillTracksRef}>
              <button
                className={`nav-island-link dropdown-trigger ${isSkillTrackActive ? 'active' : ''} ${isSkillTracksOpen ? 'dropdown-open' : ''}`}
                onClick={toggleSkillTracksMenu}
                aria-haspopup="true"
                aria-expanded={isSkillTracksOpen}
              >
                <span>{t('nav.skills')}</span>
                <FaChevronDown className={`dropdown-arrow ${isSkillTracksOpen ? 'rotate' : ''}`} />
              </button>

              {isSkillTracksOpen && (
                <div className="nav-dropdown-menu nested-dropdown fade-in">
                  <div className="dropdown-menu-header">{t('skills.title')}</div>
                  {nestedSkillTracks.map((category) => (
                    <div key={category.id} className="nested-category-wrapper">
                      <div className="nested-category-item" style={{ '--category-color': category.color }}>
                        <span className="nested-category-label">
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: category.color, boxShadow: `0 0 8px ${category.color}`, display: 'inline-block' }} />
                          {category.label}
                        </span>
                        <FaChevronRight className="nested-category-arrow" />
                      </div>
                      {category.children && (
                        <div className="nested-submenu">
                          <div className="dropdown-menu-header" style={{ color: category.color, borderColor: `${category.color}40` }}>{category.label}</div>
                          {category.children.map(track => {
                            const isTrackActive = loc.pathname === track.path;
                            return (
                              <Link
                                key={track.path}
                                to={track.path}
                                className={`nested-submenu-item ${isTrackActive ? 'active-item' : ''}`}
                                onClick={() => {
                                  setIsSkillTracksOpen(false);
                                  setIsOpen(false);
                                }}
                              >
                                <div className="dropdown-item-icon">{track.icon}</div>
                                <div className="dropdown-item-content">
                                  <span className="dropdown-item-label">{track.label}</span>
                                  <span className="dropdown-item-desc">{track.desc}</span>
                                </div>
                                {isTrackActive && <span className="active-dot" />}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Consolidated Dashboard & Analytics Dropdown */}
            <div className="nav-dropdown-wrapper" ref={dashboardMenuRef}>
              <button
                className={`nav-island-link dropdown-trigger ${isDashboardActive ? 'active' : ''} ${isDashboardMenuOpen ? 'dropdown-open' : ''}`}
                onClick={toggleDashboardMenu}
                aria-haspopup="true"
                aria-expanded={isDashboardMenuOpen}
              >
                <span>{t('nav.dashboard')}</span>
                <FaChevronDown className={`dropdown-arrow ${isDashboardMenuOpen ? 'rotate' : ''}`} />
              </button>

              {isDashboardMenuOpen && (
                <div className="nav-dropdown-menu fade-in">
                  <div className="dropdown-menu-header">{t('dashboard.title')}</div>
                  {dashboardLinks.map(dash => {
                    const isItemActive = loc.pathname === dash.path;
                    return (
                      <Link
                        key={dash.path}
                        to={dash.path}
                        className={`dropdown-menu-item ${isItemActive ? 'active-item' : ''}`}
                        onClick={() => {
                          setIsDashboardMenuOpen(false);
                          setIsOpen(false);
                        }}
                      >
                        <div className="dropdown-item-icon">{dash.icon}</div>
                        <div className="dropdown-item-text">
                          <span className="dropdown-item-title">{dash.label}</span>
                          <span className="dropdown-item-desc">{dash.desc}</span>
                        </div>
                        {isItemActive && <span className="active-dot" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Consolidated Subjects Dropdown */}
            <div className="nav-dropdown-wrapper" ref={dropdownRef}>
              <button
                className={`nav-island-link dropdown-trigger ${isSubjectActive ? 'active' : ''} ${isSubjectsOpen ? 'dropdown-open' : ''}`}
                onClick={toggleSubjectsMenu}
                aria-haspopup="true"
                aria-expanded={isSubjectsOpen}
              >
                <span>{t('nav.subjects')}</span>
                <FaChevronDown className={`dropdown-arrow ${isSubjectsOpen ? 'rotate' : ''}`} />
              </button>

              {isSubjectsOpen && (
                <div className="nav-dropdown-menu fade-in">
                  <div className="dropdown-menu-header">{t('nav.studyCurriculums')}</div>
                  {subjectLinks.map(sub => {
                    const isSubActive = loc.pathname === sub.path;
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={`dropdown-menu-item ${isSubActive ? 'active-item' : ''}`}
                        onClick={() => {
                          setIsSubjectsOpen(false);
                          setIsOpen(false);
                        }}
                      >
                        <div className="dropdown-item-icon">{sub.icon}</div>
                        <div className="dropdown-item-text">
                          <span className="dropdown-item-title">{sub.label}</span>
                          <span className="dropdown-item-desc">{sub.desc}</span>
                        </div>
                        {isSubActive && <span className="active-dot" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              className="nav-island-link nav-cmd-btn"
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              title="Command Palette (Ctrl+K)"
            >
              <FaSearch style={{ fontSize: '0.8rem', opacity: 0.8 }} />
              <span className="nav-cmd-kbd">{t('nav.cmdPlaceholder')}</span>
            </button>
          </div>

          <button
            className={`nav-lang-toggle ${lang === 'ar' ? 'lang-ar' : 'lang-en'}`}
            onClick={toggleLang}
            title={lang === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
            aria-label="Toggle language"
          >
            {lang === 'en' ? 'ع' : 'EN'}
          </button>

          <button
            className="nav-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </nav>
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} initialTab={shopInitialTab} />
    </header>
  );
});

export default Navbar;
