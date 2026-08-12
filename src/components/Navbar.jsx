import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaSun, FaMoon, FaFire } from 'react-icons/fa';
import { useAppStorage, computeStreak } from '../hooks/useAppHooks';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'dark';
  });
  const loc = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const [log] = useAppStorage('app_time_log', { byDate: {} });
  const streak = computeStreak(log?.byDate || {});

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-text">GO</span>
        <svg className="brand-logo" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M9.5 16.5 L13.5 20.5 L22.5 11.5" stroke="currentColor" strokeWidth="3.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>

        {streak > 0 && (
          <span className="streak-badge" title={`${streak} day streak`}>
            <FaFire /> {streak}
          </span>
        )}
      </div>

      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`nav-links-group ${isOpen ? 'mobile-show' : ''}`}>
        <Link
          to="/"
          className={`nav-link ${loc.pathname === '/' ? 'active-link' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          Arena
        </Link>
        <Link
          to="/schedule"
          className={`nav-link ${loc.pathname === '/schedule' ? 'active-link' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          Schedule
        </Link>
        <Link
          to="/dashboard"
          className={`nav-link ${loc.pathname === '/dashboard' ? 'active-link' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          Dashbo  ard
        </Link>
        <Link
          to="/cosmos"
          className={`nav-link cosmos-nav-link ${loc.pathname === '/cosmos' ? 'active-link' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          Cosmos
        </Link>
        <Link
          to="/math"
          className={`nav-link ${loc.pathname === '/math' ? 'active-link' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          Math
        </Link>
        <Link
          to="/data-science"
          className={`nav-link ${loc.pathname === '/data-science' ? 'active-link' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          Data Science
        </Link>
        <Link
          to="/english"
          className={`nav-link ${loc.pathname === '/english' ? 'active-link' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          English
        </Link>
        <button
          className="nav-link theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </nav>
  );
}
