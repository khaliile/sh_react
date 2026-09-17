/**
 * Lightweight Zero-Dependency Web Audio API Soundscapes Synthesizer
 * Generates procedural Rain, 40Hz Binaural Beats, Campfire, Ocean Waves, Cyberpunk Pad & Brown Noise.
 */

let audioCtx = null;
let currentSource = null;
let currentGain = null;
let activeSoundType = null;
let currentVolume = 0.5;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** 40Hz Binaural Beats (Left: 216Hz, Right: 256Hz) for intense deep focus */
function createBinauralBeats(ctx, masterGain) {
  const merger = ctx.createChannelMerger(2);

  const oscLeft = ctx.createOscillator();
  const oscRight = ctx.createOscillator();

  oscLeft.type = 'sine';
  oscLeft.frequency.value = 216; // Left Ear

  oscRight.type = 'sine';
  oscRight.frequency.value = 256; // Right Ear (40Hz difference = Gamma/Focus frequency)

  const gainLeft = ctx.createGain();
  const gainRight = ctx.createGain();
  gainLeft.gain.value = 0.5;
  gainRight.gain.value = 0.5;

  oscLeft.connect(gainLeft);
  oscRight.connect(gainRight);

  gainLeft.connect(merger, 0, 0);  // Left channel
  gainRight.connect(merger, 0, 1); // Right channel

  merger.connect(masterGain);

  oscLeft.start();
  oscRight.start();

  return {
    stop: () => {
      try {
        oscLeft.stop();
        oscRight.stop();
        oscLeft.disconnect();
        oscRight.disconnect();
      } catch { }
    }
  };
}

/** Procedural Rain Synthesizer */
function createRain(ctx, masterGain) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Pink noise approximation
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 1200;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 300;

  noise.connect(lowpass);
  lowpass.connect(highpass);
  highpass.connect(masterGain);

  noise.start();

  return {
    stop: () => {
      try {
        noise.stop();
        noise.disconnect();
      } catch { }
    }
  };
}

/** Campfire Crackle Synthesizer */
function createCampfire(ctx, masterGain) {
  // Low warmth rumble
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
  }

  const rumble = ctx.createBufferSource();
  rumble.buffer = buffer;
  rumble.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 450;

  rumble.connect(filter);
  filter.connect(masterGain);
  rumble.start();

  // Crackle bursts interval
  let isRunning = true;
  const crackleInterval = setInterval(() => {
    if (!isRunning || !ctx) return;
    if (Math.random() > 0.4) {
      try {
        const click = ctx.createBufferSource();
        const clickBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
        const clickData = clickBuf.getChannelData(0);
        for (let j = 0; j < clickData.length; j++) {
          clickData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.008));
        }
        click.buffer = clickBuf;
        const crackleGain = ctx.createGain();
        crackleGain.gain.value = 0.4 + Math.random() * 0.5;
        click.connect(crackleGain);
        crackleGain.connect(masterGain);
        click.start();
      } catch { }
    }
  }, 120);

  return {
    stop: () => {
      isRunning = false;
      clearInterval(crackleInterval);
      try {
        rumble.stop();
        rumble.disconnect();
      } catch { }
    }
  };
}

/** Ocean Waves with LFO modulation */
function createOceanWaves(ctx, masterGain) {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 400;
  filter.Q.value = 1.2;

  // LFO to create rhythmic waves
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.12; // 1 wave every ~8 seconds

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 350;

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  noise.connect(filter);
  filter.connect(masterGain);

  noise.start();
  lfo.start();

  return {
    stop: () => {
      try {
        noise.stop();
        lfo.stop();
        noise.disconnect();
        lfo.disconnect();
      } catch { }
    }
  };
}

/** Cyberpunk Synth Pad Drone */
function createCyberpunkDrone(ctx, masterGain) {
  const freqs = [110, 164.81, 220, 329.63]; // A2, E3, A3, E4 chord
  const oscs = [];

  freqs.forEach(freq => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq + (Math.random() - 0.5) * 1.5; // slight detune

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.15;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;

    osc.connect(oscGain);
    oscGain.connect(filter);
    filter.connect(masterGain);

    osc.start();
    oscs.push(osc);
  });

  return {
    stop: () => {
      oscs.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch { }
      });
    }
  };
}

