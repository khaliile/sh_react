import React from 'react';
import { GiPirateFlag } from 'react-icons/gi';
import BossBattleView from './BossBattleView';
import { useLanguage } from '../contexts/LanguageContext';

const DailyBoss3D = React.memo(function DailyBoss3D() {
  const { t } = useLanguage();
  
  const BLACKBEARD_QUOTES = [
    t('dailyBoss.blackbeardQuote1'),
    t('dailyBoss.blackbeardQuote2'),
    t('dailyBoss.blackbeardQuote3'),
    t('dailyBoss.blackbeardQuote4'),
    t('dailyBoss.blackbeardQuote5'),
  ];

  return (
    <BossBattleView
      name={t('dailyBoss.marshallTeach')}
      title={t('dailyBoss.emperorOfDarkness')}
      typeTag="DAILY BOSS"
      PortraitIcon={GiPirateFlag}
      soundPath="sounds/blackbeard-laugh.mp3"
      videoPath="videos/teach.mp4"
      quotes={BLACKBEARD_QUOTES}
      accentColor="#ef4444"
      accentBorder="rgba(185, 28, 28, 0.35)"
      accentGlow="rgba(185, 28, 28, 0.4)"
      finishEventType="TEACH_BOSS_FINISHED"
    />
  );
});

export default DailyBoss3D;
