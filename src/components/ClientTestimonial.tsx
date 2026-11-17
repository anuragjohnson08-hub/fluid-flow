export function ClientTestimonial() {
  return (
    <section id="clients" className="relative px-4 py-24 scroll-mt-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid mask-fade" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="reveal text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Why Fluid Flow
        </h2>
        <p className="reveal mx-auto mt-4 max-w-md text-sm sm:text-base text-[#a3a3a3]">
          One honest destination built so players know in seconds whether a game is worth playing.
        </p>

        <figure className="reveal group mt-12 flex flex-col sm:flex-row items-stretch gap-0 overflow-hidden rounded-2xl border border-[#262626] bg-[#0b0b0b] text-left shadow-[0_0_20px_-5px_rgba(255,255,255,0.06),0_0_60px_-20px_rgba(255,255,255,.15)] hover:-translate-y-1.5 hover:border-white/50 hover:shadow-[0_0_24px_rgba(255,255,255,0.18)] transition-all duration-300">
          <div
            className="relative sm:w-56 shrink-0 min-h-56"
            style={{ background: 'linear-gradient(160deg,#262626,#0a0a0a)' }}
          >
            <svg
              viewBox="0 0 224 260"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="xMidYMid slice"
              role="img"
              aria-label="Fluid Flow editorial reviewer emblem"
            >
              <defs>
                <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e5e5e5" />
                  <stop offset="100%" stopColor="#737373" />
                </linearGradient>
                <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#171717" />
                  <stop offset="100%" stopColor="#000000" />
                </linearGradient>
              </defs>
              <rect width="224" height="260" fill="#171717" opacity=".35" />
              <path
                d="M60 260 C58 190 70 168 112 164 C154 168 166 190 164 260 Z"
                fill="url(#hair)"
              />
              <path
                d="M78 118 C70 60 96 38 112 38 C128 38 154 60 146 118 C142 146 128 158 112 158 C96 158 82 146 78 118 Z"
                fill="url(#hair)"
              />
              <ellipse cx="112" cy="104" rx="30" ry="38" fill="url(#skin)" />
              <path
                d="M82 96 C84 62 100 52 112 52 C124 52 140 62 142 96 C136 78 126 70 112 70 C98 70 88 78 82 96 Z"
                fill="url(#hair)"
              />
              <path
                d="M84 196 C90 178 100 170 112 170 C124 170 134 178 140 196 L140 260 L84 260 Z"
                fill="#a3a3a3"
                opacity=".8"
              />
              <circle cx="100" cy="102" r="2.5" fill="#000000" />
              <circle cx="124" cy="102" r="2.5" fill="#000000" />
              <path
                d="M104 124 Q112 130 120 124"
                stroke="#525252"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <blockquote className="relative flex flex-col justify-center p-7 sm:p-9">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#000000]/90 via-[#000000]/45 to-transparent"
            />
            <p className="relative z-10 text-lg sm:text-xl font-semibold leading-snug text-white">
              &ldquo;Most game sites bury players in scattered essays. Fluid Flow puts every review in one stop, rates Story, Graphics, and Action clearly, calls each title Perfect, Okish, or Time Waste, and suggests what to play next.&rdquo;
            </p>
            <figcaption className="relative z-10 mt-5">
              <p className="text-sm font-bold text-white group-hover:text-neutral-200 transition-colors">
                The Fluid Flow Standard
              </p>
              <p className="mt-0.5 text-xs text-[#a3a3a3]">One-Stop Game Reviews &amp; Smart Suggestions</p>
            </figcaption>
          </blockquote>
        </figure>
      </div>
    </section>
  );
}
