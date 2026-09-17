import React, { useState, useMemo } from 'react';
import {
  FaScroll, FaCrown, FaFire, FaBolt, FaCalendarAlt,
  FaCheckCircle, FaTimesCircle, FaHistory, FaStar, FaTrophy,
  FaClock, FaChartLine, FaExclamationTriangle
} from 'react-icons/fa';
import { GiCrystalBall, GiScrollUnfurled, GiWaxSeal } from 'react-icons/gi';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealStudyData } from '../utils/studyDataService';
import './ProphecyBoardPage.css';

function generateProphecy(data, isRTL) {
  const { streak, weekAvgHours, totalHours, hasAnyData, dailyGoalHours } = data;
  
  if (!hasAnyData) {
    const targetHours = Math.round(dailyGoalHours * 7 * 10) / 10 || 7;
    return {
      text: isRTL
        ? `سجل دراستك نقي وبداية جديدة تماماً. يرى العراف فرصة ذهبية لبناء روتين دراسي متكامل هذا الأسبوع وإنجاز أول ${targetHours} ساعات تركيز وإشعال شعلة انضباطك الأولى. البدايات تصنع الأساطير.`
        : `Your study log is a pristine canvas awaiting your first mark. The oracle foresees an opportunity this week to establish your focus routine, log your first ${targetHours} hours of focus, and ignite your streak.`,
      predictedHours: targetHours,
      predictedStreak: 1,
      riskLevel: 'Low',
      riskLabel: isRTL ? 'نقي / مستقر' : 'Fresh / Low',
      confidence: 50,
      peakDay: isRTL ? 'اليوم' : 'Today',
      isFresh: true
    };
  }

  const predictedHours = Math.round((weekAvgHours * 7) * (1 + (streak > 5 ? 0.12 : 0)) * 10) / 10;
  const predictedStreak = streak + Math.floor(Math.random() * 3) + 1;
  const riskLevel = weekAvgHours < 1 ? 'High' : weekAvgHours < 2 ? 'Moderate' : 'Low';

  const daysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const daysAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
  const dayIdx = Math.floor(Math.random() * 7);

  const textsEn = [
    `The seeker who has walked ${streak} suns of discipline shall face their greatest test in the week to come. The stars foretell ${predictedHours} hours of cognitive battle. Victory lies not in intensity alone, but in the rhythm of the consistent soul. Your peak focus window shall open at the ${weekAvgHours > 2 ? 'evening' : 'morning'} tide.`,
    `${streak >= 7 ? 'A warrior of great streaks' : 'A learner of emerging power'} stands at the threshold. The oracle sees ${predictedHours} hours of study unfolding — ${weekAvgHours > 2 ? 'a crescendo of mastery' : 'a battle against distraction'}. The path forward demands ${streak + 3} days of unbroken discipline before the next milestone is unlocked.`,
    `The cosmic ledger records ${Math.round(totalHours)} hours of accumulated wisdom. In the coming seven days, fate offers a choice: surrender to stagnation, or forge ${predictedHours} hours of new knowledge. The prophecy is written — but only you hold the quill.`
  ];

  const textsAr = [
    `السالك الذي قطع مسيرة ${streak} أيام من الانضباط سيواجه امتحانه الأكبر في الأسبوع القادم. تتنبأ النجوم بـ ${predictedHours} ساعة من المعركة الذهنية. النصر ليس في الكثافة وحدها، بل في ثبات وإيقاع الروح المثابرة. ستنفتح نافذة ذروتك عند مد ${weekAvgHours > 2 ? 'المساء' : 'الصباح'}.`,
    `${streak >= 7 ? 'محارب متمرس ذو سلاسل إنجاز عظيمة' : 'متعلم ذو عزيمة صاعدة'} يقف الآن على العتبة. يرى العراف ${predictedHours} ساعة دراسة تلوح في الأفق — ${weekAvgHours > 2 ? 'قمة الإتقان والسيادة' : 'معركة ضد الشتات والإرهاق'}. يتطلب الطريق ${streak + 3} أيام من الانضباط المتواصل لفتح الإنجاز القادم.`,
    `يسجل السجل الكوني ${Math.round(totalHours)} ساعة من الحكمة المتراكمة. في الأيام السبعة القادمة، يمنحك القدر خيارين: الركون إلى الركود، أو صياغة ${predictedHours} ساعة من المعرفة الخالصة. النبوءة كُتبت — لكن ريشة القرار بيدك وحدك.`
  ];

  const textList = isRTL ? textsAr : textsEn;

  return {
    text: textList[Math.floor(Math.random() * textList.length)],
    predictedHours,
    predictedStreak,
    riskLevel,
    riskLabel: isRTL ? (riskLevel === 'High' ? 'مرتفع' : riskLevel === 'Moderate' ? 'متوسط' : 'منخفض') : riskLevel,
    confidence: Math.round(65 + streak * 1.5 + Math.min(15, weekAvgHours * 3)),
    peakDay: isRTL ? daysAr[dayIdx] : daysEn[dayIdx],
    isFresh: false
  };
}

