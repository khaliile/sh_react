import { useState, useMemo, useRef } from 'react';
import { 
  FaCrown, FaShieldAlt, 
  FaMedal, FaTrophy, FaQuoteLeft, FaEdit,
  FaChevronUp, FaChevronDown, FaUsers, FaSearch, FaTimes, FaCrosshairs, FaBullseye
} from 'react-icons/fa';
import { GiCrossedSwords } from 'react-icons/gi';
import { useTimeTracker } from '../hooks/useAppHooks';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useAppStorage } from '../hooks/useAppHooks';
import { useInventoryStorage } from '../hooks/useInventoryStorage';
import { useLanguage } from '../contexts/LanguageContext';
import AnimeFaceAvatar from './AnimeFaceAvatar';
import { playFanfare, playTick } from '../utils/sounds';
import './GuildSystem.css';

import { GUILD_ALL_53_COMPANIONS } from '../data/guildCompanions';

const GUILD_BOSS_MAX_HP = 120000;

// Legendary AI Companions (All 53 Characters sorted by overall fame/importance)
const AI_COMPANIONS = GUILD_ALL_53_COMPANIONS;

// Anime squad quotes for deep study inspiration
const COMPANION_QUOTES = {
  goku: {
    en: "There's always someone stronger out there. Push past your limits today!",
    ar: "دائماً هناك من هو أقوى. تجاوز حدودك اليوم في الدراسة!"
  },
  luffy: {
    en: "If you don't take risks, you can't create a future! Give this session everything!",
    ar: "إذا لم تخاطر، فلن تصنع مستقبلاً! قدّم كل ما لديك في هذه الجلسة!"
  },
  naruto: {
    en: "I never go back on my word! That's my ninja way of studying!",
    ar: "أنا لا أتراجع عن كلمتي أبداً! هذا هو طريقي في الدراسة!"
  },
  gojo: {
    en: "Throughout heaven and earth, deep work alone is the honored one. Don't fall behind!",
    ar: "في السماء والأرض، العمل العميق وحده هو المُكرَّم. لا تتخلف يا بطل!"
  },
  levi: {
    en: "Make the decision to focus with no regrets. Procrastination gets sliced down instantly.",
    ar: "اتخذ قرار التركيز بلا ندم. التسويف يُقطع في الحال بنصل حاد."
  },
  zoro: {
    en: "Nine mountains and eight seas... I will not stop until my blade cuts through all distractions.",
    ar: "تسعة جبال وثمانية بحار... لن أتوقف حتى يقطع نصلي كل الإلهاءات."
  },
  vegeta: {
    en: "Surpass your limits! A Saiyan never accepts defeat by procrastination!",
    ar: "تجاوز حدودك! السايان لا يرضى بالهزيمة أمام التسويف!"
  },
  sasuke: {
    en: "My eyes see through all excuses. Focus with absolute precision.",
    ar: "عيناي ترى ما وراء كل الأعذار. ركّز بدقة مطلقة."
  },
  itachi: {
    en: "True strength lies in patience and quiet dedication. Study with calm clarity.",
    ar: "القوة الحقيقية تكمن في الصبر والتفاني الهادئ. ادرس بوضوح تام."
  },
  eren: {
    en: "If we don't fight against distraction, we can't win our future. Keep moving forward!",
    ar: "إن لم نقاتل ضد التشتت، فلن نفوز بمستقبلنا. استمر في التقدم للأمام!"
  },
  light: {
    en: "Exact calculations and flawless execution. Every minute studied is a calculated victory.",
    ar: "حسابات دقيقة وتنفيذ متقن. كل دقيقة دراسة هي انتصار محسوب."
  },
  law: {
    en: "Within my Room of focus, all procrastination is dissected and removed with surgical precision.",
    ar: "داخل غرفة تركيزي، يتم تشريح كل التسويف وإزالته بدقة جراحية."
  },
  chrollo: {
    en: "True mastery is stolen one page at a time. The night belongs to those who study in silence.",
    ar: "السيادة الحقيقية تُكتسب صفحة تلو الأخرى. الليل لمن يدرس بصمت."
  }
};

