import { useState, useEffect, useCallback } from 'react';
import {
  FaTimes,
  FaCheck,
  FaChevronRight,
  FaChevronLeft,
  FaRedo,
} from 'react-icons/fa';
import {
  MdOutlineWbSunny,
  MdOutlineNightsStay,
} from 'react-icons/md';
import { GiStarMedal } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';
import { MORNING_ADHKAR, EVENING_ADHKAR } from '../data/adhkarData';
import './AzkarReaderModal.css';

export default function AzkarReaderModal({
  isOpen,
  onClose,
  type = 'morning',
  isAr = true,
  isDone = false,
  onComplete,
}) {
  const isMorning = type === 'morning';
  const adhkarList = isMorning ? MORNING_ADHKAR : EVENING_ADHKAR;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingCounts, setRemainingCounts] = useState({});
  const [isCompletedAll, setIsCompletedAll] = useState(false);

  // Initialize remaining counts whenever the modal opens or type changes
  useEffect(() => {
    if (isOpen) {
      const initialCounts = {};
      adhkarList.forEach((item, idx) => {
        initialCounts[idx] = item.count;
      });
      setRemainingCounts(initialCounts);
      setCurrentIndex(0);
      setIsCompletedAll(false);
    }
  }, [isOpen, type, adhkarList]);

  const currentDhikr = adhkarList[currentIndex] || adhkarList[0];
  const targetCount = currentDhikr.count;
  const currentRemaining = remainingCounts[currentIndex] !== undefined
    ? remainingCounts[currentIndex]
    : targetCount;

  const isCurrentDhikrDone = currentRemaining === 0;

  // Handle tap counter on current dhikr
  const handleTapCount = useCallback(() => {
    if (currentRemaining > 0) {
      const nextVal = currentRemaining - 1;
      setRemainingCounts(prev => ({
        ...prev,
        [currentIndex]: nextVal,
      }));

      // If finished this dhikr and it's the last one, check if all done
      if (nextVal === 0 && currentIndex === adhkarList.length - 1) {
        setIsCompletedAll(true);
      }
    }
  }, [currentRemaining, currentIndex, adhkarList.length]);

  // Reset count for current dhikr
  const handleResetCurrent = (e) => {
    e.stopPropagation();
    setRemainingCounts(prev => ({
      ...prev,
      [currentIndex]: targetCount,
    }));
  };

  const handleNext = () => {
    if (currentIndex < adhkarList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    if (onComplete && !isDone) {
      onComplete();
    }
    onClose();
  };

  // Keyboard navigation: Space/Enter = count, Arrow keys = prev/next, Esc = close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleTapCount();
      } else if (e.key === 'ArrowRight') {
        if (isAr) handlePrev();
        else handleNext();
      } else if (e.key === 'ArrowLeft') {
        if (isAr) handleNext();
        else handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleTapCount, isAr, onClose]);

  if (!isOpen) return null;

  return (
    <div className="arm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="arm-modal"
        onClick={e => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* ── Modal Header ── */}
        <div className="arm-head">
          <div className="arm-head-title-wrap">
            <span className={`arm-type-icon ${isMorning ? 'morning' : 'evening'}`}>
              {isMorning ? <MdOutlineWbSunny size={18} /> : <MdOutlineNightsStay size={18} />}
            </span>
            <div>
              <h2 className="arm-title">
                {isMorning
                  ? (isAr ? 'أذكار الصباح' : 'Morning Adhkar')
                  : (isAr ? 'أذكار المساء' : 'Evening Adhkar')
                }
              </h2>
              <span className="arm-progress-label">
                {isAr
                  ? `الذكر ${currentIndex + 1} من ${adhkarList.length}`
                  : `Dhikr ${currentIndex + 1} of ${adhkarList.length}`}
              </span>
            </div>
          </div>

          <div className="arm-head-actions">
            <div className="arm-sp-tag">
              <GiStarMedal size={12} />
              <span>{isAr ? 'نقطتين' : '+2 SP'}</span>
            </div>
            <button className="arm-close-btn" onClick={onClose} aria-label="Close">
              <FaTimes size={13} />
            </button>
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <div className="arm-top-progress">
          <div
            className="arm-top-progress-fill"
            style={{ width: `${((currentIndex + 1) / adhkarList.length) * 100}%` }}
          />
        </div>

        {/* ── Dhikr Main Card ── */}
        <div className="arm-body">
          <div className="arm-dhikr-header">
            <h3 className="arm-dhikr-title">
              {isAr ? currentDhikr.titleAr : currentDhikr.titleEn}
            </h3>
            {targetCount > 1 && (
              <span className="arm-target-pill">
                {isAr ? `تكرار: ${targetCount} مرات` : `Repeat: ${targetCount}x`}
              </span>
            )}
          </div>

          {/* Arabic Text */}
          <div className="arm-text-box" onClick={handleTapCount} title={isAr ? 'انقر للعد' : 'Tap to count'}>
            <p className="arm-arabic-text">
              {currentDhikr.arabic}
            </p>

            {!isAr && currentDhikr.translationEn && (
              <p className="arm-translation-text">
                {currentDhikr.translationEn}
              </p>
            )}
          </div>

          {/* Virtue / Reference Box */}
          {(currentDhikr.virtueAr || currentDhikr.virtueEn) && (
            <div className="arm-virtue-box">
              <BsStars size={14} className="arm-virtue-icon" />
              <span>
                {isAr ? currentDhikr.virtueAr : currentDhikr.virtueEn}
              </span>
            </div>
          )}
        </div>

        {/* ── Interactive Counter Section ── */}
        <div className="arm-counter-section">
          <button
            className={`arm-counter-button ${isCurrentDhikrDone ? 'done' : 'active'}`}
            onClick={handleTapCount}
            aria-label="Count tap"
          >
            {isCurrentDhikrDone ? (
              <div className="arm-count-done-state">
                <FaCheck size={18} />
                <span>{isAr ? 'تم الإكمال' : 'Completed'}</span>
              </div>
            ) : (
              <div className="arm-count-active-state">
                <span className="arm-count-number">{currentRemaining}</span>
                <span className="arm-count-label">
                  {isAr ? `متبقي من ${targetCount}` : `remaining of ${targetCount}`}
                </span>
              </div>
            )}
          </button>

          {targetCount > 1 && (
            <button
              className="arm-reset-btn"
              onClick={handleResetCurrent}
              title={isAr ? 'إعادة ضبط هذا الذكر' : 'Reset this dhikr'}
            >
              <FaRedo size={11} />
            </button>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="arm-footer">
          <div className="arm-nav-btns">
            <button
              className="arm-nav-btn"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              title={isAr ? 'الذكر السابق' : 'Previous'}
            >
              {isAr ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
              <span>{isAr ? 'السابق' : 'Previous'}</span>
            </button>

            <button
              className="arm-nav-btn"
              onClick={handleNext}
              disabled={currentIndex === adhkarList.length - 1}
              title={isAr ? 'الذكر التالي' : 'Next'}
            >
              <span>{isAr ? 'التالي' : 'Next'}</span>
              {isAr ? <FaChevronLeft size={12} /> : <FaChevronRight size={12} />}
            </button>
          </div>

          <button
            className={`arm-complete-btn ${isDone ? 'already-done' : ''}`}
            onClick={handleFinish}
          >
            <FaCheck size={12} />
            <span>
              {isDone
                ? (isAr ? 'مُكتملة اليوم' : 'Completed Today')
                : (isAr ? 'إتمام وحفظ (نقطتين)' : 'Complete & Save (+2 SP)')}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
