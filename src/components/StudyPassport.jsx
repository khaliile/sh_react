
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { FaGlobeAmericas, FaScroll, FaSpinner, FaTimes, FaPassport, FaLock, FaCheck, FaCompass, FaMapMarkedAlt, FaCrown, FaStar, FaPlane, FaFlag, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useRpgStorage } from '../hooks/useRpgStorage';
import '../pages/ArenaCards.css';

// Countries sorted by unlock threshold (cumulative study hours)
const PASSPORT_COUNTRIES = [
  { code: 'JP', name: 'Japan',           flag: '🇯🇵', hours: 1,   avg: '9h/day' },
  { code: 'KR', name: 'South Korea',     flag: '🇰🇷', hours: 3,   avg: '10h/day' },
  { code: 'CN', name: 'China',           flag: '🇨🇳', hours: 5,   avg: '9h/day' },
  { code: 'SG', name: 'Singapore',       flag: '🇸🇬', hours: 8,   avg: '8.5h/day' },
  { code: 'FI', name: 'Finland',         flag: '🇫🇮', hours: 12,  avg: '8h/day' },
  { code: 'DE', name: 'Germany',         flag: '🇩🇪', hours: 16,  avg: '7.5h/day' },
  { code: 'IN', name: 'India',           flag: '🇮🇳', hours: 20,  avg: '9h/day' },
  { code: 'EE', name: 'Estonia',         flag: '🇪🇪', hours: 25,  avg: '7h/day' },
  { code: 'NL', name: 'Netherlands',     flag: '🇳🇱', hours: 30,  avg: '7h/day' },
  { code: 'CA', name: 'Canada',          flag: '🇨🇦', hours: 35,  avg: '6.5h/day' },
  { code: 'AU', name: 'Australia',       flag: '🇦🇺', hours: 40,  avg: '6h/day' },
  { code: 'FR', name: 'France',          flag: '🇫🇷', hours: 50,  avg: '7h/day' },
  { code: 'SE', name: 'Sweden',          flag: '🇸🇪', hours: 60,  avg: '6.5h/day' },
  { code: 'CH', name: 'Switzerland',     flag: '🇨🇭', hours: 70,  avg: '7h/day' },
  { code: 'NO', name: 'Norway',          flag: '🇳🇴', hours: 80,  avg: '6h/day' },
  { code: 'PS', name: 'Palestine',        flag: '🇵🇸', hours: 90,  avg: '7.5h/day' },
  { code: 'US', name: 'United States',   flag: '🇺🇸', hours: 100, avg: '6.5h/day' },
  { code: 'GB', name: 'United Kingdom',  flag: '🇬🇧', hours: 110, avg: '6h/day' },
  { code: 'TW', name: 'Taiwan',          flag: '🇹🇼', hours: 120, avg: '9h/day' },
  { code: 'IE', name: 'Ireland',         flag: '🇮🇪', hours: 130, avg: '6h/day' },
  { code: 'NZ', name: 'New Zealand',     flag: '🇳🇿', hours: 140, avg: '5.5h/day' },
  { code: 'DK', name: 'Denmark',         flag: '🇩🇰', hours: 150, avg: '6h/day' },
  { code: 'AT', name: 'Austria',         flag: '🇦🇹', hours: 160, avg: '6.5h/day' },
  { code: 'CZ', name: 'Czechia',         flag: '🇨🇿', hours: 175, avg: '6h/day' },
  { code: 'PT', name: 'Portugal',        flag: '🇵🇹', hours: 190, avg: '5.5h/day' },
  { code: 'ES', name: 'Spain',           flag: '🇪🇸', hours: 200, avg: '5.5h/day' },
  { code: 'IT', name: 'Italy',           flag: '🇮🇹', hours: 215, avg: '5.5h/day' },
  { code: 'PL', name: 'Poland',          flag: '🇵🇱', hours: 230, avg: '6.5h/day' },
  { code: 'BR', name: 'Brazil',          flag: '🇧🇷', hours: 250, avg: '5h/day' },
  { code: 'AR', name: 'Argentina',       flag: '🇦🇷', hours: 270, avg: '5h/day' },
  { code: 'MX', name: 'Mexico',          flag: '🇲🇽', hours: 290, avg: '5h/day' },
  { code: 'ZA', name: 'South Africa',    flag: '🇿🇦', hours: 310, avg: '5h/day' },
  { code: 'NG', name: 'Nigeria',         flag: '🇳🇬', hours: 330, avg: '6h/day' },
  { code: 'EG', name: 'Egypt',           flag: '🇪🇬', hours: 350, avg: '5.5h/day' },
  { code: 'MA', name: 'Morocco',         flag: '🇲🇦', hours: 400, avg: '5h/day' },
  { code: 'SA', name: 'Saudi Arabia',    flag: '🇸🇦', hours: 450, avg: '5h/day' },
  { code: 'AE', name: 'UAE',             flag: '🇦🇪', hours: 500, avg: '6h/day' },
];

