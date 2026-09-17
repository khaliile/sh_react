import { useLanguage } from '../contexts/LanguageContext';
import SalatCard from '../components/SalatCard';
import AzkarCard from '../components/AzkarCard';
import { useSalatStorage } from '../hooks/useSalatStorage';
import { GiStarMedal } from 'react-icons/gi';
import { FaMosque, FaCheck, FaBookOpen } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import './SalatPage.css';

export default function SalatPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const {
    totalPoints,
    todayDoneCount,
    todayMosqueCount,
    todayAzkarDoneCount,
  } = useSalatStorage();

  const allDone = todayDoneCount === 5;

  return (
    <section className="salat-page" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Page Header ── */}
      <header className="salat-page-header">
        <div className="salat-page-header-top">
          <span className="salat-page-header-icon">
            <FaMosque size={24} />
          </span>
          <div className="salat-page-header-text">
            <h1 className="salat-page-title">
              {isAr ? 'متابعة الصلوات والأذكار اليومية' : 'Daily Prayers & Adhkar Tracker'}
            </h1>
            <p className="salat-page-subtitle">
              {isAr
                ? 'سجّل صلواتك وأذكارك اليومية واجمع النقاط (نقطة للصلاة، نقطتين للمسجد، نقطتين للأذكار)'
                : 'Track your daily prayers and adhkar and earn Salat Points (+1 prayer, +2 mosque, +2 adhkar)'}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="salat-page-stats">
          <div className="salat-stat-pill salat-stat-pts">
            <GiStarMedal size={16} />
            <div className="salat-stat-info">
              <span className="salat-stat-val">{totalPoints}</span>
              <span className="salat-stat-lab">{isAr ? 'إجمالي النقاط' : 'Total SP'}</span>
            </div>
          </div>
          <div className="salat-stat-pill salat-stat-today">
            <FaCheck size={14} />
            <div className="salat-stat-info">
              <span className="salat-stat-val">{todayDoneCount}/5</span>
              <span className="salat-stat-lab">{isAr ? 'صلوات اليوم' : "Today's Prayers"}</span>
            </div>
          </div>
          <div className="salat-stat-pill salat-stat-mosque">
            <FaMosque size={15} />
            <div className="salat-stat-info">
              <span className="salat-stat-val">{todayMosqueCount}</span>
              <span className="salat-stat-lab">{isAr ? 'في المسجد' : 'At Mosque'}</span>
            </div>
          </div>
          <div className="salat-stat-pill salat-stat-azkar">
            <FaBookOpen size={14} />
            <div className="salat-stat-info">
              <span className="salat-stat-val">{todayAzkarDoneCount}/2</span>
              <span className="salat-stat-lab">{isAr ? 'أذكار اليوم' : "Today's Adhkar"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── All-done banner ── */}
      {allDone && (
        <div className="salat-complete-banner">
          <BsStars size={16} />
          {isAr
            ? 'ما شاء الله! أكملت جميع صلوات اليوم الخمس — بارك الله فيك'
            : 'All 5 daily prayers completed! May Allah accept them.'}
        </div>
      )}

      {/* ── Cards Stack: SalatCard + AzkarCard + Note ── */}
      <div className="salat-card-wrapper">
        <SalatCard isAr={isAr} />

        {/* ── Azkar Card ── */}
        <AzkarCard isAr={isAr} />

        {/* SP info note */}
        <div className="salat-sp-note">
          <FaMosque size={14} />
          <span>
            {isAr
              ? 'صلاة = نقطة · صلاة في المسجد = نقطتين · أذكار (صباح/مساء) = نقطتين · النقاط مستقلة تماماً عن الـ XP والعملات'
              : 'Prayer = +1 SP · Mosque = +2 SP · Adhkar (Morning/Evening) = +2 SP · Salat Points (SP) are completely independent from XP & Coins'}
          </span>
        </div>
      </div>

    </section>
  );
}
