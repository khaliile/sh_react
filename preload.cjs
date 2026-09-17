// Safe bridge so the renderer (mascot UI) can control the local Piper
// TTS voice server without exposing full Node access.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ttsServer', {
  start:  () => ipcRenderer.invoke('tts-server:start'),
  status: () => ipcRenderer.invoke('tts-server:status'),
});

contextBridge.exposeInMainWorld('aiServer', {
  start:  () => ipcRenderer.invoke('ai-server:start'),
  status: () => ipcRenderer.invoke('ai-server:status'),
});

// Expose Electron-native TTS synthesis and STT audio offloading via local server / Node.js
contextBridge.exposeInMainWorld('electronAPI', {
  generatePiperTTS: (text, voiceModel) =>
    ipcRenderer.invoke('generate-piper-tts', { text, voiceModel }),
  transcribeAudio: (audioBuffer, lang) =>
    ipcRenderer.invoke('transcribe-audio', { audioBuffer, lang }),
  voiceChat: (audioBuffer, appContext, options) =>
    ipcRenderer.invoke('voice-chat', { audioBuffer, appContext, ...options }),
});
