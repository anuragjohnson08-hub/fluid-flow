import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PILL_SLIDE_DURATION_MS,
  REVIEWS_HASH,
  ROUTE_LOADER_FADE_MS,
  ROUTE_LOADER_HOLD_MS,
  ROUTE_LOADER_LETTERS,
  computeBackSliderFrame,
  computeIntroPillFrame,
  evaluateRetractEase,
  evaluateSpringEase,
  getSectionScrollTarget,
  resolvePageFromLocation,
} from './appRoute';

test('resolvePageFromLocation resolves #/reviews and aliases to reviews page', () => {
  assert.equal(resolvePageFromLocation(REVIEWS_HASH), 'reviews');
  assert.equal(resolvePageFromLocation('  #/REVIEWS '), 'reviews');
  assert.equal(resolvePageFromLocation('#reviews'), 'reviews');
  assert.equal(resolvePageFromLocation('#review-deck'), 'reviews');
});

test('resolvePageFromLocation defaults empty and home hashes to home page', () => {
  assert.equal(resolvePageFromLocation(''), 'home');
  assert.equal(resolvePageFromLocation('#'), 'home');
  assert.equal(resolvePageFromLocation('#/'), 'home');
  assert.equal(resolvePageFromLocation('#bento'), 'home');
  assert.equal(resolvePageFromLocation('#pricing'), 'home');
});

test('getSectionScrollTarget extracts valid section anchor IDs and ignores route hashes', () => {
  assert.equal(getSectionScrollTarget('#bento'), 'bento');
  assert.equal(getSectionScrollTarget('#pricing'), 'pricing');
  assert.equal(getSectionScrollTarget('/#cta'), 'cta');
  assert.equal(getSectionScrollTarget('#/reviews'), null);
  assert.equal(getSectionScrollTarget('#'), null);
  assert.equal(getSectionScrollTarget(''), null);
});

test('route loader configuration aligns 10 letter slots and positive transition timings', () => {
  assert.equal(ROUTE_LOADER_LETTERS.length, 10);
  assert.equal(ROUTE_LOADER_LETTERS.join(''), 'Loading...');
  assert.ok(PILL_SLIDE_DURATION_MS >= 400);
  assert.equal(ROUTE_LOADER_HOLD_MS, 1400);
  assert.ok(ROUTE_LOADER_FADE_MS > 0);
});

test('evaluateSpringEase and evaluateRetractEase map [0, 1] monotonically to endpoints', () => {
  assert.equal(evaluateSpringEase(-0.2), 0);
  assert.equal(evaluateSpringEase(0), 0);
  assert.ok(evaluateSpringEase(0.25) > 0.5 && evaluateSpringEase(0.25) < 0.8);
  assert.ok(evaluateSpringEase(0.66) > 1.0);
  assert.equal(evaluateSpringEase(1), 1);
  assert.equal(evaluateSpringEase(1.4), 1);

  assert.equal(evaluateRetractEase(0), 0);
  assert.ok(evaluateRetractEase(0.5) > 0.8);
  assert.equal(evaluateRetractEase(1), 1);
});

test('computeIntroPillFrame clamps progress and computes text shift and track gradient', () => {
  const start = computeIntroPillFrame(0, 420, 50);
  assert.equal(start.progress, 0);
  assert.equal(start.textShiftPx, 0);
  assert.ok(start.trackBackground.includes('0%'));

  const mid = computeIntroPillFrame(210, 420, 50);
  assert.equal(mid.progress, 0.5);
  assert.equal(mid.textShiftPx, -25);
  assert.ok(mid.trackBackground.includes('50%'));
  assert.ok(mid.trackBackground.includes('rgba(239, 68, 68,'));

  const overshoot = computeIntroPillFrame(426, 420, 50);
  assert.equal(overshoot.travelPx, 426);
  assert.equal(overshoot.progress, 1);
  assert.equal(overshoot.textShiftPx, -50);
});

test('computeBackSliderFrame moves thumb right-to-left and shifts label positively', () => {
  const start = computeBackSliderFrame(0, 200, 58);
  assert.equal(start.progress, 0);
  assert.equal(start.thumbTranslateX, 0);
  assert.equal(start.textShiftPx, 0);
  assert.ok(start.trackBackground.includes('270deg'));
  assert.ok(start.trackBackground.includes('0%'));

  const mid = computeBackSliderFrame(100, 200, 58);
  assert.equal(mid.progress, 0.5);
  assert.equal(mid.thumbTranslateX, -100);
  assert.equal(mid.textShiftPx, 29);
  assert.ok(mid.trackBackground.includes('50%'));
  assert.ok(mid.trackBackground.includes('rgba(239, 68, 68,'));

  const end = computeBackSliderFrame(204, 200, 58);
  assert.equal(end.progress, 1);
  assert.equal(end.thumbTranslateX, -204);
  assert.equal(end.textShiftPx, 58);
});
