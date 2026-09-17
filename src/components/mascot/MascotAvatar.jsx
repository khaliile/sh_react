import React from 'react';
import { getAvatarPath, ANILIST_FALLBACK_URLS } from '../../data/animeAvatars';

export default function MascotAvatar({
  charConfig,
  visualStatus,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
}) {
  const handleImgError = (e) => {
    const fallbackUrl = ANILIST_FALLBACK_URLS[charConfig.id];
    if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
      e.currentTarget.src = fallbackUrl;
    } else {
      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(charConfig.name)}&background=1a1e2e&color=fff&size=100`;
    }
  };

  return (
    <div
      className="mascot-avatar-wrapper"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <img
        src={charConfig.imageUrl || getAvatarPath(charConfig.id)}
        alt={charConfig.name}
        className={`mascot-real-img ${visualStatus === 'speaking' ? 'speaking-anim' : ''} ${visualStatus === 'loading' ? 'loading-anim' : ''}`}
        onError={handleImgError}
      />
    </div>
  );
}

export function MascotDockWidget({
  charConfig,
  visualStatus,
  handlePointerDown,
  handlePointerUp,
  isAr = false,
}) {
  const handleImgError = (e) => {
    const fallbackUrl = ANILIST_FALLBACK_URLS[charConfig.id];
    if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
      e.currentTarget.src = fallbackUrl;
    } else {
      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(charConfig.name)}&background=1a1e2e&color=fff&size=100`;
    }
  };

  const titleText = isAr
    ? `${charConfig.name} · انقر للمحادثة · نقر مزدوج للتعويم`
    : `${charConfig.name} · Click to chat · Double-click to unpin`;

  const pinHint = isAr ? 'نقر مزدوج للتعويم' : 'dbl-click to unpin';

  return (
    <div
      className="mascot-sidebar-dock-widget"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      title={titleText}
      role="button"
      tabIndex={0}
    >
      <div className="mascot-sidebar-dock-avatar-wrap">
        <img
          src={charConfig.imageUrl || getAvatarPath(charConfig.id)}
          alt={charConfig.name}
          className={`mascot-sidebar-dock-img ${visualStatus === 'speaking' ? 'speaking-anim' : ''} ${visualStatus === 'loading' ? 'loading-anim' : ''}`}
          onError={handleImgError}
        />
      </div>
      <div className="mascot-sidebar-dock-info">
        <span className="mascot-sidebar-dock-label">{charConfig.name}</span>
        <span className="mascot-sidebar-dock-pin-hint">{pinHint}</span>
      </div>
    </div>
  );
}