export default function GuildSystem() {
  const { log, todayMinutes } = useTimeTracker();
  const { xp, level, addXpAndCoins } = useRpgStorage();
  const { equippedAvatar } = useInventoryStorage();
  const { t, lang, language } = useLanguage();
  const isAr = lang === 'ar' || language === 'ar' || document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  
  const [guildName, setGuildName] = useAppStorage('app_guild_name', t('guild.defaultName'));
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'top10' | 'nearMe'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  const [userHighlight, setUserHighlight] = useState(false);
  const rosterRef = useRef(null);

  const scrollRoster = (offset) => {
    if (rosterRef.current) {
      rosterRef.current.scrollBy({ top: offset, behavior: 'smooth' });
    }
  };

  const displayGuildName = useMemo(() => {
    if (!guildName || guildName === 'Phantom Vanguard' || guildName === 'طليعة الطليعة') {
      return t('guild.defaultName');
    }
    return guildName;
  }, [guildName, t]);

  const [hasClaimedRaidBonus, setHasClaimedRaidBonus] = useAppStorage('app_guild_raid_claimed_week', false);
  const now = new Date();
  const dayOfWeekNumber = ((now.getDay() + 6) % 7) + 1; // 1 (Mon) to 7 (Sun)

  // Calculate User's Total Weekly Boss Damage from logged hours & XP
  const userWeeklyMinutes = useMemo(() => {
    const byDate = log?.byDate || {};
    const curr = new Date();
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(curr.getDate() - i);
      const k = d.toISOString().split('T')[0];
      sum += (byDate[k] || 0);
    }
    return Math.max(todayMinutes, sum);
  }, [log, todayMinutes]);

  const userWeeklyDamage = Math.round(userWeeklyMinutes * 2.2 + (xp % 2000) * 0.5);

  // Compute AI companions' cumulative weekly damage based on week day progression
  const companionsData = useMemo(() => {
    return AI_COMPANIONS.map((companion) => {
      let cumulativeDmg = 0;
      for (let day = 1; day <= dayOfWeekNumber; day++) {
        const seed = (companion.id.charCodeAt(0) * day * 17) % companion.variance;
        const dailyDmg = companion.dailyBaseDamage + (seed - companion.variance / 2);
        cumulativeDmg += Math.max(100, Math.round(dailyDmg));
      }
      const name = isAr ? (companion.nameAr || companion.nameEn) : (companion.nameEn || companion.nameAr);
      const title = isAr ? (companion.titleAr || companion.titleEn) : (companion.titleEn || companion.titleAr);
      return {
        ...companion,
        name,
        title,
        weeklyDamage: cumulativeDmg,
        isUser: false
      };
    });
  }, [dayOfWeekNumber, isAr]);

  // Combine user and companions into Guild Leaderboard
  const leaderboard = useMemo(() => {
    const userEntry = {
      id: 'user_master',
      avatarId: equippedAvatar || 'luffy',
      name: t('guild.guildMaster'),
      title: t('guild.scholarLv', { level }),
      color: '#f59e0b',
      weeklyDamage: userWeeklyDamage,
      isUser: true,
      streak: 7
    };

    const all = [userEntry, ...companionsData];
    return all.sort((a, b) => b.weeklyDamage - a.weeklyDamage);
  }, [userWeeklyDamage, companionsData, level, equippedAvatar, t]);

  // Combined Total Guild Damage on the Raid Boss
  const totalGuildDamage = useMemo(() => {
    return leaderboard.reduce((acc, member) => acc + member.weeklyDamage, 0);
  }, [leaderboard]);

  const bossHpRemaining = Math.max(0, GUILD_BOSS_MAX_HP - totalGuildDamage);
  const bossDefeated = bossHpRemaining === 0;
  const bossHpPercentage = Math.min(100, Math.max(0, (bossHpRemaining / GUILD_BOSS_MAX_HP) * 100));
  const userRank = leaderboard.findIndex(m => m.isUser) + 1;

  // Filtered Leaderboard based on active tab and search query
  const filteredLeaderboard = useMemo(() => {
    let list = leaderboard;

    if (filterTab === 'top10') {
      list = leaderboard.slice(0, 10);
    } else if (filterTab === 'nearMe') {
      const uIndex = leaderboard.findIndex(m => m.isUser);
      if (uIndex !== -1) {
        const start = Math.max(0, uIndex - 3);
        const end = Math.min(leaderboard.length, uIndex + 4);
        list = leaderboard.slice(start, end);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => 
        m.name.toLowerCase().includes(q) || 
        (m.title && m.title.toLowerCase().includes(q))
      );
    }

    return list;
  }, [leaderboard, filterTab, searchQuery]);

  // Jump to User's Rank in the Leaderboard
  const handleJumpToMe = () => {
    playTick();
    if (filterTab !== 'all' && filterTab !== 'nearMe') {
      setFilterTab('all');
    }
    setSearchQuery('');
    setTimeout(() => {
      const userEl = document.getElementById('guild-user-row');
      if (userEl) {
        userEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setUserHighlight(true);
      setTimeout(() => setUserHighlight(false), 1800);
    }, 120);
  };

  const handleCompanionClick = (member) => {
    playTick();
    if (selectedCompanion?.id === member.id) {
      setSelectedCompanion(null);
    } else {
      setSelectedCompanion(member);
    }
  };

  const handleClaimRaidLoot = () => {
    if (!bossDefeated || hasClaimedRaidBonus) return;
    playFanfare();
    addXpAndCoins(350, 120, 'Guild Raid Victory');
    setHasClaimedRaidBonus(true);
  };

  const saveGuildName = () => {
    if (tempName.trim()) {
      setGuildName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="arena-card guild-system-card">
      {/* Guild Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #b45309, #f59e0b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', fontSize: '1.3rem',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
          }}>
            <FaShieldAlt />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isEditingName ? (
                <h3 
                  onClick={() => { setTempName(displayGuildName); setIsEditingName(true); }}
                  className="guild-card-title"
                  style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title={t('guild.renameTooltip') || "Click to rename guild"}
                >
                  {displayGuildName} <FaEdit style={{ fontSize: '0.85rem', color: '#f59e0b' }} />
                </h3>
              ) : (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    style={{
                      background: 'var(--bg-hover)', border: '1px solid #f59e0b',
                      borderRadius: '6px', color: 'var(--text-primary)', padding: '2px 8px', fontSize: '0.9rem', outline: 'none'
                    }}
                    autoFocus
                  />
                  <button onClick={saveGuildName} style={{ background: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                </div>
              )}
              <span style={{
                fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 700
              }}>
                {t('guild.title')}
              </span>
            </div>
            <p className="guild-card-sub" style={{ margin: 0, fontSize: '0.8rem' }}>
              {t('guild.subtitle')}
            </p>
          </div>
        </div>

        {/* User Rank Tag */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: userRank === 1 ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.3))' : 'var(--bg-hover)',
          border: `1px solid ${userRank === 1 ? '#f59e0b' : 'var(--border-color)'}`,
          borderRadius: '12px', padding: '6px 14px'
        }}>
          <FaCrown style={{ color: userRank === 1 ? '#fbbf24' : 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: userRank === 1 ? '#fbbf24' : 'var(--text-primary)' }}>
            {userRank === 1 ? t('guild.mvp') : t('guild.rank', { rank: userRank })}
          </span>
        </div>
      </div>

      {/* Weekly Raid Boss Banner */}
      <div className="guild-boss-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AnimeFaceAvatar id="sukuna" size={44} borderColor="#ef4444" glow={true} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ef4444' }}>
                  {bossDefeated ? t('guild.titanSlain') : t('guild.titanBoss')}
                </span>
                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 700 }}>
                  {t('guild.raidHp')}
                </span>
              </div>
              <span className="guild-card-sub" style={{ fontSize: '0.75rem' }}>
                {t('guild.combinedOutput')}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: bossDefeated ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>
              {bossHpRemaining.toLocaleString()} / {GUILD_BOSS_MAX_HP.toLocaleString()} HP
            </div>
            <div className="guild-card-sub" style={{ fontSize: '0.7rem' }}>
              {t('guild.damageDealt', { pct: Math.round(100 - bossHpPercentage) })}
            </div>
          </div>
        </div>

        {/* Boss HP Bar with Phase Milestones */}
        <div style={{
          height: '14px', borderRadius: '7px',
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          overflow: 'hidden', position: 'relative', margin: '10px 0'
        }}>
          {/* Milestone markers at 25%, 50%, 75% */}
          <div className="boss-hp-milestone" style={{ left: '25%' }} title="75% Damage Milestone" />
          <div className="boss-hp-milestone" style={{ left: '50%' }} title="50% Halfway Milestone" />
          <div className="boss-hp-milestone" style={{ left: '75%' }} title="25% Critical Milestone" />

          <div style={{
            height: '100%',
            width: `${bossHpPercentage}%`,
            borderRadius: '6px',
            background: 'linear-gradient(90deg, #ef4444, #f97316)',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)',
            transition: 'width 0.6s ease'
          }} />
        </div>

        {/* Boss Defeat / Loot Button */}
        {bossDefeated && (
          <div style={{
            marginTop: '14px', padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>
              {t('guild.raidSmashed')}
            </span>
            {!hasClaimedRaidBonus ? (
              <button
                onClick={handleClaimRaidLoot}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff',
                  fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(16,185,129,0.4)'
                }}
              >
                {t('guild.claimLoot')}
              </button>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                {t('guild.spoilsCollected')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Guild Rank Board (Leaderboard) */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span className="guild-card-title" style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('guild.rankBoard')}
            </span>
            <span className="guild-card-sub" style={{ fontSize: '0.75rem', display: 'block', marginTop: '2px' }}>
              {t('guild.rankBoardSub')}
            </span>
          </div>
          {/* Micro Up/Down Scroll Buttons */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => scrollRoster(-180)}
              className="guild-scroll-btn"
              title={isAr ? "صعود" : "Scroll up"}
              aria-label="Scroll up"
            >
              <FaChevronUp size={11} />
            </button>
            <button
              type="button"
              onClick={() => scrollRoster(180)}
              className="guild-scroll-btn"
              title={isAr ? "نزول" : "Scroll down"}
              aria-label="Scroll down"
            >
              <FaChevronDown size={11} />
            </button>
          </div>
        </div>

        {/* Controls Row: Filters, Jump to Me & Search */}
        <div className="guild-controls-row">
          <div className="guild-filter-tabs">
            <button
              type="button"
              className={`guild-filter-pill ${filterTab === 'all' && !searchQuery ? 'active' : ''}`}
              onClick={() => { playTick(); setFilterTab('all'); setSearchQuery(''); }}
            >
              {t('guild.allTab', { count: leaderboard.length }) || `All (${leaderboard.length})`}
            </button>
            <button
              type="button"
              className={`guild-filter-pill ${filterTab === 'top10' ? 'active' : ''}`}
              onClick={() => { playTick(); setFilterTab('top10'); setSearchQuery(''); }}
            >
              <FaTrophy style={{ fontSize: '0.68rem', color: filterTab === 'top10' ? '#000' : '#f59e0b' }} />
              <span>{t('guild.top10Tab') || 'Top 10'}</span>
            </button>
            <button
              type="button"
              className={`guild-filter-pill ${filterTab === 'nearMe' ? 'active' : ''}`}
              onClick={() => { playTick(); setFilterTab('nearMe'); setSearchQuery(''); }}
            >
              <FaCrosshairs style={{ fontSize: '0.68rem', color: filterTab === 'nearMe' ? '#000' : '#10b981' }} />
              <span>{t('guild.nearMeTab') || 'Near You'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="guild-jump-btn"
              onClick={handleJumpToMe}
              title={t('guild.jumpToMe') || "Jump to your position"}
            >
              <FaBullseye style={{ fontSize: '0.7rem' }} />
              <span>{t('guild.jumpToMe') || "My Rank"} (#{userRank})</span>
            </button>

            {/* Quick Search */}
            <div className="guild-search-wrap">
              <FaSearch style={{ position: 'absolute', [isAr ? 'right' : 'left']: '8px', fontSize: '0.68rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('guild.searchPlaceholder') || "Search..."}
                className="guild-search-input"
                style={{ paddingInlineStart: '24px' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', [isAr ? 'left' : 'right']: '6px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Companion Dialogue Banner */}
        {selectedCompanion && (
          <div className="guild-dialogue-card">
            <button
              type="button"
              className="guild-dialogue-close"
              onClick={() => setSelectedCompanion(null)}
              aria-label="Close quote"
            >
              <FaTimes size={11} />
            </button>
            <AnimeFaceAvatar id={selectedCompanion.avatarId} size={36} borderColor={selectedCompanion.color} />
            <div style={{ flex: 1, paddingInlineEnd: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedCompanion.name}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  • {selectedCompanion.title}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.76rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                <FaQuoteLeft style={{ fontSize: '0.65rem', opacity: 0.5, marginInlineEnd: '4px' }} />
                {selectedCompanion.isUser 
                  ? (isAr ? "أنت تقود هذه الطليعة. كل ساعة تسجلها تلحق ضرراً هائلاً بالعملاق!" : "You lead this vanguard. Every hour logged deals massive damage to the Titan!")
                  : (COMPANION_QUOTES[selectedCompanion.id]?.[isAr ? 'ar' : 'en'] || (isAr ? "استمر في التركيز، الانتصار حليفنا في هذه الغارة!" : "Stay focused! Victory is within our grasp in this raid!"))}
              </p>
            </div>
          </div>
        )}

        <div ref={rosterRef} className="guild-roster-scroll-list">
          {filteredLeaderboard.map((member) => {
            const actualRank = leaderboard.findIndex(m => m.id === member.id) + 1;
            const maxDamage = leaderboard[0]?.weeklyDamage || 1;
            const isMvp = actualRank === 1;
            const isSecond = actualRank === 2;
            const isThird = actualRank === 3;
            const podiumClass = isMvp ? 'podium-1' : isSecond ? 'podium-2' : isThird ? 'podium-3' : '';
            const isPulse = member.isUser && userHighlight;

            return (
              <div
                key={member.id}
                id={member.isUser ? 'guild-user-row' : undefined}
                onClick={() => handleCompanionClick(member)}
                className={`guild-leader-row ${member.isUser ? 'is-user' : ''} ${podiumClass} ${isPulse ? 'user-pulse-active' : ''}`}
                style={{ cursor: 'pointer' }}
                title={t('guild.quotePlaceholder') || "Click to see squad battle quote"}
              >
                {/* Rank Badge with Medals for Top 3 */}
                <div style={{
                  width: '30px', height: '30px', borderRadius: '9px',
                  background: isMvp 
                    ? 'linear-gradient(135deg, #b45309, #f59e0b)'
                    : isSecond
                      ? 'linear-gradient(135deg, #475569, #94a3b8)'
                      : isThird
                        ? 'linear-gradient(135deg, #c2410c, #f97316)'
                        : 'var(--bg-hover)',
                  color: isMvp || isSecond || isThird ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
                  boxShadow: isMvp ? '0 2px 10px rgba(245, 158, 11, 0.4)' : undefined
                }}>
                  {isMvp ? (
                    <FaCrown size={12} color="#000" />
                  ) : isSecond ? (
                    <FaMedal size={12} color="#f8fafc" />
                  ) : isThird ? (
                    <FaMedal size={12} color="#fff" />
                  ) : (
                    actualRank
                  )}
                </div>

                {/* Member Anime Face Portrait */}
                <div style={{ flexShrink: 0 }}>
                  <AnimeFaceAvatar
                    id={member.avatarId}
                    size={42}
                    borderColor={member.isUser ? '#f59e0b' : member.color}
                    glow={isMvp}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="guild-leader-name" style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                      {member.name}
                    </span>
                    {isMvp && (
                      <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.25)', color: '#b45309', fontWeight: 800 }}>
                        MVP
                      </span>
                    )}
                    {isSecond && (
                      <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '6px', background: 'rgba(148, 163, 184, 0.25)', color: 'var(--text-muted)', fontWeight: 800 }}>
                        #2
                      </span>
                    )}
                    {isThird && (
                      <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '6px', background: 'rgba(249, 115, 22, 0.25)', color: '#ea580c', fontWeight: 800 }}>
                        #3
                      </span>
                    )}
                  </div>
                  <div className="guild-card-sub" style={{ fontSize: '0.72rem' }}>
                    {member.title}
                  </div>

                  {/* Contribution bar */}
                  <div style={{
                    height: '4px', borderRadius: '2px', background: 'rgba(0,0,0,0.1)',
                    marginTop: '6px', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(member.weeklyDamage / maxDamage) * 100}%`,
                      background: member.isUser ? 'linear-gradient(90deg, #d97706, #f59e0b)' : member.color,
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>

                {/* Damage & Action */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="guild-leader-damage" style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <span>{member.weeklyDamage.toLocaleString()}</span>
                    <GiCrossedSwords style={{ color: '#ef4444', fontSize: '0.88rem' }} />
                  </div>
                  <div className="guild-card-sub" style={{ fontSize: '0.7rem' }}>
                    {t('guild.raidDamage')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info Counter (Matching Study Passport bottom style) */}
      <div className="guild-card-footer">
        <span className="guild-footer-pill">
          <FaUsers style={{ fontSize: '0.78rem', opacity: 0.8 }} />
          <span>
            {t('guild.membersCount', { count: leaderboard.length }) || (isAr ? `${leaderboard.length} عضواً في النقابة` : `${leaderboard.length} guild members competing on the rank board`)}
          </span>
        </span>
      </div>
    </div>
  );
}
