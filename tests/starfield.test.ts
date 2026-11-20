import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceStarfield, createStarfield, getStarFillStyle, STAR_LAYERS } from '../src/utils/starfield.ts';

test('createStarfield generates exact total star count across parallax layers', () => {
  const stars = createStarfield();
  const expectedCount = STAR_LAYERS.reduce((sum, l) => sum + l.count, 0);
  assert.equal(stars.length, expectedCount);

  for (const star of stars) {
    assert.ok(star.xNorm >= 0 && star.xNorm < 1);
    assert.ok(star.yNorm >= 0 && star.yNorm < 1);
    assert.ok(star.speedPx > 0);
  }
});

test('advanceStarfield moves stars slowly upward and wraps seamlessly from top to bottom', () => {
  const stars = [
    {
      xNorm: 0.5,
      yNorm: 0.5,
      size: 1.6,
      baseAlpha: 0.8,
      speedPx: 12,
      twinkleSpeed: 1,
      twinklePhase: 0,
      tint: 'white' as const,
    },
    {
      xNorm: 0.25,
      yNorm: 0.005,
      size: 2.2,
      baseAlpha: 0.9,
      speedPx: 18,
      twinkleSpeed: 1,
      twinklePhase: 0,
      tint: 'mint' as const,
    },
  ];

  // Advance by 1 second on a 1000px viewport: 12px -> -0.012, 18px -> -0.018 (wraps)
  // Using 0.1s steps to stay under per-frame clamp
  for (let i = 0; i < 10; i++) {
    advanceStarfield(stars, 0.1, 1000);
  }

  assert.ok(Math.abs(stars[0].yNorm - 0.488) < 1e-6);
  assert.ok(stars[1].yNorm > 0.98 && stars[1].yNorm < 1);
});

test('getStarFillStyle formats monochrome star colors with clamped alpha', () => {
  assert.equal(getStarFillStyle('white', 0.75), 'rgba(255, 255, 255, 0.75)');
  assert.equal(getStarFillStyle('mint', 1.4), 'rgba(229, 229, 229, 1.00)');
  assert.equal(getStarFillStyle('emerald', -0.2), 'rgba(212, 212, 216, 0.05)');
});
