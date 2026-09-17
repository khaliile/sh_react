import { useState, useMemo, useEffect, useRef } from 'react';
import {
  FaCoins, FaCheck, FaLock, FaLockOpen, FaStar,
  FaUserCheck, FaQuoteLeft, FaUserNinja, FaChevronDown, FaSearch, FaTimes
} from 'react-icons/fa';
import {
  ANIME_CHARACTERS,
  RARITY_COLORS,
  SERIES_LIST
} from '../../hooks/useInventoryStorage';
import AnimeFaceAvatar from '../AnimeFaceAvatar';
import {
  getCharacterDisplayName,
  getCharacterTitle,
  getCharacterDesc,
  getCharacterQuote,
  getSeriesDisplayName,
  getRarityDisplayName,
} from '../../utils/characterTranslations';
import { SeriesIcon } from './shopIcons';
import { SERIES_META } from './shopConstants';

const CARDS_PER_PAGE = 9;

export default function ShopAvatarGrid({
  collectibles,
  equippedAvatar,
  coins,
  isLight,
  isAr,
  t,
  onEquipAvatar,
  onBuyCharacter
}) {
  const [characterSearch, setCharacterSearch] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('All');
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [ownershipFilter, setOwnershipFilter] = useState('All'); // 'All' | 'Owned' | 'Store'
  const [charPage, setCharPage] = useState(1);
  const [isSeriesOpen, setIsSeriesOpen] = useState(false);
  const seriesRef = useRef(null);

  // Close series dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (seriesRef.current && !seriesRef.current.contains(e.target)) {
        setIsSeriesOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSeriesOpen(false);
      }
    };
    if (isSeriesOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSeriesOpen]);

  const handleSeriesSelect = (series) => {
    setSelectedSeries(series);
    setIsSeriesOpen(false);
    setCharPage(1);
  };

  const handleRaritySelect = (r) => {
    setSelectedRarity(r);
    setCharPage(1);
  };

  const handleOwnershipSelect = (filter) => {
    setOwnershipFilter(filter);
    setCharPage(1);
  };

  const handleSearchChange = (val) => {
    setCharacterSearch(val);
    setCharPage(1);
  };

  const handleResetFilters = () => {
    setSelectedSeries('All');
    setSelectedRarity('All');
    setOwnershipFilter('All');
    setCharacterSearch('');
    setCharPage(1);
  };

  const ownedCharList = useMemo(() => {
    return ANIME_CHARACTERS.filter(c => collectibles?.[c.id]);
  }, [collectibles]);

  const filteredCharacters = useMemo(() => {
    return ANIME_CHARACTERS.filter(char => {
      // Series filter
      if (selectedSeries !== 'All' && char.series !== selectedSeries) return false;
      // Rarity filter
      if (selectedRarity !== 'All' && char.rarity !== selectedRarity) return false;
      // Ownership filter
      const isOwned = Boolean(collectibles?.[char.id]);
      if (ownershipFilter === 'Owned' && !isOwned) return false;
      if (ownershipFilter === 'Store' && isOwned) return false;
      // Search query
      if (characterSearch.trim()) {
        const q = characterSearch.toLowerCase().trim();
        const matchName = char.name.toLowerCase().includes(q);
        const matchSeries = char.series.toLowerCase().includes(q);
        const matchTitle = (char.title || '').toLowerCase().includes(q);
        if (!matchName && !matchSeries && !matchTitle) return false;
      }
      return true;
    });
  }, [selectedSeries, selectedRarity, collectibles, ownershipFilter, characterSearch]);

  const selectedSeriesMeta = SERIES_META[selectedSeries] || {};
  const totalPages = Math.ceil(filteredCharacters.length / CARDS_PER_PAGE);
  const pageChars = filteredCharacters.slice((charPage - 1) * CARDS_PER_PAGE, charPage * CARDS_PER_PAGE);

  return (
    <div className="shop-tab-pane fade-in" style={{ padding: '12px 18px', flex: '1 1 0%', minHeight: 0, overflowY: 'auto' }}>
      {/* Filter and Search Bar */}
      <div className="anime-shop-controls-block compact-controls" style={{ padding: '8px 12px', marginBottom: '12px', gap: '8px' }}>
        <div className="sub-filters-row" style={{ gap: '8px' }}>
          {/* Anime Series Custom Dropdown Selector */}
          <div className="series-custom-dropdown" ref={seriesRef}>
            <button
              type="button"
              className={`series-dropdown-trigger ${isSeriesOpen ? 'open' : ''} ${selectedSeries !== 'All' ? 'has-selection' : ''}`}
              onClick={() => setIsSeriesOpen(prev => !prev)}
              style={{
                borderColor: selectedSeries !== 'All' ? selectedSeriesMeta.color : (isLight ? '#cbd5e1' : 'rgba(255,255,255,0.15)'),
                background: selectedSeries !== 'All' ? selectedSeriesMeta.bg : (isLight ? '#ffffff' : 'rgba(0,0,0,0.3)'),
              }}
              aria-haspopup="listbox"
              aria-expanded={isSeriesOpen}
              aria-label="Filter Anime Series"
            >
              <span
                className="series-trigger-icon"
                style={{
                  color: selectedSeries !== 'All' ? selectedSeriesMeta.color : '#facc15'
                }}
              >
                {selectedSeries !== 'All' ? <SeriesIcon series={selectedSeries} /> : <FaStar />}
              </span>
              <span className="series-trigger-label" style={{ color: isLight ? '#0f172a' : (selectedSeries !== 'All' ? '#fff' : 'var(--text-primary, #fff)') }}>
                {selectedSeries !== 'All' ? getSeriesDisplayName(selectedSeries, isAr) : t('shop.allSeries')}
              </span>
              <span className="series-trigger-count">
                {selectedSeries !== 'All'
                  ? ANIME_CHARACTERS.filter(c => c.series === selectedSeries).length
                  : ANIME_CHARACTERS.length}
              </span>
              <FaChevronDown className={`series-trigger-chevron ${isSeriesOpen ? 'open' : ''}`} />
            </button>

            {/* Dropdown Menu Popup */}
            {isSeriesOpen && (
              <div
                className="series-dropdown-menu"
                role="listbox"
                style={{
                  right: isAr ? 0 : 'auto',
                  left: isAr ? 'auto' : 0,
                }}
              >
                {/* "All Series" Option */}
                <button
                  type="button"
                  className={`series-dropdown-item ${selectedSeries === 'All' ? 'active' : ''}`}
                  onClick={() => handleSeriesSelect('All')}
                  role="option"
                  aria-selected={selectedSeries === 'All'}
                >
                  <span className="series-item-icon-box" style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15' }}>
                    <FaStar />
                  </span>
                  <span className="series-item-name">{t('shop.allSeries')}</span>
                  <span className="series-item-count">{ANIME_CHARACTERS.length}</span>
                  {selectedSeries === 'All' && <FaCheck className="series-item-check" style={{ color: '#facc15' }} />}
                </button>

                <div className="series-dropdown-divider" />

                {/* Series Options */}
                {SERIES_LIST.map(series => {
                  const count = ANIME_CHARACTERS.filter(c => c.series === series).length;
                  const meta = SERIES_META[series] || {};
                  const isSelected = selectedSeries === series;
                  return (
                    <button
                      key={series}
                      type="button"
                      className={`series-dropdown-item ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSeriesSelect(series)}
                      role="option"
                      aria-selected={isSelected}
                      style={isSelected ? {
                        background: meta.bg || 'rgba(56, 189, 248, 0.12)',
                        borderColor: meta.border || 'rgba(56, 189, 248, 0.3)',
                      } : undefined}
                    >
                      <span
                        className="series-item-icon-box"
                        style={{
                          background: meta.bg || 'rgba(255, 255, 255, 0.06)',
                          color: meta.color || '#38bdf8'
                        }}
                      >
                        <SeriesIcon series={series} style={{ fontSize: '0.85rem' }} />
                      </span>
                      <span
                        className="series-item-name"
                        style={isSelected ? { color: meta.color || '#fff', fontWeight: 700 } : undefined}
                      >
                        {getSeriesDisplayName(series, isAr)}
                      </span>
                      <span className="series-item-count">{count}</span>
                      {isSelected && (
                        <FaCheck className="series-item-check" style={{ color: meta.color || '#38bdf8' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rarity Filter Group */}
          <div className="rarity-filter-group" style={{ gap: '4px' }}>
            {['All', 'Mythic', 'Legendary', 'Epic', 'Rare'].map(r => {
              const rc = RARITY_COLORS[r];
              const isSel = selectedRarity === r;
              return (
                <button
                  key={r}
                  className={`rarity-tag-btn ${isSel ? 'active' : ''}`}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.68rem',
                    color: rc ? rc.color : (isSel ? '#fff' : 'var(--text-muted)'),
                    borderColor: isSel ? (rc?.color || '#38bdf8') : 'transparent',
                  }}
                  onClick={() => handleRaritySelect(r)}
                >
                  {r === 'All' ? t('shop.allRarities') : getRarityDisplayName(r, isAr)}
                </button>
              );
            })}
          </div>

          {/* Ownership Filter Group */}
          <div className="ownership-filter-group">
            <button
              className={`own-pill ${ownershipFilter === 'All' ? 'active' : ''}`}
              style={{ padding: '3px 8px', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={() => handleOwnershipSelect('All')}
            >
              <FaStar style={{ fontSize: '0.65rem' }} /> {t('shop.all')}
            </button>
            <button
              className={`own-pill ${ownershipFilter === 'Store' ? 'active' : ''}`}
              style={{ padding: '3px 8px', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={() => handleOwnershipSelect('Store')}
            >
              <FaLock style={{ fontSize: '0.65rem', color: '#fbbf24' }} /> {t('shop.store')}
            </button>
            <button
              className={`own-pill ${ownershipFilter === 'Owned' ? 'active' : ''}`}
              style={{ padding: '3px 8px', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={() => handleOwnershipSelect('Owned')}
            >
              <FaCheck style={{ fontSize: '0.65rem', color: '#10b981' }} /> {t('shop.owned')} ({ownedCharList.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="shop-search-box-wrap" style={{ minWidth: '150px', maxWidth: '220px' }}>
            <FaSearch className="search-icon-inside" style={{ fontSize: '0.75rem' }} />
            <input
              type="text"
              className="shop-search-input"
              style={{ padding: '5px 26px 5px 26px', fontSize: '0.74rem' }}
              placeholder={t('shop.searchPlaceholder')}
              value={characterSearch}
              onChange={e => handleSearchChange(e.target.value)}
            />
            {characterSearch && (
              <button className="clear-search-btn" onClick={() => handleSearchChange('')}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Character Cards Grid: 3 per row, paginated */}
      {filteredCharacters.length > 0 && (
        <>
          <div
            className="anime-character-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px',
            }}
          >
            {pageChars.map(char => {
              const isOwned = Boolean(collectibles?.[char.id]);
              const isEquipped = equippedAvatar === char.id;
              const canAfford = coins >= char.cost;
              const meta = SERIES_META[char.series] || {};
              const rc = RARITY_COLORS[char.rarity] || RARITY_COLORS.Rare;

              return (
                <div
                  key={char.id}
                  className={`anime-character-card compact-char-card ${isOwned ? 'owned-card' : 'store-card locked-store-card'} ${isEquipped ? 'equipped-active-card' : ''}`}
                  style={{
                    '--rarity-color': rc.color,
                    '--rarity-glow': rc.glow,
                    '--series-color': meta.color,
                    background: isLight
                      ? (isEquipped ? '#f0fdf4' : isOwned ? '#ffffff' : '#f8fafc')
                      : 'linear-gradient(145deg, rgba(20, 20, 30, 0.8), rgba(12, 12, 18, 0.95))',
                    borderColor: isEquipped ? '#10b981' : isOwned ? rc.color : (isLight ? '#e2e8f0' : 'rgba(255,255,255,0.12)'),
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                    borderRadius: '14px',
                    boxShadow: isLight
                      ? (isEquipped ? '0 0 16px rgba(16,185,129,0.2)' : '0 4px 14px rgba(0,0,0,0.08)')
                      : '0 4px 16px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Series Stripe */}
                  <div className="char-card-top-strip" style={{ background: meta.color, padding: '5px 10px' }}>
                    <span className="series-name-badge" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 800 }}>
                      <SeriesIcon series={char.series} style={{ fontSize: '0.7rem' }} /> {getSeriesDisplayName(char.series, isAr)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {!isOwned && (
                        <span style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.6rem', padding: '2px 7px', borderRadius: '5px', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 800 }}>
                          <FaLock style={{ fontSize: '0.52rem', color: '#fbbf24' }} /> {char.cost}
                        </span>
                      )}
                      <span className="rarity-badge-text" style={{ background: 'rgba(255,255,255,0.92)', color: rc.color, fontSize: '0.6rem', fontWeight: 900, padding: '2px 7px', borderRadius: '5px', letterSpacing: '0.04em' }}>
                        {getRarityDisplayName(char.rarity, isAr)}
                      </span>
                    </div>
                  </div>

                  {/* Portrait */}
                  <div className="char-portrait-container" style={{ padding: '14px 0 8px', position: 'relative' }}>
                    <div className="char-avatar-halo" style={{ padding: '6px', background: `radial-gradient(circle, ${rc.glow}44 0%, transparent 70%)` }}>
                      <AnimeFaceAvatar
                        id={char.id}
                        size={68}
                        borderColor={isEquipped ? '#10b981' : isOwned ? rc.color : (isLight ? '#cbd5e1' : 'rgba(255,255,255,0.2)')}
                        glow={isEquipped || isOwned}
                      />
                    </div>
                    {isEquipped && (
                      <div className="equipped-floating-tag" style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
                        <FaCheck /> {t('shop.activeAvatar')}
                      </div>
                    )}
                    {!isOwned && (
                      <div style={{
                        position: 'absolute', bottom: 0,
                        background: isLight ? '#fffbeb' : 'rgba(15, 23, 42, 0.95)',
                        color: isLight ? '#b45309' : '#fbbf24',
                        border: isLight ? '1px solid #fde68a' : '1px solid rgba(245,158,11,0.5)',
                        fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px',
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.5)',
                      }}>
                        <FaLock style={{ fontSize: '0.52rem' }} /> {isAr ? `${char.cost} عملة` : `${char.cost} Coins`}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="char-card-body" style={{ padding: '6px 14px 10px' }}>
                    <h3 className="char-name" style={{ fontSize: '0.95rem', marginBottom: '2px', color: isLight ? '#0f172a' : '#ffffff' }}>{getCharacterDisplayName(char, isAr)}</h3>
                    <div className="char-title" style={{ color: meta.color, fontSize: '0.7rem', marginBottom: '6px', fontWeight: 700 }}>{getCharacterTitle(char, isAr)}</div>
                    <p className="char-desc" style={{ fontSize: '0.72rem', marginBottom: '8px', WebkitLineClamp: 2, lineClamp: 2, color: isLight ? '#475569' : '#bbb' }}>{getCharacterDesc(char, isAr)}</p>

                    {char.quote && (
                      <div style={{ padding: '4px 8px', fontSize: '0.64rem', marginBottom: '4px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.04)', color: isLight ? '#475569' : '#ddd', borderLeft: isAr ? 'none' : `3px solid ${meta.color}`, borderRight: isAr ? `3px solid ${meta.color}` : 'none', borderRadius: isAr ? '6px 0 0 6px' : '0 6px 6px 0' }}>
                        <FaQuoteLeft style={{ fontSize: '0.52rem', marginRight: isAr ? '0' : '4px', marginLeft: isAr ? '4px' : '0', opacity: 0.6 }} />
                        <span>"{getCharacterQuote(char, isAr)}"</span>
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div style={{ padding: '8px 14px 12px', marginTop: 'auto', borderTop: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255,255,255,0.06)' }}>
                    {isOwned ? (
                      isEquipped ? (
                        <button className="char-action-btn equipped-btn" style={{ padding: '6px 10px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }} disabled>
                          <FaUserCheck /> {t('shop.currentlyEquipped')}
                        </button>
                      ) : (
                        <button
                          className="char-action-btn equip-action-btn"
                          style={{ background: meta.color, padding: '6px 10px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                          onClick={() => onEquipAvatar(char)}
                        >
                          <FaUserNinja /> {t('shop.equipAvatar')}
                        </button>
                      )
                    ) : (
                      <button
                        className={`char-action-btn buy-char-btn ${!canAfford ? 'disabled' : ''}`}
                        disabled={!canAfford}
                        style={{
                          padding: '6px 10px', fontSize: '0.74rem', width: '100%',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px', cursor: canAfford ? 'pointer' : 'not-allowed', fontWeight: 800,
                          opacity: 1,
                          ...(canAfford
                            ? { background: `linear-gradient(135deg, ${meta.color}, ${rc.color})`, color: '#fff', border: 'none' }
                            : (isLight
                                ? { background: '#fef3c7', color: '#92400e', border: '1.5px solid #f59e0b' }
                                : { background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)' }
                              )
                          )
                        }}
                        onClick={() => onBuyCharacter(char)}
                        title={canAfford ? (isAr ? `فتح ${getCharacterDisplayName(char, isAr)}` : `Unlock ${char.name}`) : (isAr ? `تحتاج ${char.cost - coins} عملة إضافية` : `Need ${char.cost - coins} more coins`)}
                      >
                        {canAfford ? (
                          <><FaLockOpen /><FaCoins style={{ fontSize: '0.68rem' }} />{isAr ? `فتح (${char.cost})` : `Unlock (${char.cost})`}</>
                        ) : (
                          <><FaLock style={{ color: isLight ? '#b45309' : '#fbbf24', fontSize: '0.72rem' }} /><FaCoins style={{ color: '#f59e0b', fontSize: '0.72rem' }} />{isAr ? `تحتاج ${char.cost - coins}` : `Need ${char.cost - coins} more`}</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', marginTop: '16px', paddingBottom: '4px',
            }}>
              {/* Prev */}
              <button
                onClick={() => setCharPage(p => Math.max(1, p - 1))}
                disabled={charPage === 1}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 700, cursor: charPage === 1 ? 'not-allowed' : 'pointer',
                  background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.07)',
                  border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.12)',
                  color: isLight ? (charPage === 1 ? '#cbd5e1' : '#475569') : (charPage === 1 ? 'rgba(255,255,255,0.25)' : '#fff'),
                  transition: 'all 0.2s',
                }}
              >
                {t('shop.prev')}
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button
                  key={pg}
                  onClick={() => setCharPage(pg)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: pg === charPage ? 900 : 700,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: pg === charPage
                      ? (isLight ? '#2563eb' : 'rgba(99,102,241,0.85)')
                      : (isLight ? '#f1f5f9' : 'rgba(255,255,255,0.07)'),
                    border: pg === charPage
                      ? 'none'
                      : (isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.12)'),
                    color: pg === charPage ? '#fff' : (isLight ? '#475569' : 'rgba(255,255,255,0.7)'),
                    boxShadow: pg === charPage ? (isLight ? '0 2px 8px rgba(37,99,235,0.3)' : '0 2px 8px rgba(99,102,241,0.4)') : 'none',
                  }}
                >
                  {pg}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => setCharPage(p => Math.min(totalPages, p + 1))}
                disabled={charPage === totalPages}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 700, cursor: charPage === totalPages ? 'not-allowed' : 'pointer',
                  background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.07)',
                  border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.12)',
                  color: isLight ? (charPage === totalPages ? '#cbd5e1' : '#475569') : (charPage === totalPages ? 'rgba(255,255,255,0.25)' : '#fff'),
                  transition: 'all 0.2s',
                }}
              >
                {t('shop.next')}
              </button>

              {/* Counter */}
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isLight ? '#475569' : 'rgba(255,255,255,0.6)', marginLeft: '6px' }}>
                {t('shop.pageOf', { start: (charPage - 1) * CARDS_PER_PAGE + 1, end: Math.min(charPage * CARDS_PER_PAGE, filteredCharacters.length), total: filteredCharacters.length })}
              </span>
            </div>
          )}
        </>
      )}

      {filteredCharacters.length === 0 && (
        <div className="empty-search-state" style={{ padding: '24px 12px' }}>
          <div className="empty-icon-circle"><FaSearch /></div>
          <h3>{t('shop.noCharactersFound')}</h3>
          <p>{t('shop.noCharsDesc')}</p>
          <button
            className="browse-shop-switch-btn"
            onClick={handleResetFilters}
          >
            {t('shop.resetFilters')}
          </button>
        </div>
      )}
    </div>
  );
}
