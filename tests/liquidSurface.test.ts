import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeBridgeRect,
  computeSurfaceCanvasBounds,
  computeWaterStepBounds,
  isDropletInsideHost,
  isVerticalTravel,
} from '../src/utils/liquidSurface';

test('computeSurfaceCanvasBounds keeps host bounds when no subPanel is open', () => {
  const bounds = computeSurfaceCanvasBounds(520, 44, 14, null);
  assert.deepEqual(bounds, {
    canvasLeft: -14,
    canvasTop: -14,
    canvasWidth: 548,
    canvasHeight: 72,
    hostOffsetX: 14,
    hostOffsetY: 14,
  });
});

test('computeSurfaceCanvasBounds expands downward to cover open dropdown subPanel', () => {
  const bounds = computeSurfaceCanvasBounds(520, 44, 14, {
    x: 112,
    y: 54,
    width: 232,
    height: 178,
    radius: 16,
  });
  assert.deepEqual(bounds, {
    canvasLeft: -14,
    canvasTop: -14,
    canvasWidth: 548,
    canvasHeight: 260,
    hostOffsetX: 14,
    hostOffsetY: 14,
  });
});

test('computeSurfaceCanvasBounds shifts hostOffsetX if subPanel extends left of host', () => {
  const bounds = computeSurfaceCanvasBounds(400, 44, 14, {
    x: -20,
    y: 54,
    width: 200,
    height: 160,
  });
  assert.equal(bounds.canvasLeft, -34);
  assert.equal(bounds.hostOffsetX, 34);
  assert.equal(bounds.canvasWidth, 448);
});

test('computeBridgeRect connects trigger button bottom to subPanel top', () => {
  const bridge = computeBridgeRect(
    { x: 6, y: 4, width: 96, height: 34 },
    { x: 6, y: 54, width: 256, height: 178 },
  );
  assert.ok(bridge !== null);
  assert.equal(bridge.x, 14);
  assert.equal(bridge.y, 30);
  assert.equal(bridge.width, 84);
  assert.equal(bridge.height, 36);
});

test('computeBridgeRect returns null when subPanel already overlaps trigger', () => {
  const bridge = computeBridgeRect(
    { x: 6, y: 4, width: 96, height: 34 },
    { x: 6, y: 12, width: 256, height: 120 },
  );
  assert.equal(bridge, null);
});

test('computeWaterStepBounds unlocks vertical travel into open subPanel', () => {
  const boundsInSub = computeWaterStepBounds(
    520,
    44,
    { x: 112, y: 54, width: 232, height: 178 },
    140,
    92,
    20,
  );
  assert.ok(boundsInSub.hiY > 200);
  assert.ok(boundsInSub.loX >= 112);
  assert.ok(boundsInSub.hiX <= 112 + 232);
});

test('isDropletInsideHost detects when both droplet bodies have returned to top bar', () => {
  assert.equal(isDropletInsideHost(22, 24, 44), true);
  assert.equal(isDropletInsideHost(22, 110, 44), false);
});

test('isVerticalTravel detects vertical dropdown transitions even in horizontal nav mode', () => {
  assert.equal(isVerticalTravel(100, 22, 110, 140, 'horizontal'), true);
  assert.equal(isVerticalTravel(50, 22, 240, 24, 'horizontal'), false);
  assert.equal(isVerticalTravel(50, 22, 60, 24, 'vertical'), true);
});
