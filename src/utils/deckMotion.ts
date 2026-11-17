export const ENTER_SHARE = 0.72;

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

export const formatDeckHost = (url: string): string =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/**
 * How far card `index` has arrived (0 below viewport, 1 landed) at deck progress `v`.
 */
export function arrived(index: number, v: number, count: number): number {
  if (index <= 0) return 1;
  const span = Math.max(1, count - 1);
  return easeOutCubic(clamp01((v * span - (index - 1)) / ENTER_SHARE));
}

export function rawAboveCount(index: number, v: number, count: number): number {
  let stacked = 0;
  for (let j = index + 1; j < count; j++) {
    stacked += arrived(j, v, count);
  }
  return stacked;
}

/**
 * Count of cards currently lying on top of card `index`, capped at 3.
 */
export function aboveCount(index: number, v: number, count: number): number {
  return Math.min(3, rawAboveCount(index, v, count));
}

export interface CardTransformValues {
  ySvh: number;
  rotateXDeg: number;
  scale: number;
  blurPx: number;
  dimOpacity: number;
  stillYSvh: number;
  visible: boolean;
}

export function computeCardTransforms(
  index: number,
  v: number,
  count: number,
): CardTransformValues {
  const arr = arrived(index, v, count);
  const rawAbv = rawAboveCount(index, v, count);
  const abv = Math.min(3, rawAbv);
  const rawBlur = (1 - arr) ** 2 * 10 + abv * 1.0;
  return {
    ySvh: (1 - arr) * 108 - abv * 5,
    rotateXDeg: -(1 - arr) * 28 + abv * 5,
    scale: 0.9 + 0.1 * arr - abv * 0.05,
    blurPx: rawBlur < 0.15 ? 0 : rawBlur,
    dimOpacity: abv * 0.16,
    stillYSvh: arr >= 0.5 ? 0 : 110,
    visible: rawAbv < 3.4 && (index === 0 || arr > 0.002),
  };
}