/** Deep Brown Noise */
function createBrownNoise(ctx, masterGain) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  noise.connect(masterGain);
  noise.start();

  return {
    stop: () => {
      try {
        noise.stop();
        noise.disconnect();
      } catch { }
    }
  };
}

export const SOUND_PRESETS = [
  { id: 'binaural', name: '40Hz Binaural Beats', iconKey: 'binaural', desc: 'Gamma wave focus frequency' },
  { id: 'rain', name: 'Gentle Rain', iconKey: 'rain', desc: 'Soft rain on window' },
  { id: 'campfire', name: 'Campfire Crackle', iconKey: 'campfire', desc: 'Warm fireplace with cozy crackles' },
  { id: 'ocean', name: 'Ocean Waves', iconKey: 'ocean', desc: 'Rhythmic deep sea swell' },
  { id: 'cyberpunk', name: 'Cyberpunk Drone', iconKey: 'cyberpunk', desc: 'Deep warm synth pad' },
  { id: 'brown', name: 'Brown Noise', iconKey: 'brown', desc: 'Low frequency background mask' },
];

export function playSoundscape(presetId, volume = 0.5) {
  // Synchronously stop previous sound so there's no race condition
  stopSoundscape(true);

  currentVolume = volume;
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  currentGain = ctx.createGain();
  currentGain.gain.setValueAtTime(0.001, ctx.currentTime);
  currentGain.gain.linearRampToValueAtTime(Math.max(0.01, Math.min(1, volume)), ctx.currentTime + 0.3);
  currentGain.connect(ctx.destination);

  activeSoundType = presetId;

  switch (presetId) {
    case 'binaural':
      currentSource = createBinauralBeats(ctx, currentGain);
      break;
    case 'rain':
      currentSource = createRain(ctx, currentGain);
      break;
    case 'campfire':
      currentSource = createCampfire(ctx, currentGain);
      break;
    case 'ocean':
      currentSource = createOceanWaves(ctx, currentGain);
      break;
    case 'cyberpunk':
      currentSource = createCyberpunkDrone(ctx, currentGain);
      break;
    case 'brown':
    default:
      currentSource = createBrownNoise(ctx, currentGain);
      break;
  }

  try {
    window.dispatchEvent(new CustomEvent('soundscape-changed', {
      detail: { active: presetId, isPlaying: true, volume }
    }));
  } catch { /* noop */ }
}

export function stopSoundscape(immediate = false) {
  const oldSource = currentSource;
  const oldGain = currentGain;

  currentSource = null;
  currentGain = null;
  const prevActive = activeSoundType;
  activeSoundType = null;

  if (oldGain && audioCtx) {
    try {
      if (immediate) {
        oldGain.gain.setValueAtTime(0, audioCtx.currentTime);
      } else {
        oldGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
      }
    } catch { }
  }

  if (oldSource) {
    if (immediate) {
      try { oldSource.stop(); } catch { }
    } else {
      setTimeout(() => {
        try { oldSource.stop(); } catch { }
      }, 250);
    }
  }

  if (prevActive) {
    try {
      window.dispatchEvent(new CustomEvent('soundscape-changed', {
        detail: { active: null, isPlaying: false, volume: currentVolume }
      }));
    } catch { /* noop */ }
  }
}

export function setSoundscapeVolume(vol) {
  currentVolume = vol;
  if (currentGain && audioCtx) {
    try {
      currentGain.gain.setValueAtTime(Math.max(0.001, Math.min(1, vol)), audioCtx.currentTime);
    } catch { }
  }
  try {
    window.dispatchEvent(new CustomEvent('soundscape-volume-changed', { detail: { volume: vol } }));
  } catch { /* noop */ }
}

export function getActiveSoundscape() {
  return activeSoundType;
}

export function isSoundscapePlaying() {
  return !!activeSoundType && !!currentSource;
}

export function getSoundscapeVolume() {
  return currentVolume;
}
