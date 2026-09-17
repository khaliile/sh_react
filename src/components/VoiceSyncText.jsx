import React, { useMemo, useEffect, useRef } from 'react';
import { tokenizeTextForSpeech } from '../utils/speechSync';
import './VoiceSyncText.css';

const ARABIC_RE = /[\u0600-\u06FF]/;

/**
 * VoiceSyncText Component
 * Renders text with real-time word and line synchronization when voice audio is speaking.
 * Smoothly auto-scrolls parent containers to follow long paragraphs line-by-line as they are read.
 */
export default function VoiceSyncText({
  text = '',
  isSpeaking = false,
  activeWordIndex = -1,
  activeLineIndex = -1,
  isArabic = null,
  accentColor = '#38bdf8',
  activeColor = '#38bdf8',
  autoScroll = true,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);
  const activeWordRef = useRef(null);

  const detectedIsAr = isArabic !== null ? isArabic : ARABIC_RE.test(text || '');

  // Parse text into lines and tokens with caching
  const tokenData = useMemo(() => {
    return tokenizeTextForSpeech(text || '');
  }, [text]);

  // Smooth auto-scroll when speaking to keep active line and word visible
  useEffect(() => {
    if (!autoScroll || !isSpeaking) return;

    const targetEl = activeWordRef.current || activeLineRef.current;
    if (!targetEl) return;

    // Locate the scrollable parent container (e.g. .avc-transcript, .mascot-dialogue)
    let scrollParent = containerRef.current?.parentElement;
    while (scrollParent) {
      const style = window.getComputedStyle(scrollParent);
      const isScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll') && scrollParent.scrollHeight > scrollParent.clientHeight;
      if (isScrollable) break;
      scrollParent = scrollParent.parentElement;
    }

    if (scrollParent) {
      const parentRect = scrollParent.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // Relative offset inside the parent container
      const relativeTop = targetRect.top - parentRect.top;
      const relativeBottom = targetRect.bottom - parentRect.top;

      // Scroll if the target is outside or near the top/bottom boundary
      if (relativeTop < 25 || relativeBottom > (parentRect.height - 25)) {
        const targetScrollTop = scrollParent.scrollTop + relativeTop - (parentRect.height / 2) + (targetRect.height / 2);
        scrollParent.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        });
      }
    }
    // No fallback: avoid calling scrollIntoView() which would scroll the whole window
    // (especially problematic when voice coach bubble is position:fixed with no scrollable parent)
  }, [activeLineIndex, activeWordIndex, isSpeaking, autoScroll]);

  if (!text || !tokenData.lines || tokenData.lines.length === 0) {
    return null;
  }

  const containerDir = detectedIsAr ? 'rtl' : 'ltr';
  const customStyles = {
    '--vst-accent': accentColor,
    '--vst-active-color': activeColor,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`vst-container ${isSpeaking ? 'vst-speaking' : 'vst-idle'} ${className}`}
      dir={containerDir}
      style={customStyles}
    >
      {tokenData.lines.map((line) => {
        const isCurrentLine = isSpeaking && activeLineIndex === line.lineIndex;
        const isSpokenLine = isSpeaking && activeLineIndex > line.lineIndex;

        return (
          <div
            key={line.lineIndex}
            ref={isCurrentLine ? activeLineRef : null}
            className={`vst-line ${isCurrentLine ? 'vst-line-active' : ''} ${
              isSpokenLine ? 'vst-line-spoken' : ''
            }`}
          >
            {line.tokens.map((token) => {
              const isCurrentWord = isSpeaking && activeWordIndex === token.index;
              const isSpokenWord = isSpeaking && activeWordIndex > token.index;
              const isUpcomingWord = isSpeaking && activeWordIndex < token.index;

              return (
                <span key={token.index} className="vst-word-wrap">
                  <span
                    ref={isCurrentWord ? activeWordRef : null}
                    className={`vst-word ${
                      isCurrentWord
                        ? 'vst-word-active'
                        : isSpokenWord
                        ? 'vst-word-spoken'
                        : isUpcomingWord
                        ? 'vst-word-upcoming'
                        : ''
                    }`}
                  >
                    {token.raw}
                  </span>
                  {token.trailingSpace}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

