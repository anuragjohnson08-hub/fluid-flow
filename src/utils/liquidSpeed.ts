export const MIN_LIQUID_SPEED = 0.1;
export const MAX_LIQUID_SPEED = 1.2;
export const LIQUID_SPEED_STEP = 0.05;
export const DEFAULT_NAV_LIQUID_SPEED = 0.4;

export const NAV_LIQUID_SPEED_PRESETS = [0.2, 0.4, 0.65, 1.0] as const;

export function clampLiquidSpeed(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_NAV_LIQUID_SPEED;
  }
  const clamped = Math.min(MAX_LIQUID_SPEED, Math.max(MIN_LIQUID_SPEED, value));
  return Math.round(clamped * 100) / 100;
}

export function formatLiquidSpeed(speed: number): string {
  return `${clampLiquidSpeed(speed).toFixed(2)}×`;
}

export function computeLiquidFrameDelta(elapsedSeconds: number, speedMultiplier: number): number {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    return 0;
  }
  return elapsedSeconds * clampLiquidSpeed(speedMultiplier);
}
