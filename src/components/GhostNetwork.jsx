import { useState, useMemo } from 'react';
import AnimeFaceAvatar from './AnimeFaceAvatar';
import {
  FaGhost, FaTrophy, FaBolt, FaUserNinja, FaCheckCircle
} from 'react-icons/fa';
import { useTimeTracker, formatMinutes } from '../hooks/useAppHooks';
import { useRpgStorage } from '../hooks/useRpgStorage';
import { useInventoryStorage, ANIME_CHARACTERS } from '../hooks/useInventoryStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { todayKeyAt } from '../utils/dateKey';
import { playTick, playFanfare } from '../utils/sounds';
import './GhostNetwork.css';

// Default Challenger Shadow benchmark (4h / 240m daily target curve)
const BENCHMARK_CURVE = [
  { day: 'Mon', minutes: 210, xp: 525 },
  { day: 'Tue', minutes: 260, xp: 650 },
  { day: 'Wed', minutes: 240, xp: 600 },
  { day: 'Thu', minutes: 270, xp: 675 },
  { day: 'Fri', minutes: 220, xp: 550 },
  { day: 'Sat', minutes: 300, xp: 750 },
  { day: 'Sun', minutes: 240, xp: 600 },
];

export default function GhostNetwork() {
  const { t, lang, language } = useLanguage();
  const isAr = lang === 'ar' || language === 'ar' || document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  const { log, todayMinutes } = useTimeTracker();
  const { level, addXpAndCoins } = useRpgStorage();
  const { equippedAvatar } = useInventoryStorage();
  const activeChar = useMemo(() => {
    return ANIME_CHARACTERS.find(c => c.id === equippedAvatar) || ANIME_CHARACTERS[0];
  }, [equippedAvatar]);
  const [shadowMode, setShadowMode] = useState(() => {
    return localStorage.getItem('app_shadow_mode') || 'past_self'; // 'past_self' | 'challenger'
  });
  const [hasClaimedVictory, setHasClaimedVictory] = useState(false);

  // Compute 7-day comparison data (This Week vs 7 Days Ago)
  const raceData = useMemo(() => {
    const byDate = log?.byDate || {};
    const now = new Date();
    const days = [];
    let myWeekTotal = 0;
    let shadowWeekTotal = 0;
    let myDaysWon = 0;

    for (let i = 6; i >= 0; i--) {
      // Current week date
      const currentDate = new Date(now);
      currentDate.setDate(now.getDate() - i);
      const currentKey = todayKeyAt(currentDate);
      const currentMins = i === 0 ? todayMinutes : (byDate[currentKey] || 0);

      // Shadow date (exactly 7 days prior to currentDate)
      const shadowDate = new Date(currentDate);
      shadowDate.setDate(currentDate.getDate() - 7);
      const shadowKey = todayKeyAt(shadowDate);

      const dayLabel = currentDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short' });
      const dayIndex = (currentDate.getDay() + 6) % 7; // Mon = 0, Sun = 6

      let shadowMins;
      let isSynthetic = false;

      if (shadowMode === 'challenger') {
        shadowMins = BENCHMARK_CURVE[dayIndex]?.minutes || 240;
        isSynthetic = true;
      } else {
        const recorded = byDate[shadowKey];
        if (typeof recorded === 'number' && recorded > 0) {
          shadowMins = recorded;
        } else {
          // Fallback if no history exists for 7 days ago
          shadowMins = BENCHMARK_CURVE[dayIndex]?.minutes || 240;
          isSynthetic = true;
        }
      }

      myWeekTotal += currentMins;
      shadowWeekTotal += shadowMins;
      if (currentMins >= shadowMins && currentMins > 0) {
        myDaysWon++;
      }

      days.push({
        day: dayLabel,
        currentDate: currentKey,
        shadowDate: shadowKey,
        myMins: currentMins,
        shadowMins,
        isSynthetic,
        isToday: i === 0,
        won: currentMins >= shadowMins && currentMins > 0
      });
    }

    // Today's exact time-of-day pace estimation
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const dayPaceFraction = Math.min(1, Math.max(0.1, currentHour / 22)); // Active day: 0:00 to 22:00
    const todaySlot = days[days.length - 1];
    const shadowPaceExpected = Math.round(todaySlot.shadowMins * dayPaceFraction);
    const todayDiff = todayMinutes - shadowPaceExpected;

    return {
      days,
      myWeekTotal,
      shadowWeekTotal,
      myDaysWon,
      todayDiff,
      todayShadowTarget: todaySlot.shadowMins,
      shadowPaceExpected,
      isSyntheticFallback: days.some(d => d.isSynthetic && shadowMode === 'past_self'),
    };
  }, [log, todayMinutes, shadowMode, isAr]);

  const isAhead = raceData.todayDiff >= 0;
  const isDailyTargetBeaten = todayMinutes >= raceData.todayShadowTarget && raceData.todayShadowTarget > 0;

  const handleClaimDailyVictory = () => {
    if (hasClaimedVictory || !isDailyTargetBeaten) return;
    playFanfare();
    addXpAndCoins(100, 30, 'Defeated Shadow Self');
    setHasClaimedVictory(true);
  };

  const toggleShadowMode = (mode) => {
    setShadowMode(mode);
    localStorage.setItem('app_shadow_mode', mode);
    playTick();
  };

  return (
    <div className="arena-card ghost-network-card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <AnimeFaceAvatar
            id={equippedAvatar || 'chrollo'}
            size={48}
            borderColor={activeChar?.seriesColor || '#818cf8'}
            glow={true}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 className="shadow-card-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                {t('ghostNetwork.title')}
              </h3>
              <span className="shadow-badge-offline" style={{
                fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: 700,
                whiteSpace: 'nowrap'
              }}>
                {t('ghostNetwork.offline')}
              </span>
            </div>
            <p className="shadow-card-sub" style={{ margin: 0, fontSize: '0.8rem' }}>
              {t('ghostNetwork.subtitle')}
            </p>
          </div>
        </div>

        {/* Shadow Mode Selector */}
        <div className="shadow-mode-selector" style={{
          display: 'flex', background: 'var(--bg-hover)',
          borderRadius: '10px', padding: '3px', border: '1px solid var(--border-color)',
          flexShrink: 0
        }}>
          <button
            onClick={() => toggleShadowMode('past_self')}
            className={`shadow-mode-btn ${shadowMode === 'past_self' ? 'active-past' : ''}`}
            style={{
              background: shadowMode === 'past_self' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: shadowMode === 'past_self' ? '#818cf8' : 'var(--text-muted)',
              border: 'none', borderRadius: '7px', padding: '5px 10px',
              fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {t('ghostNetwork.pastSelf')}
          </button>
          <button
            onClick={() => toggleShadowMode('challenger')}
            className={`shadow-mode-btn ${shadowMode === 'challenger' ? 'active-challenger' : ''}`}
            style={{
              background: shadowMode === 'challenger' ? 'rgba(236, 72, 153, 0.25)' : 'transparent',
              color: shadowMode === 'challenger' ? '#ec4899' : 'var(--text-muted)',
              border: 'none', borderRadius: '7px', padding: '5px 10px',
              fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {t('ghostNetwork.challenger')}
          </button>
        </div>
      </div>

      {/* Live Today Race Track Panel */}
      <div className="shadow-panel-sub" style={{
        borderRadius: '16px',
        padding: '18px 20px',
        marginBottom: '20px',
        position: 'relative',
        background: 'var(--bg-hover)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaBolt style={{ color: isAhead ? '#10b981' : '#ef4444' }} />
            <span className="shadow-card-title" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
              {t('ghostNetwork.liveTrack')}
            </span>
          </div>
        </div>

        {/* Dual Progress Bar Track */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '14px 0' }}>
          {/* User Track */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaUserNinja /> {t('ghostNetwork.youToday', { level })}
              </span>
              <span className="shadow-card-title" style={{ fontWeight: 700 }}>
                {formatMinutes(todayMinutes)} / {formatMinutes(raceData.todayShadowTarget)} {t('ghostNetwork.target')}
              </span>
            </div>
            <div className="shadow-track-bar">
              <div style={{
                height: '100%',
                width: `${Math.min(100, (todayMinutes / Math.max(1, raceData.todayShadowTarget)) * 100)}%`,
                borderRadius: '6px',
                background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.5)',
                transition: 'width 0.8s ease'
              }} />
              {/* <div
                className="shadow-runner"
                style={{
                  left: `${Math.min(97, Math.max(3, (todayMinutes / Math.max(1, raceData.todayShadowTarget)) * 100))}%`
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', color: '#000', fontWeight: 800,
                  boxShadow: '0 0 12px #38bdf8'
                }}>
                  
                </div>
              </div> */}
            </div>
          </div>

          {/* Shadow Track */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ color: '#8b5cf6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaGhost /> {t('ghostNetwork.shadow')}
              </span>
            </div>
            <div className="shadow-track-bar">
              <div style={{
                height: '100%',
                width: `${Math.min(100, (raceData.shadowPaceExpected / Math.max(1, raceData.todayShadowTarget)) * 100)}%`,
                borderRadius: '6px',
                background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
                transition: 'width 0.8s ease'
              }} />
              <div
                className="shadow-runner"
                style={{
                  left: `${Math.min(97, Math.max(3, (raceData.shadowPaceExpected / Math.max(1, raceData.todayShadowTarget)) * 100))}%`
                }}
              >
              </div>
            </div>
          </div>
        </div>

        {/* Victory Claim Banner */}
        {isDailyTargetBeaten && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3))',
            border: '1px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaTrophy style={{ color: '#fbbf24', fontSize: '1.2rem' }} />
              <div>
                <div className="shadow-card-title" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {t('ghostNetwork.targetSurpassed')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                  {t('ghostNetwork.outworkedPast')}
                </div>
              </div>
            </div>
            {!hasClaimedVictory ? (
              <button
                onClick={handleClaimDailyVictory}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none',
                  background: '#10b981', color: '#fff', fontWeight: 800,
                  fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(16,185,129,0.4)'
                }}
              >
                {t('ghostNetwork.claimVictory')}
              </button>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaCheckCircle /> {t('ghostNetwork.victoryClaimed')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 7-Day Trajectory Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span className="shadow-card-title" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t('ghostNetwork.trajectory')}
          </span>
          <span style={{ fontSize: '0.75rem', color: raceData.myWeekTotal >= raceData.shadowWeekTotal ? '#10b981' : '#ef4444', fontWeight: 700 }}>
            {t('ghostNetwork.weekly', {
              you: formatMinutes(raceData.myWeekTotal),
              shadow: formatMinutes(raceData.shadowWeekTotal),
              won: raceData.myDaysWon
            })}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px'
        }}>
          {raceData.days.map((d, idx) => {
            const maxMin = Math.max(d.myMins, d.shadowMins, 1);
            return (
              <div key={idx} className="shadow-day-box" style={{
                borderRadius: '12px',
                padding: '10px 8px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-hover)',
                border: d.isToday ? '1.5px solid #818cf8' : '1px solid var(--border-color)',
                boxShadow: d.isToday ? '0 0 12px rgba(129, 140, 248, 0.25)' : undefined
              }}>
                <span className="shadow-card-sub" style={{ fontSize: '0.75rem', fontWeight: 700, color: d.isToday ? '#818cf8' : undefined }}>
                  {d.day}
                </span>

                {/* Vertical mini comparison bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '48px', margin: '4px 0' }}>
                  {/* You */}
                  <div style={{
                    width: '10px',
                    height: `${Math.max(8, (d.myMins / maxMin) * 100)}%`,
                    borderRadius: '3px 3px 0 0',
                    background: d.won ? '#10b981' : '#38bdf8',
                    transition: 'height 0.5s'
                  }} title={`You: ${formatMinutes(d.myMins)}`} />

                  {/* Shadow */}
                  <div style={{
                    width: '10px',
                    height: `${Math.max(8, (d.shadowMins / maxMin) * 100)}%`,
                    borderRadius: '3px 3px 0 0',
                    background: '#a855f7',
                    opacity: 0.7,
                    transition: 'height 0.5s'
                  }} title={`Shadow: ${formatMinutes(d.shadowMins)}`} />
                </div>

                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: d.won ? '#10b981' : '#ef4444'
                }}>
                  {d.myMins > 0 ? (d.won ? t('ghostNetwork.win') : t('ghostNetwork.loss')) : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
