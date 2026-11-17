export interface PieInputSlice {
  label: string;
  share: number;
  topColor: string;
  sideColor: string;
  textClass: string;
}

export interface Pie3DSliceGeometry {
  label: string;
  share: number;
  topColor: string;
  sideColor: string;
  textClass: string;
  topPath: string;
  sidePaths: string[];
  midAngle: number;
}

export interface Pie3DOptions {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  depth: number;
  startAngle?: number;
  sweep?: number;
}

const TAU = Math.PI * 2;

export function clipFrontArcs(a0: number, a1: number): Array<[number, number]> {
  if (a1 <= a0) return [];
  const segments: Array<[number, number]> = [];
  const kMin = Math.floor(a0 / TAU) - 1;
  const kMax = Math.ceil(a1 / TAU) + 1;

  for (let k = kMin; k <= kMax; k++) {
    const frontStart = k * TAU;
    const frontEnd = frontStart + Math.PI;
    const s = Math.max(a0, frontStart);
    const e = Math.min(a1, frontEnd);
    if (e - s > 0.004) {
      segments.push([s, e]);
    }
  }
  return segments;
}

function pointOnEllipse(cx: number, cy: number, rx: number, ry: number, angle: number) {
  return {
    x: Number((cx + rx * Math.cos(angle)).toFixed(2)),
    y: Number((cy + ry * Math.sin(angle)).toFixed(2)),
  };
}

export function buildPie3DSlices(
  items: PieInputSlice[],
  options: Pie3DOptions,
): Pie3DSliceGeometry[] {
  const {
    cx,
    cy,
    rx,
    ry,
    depth,
    startAngle = -Math.PI * 0.68,
    sweep = 1,
  } = options;

  const clampedSweep = Math.max(0, Math.min(1, sweep));
  if (clampedSweep <= 0.001) return [];

  const total = items.reduce((acc, item) => acc + Math.max(0, item.share), 0);
  if (total <= 0) return [];

  const totalAngle = TAU * clampedSweep;
  let cursor = startAngle;

  return items
    .filter((item) => item.share > 0)
    .map((item) => {
      const span = (item.share / total) * totalAngle;
      const a0 = cursor;
      const a1 = cursor + span;
      cursor = a1;

      let topPath = '';
      if (span >= TAU - 0.002) {
        const mid = a0 + Math.PI;
        const p0 = pointOnEllipse(cx, cy, rx, ry, a0);
        const pm = pointOnEllipse(cx, cy, rx, ry, mid);
        topPath = [
          `M ${p0.x} ${p0.y}`,
          `A ${rx} ${ry} 0 1 1 ${pm.x} ${pm.y}`,
          `A ${rx} ${ry} 0 1 1 ${p0.x} ${p0.y}`,
          'Z',
        ].join(' ');
      } else {
        const p0 = pointOnEllipse(cx, cy, rx, ry, a0);
        const p1 = pointOnEllipse(cx, cy, rx, ry, a1);
        const largeArc = span > Math.PI ? 1 : 0;
        topPath = [
          `M ${cx} ${cy}`,
          `L ${p0.x} ${p0.y}`,
          `A ${rx} ${ry} 0 ${largeArc} 1 ${p1.x} ${p1.y}`,
          'Z',
        ].join(' ');
      }

      const sidePaths = clipFrontArcs(a0, a1).map(([f0, f1]) => {
        const t0 = pointOnEllipse(cx, cy, rx, ry, f0);
        const t1 = pointOnEllipse(cx, cy, rx, ry, f1);
        const b0 = pointOnEllipse(cx, cy + depth, rx, ry, f0);
        const b1 = pointOnEllipse(cx, cy + depth, rx, ry, f1);
        return [
          `M ${t0.x} ${t0.y}`,
          `A ${rx} ${ry} 0 0 1 ${t1.x} ${t1.y}`,
          `L ${b1.x} ${b1.y}`,
          `A ${rx} ${ry} 0 0 0 ${b0.x} ${b0.y}`,
          'Z',
        ].join(' ');
      });

      return {
        label: item.label,
        share: item.share,
        topColor: item.topColor,
        sideColor: item.sideColor,
        textClass: item.textClass,
        topPath,
        sidePaths,
        midAngle: (a0 + a1) / 2,
      };
    });
}
