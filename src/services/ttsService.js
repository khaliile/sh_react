/**
 * TTS Service for Mascot Voice Engines
 * Supports:
 * 1. Local Piper TTS (Fast neural text-to-speech - HTTP :8100)
 * 2. Native Browser SpeechSynthesis (Offline fallback)
 */

export const PIPER_URL = 'http://127.0.0.1:8100';

// ---------------------------------------------------------------------------
// Piper Voices (Curated standard English voices)
// ---------------------------------------------------------------------------
export const PIPER_VOICES = [
  { id: 'en_US-ryan-medium', name: 'Ryan — Male, Fast & Natural', lang: 'en-US' },
  { id: 'en_US-lessac-medium', name: 'Lessac — Female, Clear', lang: 'en-US' },
  { id: 'en_US-amy-medium', name: 'Amy — Female, Natural', lang: 'en-US' },
  { id: 'en_US-joe-medium', name: 'Joe — Male, Warm', lang: 'en-US' },
  { id: 'en_GB-alba-medium', name: 'Alba — Female, Scottish', lang: 'en-GB' },
  { id: 'ar_JO-kareem-medium', name: 'Kareem — Male, Arabic', lang: 'ar-JO' },
  { id: 'en_US-ryan-high', name: 'Ryan — Male, High Quality', lang: 'en-US' },
];

// Client-side in-memory audio Blob cache to prevent redundant HTTP requests
const _clientAudioCache = new Map();
const MAX_CLIENT_CACHE = 100;

function getCachedBlob(key) {
  return _clientAudioCache.get(key) || null;
}

function setCachedBlob(key, blob) {
  if (_clientAudioCache.size >= MAX_CLIENT_CACHE) {
    const firstKey = _clientAudioCache.keys().next().value;
    _clientAudioCache.delete(firstKey);
  }
  _clientAudioCache.set(key, blob);
}

const ARABIC_CHAR_RE = /[\u0600-\u06FF]/;

/**
 * Text cleaner to remove markdown formatting and emojis before sending to TTS engines
 */
export function cleanTextForSpeech(text) {
  if (!text) return '';
  let cleaned = String(text)
    // Remove think tags and any inner text
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '')
    // Remove markdown notes and roleplay asterisks like *smiles*, *sighs*
    .replace(/\*\*Note:[^)]*\*\*/gi, '')
    .replace(/\*[^*]+\*/g, '')
    // Remove parenthetical stage directions like (calmly), (in Chrollo's voice)
    .replace(/\([^)]+\)/g, '')
    // Replace Windows console mojibake / corrupted UTF-8 byte sequences
    .replace(/ΓÇª|Γ£ô|ΓåÆ|ΓÇô|ΓÇö/g, ' ')
    // Replace unicode ellipsis and dashes with standard punctuation
    .replace(/[…\u2026]/g, '. ')
    .replace(/[—–]/g, ', ')
    // Remove markdown symbols and brackets
    .replace(/[*_#`~[\]]/g, '')
    // Remove all unicode emoji blocks (smileys, symbols, pictographs)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/gu, '')
    // Ensure spaces after punctuation when immediately glued to letters (e.g. "analysis.I" -> "analysis. I")
    .replace(/([.!?؛?,])([A-Za-z\u0600-\u06FF])/g, '$1 $2')
    // Strip hallucinated repeated punctuation (e.g. ". . . . ." -> ". ", "؟؟؟" -> "؟ ")
    .replace(/(?:\s*\.\s*){2,}/g, '. ')
    .replace(/(?:\s*[؟?]\s*){2,}/g, '؟ ');

  // Normalize Arabic digital time (e.g. 8:40 -> 8 و 40 دقيقة) so Polly pronounces it naturally
  if (ARABIC_CHAR_RE.test(cleaned)) {
    cleaned = cleaned.replace(/(\b[0-2]?[0-9]):([0-5][0-9])\b/g, '$1 و $2 دقيقة');
  }

  // Deduplicate consecutive repeated sentences/phrases (e.g. "Proceed. Proceed. Ready when you are.")
  const sentences = cleaned.split(/(?<=[.!?؛؟])\s+/);
  const uniqueSentences = [];
  const seen = new Set();
  for (const s of sentences) {
    const norm = s.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      uniqueSentences.push(s.trim());
    }
  }
  if (uniqueSentences.length > 0) {
    cleaned = uniqueSentences.join(' ');
  }

  return cleaned
    .replace(/(?:\s*\.\s*){2,}/g, '. ')
    .replace(/(?:\s*[؟?]\s*){2,}/g, '؟ ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 1. PIPER TTS SYNTHESIS
 * Sends text to the local FastAPI Piper server and returns the audio Blob
 */
export async function synthesizePiperAudio(text, voiceId = 'en_US-ryan-medium', signal = null) {
  const clean = cleanTextForSpeech(text);
  if (!clean) throw new Error('No valid text to synthesize.');

  // Never cache Arabic voice blobs — always synthesize fresh to avoid
  // the same sentence repeating for different requests.
  const isArabic = voiceId.startsWith('ar');

  const cacheKey = `piper::${voiceId}::${clean.toLowerCase()}`;
  if (!isArabic) {
    const cachedBlob = getCachedBlob(cacheKey);
    if (cachedBlob) {
      return cachedBlob;
    }
  }

  const res = await fetch(`${PIPER_URL}/tts?voice=${encodeURIComponent(voiceId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: clean, voice: voiceId }),
    signal: signal || AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const errorDetail = await res.text().catch(() => '');
    throw new Error(`Piper TTS failed with status ${res.status}: ${errorDetail || 'Server error'}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('audio')) {
    throw new Error(`Piper server did not return audio data (Content-Type: ${contentType})`);
  }

  const blob = await res.blob();
  if (!isArabic) setCachedBlob(cacheKey, blob); // Only cache non-Arabic voices
  return blob;
}

/**
 * Helper to fetch available speech synthesis voices asynchronously.
 * Browsers and Electron often populate voices asynchronously via 'voiceschanged'.
 */
export function getBrowserVoices() {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      return resolve([]);
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      return resolve(voices);
    }
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices() || []);
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    // Timeout fallback if voiceschanged does not fire
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices() || []);
    }, 400);
  });
}

