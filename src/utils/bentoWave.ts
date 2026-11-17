export interface WallWaveOptions {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  phase: number;
  amplitude?: number;
  cycles?: number;
  steps?: number;
}

/**
 * Generates an SVG path string with flat lead-in/lead-out anchors (`—`) and
 * gentle undulating crests in the middle (`—/\\-/\\-`), keeping endpoints pinned.
 */
export function buildWallWavePath({
  startX,
  startY,
  endX,
  endY,
  phase,
  amplitude = 3.2,
  cycles = 2.5,
  steps = 36,
}: WallWaveOptions): string {
  const safeSteps = Math.max(8, Math.round(steps));
  const points: string[] = [];

  for (let i = 0; i <= safeSteps; i++) {
    const u = i / safeSteps;
    const x = startX + (endX - startX) * u;
    const baseY = startY + (endY - startY) * u;

    // Taper to zero at both endpoints so lead-in and lead-out stay anchored cleanly (`—`).
    const envelope = Math.pow(Math.sin(Math.PI * u), 1.35);
    const displacement = Math.sin(2 * Math.PI * (cycles * u - phase)) * amplitude * envelope;
    const y = i === 0 ? startY : i === safeSteps ? endY : baseY + displacement;

    const cmd = i === 0 ? 'M' : 'L';
    points.push(`${cmd}${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join(' ');
}
