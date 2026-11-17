export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

export function wrapTrackPosition(rawX: number, center: number, total: number): number {
  if (total <= 0) return rawX;
  const half = total / 2;
  const offset = ((((rawX - center + half) % total) + total) % total) - half;
  return center + offset;
}

export function computeRailTrackMetrics(width: number, badgeWidth: number, count: number): {
  pitch: number;
  total: number;
} {
  if (count <= 0 || width <= 0 || badgeWidth <= 0) {
    return { pitch: 0, total: 0 };
  }
  const minTrack = width + badgeWidth * 1.6;
  const minPitchTrack = count * badgeWidth * 1.28;
  const total = Math.max(minTrack, minPitchTrack);
  const pitch = total / count;
  return { pitch, total };
}

export function computeInfiniteRailTargets(
  width: number,
  badgeWidth: number,
  count: number,
  scrollOffset: number,
): { xs: number[]; total: number; pitch: number } {
  const { pitch, total } = computeRailTrackMetrics(width, badgeWidth, count);
  if (count <= 0 || total <= 0) {
    return { xs: [], total: 0, pitch: 0 };
  }
  const center = width / 2;
  const xs = Array.from({ length: count }, (_, i) =>
    wrapTrackPosition(center + (i - (count - 1) / 2) * pitch + scrollOffset, center, total),
  );
  return { xs, total, pitch };
}

export function computeScrollDeltaToReveal(
  currentX: number,
  width: number,
  badgeWidth: number,
): number {
  if (width <= 0) return 0;
  const margin = badgeWidth * 0.85 + 24;
  if (currentX < margin) {
    return margin - currentX;
  }
  if (currentX > width - margin) {
    return width - margin - currentX;
  }
  return 0;
}

export function computeScrollDeltaToCenter(
  currentX: number,
  width: number,
  total = 0,
): number {
  if (width <= 0) return 0;
  let delta = width / 2 - currentX;
  if (total > 0) {
    const half = total / 2;
    delta = ((((delta + half) % total) + total) % total) - half;
  }
  return Math.abs(delta) < 0.5 ? 0 : delta;
}
