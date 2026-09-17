import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FaCoins, FaPalette, FaShoppingBag, FaTimes, FaUserNinja,
  FaBolt, FaShieldAlt, FaFlask
} from 'react-icons/fa';
import { useRpgStorage } from '../hooks/useRpgStorage';
import {
  useInventoryStorage,
  CONSUMABLE_ITEMS,
  ANIME_CHARACTERS
} from '../hooks/useInventoryStorage';
import { useTimeTracker } from '../hooks/useAppHooks';
import { usePetStorage } from '../hooks/usePetStorage';
import { useLanguage } from '../contexts/LanguageContext';

import ShopAvatarGrid from './shop/ShopAvatarGrid';
import ShopVault from './shop/ShopVault';
import ShopConsumables from './shop/ShopConsumables';
import ShopThemes from './shop/ShopThemes';

export default function ShopModal({ isOpen, onClose, initialTab = 'avatars' }) {
  const { coins, currentTheme, unlockedThemes, availableThemes, buyTheme, equipTheme, damageBoss } = useRpgStorage();
  const {
    items,
    collectibles,
    equippedAvatar,
    activeBuffs,
    buyItem,
    buyCollectible,
    equipAvatar,
    useItem: consumeItem
  } = useInventoryStorage();
  const { addMinutes } = useTimeTracker();
  const { feedFamiliar } = usePetStorage();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [mainTab, setMainTab] = useState(initialTab);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && initialTab) {
      setMainTab(initialTab);
    }
  }

  const [toast, setToast] = useState(null);
  const isLight = document.documentElement.getAttribute('data-theme') === 'light' || currentTheme === 'light';

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBuyCharacter = (char) => {
    const res = buyCollectible(char.id);
    showToast(res.message);
  };

  const handleEquipAvatar = (char) => {
    const res = equipAvatar(char.id);
    showToast(res.message);
  };

  const handleBuyConsumable = (item) => {
    const res = buyItem(item.id);
    showToast(res.message);
  };

  const handleUseConsumable = (item) => {
    const res = consumeItem(item.id, {
      onBossBomb: (dmg) => damageBoss(dmg, 'Titan Serum Strike'),
      onTimeWarp: (mins) => addMinutes(mins, { category: 'math', task: 'Nen Focus Warp' }),
      onPetTreat: () => feedFamiliar(0),
    });
    showToast(res.message);
  };

  const handleBuyTheme = (tItem) => {
    const res = buyTheme(tItem.id);
    if (res.success) {
      showToast(isAr ? `تم فتح ${tItem.name}!` : `Unlocked ${tItem.name}!`);
    } else {
      showToast(res.message);
    }
  };

  const totalBagCount = useMemo(() => {
    const ownedCharCount = ANIME_CHARACTERS.filter(c => collectibles?.[c.id]).length;
    const itemsCount = Object.values(items || {}).reduce((a, b) => a + (b || 0), 0);
    return ownedCharCount + itemsCount;
  }, [collectibles, items]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal-overlay unified-shop-overlay shop-modal-overlay fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(2, 6, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="modal-container anime-shop-container unified-shop-container"
        onClick={e => e.stopPropagation()}
        style={{
          width: '94vw',
          maxWidth: '860px',
          height: '84vh',
          maxHeight: '680px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
          borderRadius: '18px',
        }}
      >
        {/* ── MODAL HEADER ── */}
        <header className="modal-header anime-modal-header" style={{ padding: '12px 20px', flexShrink: 0 }}>
          <div className="modal-header-title">
            <h2 style={{ fontSize: '1.10rem' }}>
              <FaUserNinja style={{ marginRight: '8px', fontSize: '1.2rem', color: '#a855f7' }} />
              {t('shop.title')}
            </h2>
            <p className="modal-subtitle" style={{ fontSize: '0.72rem' }}>
              {t('shop.clickToEquip')}
            </p>
          </div>
          <div className="header-right-actions">
            <div className="coins-badge-modal" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
              <FaCoins className="coin-icon" />
              <span>{coins} {t('shop.coinsBalance', { count: '' }).trim()}</span>
            </div>
            <button className="modal-close-icon-btn" onClick={onClose} title={isAr ? t('shop.closeShop') : "Close Shop"} style={{ width: '28px', height: '28px' }}>
              <FaTimes />
            </button>
          </div>
        </header>

        {/* ── ACTIVE POWERS / BUFFS BANNER ── */}
        {(activeBuffs?.isDoubleXpActive || (activeBuffs?.streakShieldCount || 0) > 0) && (
          <div className="active-buffs-bar" style={{ padding: '6px 20px', flexShrink: 0 }}>
            <span className="active-buffs-label" style={{ fontSize: '0.7rem' }}>
              <FaBolt style={{ color: '#f59e0b' }} /> {t('shop.activePowers')}
            </span>
            {activeBuffs?.isDoubleXpActive && (
              <span className="buff-pill xp-pill" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                <FaFlask /> {t('shop.doubleXp', { mins: activeBuffs.doubleXpRemainingMins })}
              </span>
            )}
            {(activeBuffs?.streakShieldCount || 0) > 0 && (
              <span className="buff-pill shield-pill" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                <FaShieldAlt style={{ marginRight: '4px' }} /> {activeBuffs.streakShieldCount > 1 ? t('shop.nakamaShields', { count: activeBuffs.streakShieldCount }) : t('shop.nakamaShield', { count: activeBuffs.streakShieldCount })}
              </span>
            )}
          </div>
        )}

        {/* ── NAVIGATION TABS ── */}
        <div className="shop-top-tabs" style={{ flexShrink: 0 }}>
          <button
            className={`shop-top-tab ${mainTab === 'avatars' ? 'active' : ''}`}
            onClick={() => setMainTab('avatars')}
          >
            <span><FaUserNinja style={{ marginRight: '6px' }} />{t('shop.avatarsTab')}</span>
            <span className="tab-badge">{ANIME_CHARACTERS.length}</span>
          </button>
          <button
            className={`shop-top-tab ${mainTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setMainTab('inventory')}
          >
            <FaShoppingBag /> {t('shop.bagTab')}
            <span className="tab-badge">{totalBagCount}</span>
          </button>
          <button
            className={`shop-top-tab ${mainTab === 'item_shop' ? 'active' : ''}`}
            onClick={() => setMainTab('item_shop')}
          >
            <FaBolt /> {t('shop.consumablesTab')}
            <span className="tab-badge">{CONSUMABLE_ITEMS.length}</span>
          </button>
          <button
            className={`shop-top-tab ${mainTab === 'themes' ? 'active' : ''}`}
            onClick={() => setMainTab('themes')}
          >
            <FaPalette /> {t('shop.themesTab')}
            <span className="tab-badge">{availableThemes.length}</span>
          </button>
        </div>

        {/* ── ACTIVE TAB CONTENT ── */}
        {mainTab === 'avatars' && (
          <ShopAvatarGrid
            collectibles={collectibles}
            equippedAvatar={equippedAvatar}
            coins={coins}
            isLight={isLight}
            isAr={isAr}
            t={t}
            onEquipAvatar={handleEquipAvatar}
            onBuyCharacter={handleBuyCharacter}
          />
        )}

        {mainTab === 'inventory' && (
          <ShopVault
            collectibles={collectibles}
            items={items}
            equippedAvatar={equippedAvatar}
            isLight={isLight}
            isAr={isAr}
            t={t}
            onEquipAvatar={handleEquipAvatar}
            onUseConsumable={handleUseConsumable}
          />
        )}

        {mainTab === 'item_shop' && (
          <ShopConsumables
            coins={coins}
            items={items}
            isLight={isLight}
            isAr={isAr}
            t={t}
            onBuyConsumable={handleBuyConsumable}
          />
        )}

        {mainTab === 'themes' && (
          <ShopThemes
            availableThemes={availableThemes}
            unlockedThemes={unlockedThemes}
            currentTheme={currentTheme}
            coins={coins}
            isLight={isLight}
            isAr={isAr}
            t={t}
            onEquipTheme={equipTheme}
            onBuyTheme={handleBuyTheme}
          />
        )}

        {/* ── TOAST NOTIFICATION ── */}
        {toast && <div className="familiar-toast fade-in anime-toast" style={{ zIndex: 100001 }}>{toast}</div>}

        {/* ── MODAL FOOTER ── */}
        <footer
          className="modal-footer anime-modal-footer"
          style={{
            padding: '10px 20px',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            background: isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.7)',
            borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span
            className="modal-footer-hint"
            style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              color: isLight ? '#334155' : '#94a3b8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FaCoins style={{ color: '#f59e0b', fontSize: '0.8rem', flexShrink: 0 }} /> {t('shop.earnCoinsHint')}
          </span>
          <button
            className="close-btn anime-footer-close-btn"
            style={{
              padding: '6px 18px',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: 'pointer',
              background: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)',
              color: isLight ? '#0f172a' : '#ffffff',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.18)',
              transition: 'all 0.2s ease',
            }}
            onClick={onClose}
          >
            {t('shop.close')}
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
