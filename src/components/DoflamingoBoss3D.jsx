import React from 'react';
import { GiCrown } from 'react-icons/gi';
import BossBattleView from './BossBattleView';
import { useLanguage } from '../contexts/LanguageContext';

const DoflamingoBoss3D = React.memo(function DoflamingoBoss3D() {
  const { t } = useLanguage();
  
  const DOFLAMINGO_QUOTES = [
    t('dailyBoss.doflamQuote1'),
    t('dailyBoss.doflamQuote2'),
    t('dailyBoss.doflamQuote3'),
    t('dailyBoss.doflamQuote4'),
    t('dailyBoss.doflamQuote5'),
    t('dailyBoss.doflamQuote6'),
  ];

  return (
    <BossBattleView
      name={t('dailyBoss.doflamingo')}
      title={t('dailyBoss.heavenlyDemon')}
      typeTag="DAILY BOSS"
      PortraitIcon={GiCrown}
      soundPath="sounds/Donquixote_Doflamingo.mp3"
      videoPath="videos/Donquixote_Doflamingo.mp4"
      quotes={DOFLAMINGO_QUOTES}
      accentColor="#a855f7"
      accentBorder="rgba(168, 85, 247, 0.35)"
      accentGlow="rgba(168, 85, 247, 0.4)"
      finishEventType="DOFLAMINGO_BOSS_FINISHED"
      bossId="doflamingo"
    />
  );
});

export default DoflamingoBoss3D;
