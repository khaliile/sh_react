/**
 * voiceCoachBackendService.js
 * Client service to communicate with the FastAPI Python backend on http://localhost:8000/api/voice-chat
 */

const BACKEND_URL = import.meta.env.VITE_VOICE_BACKEND_URL || 'http://localhost:8000';

/**
 * Check if the Python FastAPI backend is online and healthy.
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === 'online';
  } catch {
    return false;
  }
}

/**
 * Sends recorded user audio blob and current app context to the Python FastAPI backend.
 * @param {Blob} audioBlob - Audio recording from MediaRecorder
 * @param {string|object} appContext - Data snapshot string or object
 * @param {object} [options] - Additional options (language, history, signal)
 * @returns {Promise<{ user_transcript: string, ai_response: string }>}
 */
export async function sendVoiceAudioToBackend(audioBlob, appContext, options = {}) {
  const { language = 'en', history = [], signal = null } = options;

  // 1. In Electron desktop: use native Node IPC to completely avoid Chromium data pipe upload errors
  if (window.electronAPI?.voiceChat) {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const res = await window.electronAPI.voiceChat(arrayBuffer, appContext, { language, history });
      if (res && (res.user_transcript || res.ai_response)) {
        return res;
      }
    } catch (e) {
      console.warn('[voiceCoachBackendService] Electron IPC voiceChat failed, falling back to fetch:', e);
    }
  }

  // 2. Direct fetch fallback
  const formData = new FormData();
  
  // Package audio blob with appropriate filename
  const filename = audioBlob.type?.includes('wav') ? 'recording.wav' : 'recording.webm';
  formData.append('audio', audioBlob, filename);

  // Package app context string
  const contextString = typeof appContext === 'string' 
    ? appContext 
    : JSON.stringify(appContext, null, 2);
  formData.append('app_context', contextString);

  // Optional language code ('en' or 'ar')
  if (language) {
    formData.append('language', language);
  }

  // Optional JSON conversation history
  if (history && history.length > 0) {
    formData.append('history', JSON.stringify(history));
  }

  const response = await fetch(`${BACKEND_URL}/api/voice-chat`, {
    method: 'POST',
    body: formData,
    signal: signal || AbortSignal.timeout(35000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Voice backend returned error ${response.status}: ${errorText || 'Internal Server Error'}`);
  }

  const data = await response.json();
  return {
    user_transcript: data.user_transcript || '',
    ai_response: data.ai_response || '',
  };
}
