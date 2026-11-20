import {
  BarChart2,
  Calendar,
  ChevronRight,
  FileText,
  Globe,
  Link2,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PACKET_TEAR_FLASH_MS,
  PILL_SLIDE_DURATION_MS,
  computeIntroPillFrame,
  computePillTearFrame,
  evaluateRetractEase,
  evaluateSpringEase,
  type PacketOriginRect,
} from '../../utils/appRoute';
import { getKeywordSummary, type KeywordRow } from '../../utils/keywords';
import type { PieInputSlice } from '../../utils/pie3d';
import { LiquidWaterSurface, type NimbusFx } from '../ui/liquid-glass-navbar';
import { DynamicIsland } from '../widgets/DynamicIsland';
import { FluidPie3D } from '../widgets/FluidPie3D';

interface HeroDashboardProps {
  isMobile: boolean;
  diOpen: boolean;
  query: string;
  visibleKeywords: KeywordRow[];
  recentSearches: string[];
  onOpenDi: () => void;
  onCloseDi: () => void;
  onQueryChange: (value: string) => void;
  onCommitSearch: (value: string) => void;
  onRemoveRecentSearch: (value: string) => void;
  onClearRecentSearches: () => void;
  onOpenReviews?: (originRect?: PacketOriginRect) => void;
}

const SIDEBAR_ITEMS: ReadonlyArray<{
  id: 'overview' | 'analytics' | 'keywords' | 'goals' | 'evaluation' | 'backlinks' | 'wizard';
  label: string;
  icon: typeof Globe;
  fx: NimbusFx;
}> = [
  { id: 'overview', label: 'All Game Reviews', icon: Globe, fx: 'spin' },
  { id: 'analytics', label: 'Story Ratings', icon: BarChart2, fx: 'pop' },
  { id: 'keywords', label: 'Graphics & Visuals', icon: Sparkles, fx: 'drop' },
  { id: 'goals', label: 'Action & Combat', icon: Target, fx: 'glow' },
  { id: 'evaluation', label: 'Simple Own Rating', icon: FileText, fx: 'pop' },
  { id: 'backlinks', label: 'Game Suggestions', icon: Link2, fx: 'wave' },
  { id: 'wizard', label: 'One-Stop Feed', icon: Wand2, fx: 'wave' },
];

type SidebarId = (typeof SIDEBAR_ITEMS)[number]['id'];

interface RatingBarItem {
  label: string;
  value: string;
  pct: number;
}

interface VerdictBarItem {
  label: string;
  value: string;
  pct: number;
  barClass: string;
  textClass: string;
}

const SIDEBAR_METRICS: Record<
  SidebarId,
  {
    visibilityLabel: string;
    visibilityVal: number;
    visibilityDec: number;
    visibilitySuf: string;
    visibilityDelta: string;
    kwLabel: string;
    kwVal: number;
    kwDec: number;
    kwSuf: string;
    kwDelta: string;
    ratingBars: RatingBarItem[];
    verdictBars: VerdictBarItem[];
  }
