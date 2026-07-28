import confetti from 'canvas-confetti';

export function burstConfetti(originX = 0.5, originY = 0.5) {
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 35,
    origin: { x: originX, y: originY },
    colors: ['#a855f7', '#f472b6', '#22d3ee', '#facc15'],
    scalar: 0.9,
    ticks: 150,
  });
}

export function burstLevelUp() {
  const duration = 900;
  const end = Date.now() + duration;
  const colors = ['#a855f7', '#f472b6', '#22d3ee', '#facc15', '#4ade80'];

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
