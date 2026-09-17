import {
  FaCoins, FaShoppingBag, FaLock
} from 'react-icons/fa';
import { CONSUMABLE_ITEMS } from '../../hooks/useInventoryStorage';
import {
  getSeriesDisplayName,
  getConsumableDisplayName,
  getConsumableDescription,
} from '../../utils/characterTranslations';
import { SeriesIcon, ItemIcon } from './shopIcons';
import { SERIES_META } from './shopConstants';

export default function ShopConsumables({
  coins,
  items,
  isLight,
  isAr,
  t,
  onBuyConsumable
}) {
  return (
    <div className="shop-tab-pane fade-in" style={{ padding: '14px 20px', flex: '1 1 0%', minHeight: 0, overflowY: 'auto' }}>
      <div className="anime-shop-header-row" style={{ marginBottom: '12px' }}>
        <p className="anime-shop-intro" style={{ fontSize: '0.75rem', margin: 0 }}>
          {t ? t('shop.consumablesSubtitle') : (isAr ? 'افتح القدرات والتعزيزات الفريدة من عالم الأنمي لتعزيز جلسات دراستك.' : 'Unlock signature abilities and boosters from across the anime universe to empower your study sessions.')}
        </p>
      </div>
      <div
        className="shop-items-grid anime-items-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box',
          paddingBottom: '8px',
          alignItems: 'start',
        }}
      >
        {CONSUMABLE_ITEMS.map(item => {
          const canAfford = coins >= item.cost;
          const ownedCount = items?.[item.id] || 0;
          const meta = SERIES_META[item.series] || {};

          return (
            <div
              key={item.id}
              className="shop-item-card anime-shop-item-card"
              style={{
                borderColor: meta.border,
                '--series-color': meta.color,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '14px',
                boxSizing: 'border-box',
              }}
            >
              <div>
                <div className="anime-card-series-strip" style={{ background: meta.color, padding: '3px 8px', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '6px' }}>
                  <SeriesIcon series={item.series} style={{ fontSize: '0.65rem' }} />
                  <span style={{ fontWeight: 800 }}>{getSeriesDisplayName(item.series, isAr)}</span>
                </div>

                <div className="shop-item-top" style={{ margin: '8px 0 6px' }}>
                  <div className="shop-item-emoji anime-item-emoji" style={{ fontSize: '1.4rem', color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ItemIcon itemId={item.id} />
                  </div>
                  <div className="shop-item-cost" style={{ fontSize: '0.78rem' }}>
                    <FaCoins />
                    {item.cost}
                  </div>
                </div>
                <h4 style={{ fontSize: '0.88rem', margin: '4px 0 3px', fontWeight: 700, color: isLight ? '#0f172a' : '#f8fafc' }}>{getConsumableDisplayName(item, isAr)}</h4>
                <p className="shop-item-desc" style={{ fontSize: '0.7rem', marginBottom: '8px', lineHeight: 1.45, color: isLight ? '#475569' : '#94a3b8' }}>{getConsumableDescription(item, isAr)}</p>
              </div>

              <div className="shop-item-foot" style={{ marginTop: 'auto', paddingTop: '8px', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)' }}>
                <span className="owned-tag" style={{ fontSize: '0.66rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <FaShoppingBag style={{ fontSize: '0.62rem' }} /> {t ? t('shop.inBag', { count: ownedCount }) : (isAr ? `في الحقيبة: ${ownedCount}` : `In Bag: ${ownedCount}`)}
                </span>
                <button
                  className={`buy-item-action-btn anime-buy-btn ${!canAfford ? 'disabled' : ''}`}
                  style={{
                    padding: '6px 12px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px', fontWeight: 700, opacity: 1,
                    ...(canAfford
                      ? { background: meta.color, color: '#fff', border: 'none', cursor: 'pointer' }
                      : (isLight
                          ? { background: '#fef3c7', color: '#92400e', border: '1.5px solid #f59e0b', cursor: 'not-allowed' }
                          : { background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)', cursor: 'not-allowed' }
                        )
                    )
                  }}
                  disabled={!canAfford}
                  onClick={() => onBuyConsumable(item)}
                >
                  {canAfford ? (
                    <><FaCoins /> {t ? t('shop.buy', { cost: item.cost }) : (isAr ? `شراء (${item.cost})` : `Buy (${item.cost})`)}</>
                  ) : (
                    <><FaLock style={{ color: isLight ? '#b45309' : '#fbbf24', fontSize: '0.7rem' }} /><FaCoins style={{ color: '#f59e0b', fontSize: '0.68rem' }} /> {t ? t('shop.needCoinsShort', { count: item.cost - coins }) : (isAr ? `تحتاج ${item.cost - coins}` : `Need ${item.cost - coins}`)}</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
