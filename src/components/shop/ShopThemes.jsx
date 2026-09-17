import { useState, useMemo } from 'react';
import {
  FaPalette, FaCheck, FaLock, FaLockOpen, FaCoins, FaSearch
} from 'react-icons/fa';
import {
  getThemeDisplayName,
  getThemeTagDisplayName,
} from '../../utils/characterTranslations';

export default function ShopThemes({
  availableThemes,
  unlockedThemes,
  currentTheme,
  coins,
  isLight,
  isAr,
  t,
  onEquipTheme,
  onBuyTheme
}) {
  const [themeFilter, setThemeFilter] = useState('all');
  const [themeSearch, setThemeSearch] = useState('');

  const filteredThemes = useMemo(() => {
    return availableThemes.filter(tItem => {
      const isUnlocked = unlockedThemes.includes(tItem.id);
      if (themeFilter === 'unlocked' && !isUnlocked) return false;
      if (themeFilter === 'store' && isUnlocked) return false;
      if (themeSearch.trim()) {
        const q = themeSearch.toLowerCase().trim();
        const enName = (tItem.name || '').toLowerCase();
        const arName = (getThemeDisplayName(tItem, true) || '').toLowerCase();
        if (!enName.includes(q) && !arName.includes(q)) return false;
      }
      return true;
    });
  }, [availableThemes, unlockedThemes, themeFilter, themeSearch]);

  return (
    <div className="shop-tab-pane fade-in" style={{ padding: '12px 18px', flex: '1 1 0%', minHeight: 0, overflowY: 'auto' }}>
      <div className="shop-controls-bar" style={{ marginBottom: '10px', gap: '8px' }}>
        <div className="shop-filter-tabs">
          <button
            className={`shop-tab-btn ${themeFilter === 'all' ? 'active' : ''}`}
            style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setThemeFilter('all')}
          >
            <FaPalette style={{ fontSize: '0.65rem' }} /> {t ? t('shop.themesAll', { count: availableThemes.length }) : (isAr ? `الكل (${availableThemes.length})` : `All (${availableThemes.length})`)}
          </button>
          <button
            className={`shop-tab-btn ${themeFilter === 'unlocked' ? 'active' : ''}`}
            style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setThemeFilter('unlocked')}
          >
            <FaCheck style={{ fontSize: '0.65rem', color: '#10b981' }} /> {t ? t('shop.themesUnlocked', { count: unlockedThemes.length }) : (isAr ? `المملوكة (${unlockedThemes.length})` : `Unlocked (${unlockedThemes.length})`)}
          </button>
          <button
            className={`shop-tab-btn ${themeFilter === 'store' ? 'active' : ''}`}
            style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setThemeFilter('store')}
          >
            <FaLock style={{ fontSize: '0.65rem', color: '#fbbf24' }} /> {t ? t('shop.themesStore', { count: availableThemes.length - unlockedThemes.length }) : (isAr ? `المتجر (${availableThemes.length - unlockedThemes.length})` : `Store (${availableThemes.length - unlockedThemes.length})`)}
          </button>
        </div>
        <div className="shop-search-box" style={{ maxWidth: '200px' }}>
          <FaSearch className="search-icon-inside" style={{ fontSize: '0.75rem' }} />
          <input
            type="text"
            className="shop-search-input"
            style={{ padding: '4px 10px 4px 24px', fontSize: '0.74rem' }}
            placeholder={t ? t('shop.searchThemes') : (isAr ? 'ابحث عن السمات...' : 'Search themes...')}
            value={themeSearch}
            onChange={e => setThemeSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="theme-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
        {filteredThemes.map(tItem => {
          const isUnlocked = unlockedThemes.includes(tItem.id);
          const isEquipped = currentTheme === tItem.id;
          const canAfford = coins >= tItem.cost;

          return (
            <div key={tItem.id} className={`theme-card ${isEquipped ? 'equipped' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`} style={{ borderRadius: '12px' }}>
              <div className="theme-preview" style={{ background: tItem.preview, height: '56px' }}>
                {tItem.tag && <span className="tier-tag" style={{ fontSize: '0.55rem' }}>{getThemeTagDisplayName(tItem.tag, isAr)}</span>}
                {isEquipped ? (
                  <span className="active-badge" style={{ fontSize: '0.58rem', padding: '2px 6px' }}><FaCheck /> {t ? t('shop.active') : (isAr ? 'نشطة' : 'Active')}</span>
                ) : !isUnlocked ? (
                  <span className="locked-badge" style={{ fontSize: '0.65rem' }}><FaLock /></span>
                ) : null}
                {tItem.colors && (
                  <div className="theme-palette-swatch">
                    {tItem.colors.map((c, i) => <span key={i} className="swatch-dot" style={{ background: c, width: '8px', height: '8px' }} />)}
                  </div>
                )}
              </div>
              <div className="theme-info" style={{ padding: '6px 8px' }}>
                <h4 style={{ fontSize: '0.8rem', margin: '0 0 2px' }}>{getThemeDisplayName(tItem, isAr)}</h4>
                <div className="theme-cost-row">
                  {isUnlocked ? (
                    <span className="cost-unlocked" style={{ fontSize: '0.62rem' }}><FaCheck style={{ fontSize: '0.55rem' }} /> {t ? t('shop.unlocked') : (isAr ? 'مفتوحة' : 'Unlocked')}</span>
                  ) : (
                    <span className="cost-coins" style={{ fontSize: '0.66rem' }}><FaCoins style={{ fontSize: '0.6rem' }} /> {isAr ? `${tItem.cost} عملة` : `${tItem.cost} Coins`}</span>
                  )}
                </div>
              </div>
              <div className="theme-action" style={{ padding: '0 8px 6px' }}>
                {isEquipped ? (
                  <button className="theme-btn active-btn" style={{ padding: '4px 6px', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }} disabled><FaCheck /> {t ? t('shop.equipped') : (isAr ? 'مجهزة' : 'Equipped')}</button>
                ) : isUnlocked ? (
                  <button className="theme-btn equip-btn" style={{ padding: '4px 6px', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }} onClick={() => onEquipTheme(tItem.id)}>
                    <FaPalette /> {t ? t('shop.equip') : (isAr ? 'تجهيز' : 'Equip')}
                  </button>
                ) : (
                  <button
                    className={`theme-btn buy-btn ${!canAfford ? 'disabled' : ''}`}
                    style={{
                      padding: '4px 8px', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', borderRadius: '7px', fontWeight: 700, opacity: 1,
                      ...(canAfford
                        ? {}
                        : (isLight
                            ? { background: '#fef3c7', color: '#92400e', border: '1.5px solid #f59e0b' }
                            : { background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)' }
                          )
                      )
                    }}
                    disabled={!canAfford}
                    onClick={() => onBuyTheme(tItem)}
                    title={canAfford ? (isAr ? `فتح ${getThemeDisplayName(tItem, isAr)} مقابل ${tItem.cost} عملة` : `Unlock ${tItem.name} for ${tItem.cost} Coins`) : (isAr ? `تحتاج ${tItem.cost - coins} عملة إضافية` : `Need ${tItem.cost - coins} more coins`)}
                  >
                    {canAfford ? (
                      <><FaLockOpen /> <FaCoins style={{ fontSize: '0.65rem' }} /> {isAr ? `فتح (${tItem.cost})` : `Unlock (${tItem.cost})`}</>
                    ) : (
                      <><FaLock style={{ color: isLight ? '#b45309' : '#fbbf24', fontSize: '0.68rem' }} /> <FaCoins style={{ color: '#f59e0b', fontSize: '0.68rem' }} /> {t ? t('shop.needCoinsShort', { count: tItem.cost - coins }) : (isAr ? `تحتاج ${tItem.cost - coins}` : `Need ${tItem.cost - coins}`)}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
