import React, { useState, useMemo } from 'react';
import {
  FaSkull, FaPlus, FaTrophy, FaCheckCircle, FaExclamationTriangle,
  FaMobile, FaBed, FaTv, FaCoffee, FaGamepad, FaCommentSlash,
  FaCrosshairs, FaLock, FaMoon, FaLayerGroup
} from 'react-icons/fa';
import { GiPirateFlag, GiWantedReward, GiCrossedSwords } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import './BountyHuntPage.css';

const HABIT_ICONS = {
  phone: <FaMobile />,
  skip: <FaBed />,
  tv: <FaTv />,
  cram: <FaExclamationTriangle />,
  caffeine: <FaCoffee />,
  game: <FaGamepad />,
  night: <FaMoon />,
  tabs: <FaLayerGroup />,
};

const DEFAULT_HABITS_DATA = [
  { id: 'phone', nameEn: 'Phone Doom-Scroll', nameAr: 'التمرير اللانهائي على الهاتف', descEn: 'Mindless social media during study hours', descAr: 'إضاعة الوقت في مواقع التواصل أثناء جلسات المذاكرة', bounty: 500, icon: <FaMobile /> },
  { id: 'skip',  nameEn: 'Session Skipping',  nameAr: 'تفويت الجلسات الدراسية', descEn: 'Breaking streaks without valid reason', descAr: 'كسر سلسلة الأيام وتأجيل الجلسة دون عذر', bounty: 750, icon: <FaBed /> },
  { id: 'tv',    nameEn: 'Background TV',     nameAr: 'تشغيل الشاشات في الخلفية', descEn: 'Studying with Netflix/YouTube running', descAr: 'المذاكرة مع مقاطع يوتيوب أو مسلسلات قيد التشغيل', bounty: 400, icon: <FaTv /> },
  { id: 'cram',  nameEn: 'Last-Minute Cram',  nameAr: 'الحشو في اللحظة الأخيرة', descEn: 'Delaying until panic mode activates', descAr: 'التأجيل حتى تفعيل وضع الذعر قبل الموعد النهائي', bounty: 600, icon: <FaExclamationTriangle /> },
  { id: 'caffeine', nameEn: 'Caffeine Crash',  nameAr: 'الإفراط في الكافيين والمنبهات', descEn: 'Over-relying on stimulants to focus', descAr: 'الاعتماد المفرط على المنبهات ومشروبات الطاقة للتركيز', bounty: 300, icon: <FaCoffee /> },
  { id: 'game',  nameEn: 'Mid-Session Gaming', nameAr: 'اللعب السريع أثناء الجلسة', descEn: 'Switching to games during study blocks', descAr: 'الانتقال للعب في فترات الراحة القصيرة وتضييع الوقت', bounty: 550, icon: <FaGamepad /> },
  { id: 'night', nameEn: 'Late-Night Drift',   nameAr: 'السهر العبثي والتأجيل الليلي', descEn: 'Sacrificing sleep and focus for revenge screen time', descAr: 'التضحية بالنوم والتركيز بالتصفح العبثي المتأخر', bounty: 450, icon: <FaMoon /> },
  { id: 'tabs',  nameEn: 'Tab Hoarding Chaos', nameAr: 'فوضى النوافذ والتشتت المتعدد', descEn: 'Opening 50 tabs and drowning in multitask paralysis', descAr: 'فتح عشرات التبويبات والغرق في التشتت متعدد المهام', bounty: 350, icon: <FaLayerGroup /> },
];

function loadHabits() {
  try {
    const saved = JSON.parse(localStorage.getItem('bounty_habits') || 'null');
    if (saved && Array.isArray(saved)) {
      const savedIds = new Set(saved.map(s => s.id));
      const missingDefaults = DEFAULT_HABITS_DATA.filter(d => !savedIds.has(d.id));
      if (missingDefaults.length > 0) {
        const merged = [...saved, ...missingDefaults];
        try {
          localStorage.setItem('bounty_habits', JSON.stringify(merged.map(h => ({ ...h, icon: undefined }))));
        } catch {}
        return merged;
      }
      return saved;
    }
    return DEFAULT_HABITS_DATA;
  } catch { return DEFAULT_HABITS_DATA; }
}

function loadClaimed() {
  try { return JSON.parse(localStorage.getItem('bounty_claimed') || '[]'); }
  catch { return []; }
}

