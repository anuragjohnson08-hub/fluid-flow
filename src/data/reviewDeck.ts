import type { OwnVerdict } from "../utils/keywords";

export interface ReviewDeckScore {
  label: "Story" | "Graphics" | "Action";
  score: number;
}

export interface ReviewDeckPartnerStat {
  source: string;
  metric: string;
}

export interface ReviewDeckCardData {
  id: string;
  kind: "game-review" | "partner-hub";
  name: string;
  summary: string;
  url: string;
  display: string;
  accent: string;
  eyebrow: string;
  headline: string;
  subline: string;
  verdict?: OwnVerdict;
  overallScore?: string;
  suggestion?: string;
  scores?: ReviewDeckScore[];
  partnerStats: ReviewDeckPartnerStat[];
  footerNote: string;
}

export const REVIEW_DECK_CARDS: ReviewDeckCardData[] = [
  {
    id: "elden-ring",
    kind: "game-review",
    name: "Elden Ring",
    summary:
      "Fluid Flow review for Elden Ring: 9.2 Story, 9.5 Graphics, 9.8 Action — Perfect verdict with Sekiro and Lies of P suggestions.",
    url: "https://opencritic.com/game/12090/elden-ring",
    display: "opencritic.com · Perfect 9.5",
    accent: "#2A9D8F",
    eyebrow: "Fluid Flow Review · Open-World Action RPG",
    headline: "Elden Ring",
    subline:
      "Monumental world discovery paired with crisp boss combat and zero filler padding.",
    verdict: "Perfect",
    overallScore: "9.5",
    suggestion: "Next Play: Sekiro · Lies of P",
    scores: [
      { label: "Story", score: 9.2 },
      { label: "Graphics", score: 9.5 },
      { label: "Action", score: 9.8 },
    ],
    partnerStats: [
      { source: "OpenCritic", metric: "96 Top Critic Avg" },
      { source: "Steam", metric: "93% Very Positive" },
      { source: "IGDB", metric: "95 Total Rating" },
    ],
    footerNote: "Aggregated from 180+ critic outlets & verified Steam playtime logs",
  },
  {
    id: "cyberpunk-2077",
    kind: "game-review",
    name: "Cyberpunk 2077",
    summary:
      "Fluid Flow review for Cyberpunk 2077: 9.4 Story, 9.8 Graphics, 9.1 Action — Perfect verdict with Deus Ex and Ghostrunner suggestions.",
    url: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/",
    display: "steampowered.com · Perfect 9.4",
    accent: "#2A9D8F",
    eyebrow: "Fluid Flow Review · Sci-Fi RPG (2.0+)",
    headline: "Cyberpunk 2077",
    subline:
      "Standout Night City lighting, razor-sharp cyberware builds, and gripping character arcs.",
    verdict: "Perfect",
    overallScore: "9.4",
    suggestion: "Next Play: Deus Ex · Ghostrunner",
    scores: [
      { label: "Story", score: 9.4 },
      { label: "Graphics", score: 9.8 },
      { label: "Action", score: 9.1 },
    ],
    partnerStats: [
      { source: "RAWG", metric: "4.4 / 5 Community" },
      { source: "Steam", metric: "91% Recent Positive" },
      { source: "Giant Bomb", metric: "Editorial Spotlight" },
    ],
    footerNote: "Updated post-Phantom Liberty across PC & current-gen builds",
  },
  {
    id: "starfield",
    kind: "game-review",
    name: "Starfield",
    summary:
      "Fluid Flow review for Starfield: 7.1 Story, 8.0 Graphics, 6.8 Action — Okish verdict suggesting Mass Effect Legendary Edition instead.",
    url: "https://opencritic.com/game/14907/starfield",
    display: "opencritic.com · Okish 7.3",
    accent: "#E9C46A",
    eyebrow: "Fluid Flow Review · Space Exploration RPG",
    headline: "Starfield",
    subline:
      "Clean ship art and faction moments held back by fast-travel menus and uneven pacing.",
    verdict: "Okish",
    overallScore: "7.3",
    suggestion: "Try Instead: Mass Effect LE",
    scores: [
      { label: "Story", score: 7.1 },
      { label: "Graphics", score: 8.0 },
      { label: "Action", score: 6.8 },
    ],
    partnerStats: [
      { source: "OpenCritic", metric: "85 Critic Avg" },
      { source: "Steam", metric: "61% Mixed" },
      { source: "MobyGames", metric: "7.4 MobyScore" },
    ],
    footerNote: "Clear Okish rating saves you 40 hours before committing full price",
  },
  {
    id: "opencritic-source",
    kind: "partner-hub",
    name: "OpenCritic",
    summary:
      "Partner review API: OpenCritic supplies Top Critic averages, recommendation percentages, and outlet snippets to Fluid Flow.",
    url: "https://opencritic.com",
    display: "opencritic.com · Critic API",
    accent: "#38bdf8",
    eyebrow: "Partner Review Source 01 · Critic Aggregation",
    headline: "OpenCritic API",
    subline:
      "Real-time Top Critic averages, % Recommended badges, and verified outlet excerpts unified into one feed.",
    partnerStats: [
      { source: "Elden Ring", metric: "96 · 98% Rec" },
      { source: "Sekiro", metric: "90 · 95% Rec" },
      { source: "Lies of P", metric: "82 · 87% Rec" },
    ],
    footerNote: "REST JSON · GET /game/{id} & /game/reviewed-today",
  },
  {
    id: "igdb-rawg-sources",
    kind: "partner-hub",
    name: "IGDB & RAWG",
    summary:
      "Partner review APIs: IGDB and RAWG deliver critic totals, user rating curves, and Metacritic snapshots across every platform.",
    url: "https://www.igdb.com",
    display: "igdb.com · rawg.io",
    accent: "#a855f7",
    eyebrow: "Partner Review Sources 02 & 03 · Score Engines",
    headline: "IGDB & RAWG",
    subline:
      "Dual-engine score telemetry pairing Twitch Apicalypse critic totals with RAWG player distributions.",
    partnerStats: [
      { source: "IGDB v4", metric: "Critic + User Split" },
      { source: "RAWG REST", metric: "Metacritic Sync" },
      { source: "Coverage", metric: "500K+ Indexed Titles" },
    ],
    footerNote: "Apicalypse POST v4/games & REST GET api.rawg.io/api/games",
  },
  {
    id: "steam-editorial-sources",
    kind: "partner-hub",
    name: "Steam, Giant Bomb & MobyGames",
    summary:
      "Partner review APIs: Steam player sentiment, Giant Bomb editorial reviews, and MobyGames MobyScore archives complete the Fluid Flow hub.",
    url: "https://store.steampowered.com",
    display: "steampowered.com · Archive APIs",
    accent: "#EF4444",
    eyebrow: "Partner Review Sources 04–06 · Player & Archive Credits",
    headline: "Steam · Giant Bomb · MobyGames",
    subline:
      "Verified player playtime verdicts combined with classic editorial essays and multi-platform release histories.",
    partnerStats: [
      { source: "Steam", metric: "Playtime-Weighted Sentiment" },
      { source: "Giant Bomb", metric: "Staff Editorial Reviews" },
      { source: "MobyGames", metric: "v2 MobyScore Archive" },
    ],
    footerNote: "Public Storefront JSON · Giant Bomb API · MobyGames v2 REST",
  },
];
