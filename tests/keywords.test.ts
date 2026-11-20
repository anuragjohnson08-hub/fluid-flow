import assert from 'node:assert/strict';
import test from 'node:test';
import {
  KEYWORDS,
  VERDICT_TIERS,
  filterKeywords,
  getKeywordSummary,
  getVerdictDisplay,
  isValidEmail,
} from '../src/utils/keywords.ts';

test('filterKeywords returns all game reviews on empty query and filters by title, verdict, and suggestion', () => {
  assert.equal(filterKeywords('').length, KEYWORDS.length);
  assert.equal(filterKeywords('   ').length, KEYWORDS.length);

  const perfectMatches = filterKeywords('PERFECT');
  assert.equal(perfectMatches.length, 2);
  assert.deepEqual(
    perfectMatches.map((m) => m.term),
    ['Elden Ring', 'Cyberpunk 2077'],
  );

  const wasteMatches = filterKeywords('time waste');
  assert.equal(wasteMatches.length, 1);
  assert.equal(wasteMatches[0].term, 'Forspoken');

  const suggestionMatches = filterKeywords('mass effect');
  assert.equal(suggestionMatches.length, 1);
  assert.equal(suggestionMatches[0].term, 'Starfield');

  assert.equal(filterKeywords('zzzz').length, 0);
});

test('getKeywordSummary formats singular, plural, and idle Fluid Flow labels accurately', () => {
  assert.deepEqual(getKeywordSummary(4, ''), {
    heading: 'One-Stop Game Reviews',
    subtitle: 'Story · Graphics · Action + Suggestions',
  });
  assert.deepEqual(getKeywordSummary(1, 'okish'), {
    heading: 'Game Reviews · 1 match',
    subtitle: 'Filtered by Fluid Flow Search',
  });
  assert.deepEqual(getKeywordSummary(0, 'zzz'), {
    heading: 'Game Reviews · 0 matches',
    subtitle: 'Filtered by Fluid Flow Search',
  });
});

test('getVerdictDisplay switches between score benchmarks and suggestion rules for Perfect, Okish, and Time Waste', () => {
  assert.deepEqual(
    VERDICT_TIERS.map((t) => getVerdictDisplay(t, false).headline),
    ['6.5 - 8.4', '8.5 - 10', 'Below 6.5'],
  );
  assert.deepEqual(
    VERDICT_TIERS.map((t) => getVerdictDisplay(t, true).headline),
    ['Wait for Sale', 'Must Play', 'Skip Now'],
  );
});

test('isValidEmail validates realistic addresses and rejects invalid ones', () => {
  assert.equal(isValidEmail('alex@example.com'), true);
  assert.equal(isValidEmail('  gamer.tag+reviews@fluidflow.gg '), true);
  assert.equal(isValidEmail('bad'), false);
  assert.equal(isValidEmail('missing@domain'), false);
  assert.equal(isValidEmail(''), false);
});
