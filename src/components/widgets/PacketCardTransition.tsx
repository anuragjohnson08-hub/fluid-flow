import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  PACKET_CARD_FLIGHT_MS,
  computePacketCardFrame,
  type PacketOriginRect,
} from '../../utils/appRoute';
import { ReviewDeckSection } from '../sections/ReviewDeckSection';

interface PacketCardTransitionProps {
  originRect: PacketOriginRect;
  onComplete: () => void;
}

export function PacketCardTransition({
  originRect,
  onComplete,
}: PacketCardTransitionProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const viewportRef = useRef({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  });

  useLayoutEffect(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    viewportRef.current = viewport;

    const applyFrame = (t: number) => {
      const frame = computePacketCardFrame(t, originRect, viewport);
      const backdrop = backdropRef.current;
      const card = cardRef.current;
      const inner = innerRef.current;

      if (backdrop) {
        backdrop.style.opacity = frame.backdropOpacity.toFixed(3);
      }

      if (card) {
        card.setAttribute('data-phase', frame.phase);
        card.style.left = `${frame.left.toFixed(1)}px`;
        card.style.top = `${frame.top.toFixed(1)}px`;
        card.style.width = `${frame.width.toFixed(1)}px`;
        card.style.height = `${frame.height.toFixed(1)}px`;
        card.style.borderRadius = `${frame.borderRadius.toFixed(1)}px`;
        card.style.transform = `scale(${frame.scale.toFixed(4)})`;
        card.style.clipPath =
          frame.clipBottomPx > 0.5
            ? `inset(0px 0px ${frame.clipBottomPx.toFixed(1)}px 0px round ${frame.borderRadius.toFixed(1)}px)`
            : 'none';
        card.style.borderColor = `rgba(255, 255, 255, ${(0.28 * frame.borderOpacity).toFixed(3)})`;
        card.style.boxShadow =
          frame.borderOpacity > 0.02
            ? `0 28px 80px -12px rgba(0, 0, 0, ${(0.88 * frame.borderOpacity).toFixed(3)}), 0 0 38px -8px rgba(52, 211, 153, ${(0.34 * frame.borderOpacity).toFixed(3)})`
            : 'none';
      }

      if (inner) {
        inner.style.width = `${viewport.width}px`;
        inner.style.height = `${viewport.height}px`;
        inner.style.transform = `scale(${frame.contentScale.toFixed(4)})`;
      }
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      applyFrame(1);
      const id = window.setTimeout(() => onCompleteRef.current(), 16);
      return () => window.clearTimeout(id);
    }

    applyFrame(0);

    let rafId = 0;
    let startTime = 0;
    let done = false;

    const tick = (now: number) => {
      if (startTime === 0) startTime = now;
      const rawT = Math.max(0, Math.min(1, (now - startTime) / PACKET_CARD_FLIGHT_MS));
      applyFrame(rawT);

      if (rawT < 1) {
        rafId = requestAnimationFrame(tick);
      } else if (!done) {
        done = true;
        onCompleteRef.current();
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
    };
  }, [originRect]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      data-testid="packet-card-transition"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[45]"
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/90 backdrop-blur-[3px]"
        style={{ opacity: 0.08 }}
      />

      <div
        ref={cardRef}
        data-testid="packet-card-portal"
        data-phase="pull"
        className="fixed overflow-hidden border bg-[#050505]"
        style={{
          left: `${originRect.left}px`,
          top: `${originRect.top}px`,
          width: `${Math.min(480, Math.max(240, originRect.width * 0.94))}px`,
          height: '260px',
          borderRadius: '16px',
          transformOrigin: 'center center',
          willChange: 'transform, left, top, width, height, clip-path, border-radius',
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent"
          aria-hidden="true"
        />
        <div
          ref={innerRef}
          style={{
            width: `${viewportRef.current.width}px`,
            height: `${viewportRef.current.height}px`,
            transformOrigin: 'top left',
            willChange: 'transform',
          }}
          className="relative overflow-hidden bg-black"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at bottom, #0e0e0e 0%, #000000 100%)',
            }}
          />
          <div className="relative z-10">
            <ReviewDeckSection preview />
          </div>
        </div>
      </div>
    </div>
  );
}
