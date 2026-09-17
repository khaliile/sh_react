import { useMemo } from 'react';
import {
  FaCheck, FaBolt, FaUserCheck, FaUserNinja
} from 'react-icons/fa';
import {
  CONSUMABLE_ITEMS,
  ANIME_CHARACTERS,
  RARITY_COLORS
} from '../../hooks/useInventoryStorage';
import AnimeFaceAvatar from '../AnimeFaceAvatar';
import {
  getCharacterDisplayName,
  getCharacterTitle,
  getCharacterQuote,
  getSeriesDisplayName,
  getRarityDisplayName,
  getConsumableDisplayName,
  getConsumableDescription,
} from '../../utils/characterTranslations';
import { SeriesIcon, ItemIcon } from './shopIcons';
import { SERIES_META } from './shopConstants';

export default function ShopVault({
  collectibles,
  items,
  equippedAvatar,
  isLight,
  isAr,
  t,
  onEquipAvatar,
  onUseConsumable
}) {
  const ownedCharList = useMemo(() => {
    return ANIME_CHARACTERS.filter(c => collectibles?.[c.id]);
  }, [collectibles]);

  const ownedItemKeys = useMemo(() => {
    return Object.keys(items || {}).filter(k => (items[k] || 0) > 0);
  }, [items]);

  const activeChar = useMemo(() => {
    if (!equippedAvatar) return null;
    return ANIME_CHARACTERS.find(c => c.id === equippedAvatar) || ANIME_CHARACTERS[0];
  }, [equippedAvatar]);

  return (
    <div className="shop-tab-pane fade-in" style={{ padding: '12px 18px', flex: '1 1 0%', minHeight: 0, overflowY: 'auto' }}>
      {/* Active Avatar Spotlight Card */}
      {activeChar && (
        <div className="active-avatar-spotlight-card" style={{ padding: '10px 14px', marginBottom: '14px' }}>
          {(() => {
            const meta = SERIES_META[activeChar.series] || {};
            return (
              <div className="spotlight-flex" style={{ gap: '12px' }}>
                <AnimeFaceAvatar id={activeChar.id} size={58} borderColor="#10b981" glow={true} />
                <div className="spotlight-info">
                  <div className="spotlight-tag" style={{ fontSize: '0.66rem' }}>
                    <FaUserCheck style={{ color: '#10b981' }} /> {t ? t('shop.activeProfileAvatar') : (isAr ? 'الصورة الرمزية النشطة للملف' : 'Active Profile Avatar')}
                  </div>
                  <h2 style={{ fontSize: '1rem', margin: '2px 0' }}>{getCharacterDisplayName(activeChar, isAr)}</h2>
                  <div className="spotlight-title" style={{ color: meta.color, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <SeriesIcon series={activeChar.series} style={{ fontSize: '0.7rem' }} /> {getSeriesDisplayName(activeChar.series, isAr)} · {getCharacterTitle(activeChar, isAr)}
                  </div>
                  <p className="spotlight-quote" style={{ fontSize: '0.68rem', margin: '2px 0 0' }}>"{getCharacterQuote(activeChar, isAr)}"</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Owned Characters Vault */}
      <div className="vault-section-header" style={{ marginBottom: '8px' }}>
        <h3 style={{ fontSize: '0.9rem' }}>
          <FaUserNinja style={{ marginRight: '6px', color: '#a855f7' }} />
          {t ? t('shop.unlockedCharactersInBag', { count: ownedCharList.length, total: ANIME_CHARACTERS.length, owned: ownedCharList.length }) : (isAr ? `الشخصيات المفتوحة في الحقيبة (${ownedCharList.length}/${ANIME_CHARACTERS.length})` : `Unlocked Characters in Bag (${ownedCharList.length}/${ANIME_CHARACTERS.length})`)}
        </h3>
      </div>

      <div className="owned-avatars-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
        {ownedCharList.map(char => {
          const isEquipped = equippedAvatar === char.id;
          const meta = SERIES_META[char.series] || {};
          const rc = RARITY_COLORS[char.rarity] || RARITY_COLORS.Rare;

          return (
            <div
              key={char.id}
              className={`owned-avatar-card ${isEquipped ? 'is-active-equipped' : ''}`}
              style={{ padding: '6px 10px', gap: '8px' }}
              onClick={() => !isEquipped && onEquipAvatar(char)}
              title={isEquipped ? (isAr ? `${getCharacterDisplayName(char, isAr)} مجهزة حالياً` : `${char.name} is equipped`) : (isAr ? `اضغط لتجهيز ${getCharacterDisplayName(char, isAr)}` : `Click to equip ${char.name}`)}
            >
              <AnimeFaceAvatar id={char.id} size={44} borderColor={isEquipped ? '#10b981' : rc.color} glow={isEquipped} />
              <div className="owned-avatar-info">
                <span className="owned-avatar-name" style={{ fontSize: '0.78rem' }}>{getCharacterDisplayName(char, isAr)}</span>
                <span className="owned-avatar-series" style={{ color: meta.color, fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <SeriesIcon series={char.series} style={{ fontSize: '0.6rem' }} /> {getSeriesDisplayName(char.series, isAr)}
                </span>
                <span className="owned-avatar-rarity" style={{ color: rc.color, fontSize: '0.6rem' }}>{getRarityDisplayName(char.rarity, isAr)}</span>
              </div>
              <div className="owned-avatar-btn-wrap">
                {isEquipped ? (
                  <span className="equipped-pill" style={{ fontSize: '0.6rem', padding: '2px 6px' }}><FaCheck /> {t ? t('shop.equipped') : (isAr ? 'مجهزة' : 'Equipped')}</span>
                ) : (
                  <button className="quick-equip-btn" style={{ fontSize: '0.65rem', padding: '3px 8px' }} onClick={(e) => { e.stopPropagation(); onEquipAvatar(char); }}>
                    {t ? t('shop.equip') : (isAr ? 'تجهيز' : 'Equip')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Owned Consumable Power-Ups */}
      {ownedItemKeys.length > 0 && (
        <>
          <div className="vault-section-header" style={{ marginTop: '16px', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '0.9rem' }}><FaBolt style={{ color: '#f59e0b', marginRight: '6px' }} /> {t ? t('shop.usablePowerUps') : (isAr ? 'التعزيزات القابلة للاستخدام' : 'Usable Power-Ups')}</h3>
          </div>
          <div className="inventory-items-grid" style={{ gap: '8px' }}>
            {ownedItemKeys.map(key => {
              const item = CONSUMABLE_ITEMS.find(i => i.id === key);
              if (!item) return null;
              const count = items[key];
              const meta = SERIES_META[item.series] || {};
              return (
                <div key={key} className="inventory-card anime-item-card" style={{ borderColor: meta.border, background: meta.bg, padding: '8px 12px' }}>
                  <div className="inventory-card-top">
                    <div className="item-icon-box anime-icon-box" style={{ borderColor: meta.color, width: '40px', height: '40px', color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ItemIcon itemId={item.id} style={{ fontSize: '1.2rem' }} />
                      <span className="item-count-badge" style={{ background: meta.color, fontSize: '0.6rem' }}>×{count}</span>
                    </div>
                    <div className="item-details">
                      <div className="item-name-row">
                        <h4 style={{ fontSize: '0.82rem' }}>{getConsumableDisplayName(item, isAr)}</h4>
                        <span className="anime-series-pill" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, fontSize: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <SeriesIcon series={item.series} style={{ fontSize: '0.55rem' }} /> {getSeriesDisplayName(item.series, isAr)}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.68rem' }}>{getConsumableDescription(item, isAr)}</p>
                    </div>
                  </div>
                  <button className="use-item-btn anime-use-btn" style={{ background: meta.color, padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => onUseConsumable(item)}>
                    <FaBolt /> {t ? t('shop.activate') : (isAr ? 'تفعيل' : 'Activate')}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
