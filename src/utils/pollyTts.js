/**
 * pollyTts.js — AWS Polly TTS helper for Feynman Tribunal
 * Calls Polly from the Electron renderer, returns a Blob URL for HTML5 Audio.
 */
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

let _pollyClient = null;
function getPollyClient() {
  if (_pollyClient) return _pollyClient;
  _pollyClient = new PollyClient({
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId:     import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
  });
  return _pollyClient;
}

export const POLLY_VOICES = {
  Zayd:  { VoiceId: 'Zayd',  Engine: 'neural',   LanguageCode: 'ar-AE' },
  Hala:  { VoiceId: 'Hala',  Engine: 'neural',   LanguageCode: 'ar-AE' },
  Zeina: { VoiceId: 'Zeina', Engine: 'standard', LanguageCode: 'arb' },
};

const _blobCache = new Map();

/**
 * Synthesize speech with AWS Polly.
 * @param {string} text       - Plain text or SSML markup
 * @param {string} voiceKey   - Key from POLLY_VOICES (e.g. 'Zeina')
 * @param {{ ssml?: boolean }} [opts] - Pass { ssml: true } to treat text as SSML
 */
export async function synthesizePolly(text, voiceKey, opts = {}) {
  const voice = POLLY_VOICES[voiceKey];
  if (!voice) throw new Error(`[Polly] Unknown voice key: ${voiceKey}`);

  const isSSML = opts.ssml === true;
  const cacheKey = `${voiceKey}::${isSSML ? 'ssml' : 'text'}::${text.trim()}`;
  if (_blobCache.has(cacheKey)) return _blobCache.get(cacheKey);

  const command = new SynthesizeSpeechCommand({
    Text: text,
    TextType: isSSML ? 'ssml' : 'text',
    VoiceId: voice.VoiceId,
    Engine: voice.Engine,
    LanguageCode: voice.LanguageCode,
    OutputFormat: 'mp3',
  });

  const response = await getPollyClient().send(command);
  const audioStream = response.AudioStream;
  let blob;

  if (audioStream instanceof ReadableStream) {
    const reader = audioStream.getReader();
    const chunks = [];
    let done = false;
    while (!done) {
      const { value, done: d } = await reader.read();
      if (value) chunks.push(value);
      done = d;
    }
    blob = new Blob(chunks, { type: 'audio/mpeg' });
  } else if (audioStream && typeof audioStream.transformToByteArray === 'function') {
    const bytes = await audioStream.transformToByteArray();
    blob = new Blob([bytes], { type: 'audio/mpeg' });
  } else {
    throw new Error('[Polly] Unrecognized AudioStream format');
  }

  const blobUrl = URL.createObjectURL(blob);
  _blobCache.set(cacheKey, blobUrl);
  return blobUrl;
}

export function revokePollyUrl(blobUrl) {
  if (!blobUrl || !blobUrl.startsWith('blob:')) return;
  URL.revokeObjectURL(blobUrl);
  for (const [key, val] of _blobCache.entries()) {
    if (val === blobUrl) { _blobCache.delete(key); break; }
  }
}

export function clearAllPollyUrls() {
  for (const [, url] of _blobCache.entries()) {
    if (url && url.startsWith('blob:')) {
      try { URL.revokeObjectURL(url); } catch {}
    }
  }
  _blobCache.clear();
}

