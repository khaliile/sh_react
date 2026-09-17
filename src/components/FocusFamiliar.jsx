import { useState } from 'react';
import {
  FaHeart, FaUtensils, FaEdit, FaCheck, FaCoins, FaBolt, FaShieldAlt,
  FaEgg, FaFeatherAlt, FaPaw, FaDragon, FaMagic, FaStar, FaLock, FaCheckCircle
} from 'react-icons/fa';
import { usePetStorage, PET_STAGES } from '../hooks/usePetStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { playTick, playFanfare } from '../utils/sounds';
import './FocusFamiliar.css';

const FAMILIAR_ICONS = {
  egg: <FaEgg style={{ fontSize: '2.8rem', color: '#a78bfa' }} />,
  drake: <FaFeatherAlt style={{ fontSize: '2.8rem', color: '#38bdf8' }} />,
  guardian: <FaPaw style={{ fontSize: '2.8rem', color: '#34d399' }} />,
  dragon: <FaDragon style={{ fontSize: '2.8rem', color: '#f59e0b' }} />,
};

const STAGE_MINI_ICONS = {
  egg: <FaEgg />,
  drake: <FaFeatherAlt />,
  guardian: <FaPaw />,
  dragon: <FaDragon />,
};

export default function FocusFamiliar() {
  const {
    petData,
    stage,
    nextStage,
    totalHours,
    evolutionProgress,
    petFamiliar,
    feedFamiliar,
    renameFamiliar,
  } = usePetStorage();
  const { t } = useLanguage();

  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(petData.name);
  const [heartAnim, setHeartAnim] = useState(false);
  const [sparkleAnim, setSparkleAnim] = useState(false);
  const [toast, setToast] = useState(null);

  const getStageTitle = (st) => (st ? (t(st.titleKey) || st.title) : '');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handlePet = () => {
    petFamiliar();
    playTick();
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 900);
    showToast(t('focus.happyToast', { name: petData.name }));

    try {
      window.dispatchEvent(new CustomEvent('mascot-event', {
        detail: {
          eventType: 'PET_FAMILIAR',
          taskName: petData.name,
          userMessage: `Petted familiar ${petData.name}`
        }
      }));
    } catch { /* noop */ }
  };

  const handleFeed = () => {
    const res = feedFamiliar(15);
    if (!res.success) {
      showToast(t('focus.notEnoughCoins') || res.message);
    } else {
      playFanfare();
      setSparkleAnim(true);
      setTimeout(() => setSparkleAnim(false), 1200);
      showToast(t('focus.fedToast', { name: petData.name }));

      try {
        window.dispatchEvent(new CustomEvent('mascot-event', {
          detail: {
            eventType: 'FED_FAMILIAR',
            taskName: petData.name,
            userMessage: `Fed delicious treat to ${petData.name}`
          }
        }));
      } catch { /* noop */ }
    }
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      renameFamiliar(nameInput);
      setIsRenaming(false);
      showToast(t('focus.renamedToast', { name: nameInput }));
    }
  };

  return (
    <div className="arena-card familiar-card" style={{ '--pet-aura': stage.aura, '--pet-color': stage.color }}>
      {/* ── TOP HEADER ── */}
      <div className="familiar-header">
        <div className="familiar-title-box">
          <div className="familiar-badge-pill" style={{ '--stage-color': stage.color }}>
            {t('focus.levelFamiliar', { n: stage.stage })}
          </div>
          {isRenaming ? (
            <div className="rename-box">
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                maxLength={18}
                className="rename-input"
                autoFocus
              />
              <button className="rename-save-btn" onClick={handleSaveName}><FaCheck /></button>
            </div>
          ) : (
            <div className="familiar-name-row">
              <h3>{petData.name}</h3>
              <button className="rename-trigger-btn" onClick={() => setIsRenaming(true)} title={t('focus.renameTooltip')}>
                <FaEdit />
              </button>
            </div>
          )}
          <span className="familiar-species">{getStageTitle(stage)}</span>
        </div>

        <div className="familiar-stats-chips">
          <div className="stat-chip" title={`Happiness: ${petData.happiness}%`}>
            <FaHeart style={{ color: '#ef4444' }} />
            <span>{petData.happiness}%</span>
          </div>
          <div className="stat-chip" title={`Energy: ${petData.energy}%`}>
            <FaBolt style={{ color: '#f59e0b' }} />
            <span>{petData.energy}%</span>
          </div>
        </div>
      </div>

      {/* ── CENTRAL CREATURE SANCTUARY ── */}
      <div className="familiar-display-zone">
        <div
          className={`familiar-avatar-wrap ${heartAnim ? 'bouncing' : ''} ${sparkleAnim ? 'sparkling' : ''}`}
          onClick={handlePet}
          title={t('focus.clickToPet')}
        >
          <div className="familiar-aura-glow" />
          <span className="familiar-emoji">
            {FAMILIAR_ICONS[stage.avatarKey] || FAMILIAR_ICONS[stage.avatar] || <FaDragon />}
          </span>
          {heartAnim && (
            <span className="floating-heart">
              <FaHeart style={{ color: '#ef4444' }} />
            </span>
          )}
          {sparkleAnim && (
            <span className="floating-heart">
              <FaMagic style={{ color: '#fbbf24' }} />
            </span>
          )}
        </div>

        <div className="familiar-info-panel">
          <p className="familiar-desc">{t(stage.descKey)}</p>
          
          <div className="familiar-buff-tag">
            <FaShieldAlt style={{ marginInlineEnd: '5px' }} />
            <span>{t(stage.buffKey)}</span>
          </div>

          <div className="evolution-progress-box">
            <div className="evolution-label-flex">
              <span>{t('focus.evolutionProgress')}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {totalHours}h / {nextStage ? `${nextStage.minHours}h` : 'MAX'} ({evolutionProgress}%)
              </span>
            </div>
            <div className="evolution-bar">
              <div
                className="evolution-fill"
                style={{ width: `${nextStage ? evolutionProgress : 100}%` }}
              />
            </div>
            {nextStage ? (
              <span className="evolution-next-hint">
                {t('focus.nextEvolution', { title: getStageTitle(nextStage), hours: nextStage.minHours })}
              </span>
            ) : (
              <span className="evolution-next-hint" style={{ color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <FaStar /> {t('focus.maxEvolution')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── EVOLUTION ROADMAP TIMELINE ── */}
      <div className="familiar-timeline-box">
        <div className="familiar-timeline-label">{t('focus.evolutionMilestones')}</div>
        <div className="familiar-stages-track">
          {PET_STAGES.map((s) => {
            const isUnlocked = totalHours >= s.minHours;
            const isCurrent = s.stage === stage.stage;
            return (
              <div
                key={s.stage}
                className={`timeline-stage-node ${isCurrent ? 'current' : isUnlocked ? 'unlocked' : 'locked'}`}
                title={`${getStageTitle(s)} (${t('focus.requiresHours', { hours: s.minHours })})`}
              >
                <div className="stage-node-icon" style={{ color: isUnlocked ? s.color : 'inherit' }}>
                  {STAGE_MINI_ICONS[s.avatarKey] || <FaDragon />}
                </div>
                <div className="stage-node-info">
                  <span className="stage-node-name">{getStageTitle(s)}</span>
                  <span className="stage-node-req">{s.minHours}h</span>
                </div>
                {isCurrent && <div className="stage-active-indicator" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="familiar-actions-row">
        <button className="pet-action-btn pet-btn" onClick={handlePet}>
          <FaHeart /> {t('focus.petFamiliar', { name: petData.name })}
        </button>
        <button className="pet-action-btn feed-btn" onClick={handleFeed} title={t('focus.feedTreat')}>
          <FaUtensils /> {t('focus.feedTreat')}
        </button>
      </div>

      {toast && <div className="familiar-toast fade-in">{toast}</div>}
    </div>
  );
}