> = {
  overview: {
    visibilityLabel: 'Avg. Rating Score',
    visibilityVal: 8.9,
    visibilityDec: 1,
    visibilitySuf: '/10',
    visibilityDelta: 'Perfect',
    kwLabel: 'Games Reviewed',
    kwVal: 1.4,
    kwDec: 1,
    kwSuf: 'K',
    kwDelta: '+42 new',
    ratingBars: [
      { label: 'Story', value: '8.9', pct: 89 },
      { label: 'Graphics', value: '9.1', pct: 91 },
      { label: 'Action', value: '8.8', pct: 88 },
      { label: 'Overall', value: '8.9', pct: 89 },
    ],
    verdictBars: [
      { label: 'Perfect', value: '38%', pct: 76, barClass: 'bg-gradient-to-t from-emerald-600 to-emerald-400', textClass: 'text-emerald-300' },
      { label: 'Okish', value: '41%', pct: 82, barClass: 'bg-gradient-to-t from-amber-500 to-amber-300', textClass: 'text-amber-300' },
      { label: 'Time Waste', value: '21%', pct: 42, barClass: 'bg-gradient-to-t from-rose-600 to-rose-400', textClass: 'text-rose-300' },
    ],
  },
  analytics: {
    visibilityLabel: 'Avg. Story Rating',
    visibilityVal: 9.1,
    visibilityDec: 1,
    visibilitySuf: '/10',
    visibilityDelta: '+0.4',
    kwLabel: 'Story-First Picks',
    kwVal: 320,
    kwDec: 0,
    kwSuf: '',
    kwDelta: 'Curated',
    ratingBars: [
      { label: 'Plot', value: '9.2', pct: 92 },
      { label: 'Pacing', value: '8.9', pct: 89 },
      { label: 'World', value: '9.3', pct: 93 },
      { label: 'Story', value: '9.1', pct: 91 },
    ],
    verdictBars: [
      { label: 'Perfect', value: '46%', pct: 92, barClass: 'bg-gradient-to-t from-emerald-600 to-emerald-400', textClass: 'text-emerald-300' },
      { label: 'Okish', value: '39%', pct: 78, barClass: 'bg-gradient-to-t from-amber-500 to-amber-300', textClass: 'text-amber-300' },
      { label: 'Time Waste', value: '15%', pct: 30, barClass: 'bg-gradient-to-t from-rose-600 to-rose-400', textClass: 'text-rose-300' },
    ],
  },
  keywords: {
    visibilityLabel: 'Avg. Graphics Rating',
    visibilityVal: 9.4,
    visibilityDec: 1,
    visibilitySuf: '/10',
    visibilityDelta: '+0.6',
    kwLabel: 'Visual Showpieces',
    kwVal: 215,
    kwDec: 0,
    kwSuf: '',
    kwDelta: 'Verified',
    ratingBars: [
      { label: 'Art', value: '9.5', pct: 95 },
      { label: 'Lighting', value: '9.4', pct: 94 },
      { label: 'FPS', value: '9.2', pct: 92 },
      { label: 'Graphics', value: '9.4', pct: 94 },
    ],
    verdictBars: [
      { label: 'Perfect', value: '44%', pct: 88, barClass: 'bg-gradient-to-t from-emerald-600 to-emerald-400', textClass: 'text-emerald-300' },
      { label: 'Okish', value: '40%', pct: 80, barClass: 'bg-gradient-to-t from-amber-500 to-amber-300', textClass: 'text-amber-300' },
      { label: 'Time Waste', value: '16%', pct: 32, barClass: 'bg-gradient-to-t from-rose-600 to-rose-400', textClass: 'text-rose-300' },
    ],
  },
  goals: {
    visibilityLabel: 'Avg. Action Rating',
    visibilityVal: 8.8,
    visibilityDec: 1,
    visibilitySuf: '/10',
    visibilityDelta: '+0.5',
    kwLabel: 'High-Action Titles',
    kwVal: 410,
    kwDec: 0,
    kwSuf: '',
    kwDelta: 'Tested',
    ratingBars: [
      { label: 'Combat', value: '9.0', pct: 90 },
      { label: 'Feel', value: '8.9', pct: 89 },
      { label: 'Balance', value: '8.5', pct: 85 },
      { label: 'Action', value: '8.8', pct: 88 },
    ],
    verdictBars: [
      { label: 'Perfect', value: '42%', pct: 84, barClass: 'bg-gradient-to-t from-emerald-600 to-emerald-400', textClass: 'text-emerald-300' },
      { label: 'Okish', value: '38%', pct: 76, barClass: 'bg-gradient-to-t from-amber-500 to-amber-300', textClass: 'text-amber-300' },
      { label: 'Time Waste', value: '20%', pct: 40, barClass: 'bg-gradient-to-t from-rose-600 to-rose-400', textClass: 'text-rose-300' },
    ],
  },
  evaluation: {
    visibilityLabel: 'Perfect Verdict Share',
    visibilityVal: 38.0,
    visibilityDec: 0,
    visibilitySuf: '%',
    visibilityDelta: 'Must Play',
    kwLabel: 'Okish / Time Waste',
    kwVal: 62,
    kwDec: 0,
    kwSuf: '%',
    kwDelta: 'Filtered',
    ratingBars: [
      { label: 'Story', value: '8.7', pct: 87 },
      { label: 'Graphics', value: '9.0', pct: 90 },
      { label: 'Action', value: '8.8', pct: 88 },
      { label: 'Avg', value: '8.8', pct: 88 },
    ],
    verdictBars: [
      { label: 'Perfect', value: '38%', pct: 76, barClass: 'bg-gradient-to-t from-emerald-600 to-emerald-400', textClass: 'text-emerald-300' },
      { label: 'Okish', value: '41%', pct: 82, barClass: 'bg-gradient-to-t from-amber-500 to-amber-300', textClass: 'text-amber-300' },
      { label: 'Time Waste', value: '21%', pct: 42, barClass: 'bg-gradient-to-t from-rose-600 to-rose-400', textClass: 'text-rose-300' },
    ],
  },
  backlinks: {
    visibilityLabel: 'Suggestion Match Rate',
    visibilityVal: 94.5,
    visibilityDec: 1,
    visibilitySuf: '%',
    visibilityDelta: 'By Taste',
    kwLabel: 'Matched Games',
    kwVal: 24,
    kwDec: 0,
    kwSuf: '',
    kwDelta: 'Ready',
    ratingBars: [
      { label: 'Story Fit', value: '9.4', pct: 94 },
      { label: 'Visual Fit', value: '9.3', pct: 93 },
      { label: 'Action Fit', value: '9.6', pct: 96 },
      { label: 'Match', value: '9.5', pct: 95 },
    ],
    verdictBars: [
      { label: 'Perfect', value: '74%', pct: 94, barClass: 'bg-gradient-to-t from-emerald-600 to-emerald-400', textClass: 'text-emerald-300' },
      { label: 'Okish', value: '24%', pct: 48, barClass: 'bg-gradient-to-t from-amber-500 to-amber-300', textClass: 'text-amber-300' },
      { label: 'Time Waste', value: '2%', pct: 10, barClass: 'bg-gradient-to-t from-rose-600 to-rose-400', textClass: 'text-rose-300' },
    ],
  },
  wizard: {
    visibilityLabel: 'All Reviews in One Stop',
    visibilityVal: 100,
    visibilityDec: 0,
    visibilitySuf: '%',
    visibilityDelta: 'Live Hub',
    kwLabel: 'Genres Covered',
    kwVal: 18,
    kwDec: 0,
    kwSuf: '',
    kwDelta: 'Updated',
    ratingBars: [
      { label: 'Story', value: '8.9', pct: 89 },
      { label: 'Graphics', value: '9.2', pct: 92 },
      { label: 'Action', value: '8.8', pct: 88 },
      { label: 'Hub', value: '9.0', pct: 90 },
    ],
    verdictBars: [
      { label: 'Perfect', value: '38%', pct: 76, barClass: 'bg-gradient-to-t from-emerald-600 to-emerald-400', textClass: 'text-emerald-300' },
      { label: 'Okish', value: '41%', pct: 82, barClass: 'bg-gradient-to-t from-amber-500 to-amber-300', textClass: 'text-amber-300' },
      { label: 'Time Waste', value: '21%', pct: 42, barClass: 'bg-gradient-to-t from-rose-600 to-rose-400', textClass: 'text-rose-300' },
    ],
  },
};

