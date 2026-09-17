import { useMemo, useState } from 'react';
import { useAppStorage } from '../hooks/useAppHooks';
import { useLanguage } from '../contexts/LanguageContext';
import {
  FaCompass,
  FaGlobeAmericas,
  FaCity,
  FaFlag,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaCheckCircle,
} from 'react-icons/fa';
import {
  WORLD_LAND_PATH,
  WORLD_BORDERS_PATH,
  MAP_OCEAN_LABELS,
  REAL_CITIES,
  EQUATOR_Y,
  TROPIC_CANCER_Y,
  TROPIC_CAPRICORN_Y,
} from '../data/worldMapData';
import './StudyFootprint.css';

// 50 real world cities with accurate cartographic projection coordinates
const CITIES = REAL_CITIES;

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = Math.abs(seed) || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = ((s * 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const REGION_COLORS = {
  Americas: '#3b82f6',
  Europe:   '#8b5cf6',
  Africa:   '#f59e0b',
  Asia:     '#10b981',
  Oceania:  '#ec4899',
};

const REGION_TRANSLATIONS_AR = {
  Americas: 'الأمريكتان',
  Europe:   'أوروبا',
  Africa:   'إفريقيا',
  Asia:     'آسيا',
  Oceania:  'أوقيانوسيا',
};

const COUNTRY_TRANSLATIONS_AR = {
  'United States': 'الولايات المتحدة',
  'United Kingdom': 'المملكة المتحدة',
  'Japan': 'اليابان',
  'France': 'فرنسا',
  'Germany': 'ألمانيا',
  'Italy': 'إيطاليا',
  'Spain': 'إسبانيا',
  'Canada': 'كندا',
  'Australia': 'أستراليا',
  'Brazil': 'البرازيل',
  'China': 'الصين',
  'India': 'الهند',
  'Egypt': 'مصر',
  'Saudi Arabia': 'السعودية',
  'UAE': 'الإمارات',
  'Morocco': 'المغرب',
  'Algeria': 'الجزائر',
  'Tunisia': 'تونس',
  'Turkey': 'تركيا',
  'Russia': 'روسيا',
  'South Africa': 'جنوب إفريقيا',
  'South Korea': 'كوريا الجنوبية',
  'Mexico': 'المكسيك',
  'Argentina': 'الأرجنتين',
  'New Zealand': 'نيوزيلندا',
  'Singapore': 'سنغافورة',
  'Netherlands': 'هولندا',
  'Switzerland': 'سويسرا',
  'Sweden': 'السويد',
  'Norway': 'النرويج',
  'Greece': 'اليونان',
  'Portugal': 'البرتغال',
  'Thailand': 'تايلاند',
  'Indonesia': 'إندونيسيا',
  'Malaysia': 'ماليزيا',
  'Vietnam': 'فيتنام',
  'Philippines': 'الفلبين',
  'Pakistan': 'باكستان',
  'Bangladesh': 'بنغلاديش',
  'Nigeria': 'نيجيريا',
  'Kenya': 'كينيا',
  'Ghana': 'غانا',
  'Colombia': 'كولومبيا',
  'Chile': 'تشيلي',
  'Peru': 'بيرو',
  'Ukraine': 'أوكرانيا',
  'Sri Lanka': 'سريلانكا',
};

const CITY_TRANSLATIONS_AR = {
  'Tokyo': 'طوكيو',
  'New York': 'نيويورك',
  'London': 'لندن',
  'Paris': 'باريس',
  'Cairo': 'القاهرة',
  'Sydney': 'سيدني',
  'Rio de Janeiro': 'ريو دي جانيرو',
  'Beijing': 'بكين',
  'Mumbai': 'مومباي',
  'Berlin': 'برلين',
  'Rome': 'روما',
  'Madrid': 'مدريد',
  'Toronto': 'تورونتو',
  'Dubai': 'دبي',
  'Riyadh': 'الرياض',
  'Casablanca': 'الدار البيضاء',
  'Algiers': 'الجزائر',
  'Tunis': 'تونس',
  'Istanbul': 'إسطنبول',
  'Moscow': 'موسكو',
  'Cape Town': 'كيب تاون',
  'Seoul': 'سيول',
  'Mexico City': 'مكسيكو سيتي',
  'Buenos Aires': 'بوينس آيرس',
  'Auckland': 'أوكلاند',
  'Singapore': 'سنغافورة',
  'Amsterdam': 'أمستردام',
  'Kyiv': 'كييف',
  'Karachi': 'كراتشي',
  'Wellington': 'ويلينغتون',
  'Kuala Lumpur': 'كوالالمبور',
  'Accra': 'أكرا',
  'Nairobi': 'نيروبي',
  'Lagos': 'لاغوس',
  'Bangkok': 'بانكوك',
  'Jakarta': 'جاكرتا',
  'Manila': 'مانيلا',
  'Hanoi': 'هانوي',
  'Bogota': 'بوغوتا',
  'Santiago': 'سانتياغو',
  'Lima': 'ليما',
  'Athens': 'أثينا',
  'Lisbon': 'لشبونة',
  'Stockholm': 'ستوكهولم',
  'Oslo': 'أوسلو',
  'Zurich': 'زيورخ',
  'Colombo': 'كولومبو',
  'Dhaka': 'دكا',
  'San Francisco': 'سان فرانسيسكو',
  'Los Angeles': 'لوس أنجلوس',
  'Chicago': 'شيكاغو',
};

const getCityName = (name, isAr) => (isAr && CITY_TRANSLATIONS_AR[name] ? CITY_TRANSLATIONS_AR[name] : name);
const getCountryName = (country, isAr) => (isAr && COUNTRY_TRANSLATIONS_AR[country] ? COUNTRY_TRANSLATIONS_AR[country] : country);
const getRegionName = (region, isAr) => (isAr && REGION_TRANSLATIONS_AR[region] ? REGION_TRANSLATIONS_AR[region] : region);

export default function StudyFootprint() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [log] = useAppStorage('app_time_log', { byDate: {} });
  const [hovered, setHovered] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null); // null or region string
  const [showAllDestinations, setShowAllDestinations] = useState(true);

  // Compute stats and discovered cities
  const {
    flags,
    totalHours,
    totalMins,
    countryCount,
    regionCount,
    orderedCities,
    nextCity,
    minsToNext,
  } = useMemo(() => {
    const byDate = log.byDate || {};
    const totalMins = Object.values(byDate).reduce((s, m) => s + m, 0);
    const totalHours = Math.floor(totalMins / 60);

    const orderedCities = seededShuffle(CITIES, 2026);
    const flags = orderedCities.slice(0, Math.min(totalHours, CITIES.length));

    const countries = new Set(flags.map(f => f.country));
    const regions = new Set(flags.map(f => f.region));

    const nextCity = totalHours < CITIES.length ? orderedCities[totalHours] : null;
    const minsToNext = 60 - (totalMins % 60);

    return {
      flags,
      totalHours,
      totalMins,
      countryCount: countries.size,
      regionCount: regions.size,
      orderedCities,
      nextCity,
      minsToNext,
    };
  }, [log.byDate]);

  // Explorer Rank Calculation
  const explorerRank = useMemo(() => {
    const count = flags.length;
    if (count === 0) return { title: 'Novice Wanderer', titleAr: 'مستكشف مبتدئ', rank: 'Rank 1', rankAr: 'المستوى 1', color: '#64748b' };
    if (count < 6)   return { title: 'Local Adventurer', titleAr: 'مغامر محلي', rank: 'Rank 2', rankAr: 'المستوى 2', color: '#3b82f6' };
    if (count < 16)  return { title: 'Continental Traveler', titleAr: 'رحالة قاري', rank: 'Rank 3', rankAr: 'المستوى 3', color: '#8b5cf6' };
    if (count < 30)  return { title: 'Global Pioneer', titleAr: 'رائد عالمي', rank: 'Rank 4', rankAr: 'المستوى 4', color: '#f59e0b' };
    if (count < 45)  return { title: 'Master Navigator', titleAr: 'قائد استكشاف', rank: 'Rank 5', rankAr: 'المستوى 5', color: '#10b981' };
    return { title: 'Cosmic Sovereign', titleAr: 'حاكم كوني', rank: 'Max Rank', rankAr: 'المستوى الأقصى', color: '#ec4899' };
  }, [flags.length]);

  // Region total counts in dataset
  const regionTotals = useMemo(() => {
    const totals = {};
    CITIES.forEach(c => {
      totals[c.region] = (totals[c.region] || 0) + 1;
    });
    return totals;
  }, []);

  const totalCountriesInDataset = useMemo(() => {
    return new Set(CITIES.map(c => c.country)).size;
  }, []);

  const progressPct = Math.min(100, Math.round((flags.length / CITIES.length) * 100));

  // Determine which cities to display on map
  const displayCities = useMemo(() => {
    let list = showAllDestinations ? orderedCities : flags;
    if (selectedRegion) {
      list = list.filter(c => c.region === selectedRegion);
    }
    return list;
  }, [showAllDestinations, orderedCities, flags, selectedRegion]);

  return (
    <div className="arena-card footprint-card" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Top Header ── */}
      <div className="footprint-header-row">
        <div className="footprint-title-group">
          <div className="footprint-title-line">
            <FaCompass className="footprint-compass-icon" />
            <h3 className="footprint-title">{isAr ? 'بصمة الدراسة' : 'Study Footprint'}</h3>
            <span className="footprint-rank-badge">
              <FaGlobeAmericas size={11} /> {isAr ? `${explorerRank.titleAr} (${explorerRank.rankAr})` : `${explorerRank.title} (${explorerRank.rank})`}
            </span>
          </div>
          <p className="footprint-sub">
            {isAr ? 'كل ساعة دراسة تفتح وجهة جديدة حول العالم' : 'Every hour studied unlocks a new world destination'}
          </p>
        </div>

        {/* Right Action Badges */}
        <div className="footprint-header-badges">
          <div className="footprint-hour-badge" title={isAr ? 'إجمالي الساعات والمدن المكتشفة' : 'Total hours studied and cities unlocked'}>
            <FaCity size={11} /> {totalHours}{isAr ? ' س' : 'h'} → {flags.length} / {CITIES.length} {isAr ? 'مدينة' : 'cities'}
          </div>

          <button
            className={`footprint-toggle-btn ${showAllDestinations ? 'active' : ''}`}
            onClick={() => setShowAllDestinations(s => !s)}
            title={isAr ? 'تبديل عرض جميع الوجهات الـ 50 أو المكتشفة فقط' : 'Toggle viewing all 50 global destinations vs unlocked only'}
          >
            {showAllDestinations ? <FaEye size={11} /> : <FaEyeSlash size={11} />}
            {showAllDestinations ? (isAr ? 'جميع المواقع 50' : 'All 50 Pins') : (isAr ? 'المكتشفة فقط' : 'Unlocked Only')}
          </button>
        </div>
      </div>

      {/* ── Progress Bar & Next Unlock Banner ── */}
      <div className="footprint-progress-bar-wrap">
        <div className="footprint-progress-header">
          <span className="footprint-progress-title">
            <FaFlag size={11} color="#3b82f6" />
            {isAr ? 'تقدم غزو العالم:' : 'World Conquest Progress:'} <strong>{flags.length} / {CITIES.length} {isAr ? 'وجهة' : 'Destinations'} ({progressPct}%)</strong>
          </span>
          {nextCity && (
            <span className="footprint-next-unlock">
              {isAr ? 'التالي:' : 'Next:'} <strong>{getCityName(nextCity.name, isAr)}، {getCountryName(nextCity.country, isAr)}</strong> {isAr ? `(متبقي ${minsToNext} دقيقة دراسة)` : `(${minsToNext}m study remaining)`}
            </span>
          )}
        </div>
        <div className="footprint-progress-track">
          <div className="footprint-progress-fill" style={{ width: `${Math.max(2, progressPct)}%` }} />
        </div>
      </div>

      {/* ── World Atlas Map with Continents & Pins ── */}
      <div className="footprint-map-outer" dir="ltr">
        <div className="footprint-map">
          {/* High-Fidelity Real World Map Canvas (Natural Earth 110m) */}
          <svg className="fp-continents-svg" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
            {/* Graticule Navigation & Tropic Reference Lines */}
            <line x1="35" y1={EQUATOR_Y} x2="965" y2={EQUATOR_Y} className="fp-nav-line fp-equator-line" strokeDasharray="6 4" />
            <line x1="35" y1={TROPIC_CANCER_Y} x2="965" y2={TROPIC_CANCER_Y} className="fp-nav-line fp-tropic-line" strokeDasharray="3 3" />
            <line x1="35" y1={TROPIC_CAPRICORN_Y} x2="965" y2={TROPIC_CAPRICORN_Y} className="fp-nav-line fp-tropic-line" strokeDasharray="3 3" />
            <line x1="500" y1="25" x2="500" y2="475" className="fp-nav-line fp-meridian-line" strokeDasharray="4 4" />

            {/* Ocean Typography Annotations */}
            {MAP_OCEAN_LABELS.map((lbl, idx) => (
              <text key={`ocean-${idx}`} x={lbl.x} y={lbl.y} className="fp-ocean-text">
                {lbl.text}
              </text>
            ))}

            {/* Latitude Coordinates Indicator */}
            <text x="965" y={EQUATOR_Y - 4} className="fp-lat-text">0°</text>
            <text x="965" y={TROPIC_CANCER_Y - 4} className="fp-lat-text">23.5°N</text>
            <text x="965" y={TROPIC_CAPRICORN_Y - 4} className="fp-lat-text">23.5°S</text>

            {/* Real World Landmasses & Continents (Dark Charcoal Slate #23252a) */}
            <path
              className="fp-continent-land"
              d={WORLD_LAND_PATH}
            />

            {/* Real World Internal Country Borders (Red/Coral #ef4444) */}
            <path
              className="fp-country-border"
              d={WORLD_BORDERS_PATH}
            />

            {/* Equator label */}
            <text
              x="500"
              y={EQUATOR_Y - 3}
              textAnchor="middle"
              className="fp-equator-svg-label"
            >{isAr ? '— خط الاستواء 0° —' : '— 0° EQUATORIAL AXIS —'}</text>
          </svg>

          {/* City Pins */}
          {displayCities.map((city, i) => {
            const isUnlocked = flags.some(f => f.name === city.name);
            const color = REGION_COLORS[city.region] || '#3b82f6';

            return (
              <div
                key={city.name}
                className={`fp-flag ${isUnlocked ? 'unlocked' : 'undiscovered'}`}
                style={{
                  left: `${city.x}%`,
                  top: `${city.y}%`,
                  '--fi': i,
                  '--fc': color,
                }}
                onMouseEnter={() => setHovered(city)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="fp-pin">
                  {isUnlocked && <span className="fp-pin-pulse" />}
                </div>

                {/* Hover Tooltip */}
                {hovered?.name === city.name && (
                  <div className="fp-tooltip" dir={isAr ? 'rtl' : 'ltr'}>
                    <strong>
                      {isUnlocked ? <FaCheckCircle size={10} color="#10b981" /> : <FaLock size={9} color="#94a3b8" />}
                      {getCityName(city.name, isAr)}
                    </strong>
                    <span>{getCountryName(city.country, isAr)} • {getRegionName(city.region, isAr)}</span>
                    <span
                      className="fp-tooltip-status"
                      style={{ color: isUnlocked ? '#10b981' : '#f59e0b' }}
                    >
                      {isUnlocked ? (isAr ? 'مدينة مكتشفة' : 'Discovered City') : (isAr ? 'وجهة مغلقة' : 'Locked Destination')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty Prompt if 0 flags and preview is off */}
          {flags.length === 0 && !showAllDestinations && (
            <div className="fp-empty-msg" dir={isAr ? 'rtl' : 'ltr'}>
              <FaCompass size={13} style={{ marginInlineEnd: 6 }} />
              {isAr
                ? `أكمل أول ساعة دراسة لتضع رايتك في ${getCityName(nextCity?.name, isAr) || 'العالم'}!`
                : `Study your first hour to plant your flag in ${nextCity?.name || 'the world'}!`}
            </div>
          )}
        </div>
      </div>

      {/* ── Region Legend Pills (HIGH VISIBILITY IN LIGHT & DARK MODE) ── */}
      <div className="fp-legend-container">
        <div className="fp-legend-title-row">
          <span>{isAr ? 'القارات والبصمة الإقليمية' : 'Continents & Regional Footprint'}</span>
          {selectedRegion && (
            <button
              onClick={() => setSelectedRegion(null)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#3b82f6',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            >
              {isAr ? 'إلغاء التصفية (عرض الكل)' : 'Reset Filter (Show All)'}
            </button>
          )}
        </div>

        <div className="fp-legend">
          {Object.entries(REGION_COLORS).map(([region, color]) => {
            const unlockedCount = flags.filter(f => f.region === region).length;
            const totalInRegion = regionTotals[region] || 0;
            const isSelected = selectedRegion === region;

            return (
              <div
                key={region}
                className={`fp-legend-item region-${region} ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedRegion(isSelected ? null : region)}
                title={isAr ? `انقر لتصفية الخريطة إلى ${getRegionName(region, isAr)}` : `Click to filter map to ${region}`}
              >
                <div className="fp-legend-left">
                  <span className="fp-legend-dot" style={{ background: color, color }} />
                  <span className="fp-legend-name">{getRegionName(region, isAr)}</span>
                </div>
                <span className="fp-legend-count">
                  {unlockedCount} / {totalInRegion}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Metrics Ribbon ── */}
      <div className="footprint-stats">
        {/* Metric 1: Cities */}
        <div className="fp-stat-card">
          <div className="fp-stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <FaCity />
          </div>
          <div className="fp-stat-info">
            <span className="fp-val" style={{ color: '#3b82f6' }}>{flags.length} / {CITIES.length}</span>
            <span className="fp-lbl">{isAr ? 'المدن المكتشفة' : 'Cities Unlocked'}</span>
          </div>
        </div>

        {/* Metric 2: Countries */}
        <div className="fp-stat-card">
          <div className="fp-stat-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <FaFlag />
          </div>
          <div className="fp-stat-info">
            <span className="fp-val" style={{ color: '#8b5cf6' }}>{countryCount} / {totalCountriesInDataset}</span>
            <span className="fp-lbl">{isAr ? 'الدول التي وصلت إليها' : 'Countries Reached'}</span>
          </div>
        </div>

        {/* Metric 3: Continents */}
        <div className="fp-stat-card">
          <div className="fp-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <FaGlobeAmericas />
          </div>
          <div className="fp-stat-info">
            <span className="fp-val" style={{ color: '#10b981' }}>{regionCount} / 5</span>
            <span className="fp-lbl">{isAr ? 'القارات المستكشفة' : 'Continents Explored'}</span>
          </div>
        </div>

        {/* Metric 4: Undiscovered */}
        <div className="fp-stat-card">
          <div className="fp-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <FaCompass />
          </div>
          <div className="fp-stat-info">
            <span className="fp-val" style={{ color: '#f59e0b' }}>{CITIES.length - flags.length}</span>
            <span className="fp-lbl">{isAr ? 'مدن غير مكتشفة' : 'Undiscovered Cities'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
