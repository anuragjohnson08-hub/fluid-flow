export interface SurfaceRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
}

export interface SurfaceCanvasBounds {
  canvasLeft: number;
  canvasTop: number;
  canvasWidth: number;
  canvasHeight: number;
  hostOffsetX: number;
  hostOffsetY: number;
}

export function computeSurfaceCanvasBounds(
  hostWidth: number,
  hostHeight: number,
  pad: number,
  subPanel: SurfaceRect | null,
): SurfaceCanvasBounds {
  const safeW = Math.max(1, hostWidth);
  const safeH = Math.max(1, hostHeight);
  const validSub =
    subPanel && subPanel.width > 1 && subPanel.height > 1 ? subPanel : null;

  const minX = validSub ? Math.min(0, validSub.x) : 0;
  const minY = validSub ? Math.min(0, validSub.y) : 0;
  const maxX = validSub ? Math.max(safeW, validSub.x + validSub.width) : safeW;
  const maxY = validSub ? Math.max(safeH, validSub.y + validSub.height) : safeH;

  return {
    canvasLeft: minX - pad,
    canvasTop: minY - pad,
    canvasWidth: Math.max(1, maxX - minX) + pad * 2,
    canvasHeight: Math.max(1, maxY - minY) + pad * 2,
    hostOffsetX: pad - minX,
    hostOffsetY: pad - minY,
  };
}

export function computeBridgeRect(
  triggerRect: SurfaceRect | null,
  subPanel: SurfaceRect | null,
): SurfaceRect | null {
  if (
    !triggerRect ||
    !subPanel ||
    triggerRect.width <= 1 ||
    triggerRect.height <= 1 ||
    subPanel.width <= 1 ||
    subPanel.height <= 1
  ) {
    return null;
  }

  const triggerBottom = triggerRect.y + triggerRect.height;
  const bridgeTop = Math.max(0, triggerBottom - 8);
  const bridgeBottom = subPanel.y + 12;
  const bridgeHeight = bridgeBottom - bridgeTop;
  if (bridgeHeight <= 2) {
    return null;
  }

  const rawLeft = Math.max(subPanel.x + 8, triggerRect.x + 4);
  const rawRight = Math.min(
    subPanel.x + subPanel.width - 8,
    triggerRect.x + triggerRect.width - 4,
  );

  let bridgeLeft = rawLeft;
  let bridgeWidth = rawRight - rawLeft;

  if (bridgeWidth < 24) {
    bridgeWidth = Math.max(24, Math.min(triggerRect.width * 0.72, subPanel.width - 16));
    const centerX = triggerRect.x + triggerRect.width * 0.5;
    bridgeLeft = Math.max(
      subPanel.x + 8,
      Math.min(subPanel.x + subPanel.width - 8 - bridgeWidth, centerX - bridgeWidth * 0.5),
    );
  }

  return {
    x: bridgeLeft,
    y: bridgeTop,
    width: bridgeWidth,
    height: bridgeHeight,
    radius: 8,
  };
}

export function computeWaterStepBounds(
  hostWidth: number,
  hostHeight: number,
  subPanel: SurfaceRect | null,
  y: number,
  q: number,
  r: number,
): { loX: number; hiX: number; loY: number; hiY: number } {
  const validSub =
    subPanel && subPanel.width > 1 && subPanel.height > 1 ? subPanel : null;

  const inSubPanel = Boolean(validSub && y > hostHeight + 2);
  const xMin = inSubPanel && validSub ? validSub.x : validSub ? Math.min(0, validSub.x) : 0;
  const xMax =
    inSubPanel && validSub
      ? validSub.x + validSub.width
      : validSub
        ? Math.max(hostWidth, validSub.x + validSub.width)
        : hostWidth;

  const loX = xMin + 6 + q + r - 3;
  const hiX = Math.max(loX, xMax - 6 - q - r + 3);

  const yMax = validSub ? Math.max(hostHeight, validSub.y + validSub.height) : hostHeight;
  const loY = 6 + r - 3;
  const hiY = Math.max(loY, yMax - 6 - r + 3);

  return { loX, hiX, loY, hiY };
}

export function isDropletInsideHost(
  aY: number,
  bY: number,
  hostHeight: number,
): boolean {
  return Math.max(aY, bY) <= hostHeight + 4;
}

export function isVerticalTravel(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  orientation: 'horizontal' | 'vertical',
): boolean {
  if (orientation === 'vertical') return true;
  return Math.abs(ay - by) > Math.abs(ax - bx) * 1.25;
}