export default function BountyHuntPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const [habits, setHabits] = useState(loadHabits);
  const [claimed, setClaimed] = useState(loadClaimed);
  const [newHabit, setNewHabit] = useState('');
  const [newBounty, setNewBounty] = useState('');

  const totalCollected = useMemo(() =>
    claimed.reduce((sum, id) => {
      const h = habits.find(h => h.id === id);
      return sum + (h?.bounty || 0);
    }, 0), [claimed, habits]);

  const claimBounty = (id) => {
    const next = [...claimed, id];
    setClaimed(next);
    try {
      localStorage.setItem('bounty_claimed', JSON.stringify(next));
    } catch {}
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const id = `custom_${Date.now()}`;
    const bounty = parseInt(newBounty, 10) || 300;
    const newEntry = {
      id,
      nameEn: newHabit.trim(),
      nameAr: newHabit.trim(),
      descEn: 'Custom bad habit bounty',
      descAr: 'مكافأة عادة سيئة مخصصة',
      bounty,
      icon: <FaSkull />
    };
    const updated = [...habits, newEntry];
    setHabits(updated);
    const toSave = updated.map(h => ({ ...h, icon: undefined }));
    try {
      localStorage.setItem('bounty_habits', JSON.stringify(toSave));
    } catch {}
    setNewHabit('');
    setNewBounty('');
  };

  const leaderboardData = [
    { rank: 1, name: isRTL ? 'نسختك المستقبلية' : 'FutureSelf_2025', score: 3 },
    { rank: 2, name: isRTL ? 'أنت (الآن)' : 'You (current)', score: claimed.length },
    { rank: 3, name: isRTL ? 'نسختك السابقة' : 'PastSelf_Past', score: 0 },
  ];

  return (
    <div className={`bounty-hunt ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bounty-header">
        <h1>
          <GiPirateFlag style={{ display: 'inline', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem', verticalAlign: 'middle' }} />
          {isRTL ? 'صيد المكافآت — مطاردة العادات السيئة' : 'Bounty Hunt'}
        </h1>
        <p>
          {isRTL
            ? 'ضع ملصقات مكافأة على أسوأ عاداتك — واقبض عليها واكشفها حين تقع في فخها'
            : 'Set bounties on your worst habits — claim them when you catch yourself slipping'}
        </p>
        <span className="bounty-badge">
          <FaCrosshairs style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
          {isRTL ? `${claimed.length} عادة تم ضبطها` : `${claimed.length} Bounties Claimed`}
        </span>
      </div>

      {/* ── Wanted Posters ── */}
      <div className="bounty-grid">
        {habits.map(h => {
          const isClaimed = claimed.includes(h.id);
          const name = isRTL ? (h.nameAr || h.nameEn || h.name) : (h.nameEn || h.name);
          const desc = isRTL ? (h.descAr || h.descEn || h.desc) : (h.descEn || h.desc);
          return (
            <div key={h.id} className={`bounty-poster ${isClaimed ? 'claimed' : ''}`}>
              <div className="bounty-poster-label">
                <GiWantedReward style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
                {isRTL ? 'مطلوب للمحاكمة' : 'Wanted'}
              </div>
              <div className="bounty-habit-icon">{HABIT_ICONS[h.id] || h.icon || <FaSkull />}</div>
              <div className="bounty-habit-name">{name}</div>
              <p className="bounty-habit-desc">{desc}</p>
              <div className="bounty-amount-label">{isRTL ? 'قيمة المكافأة' : 'Bounty'}</div>
              <div className="bounty-amount">{h.bounty.toLocaleString()} XP</div>
              <button
                className={`bounty-claim-btn ${isClaimed ? 'claimed' : 'active'}`}
                onClick={() => !isClaimed && claimBounty(h.id)}
              >
                {isClaimed
                  ? <><FaCheckCircle /> {isRTL ? 'تم الضبط والاعتراف' : 'Claimed'}</>
                  : <><FaCrosshairs /> {isRTL ? 'ارتكبت هذه العادة اليوم' : 'I Did This'}</>
                }
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Add Custom Habit ── */}
      <div className="bounty-add-section">
        <h3><FaPlus /> {isRTL ? 'أضف ملصق مكافأة لعادة خاصة بك' : 'Post Your Own Bounty'}</h3>
        <div className="bounty-add-row">
          <input
            className="bounty-add-input"
            placeholder={isRTL ? 'اسم العادة السيئة...' : 'Name your bad habit...'}
            value={newHabit}
            onChange={e => setNewHabit(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addHabit()}
          />
          <input
            className="bounty-add-input"
            placeholder={isRTL ? 'نقاط XP' : 'XP Bounty'}
            type="number"
            value={newBounty}
            onChange={e => setNewBounty(e.target.value)}
            style={{ maxWidth: '110px' }}
          />
          <button className="bounty-add-btn" onClick={addHabit}>
            <GiPirateFlag /> {isRTL ? 'نشر الملصق' : 'Post It'}
          </button>
        </div>
      </div>

      {/* ── Leaderboard ── */}
      <div className="bounty-leaderboard">
        <h3><FaTrophy /> {isRTL ? 'لوحة المساءلة والاعتراف' : 'Accountability Board'}</h3>
        <div style={{
          background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem',
          fontSize: '0.85rem', color: '#a08040', display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <FaTrophy style={{ color: '#fbbf24' }} />
          {isRTL
            ? <span>إجمالي قيمة العادات المضبوطة: <strong style={{ color: '#fbbf24' }}>{totalCollected.toLocaleString()} XP</strong></span>
            : <span>Total bounties collected: <strong style={{ color: '#fbbf24' }}>{totalCollected.toLocaleString()} XP</strong></span>}
        </div>
        {leaderboardData.map(r => (
          <div className="bounty-lb-row" key={r.rank}>
            <span className="bounty-lb-rank">#{r.rank}</span>
            <span className="bounty-lb-name">{r.name}</span>
            <span className="bounty-lb-score">{r.score} {isRTL ? 'تم ضبطها' : 'claimed'}</span>
          </div>
        ))}
        <div className="bounty-lb-row">
          <span className="bounty-lb-rank" style={{ color: '#60a5fa' }}>—</span>
          <span className="bounty-lb-name" style={{ color: '#60a5fa' }}>
            <FaLock style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
            {isRTL ? 'التحديات التنافسية قريبًا' : 'Multiplayer coming soon'}
          </span>
          <span className="bounty-lb-score" style={{ color: '#64748b' }}>{isRTL ? 'مغلق' : 'locked'}</span>
        </div>
      </div>
    </div>
  );
}
