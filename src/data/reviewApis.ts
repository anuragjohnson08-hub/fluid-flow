export interface ReviewApiProvider {
  id: string;
  name: string;
  shortTag: string;
  accessType: string;
  format: string;
  endpoint: string;
  reviewFields: string;
  summary: string;
  docsUrl: string;
}

export const REVIEW_API_PROVIDERS: ReviewApiProvider[] = [
  {
    id: 'opencritic',
    name: 'OpenCritic',
    shortTag: 'Critic Aggregation',
    accessType: 'RapidAPI Key',
    format: 'JSON (REST)',
    endpoint: 'GET /game/{id} · /game/reviewed-today',
    reviewFields: 'Top Critic Avg, % Recommended, tier badge, outlet review snippets',
    summary:
      'Aggregates critic scores, editorial review excerpts, and recommendation percentages from major gaming outlets.',
    docsUrl: 'https://app.swaggerhub.com/apis-docs/OpenCritic/OpenCritic-API',
  },
  {
    id: 'rawg',
    name: 'RAWG',
    shortTag: 'Ratings + Metacritic',
    accessType: 'Free API Key',
    format: 'JSON (REST)',
    endpoint: 'GET api.rawg.io/api/games/{id}',
    reviewFields: 'User rating breakdowns, review counts, embedded Metacritic scores',
    summary:
      'Provides community rating distributions, review totals, and syndicated Metacritic scores per game.',
    docsUrl: 'https://api.rawg.io/docs/',
  },
  {
    id: 'igdb',
    name: 'IGDB',
    shortTag: 'Twitch / Apicalypse',
    accessType: 'Twitch OAuth',
    format: 'JSON (Apicalypse)',
    endpoint: 'POST api.igdb.com/v4/games',
    reviewFields: 'aggregated_rating (critics), rating (users), rating_count, total_rating',
    summary:
      'Twitch-backed database exposing critic aggregates, user scores, and review counts via Apicalypse queries.',
    docsUrl: 'https://api-docs.igdb.com/',
  },
  {
    id: 'steam',
    name: 'Steam',
    shortTag: 'Player Reviews',
    accessType: 'Public JSON',
    format: 'JSON (Storefront)',
    endpoint: 'GET store.steampowered.com/appreviews/{appid}?json=1',
    reviewFields: 'Full player reviews, positive/negative ratio, playtime, verdict summary',
    summary:
      'Official Valve Storefront endpoint returning verified player reviews, helpfulness votes, and review sentiment.',
    docsUrl: 'https://partner.steamgames.com/doc/store/getreviews',
  },
  {
    id: 'giantbomb',
    name: 'Giant Bomb',
    shortTag: 'Editorial Reviews',
    accessType: 'Free API Key',
    format: 'JSON / XML',
    endpoint: 'GET giantbomb.com/api/reviews/ · /games/',
    reviewFields: 'Editorial staff reviews, star scores, reviewer credits, game summaries',
    summary:
      'Offers structured editorial review entries, reviewer details, and detailed game database records.',
    docsUrl: 'https://www.giantbomb.com/api/documentation/',
  },
  {
    id: 'mobygames',
    name: 'MobyGames',
    shortTag: 'MobyScore Archive',
    accessType: 'API Key (v2)',
    format: 'JSON (REST)',
    endpoint: 'GET api.mobygames.com/v2/games',
    reviewFields: 'MobyScore, critic review scores, historical credits, platform matrices',
    summary:
      'Long-running archive providing MobyScores, critic score histories, and platform-by-platform release data.',
    docsUrl: 'https://www.mobygames.com/info/api/',
  },
];

export function getReviewApiById(id: string): ReviewApiProvider {
  return REVIEW_API_PROVIDERS.find((item) => item.id === id) ?? REVIEW_API_PROVIDERS[0];
}
