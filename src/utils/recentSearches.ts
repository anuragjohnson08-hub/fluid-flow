export const MAX_RECENT_SEARCHES = 5;
export const RECENT_SEARCHES_STORAGE_KEY = 'fluidflow:recent-searches';

export type StorageReader = Pick<Storage, 'getItem'>;
export type StorageWriter = Pick<Storage, 'setItem'>;

export function normalizeSearchQuery(query: string): string {
  return (query || '').trim().replace(/\s+/g, ' ');
}

export function addRecentSearch(
  history: readonly string[],
  rawQuery: string,
  limit: number = MAX_RECENT_SEARCHES,
): string[] {
  const normalized = normalizeSearchQuery(rawQuery);
  if (!normalized || limit <= 0) {
    return [...history].slice(0, Math.max(0, limit));
  }

  const lowerTarget = normalized.toLowerCase();
  const deduped = history.filter((item) => normalizeSearchQuery(item).toLowerCase() !== lowerTarget);
  return [normalized, ...deduped].slice(0, limit);
}

export function removeRecentSearch(
  history: readonly string[],
  rawQuery: string,
): string[] {
  const normalized = normalizeSearchQuery(rawQuery);
  if (!normalized) return [...history];
  const lowerTarget = normalized.toLowerCase();
  return history.filter((item) => normalizeSearchQuery(item).toLowerCase() !== lowerTarget);
}

export function sanitizeRecentSearches(
  raw: unknown,
  limit: number = MAX_RECENT_SEARCHES,
): string[] {
  if (!Array.isArray(raw) || limit <= 0) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of raw) {
    if (typeof entry !== 'string') continue;
    const normalized = normalizeSearchQuery(entry);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
    if (result.length >= limit) break;
  }

  return result;
}

export function loadRecentSearches(
  storage?: StorageReader | null,
  limit: number = MAX_RECENT_SEARCHES,
): string[] {
  const targetStorage =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined'
        ? window.localStorage
        : null;
  if (!targetStorage) return [];

  try {
    const raw = targetStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return sanitizeRecentSearches(parsed, limit);
  } catch {
    return [];
  }
}

export function saveRecentSearches(
  history: readonly string[],
  storage?: StorageWriter | null,
  limit: number = MAX_RECENT_SEARCHES,
): void {
  const targetStorage =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined'
        ? window.localStorage
        : null;
  if (!targetStorage) return;

  try {
    const clean = sanitizeRecentSearches(history, limit);
    targetStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}
