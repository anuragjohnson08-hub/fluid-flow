import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PACKET_CARD_FLIGHT_MS,
  PACKET_TEAR_FLASH_MS,
  PILL_SLIDE_DURATION_MS,
  REVIEWS_HASH,
  computeBackSliderFrame,
  computeIntroPillFrame,
  computePacketCardFrame,
  computePillTearFrame,
  evaluateRetractEase,
  evaluateSpringEase,
  getSectionScrollTarget,
  resolvePageFromLocation,
} from '../src/utils/appRoute';

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

test('intro and back pill slide duration and packet timings stay responsive', () => {
  assert.ok(PILL_SLIDE_DURATION_MS >= 400);
  assert.ok(PACKET_TEAR_FLASH_MS > 100);
  assert.ok(PACKET_CARD_FLIGHT_MS >= 800);
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
  assert.ok(mid.trackBackground.includes('rgba(212, 212, 216,'));

  const overshoot = computeIntroPillFrame(426, 420, 50);
  assert.equal(overshoot.travelPx, 426);
  assert.equal(overshoot.progress, 1);
  assert.equal(overshoot.textShiftPx, -50);
});

test('computePillTearFrame progressively unzips top seam and flashes at end burst', () => {
  const sealed = computePillTearFrame(0, 0);
  assert.equal(sealed.seamPct, 0);
  assert.equal(sealed.lipLiftPx, 0);
  assert.equal(sealed.glowOpacity, 0);
  assert.equal(sealed.flashOpacity, 0);

  const sliding = computePillTearFrame(0.5, 0);
  assert.equal(sliding.seamPct, 50);
  assert.ok(sliding.lipLiftPx > 0);
  assert.ok(sliding.glowOpacity > 0.4);
  assert.equal(sliding.flashOpacity, 0);

  const bursting = computePillTearFrame(1, 0.5);
  assert.equal(bursting.seamPct, 100);
  assert.ok(bursting.lipLiftPx > sliding.lipLiftPx);
  assert.ok(bursting.flashOpacity > 0.9);
});

test('computePacketCardFrame emerges from pill slit, bounces at center, and fits full viewport', () => {
  const origin = { left: 520, top: 164, width: 400, height: 36 };
  const viewport = { width: 1440, height: 900 };

  const start = computePacketCardFrame(0, origin, viewport);
  assert.equal(start.phase, 'pull');
  assert.ok(start.clipBottomPx > 100);
  assert.ok(start.left >= origin.left - 60);

  const bounce = computePacketCardFrame(0.46, origin, viewport);
  assert.equal(bounce.phase, 'bounce');
  assert.equal(bounce.clipBottomPx, 0);
  assert.ok(bounce.scale > 1.01);
  assert.ok(bounce.borderRadius > 16);

  const full = computePacketCardFrame(1, origin, viewport);
  assert.equal(full.phase, 'expand');
  assert.equal(full.left, 0);
  assert.equal(full.top, 0);
  assert.equal(full.width, viewport.width);
  assert.equal(full.height, viewport.height);
  assert.equal(full.borderRadius, 0);
  assert.equal(full.contentScale, 1);
  assert.equal(full.clipBottomPx, 0);
  assert.equal(full.borderOpacity, 0);
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
  assert.ok(mid.trackBackground.includes('rgba(212, 212, 216,'));

  const end = computeBackSliderFrame(204, 200, 58);
  assert.equal(end.progress, 1);
  assert.equal(end.thumbTranslateX, -204);
  assert.equal(end.textShiftPx, 58);
});
