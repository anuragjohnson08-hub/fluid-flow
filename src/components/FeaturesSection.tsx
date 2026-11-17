import {
  BarChart3,
  Bell,
  FileCheck,
  Gauge,
  Link2,
  MousePointerClick,
  Radar,
  Sparkles,
  Target,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Gauge,
    title: 'One-stop review feed',
    desc: 'Every game review, core verdict, and score summary lives in one clean, searchable place.',
  },
  {
    icon: MousePointerClick,
    title: 'Simple own rating',
    desc: 'Skip bloated 100-point scales. Every review ends with Perfect, Okish, or Time Waste.',
  },
  {
    icon: FileCheck,
    title: 'Story rating',
    desc: 'Evaluates narrative depth, dialogue, pacing, and worldbuilding before you commit.',
  },
  {
    icon: Sparkles,
    title: 'Graphics rating',
    desc: 'Measures art direction, lighting, visual polish, and frame stability across platforms.',
  },
  {
    icon: Link2,
    title: 'Action rating',
    desc: 'Scores combat responsiveness, encounter variety, and moment-to-moment gameplay flow.',
  },
  {
    icon: Bell,
    title: 'Suggestions from your ratings',
    desc: 'Recommends your next game directly from the Story, Graphics, and Action scores you prefer.',
  },
  {
    icon: BarChart3,
    title: 'Perfect picks spotlight',
    desc: 'Surface unforgettable, must-play titles right away when you only want top-tier quality.',
  },
  {
    icon: Radar,
    title: 'Time waste filter',
    desc: 'Spot repetitive padding, broken launches, and weak loops before spending money or time.',
  },
  {
    icon: Target,
    title: 'Instant Dynamic Island search',
    desc: 'Filter titles by game name, Perfect/Okish/Time Waste verdict, or Story, Graphics, and Action.',
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="px-4 py-20 scroll-mt-24"
      style={{
        background: 'linear-gradient(180deg,transparent,rgba(255,255,255,.04) 30%,transparent)',
      }}
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="reveal text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
          Play smarter.
          <br />
          Skip the noise.
        </h2>
        <div
          id="feature-list"
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="reveal group relative overflow-hidden rounded-2xl border border-[#262626] bg-[#0b0b0b] p-6 shadow-[0_0_20px_-5px_rgba(255,255,255,0.05),0_24px_48px_-12px_rgba(0,0,0,0.85)] hover:-translate-y-1.5 hover:border-white/50 hover:bg-[#161616] hover:shadow-[0_0_24px_rgba(255,255,255,0.18)] transition-all duration-300"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#000000]/85 via-transparent to-transparent"
                />
                <p className="relative z-10 flex items-center gap-2.5 rounded-xl border border-[#262626] bg-[#060606]/85 px-3.5 py-2.5 text-sm font-bold text-white group-hover:border-white/35 group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <Icon className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
                  <span>{feat.title}</span>
                </p>
                <p className="relative z-10 mt-3.5 px-1 text-sm leading-relaxed text-[#a3a3a3] group-hover:text-white/90 transition-colors">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
