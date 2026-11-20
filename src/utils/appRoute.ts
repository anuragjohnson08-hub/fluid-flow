export type AppPage = 'home' | 'reviews';

export const REVIEWS_HASH = '#/reviews';

export const PILL_SLIDE_DURATION_MS = 460;
export const PACKET_TEAR_FLASH_MS = 180;
export const PACKET_CARD_FLIGHT_MS = 1050;

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

export function computePillTearFrame(
  progress: number,
  burstProgress = 0,
): {
  seamPct: number;
  lipLiftPx: number;
  glowOpacity: number;
  flashOpacity: number;
} {
  const p = Math.max(0, Math.min(1, progress));
  const b = Math.max(0, Math.min(1, burstProgress));
  const seamPct = p * 100;
  const dragLift = p > 0 ? Math.pow(p, 1.15) * 3.5 : 0;
  const burstLift = b > 0 ? evaluateSpringEase(b) * 8.5 : 0;
  const lipLiftPx = dragLift + burstLift;
  const glowOpacity = p === 0 && b === 0 ? 0 : Math.min(1, 0.22 + p * 0.65 + b * 0.18);
  const flashOpacity = b > 0 ? Math.sin(b * Math.PI) : 0;

  return {
    seamPct,
    lipLiftPx,
    glowOpacity,
    flashOpacity,
  };
}

export interface PacketOriginRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PacketViewportSize {
  width: number;
  height: number;
}

export interface PacketCardFrame {
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
  borderRadius: number;
  backdropOpacity: number;
  contentScale: number;
  clipBottomPx: number;
  borderOpacity: number;
  phase: 'pull' | 'bounce' | 'expand';
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(1e-6, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function computePacketCardFrame(
  t: number,
  origin: PacketOriginRect,
  viewport: PacketViewportSize,
): PacketCardFrame {
  const clamped = Math.max(0, Math.min(1, t));
  const vw = Math.max(320, viewport.width);
  const vh = Math.max(480, viewport.height);

  // Card resting dimensions when emerged & centered
  const cardWidth = Math.min(480, Math.max(260, vw - 28));
  const cardHeight = Math.min(320, Math.max(210, Math.round(vh * 0.38)));
  const startWidth = Math.min(cardWidth, Math.max(240, origin.width * 0.94));
  const startHeight = Math.round(cardHeight * 0.86);

  const originCenterX = origin.left + origin.width * 0.5;
  const slitY = origin.top + 4;

  const startLeft = Math.max(14, Math.min(vw - startWidth - 14, originCenterX - startWidth * 0.5));
  const startTop = slitY - 12;

  const pullLeft = Math.max(14, Math.min(vw - cardWidth - 14, originCenterX - cardWidth * 0.5));
  const pullTop = Math.max(84, slitY - Math.round(cardHeight * 0.42));

  const centerLeft = (vw - cardWidth) * 0.5;
  const centerTop = Math.max(88, (vh - cardHeight) * 0.5);

  const PULL_END = 0.34;
  const BOUNCE_END = 0.66;

  if (clamped <= PULL_END) {
    const p = clamped / PULL_END;
    const eased = evaluateRetractEase(p);
    const width = lerp(startWidth, cardWidth, eased);
    const height = lerp(startHeight, cardHeight, eased);
    const left = lerp(startLeft, pullLeft, eased);
    const top = lerp(startTop, pullTop, eased);
    const clearT = smoothstep(0.18, 0.34, clamped);
    const rawBottomBeyondSlit = Math.max(0, top + height - slitY);
    const clipBottomPx = rawBottomBeyondSlit * (1 - clearT);

    return {
      left,
      top,
      width,
      height,
      scale: lerp(0.95, 1.0, eased),
      borderRadius: lerp(16, 22, eased),
      backdropOpacity: lerp(0.08, 0.52, eased),
      contentScale: width / vw,
      clipBottomPx,
      borderOpacity: 1,
      phase: 'pull',
    };
  }

  if (clamped <= BOUNCE_END) {
    const p = (clamped - PULL_END) / (BOUNCE_END - PULL_END);
    const eased = evaluateSpringEase(p);
    const left = lerp(pullLeft, centerLeft, eased);
    const top = lerp(pullTop, centerTop, eased);
    // Noticeable springy "bounce in" pulse around p = 0.45 before settling at 1.0
    const bounceWave = Math.sin(p * Math.PI) * Math.exp(-p * 1.4) * 0.085;
    const scale = 1.0 + bounceWave;

    return {
      left,
      top,
      width: cardWidth,
      height: cardHeight,
      scale,
      borderRadius: 22,
      backdropOpacity: lerp(0.52, 0.82, Math.min(1, p * 1.2)),
      contentScale: cardWidth / vw,
      clipBottomPx: 0,
      borderOpacity: 1,
      phase: 'bounce',
    };
  }

  const p = (clamped - BOUNCE_END) / (1 - BOUNCE_END);
  const eased = smoothstep(0, 1, p);
  const left = lerp(centerLeft, 0, eased);
  const top = lerp(centerTop, 0, eased);
  const width = lerp(cardWidth, vw, eased);
  const height = lerp(cardHeight, vh, eased);

  return {
    left,
    top,
    width,
    height,
    scale: 1,
    borderRadius: lerp(22, 0, eased),
    backdropOpacity: lerp(0.82, 1, eased),
    contentScale: width / vw,
    clipBottomPx: 0,
    borderOpacity: Math.max(0, 1 - smoothstep(0.65, 1, p)),
    phase: 'expand',
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
