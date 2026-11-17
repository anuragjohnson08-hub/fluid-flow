export type AppPage = 'home' | 'reviews';

export const REVIEWS_HASH = '#/reviews';

export const PILL_SLIDE_DURATION_MS = 460;
export const ROUTE_LOADER_HOLD_MS = 1400;
export const ROUTE_LOADER_FADE_MS = 380;
export const ROUTE_LOADER_LETTERS = [
  'L',
  'o',
  'a',
  'd',
  'i',
  'n',
  'g',
  '.',
  '.',
  '.',
] as const;

export const HOME_SECTION_IDS = [
  'bento',
  'features',
  'clients',
  'pricing',
  'cta',
] as const;

export function resolvePageFromLocation(hash: string): AppPage {
  const normalized = hash.trim().toLowerCase();
  if (normalized === '#/reviews' || normalized === '#reviews' || normalized === '#review-deck') {
    return 'reviews';
  }
  return 'home';
}

export function getSectionScrollTarget(hrefOrHash: string): string | null {
  const idx = hrefOrHash.indexOf('#');
  if (idx === -1) return null;
  const fragment = hrefOrHash.slice(idx + 1).trim();
  if (!fragment || fragment.startsWith('/')) return null;
  return fragment;
}

// 25-point curve matching --ios-spring in index.css
export const IOS_SPRING_SAMPLES: readonly number[] = [
  0.0, 0.0465, 0.1551, 0.2909, 0.4311, 0.5618, 0.6759, 0.7705, 0.8456, 0.9028,
  0.9447, 0.9739, 0.9933, 1.0053, 1.0119, 1.0147, 1.0151, 1.014, 1.0122,
  1.0101, 1.008, 1.0061, 1.0045, 1.0031, 1.0,
];

export function evaluateSpringEase(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  const maxIdx = IOS_SPRING_SAMPLES.length - 1;
  const scaled = clamped * maxIdx;
  const idx = Math.floor(scaled);
  if (idx >= maxIdx) return IOS_SPRING_SAMPLES[maxIdx];
  const frac = scaled - idx;
  return (
    IOS_SPRING_SAMPLES[idx] +
    (IOS_SPRING_SAMPLES[idx + 1] - IOS_SPRING_SAMPLES[idx]) * frac
  );
}

export function evaluateRetractEase(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

export function computeIntroPillFrame(
  travelPx: number,
  maxTravel: number,
  thumbShift: number,
): {
  travelPx: number;
  progress: number;
  textShiftPx: number;
  trackBackground: string;
} {
  const safeMax = Math.max(1, maxTravel);
  const progress = Math.max(0, Math.min(1, travelPx / safeMax));
  const textShiftPx = progress === 0 ? 0 : -progress * thumbShift;
  const trackBackground = `linear-gradient(90deg, rgba(255, 255, 255, ${(0.08 + progress * 0.2).toFixed(3)}) 0%, rgba(212, 212, 216, ${(0.05 + progress * 0.14).toFixed(3)}) ${Math.round(progress * 100)}%, rgba(255, 255, 255, 0.05) 100%)`;

  return {
    travelPx,
    progress,
    textShiftPx,
    trackBackground,
  };
}

export function computeBackSliderFrame(
  travelPx: number,
  maxTravel: number,
  thumbShift: number,
): {
  travelPx: number;
  thumbTranslateX: number;
  progress: number;
  textShiftPx: number;
  trackBackground: string;
} {
  const safeMax = Math.max(1, maxTravel);
  const progress = Math.max(0, Math.min(1, travelPx / safeMax));
  const thumbTranslateX = travelPx === 0 ? 0 : -travelPx;
  const textShiftPx = progress === 0 ? 0 : progress * thumbShift;
  const trackBackground = `linear-gradient(270deg, rgba(255, 255, 255, ${(0.08 + progress * 0.2).toFixed(3)}) 0%, rgba(212, 212, 216, ${(0.05 + progress * 0.14).toFixed(3)}) ${Math.round(progress * 100)}%, rgba(255, 255, 255, 0.05) 100%)`;

  return {
    travelPx,
    thumbTranslateX,
    progress,
    textShiftPx,
    trackBackground,
  };
}
