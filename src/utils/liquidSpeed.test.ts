import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_NAV_LIQUID_SPEED,
  MAX_LIQUID_SPEED,
  MIN_LIQUID_SPEED,
  clampLiquidSpeed,
  computeLiquidFrameDelta,
  formatLiquidSpeed,
} from './liquidSpeed';

test('default navbar liquid speed is slowed down below 1.0x', () => {
  assert.equal(DEFAULT_NAV_LIQUID_SPEED, 0.4);
  assert.ok(DEFAULT_NAV_LIQUID_SPEED < 1);
});

test('clampLiquidSpeed enforces bounds and handles invalid numbers', () => {
  assert.equal(clampLiquidSpeed(0.01), MIN_LIQUID_SPEED);
  assert.equal(clampLiquidSpeed(4.5), MAX_LIQUID_SPEED);
  assert.equal(clampLiquidSpeed(0.3500001), 0.35);
  assert.equal(clampLiquidSpeed(Number.NaN), DEFAULT_NAV_LIQUID_SPEED);
  assert.equal(clampLiquidSpeed(Number.POSITIVE_INFINITY), DEFAULT_NAV_LIQUID_SPEED);
});

test('formatLiquidSpeed renders two decimal places with multiplication sign', () => {
  assert.equal(formatLiquidSpeed(0.4), '0.40×');
  assert.equal(formatLiquidSpeed(1), '1.00×');
  assert.equal(formatLiquidSpeed(0.25), '0.25×');
});

test('computeLiquidFrameDelta scales elapsed frame delta safely', () => {
  assert.ok(Math.abs(computeLiquidFrameDelta(0.02, 0.4) - 0.008) < 1e-9);
  assert.equal(computeLiquidFrameDelta(-0.1, 0.4), 0);
  assert.equal(computeLiquidFrameDelta(Number.NaN, 0.4), 0);
});
