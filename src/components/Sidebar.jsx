import React, { useState, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaSun, FaMoon, FaChevronDown,
  FaCalculator, FaDatabase, FaBook, FaBrain, FaRobot, FaNetworkWired, FaProjectDiagram,
  FaChartLine, FaCalendarAlt, FaChartPie, FaCompass, FaGamepad, FaShoppingBag,
  FaThLarge, FaGraduationCap, FaGlobe, FaFlask, FaWater, FaScroll,
  FaSnowflake, FaEnvelope, FaAtom, FaMicrochip, FaBalanceScale, FaMosque
} from 'react-icons/fa';
import { GiDna1, GiPirateFlag, GiPortal, GiCrystalBall, GiRadioTower, GiGalaxy, GiGreekTemple, GiCauldron, GiBlackBook, GiBloodySword, GiTowerFlag, GiAncientRuins } from 'react-icons/gi';
import { MdFlipToFront } from 'react-icons/md';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppUI } from '../contexts/AppUIContext';
import AnimeFaceAvatar from './AnimeFaceAvatar';
import ShopModal from './ShopModal';
import { ANIME_CHARACTERS } from '../hooks/useInventoryStorage';
import { getCharacterDisplayName } from '../utils/characterTranslations';
import { getXPProgress } from '../utils/rpgSystem';
import './Sidebar.css';

