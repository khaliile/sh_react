import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createTranslator } from '../locales/translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'app_language';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('robin_ui_lang');
      return (stored === 'ar' || stored === 'ar-SA') ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });

  // Apply dir + lang attribute on every change
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.setItem('robin_ui_lang', lang === 'ar' ? 'ar-SA' : 'en-US');
    } catch {}
  }, [lang]);

  // Listen for global app-language-changed events (e.g. from FloatingMascot or useAppLanguage)
  useEffect(() => {
    const handleGlobalLang = (e) => {
      const detail = e.detail;
      if (!detail) return;
      const targetLang = (detail.lang === 'ar' || detail.lang === 'ar-SA' || detail.isAr) ? 'ar' : 'en';
      setLang(prev => (prev !== targetLang ? targetLang : prev));
    };

    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY || e.key === 'robin_ui_lang') {
        const isAr = e.newValue === 'ar' || e.newValue === 'ar-SA';
        setLang(isAr ? 'ar' : 'en');
      }
    };

    window.addEventListener('app-language-changed', handleGlobalLang);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('app-language-changed', handleGlobalLang);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'ar' : 'en';
      window.dispatchEvent(new CustomEvent('app-language-changed', { detail: { isAr: next === 'ar', lang: next } }));
      return next;
    });
  }, []);

  const t = useMemo(() => createTranslator(lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, language: lang, toggleLang, t, isArabic: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}


export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
