/**
 * ElevenLabs TTS Service - Premium Arabic Voice
 * Uses Moroccan Arabic voice for high-quality Arabic synthesis
 * Falls back to Piper when quota is exceeded
 */

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
const VOICE_ID = '5lXEHh42xcasVuJofypc'; // Moroccan Arabic voice
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

let quotaExceeded = false; // Track if quota is finished

/**
 * Check if ElevenLabs is available and configured
 */
export function isElevenLabsAvailable() {
  return ELEVENLABS_API_KEY && !quotaExceeded;
}

/**
 * Reset quota flag (can be used to retry after quota resets monthly)
 */
export function resetQuotaFlag() {
  quotaExceeded = false;
}

/**
 * Get current quota status
 */
export function getQuotaStatus() {
  return {
    exceeded: quotaExceeded,
    hasApiKey: !!ELEVENLABS_API_KEY,
  };
}

/**
 * Synthesize Arabic text using ElevenLabs
 * @param {string} text - Arabic text to synthesize
 * @returns {Promise<Blob>} Audio blob
 */
export async function synthesizeElevenLabsArabic(text) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  if (quotaExceeded) {
    throw new Error('ElevenLabs quota exceeded for this month');
  }

  // Limit text length to save quota (max 200 chars)
  const truncatedText = text.substring(0, 200);

  const headers = {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': ELEVENLABS_API_KEY,
  };

  const body = {
    text: truncatedText,
    model_id: 'eleven_multilingual_v2', // Best for Arabic
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    },
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      console.error('[ElevenLabs] Invalid API key');
      throw new Error('Invalid ElevenLabs API key');
    }

    if (response.status === 429 || response.status === 402) {
      // Quota exceeded
      quotaExceeded = true;
      console.warn('[ElevenLabs] ⚠️ Quota exceeded - switching to Piper fallback');
      throw new Error('QUOTA_EXCEEDED');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ElevenLabs] API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    console.log(`[ElevenLabs] ✅ Synthesized ${text.length} chars successfully`);
    return audioBlob;

  } catch (error) {
    if (error.message === 'QUOTA_EXCEEDED') {
      throw error;
    }
    console.error('[ElevenLabs] Synthesis failed:', error);
    throw error;
  }
}
