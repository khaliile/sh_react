// Lightweight confetti — no external dependency.
// Renders a brief burst of colored particles on the page using a fixed-position canvas.
import { useEffect, useRef } from 'react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#ffffff'];

export function fireConfetti(duration = 2000) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none;
    z-index: 9999;
  `;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const particles = [];
  const count = 140;

  for (let i = 0; i < count; i++) {
    // Spread across top of screen for a cascade effect
    const xSpread = (Math.random() * 1.4 - 0.2) * window.innerWidth;
    particles.push({
      x: xSpread,
      y: -10,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 5 + 2,
      gravity: 0.25,
      size: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.1 + 0.05,
      life: 1,
      // shape: 0 = rect, 1 = circle
      shape: Math.random() > 0.4 ? 0 : 1,
    });
  }

  const start = performance.now();
  let raf;
  const draw = (now) => {
    const elapsed = now - start;
    if (elapsed > duration) {
      canvas.remove();
      cancelAnimationFrame(raf);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const fadeFactor = elapsed > duration * 0.6
      ? 1 - (elapsed - duration * 0.6) / (duration * 0.4)
      : 1;

    for (const p of particles) {
      p.vy += p.gravity;
      p.x += p.vx + Math.sin(p.wobble) * 1.2;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      p.wobble += p.wobbleSpeed;
      p.life = fadeFactor;

      if (p.y > canvas.height + 20) continue;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;

      if (p.shape === 1) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
}

/**
 * React hook: fires confetti once when `trigger` becomes truthy.
 * Resets when `trigger` goes false, so a subsequent true will fire again.
 */
export function useConfettiOn(trigger) {
  const fired = useRef(false);
  useEffect(() => {
    if (trigger && !fired.current) {
      fired.current = true;
      fireConfetti();
    }
    // Reset so it can fire again next time trigger goes true→false→true
    if (!trigger) {
      fired.current = false;
    }
  }, [trigger]);
}
