import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_RECENT_SEARCHES,
  RECENT_SEARCHES_STORAGE_KEY,
  addRecentSearch,
  loadRecentSearches,
  normalizeSearchQuery,
  removeRecentSearch,
  sanitizeRecentSearches,
  saveRecentSearches,
} from '../src/utils/recentSearches.ts';

test('normalizeSearchQuery trims and collapses whitespace', () => {
  assert.equal(normalizeSearchQuery('  Elden   Ring  '), 'Elden Ring');
  assert.equal(normalizeSearchQuery('   \t\n '), '');
});

test('addRecentSearch ignores empty or whitespace-only queries', () => {
  const initial = ['Elden Ring', 'Starfield'];
  assert.deepEqual(addRecentSearch(initial, ''), initial);
  assert.deepEqual(addRecentSearch(initial, '   '), initial);
});

test('addRecentSearch caps history at the last 5 unique queries (most recent first)', () => {
  let history: string[] = [];
  for (const term of ['Elden Ring', 'Cyberpunk 2077', 'Starfield', 'Forspoken', 'Perfect', 'Okish']) {
    history = addRecentSearch(history, term);
  }
  assert.equal(history.length, MAX_RECENT_SEARCHES);
  assert.deepEqual(history, ['Okish', 'Perfect', 'Forspoken', 'Starfield', 'Cyberpunk 2077']);
});

test('addRecentSearch deduplicates case-insensitively and promotes to index 0', () => {
  const initial = ['Okish', 'Perfect', 'Starfield', 'Cyberpunk 2077', 'Elden Ring'];
  const next = addRecentSearch(initial, '  starfield ');
  assert.deepEqual(next, ['starfield', 'Okish', 'Perfect', 'Cyberpunk 2077', 'Elden Ring']);
});

test('removeRecentSearch removes matching entry case-insensitively', () => {
  const initial = ['Okish', 'Starfield', 'Elden Ring'];
  assert.deepEqual(removeRecentSearch(initial, 'starfield'), ['Okish', 'Elden Ring']);
  assert.deepEqual(removeRecentSearch(initial, 'missing'), initial);
});

test('sanitizeRecentSearches filters invalid values, deduplicates, and enforces cap', () => {
  const raw = ['  Elden Ring ', 42, '', 'elden ring', 'Starfield', 'Forspoken', 'Perfect', 'Okish', 'Extra'];
  assert.deepEqual(sanitizeRecentSearches(raw), [
    'Elden Ring',
    'Starfield',
    'Forspoken',
    'Perfect',
    'Okish',
  ]);
  assert.deepEqual(sanitizeRecentSearches({ bad: true }), []);
});

test('loadRecentSearches & saveRecentSearches round-trip and survive corrupt/throwing storage', () => {
  const mem = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
  };

  saveRecentSearches(['Elden Ring', 'Cyberpunk 2077'], mockStorage);
  assert.deepEqual(loadRecentSearches(mockStorage), ['Elden Ring', 'Cyberpunk 2077']);

  mem.set(RECENT_SEARCHES_STORAGE_KEY, '{not-valid-json');
  assert.deepEqual(loadRecentSearches(mockStorage), []);

  const throwingStorage = {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('quota exceeded');
    },
  };
  assert.deepEqual(loadRecentSearches(throwingStorage), []);
  assert.doesNotThrow(() => saveRecentSearches(['Elden Ring'], throwingStorage));
});
