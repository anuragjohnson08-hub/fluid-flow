import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LANYARD_DEMO_TEAM } from "../../data/lanyardDemoTeam";
import {
  PILL_SLIDE_DURATION_MS,
  computeBackSliderFrame,
  evaluateRetractEase,
  evaluateSpringEase,
} from "../../utils/appRoute";
import { TeamLanyardRail } from "../ui/team-lanyard-rail";

interface ReviewDeckSectionProps {
  onBackHome?: () => void;
  preview?: boolean;
}

export function ReviewDeckSection({ onBackHome, preview = false }: ReviewDeckSectionProps) {
  const trackRef = useRef<HTMLAnchorElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
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
    maxTravel: 180,
    thumbShift: 58,
    moved: false,
    currentOffset: 0,
  });
  const slideOffsetRef = useRef(0);
  const rafSlideRef = useRef<number>(0);
  const [swapped, setSwapped] = useState(false);
  const swappedRef = useRef(false);
  const slideTimerRef = useRef<number | undefined>(undefined);
  const resetTimerRef = useRef<number | undefined>(undefined);

  const cancelTimersAndRaf = useCallback(() => {
    if (rafSlideRef.current !== 0) {
      cancelAnimationFrame(rafSlideRef.current);
      rafSlideRef.current = 0;
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

  useEffect(() => () => cancelTimersAndRaf(), [cancelTimersAndRaf]);

  const measureTrack = () => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return { maxTravel: 180, thumbShift: 58 };
    const maxTravel = Math.max(80, track.clientWidth - thumb.offsetWidth - 8);
    const thumbShift = thumb.offsetWidth + 6;
    return { maxTravel, thumbShift };
  };

  const applyVisuals = (travelPx: number, maxTravel: number, thumbShift: number) => {
    slideOffsetRef.current = travelPx;
    const frame = computeBackSliderFrame(travelPx, maxTravel, thumbShift);
    const thumb = thumbRef.current;
    const text = textRef.current;
    const track = trackRef.current;

    if (thumb) {
      thumb.style.transform = `translate3d(${frame.thumbTranslateX.toFixed(1)}px, 0, 0)`;
    }
    if (text) {
      text.style.transform = `translate3d(${frame.textShiftPx.toFixed(1)}px, 0, 0)`;
    }
    if (track) {
      track.style.background = frame.trackBackground;
    }
  };

  const animateSlide = (
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

    if (durationMs <= 20 || typeof window === "undefined") {
      applyVisuals(toOffset, maxTravel, thumbShift);
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
      applyVisuals(nextTravel, maxTravel, thumbShift);

      if (rawT < 1) {
        rafSlideRef.current = requestAnimationFrame(tick);
      } else {
        rafSlideRef.current = 0;
        applyVisuals(toOffset, maxTravel, thumbShift);
        onDone?.();
      }
    };

    rafSlideRef.current = requestAnimationFrame(tick);
  };

  const navigateHomePage = () => {
    if (onBackHome) {
      onBackHome();
    } else if (typeof window !== "undefined") {
      window.location.hash = "#/";
    }
  };

  const triggerBackSwap = (initialOffset?: number) => {
    if (swappedRef.current) return;
    const { maxTravel, thumbShift } = measureTrack();
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slideMs = reduced ? 16 : PILL_SLIDE_DURATION_MS;
    const startOffset =
      typeof initialOffset === "number" ? initialOffset : slideOffsetRef.current;

    cancelTimersAndRaf();
    swappedRef.current = true;
    setSwapped(true);

    animateSlide(startOffset, maxTravel, maxTravel, thumbShift, slideMs, () => {
      slideTimerRef.current = window.setTimeout(
        () => {
          navigateHomePage();
          resetTimerRef.current = window.setTimeout(() => {
            swappedRef.current = false;
            setSwapped(false);
            applyVisuals(0, maxTravel, thumbShift);
          }, 420);
        },
        reduced ? 10 : 40,
      );
    });
  };

  return (
    <section
      id={preview ? undefined : "review-deck"}
      data-testid={preview ? "review-deck-preview" : "review-deck-section"}
      className={`relative pt-28 pb-12 sm:pt-32 ${preview ? "pointer-events-none select-none" : ""}`}
    >
      <div className="mx-auto max-w-5xl px-4 text-center mb-2">
        <div className="mb-5 flex justify-center">
          <a
            ref={trackRef}
            href="#/"
            draggable={false}
            data-testid="review-deck-back-home"
            data-swapped={swapped ? "true" : "false"}
            aria-label="Back to Home: slide left or click to return to the home page"
            onDragStart={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              if (dragStateRef.current.moved) {
                dragStateRef.current.moved = false;
                return;
              }
              triggerBackSwap();
            }}
            onPointerDown={(e) => {
              if (swappedRef.current) return;
              const { maxTravel, thumbShift } = measureTrack();
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
              const dx = st.startX - e.clientX;
              if (Math.abs(dx) > 4) st.moved = true;
              const nextOffset = Math.max(0, Math.min(st.maxTravel, st.startOffset + dx));
              st.currentOffset = nextOffset;
              applyVisuals(nextOffset, st.maxTravel, st.thumbShift);
            }}
            onPointerUp={() => {
              const st = dragStateRef.current;
              if (!st.active) return;
              st.active = false;
              if (!st.moved) return;
              const prog = st.currentOffset / Math.max(1, st.maxTravel);
              if (prog >= 0.45) {
                triggerBackSwap(st.currentOffset);
              } else {
                swappedRef.current = false;
                setSwapped(false);
                animateSlide(st.currentOffset, 0, st.maxTravel, st.thumbShift, 300);
              }
            }}
            onPointerCancel={() => {
              const st = dragStateRef.current;
              st.active = false;
              st.moved = false;
              swappedRef.current = false;
              setSwapped(false);
              animateSlide(st.currentOffset, 0, st.maxTravel, st.thumbShift, 260);
            }}
            style={{
              background:
                "linear-gradient(270deg, rgba(255, 255, 255, 0.140) 0%, rgba(212, 212, 216, 0.080) 0%, rgba(255, 255, 255, 0.1) 100%)",
            }}
            className="relative inline-flex min-w-[244px] sm:min-w-[272px] max-w-full select-none items-center justify-between gap-3 overflow-hidden rounded-full border border-white/25 bg-white/[0.06] py-1 pl-3.5 pr-1 text-xs sm:text-sm text-neutral-200 hover:border-white/50 transition-colors cursor-grab active:cursor-grabbing touch-none"
          >
            <span
              ref={textRef}
              style={{
                transform: "translate3d(0.0px, 0, 0)",
                willChange: "transform",
              }}
              className="btn-shine inline-flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-neutral-300" aria-hidden="true" />
              <span>Back to Home</span>
            </span>
            <span
              ref={thumbRef}
              data-testid="back-home-swap-thumb"
              style={{
                transform: "translate3d(0.0px, 0, 0)",
                willChange: "transform",
              }}
              className="relative z-10 rounded-full bg-gradient-to-r from-white to-neutral-300 px-2.5 py-0.5 text-[11px] font-bold text-black shadow-[0_0_16px_rgba(255,255,255,0.45)]"
            >
              Home
            </span>
          </a>
        </div>
        <p className="reveal in text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
          Scroll-Stacking Showcase
        </p>
        <h2
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          className="reveal in mt-1.5 text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
        >
          Featured Reviews &amp; Partner Sources
        </h2>
        <p className="reveal in mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[#a3a3a3] sm:text-base">
          Scroll to deal through Fluid Flow’s Story, Graphics, and Action verdicts alongside the partner game review websites powering every score.
        </p>
      </div>

      <TeamLanyardRail
        items={LANYARD_DEMO_TEAM}
        eyebrow="Meet the team · Eight people"
        heading="A team wall you can flip through, right on the page."
        caption="Scroll or drag the infinite rail, pull a badge down, click to flip it."
        autoplay={!preview}
        loop={!preview}
        className="mt-8 border-y border-[#262626]"
      />
    </section>
  );
}
