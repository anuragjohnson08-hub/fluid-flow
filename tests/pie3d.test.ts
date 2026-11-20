import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPie3DSlices, clipFrontArcs } from '../src/utils/pie3d.ts';

const SAMPLE_SLICES = [
  { label: 'Perfect', share: 38, topColor: '#34d399', sideColor: '#059669', textClass: 'text-emerald-300' },
  { label: 'Okish', share: 41, topColor: '#fbbf24', sideColor: '#d97706', textClass: 'text-amber-300' },
  { label: 'Time Waste', share: 21, topColor: '#fb7185', sideColor: '#e11d48', textClass: 'text-rose-300' },
];

test('clipFrontArcs isolates front-facing cylinder ranges across wrapping angles', () => {
  assert.deepEqual(clipFrontArcs(-0.5, 0.5), [[0, 0.5]]);
  assert.deepEqual(clipFrontArcs(Math.PI + 0.2, Math.PI * 1.9), []);
  const wrapped = clipFrontArcs(Math.PI * 0.5, Math.PI * 2.5);
  assert.equal(wrapped.length, 2);
});

test('buildPie3DSlices handles 0 sweep, partial sweep, and clean 3D pie extrusion without waves', () => {
  const opts = { cx: 64, cy: 32, rx: 50, ry: 21, depth: 12 };

  assert.equal(buildPie3DSlices(SAMPLE_SLICES, { ...opts, sweep: 0 }).length, 0);

  const half = buildPie3DSlices(SAMPLE_SLICES, { ...opts, sweep: 0.5 });
  assert.equal(half.length, 3);
  assert.ok(half.every((s) => s.topPath.startsWith('M 64 32 L ') && s.topPath.includes(' A 50 21 ')));

  const full = buildPie3DSlices(SAMPLE_SLICES, { ...opts, sweep: 1 });
  assert.equal(full.length, 3);
  assert.ok(full.some((s) => s.sidePaths.length > 0));
  assert.ok(full.every((s) => s.topPath.includes('A 50 21')));
});
