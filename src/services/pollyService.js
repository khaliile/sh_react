/**
 * Amazon Polly TTS Service for Arabic & English
 * 
 * Supports two synthesis paths:
 * 1. Python FastAPI backend (:8000/api/polly-tts) — server proxy (prevents CORS & keeps keys server-side)
 * 2. Browser direct via @aws-sdk/client-polly — client fallback if Python server is offline
 * 
 * Free tier limits:
 * - Neural voices: 1 million characters/month (Hala, Zayd, Joanna, Matthew)
 * - Standard voices: 5 million characters/month (Zeina)
 * 
 * Recommended voices:
 * - Hala (Neural) - Gulf Arabic female (warm, highly natural)
 * - Zayd (Neural) - Gulf Arabic male (clear, natural)
 * - Zeina (Standard) - Modern Standard Arabic female
 * - Joanna (Neural) - US English female
 * - Matthew (Neural) - US English male
 */

import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { cleanTextForSpeech } from './ttsService';

export const POLLY_VOICES = {
  ar: {
    female: 'Hala',
    male: 'Zayd',
    standard: 'Zeina'
  },
  en: {
    female: 'Joanna',
    male: 'Matthew',
    femaleBritish: 'Emma',
    femaleBritish2: 'Amy',
    femaleWarm: 'Kendra',
    femaleEnergetic: 'Kimberly',
    femaleClear: 'Salli',
    maleCasual: 'Joey',
    maleYouth: 'Kevin',
    maleDeep: 'Stephen',
    maleBritish: 'Brian',
    maleExecutive: 'Arthur',
  }
};

const VALID_POLLY_VOICES = [
  'Matthew', 'Joey', 'Kevin', 'Stephen', 'Brian', 'Arthur',
  'Joanna', 'Kendra', 'Kimberly', 'Salli', 'Amy', 'Emma', 'Ruth',
  'Hala', 'Zayd', 'Zeina'
];

/**
 * Maps any input (character ID, Piper voice model, generic gender) to a valid, distinct Amazon Polly Voice ID
 */
export function resolvePollyVoice({ voiceId = null, gender = 'female', lang = 'en-US', charId = null } = {}) {
  const isArabic = Boolean(lang?.startsWith('ar') || lang === 'arb');

  if (isArabic) {
    const isMaleChar = gender === 'male' || [
      'zoro', 'luffy', 'sanji', 'law', 'chrollo', 'gojo', 'levi', 'itadori',
      'itachi', 'sukuna', 'nanami', 'shanks', 'kaido', 'erwin', 'killua', 'hisoka', 'kurapika', 'eren'
    ].includes(charId);
    return isMaleChar ? 'Zayd' : 'Hala';
  }

  // 1. If voiceId is ALREADY a valid Polly Voice name, return it directly
  if (voiceId && VALID_POLLY_VOICES.includes(voiceId)) {
    return voiceId;
  }

  // 2. Piper Voice ID → Polly mapping (user-selected voice takes priority over character defaults)
  if (voiceId) {
    const lower = String(voiceId).toLowerCase();
    if (lower.includes('alba'))   return 'Emma';
    if (lower.includes('amy'))    return 'Amy';
    if (lower.includes('lessac')) return 'Kendra';
    if (lower.includes('joe'))    return 'Joey';
    if (lower.includes('ryan'))   return 'Matthew';
    if (lower.includes('kareem')) return 'Zayd';
  }

  // 3. Character ID → distinct Polly voice (persona mapping when no explicit voice is set)
  if (charId) {
    const charVoiceMap = {
      // Female Characters
      robin: 'Emma',       // British elegant female
      nami: 'Kimberly',    // Energetic US female
      boa: 'Kendra',       // Sophisticated US female
      mikasa: 'Amy',       // Calm British female
      hinata: 'Salli',     // Gentle US female
      nezuko: 'Salli',     // Gentle US female
      tsunade: 'Ruth',     // Authoritative US female
      sakura: 'Kimberly',  // Energetic US female
      yor: 'Amy',          // Calm British female
      anya: 'Salli',       // Young US female

      // Male Characters
      chrollo: 'Arthur',   // Authoritative British Mastermind
      zoro: 'Stephen',     // Stern deep US male
      luffy: 'Joey',       // Energetic young US male
      sanji: 'Brian',      // Smooth British male
      law: 'Stephen',      // Cold strategic US male
      gojo: 'Matthew',     // Confident playful US male
      sukuna: 'Kevin',     // Powerful dominant US male
      nanami: 'Brian',     // Professional British male
      itadori: 'Joey',     // Warm energetic US male
      killua: 'Kevin',     // Sharp fast US male
      hisoka: 'Arthur',    // Playful theatrical British male
      kurapika: 'Brian',   // Meticulous British male
      levi: 'Stephen',     // Stern efficient US male
      erwin: 'Arthur',     // Commanding British leader
      eren: 'Joey',        // Relentless intense US male
      itachi: 'Stephen',   // Deep philosophical US male
      shanks: 'Matthew',   // Charismatic confident US male
      kaido: 'Kevin',      // Massive powerful US male
    };
    if (charVoiceMap[charId]) {
      return charVoiceMap[charId];
    }
  }

  // 4. Gender Fallback
  return gender === 'male' ? 'Matthew' : 'Joanna';
}

