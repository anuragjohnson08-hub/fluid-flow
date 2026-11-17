export interface StarParticle {
  xNorm: number;
  yNorm: number;
  size: number;
  baseAlpha: number;
  speedPx: number;
  twinkleSpeed: number;
  twinklePhase: number;
  tint: 'white' | 'mint' | 'emerald';
}

export interface StarLayerConfig {
  count: number;
  size: number;
  alphaMin: number;
  alphaMax: number;
  speedPx: number;
}

export const STAR_LAYERS: readonly StarLayerConfig[] = [
  { count: 150, size: 1, alphaMin: 0.35, alphaMax: 0.75, speedPx: 7 },
  { count: 45, size: 1.6, alphaMin: 0.5, alphaMax: 0.9, speedPx: 12 },
  { count: 16, size: 2.2, alphaMin: 0.65, alphaMax: 1.0, speedPx: 18 },
];

export function createStarfield(
  layers: readonly StarLayerConfig[] = STAR_LAYERS,
  initialSeed = 104729,
): StarParticle[] {
  let seed = initialSeed;
  const rnd = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };

  const stars: StarParticle[] = [];
  for (const layer of layers) {
    for (let i = 0; i < layer.count; i++) {
      const xNorm = rnd();
      const yNorm = rnd();
      const baseAlpha = layer.alphaMin + rnd() * (layer.alphaMax - layer.alphaMin);
      const twinkleSpeed = 0.6 + rnd() * 1.1;
      const twinklePhase = rnd() * Math.PI * 2;
      const tintRoll = rnd();
      const tint: StarParticle['tint'] =
        tintRoll > 0.9 ? 'emerald' : tintRoll > 0.78 ? 'mint' : 'white';

      stars.push({
        xNorm,
        yNorm,
        size: layer.size,
        baseAlpha,
        speedPx: layer.speedPx * (0.85 + rnd() * 0.3),
        twinkleSpeed,
        twinklePhase,
        tint,
      });
    }
  }
  return stars;
}

export function advanceStarfield(
  stars: StarParticle[],
  dtSeconds: number,
  viewportHeight: number,
): void {
  if (dtSeconds <= 0 || viewportHeight <= 0) return;
  const clampedDt = Math.min(dtSeconds, 0.1);
  const safeHeight = Math.max(viewportHeight, 1);

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    const deltaNorm = (star.speedPx * clampedDt) / safeHeight;
    let nextY = star.yNorm - deltaNorm;
    if (nextY < 0) {
      nextY = ((nextY % 1) + 1) % 1;
    }
    star.yNorm = nextY;
  }
}

export function getStarFillStyle(
  tint: StarParticle['tint'],
  alpha: number,
): string {
  const clampedAlpha = Math.max(0.05, Math.min(1, alpha)).toFixed(2);
  if (tint === 'emerald') {
    return `rgba(212, 212, 216, ${clampedAlpha})`;
  }
  if (tint === 'mint') {
    return `rgba(229, 229, 229, ${clampedAlpha})`;
  }
  return `rgba(255, 255, 255, ${clampedAlpha})`;
}