function AnimatedCounter({ to, decimals, suffix }: { to: number; decimals: number; suffix: string }) {
  const [display, setDisplay] = useState(() => `${to.toFixed(decimals)}${suffix}`);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDisplay(`${to.toFixed(decimals)}${suffix}`);
      return;
    }

    const duration = hasAnimatedRef.current ? 420 : 1200;
    hasAnimatedRef.current = true;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(`${(to * eased).toFixed(decimals)}${suffix}`);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, decimals, suffix]);

  return <span>{display}</span>;
}

const JAR_FILL_SCALE = 0.84; // Scales 0-100 rating pct to leave realistic glass headspace at top
const JAR_FILL_DURATION_MS = 1400; // Duration (ms) for water rising smoothly from bottom to top
const JAR_STAGGER_MS = 90; // Stagger delay (ms) between each jar

export function HeroDashboard({
  isMobile,
  diOpen,
  query,
  visibleKeywords,
  recentSearches,
  onOpenDi,
  onCloseDi,
  onQueryChange,
  onCommitSearch,
  onRemoveRecentSearch,
  onClearRecentSearches,
  onOpenReviews,
}: HeroDashboardProps) {
  const [activeTab, setActiveTab] = useState<SidebarId>('overview');
  const [asideFx, setAsideFx] = useState<{ index: number; seq: number }>({ index: 0, seq: 0 });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const asideHostRef = useRef<HTMLElement | null>(null);
  const asideItemRefs = useRef<(HTMLElement | null)[]>([]);
  const jarsRef = useRef<HTMLDivElement | null>(null);
  const hasHydratedRef = useRef(false);
  const [jarsInView, setJarsInView] = useState(false);
  const [fillActive, setFillActive] = useState(false);
  const [isPouring, setIsPouring] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  // Intro pill left-to-right swap, progressive top-seam packet tear & card emergence launch
  const introTrackRef = useRef<HTMLAnchorElement | null>(null);
  const introThumbRef = useRef<HTMLSpanElement | null>(null);
  const introTextRef = useRef<HTMLSpanElement | null>(null);
  const tearSeamRef = useRef<HTMLSpanElement | null>(null);
  const tearLipRef = useRef<HTMLSpanElement | null>(null);
  const tearSlotRef = useRef<HTMLSpanElement | null>(null);
  const tearFlashRef = useRef<HTMLSpanElement | null>(null);
  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startOffset: number;
    maxTravel: number;
    thumbShift: number;
    moved: boolean;
    currentOffset: number;
  }>({
    active: false,
    startX: 0,
    startOffset: 0,
    maxTravel: 240,
    thumbShift: 52,
    moved: false,
    currentOffset: 0,
  });
  const slideOffsetRef = useRef(0);
  const rafSlideRef = useRef<number>(0);
  const rafBurstRef = useRef<number>(0);
  const [introSwapped, setIntroSwapped] = useState(false);
  const [pillTearing, setPillTearing] = useState(false);
  const introSwappedRef = useRef(false);
  const slideTimerRef = useRef<number | undefined>(undefined);
  const resetTimerRef = useRef<number | undefined>(undefined);

  const cancelIntroTimersAndRaf = useCallback(() => {
    if (rafSlideRef.current !== 0) {
      cancelAnimationFrame(rafSlideRef.current);
      rafSlideRef.current = 0;
    }
    if (rafBurstRef.current !== 0) {
      cancelAnimationFrame(rafBurstRef.current);
      rafBurstRef.current = 0;
    }
    if (slideTimerRef.current !== undefined) {
      window.clearTimeout(slideTimerRef.current);
      slideTimerRef.current = undefined;
    }
    if (resetTimerRef.current !== undefined) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = undefined;
    }
  }, []);

  useEffect(() => () => cancelIntroTimersAndRaf(), [cancelIntroTimersAndRaf]);

  const measureIntroTrack = () => {
    const track = introTrackRef.current;
    const thumb = introThumbRef.current;
    if (!track || !thumb) return { maxTravel: 240, thumbShift: 52 };
    const maxTravel = Math.max(80, track.clientWidth - thumb.offsetWidth - 8);
    const thumbShift = thumb.offsetWidth + 6;
    return { maxTravel, thumbShift };
  };

  const applyIntroVisuals = (
    travelPx: number,
    maxTravel: number,
    thumbShift: number,
    burstProgress = 0,
  ) => {
    slideOffsetRef.current = travelPx;
    const frame = computeIntroPillFrame(travelPx, maxTravel, thumbShift);
    const tear = computePillTearFrame(frame.progress, burstProgress);
    const thumb = introThumbRef.current;
    const text = introTextRef.current;
    const track = introTrackRef.current;
    const seam = tearSeamRef.current;
    const lip = tearLipRef.current;
    const slot = tearSlotRef.current;
    const flash = tearFlashRef.current;

    if (thumb) {
      thumb.style.transform = `translate3d(${frame.travelPx.toFixed(1)}px, 0, 0)`;
    }
    if (text) {
      text.style.transform = `translate3d(${frame.textShiftPx.toFixed(1)}px, 0, 0)`;
    }
    if (track) {
      track.style.background = frame.trackBackground;
      track.style.setProperty('--tear-progress', tear.seamPct.toFixed(1));
    }
    if (seam) {
      seam.style.width = `${Math.max(0, tear.seamPct - 2).toFixed(1)}%`;
      seam.style.opacity = tear.glowOpacity.toFixed(3);
      seam.style.transform = `translate3d(0, ${(-tear.lipLiftPx * 0.35).toFixed(2)}px, 0)`;
    }
    if (lip) {
      lip.style.width = `${tear.seamPct.toFixed(1)}%`;
      lip.style.opacity = tear.seamPct > 1 ? Math.min(1, 0.35 + frame.progress * 0.65).toFixed(3) : '0';
      lip.style.transform = `translate3d(0, ${(-tear.lipLiftPx).toFixed(2)}px, 0)`;
    }
    if (slot) {
      slot.style.width = `${Math.max(0, tear.seamPct - 4).toFixed(1)}%`;
      slot.style.opacity = tear.seamPct > 2 ? Math.min(1, frame.progress * 0.8 + burstProgress * 0.4).toFixed(3) : '0';
      slot.style.height = `${(3 + tear.lipLiftPx * 0.9).toFixed(1)}px`;
      slot.style.transform = `translate3d(0, ${(-tear.lipLiftPx * 0.45).toFixed(2)}px, 0)`;
    }
    if (flash) {
      flash.style.opacity = tear.flashOpacity.toFixed(3);
      flash.style.transform = `scaleX(${(0.55 + burstProgress * 0.6).toFixed(3)})`;
    }
  };

  const animateIntroSlide = (
    fromOffset: number,
    toOffset: number,
    maxTravel: number,
    thumbShift: number,
    durationMs: number,
    onDone?: () => void,
  ) => {
    if (rafSlideRef.current !== 0) {
      cancelAnimationFrame(rafSlideRef.current);
      rafSlideRef.current = 0;
    }

    if (durationMs <= 20 || typeof window === 'undefined') {
      applyIntroVisuals(toOffset, maxTravel, thumbShift, 0);
      onDone?.();
      return;
    }

    let startTime = 0;
    const delta = toOffset - fromOffset;
    const forward = delta >= 0;

    const tick = (now: number) => {
      if (startTime === 0) startTime = now;
      const rawT = Math.max(0, Math.min(1, (now - startTime) / durationMs));
      const eased = forward ? evaluateSpringEase(rawT) : evaluateRetractEase(rawT);
      const nextTravel = fromOffset + delta * eased;
      applyIntroVisuals(nextTravel, maxTravel, thumbShift, 0);

      if (rawT < 1) {
        rafSlideRef.current = requestAnimationFrame(tick);
      } else {
        rafSlideRef.current = 0;
        applyIntroVisuals(toOffset, maxTravel, thumbShift, 0);
        onDone?.();
      }
    };

    rafSlideRef.current = requestAnimationFrame(tick);
  };

  const animatePacketTearBurst = (
    maxTravel: number,
    thumbShift: number,
    durationMs: number,
    onBurstReady: () => void,
  ) => {
    if (rafBurstRef.current !== 0) {
      cancelAnimationFrame(rafBurstRef.current);
      rafBurstRef.current = 0;
    }

    if (durationMs <= 20 || typeof window === 'undefined') {
      applyIntroVisuals(maxTravel, maxTravel, thumbShift, 1);
      onBurstReady();
      return;
    }

    let startTime = 0;
    let launched = false;

    const tick = (now: number) => {
      if (startTime === 0) startTime = now;
      const rawT = Math.max(0, Math.min(1, (now - startTime) / durationMs));
      applyIntroVisuals(maxTravel, maxTravel, thumbShift, rawT);

      if (!launched && rawT >= 0.72) {
        launched = true;
        onBurstReady();
      }

      if (rawT < 1) {
        rafBurstRef.current = requestAnimationFrame(tick);
      } else {
        rafBurstRef.current = 0;
        if (!launched) {
          launched = true;
          onBurstReady();
        }
      }
    };

    rafBurstRef.current = requestAnimationFrame(tick);
  };

  const openReviewDeckPage = (originRect?: PacketOriginRect) => {
    if (onOpenReviews) {
      onOpenReviews(originRect);
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#/reviews';
    }
  };

  const triggerIntroSwapOpen = (initialOffset?: number) => {
    if (introSwappedRef.current) return;
    const { maxTravel, thumbShift } = measureIntroTrack();
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const slideMs = reduced ? 16 : PILL_SLIDE_DURATION_MS;
    const burstMs = reduced ? 10 : PACKET_TEAR_FLASH_MS;
    const startOffset =
      typeof initialOffset === 'number' ? initialOffset : slideOffsetRef.current;

    cancelIntroTimersAndRaf();
    introSwappedRef.current = true;
    setIntroSwapped(true);

    animateIntroSlide(startOffset, maxTravel, maxTravel, thumbShift, slideMs, () => {
      setPillTearing(true);
      animatePacketTearBurst(maxTravel, thumbShift, burstMs, () => {
        const rect = introTrackRef.current?.getBoundingClientRect();
        openReviewDeckPage(
          rect
            ? {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
              }
            : undefined,
        );
        resetTimerRef.current = window.setTimeout(() => {
          introSwappedRef.current = false;
          setIntroSwapped(false);
          setPillTearing(false);
          applyIntroVisuals(0, maxTravel, thumbShift, 0);
        }, 720);
      });
    });
  };

  // Scroll-driven dynamic glint / specular reflection on the glass jars
  useEffect(() => {
    const el = jarsRef.current;
    if (!el) return;

    let rafId = 0;
    const updateGlint = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const rawProgress = 1 - (rect.top + rect.height * 0.5) / vh;
      const progress = Math.max(0, Math.min(1, rawProgress));
      const shiftY = (progress - 0.5) * 18;
      const shiftX = (progress - 0.5) * 8;
      const angle = 115 + (progress - 0.5) * 32;
      const intensity = 0.36 + Math.sin(progress * Math.PI) * 0.3;

      el.style.setProperty('--jar-glint-shift', `${shiftY.toFixed(2)}px`);
      el.style.setProperty('--jar-glint-x', `${shiftX.toFixed(2)}px`);
      el.style.setProperty('--jar-glint-angle', `${angle.toFixed(1)}deg`);
      el.style.setProperty('--jar-glint-alpha', `${intensity.toFixed(2)}`);
    };

    const onScroll = () => {
      if (rafId === 0) {
        rafId = requestAnimationFrame(updateGlint);
      }
    };

    updateGlint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const el = jarsRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setJarsInView(true);
      return;
    }

    const enterObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setJarsInView(true);
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -24px 0px' },
    );

    const exitObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            setJarsInView(false);
          }
        }
      },
      { threshold: 0 },
    );

    enterObserver.observe(el);
    exitObserver.observe(el);
    return () => {
      enterObserver.disconnect();
      exitObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!jarsInView) {
      setFillActive(false);
      setIsPouring(false);
      setIsFilled(false);
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setFillActive(true);
      setIsPouring(false);
      setIsFilled(true);
      return;
    }

    setFillActive(false);
    setIsPouring(false);
    setIsFilled(false);

    // Wait briefly on very first load so the fill animation is visible after the splash loader clears
    const startDelay = hasHydratedRef.current ? 24 : 520;
    hasHydratedRef.current = true;

    let settleTimer: number | undefined;
    const startTimer = window.setTimeout(() => {
      setFillActive(true);
      setIsPouring(true);
      settleTimer = window.setTimeout(() => {
        setIsPouring(false);
        setIsFilled(true);
      }, JAR_FILL_DURATION_MS + JAR_STAGGER_MS * 3);
    }, startDelay);

    return () => {
      window.clearTimeout(startTimer);
      if (settleTimer !== undefined) {
        window.clearTimeout(settleTimer);
      }
    };
  }, [jarsInView, activeTab]);

  const metric = SIDEBAR_METRICS[activeTab];
  const activeTabIndex = Math.max(
    0,
    SIDEBAR_ITEMS.findIndex((item) => item.id === activeTab),
  );
  const activeTabLabel = SIDEBAR_ITEMS.find((item) => item.id === activeTab)?.label ?? 'All Game Reviews';
  const summary = getKeywordSummary(visibleKeywords.length, query);
  const verdictSlices: PieInputSlice[] = metric.verdictBars.map((bar) => ({
    label: bar.label,
    share: Number.parseFloat(bar.value) || 0,
    topColor:
      bar.label === 'Perfect' ? '#34d399' : bar.label === 'Okish' ? '#fbbf24' : '#fb7185',
    sideColor:
      bar.label === 'Perfect' ? '#047857' : bar.label === 'Okish' ? '#b45309' : '#be123c',
    textClass: bar.textClass,
  }));

  return (
    <section className="relative overflow-hidden pt-32 sm:pt-40 pb-10 text-center px-4">
      <div className="relative mx-auto max-w-3xl">
        <a
          ref={introTrackRef}
          href="#/reviews"
          data-testid="intro-swap-pill"
          data-swapped={introSwapped ? 'true' : 'false'}
          data-tearing={pillTearing ? 'true' : 'false'}
          aria-label="Introducing Fluid Flow: open the featured game reviews and partner sources page"
          onClick={(e) => {
            e.preventDefault();
            if (dragStateRef.current.moved) {
              dragStateRef.current.moved = false;
              return;
            }
            triggerIntroSwapOpen();
          }}
          onPointerDown={(e) => {
            if (introSwappedRef.current) return;
            const { maxTravel, thumbShift } = measureIntroTrack();
            if (rafSlideRef.current !== 0) {
              cancelAnimationFrame(rafSlideRef.current);
              rafSlideRef.current = 0;
            }
            dragStateRef.current = {
              active: true,
              startX: e.clientX,
              startOffset: slideOffsetRef.current,
              maxTravel,
              thumbShift,
              moved: false,
              currentOffset: slideOffsetRef.current,
            };
            e.currentTarget.setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            const st = dragStateRef.current;
            if (!st.active) return;
            const dx = e.clientX - st.startX;
            if (Math.abs(dx) > 4) st.moved = true;
            const nextOffset = Math.max(0, Math.min(st.maxTravel, st.startOffset + dx));
            st.currentOffset = nextOffset;
            applyIntroVisuals(nextOffset, st.maxTravel, st.thumbShift, 0);
          }}
          onPointerUp={() => {
            const st = dragStateRef.current;
            if (!st.active) return;
            st.active = false;
            if (!st.moved) return;
            const prog = st.currentOffset / Math.max(1, st.maxTravel);
            if (prog >= 0.45) {
              triggerIntroSwapOpen(st.currentOffset);
            } else {
              introSwappedRef.current = false;
              setIntroSwapped(false);
              setPillTearing(false);
              animateIntroSlide(st.currentOffset, 0, st.maxTravel, st.thumbShift, 300);
            }
          }}
          onPointerCancel={() => {
            const st = dragStateRef.current;
            st.active = false;
            st.moved = false;
            introSwappedRef.current = false;
            setIntroSwapped(false);
            setPillTearing(false);
            animateIntroSlide(st.currentOffset, 0, st.maxTravel, st.thumbShift, 260);
          }}
          style={{
            background:
              'linear-gradient(90deg, rgba(255, 255, 255, 0.080) 0%, rgba(212, 212, 216, 0.050) 0%, rgba(255, 255, 255, 0.05) 100%)',
          }}
          className="relative inline-flex select-none items-center overflow-visible rounded-full border border-white/25 bg-white/[0.06] text-xs sm:text-sm text-neutral-200 hover:border-white/50 transition-colors cursor-grab active:cursor-grabbing touch-none"
        >
          {/* Inner pocket slit revealed beneath the top seam as it unzips */}
          <span
            ref={tearSlotRef}
            data-testid="intro-tear-slot"
            aria-hidden="true"
            style={{
              width: '0%',
              height: '3px',
              opacity: 0,
              background:
                'radial-gradient(ellipse at 50% 100%, rgba(52, 211, 153, 0.55) 0%, rgba(0, 0, 0, 0.96) 72%)',
              boxShadow: 'inset 0 1px 4px rgba(52, 211, 153, 0.45)',
            }}
            className="pointer-events-none absolute left-2 top-0 z-[5] rounded-full"
          />
          {/* Top rim strip lifting cleanly along the unzipped span */}
          <span
            ref={tearLipRef}
            data-testid="intro-tear-lip"
            aria-hidden="true"
            style={{
              width: '0%',
              opacity: 0,
              transform: 'translate3d(0, 0px, 0)',
            }}
            className="pointer-events-none absolute left-0 -top-[1px] z-20 h-[10px] rounded-tl-full border-t border-white/75"
          />
          {/* Sleek luminous top-seam split behind the Intro thumb */}
          <span
            ref={tearSeamRef}
            data-testid="intro-tear-seam"
            aria-hidden="true"
            style={{
              width: '0%',
              opacity: 0,
              background:
                'linear-gradient(90deg, rgba(167, 243, 208, 0.25) 0%, #34d399 55%, #ffffff 100%)',
              boxShadow:
                '0 0 12px rgba(52, 211, 153, 0.92), 0 0 6px rgba(255, 255, 255, 0.85)',
            }}
            className="pointer-events-none absolute left-1 -top-[1px] z-20 h-[2px] rounded-full"
          />
          {/* Crisp white-emerald light flash across the top seam on full open */}
          <span
            ref={tearFlashRef}
            data-testid="intro-tear-flash"
            aria-hidden="true"
            style={{
              opacity: 0,
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.98) 0%, rgba(167, 243, 208, 0.72) 42%, transparent 76%)',
              filter: 'blur(2px)',
            }}
            className="pointer-events-none absolute -inset-x-2 -top-2 z-30 h-4 rounded-full"
          />
          <span className="relative z-10 inline-flex items-center gap-2 overflow-hidden rounded-full py-1 pl-1 pr-3">
            <span
              ref={introThumbRef}
              data-testid="intro-swap-thumb"
              style={{
                transform: 'translate3d(0.0px, 0, 0)',
                willChange: 'transform',
              }}
              className="relative z-10 rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-[0_0_16px_rgba(16,185,129,0.75)]"
            >
              Intro
            </span>
            <span
              ref={introTextRef}
              style={{
                transform: 'translate3d(0.0px, 0, 0)',
                willChange: 'transform',
              }}
              className="btn-shine inline-flex items-center gap-1.5"
            >
              Introducing Fluid Flow: One-stop game reviews{' '}
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300" aria-hidden="true" />
            </span>
          </span>
        </a>

        <h1
          style={{ fontFamily: "'Clash Display', sans-serif" }}
          className="mt-7 text-5xl sm:text-7xl font-bold tracking-tight leading-[1.04]"
        >
          <span className="text-white">Every game review,</span>
          <br />
          <span className="grad-text">in one fluid flow.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-neutral-400 leading-relaxed">
          Introducing Fluid Flow, the one-stop game review website showing every review in one place, rated on Story, Graphics, and Action with simple Perfect, Okish, or Time Waste verdicts and smart game suggestions.
        </p>

        <a
          href="#cta"
          className="btn-purple mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-black"
        >
          Explore Fluid Flow
        </a>
      </div>

      <div className="relative mx-auto mt-16 max-w-4xl reveal in">
        <div
          className="absolute -inset-x-8 -top-10 h-64 glow-backdrop rounded-full pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative rounded-2xl border border-[#262626] bg-[#0b0b0b] shadow-[0_0_24px_-5px_rgba(255,255,255,0.06),0_28px_80px_-20px_rgba(0,0,0,0.92)] text-left">
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
            aria-hidden="true"
          />

          <div className="flex items-center gap-3 border-b border-[#262626] bg-[#141414]/70 px-4 py-3 rounded-t-2xl">
            <div>
              <div
                role="button"
                tabIndex={0}
                data-testid="dashboard-mobile-menu-btn"
                aria-expanded={mobileSidebarOpen}
                aria-controls="dashboard-aside-menu"
                aria-label={mobileSidebarOpen ? 'Close review hub menu' : 'Open review hub menu'}
                onClick={() => setMobileSidebarOpen((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setMobileSidebarOpen((prev) => !prev);
                  }
                }}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 transition-all duration-300 active:scale-95 md:active:scale-100 cursor-pointer md:cursor-default md:border-transparent md:bg-transparent md:p-0 ${
                  mobileSidebarOpen
                    ? 'border-white/50 bg-[#171717] shadow-[0_0_16px_-4px_rgba(255,255,255,0.28)]'
                    : 'border-[#262626] bg-[#0b0b0b] hover:border-white/35'
                }`}
              >
                <span className="window-dot-bounce h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="window-dot-bounce h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="window-dot-bounce h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              </div>
            </div>

            <div className="ml-2 min-w-0">
              <p className="text-xs font-semibold text-white">{activeTabLabel}</p>
              <p className="text-[10px] text-[#a3a3a3]">fluidflow.games</p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div id="di-dashboard-slot" className="hidden md:flex">
                {!isMobile && (
                  <DynamicIsland
                    isOpen={diOpen}
                    query={query}
                    matchCount={visibleKeywords.length}
                    visibleKeywords={visibleKeywords}
                    recentSearches={recentSearches}
                    onOpen={onOpenDi}
                    onClose={onCloseDi}
                    onQueryChange={onQueryChange}
                    onCommitSearch={onCommitSearch}
                    onRemoveRecentSearch={onRemoveRecentSearch}
                    onClearRecentSearches={onClearRecentSearches}
                  />
                )}
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-white to-neutral-400 text-[10px] font-bold text-black">
                FF
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            <aside
              ref={asideHostRef}
              id="dashboard-aside-menu"
              data-testid="dashboard-aside-menu"
              data-open={mobileSidebarOpen ? 'true' : 'false'}
              className={`nimbus-surface-host dashboard-aside-drawer ${
                mobileSidebarOpen ? 'is-open' : ''
              } relative w-full md:w-52 shrink-0 md:border-r border-[#262626] bg-[#050505] px-3 py-3 text-[12px] md:rounded-bl-2xl`}
              aria-label="Review hub sections"
            >
              <div className="dashboard-aside-inner relative z-10">
                <div className="mb-2 flex items-center justify-between px-1 md:hidden">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                    Hub Features
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-[#a3a3a3] hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                {SIDEBAR_ITEMS.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  const isPlayingFx = !isMobile && asideFx.index === idx && asideFx.seq > 0;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        asideItemRefs.current[idx] = el;
                      }}
                      type="button"
                      aria-current={isSelected ? 'page' : undefined}
                      style={{ ['--item-i' as string]: idx }}
                      onClick={() => {
                        setActiveTab(item.id);
                        setAsideFx((prev) => ({ index: idx, seq: prev.seq + 1 }));
                        setMobileSidebarOpen(false);
                      }}
                      className={`dashboard-aside-item ${idx > 0 ? 'mt-1 ' : ''}relative z-10 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#171717] border border-[#262626] md:bg-transparent md:border-transparent font-medium text-white md:text-white'
                          : 'text-[#a3a3a3] hover:bg-[#171717]/70 md:hover:bg-transparent hover:text-white'
                      }`}
                    >
                      <span
                        className={`nv-ico ${isSelected ? 'md:text-white' : ''}`}
                        key={isPlayingFx ? asideFx.seq : 0}
                        data-fx={isPlayingFx ? item.fx : undefined}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <LiquidWaterSurface
                hostRef={asideHostRef}
                itemRefs={asideItemRefs}
                activeIndex={activeTabIndex}
                orientation="vertical"
                tone="mono"
                borderRadius={4}
                enabled={!isMobile}
                rippleSignal={asideFx}
              />
            </aside>

            <div className="min-w-0 flex-1 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 rounded-lg border border-[#262626] bg-[#141414] px-3 py-1.5 text-[11px] text-[#a3a3a3]">
                  <Calendar className="h-3 w-3" aria-hidden="true" /> Story · Graphics · Action
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" /> One-Stop Hub
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="chart in rounded-xl border border-[#262626] bg-[#060606]/85 p-4 hover:border-white/40 transition-colors">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11px] text-[#a3a3a3]">{metric.visibilityLabel}</p>
                    <p className="flex items-baseline gap-1.5 text-base font-bold text-white tabular-nums">
                      <AnimatedCounter
                        to={metric.visibilityVal}
                        decimals={metric.visibilityDec}
                        suffix={metric.visibilitySuf}
                      />
                      <span className="text-[10px] font-semibold text-neutral-300">
                        {metric.visibilityDelta}
                      </span>
                    </p>
                  </div>

                  <div
                    ref={jarsRef}
                    data-testid="rating-water-jars"
                    data-filled={isFilled ? 'true' : 'false'}
                    data-pouring={isPouring ? 'true' : 'false'}
                    data-inview={jarsInView ? 'true' : 'false'}
                    className="relative mt-2.5 pt-1"
                    role="img"
                    aria-label="Bar graph of Story, Graphics, Action, and Overall ratings"
                  >
                    <div
                      className="pointer-events-none absolute inset-x-0 top-1 h-[62px] flex flex-col justify-between"
                      aria-hidden="true"
                    >
                      <span className="border-t border-white/[0.05]" />
                      <span className="border-t border-white/[0.05]" />
                      <span className="border-t border-white/[0.08]" />
                    </div>
                    <div className="relative flex items-end gap-2.5 h-[62px]">
                      {metric.ratingBars.map((bar, idx) => {
                        const targetHeight = Math.round(bar.pct * JAR_FILL_SCALE);
                        return (
                          <div key={bar.label} className="flex-1 flex flex-col items-center justify-end h-full">
                            <span className="mb-1 text-[10px] font-semibold text-neutral-200 tabular-nums leading-none">
                              {bar.value}
                            </span>
                            <div
                              className={`jar-vessel w-full max-w-[32px] h-11 flex items-end justify-center overflow-hidden ${
                                isPouring ? 'is-pouring' : ''
                              }`}
                              style={{ ['--pour-delay' as string]: `${idx * JAR_STAGGER_MS}ms` }}
                            >
                              <div
                                className={`bar jar-water w-full ${fillActive ? 'is-filled' : ''} ${
                                  isPouring ? 'is-pouring' : ''
                                }`}
                                style={{
                                  height: fillActive ? `${targetHeight}%` : '0%',
                                  ['--fill-height' as string]: `${targetHeight}%`,
                                  ['--fill-duration' as string]: `${JAR_FILL_DURATION_MS}ms`,
                                  ['--fill-delay' as string]: `${idx * JAR_STAGGER_MS}ms`,
                                  ['--jar-delay' as string]: `${idx * -0.65}s`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2.5">
                      {metric.ratingBars.map((bar) => (
                        <span
                          key={bar.label}
                          className="flex-1 truncate text-center text-[10px] text-neutral-400"
                        >
                          {bar.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="chart in rounded-xl border border-[#1e2e25] bg-[#080808]/85 p-4 hover:border-[#34d399]/40 transition-colors">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11px] text-[#a3a3a3]">{metric.kwLabel}</p>
                    <p className="flex items-baseline gap-1.5 text-base font-bold text-white tabular-nums">
                      <AnimatedCounter
                        to={metric.kwVal}
                        decimals={metric.kwDec}
                        suffix={metric.kwSuf}
                      />
                      <span className="text-[10px] font-semibold text-[#34d399]">
                        {metric.kwDelta}
                      </span>
                    </p>
                  </div>

                  <FluidPie3D slices={verdictSlices} activeKey={activeTab} />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#262626] bg-[#060606]/85 p-4 hover:border-white/40 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-[#a3a3a3]" id="kw-head">
                    {summary.heading}
                  </p>
                  <span className="text-[10px] text-[#a3a3a3]" id="kw-sub">
                    {summary.subtitle}
                  </span>
                </div>

                <div className="mt-3 space-y-2.5 text-[12px]" id="kw-list">
                  {visibleKeywords.map((kw) => {
                    const verdictClass =
                      kw.verdict === 'Perfect'
                        ? 'bg-[#10b981]/15 text-[#34d399] border border-[#34d399]/30'
                        : kw.verdict === 'Okish'
                          ? 'bg-[#f59e0b]/15 text-amber-300 border border-[#f59e0b]/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-400/30';
                    return (
                      <div key={kw.term} className="kw-row flex items-center gap-3" data-kw={kw.term}>
                        <div className="w-40 sm:w-48 shrink-0">
                          <p className="truncate font-semibold text-white">{kw.term}</p>
                          <p className="truncate text-[10px] text-[#a3a3a3]">
                            Story {kw.story} · Graphics {kw.graphics} · Action {kw.action}
                          </p>
                        </div>
                        <div className="hidden sm:block h-1.5 flex-1 rounded-full bg-white/10">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-neutral-500 to-white"
                            style={{ width: `${kw.widthPct}%` }}
                          />
                        </div>
                        <span className="hidden md:inline truncate text-[10px] text-neutral-400">
                          {kw.suggestion}
                        </span>
                        <span className={`ml-auto sm:ml-0 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${verdictClass}`}>
                          {kw.verdict}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {visibleKeywords.length === 0 && (
                  <div
                    id="kw-empty"
                    className="mt-2.5 rounded-xl border border-dashed border-[#262626] p-3 text-center text-[11px] text-[#a3a3a3]"
                  >
                    No game reviews match your search.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
