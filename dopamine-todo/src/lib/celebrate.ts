import confetti from 'canvas-confetti';

function getAccentColor(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  return value || '#c6ff4a';
}

// Reduced motion keeps the feedback (a burst still fires, so completion still feels
// confirmed) but drops the continuous side-cannon loop and cuts particle counts, since
// a screen full of moving confetti is exactly the kind of motion that setting asks to avoid.
function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function burstConfetti(originX = 0.5, originY = 0.5) {
  const reduced = prefersReducedMotion();
  confetti({
    particleCount: reduced ? 18 : 60,
    spread: 70,
    startVelocity: reduced ? 20 : 35,
    origin: { x: originX, y: originY },
    colors: [getAccentColor(), '#ffffff', '#eaffb0', '#8fd13f'],
    scalar: 0.9,
    ticks: reduced ? 80 : 150,
  });
}

export function burstLevelUp() {
  const colors = [getAccentColor(), '#ffffff', '#eaffb0', '#8fd13f', '#4ade80'];

  if (prefersReducedMotion()) {
    confetti({ particleCount: 40, spread: 90, startVelocity: 25, origin: { x: 0.5, y: 0.5 }, colors, ticks: 80 });
    return;
  }

  const duration = 900;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  confetti({
    particleCount: 120,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.5 },
    colors,
  });
}
