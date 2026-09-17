import { useState } from 'react';
import {
  FaCheck,
  FaBookOpen,
} from 'react-icons/fa';
import {
  MdOutlineWbSunny,
  MdOutlineNightsStay,
} from 'react-icons/md';
import { GiStarMedal } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';
import { useSalatStorage } from '../hooks/useSalatStorage';
import AzkarReaderModal from './AzkarReaderModal';
import './AzkarCard.css';

export default function AzkarCard({ isAr = false }) {
  const {
    getAzkarState,
    toggleAzkar,
    setAzkarDone,
    todayAzkarDoneCount,
  } = useSalatStorage();

  const [modalType, setModalType] = useState(null); // 'morning' | 'evening' | null

  const morningDone = getAzkarState('morning');
  const eveningDone = getAzkarState('evening');
  const allDone = morningDone && eveningDone;

  const handleOpenReader = (type) => {
    setModalType(type);
  };

  const handleCloseReader = () => {
    setModalType(null);
  };

  const handleCompleteFromReader = (type) => {
    setAzkarDone(type, true);
  };

  const azkarItems = [
    {
      id: 'morning',
      nameAr: 'أذكار الصباح',
      nameEn: 'Morning Adhkar',
      timeAr: 'بعد الفجر وحتى شروق الشمس',
      timeEn: 'After Fajr until sunrise',
      Icon: MdOutlineWbSunny,
      iconColor: '#f59e0b',
      isDone: morningDone,
    },
    {
      id: 'evening',
      nameAr: 'أذكار المساء',
      nameEn: 'Evening Adhkar',
      timeAr: 'بعد العصر وحتى غروب الشمس',
      timeEn: 'After Asr until sunset',
      Icon: MdOutlineNightsStay,
      iconColor: '#8b5cf6',
      isDone: eveningDone,
    },
  ];

  return (
    <>
      <div className={`az-card${allDone ? ' az-card-complete' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>

        {/* ── Header ── */}
        <div className="az-head">
          <span className="az-head-icon">
            <FaBookOpen size={17} />
          </span>
          <div className="az-head-text">
            <span className="az-head-title">
              {isAr ? 'الأذكار اليومية' : 'Daily Adhkar'}
            </span>
            <span className="az-head-sub">
              {isAr
                ? `${todayAzkarDoneCount}/2 أذكار اليوم · نقطتين لكل ذكر`
                : `${todayAzkarDoneCount}/2 completed today · +2 SP each`}
            </span>
          </div>

          <div className="az-head-actions">
            <div className="az-sp-badge" title={isAr ? 'مكافأة قراءة الأذكار اليومية' : 'Reward for daily adhkar'}>
              <GiStarMedal size={12} />
              <span>{isAr ? `+${todayAzkarDoneCount * 2} نقطة اليوم` : `+${todayAzkarDoneCount * 2} SP today`}</span>
            </div>
          </div>
        </div>

        {/* ── Column Headers ── */}
        <div className="az-cols-header">
          <span className="az-col-h az-col-h-name">
            {isAr ? 'الذكر' : 'Adhkar'}
          </span>
          <span className="az-col-h az-col-h-read">
            {isAr ? 'قراءة' : 'Read'}
          </span>
          <span className="az-col-h az-col-h-pts">
            {isAr ? 'المكافأة' : 'Reward'}
          </span>
          <span className="az-col-h az-col-h-check">
            {isAr ? 'أُنجزت' : 'Done'}
          </span>
        </div>

        {/* ── Adhkar Rows ── */}
        <div className="az-rows">
          {azkarItems.map(item => {
            const ItemIcon = item.Icon;
            return (
              <div
                key={item.id}
                className={`az-row ${item.isDone ? 'az-row-done' : ''}`}
              >
                {/* Name & Time */}
                <div className="az-info">
                  <span className="az-type-badge" style={{ color: item.iconColor }}>
                    <ItemIcon size={14} />
                  </span>
                  <div>
                    <span className="az-name">
                      {isAr ? item.nameAr : item.nameEn}
                    </span>
                    <span className="az-time">
                      {isAr ? item.timeAr : item.timeEn}
                    </span>
                  </div>
                </div>

                {/* Read button (opens modal reader) */}
                <div className="az-read-col">
                  <button
                    className="az-read-btn"
                    onClick={() => handleOpenReader(item.id)}
                    title={isAr ? 'فتح نافذة القراءة' : 'Open Reader Mode'}
                  >
                    <FaBookOpen size={11} />
                    <span>{isAr ? 'قراءة' : 'Read'}</span>
                  </button>
                </div>

                {/* Reward Points */}
                <div className="az-pts-col">
                  <span className={`az-pts-tag ${item.isDone ? 'active' : ''}`}>
                    {isAr ? 'نقطتين' : '+2 SP'}
                  </span>
                </div>

                {/* Checkbox */}
                <div className="az-check-col">
                  <label
                    className={`az-custom-cb ${item.isDone ? 'checked' : ''}`}
                    title={isAr ? 'تأكيد قراءة الأذكار (نقطتين)' : 'Mark adhkar done (+2 SP)'}
                  >
                    <input
                      type="checkbox"
                      checked={item.isDone}
                      onChange={() => toggleAzkar(item.id)}
                      aria-label={isAr ? item.nameAr : item.nameEn}
                    />
                    <span className="az-cb-box">
                      {item.isDone && <FaCheck size={9} />}
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="az-foot">
          {/* Progress bar */}
          <div className="az-progress-wrap">
            <div className="az-progress-bar">
              <div
                className={`az-progress-fill${allDone ? ' az-fill-complete' : ''}`}
                style={{ width: `${(todayAzkarDoneCount / 2) * 100}%` }}
              />
            </div>
            <span className="az-progress-text">
              {todayAzkarDoneCount}/2 {isAr ? 'أذكار اليوم' : 'Adhkar today'}
            </span>
          </div>

          {/* All-done banner */}
          {allDone && (
            <div className="az-done-banner">
              <BsStars size={12} />
              {isAr
                ? 'ما شاء الله! أكملت أذكار الصباح والمساء — حفظك الله وبارك فيك!'
                : 'All daily Adhkar completed today! May Allah preserve and bless you!'}
            </div>
          )}
        </div>
      </div>

      {/* ── Interactive Modal Reader ── */}
      <AzkarReaderModal
        isOpen={modalType !== null}
        onClose={handleCloseReader}
        type={modalType || 'morning'}
        isAr={isAr}
        isDone={modalType === 'morning' ? morningDone : eveningDone}
        onComplete={() => handleCompleteFromReader(modalType)}
      />
    </>
  );
}
