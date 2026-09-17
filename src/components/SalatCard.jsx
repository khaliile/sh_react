import {
  FaCheck,
  FaLock,
  FaMosque,
} from 'react-icons/fa';
import {
  MdOutlineNightlight,
  MdOutlineWbSunny,
  MdOutlineWbTwilight,
  MdOutlineNightsStay,
  MdOutlineWbCloudy,
} from 'react-icons/md';
import { GiPrayer, GiStarMedal } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';
import {
  useSalatStorage,
  SALAT_LIST,
} from '../hooks/useSalatStorage';
import './SalatCard.css';

// ─── Prayer time-of-day icons (vector, no emoji) ────────────────────────────
const PRAYER_ICONS = {
  fajr:    MdOutlineNightlight,   // pre-dawn
  dhuhr:   MdOutlineWbSunny,      // midday
  asr:     MdOutlineWbCloudy,     // afternoon
  maghrib: MdOutlineWbTwilight,   // sunset
  isha:    MdOutlineNightsStay,   // night
};

// ─── Prayer time-of-day icon colors ─────────────────────────────────────────
const PRAYER_COLORS = {
  fajr:    '#3b82f6',
  dhuhr:   '#f59e0b',
  asr:     '#10b981',
  maghrib: '#f97316',
  isha:    '#8b5cf6',
};

