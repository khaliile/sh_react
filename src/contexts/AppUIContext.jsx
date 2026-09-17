/**
 * AppUIContext.jsx
 *
 * Single source of truth for global UI state shared between Sidebar,
 * Navbar, FloatingMascot, and any other consumer:
 *   • theme — current data-theme value + toggleTheme
 *   • rpgStats — character level/XP, refreshed on `rpg-xp-gained` events
 *   • shop — isShopOpen, shopInitialTab, openShop, closeShop
 *
 * Replaces the ~80 lines of duplicated state + event-listener code
 * that previously lived independently in both Navbar.jsx and Sidebar.jsx.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadRPGStats } from '../utils/rpgSystem';
import { useInventoryStorage } from '../hooks/useInventoryStorage';

const AppUIContext = createContext(null);

export function AppUIProvider({ children }) {
  // ── Theme ────────────────────────────────────────────────────────────────
  const [theme, setThemeState] = useState(
    () => localStorage.getItem('app_theme') || 'default'
  );

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    // Trigger a CSS-var flush so styled components pick up the change immediately
    document.documentElement.style.setProperty('--force-theme-update', Date.now().toString());
  }, [theme]);

  // Listen for theme changes fired by other parts of the app (shop, mascot, etc.)
  useEffect(() => {
    const handleThemeEvent = (e) => {
      const next = e?.detail?.theme || localStorage.getItem('app_theme') || 'default';
      setThemeState(next);
    };
    window.addEventListener('theme-changed', handleThemeEvent);
    window.addEventListener('storage', handleThemeEvent);
    return () => {
      window.removeEventListener('theme-changed', handleThemeEvent);
      window.removeEventListener('storage', handleThemeEvent);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'light'
        ? (localStorage.getItem('app_rpg_theme') || 'default')
        : 'light';
      localStorage.setItem('app_theme', next);
      document.documentElement.setAttribute('data-theme', next);
      document.body.setAttribute('data-theme', next);
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: next } }));
      return next;
    });
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
  }, []);

  // ── RPG Stats ────────────────────────────────────────────────────────────
  const { equippedAvatar } = useInventoryStorage();
  const [rpgStats, setRpgStats] = useState(() => loadRPGStats(equippedAvatar));
  const lastStatsUpdateRef = { current: 0 };

  // Re-load stats whenever the equipped avatar changes
  useEffect(() => {
    setRpgStats(loadRPGStats(equippedAvatar));
  }, [equippedAvatar]);

  // Throttled refresh on XP gain events (avoid double-render within 200ms)
  useEffect(() => {
    const handleXPGain = () => {
      const now = Date.now();
      if (now - lastStatsUpdateRef.current < 200) return;
      lastStatsUpdateRef.current = now;
      setTimeout(() => setRpgStats(loadRPGStats(equippedAvatar)), 0);
    };
    window.addEventListener('rpg-xp-gained', handleXPGain);
    return () => window.removeEventListener('rpg-xp-gained', handleXPGain);
  }, [equippedAvatar]);

  // ── Shop ─────────────────────────────────────────────────────────────────
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopInitialTab, setShopInitialTab] = useState('avatars');

  const openShop = useCallback((tab = 'avatars') => {
    setShopInitialTab(tab);
    setIsShopOpen(true);
  }, []);

  const closeShop = useCallback(() => setIsShopOpen(false), []);

  // Listen for imperative shop-open events dispatched by FloatingMascot etc.
  useEffect(() => {
    const handleOpen = (e) => openShop(e?.detail?.tab || 'avatars');
    window.addEventListener('open-shop', handleOpen);
    window.addEventListener('open-shop-modal', handleOpen);
    return () => {
      window.removeEventListener('open-shop', handleOpen);
      window.removeEventListener('open-shop-modal', handleOpen);
    };
  }, [openShop]);

  // ── Context Value ─────────────────────────────────────────────────────────
  return (
    <AppUIContext.Provider value={{
      // theme
      theme,
      setTheme,
      toggleTheme,
      // rpg
      rpgStats,
      equippedAvatar,
      // shop
      isShopOpen,
      shopInitialTab,
      openShop,
      closeShop,
    }}>
      {children}
    </AppUIContext.Provider>
  );
}

export function useAppUI() {
  const ctx = useContext(AppUIContext);
  if (!ctx) throw new Error('useAppUI must be used inside <AppUIProvider>');
  return ctx;
}