/**
 * 2. BROWSER NATIVE TTS (SpeechSynthesis)
 * Prioritizes British (UK) English voices with fallback to general English.
 */
export async function synthesizeBrowserNative(text, { lang = 'en-GB', rate = 0.88, pitch = 1.0, onStart, onEnd, onError } = {}) {
  if (!('speechSynthesis' in window)) {
    throw new Error('Browser SpeechSynthesis is not supported on this platform.');
  }

  try {
    window.speechSynthesis.cancel();
  } catch {}

  const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1.0; // Maximum volume for better clarity

  // 1. Fetch available voices asynchronously
  const voices = await getBrowserVoices();

  // 2. Comprehensive check for British (UK) English voices
  const isBritishVoice = (v) => {
    const vLang = (v.lang || '').replace('_', '-').toLowerCase();
    const vName = (v.name || '').toLowerCase();
    return (
      vLang === 'en-gb' ||
      vLang.startsWith('en-gb') ||
      vName.includes('en-gb') ||
      vName.includes('uk english') ||
      vName.includes('english (united kingdom)') ||
      vName.includes('united kingdom') ||
      vName.includes('great britain') ||
      vName.includes('british') ||
      vName.includes('(uk)') ||
      vName.includes('george') ||
      vName.includes('hazel') ||
      vName.includes('susan') ||
      vName.includes('daniel') ||
      vName.includes('oliver') ||
      vName.includes('serena') ||
      vName.includes('libby')
    );
  };

  const ukVoice = voices.find(isBritishVoice);

  // 3. Fallback: Any English voice if no UK voice is available
  const fallbackEnglishVoice = voices.find((v) =>
    (v.lang || '').toLowerCase().startsWith('en')
  );

  const selectedVoice = ukVoice || fallbackEnglishVoice || voices[0] || null;

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang || lang || 'en-GB';
  } else {
    utterance.lang = lang || 'en-GB';
  }

  console.log(`[TTS] Speaking with: ${selectedVoice?.name || 'Default'} (${utterance.lang})`);

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = (errEvent) => {
    const errReason = errEvent?.error || errEvent?.message || 'SpeechSynthesis error';
    console.warn('[TTS] Speech synthesis error:', errReason);
    if (onError) onError(new Error(errReason));
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (speakErr) {
    console.warn('[TTS] SpeechSynthesis.speak execution error:', speakErr.message);
    if (onError) onError(speakErr);
  }

  return utterance;
}

/**
 * Health check helper for Piper server
 */
export async function checkPiperHealth() {
  try {
    const res = await fetch(`${PIPER_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}
