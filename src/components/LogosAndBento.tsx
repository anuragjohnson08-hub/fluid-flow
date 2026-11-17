import { ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { REVIEW_API_PROVIDERS } from '../data/reviewApis';
import { buildWallWavePath } from '../utils/bentoWave';

const INITIAL_TOP_WAVE = buildWallWavePath({
  startX: 112,
  startY: 48,
  endX: 154,
  endY: 47,
  phase: 0,
});

const INITIAL_BOTTOM_WAVE = buildWallWavePath({
  startX: 112,
  startY: 110,
  endX: 154,
  endY: 107,
  phase: 0.42,
});

const LOGOS = [
  {
    name: 'Story Rich',
    mark: (
      <path d="M4 12 L12 4 L12 10 L20 10 L20 14 L12 14 L12 20 Z" fill="currentColor" />
    ),
  },
  {
    name: 'Graphics Craft',
    mark: (
      <path
        d="M4 4 L12 12 L4 20 M20 4 L12 12 L20 20"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    ),
  },
  {
    name: 'Fast Action',
    mark: (
      <>
        <circle cx="8" cy="8" r="4" fill="currentColor" />
        <circle cx="16" cy="8" r="4" fill="currentColor" opacity=".7" />
        <circle cx="8" cy="16" r="4" fill="currentColor" opacity=".7" />
        <circle cx="16" cy="16" r="4" fill="currentColor" />
      </>
    ),
  },
  {
    name: 'Perfect Picks',
    mark: (
      <path
        d="M2 12 H7 L10 5 L14 19 L17 12 H22"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    name: 'Okish Titles',
    mark: (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M12 3 V21" stroke="currentColor" strokeWidth="2.5" />
      </>
    ),
  },
  {
    name: 'Time Waste Alerts',
    mark: (
      <path
        d="M12 3 L21 20 H3 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    name: 'Smart Suggestions',
    mark: (
      <path
        d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
        fill="currentColor"
      />
    ),
  },
  {
    name: 'One-Stop Hub',
    mark: (
      <path
        d="M4 8 H14 M4 16 H14 M17 6 L21 12 L17 18"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

const CREDIT_FLOAT_MOTION = [
  { offsetClass: 'sm:-translate-y-1', dur: '5.8s', delay: '0s', x: '2px', y: '-4px', featured: true },
  { offsetClass: 'sm:translate-y-1', dur: '6.6s', delay: '-1.4s', x: '-2.5px', y: '-3.5px', featured: false },
  { offsetClass: 'sm:-translate-y-1', dur: '6.1s', delay: '-2.8s', x: '2px', y: '-4.5px', featured: true },
  { offsetClass: 'sm:translate-y-0.5', dur: '7.0s', delay: '-0.9s', x: '-2px', y: '-3.5px', featured: true },
  { offsetClass: 'sm:-translate-y-0.5', dur: '5.5s', delay: '-3.3s', x: '2.5px', y: '-4px', featured: false },
  { offsetClass: 'sm:translate-y-1', dur: '6.4s', delay: '-2.1s', x: '-2px', y: '-4px', featured: false },
] as const;

export function LogosAndBento() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const creditsStageRef = useRef<HTMLDivElement | null>(null);
  const suggestWrapRef = useRef<HTMLDivElement | null>(null);
  const topWaveRef = useRef<SVGPathElement | null>(null);
  const bottomWaveRef = useRef<SVGPathElement | null>(null);
  const [mouseActive, setMouseActive] = useState(false);
  const [creditsVisible, setCreditsVisible] = useState(true);

  useEffect(() => {
    const stage = creditsStageRef.current;
    if (!stage || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        setCreditsVisible(entries.some((entry) => entry.isIntersecting));
      },
      { threshold: 0 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const wrap = suggestWrapRef.current;
    const topPath = topWaveRef.current;
    const bottomPath = bottomWaveRef.current;
    if (!wrap || !topPath || !bottomPath) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let rafId = 0;
    const rect = wrap.getBoundingClientRect();
    let isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
    const startTime = performance.now();

    const tick = (now: number) => {
      if (!isVisible) {
        rafId = 0;
        return;
      }
      // Slow traveling wave (~0.32 cycles/sec)
      const phase = ((now - startTime) / 1000) * 0.32;
      topPath.setAttribute(
        'd',
        buildWallWavePath({
          startX: 112,
          startY: 48,
          endX: 154,
          endY: 47,
          phase,
        }),
      );
      bottomPath.setAttribute(
        'd',
        buildWallWavePath({
          startX: 112,
          startY: 110,
          endX: 154,
          endY: 107,
          phase: phase + 0.42,
        }),
      );
      rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafId === 0 && isVisible) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    if (isVisible) {
      startLoop();
    }

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          isVisible = entries.some((entry) => entry.isIntersecting);
          if (isVisible) {
            startLoop();
          } else {
            stopLoop();
          }
        },
        { threshold: 0 },
      );
      observer.observe(wrap);
      return () => {
        stopLoop();
        observer.disconnect();
      };
    }

    isVisible = true;
    startLoop();
    return () => stopLoop();
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const secRect = sec.getBoundingClientRect();
    const sx = e.clientX - secRect.left;
    const sy = e.clientY - secRect.top;
    sec.style.setProperty('--section-mx', `${sx.toFixed(1)}px`);
    sec.style.setProperty('--section-my', `${sy.toFixed(1)}px`);

    const cards = sec.querySelectorAll<HTMLElement>('.logo-glow-card');
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--card-mx', `${(e.clientX - r.left).toFixed(1)}px`);
      card.style.setProperty('--card-my', `${(e.clientY - r.top).toFixed(1)}px`);
    });
  };

  return (
    <>
      <section
        ref={sectionRef}
        data-testid="logos-tracker-section"
        data-mouse-active={mouseActive ? 'true' : 'false'}
        onMouseEnter={(e) => {
          setMouseActive(true);
          handleMouseMove(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMouseActive(false)}
        className={`logos-tracker-section relative overflow-hidden px-4 py-16 ${
          mouseActive ? 'is-mouse-active' : ''
        }`}
      >
        <div className="relative z-10 mx-auto max-w-4xl reveal">
          <p className="text-center text-sm text-[#a3a3a3]">
            Everything Fluid Flow tracks across every game review
          </p>
          <div id="logos" className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {LOGOS.map((logo) => (
              <div
                key={logo.name}
                className="logo-glow-card relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-[#262626] bg-[#0b0b0b] px-4 py-5 text-[#a3a3a3] opacity-90 hover:-translate-y-1.5 hover:opacity-100 hover:text-white hover:bg-[#161616] hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.18)] transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" className="relative z-10 h-5 w-5 shrink-0" aria-hidden="true">
                  {logo.mark}
                </svg>
                <span className="relative z-10 text-sm font-bold tracking-tight">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="bento" className="px-4 py-16 scroll-mt-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="reveal mx-auto max-w-2xl text-center font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl font-bold tracking-tight text-white leading-snug">
            All game reviews in one stop, paired with honest ratings and tailored suggestions.
          </h2>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <article className="reveal group relative rounded-2xl border border-[#262626] bg-[#0b0b0b] p-6 shadow-[0_0_20px_-5px_rgba(255,255,255,0.05)] hover:-translate-y-1.5 hover:border-white/50 hover:shadow-[0_0_24px_rgba(255,255,255,0.18)] transition-all duration-300 overflow-hidden">
              <div className="flex h-44 items-center justify-center rounded-xl border border-[#262626] bg-[#060606]/85 p-2">
                <svg
                  viewBox="0 0 280 150"
                  className="h-40 w-full max-w-[280px]"
                  role="img"
                  aria-label="All 3 own ratings: Perfect, Okish, and Time Waste"
                >
                  <defs>
                    <linearGradient id="ringPerfect" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6EE7B7" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                    <linearGradient id="ringOkish" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FDE68A" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    <linearGradient id="ringWaste" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FDA4AF" />
                      <stop offset="100%" stopColor="#E11D48" />
                    </linearGradient>
                  </defs>

                  <ellipse cx="64" cy="128" rx="44" ry="7" fill="#10B981" opacity=".2" />

                  <g transform="rotate(-90 64 74)">
                    <circle
                      cx="64"
                      cy="74"
                      r="40"
                      fill="#060a08"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="9"
                    />
                    <circle
                      cx="64"
                      cy="74"
                      r="40"
                      fill="none"
                      stroke="url(#ringPerfect)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray="92 260"
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="64"
                      cy="74"
                      r="40"
                      fill="none"
                      stroke="url(#ringOkish)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray="71 260"
                      strokeDashoffset="-106"
                    />
                    <circle
                      cx="64"
                      cy="74"
                      r="40"
                      fill="none"
                      stroke="url(#ringWaste)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray="46 260"
                      strokeDashoffset="-191"
                    />
                  </g>

                  <text
                    x="64"
                    y="71"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="16"
                    fontWeight="800"
                  >
                    3
                  </text>
                  <text
                    x="64"
                    y="85"
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="8"
                    fontWeight="700"
                    letterSpacing="0.08em"
                  >
                    RATINGS
                  </text>

                  <g>
                    <rect
                      x="126"
                      y="22"
                      width="142"
                      height="30"
                      rx="8"
                      fill="#060a08"
                      stroke="rgba(52,211,153,0.4)"
                      strokeWidth="1"
                    />
                    <circle cx="141" cy="37" r="4" fill="#34D399" />
                    <text x="152" y="40.5" fill="#f9fafb" fontSize="11" fontWeight="700">
                      Perfect
                    </text>
                    <text
                      x="257"
                      y="40.5"
                      textAnchor="end"
                      fill="#6EE7B7"
                      fontSize="10"
                      fontWeight="700"
                    >
                      8.5–10
                    </text>

                    <rect
                      x="126"
                      y="59"
                      width="142"
                      height="30"
                      rx="8"
                      fill="#060a08"
                      stroke="rgba(251,191,36,0.38)"
                      strokeWidth="1"
                    />
                    <circle cx="141" cy="74" r="4" fill="#FBBF24" />
                    <text x="152" y="77.5" fill="#f9fafb" fontSize="11" fontWeight="700">
                      Okish
                    </text>
                    <text
                      x="257"
                      y="77.5"
                      textAnchor="end"
                      fill="#FCD34D"
                      fontSize="10"
                      fontWeight="700"
                    >
                      6.5–8.4
                    </text>

                    <rect
                      x="126"
                      y="96"
                      width="142"
                      height="30"
                      rx="8"
                      fill="#060a08"
                      stroke="rgba(251,113,133,0.38)"
                      strokeWidth="1"
                    />
                    <circle cx="141" cy="111" r="4" fill="#FB7185" />
                    <text x="152" y="114.5" fill="#f9fafb" fontSize="11" fontWeight="700">
                      Time Waste
                    </text>
                    <text
                      x="257"
                      y="114.5"
                      textAnchor="end"
                      fill="#FDA4AF"
                      fontSize="10"
                      fontWeight="700"
                    >
                      &lt; 6.5
                    </text>
                  </g>
                </svg>
              </div>
              <h3 className="mt-5 text-base font-bold text-white group-hover:text-neutral-200 transition-colors">
                Simple own rating
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a3a3a3]">
                No confusing decimals. Every game gets a direct verdict: Perfect, Okish, or Time Waste.
              </p>
            </article>

            <article
              className="reveal group relative lg:col-span-2 rounded-2xl border border-white/25 p-6 shadow-[0_0_20px_-5px_rgba(255,255,255,0.06)] hover:-translate-y-1.5 hover:border-white/55 hover:shadow-[0_0_24px_rgba(255,255,255,0.2)] transition-all duration-300 overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg,#181818 0%,#0b0b0b 55%,#000000 100%)',
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#000000]/90 via-[#000000]/40 to-transparent"
              />
              <div
                className="absolute -right-16 -top-16 h-56 w-56 rounded-full glow-backdrop pointer-events-none"
                aria-hidden="true"
              />
              <div
                ref={creditsStageRef}
                data-testid="review-apis-panel"
                className={`credit-float-stage relative overflow-hidden rounded-xl border border-[#262626] bg-[#060606]/90 px-4 py-3.5 ${
                  creditsVisible ? 'is-visible' : ''
                }`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{
                    background:
                      'radial-gradient(ellipse 65% 55% at 50% 52%, rgba(255, 255, 255, 0.08), transparent 72%)',
                  }}
                />

                <div className="relative z-10 flex items-center justify-between gap-2 pb-2.5 border-b border-[#262626]/80">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white whitespace-nowrap">
                    Review Credits
                  </span>
                  <span className="text-[10px] font-medium text-neutral-400 whitespace-nowrap">
                    {REVIEW_API_PROVIDERS.length} API Sources
                  </span>
                </div>

                <div
                  role="list"
                  aria-label="Game review websites credited via API"
                  className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-x-2.5 gap-y-3 sm:gap-x-3 sm:gap-y-4 py-4"
                >
                  {REVIEW_API_PROVIDERS.map((provider, idx) => {
                    const motion = CREDIT_FLOAT_MOTION[idx % CREDIT_FLOAT_MOTION.length];
                    const floatStyle = {
                      '--float-dur': motion.dur,
                      '--float-delay': motion.delay,
                      '--float-x': motion.x,
                      '--float-y': motion.y,
                    } as CSSProperties;

                    return (
                      <div key={provider.id} role="listitem" className={motion.offsetClass}>
                        <a
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`review-credit-${provider.id}`}
                          style={floatStyle}
                          className={`credit-float-item group/credit flex flex-col justify-between rounded-lg border px-3 py-2.5 transition-colors ${
                            motion.featured
                              ? 'border-white/30 bg-[#141414]/95 hover:border-white/60 hover:bg-[#1f1f1f]'
                              : 'border-[#262626] bg-[#0b0b0b]/95 hover:border-white/45 hover:bg-[#161616]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="truncate text-xs font-bold tracking-tight text-white group-hover/credit:text-neutral-200 transition-colors">
                              {provider.name}
                            </span>
                            <ExternalLink
                              className="h-3 w-3 shrink-0 text-neutral-500 opacity-60 group-hover/credit:opacity-100 group-hover/credit:text-white transition-all"
                              aria-hidden="true"
                            />
                          </div>
                          <span className="mt-0.5 truncate text-[10px] font-medium text-neutral-400">
                            {provider.shortTag}
                          </span>
                        </a>
                      </div>
                    );
                  })}
                </div>

                <p className="relative z-10 pt-2 border-t border-[#262626]/70 text-center text-[10px] text-neutral-400">
                  All game scores &amp; review snippets credited to their source APIs · Metacritic via RAWG
                </p>
              </div>
              <h3 className="relative z-10 mt-5 text-base font-bold text-white group-hover:text-neutral-200 transition-colors">
                All game reviews in one stop
              </h3>
              <p className="relative z-10 mt-2 text-sm leading-relaxed text-white/85">
                Read full breakdowns, verdict tags, and score summaries side by side without bouncing between scattered sites.
              </p>
            </article>

            <article
              className="reveal group relative lg:col-span-2 rounded-2xl border border-[#262626] p-6 shadow-[0_0_20px_-5px_rgba(255,255,255,0.05)] hover:-translate-y-1.5 hover:border-white/50 hover:shadow-[0_0_24px_rgba(255,255,255,0.18)] transition-all duration-300 overflow-hidden"
              style={{
                background: 'linear-gradient(160deg,#161616 0%,#0b0b0b 60%)',
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#000000]/90 via-[#000000]/35 to-transparent"
              />
              <div className="chart relative z-10 rounded-xl border border-[#262626] bg-[#060606]/90 p-5">
                <p className="flex items-baseline gap-2 text-3xl font-extrabold text-white">
                  <span data-count="9.4" data-dec="1" data-suffix="/10">
                    9.4/10
                  </span>
                  <span className="text-xs font-semibold text-neutral-300">Story · Graphics · Action</span>
                </p>
                <svg viewBox="0 0 560 150" className="mt-3 w-full" role="img" aria-label="Story, graphics, and action ratings chart">
                  <defs>
                    <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity=".35" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 35H560 M0 75H560 M0 115H560 M80 0V150 M200 0V150 M320 0V150 M440 0V150"
                    stroke="rgba(255,255,255,.06)"
                  />
                  <text x="4" y="30" fontSize="9" fill="#737373">
                    10
                  </text>
                  <text x="4" y="70" fontSize="9" fill="#737373">
                    7.5
                  </text>
                  <path
                    className="area"
                    d="M0 122 C60 116 90 104 150 96 C210 88 240 98 300 74 C360 50 400 60 460 38 C505 22 540 20 560 16 L560 150 L0 150 Z"
                    fill="url(#gd)"
                  />
                  <path
                    className="line"
                    d="M0 122 C60 116 90 104 150 96 C210 88 240 98 300 74 C360 50 400 60 460 38 C505 22 540 20 560 16"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle className="dot" cx="560" cy="16" r="4" fill="#ffffff" />
                </svg>
              </div>
              <h3 className="relative z-10 mt-5 text-base font-bold text-white group-hover:text-neutral-200 transition-colors">
                Rated on Story, Graphics &amp; Action
              </h3>
              <p className="relative z-10 mt-2 text-sm leading-relaxed text-[#a3a3a3]">
                Every title is scored on the three pillars players care about most: narrative depth, visual craft, and action feel.
              </p>
            </article>

            <article className="reveal group relative rounded-2xl border border-[#262626] bg-[#0b0b0b] p-6 shadow-[0_0_20px_-5px_rgba(255,255,255,0.05)] hover:-translate-y-1.5 hover:border-white/50 hover:shadow-[0_0_24px_rgba(255,255,255,0.18)] transition-all duration-300 overflow-hidden">
              <div ref={suggestWrapRef} className="flex h-44 items-center justify-center rounded-xl border border-[#262626] bg-[#060606]/85 p-2">
                <svg
                  viewBox="0 0 280 154"
                  className="h-40 w-full max-w-[280px]"
                  role="img"
                  aria-label="Game suggestions matched from Story, Graphics, and Action scores"
                >
                  <defs>
                    <linearGradient id="suggestFlow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a3a3a3" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#d4d4d8" stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="barFill" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#737373" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>

                  {/* Connecting flow lines from Story/Graphics/Action ratings to suggested games */}
                  <path
                    ref={topWaveRef}
                    data-testid="suggest-wave-top"
                    d={INITIAL_TOP_WAVE}
                    fill="none"
                    stroke="url(#suggestFlow)"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M112 79 C134 79, 134 52, 154 52"
                    fill="none"
                    stroke="url(#suggestFlow)"
                    strokeWidth="1.4"
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                  <path
                    ref={bottomWaveRef}
                    data-testid="suggest-wave-bottom"
                    d={INITIAL_BOTTOM_WAVE}
                    fill="none"
                    stroke="url(#suggestFlow)"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Left panel: Story, Graphics, Action rating inputs */}
                  <g>
                    <rect
                      x="8"
                      y="18"
                      width="104"
                      height="118"
                      rx="10"
                      fill="#080808"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="1"
                    />
                    <text
                      x="18"
                      y="33"
                      fill="#a3a3a3"
                      fontSize="7.5"
                      fontWeight="700"
                      letterSpacing="0.08em"
                    >
                      YOUR RATINGS
                    </text>

                    {/* Story */}
                    <text x="18" y="48" fill="#e5e5e5" fontSize="9.5" fontWeight="600">
                      Story
                    </text>
                    <text x="102" y="48" textAnchor="end" fill="#e5e5e5" fontSize="9.5" fontWeight="700">
                      9.2
                    </text>
                    <rect x="18" y="53" width="84" height="4.5" rx="2.25" fill="rgba(255,255,255,0.08)" />
                    <rect x="18" y="53" width="74" height="4.5" rx="2.25" fill="url(#barFill)" />

                    {/* Graphics */}
                    <text x="18" y="77" fill="#e5e5e5" fontSize="9.5" fontWeight="600">
                      Graphics
                    </text>
                    <text x="102" y="77" textAnchor="end" fill="#f5f5f5" fontSize="9.5" fontWeight="700">
                      9.5
                    </text>
                    <rect x="18" y="82" width="84" height="4.5" rx="2.25" fill="rgba(255,255,255,0.08)" />
                    <rect x="18" y="82" width="79" height="4.5" rx="2.25" fill="url(#barFill)" />

                    {/* Action */}
                    <text x="18" y="106" fill="#e5e5e5" fontSize="9.5" fontWeight="600">
                      Action
                    </text>
                    <text x="102" y="106" textAnchor="end" fill="#ffffff" fontSize="9.5" fontWeight="700">
                      9.8
                    </text>
                    <rect x="18" y="111" width="84" height="4.5" rx="2.25" fill="rgba(255,255,255,0.08)" />
                    <rect x="18" y="111" width="82" height="4.5" rx="2.25" fill="url(#barFill)" />
                  </g>

                  {/* Center match indicator node */}
                  <circle cx="133" cy="77" r="10" fill="#080808" stroke="#ffffff" strokeWidth="1.25" />
                  <path
                    d="M129.5 77 H136.5 M134 74.2 L136.8 77 L134 79.8"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Right panel: Matched game suggestions */}
                  <g>
                    {/* Suggestion 1 */}
                    <rect
                      x="154"
                      y="22"
                      width="118"
                      height="50"
                      rx="10"
                      fill="#171717"
                      stroke="rgba(255,255,255,0.45)"
                      strokeWidth="1"
                    />
                    <text
                      x="164"
                      y="36"
                      fill="#d4d4d8"
                      fontSize="7.5"
                      fontWeight="700"
                      letterSpacing="0.06em"
                    >
                      TOP MATCH
                    </text>
                    <text x="262" y="36" textAnchor="end" fill="#ffffff" fontSize="8.5" fontWeight="800">
                      98%
                    </text>
                    <text x="164" y="51" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                      Sekiro
                    </text>
                    <text x="164" y="63" fill="#a3a3a3" fontSize="8">
                      Action 9.8 · Story 9.0
                    </text>

                    {/* Suggestion 2 */}
                    <rect
                      x="154"
                      y="82"
                      width="118"
                      height="50"
                      rx="10"
                      fill="#080808"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="1"
                    />
                    <text
                      x="164"
                      y="96"
                      fill="#a3a3a3"
                      fontSize="7.5"
                      fontWeight="700"
                      letterSpacing="0.06em"
                    >
                      NEXT PICK
                    </text>
                    <text x="262" y="96" textAnchor="end" fill="#e5e5e5" fontSize="8.5" fontWeight="800">
                      94%
                    </text>
                    <text x="164" y="111" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                      Lies of P
                    </text>
                    <text x="164" y="123" fill="#a3a3a3" fontSize="8">
                      Graphics 9.4 · Action 9.2
                    </text>
                  </g>
                </svg>
              </div>
              <h3 className="mt-5 text-base font-bold text-white group-hover:text-neutral-200 transition-colors">
                Game suggestions based on ratings
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a3a3a3]">
                Get smart next-game picks matched directly to the Story, Graphics, and Action scores you love.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
