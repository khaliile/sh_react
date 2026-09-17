import React from 'react';
import { FaUserNinja, FaStore, FaBolt, FaStar, FaLock, FaShoppingCart, FaCheck } from 'react-icons/fa';

export default function MascotSettings({
  isAr,
  activeChar,
  handleCharChange,
  unlockedCharacters,
  lockedCharacters,
  handleOpenStore,
  uiLang,
  handleLangChange,
  ttsEngine,
  setTtsEngine,
  voiceId,
  setVoiceId,
  piperVoices = [],
  handleSaveSettings,
}) {
  return (
    <div
      className="mascot-settings-panel"
      style={{
        maxHeight: '310px',
        overflowY: 'auto',
        fontSize: '0.8rem',
        paddingBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <label className="mascot-settings-label">
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <FaUserNinja style={{ marginRight: 6 }} />
            {isAr ? 'الشخصية الرفيقة' : 'Active Companion'}
          </span>
          <span className="mascot-settings-badge-synced">
            <FaBolt style={{ marginInlineEnd: 4 }} />{isAr ? 'متزامن مع البروفايل' : 'Synced with Profile'}
          </span>
        </span>
        <select className="mascot-input" value={activeChar} onChange={e => handleCharChange(e.target.value)}>
          <optgroup label={isAr ? "الشخصيات المفتوحة (جاهزة)" : "Unlocked Companions (Ready)"}>
            {unlockedCharacters.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.id === activeChar ? (isAr ? '(المفعل حالياً)' : '(Active)') : ''}
              </option>
            ))}
          </optgroup>
          {lockedCharacters.length > 0 && (
            <optgroup label={isAr ? "شخصيات مقفلة (افتحها من المتجر)" : "Locked Characters (Buy in Store)"}>
              {lockedCharacters.map(c => (
                <option key={c.id} value={c.id} disabled style={{ opacity: 0.6, color: '#94a3b8' }}>
                  [X] {c.name} ({c.cost ? `${c.cost} coins` : 'Locked'})
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <button
          type="button"
          onClick={handleOpenStore}
          className="mascot-shop-shortcut-btn"
        >
          <FaShoppingCart style={{ fontSize: '0.8rem' }} />
          {isAr ? 'فتح متجر الشخصيات لشراء المزيد' : 'Open Shop to Unlock More Characters'}
        </button>
      </label>

      <label className="mascot-settings-label">
        <span>{isAr ? 'لغة الواجهة والصوت' : 'UI / Speech Language'}</span>
        <select className="mascot-input" value={uiLang} onChange={e => handleLangChange(e.target.value)}>
          <option value="en-US">English</option>
          <option value="ar-SA">العربية</option>
        </select>
      </label>

      <label className="mascot-settings-label">
        <span>TTS Engine</span>
        <select className="mascot-input" value={ttsEngine} onChange={e => setTtsEngine(e.target.value)}>
          <option value="piper">Piper TTS (Local Neural :8100)</option>
          <option value="browser">Browser Native Speech</option>
        </select>
      </label>

      {ttsEngine === 'piper' && (
        <label className="mascot-settings-label">
          <span>Piper Voice</span>
          <select className="mascot-input" value={voiceId} onChange={e => setVoiceId(e.target.value)}>
            {piperVoices.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </label>
      )}

      <button 
        onClick={handleSaveSettings} 
        className="mascot-chip mascot-settings-save-btn" 
      >
        {isAr ? 'حفظ وإغلاق' : 'Save & Close'}
      </button>
    </div>
  );
}
