/**
 * speechSync.js
 * High-precision voice-to-text synchronization engine.
 * Maps audio playback and SpeechSynthesis boundary events to real-time word and line positions.
 */

const ARABIC_RE = /[\u0600-\u06FF]/;
const PUNCT_PAUSE_MEDIUM = /[,;،؛\-—:]$/;
const PUNCT_PAUSE_LONG = /[.!?؟]$/;

/**
 * Tokenize raw text into lines and words with precise character indices and timing weights.
 * @param {string} rawText
 * @returns {{ lines: Array, tokens: Array, totalWeight: number, rawText: string }}
 */
export function tokenizeTextForSpeech(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { lines: [], tokens: [], totalWeight: 0, rawText: '' };
  }

  // 1. Split raw text by explicit newlines
  const rawParagraphs = rawText.split(/\r?\n/).filter(p => p.trim().length > 0);
  const rawLines = [];

  rawParagraphs.forEach((para) => {
    // Split paragraph into natural sentences/clauses for line-by-line reading
    const sentenceParts = para.match(/[^.!?؟\n]+(?:[.!?؟]+["']?\s*|$)/gu);
    if (sentenceParts && sentenceParts.length > 0) {
      sentenceParts.forEach((part) => {
        const trimmed = part.trim();
        if (trimmed) rawLines.push(trimmed);
      });
    } else {
      const trimmed = para.trim();
      if (trimmed) rawLines.push(trimmed);
    }
  });

  if (rawLines.length === 0) {
    rawLines.push(rawText.trim());
  }

  const tokens = [];
  const lines = [];

  let globalCharOffset = 0;
  let tokenIndex = 0;
  let totalWeight = 0;

  rawLines.forEach((lineStr, lineIdx) => {
    // Split words while preserving whitespace
    const wordMatches = Array.from(lineStr.matchAll(/(\S+)(\s*)/g));
    const lineTokens = [];

    wordMatches.forEach((match) => {
      const fullMatch = match[0];
      const word = match[1];
      const trailingSpace = match[2];
      const startChar = globalCharOffset + match.index;
      const endChar = startChar + word.length;

      // Calculate phonetic weight
      const cleanWord = word.replace(/[^\p{L}\p{N}]/gu, '');
      const charCount = Math.max(1, cleanWord.length);
      
      let weight = charCount * 1.0;
      if (PUNCT_PAUSE_LONG.test(word)) {
        weight += 5.5; // Significant sentence-end pause (~450ms)
      } else if (PUNCT_PAUSE_MEDIUM.test(word)) {
        weight += 3.2; // Clause pause (~250ms)
      }

      const token = {
        index: tokenIndex,
        lineIndex: lineIdx,
        raw: word,
        trailingSpace: trailingSpace,
        fullText: fullMatch,
        cleanWord,
        startChar,
        endChar,
        weight,
      };

      tokens.push(token);
      lineTokens.push(token);
      totalWeight += weight;
      tokenIndex++;
    });

    // Add extra weight for sentence/line transition
    totalWeight += 3.5;

    lines.push({
      lineIndex: lineIdx,
      raw: lineStr,
      tokens: lineTokens,
    });

    globalCharOffset += lineStr.length + 1;
  });

  return { lines, tokens, totalWeight: Math.max(0.1, totalWeight), rawText };
}

/**
 * Build a time-mapped token array based on known or estimated audio duration.
 * @param {Array} tokens
 * @param {number} totalWeight
 * @param {number} durationSeconds
 * @returns {Array} Array of tokens with calculated { startTime, endTime }
 */
export function buildTokenTimeMap(tokens, totalWeight, durationSeconds) {
  if (!tokens || tokens.length === 0 || !durationSeconds || durationSeconds <= 0) {
    return [];
  }

  let accumulatedWeight = 0;
  return tokens.map((token) => {
    const startTime = (accumulatedWeight / totalWeight) * durationSeconds;
    accumulatedWeight += token.weight;
    const endTime = (accumulatedWeight / totalWeight) * durationSeconds;

    return {
      ...token,
      startTime,
      endTime,
    };
  });
}

/**
 * Find the active token at a given playback timestamp.
 * @param {Array} timeMap
 * @param {number} currentTimeSeconds
 * @param {number} [lookaheadMs=60] Offset to match visual reading speed with auditory perception
 * @returns {{ activeWordIndex: number, activeLineIndex: number, activeToken: object|null }}
 */
export function findActiveTokenAtTime(timeMap, currentTimeSeconds, lookaheadMs = 60) {
  if (!timeMap || timeMap.length === 0) {
    return { activeWordIndex: -1, activeLineIndex: -1, activeToken: null };
  }

  const adjustedTime = Math.max(0, currentTimeSeconds + lookaheadMs / 1000);

  // Fast search
  for (let i = 0; i < timeMap.length; i++) {
    const t = timeMap[i];
    if (adjustedTime >= t.startTime && adjustedTime < t.endTime) {
      return {
        activeWordIndex: t.index,
        activeLineIndex: t.lineIndex,
        activeToken: t,
      };
    }
  }

  // If beyond the last token
  if (adjustedTime >= timeMap[timeMap.length - 1].endTime) {
    const last = timeMap[timeMap.length - 1];
    return {
      activeWordIndex: last.index,
      activeLineIndex: last.lineIndex,
      activeToken: last,
    };
  }

  return {
    activeWordIndex: 0,
    activeLineIndex: timeMap[0]?.lineIndex ?? 0,
    activeToken: timeMap[0] || null,
  };
}

/**
 * Attach real-time 60fps synchronization to an HTMLAudioElement.
 * @param {HTMLAudioElement} audio
 * @param {string} rawText
 * @param {Function} onProgress ({ activeWordIndex, activeLineIndex, activeCharIndex, progress, isSpeaking }) => void
 * @param {Function} [onEnded] () => void
 * @returns {Function} cleanup function to stop synchronization
 */
export function attachAudioSync(audio, rawText, onProgress, onEnded) {
  if (!audio || !rawText) {
    return () => {};
  }

  const tokenData = tokenizeTextForSpeech(rawText);
  let timeMap = [];
  let animFrameId = null;
  let isCleanedUp = false;

  const updateTimeMap = () => {
    const dur = audio.duration;
    if (dur && Number.isFinite(dur) && dur > 0) {
      timeMap = buildTokenTimeMap(tokenData.tokens, tokenData.totalWeight, dur);
    } else {
      // Estimate 15 chars/sec speech rate as initial fallback
      const estimatedDur = Math.max(1, rawText.length / 15);
      timeMap = buildTokenTimeMap(tokenData.tokens, tokenData.totalWeight, estimatedDur);
    }
  };

  updateTimeMap();

  const tick = () => {
    if (isCleanedUp) return;

    if (!audio.paused && !audio.ended) {
      const dur = audio.duration || (timeMap[timeMap.length - 1]?.endTime || 1);
      const cur = audio.currentTime;
      const progress = dur > 0 ? Math.min(1, Math.max(0, cur / dur)) : 0;

      const { activeWordIndex, activeLineIndex, activeToken } = findActiveTokenAtTime(timeMap, cur);

      onProgress?.({
        activeWordIndex,
        activeLineIndex,
        activeCharIndex: activeToken?.startChar ?? -1,
        progress,
        isSpeaking: true,
        currentTime: cur,
        duration: dur,
      });

      animFrameId = requestAnimationFrame(tick);
    }
  };

  const handlePlay = () => {
    updateTimeMap();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(tick);
  };

  const handleTimeUpdate = () => {
    if (timeMap.length === 0) updateTimeMap();
    const dur = audio.duration || (timeMap[timeMap.length - 1]?.endTime || 1);
    const cur = audio.currentTime;
    const progress = dur > 0 ? Math.min(1, Math.max(0, cur / dur)) : 0;
    const { activeWordIndex, activeLineIndex, activeToken } = findActiveTokenAtTime(timeMap, cur);

    onProgress?.({
      activeWordIndex,
      activeLineIndex,
      activeCharIndex: activeToken?.startChar ?? -1,
      progress,
      isSpeaking: !audio.paused && !audio.ended,
      currentTime: cur,
      duration: dur,
    });
  };

  const handleEnded = () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    onProgress?.({
      activeWordIndex: -1,
      activeLineIndex: -1,
      activeCharIndex: -1,
      progress: 1,
      isSpeaking: false,
    });
    onEnded?.();
  };

  const handleDurationChange = () => {
    updateTimeMap();
  };

  audio.addEventListener('play', handlePlay);
  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('durationchange', handleDurationChange);
  audio.addEventListener('loadedmetadata', handleDurationChange);
  audio.addEventListener('ended', handleEnded);
  audio.addEventListener('pause', () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
  });

  // If already playing when attached
  if (!audio.paused && !audio.ended) {
    handlePlay();
  }

  return () => {
    isCleanedUp = true;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    audio.removeEventListener('play', handlePlay);
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('durationchange', handleDurationChange);
    audio.removeEventListener('loadedmetadata', handleDurationChange);
    audio.removeEventListener('ended', handleEnded);
  };
}

