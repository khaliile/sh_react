import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';
import { todayKey, todayKeyAt } from '../utils/dateKey';
import { playTick, playFanfare } from '../utils/sounds';
import { useLanguage } from '../contexts/LanguageContext';
import {
  FaSkull,
  FaGhost,
  FaFire,
  FaShieldAlt,
  FaMoon,
  FaTimes,
  FaCheck,
  FaHourglassHalf,
  FaCalendarTimes,
  FaBolt,
} from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import './DeadHoursGraveyard.css';

const EPITAPHS = [
  'Here lies a forgotten day',
  'Lost to the digital void',
  'Never to return',
  'Claimed by the scrolling vortex',
  'No focus sessions logged',
  'The void swallowed this potential',
  'Defeated by procrastination',
  'Consumed by inertia',
  'Fell into the rabbit hole of distractions',
  'Slain by "Tomorrow Syndrome"',
  'Buried beneath hesitation',
  'Wasted in the fog of fatigue',
];

const EPITAPHS_AR = [
  'هنا يرقد يومٌ طواه النسيان',
  'ضاع في الفراغ الرقمي',
  'يومٌ لن يعود أبداً',
  'ابتلعته دوامة التصفح اللانهائي',
  'لم تُسجل أي جلسة تركيز',
  'ابتلع الفراغ كل طاقات هذا اليوم',
  'هزمه التسويف والمماطلة',
  'استسلم للخمول والكسل',
  'سقط في فخ التشتت وضياع الوقت',
  'قضت عليه متلازمة "سأبدأ غداً"',
  'دُفن تحت ركام التردد',
  'تبدد في ضباب الإرهاق',
];

const CAUSES_OF_DEATH = [
  'Paralyzed by decision fatigue and endless tabs',
  'Seduced by the siren song of short-form feeds',
  'Trapped in the "I will start in 5 minutes" paradox',
  'Lost in the infinite scroll abyss',
  'Victim of the myth that "tomorrow has 48 hours"',
  'Overwhelmed by resistance, zero quests launched',
  'Defeated by couch inertia & phantom exhaustion',
  'Wandering aimlessly in algorithmically tuned loops',
];

const CAUSES_OF_DEATH_AR = [
  'شلل التفكير وتراكم التبويبات المفتوحة',
  'الانجراف وراء مقاطع الفيديو القصيرة',
  'فخ "سأبدأ بعد 5 دقائق فقط"',
  'الغرق في هاوية التصفح العشوائي',
  'وهم "أن الغد يحتوي على 48 ساعة"',
  'الاستسلام للمقاومة وعدم بدء أي جلسة',
  'خمول الأريكة والإرهاق الوهمي',
  'التنقل التائه بين خوارزميات التواصل',
];

