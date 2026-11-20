import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWallWavePath } from '../src/utils/bentoWave';

test('buildWallWavePath pins start and end anchors cleanly at card boundaries', () => {
  const d0 = buildWallWavePath({
    startX: 112,
    startY: 48,
    endX: 154,
    endY: 47,
    phase: 0,
  });
  const dHalf = buildWallWavePath({
    startX: 112,
    startY: 48,
    endX: 154,
    endY: 47,
    phase: 0.37,
  });

  assert.ok(d0.startsWith('M112.00 48.00 '), `Expected pinned start, got: ${d0.slice(0, 24)}`);
  assert.ok(d0.endsWith('L154.00 47.00'), `Expected pinned end, got: ${d0.slice(-24)}`);
  assert.ok(dHalf.startsWith('M112.00 48.00 '));
  assert.ok(dHalf.endsWith('L154.00 47.00'));
});

test('buildWallWavePath bounds wave amplitude inside safe gap without overlapping center node', () => {
  const d = buildWallWavePath({
    startX: 112,
    startY: 48,
    endX: 154,
    endY: 47,
    phase: 0.25,
    amplitude: 3.2,
    cycles: 2.5,
  });

  const coords = Array.from(d.matchAll(/[ML]([\d.]+)\s+([\d.]+)/g)).map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
  }));

  assert.equal(coords.length, 37);
  for (const pt of coords) {
    assert.ok(pt.x >= 112 && pt.x <= 154, `x out of bounds: ${pt.x}`);
    assert.ok(pt.y >= 43.5 && pt.y <= 51.5, `y exceeded safe wave corridor: ${pt.y}`);
  }
});

test('buildWallWavePath produces smooth wave progression across phases', () => {
  const d1 = buildWallWavePath({
    startX: 112,
    startY: 110,
    endX: 154,
    endY: 107,
    phase: 0,
  });
  const d2 = buildWallWavePath({
    startX: 112,
    startY: 110,
    endX: 154,
    endY: 107,
    phase: 0.2,
  });
  assert.notEqual(d1, d2);
});
