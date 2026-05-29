import confetti from 'canvas-confetti';

/**
 * Fires a subtle, professional confetti burst for high-value success actions.
 */
export const fireStepConfetti = () => {
  const count = 150;
  const defaults = {
    origin: { y: 0.7 },
    spread: 360,
    ticks: 50,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['circle'] as confetti.Shape[],
    colors: ['#3b82f6', '#8b5cf6', '#d946ef'], // Matches Arcora palette (primary, purple, pink)
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    startVelocity: 25,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

/**
 * Fires a simple, single-burst confetti for smaller successes.
 */
export const fireSimpleConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#3b82f6', '#8b5cf6'],
    disableForReducedMotion: true,
  });
};
