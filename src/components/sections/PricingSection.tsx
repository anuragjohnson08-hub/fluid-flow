import { ArrowUpRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { KEYWORDS, VERDICT_TIERS, getVerdictDisplay, type OwnVerdict } from '../../utils/keywords';

const TIER_META: Record<
  OwnVerdict,
  {
    accentText: string;
    accentDot: string;
    accentBorder: string;
    meterLeft: string;
    meterWidth: string;
    meterFill: string;
    surfaceStyle?: React.CSSProperties;
    rankLabel: string;
  }
> = {
  Perfect: {
    accentText: 'text-[#34d399]',
    accentDot: 'bg-[#10b981]',
    accentBorder: 'border-[#34d399]/30 hover:border-[#34d399]/70 hover:shadow-[0_0_24px_rgba(52,211,153,0.26)]',
    meterLeft: '85%',
    meterWidth: '15%',
    meterFill: 'bg-gradient-to-r from-[#10b981] to-[#a7f3d0]',
    surfaceStyle: {
      background: 'linear-gradient(115deg, #064e3b 0%, #0d1410 52%)',
    },
    rankLabel: 'Tier 01 · Must Play',
  },
  Okish: {
    accentText: 'text-[#f59e0b]',
    accentDot: 'bg-[#f59e0b]',
    accentBorder: 'border-[#1e2e25] hover:border-[#f59e0b]/60 hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]',
    meterLeft: '65%',
    meterWidth: '20%',
    meterFill: 'bg-gradient-to-r from-[#f59e0b] to-amber-300',
    rankLabel: 'Tier 02 · Play With Caveats',
  },
  'Time Waste': {
    accentText: 'text-rose-300',
    accentDot: 'bg-rose-400',
    accentBorder: 'border-[#1e2e25] hover:border-rose-400/60 hover:shadow-[0_0_24px_rgba(251,113,133,0.2)]',
    meterLeft: '0%',
    meterWidth: '65%',
    meterFill: 'bg-gradient-to-r from-rose-600 to-rose-400',
    rankLabel: 'Tier 03 · Skip & Redirect',
  },
};

const RUBRIC_ORDER: OwnVerdict[] = ['Perfect', 'Okish', 'Time Waste'];

export function PricingSection() {
  const [showActionRule, setShowActionRule] = useState(false);

  const orderedTiers = useMemo(() => {
    const byName = new Map(VERDICT_TIERS.map((t) => [t.name, t]));
    return RUBRIC_ORDER.map((name) => byName.get(name)).filter(
      (tier): tier is (typeof VERDICT_TIERS)[number] => Boolean(tier),
    );
  }, []);

  const examplesByVerdict = useMemo(() => {
    const grouped: Record<OwnVerdict, string[]> = {
      Perfect: [],
      Okish: [],
      'Time Waste': [],
    };
    for (const row of KEYWORDS) {
      grouped[row.verdict].push(row.term);
    }
    return grouped;
  }, []);

  return (
    <section id="pricing" className="px-4 py-20 scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="reveal text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
              Rating Rubric &amp; Verdict Scale
            </p>
            <h2 className="reveal mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Simple Own Ratings
            </h2>
            <p className="reveal mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              Every game on Fluid Flow receives one clear verdict alongside Story, Graphics, and Action scores and tailored game suggestions.
            </p>
          </div>

          <div className="reveal flex flex-wrap items-center gap-3 rounded-2xl border border-[#1e2e25] bg-[#0d1410] px-4 py-3 shrink-0">
            <span className="text-xs font-medium text-[#9ca3af]">
              {showActionRule ? 'Showing Action Rule' : 'Showing 0–10 Score'}
            </span>
            <button
              type="button"
              id="billing-toggle"
              role="switch"
              aria-checked={showActionRule}
              aria-label="Toggle suggestion rules view"
              onClick={() => setShowActionRule((prev) => !prev)}
              className={`relative h-6 w-11 rounded-full border border-[#1e2e25] transition-colors cursor-pointer ${
                showActionRule ? 'bg-[#10b981]' : 'bg-[#131d17]'
              }`}
            >
              <span
                id="toggle-knob"
                className="toggle-knob absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-full bg-[#f9fafb] shadow"
                style={{ transform: showActionRule ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
            <span className="text-xs font-semibold text-[#f9fafb]">Show Suggestion Action</span>
          </div>
        </div>

        {/* Continuous 0-10 Verdict Scale Bar */}
        <div className="reveal mt-10 rounded-2xl border border-[#1e2e25] bg-[#0d1410] p-4 sm:p-5 shadow-[0_0_20px_-5px_rgba(16,185,129,0.08)]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#9ca3af]">
            <span>0.0 · Time Waste</span>
            <span>6.5 · Okish Cutoff</span>
            <span>8.5 · Perfect Cutoff</span>
            <span>10.0</span>
          </div>
          <div className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full bg-[#060a08]">
            <div className="h-full bg-rose-500/75" style={{ width: '65%' }} title="Time Waste: Below 6.5" />
            <div className="h-full bg-[#f59e0b]/85" style={{ width: '20%' }} title="Okish: 6.5 - 8.4" />
            <div
              className="h-full bg-gradient-to-r from-[#10b981] to-[#a7f3d0]"
              style={{ width: '15%' }}
              title="Perfect: 8.5 - 10"
            />
          </div>
        </div>

        {/* Verdict Rubric Rows */}
        <div id="plans" className="mt-5 space-y-4">
          {orderedTiers.map((tier) => {
            const display = getVerdictDisplay(tier, showActionRule);
            const meta = TIER_META[tier.name];
            const examples = examplesByVerdict[tier.name];

            return (
              <article
                key={tier.name}
                className={`reveal group relative overflow-hidden rounded-2xl border bg-[#0d1410] p-6 sm:p-7 shadow-[0_0_20px_-5px_rgba(16,185,129,0.08)] hover:-translate-y-1.5 transition-all duration-300 ${meta.accentBorder}`}
                style={meta.surfaceStyle}
              >
                {meta.surfaceStyle && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060a08]/90 via-[#060a08]/45 to-transparent"
                  />
                )}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-center">
                  {/* Verdict Name & Score / Action Threshold */}
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${meta.accentDot}`} aria-hidden="true" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">
                        {meta.rankLabel}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-baseline justify-between lg:block gap-3">
                      <h3 className="text-2xl font-extrabold text-[#f9fafb] group-hover:text-[#34d399] transition-colors">
                        {tier.name}
                      </h3>
                      <p className="lg:mt-2 flex items-baseline gap-1.5">
                        <span
                          key={`${tier.name}-${showActionRule ? 'action' : 'score'}`}
                          className={`price-pop inline-flex items-center rounded-lg border border-white/10 bg-[#060a08]/75 px-2.5 py-0.5 text-2xl sm:text-3xl font-black tabular-nums ${meta.accentText}`}
                        >
                          {display.headline}
                        </span>
                        {!showActionRule && <span className="text-xs font-semibold text-[#9ca3af]">/10</span>}
                      </p>
                    </div>

                    <p className="mt-2 text-xs text-[#9ca3af]">{display.subtext}</p>

                    <div className="mt-3.5 h-1.5 w-full rounded-full bg-white/5 relative overflow-hidden">
                      <div
                        className={`absolute top-0 bottom-0 rounded-full ${meta.meterFill}`}
                        style={{ left: meta.meterLeft, width: meta.meterWidth }}
                      />
                    </div>
                  </div>

                  {/* Story, Graphics & Action Rubric Breakdown */}
                  <div className="lg:col-span-5 lg:border-l lg:border-[#1e2e25] lg:pl-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">
                      How Story, Graphics &amp; Action Score Here
                    </p>
                    <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5 text-xs sm:text-sm text-[#f9fafb]/85">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 leading-snug">
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${meta.accentDot}`}
                            aria-hidden="true"
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Real Examples & Verdict Action */}
                  <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 lg:border-l lg:border-[#1e2e25] lg:pl-6">
                    {examples.length > 0 && (
                      <div className="lg:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                          Rated Examples
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#f9fafb]/85">
                          {examples.join(' · ')}
                        </p>
                      </div>
                    )}

                    <a
                      href="#cta"
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                        tier.popular
                          ? 'btn-emerald-preserve text-white group-hover:brightness-110'
                          : 'border border-[#1e2e25] bg-[#131d17] text-[#f9fafb] hover:bg-[#131d17] hover:border-[#34d399]/60 group-hover:text-[#34d399]'
                      }`}
                    >
                      <span>{tier.ctaLabel}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
