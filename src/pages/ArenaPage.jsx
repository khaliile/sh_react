import { useState, useEffect, lazy, Suspense } from 'react';
import { FaDragon, FaScroll, FaGraduationCap, FaThLarge, FaUsers } from 'react-icons/fa';
import { GiCrossedSwords } from 'react-icons/gi';
import { useTimeTracker } from '../hooks/useAppHooks';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useLanguage } from '../contexts/LanguageContext';
import './ArenaCards.css';

// Lazy load heavy components
const StudyPassport = lazy(() => import('../components/StudyPassport'));
const ShadowRival = lazy(() => import('../components/ShadowRival'));
const DailyBoss3D = lazy(() => import('../components/DailyBoss3D'));
const DoflamingoBoss3D = lazy(() => import('../components/DoflamingoBoss3D'));
const FocusFamiliar = lazy(() => import('../components/FocusFamiliar'));
const QuestBoard = lazy(() => import('../components/QuestBoard'));
const FlashcardArena = lazy(() => import('../components/FlashcardArena'));
const GhostNetwork = lazy(() => import('../components/GhostNetwork'));
const GuildSystem = lazy(() => import('../components/GuildSystem'));
const MissionImpossible = lazy(() => import('../components/MissionImpossible'));

export default function ArenaPage() {
  const { log } = useTimeTracker();
  const { t } = useLanguage();
  const { boss } = useRpgStorage();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'quests' | 'flashcards' | 'familiar' | 'games'
  
  // Automatically progress boss: Teach first, then Doflamingo when Teach is defeated!
  const [activeBoss, setActiveBoss] = useState(() => (boss?.defeated ? 'doflamingo' : 'teach'));

  // Helper to force scroll to top
  const scrollToTop = () => {
    const wrapper = document.querySelector('.view-wrapper');
    if (wrapper) wrapper.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Force scroll to top when Arena page loads
  useEffect(() => {
    scrollToTop();
  }, []);

  // Listen for immediate boss defeat events (from AI trials or task completion)
  useEffect(() => {
    const onBossDefeated = (e) => {
      if (e.detail?.bossId === 'teach') {
        setActiveBoss('doflamingo');
        scrollToTop();
      }
    };
    window.addEventListener('boss-defeated', onBossDefeated);
    return () => window.removeEventListener('boss-defeated', onBossDefeated);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <section className="arena-container">
      {/* ── DAILY BOSS (TEACH / DOFLAMINGO) ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<div style={{height:'400px',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)'}}>Loading boss...</div>}>
          {activeBoss === 'teach' ? (
            <DailyBoss3D key="teach" />
          ) : (
            <DoflamingoBoss3D key="doflamingo" />
          )}
        </Suspense>
      </div>

      <header className="arena-header" style={{ marginTop: '1.25rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <div className="arena-tag-badge">
              <GiCrossedSwords className="arena-tag-icon" />
              <span>{t('arena.badge') || 'Study Arena'}</span>
            </div>
            <h1 className="arena-title">{t('arena.title')}</h1>
            <p className="arena-header-sub">{t('arena.subtitle')}</p>
          </div>
        </div>
      </header>

      {/* Arena Mode Navigation Tabs */}
      <div className="arena-nav-tabs">
        <button
          className={`arena-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          <FaThLarge className="arena-tab-icon" />
          <span className="arena-tab-text">{t('arena.overviewHub')}</span>
        </button>
        <button
          className={`arena-tab-btn ${activeTab === 'quests' ? 'active' : ''}`}
          onClick={() => handleTabChange('quests')}
        >
          <FaScroll className="arena-tab-icon" />
          <span className="arena-tab-text">{t('arena.quests')}</span>
        </button>
        <button
          className={`arena-tab-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => handleTabChange('flashcards')}
        >
          <FaGraduationCap className="arena-tab-icon" />
          <span className="arena-tab-text">{t('arena.flashcards')}</span>
        </button>
        <button
          className={`arena-tab-btn ${activeTab === 'familiar' ? 'active' : ''}`}
          onClick={() => handleTabChange('familiar')}
        >
          <FaDragon className="arena-tab-icon" />
          <span className="arena-tab-text">{t('arena.focusFamiliar')}</span>
        </button>
        <button
          className={`arena-tab-btn ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => handleTabChange('social')}
        >
          <FaUsers className="arena-tab-icon" />
          <span className="arena-tab-text">{t('arena.guildRivals')}</span>
        </button>
      </div>

      {activeTab === 'all' && (
        <div className="arena-overview-flow" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
          alignItems: 'stretch',
          gap: '1rem',
          marginTop: '1rem',
          position: 'relative',
          zIndex: 1,
        }}>
          <Suspense fallback={<div style={{minHeight:'200px'}} />}>
            <MissionImpossible />
            <FocusFamiliar />
            <QuestBoard />
            <FlashcardArena />
            <ShadowRival log={log} />
            <GhostNetwork />
            <GuildSystem />
            <StudyPassport log={log} />
          </Suspense>
        </div>
      )}

      {activeTab === 'quests' && (
        <div className="arena-tab-content fade-in" style={{ maxWidth: '920px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <Suspense fallback={<div style={{minHeight:'200px'}} />}>
            <MissionImpossible />
            <QuestBoard />
          </Suspense>
        </div>
      )}

      {activeTab === 'flashcards' && (
        <div className="arena-tab-content fade-in" style={{ maxWidth: '880px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <Suspense fallback={<div style={{minHeight:'200px'}} />}>
            <FlashcardArena />
          </Suspense>
        </div>
      )}

      {activeTab === 'familiar' && (
        <div className="arena-tab-content fade-in" style={{ maxWidth: '820px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <Suspense fallback={<div style={{minHeight:'200px'}} />}>
            <FocusFamiliar />
          </Suspense>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="arena-grid fade-in" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <Suspense fallback={<div style={{minHeight:'200px'}} />}>
            <GuildSystem />
            <GhostNetwork />
            <ShadowRival log={log} />
            <StudyPassport log={log} />
          </Suspense>
        </div>
      )}
    </section>
  );
}
