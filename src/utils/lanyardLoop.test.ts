import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeInfiniteRailTargets,
  computeRailTrackMetrics,
  computeScrollDeltaToCenter,
  computeScrollDeltaToReveal,
  wrapIndex,
  wrapTrackPosition,
} from './lanyardLoop';

test('wrapIndex wraps negative and overflowing indices cyclically', () => {
  assert.equal(wrapIndex(0, 8), 0);
  assert.equal(wrapIndex(8, 8), 0);
  assert.equal(wrapIndex(9, 8), 1);
  assert.equal(wrapIndex(-1, 8), 7);
  assert.equal(wrapIndex(-9, 8), 7);
  assert.equal(wrapIndex(3, 0), 0);
});

test('wrapTrackPosition wraps coordinates seamlessly around center within [-total/2, total/2)', () => {
  const total = 1000;
  const center = 500;
  assert.equal(wrapTrackPosition(500, center, total), 500);
  assert.equal(wrapTrackPosition(1000, center, total), 0);
  assert.equal(wrapTrackPosition(-1, center, total), 999);
  assert.equal(wrapTrackPosition(1500, center, total), 500);
});

test('computeInfiniteRailTargets maintains equal spacing and wraps around cleanly on full loop', () => {
  const { total, pitch } = computeRailTrackMetrics(1440, 124, 8);
  assert.ok(total > 1440);
  assert.ok(pitch >= 124 * 1.28);

  const initial = computeInfiniteRailTargets(1440, 124, 8, 0);
  const fullCycle = computeInfiniteRailTargets(1440, 124, 8, -total);
  assert.equal(initial.xs.length, 8);
  for (let i = 0; i < 8; i++) {
    assert.ok(Math.abs(initial.xs[i]! - fullCycle.xs[i]!) < 1e-6);
  }
});

test('computeScrollDeltaToReveal keeps visible badges still and brings off-edge badges inside safe margins', () => {
  assert.equal(computeScrollDeltaToReveal(720, 1440, 124), 0);
  const leftDelta = computeScrollDeltaToReveal(10, 1440, 124);
  assert.ok(leftDelta > 0);
  assert.ok(10 + leftDelta >= 124 * 0.85 + 24 - 1e-6);

  const rightDelta = computeScrollDeltaToReveal(1430, 1440, 124);
  assert.ok(rightDelta < 0);
  assert.ok(1430 + rightDelta <= 1440 - (124 * 0.85 + 24) + 1e-6);
});

test('computeScrollDeltaToCenter moves clicked card shortest distance to horizontal midpoint', () => {
  assert.equal(computeScrollDeltaToCenter(720, 1440, 1640), 0);
  assert.equal(computeScrollDeltaToCenter(220, 1440, 1640), 500);
  assert.equal(computeScrollDeltaToCenter(1220, 1440, 1640), -500);
  // Shortest wrap path across seam: -90 is 810 away linearly, or +810/-830 wrapped
  assert.equal(computeScrollDeltaToCenter(-100, 1440, 1640), -820);
});
