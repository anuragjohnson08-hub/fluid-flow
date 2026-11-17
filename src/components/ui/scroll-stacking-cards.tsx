import { useRef, type ReactNode } from "react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  aboveCount,
  arrived,
  formatDeckHost,
  rawAboveCount,
} from "@/utils/deckMotion";

export type Project = {
  id?: string;
  name: string;
  /** One sentence for screen readers: what the card showcases. */
  summary: string;
  url: string;
  /** Short address or label shown on the cut-out corner button. */
  display?: string;
  /** Optional screenshot URL of the site/game, ideally 16:9. */
  image?: string;
  /** Optional rich rendered card UI instead of a static image. */
  renderContent?: ReactNode;
  /** The arrow button's accent color. */
  accent: string;
};

export const DEFAULT_PROJECTS: Project[] = [];

export type ProjectDeckProps = {
  projects?: Project[];
  /** The page ground; the cut-out corner that holds the visit button is filled with it. */
  ground?: string;
  /** Controls text contrast inside the cut-out corner badge. */
  lightGround?: boolean;
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
};

export function ProjectDeck({
  projects = DEFAULT_PROJECTS,
  ground = "#1A1F2B",
  lightGround = false,
  ariaLabel = "Featured Game Reviews and Partner Sources",
  className,
  children,
}: ProjectDeckProps) {
  const deck = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion() ?? false;
  const count = projects.length;
  const { scrollYProgress } = useScroll({
    target: deck,
    offset: ["start start", "end end"],
  });

  // Light, critically damped smoothing: follows scroll closely without overshoot
  const progress = useSpring(scrollYProgress, {
    stiffness: 380,
    damping: 48,
    mass: 0.35,
  });

  return (
    <MotionConfig reducedMotion="user">
      {/* One screen of scroll per card; the stage stays pinned while cards deal onto it */}
      <section
        ref={deck}
        data-testid="review-stack-deck"
        className={cn("relative w-full", className)}
        style={{ height: `${Math.max(1, count) * 100}svh` }}
        aria-label={ariaLabel}
      >
        <div className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden px-4 [perspective:1800px] sm:px-10 lg:px-14">
          {projects.map((p, i) => (
            <DeckCard
              key={p.id ?? p.url}
              p={p}
              i={i}
              count={count}
              progress={progress}
              still={reduce}
              ground={ground}
              lightGround={lightGround}
            />
          ))}
        </div>
      </section>
      {children}
    </MotionConfig>
  );
}

function DeckCard({
  p,
  i,
  count,
  progress,
  still,
  ground,
  lightGround,
}: {
  p: Project;
  i: number;
  count: number;
  progress: MotionValue<number>;
  still: boolean;
  ground: string;
  lightGround: boolean;
}) {
  const y = useTransform(
    progress,
    (v) => `${(1 - arrived(i, v, count)) * 108 - aboveCount(i, v, count) * 5}svh`,
  );
  const rotateX = useTransform(
    progress,
    (v) => -(1 - arrived(i, v, count)) * 28 + aboveCount(i, v, count) * 5,
  );
  const scale = useTransform(
    progress,
    (v) => 0.9 + 0.1 * arrived(i, v, count) - aboveCount(i, v, count) * 0.05,
  );
  const filter = useTransform(progress, (v) => {
    const abv = aboveCount(i, v, count);
    const arr = arrived(i, v, count);
    const px = (1 - arr) ** 2 * 10 + abv * 1.0;
    return px < 0.15 ? "none" : `blur(${px.toFixed(2)}px)`;
  });
  const visibility = useTransform(progress, (v) => {
    const rawAbv = rawAboveCount(i, v, count);
    const arr = arrived(i, v, count);
    return rawAbv < 3.4 && (i === 0 || arr > 0.002) ? "visible" : "hidden";
  });
  const dim = useTransform(progress, (v) => aboveCount(i, v, count) * 0.16);
  const stillY = useTransform(progress, (v) =>
    arrived(i, v, count) >= 0.5 ? "0svh" : "110svh",
  );

  return (
    <motion.article
      data-testid={`review-deck-card-${i}`}
      aria-label={`${p.name}: ${p.summary}`}
      className="col-start-1 row-start-1 mt-[4svh] w-[min(100%,calc(74svh*16/9),1280px)] origin-[50%_25%] will-change-transform max-sm:w-full"
      style={{
        zIndex: i + 1,
        ...(still
          ? { y: stillY }
          : { y, rotateX, scale, filter, visibility }),
      }}
    >
      <div
        className="relative overflow-hidden rounded-[24px] border border-[#2A9D8F]/30 shadow-[0_32px_64px_-28px_rgba(0,0,0,0.9),0_0_28px_-12px_rgba(42,157,143,0.22)]"
        style={{ background: ground }}
      >
        {p.renderContent ? (
          <div className="aspect-[16/9] w-full max-sm:aspect-[4/5]">
            {p.renderContent}
          </div>
        ) : p.image ? (
          <img
            src={p.image}
            alt={`The ${formatDeckHost(p.url)} preview`}
            loading={i < 2 ? "eager" : "lazy"}
            decoding="async"
            className="block aspect-[16/9] w-full object-cover object-top max-sm:aspect-[4/5]"
          />
        ) : null}

        <VisitCorner p={p} ground={ground} lightGround={lightGround} />

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[#1A1F2B]"
          style={{ opacity: still ? 0 : dim }}
        />
      </div>
    </motion.article>
  );
}

/** The visit button, set into a concave corner cut out of the card. */
function VisitCorner({
  p,
  ground,
  lightGround,
}: {
  p: Project;
  ground: string;
  lightGround: boolean;
}) {
  const R = 18;
  const corner = (
    <svg aria-hidden width={R} height={R} viewBox={`0 0 ${R} ${R}`} className="block">
      <path d={`M${R} 0 V${R} H0 A${R} ${R} 0 0 0 ${R} 0 Z`} fill={ground} />
    </svg>
  );

  return (
    <div className="absolute right-0 bottom-0 z-10">
      <div className="pointer-events-none absolute right-0 bottom-full">{corner}</div>
      <div className="pointer-events-none absolute right-full bottom-0">{corner}</div>
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${p.name} at ${formatDeckHost(p.url)} (opens in a new tab)`}
        className={cn(
          "group flex items-center gap-3.5 rounded-tl-[20px] py-2.5 pr-1.5 pl-4 outline-none sm:gap-5 sm:py-3.5 sm:pr-2 sm:pl-6",
          lightGround ? "text-[#111318]" : "text-[#FAF3E0]",
        )}
        style={{ background: ground }}
      >
        <span className="flex flex-col leading-tight text-left">
          <span className="text-[14px] font-semibold tracking-[-0.015em] sm:text-[18px]">
            {p.name}
          </span>
          <span
            className={cn(
              "text-[11px] underline-offset-4 group-hover:underline group-focus-visible:underline sm:text-[14px]",
              lightGround ? "text-[#3B3F48]" : "text-[#FAF3E0]/75",
            )}
          >
            {p.display ?? formatDeckHost(p.url)}
          </span>
        </span>
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full text-[#1A1F2B] transition-transform duration-200 ease-out group-hover:rotate-45 group-active:scale-90 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 sm:size-[48px]"
          style={{ background: p.accent, outlineColor: p.accent }}
        >
          <ArrowUpRight className="size-4 sm:size-5" strokeWidth={2.3} aria-hidden="true" />
        </span>
      </a>
    </div>
  );
}