/**
 * Attach boundary & interpolated synchronization to a Web SpeechSynthesisUtterance.
 * @param {SpeechSynthesisUtterance} utterance
 * @param {string} rawText
 * @param {Function} onProgress
 * @param {Function} [onEnded]
 * @returns {Function} cleanup function
 */
export function attachSpeechSynthesisSync(utterance, rawText, onProgress, onEnded) {
  if (!utterance || !rawText) return () => {};

  const tokenData = tokenizeTextForSpeech(rawText);
  let isCleanedUp = false;
  let startTime = null;
  let animFrameId = null;
  const estimatedDuration = Math.max(1.2, rawText.length / 14);
  const timeMap = buildTokenTimeMap(tokenData.tokens, tokenData.totalWeight, estimatedDuration);

  const tick = () => {
    if (isCleanedUp) return;
    if (startTime) {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(1, elapsed / estimatedDuration);
      const { activeWordIndex, activeLineIndex, activeToken } = findActiveTokenAtTime(timeMap, elapsed);

      onProgress?.({
        activeWordIndex,
        activeLineIndex,
        activeCharIndex: activeToken?.startChar ?? -1,
        progress,
        isSpeaking: true,
        currentTime: elapsed,
        duration: estimatedDuration,
      });

      if (progress < 1) {
        animFrameId = requestAnimationFrame(tick);
      }
    }
  };

  utterance.onstart = () => {
    startTime = performance.now();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(tick);
  };

  utterance.onboundary = (e) => {
    if (e.name === 'word' || e.name === 'sentence') {
      const charIdx = e.charIndex || 0;
      // Find token containing charIdx
      const foundToken = tokenData.tokens.find(
        (t) => charIdx >= t.startChar && charIdx <= t.endChar
      ) || tokenData.tokens[0];

      if (foundToken) {
        onProgress?.({
          activeWordIndex: foundToken.index,
          activeLineIndex: foundToken.lineIndex,
          activeCharIndex: foundToken.startChar,
          progress: foundToken.index / Math.max(1, tokenData.tokens.length),
          isSpeaking: true,
        });
      }
    }
  };

  const finish = () => {
    isCleanedUp = true;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    onProgress?.({
      activeWordIndex: -1,
      activeLineIndex: -1,
      activeCharIndex: -1,
      progress: 1,
      isSpeaking: false,
    });
    onEnded?.();
  };

  utterance.onend = finish;
  utterance.onerror = finish;

  return () => {
    isCleanedUp = true;
    if (animFrameId) cancelAnimationFrame(animFrameId);
  };
}
