import { useState, useEffect, memo } from 'react';
import { ANILIST_FALLBACK_URLS } from '../data/animeAvatars';

export function getAvatarPath(id) {
  if (!id) return '';
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}avatars/${id}.jpg`;
}

function AnimeFaceAvatar({
  id = 'luffy',
  size = 90,
  showBorder = true,
  borderColor = null,
  glow = false,
  className = '',
  style = {},
  useRealImage = true,
  objectPosition = null,
  imageTransform = null
}) {
  const [useFallbackOnline, setUseFallbackOnline] = useState(false);
  const [useSvgFallback, setUseSvgFallback] = useState(false);

  useEffect(() => {
    setUseFallbackOnline(false);
    setUseSvgFallback(false);
  }, [id]);

  const localSrc = getAvatarPath(id);
  const onlineSrc = ANILIST_FALLBACK_URLS[id];

  const currentSrc = !useFallbackOnline ? localSrc : onlineSrc;

  const handleError = () => {
    if (!useFallbackOnline && onlineSrc) {
      setUseFallbackOnline(true);
    } else {
      setUseSvgFallback(true);
    }
  };

  const renderSvgFallback = () => (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r="48" fill="#1e1b4b" />
      <circle cx="50" cy="52" r="26" fill="#fed7aa" />
      <path d="M24 44 C28 20 72 20 76 44" fill="#10b981" />
      <circle cx="40" cy="52" r="3.5" fill="#0f172a" />
      <circle cx="60" cy="52" r="3.5" fill="#0f172a" />
      <path d="M44 66 Q50 72 56 66" stroke="#0f172a" strokeWidth="2" fill="none" />
    </svg>
  );

  // Intelligent positioning: local avatar image crops (like Luffy) are already tight face squares
  // so 'center center' or 'center 35%' displays eyes, expression and face completely.
  // Online AniList fallbacks are 3:4 character cards where faces are near the top.
  const resolvedObjectPosition = objectPosition || (
    id === 'luffy'
      ? 'center center'
      : (!useFallbackOnline ? 'center 35%' : 'center 18%')
  );

  const resolvedTransform = imageTransform || (
    id === 'luffy' ? 'scale(1.02)' : 'scale(1.04)'
  );

  return (
    <div
      className={`anime-face-avatar ${glow ? 'avatar-glowing' : ''} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: showBorder ? `2.5px solid ${borderColor || 'rgba(99,102,241,0.5)'}` : 'none',
        boxShadow: glow ? `0 0 12px ${borderColor || '#6366f1'}` : '0 2px 8px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        flexShrink: 0,
        backgroundColor: 'transparent',
        ...style
      }}
    >
      {useRealImage && !useSvgFallback && currentSrc ? (
        <img
          src={currentSrc}
          alt={id}
          loading="eager"
          referrerPolicy="no-referrer"
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: resolvedObjectPosition,
            opacity: 1,
            display: 'block',
            transform: resolvedTransform
          }}
        />
      ) : (
        renderSvgFallback()
      )}
    </div>
  );
}

export default memo(AnimeFaceAvatar);