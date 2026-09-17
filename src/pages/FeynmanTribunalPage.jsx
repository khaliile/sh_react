import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import FeynmanTribunal from '../components/FeynmanTribunal';
import { FaBalanceScale, FaBrain, FaAward } from 'react-icons/fa';
import './FeynmanTribunalPage.css';

export default function FeynmanTribunalPage() {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  return (
    <div className="feynman-page-container" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Subtitle / Intro HUD Bar ── */}
      <div className="feynman-hud-intro">
        <div className="feynman-hud-left">
          <div className="feynman-hud-icon-box">
            <FaBalanceScale />
          </div>
          <div>
            <h1 className="feynman-hud-title">
              {isRTL ? 'قاعة محكمة فاينمان المعرفية' : 'The Hall of the Feynman Tribunal'}
            </h1>
            <p className="feynman-hud-quote">
              {isRTL
                ? 'اختبر مدى فهمك الحقيقي: الشرح البسيط هو الدليل القاطع على الفهم العميق'
                : '"If you cannot explain it simply, you do not understand it well enough." — Richard Feynman'}
            </p>
          </div>
        </div>

        {/* Cognitive stats badges */}
        <div className="feynman-hud-badges">
          <span className="feynman-pill">
            <FaBrain style={{ color: '#8b5cf6' }} />
            <span>{isRTL ? '3 قضاة أذكياء' : '3 AI Judges'}</span>
          </span>
          <span className="feynman-pill pill-amber">
            <FaAward style={{ color: '#f59e0b' }} />
            <span>{isRTL ? 'مكافآت RPG حقيقية' : 'Real RPG XP'}</span>
          </span>
        </div>
      </div>

      {/* ── Main Tribunal Component ── */}
      <FeynmanTribunal />
    </div>
  );
}
