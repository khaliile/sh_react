/**
 * Lightweight Web Audio API sound effects — zero dependencies.
 * All functions are safe to call even if the browser has no audio context.
 */

let _ctx = null;

function getCtx() {
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  // Resume if suspended (browser autoplay policy)
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

/**
 * Subtle tick sound — played when a single task is checked.
 * A short 880 Hz sine wave with quick decay.
 */
export function playTick() {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.13);
}

/**
 * Fanfare — played when ALL tasks are complete (100%).
 * An ascending chord arpeggio.
 */
export function playFanfare() {
  const ctx = getCtx();
  if (!ctx) return;

  // Notes: C5, E5, G5, C6
  const freqs = [523.25, 659.25, 783.99, 1046.5];
  const stepTime = 0.12;

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const t = ctx.currentTime + i * stepTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.start(t);
    osc.stop(t + 0.36);
  });
}

/**
 * Timer complete chime — played when the study timer hits zero.
 * A gentle descending two-tone bell.
 */
export function playTimerComplete() {
  const ctx = getCtx();
  if (!ctx) return;

  const freqs = [880, 660];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const t = ctx.currentTime + i * 0.22;
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.start(t);
    osc.stop(t + 0.51);
  });
}