/* ══════════════════════════════════════════════════════════
   Main Salat Card (Spacious, modern, beautifully aligned)
══════════════════════════════════════════════════════════ */
export default function SalatCard({ isAr = false }) {
  const {
    totalPoints,
    todayPoints,
    todayDoneCount,
    todayMosqueCount,
    getPrayerState,
    togglePrayer,
    toggleMosque,
  } = useSalatStorage();

  const allDone   = todayDoneCount === 5;
  const maxPts    = 10; // 5 × 2
  const fillPct   = Math.min(100, Math.round((todayPoints / maxPts) * 100));

  return (
    <div className={`sc-card${allDone ? ' sc-card-complete' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Header ── */}
      <div className="sc-head">
        <span className="sc-head-icon">
          <GiPrayer size={20} />
        </span>
        <div className="sc-head-text">
          <span className="sc-head-title">
            {isAr ? 'الصلوات اليومية' : 'Daily Prayers'}
          </span>
          <span className="sc-head-sub">
            {isAr
              ? `${todayDoneCount}/5 صلوات · ${todayMosqueCount} بالمسجد`
              : `${todayDoneCount}/5 prayers · ${todayMosqueCount} at mosque`}
          </span>
        </div>
        <div className="sc-head-actions">
          {/* SP counter */}
          <div className="sc-sp-badge" title={isAr ? 'النقاط المتراكمة (مستقلة عن XP والعملات)' : 'Salat Points – independent from XP & Coins'}>
            <GiStarMedal size={12} />
            <span>{isAr ? `${totalPoints} نقطة` : `${totalPoints} SP`}</span>
          </div>
        </div>
      </div>

      {/* ── Column Headers ── */}
      <div className="sc-cols-header">
        <span className="sc-col-h sc-col-h-prayer">
          {isAr ? 'الصلاة' : 'Prayer'}
        </span>
        <span className="sc-col-h sc-col-h-pts">
          {isAr ? 'المكافأة' : 'Reward'}
        </span>
        <span className="sc-col-h sc-col-h-check">
          {isAr ? 'أُدِّيت' : 'Prayed'}
        </span>
        <span className="sc-col-h sc-col-h-mosque">
          {isAr ? 'مسجد' : 'Mosque'}
        </span>
      </div>

      {/* ── Prayer Rows ── */}
      <div className="sc-rows">
        {SALAT_LIST.map(prayer => {
          const state         = getPrayerState(prayer.id);
          const isDone        = state.done || state.mosque;
          const isMosque      = state.mosque;
          const mosqueLocked  = !state.done && !state.mosque; // must pray first
          const PrayerIcon    = PRAYER_ICONS[prayer.id] || MdOutlineWbSunny;
          const prayerColor   = PRAYER_COLORS[prayer.id] || '#3b82f6';
          const earnedPts     = isMosque ? 2 : isDone ? 1 : 0;

          return (
            <div
              key={prayer.id}
              className={`sc-row ${isDone ? 'sc-row-done' : ''} ${isMosque ? 'sc-row-mosque' : ''}`}
            >
              {/* Prayer Name & Time with Spacious Badge */}
              <div className="sc-prayer-info">
                <span className="sc-prayer-badge" style={{ color: prayerColor }}>
                  <PrayerIcon size={16} />
                </span>
                <div className="sc-prayer-text-wrap">
                  <span className="sc-prayer-name">
                    {isAr ? prayer.nameAr : prayer.nameEn}
                  </span>
                  <span className="sc-prayer-time">{prayer.time}</span>
                </div>
              </div>

              {/* Earned Points indicator */}
              <div className="sc-pts-col">
                <span className={`sc-pts-tag ${earnedPts > 0 ? 'active' : ''}`}>
                  {earnedPts === 2
                    ? (isAr ? 'نقطتين' : '+2 SP')
                    : earnedPts === 1
                    ? (isAr ? 'نقطة' : '+1 SP')
                    : (isAr ? '0 نقطة' : '0 SP')}
                </span>
              </div>

              {/* Checkbox 1: Done (+1) */}
              <div className="sc-check-col">
                <label
                  className={`sc-custom-cb sc-cb-done ${isDone ? 'checked' : ''}`}
                  title={isAr ? 'تمت الصلاة (نقطة)' : 'Prayed (+1 SP)'}
                >
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => togglePrayer(prayer.id)}
                    aria-label={`${prayer.nameEn} prayed`}
                  />
                  <span className="sc-cb-box">
                    {isDone && <FaCheck size={10} />}
                  </span>
                </label>
              </div>

              {/* Checkbox 2: In Mosque (+2) — with Logic Gate lock */}
              <div className="sc-check-col">
                <label
                  className={`sc-custom-cb sc-cb-mosque ${isMosque ? 'checked' : ''} ${mosqueLocked ? 'locked' : ''}`}
                  title={
                    mosqueLocked
                      ? (isAr ? 'يجب تأكيد أداء الصلاة أولاً' : 'Must mark prayer done first')
                      : (isAr ? 'صلاة في المسجد (نقطتين)' : 'Prayed in mosque (+2 SP)')
                  }
                >
                  <input
                    type="checkbox"
                    checked={isMosque}
                    disabled={mosqueLocked}
                    onChange={() => toggleMosque(prayer.id)}
                    aria-label={`${prayer.nameEn} at mosque`}
                  />
                  <span className="sc-cb-box sc-cb-box-mosque">
                    {mosqueLocked ? (
                      <FaLock size={8} className="sc-lock-icon" />
                    ) : isMosque ? (
                      <FaMosque size={10} />
                    ) : null}
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="sc-foot">
        {/* Progress bar */}
        <div className="sc-progress-wrap">
          <div className="sc-progress-bar">
            <div
              className={`sc-progress-fill${allDone ? ' sc-fill-complete' : ''}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <span className="sc-progress-text">
            {todayPoints}/10 {isAr ? 'نقاط اليوم' : 'SP today'}
          </span>
        </div>

        {/* Legend */}
        <div className="sc-legend">
          <span className="sc-legend-prayer">
            <FaCheck size={9} />
            {isAr ? 'صلاة = نقطة' : 'Prayer = +1 SP'}
          </span>
          <span className="sc-legend-mosque">
            <FaMosque size={10} />
            {isAr ? 'مسجد = نقطتين' : 'Mosque = +2 SP'}
          </span>
          <span className="sc-legend-lock">
            <FaLock size={9} />
            {isAr ? 'المسجد يتطلب الصلاة أولاً' : 'Mosque requires Prayed first'}
          </span>
        </div>

        {/* All-done banner */}
        {allDone && (
          <div className="sc-done-banner">
            <BsStars size={12} />
            {isAr ? 'أكملت جميع صلوات اليوم — بارك الله فيك!' : 'All 5 prayers complete today!'}
          </div>
        )}
      </div>
    </div>
  );
}