export default function DeadHoursGraveyard() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [log] = useAppStorage('app_time_log', { byDate: {} });
  const [honoredGraves, setHonoredGraves] = useAppStorage('study_graveyard_honored', {});

  // Interactive controls
  const [rangeDays, setRangeDays] = useState(30);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'weekends' | 'weekdays'
  const [vigilActive, setVigilActive] = useState(false);
  const [selectedGrave, setSelectedGrave] = useState(null);

  // Check today's study state
  const todayStr = todayKey();
  const studiedToday = (log.byDate?.[todayStr] || 0) > 0;

  // Compute all lost days in range
  const allGraves = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = 1; i <= rangeDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = todayKeyAt(d);
      const mins = log.byDate?.[key] || 0;
      if (mins === 0) {
        const epitaphIdx = (d.getDate() + d.getMonth()) % EPITAPHS.length;
        const causeIdx = (d.getDate() * 3 + d.getMonth() * 7) % CAUSES_OF_DEATH.length;
        const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        result.push({
          key,
          label: d.toLocaleDateString(isAr ? 'ar-u-nu-latn' : 'en-US', { month: 'short', day: 'numeric' }),
          dayName: d.toLocaleDateString(isAr ? 'ar-u-nu-latn' : 'en-US', { weekday: 'short' }),
          fullDate: d.toLocaleDateString(isAr ? 'ar-u-nu-latn' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          epitaph: isAr ? EPITAPHS_AR[epitaphIdx] : EPITAPHS[epitaphIdx],
          causeOfDeath: isAr ? CAUSES_OF_DEATH_AR[causeIdx] : CAUSES_OF_DEATH[causeIdx],
          daysAgo: i,
          isWeekend,
          dayOfWeek,
        });
      }
    }
    return result;
  }, [log.byDate, rangeDays, isAr]);

  // Filter graves by weekend/weekday
  const filteredGraves = useMemo(() => {
    if (activeFilter === 'weekends') {
      return allGraves.filter(g => g.isWeekend);
    }
    if (activeFilter === 'weekdays') {
      return allGraves.filter(g => !g.isWeekend);
    }
    return allGraves;
  }, [allGraves, activeFilter]);

  // High-level statistics
  const totalLostHours = allGraves.length * 14; // ~14 usable hours
  const totalLostXP = allGraves.length * 700;   // ~700 XP equivalent
  const mortalityPct = rangeDays > 0 ? Math.round((allGraves.length / rangeDays) * 100) : 0;

  // Most Lethal Day of Week
  const mostLethalDay = useMemo(() => {
    if (allGraves.length === 0) return isAr ? 'لا يوجد' : 'None';
    const counts = {};
    allGraves.forEach(g => {
      counts[g.dayName] = (counts[g.dayName] || 0) + 1;
    });
    let maxDay = isAr ? 'لا يوجد' : 'None';
    let maxCount = 0;
    Object.entries(counts).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxDay = `${day} (${count})`;
      }
    });
    return maxDay;
  }, [allGraves, isAr]);

  // Necropolis Threat Level Tier
  const threatTier = useMemo(() => {
    if (allGraves.length === 0) {
      return {
        title: 'Hallowed Sanctuary',
        titleAr: 'الملاذ المقدس',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.3)',
        Icon: FaShieldAlt,
      };
    }
    if (allGraves.length <= 5) {
      return {
        title: 'Whispering Fog',
        titleAr: 'ضباب هامس',
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.3)',
        Icon: FaMoon,
      };
    }
    if (allGraves.length <= 12) {
      return {
        title: 'Haunted Crypt',
        titleAr: 'السرداب المسكون',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
        Icon: FaGhost,
      };
    }
    return {
      title: 'Cursed Necropolis',
      titleAr: 'المقبرة الملعونة',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      Icon: FaSkull,
    };
  }, [allGraves.length]);

  // Pay Respects / Vow Redemption Handler
  const handlePayRespects = useCallback((grave) => {
    if (!grave) return;
    setHonoredGraves(prev => ({
      ...prev,
      [grave.key]: true,
    }));
    playFanfare();
  }, [setHonoredGraves]);

  // Key listener for 'F' to pay respects when modal is open
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.key === 'f' || e.key === 'F') && selectedGrave && !honoredGraves[selectedGrave.key]) {
        handlePayRespects(selectedGrave);
      }
      if (e.key === 'Escape' && selectedGrave) {
        setSelectedGrave(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedGrave, honoredGraves, handlePayRespects]);

  const ThreatIcon = threatTier.Icon;

  return (
    <div className="arena-card graveyard-card" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Top Header ── */}
      <div className="graveyard-header-wrap">
        <div className="graveyard-title-col">
          <div className="graveyard-title-row">
            <FaSkull className="graveyard-title-icon" />
            <h3 className="graveyard-title">{isAr ? 'مقبرة الساعات الضائعة' : 'Dead Hours Graveyard'}</h3>
            <span
              className="graveyard-threat-badge"
              style={{
                color: threatTier.color,
                background: threatTier.bg,
                borderColor: threatTier.border,
              }}
            >
              <ThreatIcon size={11} /> {isAr ? threatTier.titleAr : threatTier.title} ({allGraves.length})
            </span>
          </div>
          <p className="graveyard-sub">
            {isAr ? 'أيام ضاعت في الفراغ — لن تعود أبداً' : 'Days lost to the void — never coming back'}
          </p>
        </div>

        {/* Right Actions & Badges */}
        <div className="graveyard-actions-wrap">
          {allGraves.length > 0 && (
            <>
              <div className="graveyard-stat-pill graveyard-stat-hours" title={isAr ? 'ساعات النهار القابلة للاستغلال التي ضاعت بدون دراسة' : 'Estimated usable daytime hours lost to zero study'}>
                <FaHourglassHalf size={11} /> {isAr ? `ضياع ~${totalLostHours} س` : `~${totalLostHours}h lost`}
              </div>
              <div className="graveyard-stat-pill graveyard-stat-xp" title={isAr ? 'نقاط خبرة مفقودة في الفراغ' : 'Estimated RPG Quest XP vanished into the void'}>
                <FaBolt size={10} /> {isAr ? `~${totalLostXP} خبرة مفقودة` : `~${totalLostXP} Ghost XP`}
              </div>
              <div className="graveyard-stat-pill graveyard-stat-day" title={isAr ? 'اليوم الأكثر تكراراً في أيام الانقطاع' : 'Day of the week with the most zero-study days'}>
                <FaCalendarTimes size={11} /> {isAr ? `الأكثر خسارة: ${mostLethalDay}` : `Lethal: ${mostLethalDay}`}
              </div>
            </>
          )}

          {/* Vigil Mode Button */}
          <button
            className={`graveyard-vigil-btn ${vigilActive ? 'active' : ''}`}
            onClick={() => {
              setVigilActive(v => !v);
              playTick();
            }}
            title={vigilActive ? (isAr ? 'الشعلة مضاءة في المقبرة' : 'Vigil is lit across the graveyard') : (isAr ? 'إشعال شموع التحفيز' : 'Light vigil candles at all graves for motivation')}
          >
            <FaFire size={11} />
            {vigilActive ? (isAr ? 'الشعلة مشتعلة' : 'Vigil Burning') : (isAr ? 'إشعال الشموع' : 'Light Vigil')}
          </button>
        </div>
      </div>

      {/* ── Filter Bar (Range & Day Types) ── */}
      <div className="graveyard-filter-bar">
        <div className="graveyard-btn-group">
          <button
            className={`graveyard-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            {isAr ? `كل الضائعة (${allGraves.length})` : `All Lost (${allGraves.length})`}
          </button>
          <button
            className={`graveyard-filter-btn ${activeFilter === 'weekends' ? 'active' : ''}`}
            onClick={() => setActiveFilter('weekends')}
          >
            {isAr ? `عطلات الأسبوع (${allGraves.filter(g => g.isWeekend).length})` : `Weekends (${allGraves.filter(g => g.isWeekend).length})`}
          </button>
          <button
            className={`graveyard-filter-btn ${activeFilter === 'weekdays' ? 'active' : ''}`}
            onClick={() => setActiveFilter('weekdays')}
          >
            {isAr ? `أيام الأسبوع (${allGraves.filter(g => !g.isWeekend).length})` : `Weekdays (${allGraves.filter(g => !g.isWeekend).length})`}
          </button>
        </div>

        <div className="graveyard-btn-group">
          <button
            className={`graveyard-filter-btn ${rangeDays === 30 ? 'active' : ''}`}
            onClick={() => setRangeDays(30)}
          >
            {isAr ? '30 يوماً' : '30 Days'}
          </button>
          <button
            className={`graveyard-filter-btn ${rangeDays === 14 ? 'active' : ''}`}
            onClick={() => setRangeDays(14)}
          >
            {isAr ? '14 يوماً' : '14 Days'}
          </button>
          <button
            className={`graveyard-filter-btn ${rangeDays === 7 ? 'active' : ''}`}
            onClick={() => setRangeDays(7)}
          >
            {isAr ? '7 أيام' : '7 Days'}
          </button>
        </div>
      </div>

      {/* ── Panoramic Graveyard Scene ── */}
      {filteredGraves.length === 0 ? (
        <div className="graveyard-hallowed-empty">
          <FaShieldAlt className="graveyard-hallowed-icon" />
          <h4 className="graveyard-hallowed-title">
            {isAr ? 'الملاذ المقدس — لا توجد أيام ضائعة!' : 'Hallowed Sanctuary — No Fallen Days!'}
          </h4>
          <p className="graveyard-hallowed-sub">
            {allGraves.length === 0
              ? (isAr ? `لقد سجلت جلسات دراسة في كل يوم خلال آخر ${rangeDays} يوماً. انضباط أسطوري!` : `You've logged study sessions on every single day in the last ${rangeDays} days. Pure discipline.`)
              : (isAr ? `لا توجد مقابر تحت التصنيف المحدد.` : `No graves found under the selected filter (${activeFilter}).`)}
          </p>
        </div>
      ) : (
        <div className={`graveyard-scene-container ${vigilActive ? 'vigil-active' : ''}`}>
          {/* Celestial Twilight Sky */}
          <div className="graveyard-celestial-sky" />

          {/* Crescent Moon */}
          <div className="graveyard-lunar-moon">
            <div className="lunar-crescent" />
          </div>

          {/* Distant Mountain Silhouettes & Dead Trees SVG */}
          <svg className="graveyard-silhouette-layer" viewBox="0 0 1000 70" preserveAspectRatio="none" fill="none">
            {/* Distant Mountains */}
            <path className="graveyard-mountain-path" d="M0 70 L80 40 L160 55 L280 30 L390 50 L520 25 L640 45 L760 30 L880 50 L1000 35 L1000 70 Z" />
            {/* Dead Tree Left */}
            <path className="graveyard-tree-path" d="M40 70 L43 35 L40 28 L43 28 L48 20 L46 28 L52 25 L47 32 L46 70 Z" />
            <path className="graveyard-tree-path" d="M41 45 L30 38 L32 36 L42 41 Z" />
            <path className="graveyard-tree-path" d="M45 42 L55 35 L53 33 L44 39 Z" />
            {/* Dead Tree Right */}
            <path className="graveyard-tree-path" d="M920 70 L923 32 L920 25 L924 25 L929 18 L927 25 L933 22 L928 29 L926 70 Z" />
            <path className="graveyard-tree-path" d="M922 46 L912 39 L914 37 L923 42 Z" />
            <path className="graveyard-tree-path" d="M925 43 L935 36 L933 34 L924 40 Z" />
            {/* Cathedral Crypt Spire in Center */}
            <path className="graveyard-crypt-path" d="M485 70 L488 40 L490 22 L492 40 L495 70 Z" />
          </svg>

          {/* Floating Soul Wisps */}
          <div className="graveyard-soul-wisps">
            <span className="soul-wisp" style={{ left: '15%', animationDelay: '0s' }} />
            <span className="soul-wisp" style={{ left: '32%', animationDelay: '1.8s' }} />
            <span className="soul-wisp" style={{ left: '55%', animationDelay: '3.4s' }} />
            <span className="soul-wisp" style={{ left: '72%', animationDelay: '0.9s' }} />
            <span className="soul-wisp" style={{ left: '88%', animationDelay: '2.5s' }} />
          </div>

          {/* Vigil Active Quote Banner */}
          {vigilActive && (
            <div className="graveyard-vigil-quote">
              <FaFire size={10} color="#f59e0b" />
              {isAr ? '"دُفن الماضي، لكن الغد لم يُكتب بعد. انهض وانتصر."' : '"The past is buried, but tomorrow is unwritten. Rise and conquer."'}
            </div>
          )}

          {/* Panoramic Tombstones Ground */}
          <div className="graveyard-stones-panoramic">
            {filteredGraves.map((g, i) => {
              const isHonored = !!honoredGraves[g.key];
              const isSelected = selectedGrave?.key === g.key;
              const themeVar = (i % 3) + 1;

              return (
                <div
                  key={g.key}
                  className={`tombstone-rpg ts-theme-${themeVar} ${isHonored ? 'honored' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{ '--ts-delay': `${(i % 15) * 0.05}s` }}
                  onClick={() => {
                    setSelectedGrave(g);
                    playTick();
                  }}
                  title={`${g.fullDate} — ${isAr ? 'انقر للمعاينة وقطع العهد' : 'Click to inspect & pay respects'}`}
                >
                  <div className="ts-arch-rpg" />
                  <div className="ts-body-rpg">
                    <span className="ts-rip-text">{isAr ? 'فُقِد' : 'R.I.P'}</span>
                    <span className="ts-day-text">{g.dayName}</span>
                    <span className="ts-date-text">{g.label}</span>
                    <span className="ts-cross-icon">{isHonored ? '★' : '†'}</span>
                  </div>
                  <div className="ts-base-rpg" />

                  {/* 3D Candle when Vigil is Active */}
                  {vigilActive && (
                    <div className="ts-candle-wrap">
                      <div className="ts-candle-flame" />
                      <div className="ts-candle-stick" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Ground & Rolling Fog */}
          <div className="graveyard-ground-shelf" />
          <div className="graveyard-fog-layer fog-left" />
          <div className="graveyard-fog-layer fog-right" />
        </div>
      )}

      {/* ── Bottom Necropolis Analytics & Defense Ribbon ── */}
      <div className="graveyard-analytics-ribbon">
        {/* Card 1: Void Mortality */}
        <div className="graveyard-ribbon-card">
          <div className="ribbon-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <FaSkull size={16} />
          </div>
          <div className="ribbon-info">
            <span className="ribbon-label">{isAr ? 'معدل الأيام الضائعة' : 'Void Mortality Rate'}</span>
            <span className="ribbon-value" style={{ color: '#ef4444' }}>
              {isAr
                ? `${allGraves.length} من أصل ${rangeDays} أيام ضائعة (${mortalityPct}%)`
                : `${allGraves.length} of ${rangeDays} Days Lost (${mortalityPct}%)`}
            </span>
          </div>
        </div>

        {/* Card 2: Hours & XP Deficit */}
        <div className="graveyard-ribbon-card">
          <div className="ribbon-icon-box" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
            <FaHourglassHalf size={16} />
          </div>
          <div className="ribbon-info">
            <span className="ribbon-label">{isAr ? 'إجمالي الوقت والخبرة الضائعة' : 'Total Time & XP Lost'}</span>
            <span className="ribbon-value">
              {isAr
                ? `~${totalLostHours} ساعة • ~${totalLostXP.toLocaleString('en-US')} خبرة`
                : `~${totalLostHours} Hours • ~${totalLostXP.toLocaleString('en-US')} XP`}
            </span>
          </div>
        </div>

        {/* Card 3: Today's Sanctuary Ward */}
        <div className="graveyard-ribbon-card">
          <div
            className="ribbon-icon-box"
            style={{
              background: studiedToday ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: studiedToday ? '#10b981' : '#f59e0b',
            }}
          >
            {studiedToday ? <MdSecurity size={18} /> : <FaShieldAlt size={16} />}
          </div>
          <div className="ribbon-info">
            <span className="ribbon-label">{isAr ? 'حماية ملاذ اليوم' : "Today's Sanctuary Ward"}</span>
            <span className="ribbon-value" style={{ color: studiedToday ? '#10b981' : '#f59e0b' }}>
              {studiedToday
                ? (isAr ? 'محمي: تم تسجيل دراسة اليوم! (+100 خبرة)' : 'Protected: Study logged today! (+100 XP)')
                : (isAr ? 'غير مفعّل: ادرس اليوم لمنع سقوط يوم جديد!' : 'Inactive: Study today to prevent a new grave!')}
            </span>
          </div>
        </div>
      </div>

      {/* ── Interactive Modal: Grave Inspection & "Pay Respects" ── */}
      {selectedGrave && (
        <div className="graveyard-modal-backdrop" onClick={() => setSelectedGrave(null)}>
          <div className="graveyard-modal-box" onClick={e => e.stopPropagation()} dir={isAr ? 'rtl' : 'ltr'}>
            <button className="graveyard-modal-close" onClick={() => setSelectedGrave(null)}>
              <FaTimes />
            </button>

            <div className="graveyard-modal-header">
              <div className="graveyard-modal-icon">
                <FaGhost />
              </div>
              <div>
                <h4 className="graveyard-modal-date">{selectedGrave.fullDate}</h4>
                <p className="graveyard-modal-ago">
                  {isAr
                    ? `سقط منذ ${selectedGrave.daysAgo} ${selectedGrave.daysAgo === 1 ? 'يوم' : 'أيام'}`
                    : `Fell ${selectedGrave.daysAgo} ${selectedGrave.daysAgo === 1 ? 'day' : 'days'} ago`}
                </p>
              </div>
            </div>

            {/* Epitaph & Cause */}
            <div className="graveyard-modal-epitaph-card">
              <div className="epitaph-label">{isAr ? 'نقش الشاهد' : 'Grave Inscription'}</div>
              <p className="epitaph-text">"{selectedGrave.epitaph}"</p>
              <p className="cause-text">
                <strong>{isAr ? 'سبب التراجع والخمول:' : 'Cause of Slump:'}</strong> {selectedGrave.causeOfDeath}
              </p>
            </div>

            {/* Loss metrics */}
            <div className="graveyard-modal-loss-row">
              <div className="modal-loss-item">
                <div className="loss-val">{isAr ? '~14 ساعة' : '~14 Hours'}</div>
                <div className="loss-lbl">{isAr ? 'وقت دراسة محتمل ضائع' : 'Potential Study Time'}</div>
              </div>
              <div className="modal-loss-item">
                <div className="loss-val" style={{ color: '#a855f7' }}>{isAr ? '~700 خبرة' : '~700 XP'}</div>
                <div className="loss-lbl">{isAr ? 'خبرة مغامرة تبددت' : 'Quest Experience Vanished'}</div>
              </div>
            </div>

            {/* Pay Respects Action */}
            <button
              className={`graveyard-respects-btn ${honoredGraves[selectedGrave.key] ? 'honored' : ''}`}
              onClick={() => handlePayRespects(selectedGrave)}
            >
              {honoredGraves[selectedGrave.key] ? (
                <>
                  <FaCheck /> {isAr ? 'تم قطع العهد والوفاء به! (غداً سننتصر)' : 'Vow Sworn & Honored! (Tomorrow Avenge)'}
                </>
              ) : (
                <>
                  <FaFire /> {isAr ? 'تقديم الاحترام وقطع عهد التعويض (F)' : 'Pay Respects & Vow Redemption (F)'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