const Sidebar = React.memo(function Sidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = useCallback((sectionKey) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedSection(sectionKey);
    } else {
      setExpandedSection(prev => prev === sectionKey ? null : sectionKey);
    }
  }, [isCollapsed, setIsCollapsed]);

  const { t, lang, toggleLang } = useLanguage();
  const isRTL = lang === 'ar';
  const loc = useLocation();

  // ── All shared UI state comes from AppUIContext ──────────────────────────
  const {
    theme,
    toggleTheme,
    rpgStats,
    equippedAvatar,
    isShopOpen,
    shopInitialTab,
    openShop,
    closeShop,
  } = useAppUI();

  const activeChar = ANIME_CHARACTERS.find(c => c.id === equippedAvatar) || ANIME_CHARACTERS[0];
  const charDisplayName = getCharacterDisplayName(activeChar, isRTL);

  const xpProgress = rpgStats ? getXPProgress(rpgStats.xp, rpgStats.level) : { current: 0, required: 100, percentage: 0 };
  const xpPct = Math.min(100, Math.max(0, xpProgress?.percentage || 0));
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius; // ~163.36
  const strokeDashoffset = ringCircumference - (xpPct / 100) * ringCircumference;

  const skillTracks = useMemo(() => [
    { path: '/skills/data-science', label: t('nav.dsSkills'), icon: <FaDatabase /> },
    { path: '/skills/data-structures', label: t('nav.dataStructuresSkills') || 'Data Structures', icon: <FaProjectDiagram /> },
    { path: '/skills/machine-learning', label: t('nav.machineLearning'), icon: <FaRobot /> },
    { path: '/skills/deep-learning', label: t('nav.deepLearning'), icon: <FaBrain /> },
    { path: '/skills/ai', label: t('nav.ai'), icon: <FaRobot /> },
    { path: '/skills/internet', label: t('nav.networking'), icon: <FaNetworkWired /> },
    { path: '/skills/english', label: t('nav.englishSkills'), icon: <FaBook /> },
    { path: '/skills/math', label: t('nav.mathSkills'), icon: <FaCalculator /> },
  ], [t]);

  const productivityLinks = useMemo(() => [
    { path: '/sanctum', label: t('nav.sanctum') || (isRTL ? 'الملاذ المحظور' : 'The Sanctum'), icon: <FaFlask /> },
    { path: '/dashboard', label: t('nav.dashboard'), icon: <FaChartLine /> },
    { path: '/schedule', label: t('nav.schedule'), icon: <FaCalendarAlt /> },
    { path: '/salat', label: isRTL ? 'متابعة الصلاة' : 'Salat Tracker', icon: <FaMosque /> },
    { path: '/analytics', label: t('nav.analytics'), icon: <FaChartPie /> },
    { path: '/cosmos', label: t('nav.cosmos'), icon: <FaCompass /> },
  ], [t, isRTL]);

  const mindLabLinks = useMemo(() => [
    { path: '/dna-lab',      label: isRTL ? 'مختبر الحمض النووي' : 'DNA Lab',            icon: <GiDna1 /> },
    { path: '/flow-river',   label: isRTL ? 'نهر التدفق' : 'Flow River',                 icon: <FaWater /> },
    { path: '/ego-mirror',   label: isRTL ? 'مرآة الأنا' : 'Ego Mirror',                 icon: <MdFlipToFront /> },
    { path: '/prophecy',     label: isRTL ? 'لوحة النبوءة' : 'Prophecy Board',           icon: <FaScroll /> },
    { path: '/bounty-hunt',  label: isRTL ? 'صيد المكافآت' : 'Bounty Hunt',              icon: <GiPirateFlag /> },
    { path: '/parallel-me',  label: isRTL ? 'أنا الموازي' : 'Parallel Me',               icon: <GiPortal /> },
    { path: '/cryo-chamber', label: isRTL ? 'غرفة التجميد' : 'Cryo Chamber',             icon: <FaSnowflake /> },
    { path: '/oracle',       label: isRTL ? 'العراف الذكي' : 'Oracle',                   icon: <GiCrystalBall /> },
    { path: '/signal-tower', label: isRTL ? 'برج الإشارة' : 'Signal Tower',             icon: <GiRadioTower /> },
    { path: '/future-letter',label: isRTL ? 'رسالة لمستقبلي' : 'Letter to Future Me',   icon: <FaEnvelope /> },
    { path: '/multiverse',   label: isRTL ? 'أكوان الدراسة المتعددة' : 'Study Multiverse', icon: <GiGalaxy /> },
  ], [isRTL]);

  const curriculumLinks = useMemo(() => [
    { path: '/data-science', label: t('nav.dataScience'), icon: <FaDatabase /> },
    { path: '/math', label: t('nav.math'), icon: <FaCalculator /> },
    { path: '/english', label: t('nav.english'), icon: <FaBook /> },
    { path: '/note', label: t('nav.notes'), icon: <FaGraduationCap /> },
  ], [t]);

  const vaultLinks = useMemo(() => [
    { path: '/feynman-tribunal', label: isRTL ? 'محكمة فاينمان' : 'Feynman Tribunal',    icon: <FaBalanceScale /> },
    { path: '/memory-palace',    label: isRTL ? 'قصر الذاكرة' : 'Memory Palace',          icon: <GiGreekTemple /> },
    { path: '/chrono-alchemist', label: isRTL ? 'الخيميائي الزمني' : 'Chrono-Alchemist',   icon: <GiCauldron /> },
    { path: '/black-box',        label: isRTL ? 'الصندوق الأسود' : 'Black Box',           icon: <GiBlackBook /> },
    { path: '/blood-pact',       label: isRTL ? 'ميثاق الدم والخزينة' : 'Blood Pact & Vault', icon: <GiBloodySword /> },
    { path: '/tower-of-babel',   label: isRTL ? 'برج بابل' : 'Tower of Babel',            icon: <GiTowerFlag /> },
  ], [isRTL]);

  const isArenaActive = loc.pathname === '/' || loc.pathname === '/arena';
  const isSkillActive = loc.pathname.startsWith('/skills') || loc.pathname.startsWith('/skill-tree');
  const isProductivityActive = productivityLinks.some(l => loc.pathname === l.path);
  const isCurriculumActive = curriculumLinks.some(l => loc.pathname === l.path || loc.pathname.startsWith(l.path + '/'));
  const isMindLabActive = mindLabLinks.some(l => loc.pathname === l.path);
  const isVaultActive = vaultLinks.some(l => loc.pathname === l.path);

  const closeMobile = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''} ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* ── RPG Avatar Profile Card — Clean Minimal Design ── */}
        <div
          className="sidebar-profile-card sidebar-profile-card--top"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={`${charDisplayName} · LV ${rpgStats?.level || 1} · ${Math.round(xpPct)}% XP — ${isCollapsed ? (isRTL ? 'انقر للتوسيع' : 'Expand') : (isRTL ? 'انقر للطي' : 'Collapse')}`}
          style={{ '--char-color': activeChar.seriesColor || '#f59e0b', cursor: 'pointer', flexDirection: 'column', alignItems: 'center', padding: isCollapsed ? '10px 0 12px' : '14px 12px 10px', gap: '8px' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsCollapsed(!isCollapsed); } }}
        >
          {/* Circular Progress Ring wrapping Avatar */}
          <div className="sidebar-avatar-ring-container">
            <svg
              className="sidebar-avatar-ring-svg"
              width={isCollapsed ? 46 : 58}
              height={isCollapsed ? 46 : 58}
              viewBox="0 0 60 60"
            >
              <circle className="sidebar-ring-track" cx="30" cy="30" r={ringRadius} />
              <circle
                className="sidebar-ring-fill"
                cx="30"
                cy="30"
                r={ringRadius}
                style={{ strokeDasharray: ringCircumference, strokeDashoffset: strokeDashoffset }}
              />
            </svg>

            {/* Avatar inside the ring */}
            <div className="sidebar-avatar-wrapper-inner">
              <AnimeFaceAvatar
                id={equippedAvatar || 'luffy'}
                size={isCollapsed ? 36 : 46}
                showBorder={false}
                glow={false}
              />
            </div>

            {/* Level Badge */}
            <span className="sidebar-profile-lv">LV {rpgStats?.level || 1}</span>
          </div>

          {/* XP progress bar — only when expanded, no name text */}
          {!isCollapsed && (
            <div className="sidebar-xp-bar-row">
              <div className="sidebar-xp-bar-track">
                <div
                  className="sidebar-xp-bar-fill"
                  style={{ width: `${xpPct}%`, background: activeChar.seriesColor || '#f59e0b' }}
                />
              </div>
              <span className="sidebar-xp-bar-label">{Math.round(xpPct)}%</span>
            </div>
          )}
        </div>

        {/* ── Scrollable Navigation Items ── */}
        <div className="sidebar-nav-scroll">
          
          {/* Main / Arena */}
          <Link
            to="/"
            className={`sidebar-nav-item ${isArenaActive ? 'active' : ''}`}
            onClick={closeMobile}
            title={t('nav.arena')}
          >
            <span className="sidebar-nav-icon"><FaGamepad /></span>
            <span className="sidebar-nav-label">{t('nav.arena')}</span>
          </Link>

          {/* Skill Trees Section */}
          <button
            type="button"
            className={`sidebar-nav-item ${isSkillActive ? 'active' : ''}`}
            onClick={() => toggleSection('skills')}
            title={t('nav.skills')}
          >
            <span className="sidebar-nav-icon"><FaProjectDiagram /></span>
            <span className="sidebar-nav-label">{t('nav.skills')}</span>
            {!isCollapsed && (
              <FaChevronDown className={`sidebar-chevron ${expandedSection === 'skills' ? 'open' : ''}`} />
            )}
          </button>

          {!isCollapsed && expandedSection === 'skills' && (
            <div className="sidebar-submenu">
              {skillTracks.map(track => {
                const isTrackActive = loc.pathname === track.path;
                return (
                  <Link
                    key={track.path}
                    to={track.path}
                    className={`sidebar-submenu-item ${isTrackActive ? 'active' : ''}`}
                    onClick={closeMobile}
                  >
                    <span>{track.icon}</span>
                    <span className="sidebar-nav-label">{track.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Productivity & Analytics Section */}
          <button
            type="button"
            className={`sidebar-nav-item ${isProductivityActive ? 'active' : ''}`}
            onClick={() => toggleSection('productivity')}
            title={t('nav.dashboard')}
          >
            <span className="sidebar-nav-icon"><FaThLarge /></span>
            <span className="sidebar-nav-label">{t('nav.dashboard')}</span>
            {!isCollapsed && (
              <FaChevronDown className={`sidebar-chevron ${expandedSection === 'productivity' ? 'open' : ''}`} />
            )}
          </button>

          {!isCollapsed && expandedSection === 'productivity' && (
            <div className="sidebar-submenu">
              {productivityLinks.map(dash => {
                const isDashActive = loc.pathname === dash.path;
                return (
                  <Link
                    key={dash.path}
                    to={dash.path}
                    className={`sidebar-submenu-item ${isDashActive ? 'active' : ''}`}
                    onClick={closeMobile}
                  >
                    <span>{dash.icon}</span>
                    <span className="sidebar-nav-label">{dash.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Roadmaps & Curriculums Section */}
          <button
            type="button"
            className={`sidebar-nav-item ${isCurriculumActive ? 'active' : ''}`}
            onClick={() => toggleSection('curriculums')}
            title={t('nav.subjects')}
          >
            <span className="sidebar-nav-icon"><FaBook /></span>
            <span className="sidebar-nav-label">{t('nav.subjects')}</span>
            {!isCollapsed && (
              <FaChevronDown className={`sidebar-chevron ${expandedSection === 'curriculums' ? 'open' : ''}`} />
            )}
          </button>

          {!isCollapsed && expandedSection === 'curriculums' && (
            <div className="sidebar-submenu">
              {curriculumLinks.map(cur => {
                const isCurActive = loc.pathname === cur.path;
                return (
                  <Link
                    key={cur.path}
                    to={cur.path}
                    className={`sidebar-submenu-item ${isCurActive ? 'active' : ''}`}
                    onClick={closeMobile}
                  >
                    <span>{cur.icon}</span>
                    <span className="sidebar-nav-label">{cur.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── Mind Lab Section ── */}
          <button
            type="button"
            className={`sidebar-nav-item ${isMindLabActive ? 'active' : ''}`}
            onClick={() => toggleSection('mindLab')}
            title={isRTL ? 'مختبر العقل' : 'Mind Lab'}
          >
            <span className="sidebar-nav-icon"><FaAtom /></span>
            <span className="sidebar-nav-label">{isRTL ? 'مختبر العقل' : 'Mind Lab'}</span>
            {!isCollapsed && (
              <FaChevronDown className={`sidebar-chevron ${expandedSection === 'mindLab' ? 'open' : ''}`} />
            )}
          </button>

          {!isCollapsed && expandedSection === 'mindLab' && (
            <div className="sidebar-submenu">
              {mindLabLinks.map(link => {
                const isLinkActive = loc.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`sidebar-submenu-item ${isLinkActive ? 'active' : ''}`}
                    onClick={closeMobile}
                  >
                    <span>{link.icon}</span>
                    <span className="sidebar-nav-label">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── Arcane Vault Section ── */}
          <button
            type="button"
            className={`sidebar-nav-item ${isVaultActive ? 'active' : ''}`}
            onClick={() => toggleSection('vault')}
            title={isRTL ? 'الخزينة الأسطورية' : 'Arcane Vault'}
          >
            <span className="sidebar-nav-icon"><GiAncientRuins /></span>
            <span className="sidebar-nav-label">{isRTL ? 'الخزينة الأسطورية' : 'Arcane Vault'}</span>
            {!isCollapsed && (
              <FaChevronDown className={`sidebar-chevron ${expandedSection === 'vault' ? 'open' : ''}`} />
            )}
          </button>

          {!isCollapsed && expandedSection === 'vault' && (
            <div className="sidebar-submenu">
              {vaultLinks.map(link => {
                const isLinkActive = loc.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`sidebar-submenu-item ${isLinkActive ? 'active' : ''}`}
                    onClick={closeMobile}
                  >
                    <span>{link.icon}</span>
                    <span className="sidebar-nav-label">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

        </div>

        {/* ── Docked Mascot Avatar Pill (when minimized) ── */}
        <div id="sidebar-mascot-dock" className="sidebar-mascot-dock" />

        {/* ── Footer Controls Bar (Icon-only clean action bar) ── */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-footer-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('cmd-open-ai-tester'))}
            title={isRTL ? 'فحص ومراقبة مزودات الذكاء الاصطناعي (AI Diagnostics)' : 'AI Providers Diagnostics & Speed Test'}
            aria-label={isRTL ? 'فحص الذكاء الاصطناعي' : 'AI Diagnostics'}
          >
            <FaMicrochip style={{ color: '#10b981', fontSize: '0.85rem' }} />
          </button>

          <button
            type="button"
            className="sidebar-footer-btn"
            onClick={() => openShop('avatars')}
            title={t('shop.title') || (isRTL ? 'متجر الشخصيات' : 'Shop')}
            aria-label={isRTL ? 'متجر الأنمي والـ RPG' : 'Anime & RPG Shop'}
          >
            <FaShoppingBag style={{ color: '#f59e0b', fontSize: '0.85rem' }} />
          </button>

          <button
            type="button"
            className="sidebar-footer-btn"
            onClick={toggleLang}
            title={isRTL ? 'التبديل إلى الإنجليزية (English)' : 'Switch to Arabic (العربية)'}
            aria-label={isRTL ? 'تغيير اللغة' : 'Toggle Language'}
          >
            <FaGlobe style={{ color: '#38bdf8', fontSize: '0.85rem' }} />
          </button>

          <button
            type="button"
            className="sidebar-footer-btn"
            onClick={toggleTheme}
            title={isRTL ? `التبديل إلى الوضع ${theme === 'dark' ? 'الفاتح' : 'الداكن'}` : `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={isRTL ? 'تغيير المظهر' : 'Toggle Theme'}
          >
            {theme === 'dark' ? <FaSun style={{ color: '#f59e0b', fontSize: '0.85rem' }} /> : <FaMoon style={{ color: '#6366f1', fontSize: '0.85rem' }} />}
          </button>
        </div>

      </aside>

      {isShopOpen && (
        <ShopModal isOpen={isShopOpen} onClose={closeShop} initialTab={shopInitialTab} />
      )}
    </>
  );
});

export default Sidebar;
