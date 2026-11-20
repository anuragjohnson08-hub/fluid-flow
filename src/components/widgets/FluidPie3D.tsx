import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { buildPie3DSlices, type PieInputSlice } from '../../utils/pie3d';

interface FluidPie3DProps {
  slices: PieInputSlice[];
  activeKey: string;
}

export function FluidPie3D({ slices, activeKey }: FluidPie3DProps) {
  const uid = useId().replace(/:/g, '');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [sweep, setSweep] = useState(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setHasEntered(true);
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsVisible(entry.isIntersecting);
          if (entry.isIntersecting) {
            setHasEntered(true);
          }
        }
      },
      { threshold: 0.35, rootMargin: '0px 0px -16px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEntered) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setSweep(1);
      return;
    }

    setSweep(0.02);
    const start = performance.now();
    const duration = 820;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3.2);
      setSweep(eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasEntered, activeKey]);

  const geometry = useMemo(
    () =>
      buildPie3DSlices(slices, {
        cx: 66,
        cy: 34,
        rx: 50,
        ry: 20,
        depth: 12,
        startAngle: -Math.PI * 0.68,
        sweep,
      }),
    [slices, sweep],
  );

  const shadeId = `ff-pie-shade-${uid}`;
  const specId = `ff-pie-spec-${uid}`;

  return (
    <div
      ref={rootRef}
      data-testid="fluid-3d-pie"
      data-loaded={sweep >= 0.99 ? 'true' : 'false'}
      data-inview={isVisible ? 'true' : 'false'}
      className="mt-2 flex items-center gap-3"
    >
      <div className="relative h-[78px] w-[128px] shrink-0">
        <svg
          viewBox="0 0 132 82"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label="3D pie graph of Perfect, Okish, and Time Waste verdicts"
        >
          <defs>
            <linearGradient id={shadeId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#05050a" stopOpacity="0.34" />
              <stop offset="48%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#05050a" stopOpacity="0.42" />
            </linearGradient>
            <radialGradient id={specId} cx="35%" cy="28%" r="68%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.16" />
            </radialGradient>
          </defs>

          {/* 3D pie drop shadow */}
          <ellipse cx="66" cy="50" rx="51" ry="19" fill="rgba(0,0,0,0.48)" />

          {/* Empty base ring while awaiting scroll reveal */}
          <ellipse
            cx="66"
            cy="34"
            rx="50"
            ry="20"
            fill="rgba(250,243,224,0.03)"
            stroke="rgba(42,157,143,0.22)"
            strokeWidth="1"
          />

          {/* 3D extruded cylindrical side walls */}
          <g>
            {geometry.map((slice) =>
              slice.sidePaths.map((d, idx) => (
                <path
                  key={`${slice.label}-side-${idx}`}
                  d={d}
                  fill={slice.sideColor}
                  stroke="rgba(26,31,43,0.45)"
                  strokeWidth="0.6"
                />
              )),
            )}
            {geometry.map((slice) =>
              slice.sidePaths.map((d, idx) => (
                <path
                  key={`${slice.label}-shade-${idx}`}
                  d={d}
                  fill={`url(#${shadeId})`}
                  pointerEvents="none"
                />
              )),
            )}
          </g>

          {/* Top 3D pie faces */}
          <g>
            {geometry.map((slice) => (
              <path
                key={`${slice.label}-top`}
                d={slice.topPath}
                fill={slice.topColor}
                stroke="rgba(26,31,43,0.65)"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
            ))}
            {sweep > 0.05 && (
              <ellipse
                cx="66"
                cy="34"
                rx="49.6"
                ry="19.6"
                fill={`url(#${specId})`}
                pointerEvents="none"
              />
            )}
          </g>

          {/* Crisp top rim highlight */}
          <ellipse
            cx="66"
            cy="34"
            rx="50"
            ry="20"
            fill="none"
            stroke="rgba(250,243,224,0.22)"
            strokeWidth="0.75"
            pointerEvents="none"
          />
        </svg>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center justify-between gap-2 text-[10px]">
            <span className="flex items-center gap-1.5 min-w-0 text-[#FAF3E0]/85">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: slice.topColor }}
                aria-hidden="true"
              />
              <span className="truncate">{slice.label}</span>
            </span>
            <span className={`font-semibold tabular-nums shrink-0 ${slice.textClass}`}>
              {slice.share}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