function CountryFlag({ code, flag, name, locked = false, className = '' }) {
  const [error, setError] = useState(false);

  return (
    <div className={`passport-flag-wrap ${locked ? 'is-locked' : ''} ${className}`}>
      {!error ? (
        <img
          src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
          alt={name}
          className="passport-flag-img"
          onError={() => setError(true)}
          loading="lazy"
        />
      ) : (
        <span className="passport-flag-fallback">
          <FaFlag style={{ fontSize: '0.75rem', opacity: 0.8 }} />
        </span>
      )}
    </div>
  );
}

export default function StudyPassport({ log }) {
  const { t, lang, language } = useLanguage();
  const isAr = lang === 'ar' || language === 'ar' || document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  const { addXpAndCoins } = useRpgStorage();

  // Compute total hours from log
  const totalMins = Object.values(log?.byDate || {}).reduce((s, m) => s + m, 0);
  const totalHours = Math.floor(totalMins / 60);

  const unlocked = PASSPORT_COUNTRIES.filter(c => totalHours >= c.hours);
  const locked   = PASSPORT_COUNTRIES.filter(c => totalHours < c.hours);
  const next     = locked[0];

  const hoursToNext = next ? next.hours - totalHours : 0;

  // ── Explorer Rank based on cumulative hours ─────────────────────────────────
  const explorerRank = useMemo(() => {
    if (totalHours >= 150) return { title: isAr ? 'سيد العالم' : 'Master of the Globe', icon: FaCrown, color: '#ec4899' };
    if (totalHours >= 70)  return { title: isAr ? 'عالم كوني' : 'Cosmic Scholar', icon: FaStar, color: '#8b5cf6' };
    if (totalHours >= 30)  return { title: isAr ? 'رائد عالمي' : 'Global Pioneer', icon: FaPlane, color: '#38bdf8' };
    if (totalHours >= 10)  return { title: isAr ? 'رحالة القارات' : 'Continental Scholar', icon: FaMapMarkedAlt, color: '#10b981' };
    return { title: isAr ? 'مستكشف مبتدئ' : 'Apprentice Voyager', icon: FaCompass, color: '#f59e0b' };
  }, [totalHours, isAr]);

  const RankIcon = explorerRank.icon;

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'next' | 'unlocked'
  const LOCKED_CHUNK = 7;
  const [visibleLockedCount, setVisibleLockedCount] = useState(LOCKED_CHUNK);

  // Reset visible count when filter changes
  const handleSetFilter = (f) => {
    setActiveFilter(f);
    setVisibleLockedCount(LOCKED_CHUNK);
  };

  const displayCountries = useMemo(() => {
    if (activeFilter === 'unlocked') return unlocked;
    if (activeFilter === 'next') return locked.slice(0, Math.min(visibleLockedCount, locked.length));
    // 'all' — show all unlocked + progressive locked
    return [...unlocked, ...locked.slice(0, visibleLockedCount)];
  }, [activeFilter, unlocked, locked, visibleLockedCount]);

  const hasMoreLocked = useMemo(() => {
    if (activeFilter === 'unlocked') return false;
    return visibleLockedCount < locked.length;
  }, [activeFilter, locked.length, visibleLockedCount]);

  const progressPercent = next
    ? Math.min(100, Math.max(0, Math.round((totalHours / next.hours) * 100)))
    : 100;

  // ── AI Chronicle State ─────────────────────────────────────────────────────
  const [chronicleLoading, setChronicleLoading] = useState(false);
  const [chronicleText, setChronicleText] = useState('');
  const [chronicleOpen, setChronicleOpen] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    if (!chronicleOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setChronicleOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chronicleOpen]);

  const handleGenerateChronicle = async () => {
    setChronicleLoading(true);
    setChronicleOpen(true);
    setChronicleText('');
    try {
      const targetLang = isAr ? 'Arabic' : 'English';
      const VERCEL_AI_KEY = import.meta.env.VITE_VERCEL_AI_KEY || '';
      const unlockedList = unlocked.map(c => `${c.name} (${c.hours}h)`).join(', ') || (isAr ? 'لا يوجد بعد' : 'None yet');

      const systemPrompt = `You are the Royal Cartographer and Scholar Historian of the Global Study Passport.
Write an inspiring, lyrical, and epic chronicle summarizing the student's learning journey and unlocked global destinations.

CRITICAL INSTRUCTION: Write the entire response strictly in ${targetLang}.

GUIDELINES:
- Celebrate their ${totalHours} hours of deep focus.
- Weave in the cultural wisdom of unlocked nations (${unlockedList}).
- Set a bold heroic challenge for the next destination (${next ? `${next.name} in ${hoursToNext}h` : 'Mastery'}).
- Do NOT use raw emojis; use elegant, poetic phrasing instead.
- Keep it to 3 punchy, evocative paragraphs strictly in ${targetLang}.`;

      const payload = {
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write my Study Passport Expedition Chronicle in ${targetLang}. Unlocked countries: ${unlockedList}. Total study time: ${totalHours} hours.` }
        ],
        max_tokens: 800,
        temperature: 0.6
      };

      let resultText = '';

      // 1. Direct Gateway
      try {
        const res = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${VERCEL_AI_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(12000),
        });

        const data = await res.json();
        if (res.ok) {
          resultText = data?.choices?.[0]?.message?.content || '';
        }
      } catch (err) {
        console.warn('[Passport AI] Direct Vercel failed, trying local proxy:', err.message);
      }

      // 2. Local Proxy fallback
      if (!resultText) {
        try {
          const res = await fetch('http://localhost:8000/api/ai-gateway', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(12000),
          });
          if (res.ok) {
            const data = await res.json();
            resultText = data?.choices?.[0]?.message?.content || '';
          }
        } catch (proxyErr) {
          console.warn('[Passport AI] Local proxy failed:', proxyErr.message);
        }
      }

      // 3. Guaranteed Localized Fallback
      const arChronicle = `سجل الرحالة العلمي العالمي:\n\nلقد أنجزت حتى الآن ${totalHours} ساعة من التركيز والانضباط الأكاديمي. أفق المعرفة يتسع مع كل وجهة جديدة تفتحها، ومحطتك القادمة تنتظر عزيمتك.\n\nاستمر في تحصيل العلم وتدوين الساعات لتجاوز كافة التحديات وحصد المزيد من الإنجازات!`;
      const enChronicle = `Global Scholar Expedition Chronicle:\n\nYou have logged ${totalHours} hours of deep academic focus. The horizon of knowledge expands with every new milestone achieved.\n\nPress forward into your study sessions to unlock new destinations and conquer greater challenges!`;

      if (!resultText) {
        resultText = isAr ? arChronicle : enChronicle;
      }

      // 4. Language validation — ensure response matches active UI language
      if (resultText) {
        const arabicChars = (resultText.match(/[\u0600-\u06FF]/g) || []).length;
        const latinChars = (resultText.match(/[a-zA-Z]/g) || []).length;
        if (isAr && latinChars > arabicChars) {
          resultText = arChronicle;
        } else if (!isAr && arabicChars > latinChars) {
          resultText = enChronicle;
        }
      }

      setChronicleText(resultText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim());
      addXpAndCoins(20, 5, 'Generated Global Scholar Chronicle');
    } catch (err) {
      setChronicleText(isAr 
        ? `سجل الرحالة العلمي:\n\nلقد أنجزت ${totalHours} ساعة من الدراسة المركزية. واصل السعي لتحقيق أهدافك واكتشاف المزيد من المحطات العلمية!`
        : `Global Scholar Expedition Chronicle:\n\nYou have completed ${totalHours} hours of focused study. Keep striving forward to unlock the next destination!`);
    } finally {
      setChronicleLoading(false);
    }
  };

  return (
    <div className="arena-card passport-card">
      <div className="arena-card-header">
        <div>
          <h3 className="arena-card-title">{t('passport.title')}</h3>
          <p className="arena-card-sub">{t('passport.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleGenerateChronicle}
            disabled={chronicleLoading}
            className="passport-ai-btn"
            title={t('passport.chronicleTitle')}
          >
            {chronicleLoading ? (
              <FaSpinner className="passport-ai-spin" />
            ) : (
              <FaScroll className="passport-ai-icon" />
            )}
            <span>{chronicleLoading ? t('passport.chronicling') : t('passport.aiChronicle')}</span>
          </button>
          <div className="passport-counter">
            <span className="passport-num">{unlocked.length}</span>
            <span className="passport-denom">/{PASSPORT_COUNTRIES.length}</span>
            <span className="passport-label">{t('passport.countries')}</span>
          </div>
        </div>
      </div>

      {/* Hours & Explorer Rank Row */}
      <div className="passport-hours-row">
        <div className="passport-hours-main">
          <span className="passport-hours-val">{totalHours}h</span>
          <span className="passport-hours-label">{t('passport.totalStudyTime')}</span>
        </div>

        {/* Explorer Rank Pill */}
        <div className="passport-rank-pill" style={{ borderColor: `${explorerRank.color}66` }}>
          <span className="passport-rank-icon" style={{ color: explorerRank.color, display: 'inline-flex', alignItems: 'center' }}>
            <RankIcon />
          </span>
          <span className="passport-rank-text">{explorerRank.title}</span>
        </div>

        {next && (
          <div className="passport-next-hint">
            <span className="passport-next-needed">+{hoursToNext}h</span>
            <span className="passport-next-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}>
              {isAr ? <FaArrowLeft size={10} /> : <FaArrowRight size={10} />}
            </span>
            <CountryFlag code={next.code} flag={next.flag} name={next.name} className="passport-next-flag-mini" />
            <span className="passport-next-name">{next.name}</span>
          </div>
        )}
      </div>

      {/* Next Unlock Progress Bar */}
      {next && (
        <div className="passport-progress-box">
          <div className="passport-progress-header">
            <span>{t('passport.progressToNext')}: <strong>{next.name}</strong></span>
            <span className="passport-progress-ratio">{totalHours} / {next.hours}h ({progressPercent}%)</span>
          </div>
          <div className="passport-progress-track">
            <div className="passport-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {/* Destinations Filter Controls */}
      <div className="passport-catalog-bar">
        <div className="passport-catalog-title">
          <FaMapMarkedAlt style={{ fontSize: '0.8rem', color: '#38bdf8' }} />
          <span>{t('passport.catalogTitle')}</span>
        </div>
        <div className="passport-filter-group">
          <button
            type="button"
            className={`passport-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleSetFilter('all')}
          >
            <span>{isAr ? 'الكل' : 'All'}</span>
            <span className="passport-filter-count">{PASSPORT_COUNTRIES.length}</span>
          </button>
          <button
            type="button"
            className={`passport-filter-pill ${activeFilter === 'next' ? 'active' : ''}`}
            onClick={() => handleSetFilter('next')}
          >
            <span>{isAr ? 'المحطات القادمة' : 'Next Milestones'}</span>
            <span className="passport-filter-count">{locked.length}</span>
          </button>
          <button
            type="button"
            className={`passport-filter-pill ${activeFilter === 'unlocked' ? 'active' : ''}`}
            onClick={() => handleSetFilter('unlocked')}
          >
            <span>{isAr ? 'المفتوحة' : 'Unlocked'}</span>
            <span className="passport-filter-count">{unlocked.length}</span>
          </button>
        </div>
      </div>

      {/* Scrollable Destination Grid Wrapper */}
      <div className="passport-grid-wrapper">
        {displayCountries.length === 0 ? (
          <div className="passport-empty-filter">
            <FaCompass className="passport-empty-icon" />
            <p>{t('passport.noUnlockedYet')}</p>
          </div>
        ) : (
          <>
            <div className="passport-grid">
              {displayCountries.map(c => {
                const isUnlocked = totalHours >= c.hours;
                return (
                  <div
                    key={c.code}
                    className={`passport-country ${isUnlocked ? 'unlocked' : 'locked'}`}
                    title={isUnlocked ? `${c.name} — avg ${c.avg}` : t('passport.unlockAt', { hours: c.hours })}
                  >
                    <CountryFlag code={c.code} flag={c.flag} name={c.name} locked={!isUnlocked} />
                    <span className={`passport-name ${!isUnlocked ? 'passport-locked-name' : ''}`}>
                      {c.name}
                    </span>
                    <span className="passport-avg">
                      {isUnlocked ? c.avg : t('passport.needed', { hours: c.hours })}
                    </span>
                    {isUnlocked ? (
                      <div className="passport-stamp" title="Unlocked">
                        <FaCheck className="passport-stamp-icon" />
                      </div>
                    ) : (
                      <div className="passport-lock" title={t('passport.unlockAt', { hours: c.hours })}>
                        <FaLock className="passport-lock-icon" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {hasMoreLocked && (
              <button
                type="button"
                className="passport-show-more-btn"
                onClick={() => setVisibleLockedCount(v => v + LOCKED_CHUNK)}
              >
                <FaCompass className="passport-show-more-icon" />
                <span>{isAr ? 'عرض المزيد' : 'Show More'}</span>
                <span className="passport-show-more-badge">
                  +{locked.length - visibleLockedCount} {isAr ? 'متبقية' : 'remaining'}
                </span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer Info Counter */}
      <div className="passport-card-footer">
        <span className="passport-footer-pill">
          <FaCompass style={{ fontSize: '0.78rem', opacity: 0.8 }} />
          <span>{t('passport.destinationsCount', { count: PASSPORT_COUNTRIES.length })}</span>
        </span>
      </div>

      {/* ── Centered Modal with Blurred Background (Portaled into .app-main-viewport so sidebar is unblurred) ── */}
      {chronicleOpen && createPortal(
        <div
          className="passport-modal-backdrop"
          onClick={() => setChronicleOpen(false)}
          role="dialog"
          aria-modal="true"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="passport-modal-dialog" onClick={(e) => e.stopPropagation()}>
            {chronicleLoading && <div className="passport-scan-bar" />}

            {/* Modal Header */}
            <div className="passport-modal-header">
              <div className="passport-modal-title">
                <FaGlobeAmericas className="passport-modal-icon" />
                <span>{isAr ? 'سجل الرحالة العلمي العالمي' : 'GLOBAL SCHOLAR EXPEDITION CHRONICLE'}</span>
                {chronicleLoading && (
                  <span className="passport-loading-badge">
                    {isAr ? 'جارٍ التدوين...' : 'CHRONICLING...'}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="passport-modal-close-btn"
                onClick={() => setChronicleOpen(false)}
                title={isAr ? 'إغلاق' : 'Close'}
                aria-label={isAr ? 'إغلاق' : 'Close'}
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="passport-modal-body">
              {/* Expedition Telemetry Stats Chips */}
              <div className="passport-modal-stats">
                <div className="passport-modal-stat-item">
                  <span className="passport-modal-stat-label">{isAr ? 'إجمالي الساعات' : 'TOTAL STUDY'}</span>
                  <span className="passport-modal-stat-val">{totalHours}h</span>
                </div>
                <div className="passport-modal-stat-item">
                  <span className="passport-modal-stat-label">{isAr ? 'الرتبة الاستكشافية' : 'EXPEDITION RANK'}</span>
                  <span className="passport-modal-stat-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <RankIcon style={{ color: explorerRank.color }} />
                    <span>{explorerRank.title}</span>
                  </span>
                </div>
                <div className="passport-modal-stat-item">
                  <span className="passport-modal-stat-label">{isAr ? 'الدول المفتوحة' : 'DESTINATIONS'}</span>
                  <span className="passport-modal-stat-val">{unlocked.length} / {PASSPORT_COUNTRIES.length}</span>
                </div>
              </div>

              {chronicleLoading ? (
                <div className="passport-terminal-loader">
                  <div className="passport-terminal-lines">
                    {(isAr
                      ? [
                          '› تهيئة أرشيف الرحالة الملكي ومخطوطات المعرفة...',
                          '› تجميع ساعات التركيز والقياسات الأكاديمية...',
                          '› استخلاص الحكمة الثقافية للدول المفتوحة...',
                          '› صياغة التحدي البطولي للمحطة القادمة...',
                          '› توثيق السجل في سجلات الخلود الدراسية...',
                        ]
                      : [
                          '› Accessing Royal Cartographer Archive...',
                          '› Compiling deep focus telemetry & study hours...',
                          '› Weaving cultural wisdom of unlocked nations...',
                          '› Formulating next heroic expedition challenge...',
                          '› Inscribing milestones in the Global Scholar Chronicle...',
                        ]
                    ).map((line, i) => (
                      <div key={i} style={{ opacity: 0.6 + i * 0.1 }}>{line}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="passport-chronicle-content">
                  {chronicleText
                    ? chronicleText
                        .split('\n\n')
                        .filter(Boolean)
                        .map((para, idx) => (
                          <div key={idx} className="passport-chronicle-section">
                            <p className="passport-chronicle-para">{para}</p>
                          </div>
                        ))
                    : (
                      <div className="passport-chronicle-section">
                        <p className="passport-chronicle-para">
                          {isAr
                            ? `سجل الرحالة العلمي العالمي:\n\nلقد أنجزت حتى الآن ${totalHours} ساعة من التركيز والانضباط الأكاديمي. أفق المعرفة يتسع مع كل وجهة جديدة تفتحها، ومحطتك القادمة تنتظر عزيمتك.`
                            : `Global Scholar Expedition Chronicle:\n\nYou have completed ${totalHours} hours of focused study. Keep striving forward to unlock the next destination!`}
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="passport-modal-footer">
              <button
                type="button"
                className="passport-rescan-btn"
                onClick={handleGenerateChronicle}
                disabled={chronicleLoading}
              >
                {chronicleLoading ? (
                  <FaSpinner className="passport-ai-spin" />
                ) : (
                  <FaScroll />
                )}
                <span>{isAr ? 'إعادة التدوين' : 'Re-Chronicle'}</span>
              </button>
              <button
                type="button"
                className="passport-modal-done-btn"
                onClick={() => setChronicleOpen(false)}
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>,
        document.querySelector('.app-main-viewport') || document.body
      )}
    </div>
  );
}

