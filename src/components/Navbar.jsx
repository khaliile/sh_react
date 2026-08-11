import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; // استيراد الأيقونات

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const loc = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="dot-indicator"></span> Dashboard
      </div>
      
      {/* استخدام الأيقونات بدل الحروف */}
      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`nav-links-group ${isOpen ? 'mobile-show' : ''}`}>
        <Link
          to="/"
          className={`nav-link ${loc.pathname === '/' ? 'active-link' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          Schedule
        </Link>
        <Link
          to="/dashboard"
          className={`nav-link ${loc.pathname === '/dashboard' ? 'active-link' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          Dashboard
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
      </div>
    </nav>
  );
}