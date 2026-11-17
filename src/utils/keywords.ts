export type OwnVerdict = 'Perfect' | 'Okish' | 'Time Waste';

export interface KeywordRow {
  term: string;
  verdict: OwnVerdict;
  story: number;
  graphics: number;
  action: number;
  suggestion: string;
  widthPct: number;
  highlight: boolean;
}

export interface VerdictTier {
  name: OwnVerdict;
  scoreBadge: string;
  actionBadge: string;
  scoreSubtext: string;
  actionSubtext: string;
  popular: boolean;
  ctaLabel: string;
  features: string[];
}

export const KEYWORDS: KeywordRow[] = [
  {
    term: 'Elden Ring',
    verdict: 'Perfect',
    story: 9.2,
    graphics: 9.5,
    action: 9.8,
    suggestion: 'Next: Sekiro / Lies of P',
    widthPct: 95,
    highlight: true,
  },
  {
    term: 'Cyberpunk 2077',
    verdict: 'Perfect',
    story: 9.4,
    graphics: 9.8,
    action: 9.1,
    suggestion: 'Next: Deus Ex / Ghostrunner',
    widthPct: 93,
    highlight: true,
  },
  {
    term: 'Starfield',
    verdict: 'Okish',
    story: 7.1,
    graphics: 8.0,
    action: 6.8,
    suggestion: 'Try instead: Mass Effect LE',
    widthPct: 72,
    highlight: false,
  },
  {
    term: 'Forspoken',
    verdict: 'Time Waste',
    story: 4.3,
    graphics: 6.9,
    action: 5.4,
    suggestion: 'Play instead: Control',
    widthPct: 45,
    highlight: false,
  },
];

export const VERDICT_TIERS: VerdictTier[] = [
  {
    name: 'Okish',
    scoreBadge: '6.5 - 8.4',
    actionBadge: 'Wait for Sale',
    scoreSubtext: 'Story, Graphics & Action average',
    actionSubtext: 'Suggestion rule for mixed titles',
    popular: false,
    ctaLabel: 'Browse Okish Picks',
    features: [
      'Solid core loop with minor pacing dips',
      'Clean Graphics without standout direction',
      'Fun Action for dedicated genre fans',
      'Flags specific strengths before you buy',
      'Suggests sharper alternatives in the genre',
    ],
  },
  {
    name: 'Perfect',
    scoreBadge: '8.5 - 10',
    actionBadge: 'Must Play',
    scoreSubtext: 'Top Story, Graphics & Action marks',
    actionSubtext: 'Suggestion rule for top-tier games',
    popular: true,
    ctaLabel: 'Explore Perfect Games',
    features: [
      'Gripping Story with memorable pacing',
      'Standout Graphics, lighting & art direction',
      'Responsive, rewarding Action gameplay',
      'Zero filler or wasted weekend hours',
      'Unlocks tailored next-game recommendations',
      'Featured in our One-Stop Hall of Fame',
    ],
  },
  {
    name: 'Time Waste',
    scoreBadge: 'Below 6.5',
    actionBadge: 'Skip Now',
    scoreSubtext: 'Low Story, Graphics or Action score',
    actionSubtext: 'Suggestion rule for weak releases',
    popular: false,
    ctaLabel: 'See Better Alternatives',
    features: [
      'Thin or forgettable Story progression',
      'Flat Graphics or rough optimization',
      'Repetitive, clunky Action encounters',
      'Saves you money and hours of grind',
      'Instantly redirects to Perfect-rated picks',
    ],
  },
];

export function filterKeywords(query: string, items: KeywordRow[] = KEYWORDS): KeywordRow[] {
  const normalized = (query || '').trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => {
    const searchable = [
      item.term,
      item.verdict,
      item.suggestion,
      `story ${item.story}`,
      `graphics ${item.graphics}`,
      `action ${item.action}`,
    ]
      .join(' ')
      .toLowerCase();
    return searchable.includes(normalized);
  });
}

export function getKeywordSummary(
  matchCount: number,
  query: string,
): {
  heading: string;
  subtitle: string;
} {
  const normalized = (query || '').trim();
  if (!normalized) {
    return {
      heading: 'One-Stop Game Reviews',
      subtitle: 'Story · Graphics · Action + Suggestions',
    };
  }
  return {
    heading: `Game Reviews · ${matchCount} match${matchCount === 1 ? '' : 'es'}`,
    subtitle: 'Filtered by Fluid Flow Search',
  };
}

export function getVerdictDisplay(tier: VerdictTier, showActionRule: boolean): {
  headline: string;
  subtext: string;
} {
  return showActionRule
    ? { headline: tier.actionBadge, subtext: tier.actionSubtext }
    : { headline: tier.scoreBadge, subtext: tier.scoreSubtext };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
}