// Track quota usage (1 million chars/month for neural)
let quotaUsed = 0;
const QUOTA_LIMIT = 1000000; // 1 million chars
const QUOTA_WARNING = 900000; // Warn at 90%

// Cache for direct Polly client instance
let pollyClient = null;

function getDirectPollyClient() {
  if (pollyClient) return pollyClient;

  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials missing (VITE_AWS_ACCESS_KEY_ID / VITE_AWS_SECRET_ACCESS_KEY)');
  }

  pollyClient = new PollyClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  return pollyClient;
}

/**
 * Universal Polly TTS for Arabic & English
 * @param {string} text - Text to synthesize
 * @param {object} options - { lang: 'en-US'|'ar-AE', gender: 'male'|'female', voiceId?: string, charId?: string }
 * @returns {Promise<ArrayBuffer>} Audio data as MP3
 */
export async function synthesizePollySpeech(text, { lang = 'ar-AE', gender = 'female', voiceId = null, charId = null } = {}) {
  const cleanText = cleanTextForSpeech(text);
  if (!cleanText || cleanText.length === 0) {
    throw new Error('Text is required for Polly synthesis');
  }

  const charCount = cleanText.length;
  // Only auto-detect Arabic from text content when lang is not explicitly set to a non-Arabic language.
  // This prevents English text that happens to contain Arabic punctuation from triggering Arabic voice.
  const explicitlyEnglish = Boolean(lang && lang.startsWith('en'));
  const isArabic = Boolean(lang?.startsWith('ar') || lang === 'arb' || (!explicitlyEnglish && /[\u0600-\u06FF]/.test(cleanText)));
  const resolvedLang = isArabic ? 'ar-AE' : (lang || 'en-US');
  const resolvedGender = (gender || 'female').toLowerCase();

  // Resolve exact valid Amazon Polly voice ID
  const targetVoiceId = resolvePollyVoice({ voiceId, gender: resolvedGender, lang: resolvedLang, charId });
  const targetEngine = targetVoiceId === 'Zeina' ? 'standard' : 'neural';

  console.log(`[Polly] Synthesizing: text="${cleanText.slice(0, 35)}...", voice=${targetVoiceId} (${targetEngine}), lang=${resolvedLang}, chars=${charCount}`);

  // Check quota
  if (quotaUsed >= QUOTA_LIMIT) {
    console.error('[Polly] QUOTA_EXCEEDED:', quotaUsed, '/', QUOTA_LIMIT);
    throw new Error('QUOTA_EXCEEDED');
  }

  // --- 1. Try Python FastAPI Backend proxy (:8000/api/polly-tts) ---
  try {
    const response = await fetch('http://127.0.0.1:8000/api/polly-tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: cleanText,
        voice_id: targetVoiceId,
        language_code: resolvedLang,
        gender: resolvedGender,
        engine: targetEngine
      }),
      signal: AbortSignal.timeout(25000), // 25s timeout for cloud TTS proxy
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      if (audioBuffer && audioBuffer.byteLength > 0) {
        quotaUsed += charCount;
        console.log(`[Polly] ✓ Backend success: ${audioBuffer.byteLength} bytes (${targetVoiceId})`);
        return audioBuffer;
      }
    } else {
      const errText = await response.text().catch(() => '');
      console.warn(`[Polly] Backend error ${response.status}: ${errText}, falling back to direct AWS SDK...`);
    }
  } catch (backendErr) {
    console.warn('[Polly] Backend proxy unreachable, falling back to direct AWS SDK:', backendErr.message);
  }

  // --- 2. Client-Side Direct AWS SDK Fallback ---
  try {
    const client = getDirectPollyClient();
    const command = new SynthesizeSpeechCommand({
      Text: cleanText,
      OutputFormat: 'mp3',
      VoiceId: targetVoiceId,
      Engine: targetEngine,
    });

    const response = await client.send(command);
    if (!response.AudioStream) {
      throw new Error('No AudioStream received from Amazon Polly');
    }

    let audioBuffer;
    if (typeof response.AudioStream.transformToByteArray === 'function') {
      const bytes = await response.AudioStream.transformToByteArray();
      audioBuffer = bytes.buffer;
    } else if (response.AudioStream instanceof ReadableStream || response.AudioStream.getReader) {
      const reader = response.AudioStream.getReader();
      const chunks = [];
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) chunks.push(value);
      }
      const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      audioBuffer = combined.buffer;
    } else if (response.AudioStream instanceof ArrayBuffer) {
      audioBuffer = response.AudioStream;
    } else if (response.AudioStream instanceof Uint8Array) {
      audioBuffer = response.AudioStream.buffer;
    } else {
      const blob = await new Response(response.AudioStream).blob();
      audioBuffer = await blob.arrayBuffer();
    }

    quotaUsed += charCount;
    console.log(`[Polly] ✓ Direct AWS SDK success: ${audioBuffer.byteLength} bytes (${targetVoiceId})`);
    
    if (quotaUsed >= QUOTA_WARNING) {
      console.warn(`[Polly] ⚠️ Warning: ${Math.round((quotaUsed / QUOTA_LIMIT) * 100)}% quota used`);
    }

    return audioBuffer;

  } catch (directErr) {
    console.error('[Polly] Direct AWS SDK synthesis failed:', directErr);
    throw directErr;
  }
}

/**
 * Synthesize Arabic text using Amazon Polly (backwards compatible)
 * @param {string} text - Arabic text to synthesize
 * @param {string} gender - 'male' | 'female'
 * @returns {Promise<ArrayBuffer>} Audio data as MP3
 */
export async function synthesizePollyArabic(text, gender = 'female') {
  return synthesizePollySpeech(text, { lang: 'ar-AE', gender });
}

/**
 * Get current quota usage
 */
export function getPollyQuota() {
  return {
    used: quotaUsed,
    limit: QUOTA_LIMIT,
    remaining: QUOTA_LIMIT - quotaUsed,
    percentUsed: (quotaUsed / QUOTA_LIMIT) * 100,
  };
}

/**
 * Reset quota (call this at the start of each month)
 */
export function resetPollyQuota() {
  quotaUsed = 0;
  console.log('[Polly] Quota reset to 0');
}

/**
 * Check if quota is exceeded
 */
export function isPollyQuotaExceeded() {
  return quotaUsed >= QUOTA_LIMIT;
}