const PAST_PROPHECIES_DATA = [
  { textEn: 'You shall study 18 hours this week or face the void.', textAr: 'ستدرس 18 ساعة هذا الأسبوع أو ستواجه الفراغ.', outcome: 'fulfilled' },
  { textEn: 'A 3-day streak break looms — unless you resist the call of distraction.', textAr: 'انقطاع لسلسلة الأيام يلوح في الأفق — إلا إذا قاومت نداء التشتت.', outcome: 'defied' },
  { textEn: 'Peak focus arrives Wednesday evening — seize it or lose 2 XP levels.', textAr: 'ذروة التركيز تصل مساء الأربعاء — اغتنمها أو تخسر مستويين من الخبرة.', outcome: 'fulfilled' },
];

export default function ProphecyBoardPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  const data = useMemo(() => getRealStudyData(), []);
  const prophecy = useMemo(() => generateProphecy(data, isRTL), [data, isRTL]);
  const [choice, setChoice] = useState(null);

  const riskColor = { High: '#f87171', Moderate: '#fbbf24', Low: '#4ade80' };

  return (
    <div className={`prophecy-board ${isRTL ? 'is-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="prophecy-header">
        <h1>
          <GiScrollUnfurled style={{ display: 'inline', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem', verticalAlign: 'middle' }} />
          {isRTL ? 'لوحة النبوءة الأسبوعية' : 'Prophecy Board'}
        </h1>
        <p>
          {isRTL
            ? 'يقرأ العراف أنماطك السابقة ويتنبأ بما سيحدث في أيامك السبعة القادمة'
            : 'The oracle reads your patterns and predicts your next 7 days'}
        </p>
        <span className="prophecy-badge">
          <GiCrystalBall style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.3rem' }} />
          {isRTL ? 'نبوءة العراف نشطة' : 'Oracle Active'}
        </span>
      </div>

      {/* ── Main Scroll ── */}
      <div className="prophecy-scroll-wrap">
        <div className="prophecy-scroll">
          <div className="prophecy-scroll-inner">
            <div className="prophecy-wax-seal">
              <div className="prophecy-seal-ring">
                <GiWaxSeal />
              </div>
            </div>

            <p className="prophecy-title-line">
              <FaScroll style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
              {isRTL ? 'نبوءة الأسبوع السابع' : 'Prophecy of the Seventh Week'}
            </p>

            <p className="prophecy-main-text">{prophecy.text}</p>

            <div className="prophecy-divider-line" />

            <div className="prophecy-predictions">
              <div className="prophecy-pred-card">
                <div className="prophecy-pred-icon"><FaClock /> {isRTL ? 'الساعات المتوقعة' : 'Predicted Hours'}</div>
                <div className="prophecy-pred-label">{isRTL ? 'الـ 7 أيام القادمة' : 'Next 7 days'}</div>
                <div className="prophecy-pred-value">{prophecy.predictedHours}{isRTL ? ' س' : 'h'}</div>
                <p className="prophecy-pred-desc">
                  {isRTL ? 'بناءً على سرعة إنجازك وزخم سلسلتك الحالية' : 'Based on your weekly velocity and streak momentum'}
                </p>
              </div>

              <div className="prophecy-pred-card">
                <div className="prophecy-pred-icon"><FaFire /> {isRTL ? 'توقع السلسلة' : 'Streak Forecast'}</div>
                <div className="prophecy-pred-label">{isRTL ? 'إذا حافظت على الوتيرة' : 'If consistent'}</div>
                <div className="prophecy-pred-value">{prophecy.predictedStreak}{isRTL ? ' يوم' : 'd'}</div>
                <p className="prophecy-pred-desc">
                  {isRTL ? 'طول السلسلة المتوقع عند نهاية الأسبوع' : 'Projected streak length by end of week'}
                </p>
              </div>

              <div className="prophecy-pred-card">
                <div className="prophecy-pred-icon"><FaChartLine /> {isRTL ? 'ثقة العراف' : 'Oracle Confidence'}</div>
                <div className="prophecy-pred-label">{isRTL ? 'دقة التنبؤ' : 'Prediction accuracy'}</div>
                <div className="prophecy-pred-value" style={{ color: prophecy.confidence > 80 ? '#4ade80' : '#fbbf24' }}>
                  {prophecy.confidence}%
                </div>
                <p className="prophecy-pred-desc">
                  {isRTL ? 'كلما طالت سلسلتك زادت دقة نبوءة العراف' : 'Higher streaks increase prophecy accuracy'}
                </p>
              </div>

              <div className="prophecy-pred-card">
                <div className="prophecy-pred-icon">
                  <FaExclamationTriangle style={{ color: riskColor[prophecy.riskLevel] }} />
                  {isRTL ? 'خطر الإرهاق' : 'Burnout Risk'}
                </div>
                <div className="prophecy-pred-label">{isRTL ? 'هذا الأسبوع' : 'This week'}</div>
                <div className="prophecy-pred-value" style={{ color: riskColor[prophecy.riskLevel] }}>
                  {prophecy.riskLabel}
                </div>
                <p className="prophecy-pred-desc">
                  {isRTL ? `يوم الخطر الأكبر: ${prophecy.peakDay}` : `Peak day: ${prophecy.peakDay}`}
                </p>
              </div>
            </div>

            <div className="prophecy-divider-line" />

            {/* ── Fulfill / Defy ── */}
            {!choice ? (
              <div className="prophecy-actions">
                <button className="prophecy-btn fulfill" onClick={() => setChoice('fulfill')}>
                  <FaCrown /> {isRTL ? 'أقبل بهذا المصير وأحققه' : 'I Accept This Fate'}
                </button>
                <button className="prophecy-btn defy" onClick={() => setChoice('defy')}>
                  <FaBolt /> {isRTL ? 'أتحدى نبوءة العراف' : 'I Defy the Oracle'}
                </button>
              </div>
            ) : (
              <div className={`prophecy-choice-result ${choice}`}>
                {choice === 'fulfill' ? (
                  <>
                    <FaCheckCircle style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
                    {isRTL
                      ? 'لقد قبلت النبوءة وتعهدت بتحقيقها. النجوم تصطف لتشهد عزيمتك.'
                      : 'You have accepted the prophecy. The stars align with your resolve.'}
                  </>
                ) : (
                  <>
                    <FaTimesCircle style={{ [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
                    {isRTL
                      ? 'تم تحدي العراف! أثبت عصيانك للمصير بالأفعال — وإلا ابتلعك الشتات.'
                      : 'The oracle is challenged. Prove your defiance — or be consumed by it.'}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Past Prophecies ── */}
      <div className="prophecy-history">
        <h3>
          <FaHistory style={{ color: '#fbbf24', [isRTL ? 'marginLeft' : 'marginRight']: '0.4rem' }} />
          {isRTL ? 'سجل النبوءات السابقة' : 'Past Prophecies'}
        </h3>
        <div className="prophecy-past-list">
          {PAST_PROPHECIES_DATA.map((p, i) => (
            <div className="prophecy-past-item" key={i}>
              <div className={`prophecy-past-icon ${p.outcome}`}>
                {p.outcome === 'fulfilled' ? <FaCheckCircle /> : <FaTimesCircle />}
              </div>
              <span className="prophecy-past-text">{isRTL ? p.textAr : p.textEn}</span>
              <span className={`prophecy-past-outcome ${p.outcome}`}>
                {p.outcome === 'fulfilled' ? (isRTL ? 'تحققت' : 'Fulfilled') : (isRTL ? 'تُحديت' : 'Defied')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
