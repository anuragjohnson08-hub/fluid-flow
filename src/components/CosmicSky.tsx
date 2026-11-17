import { useEffect, useRef, useState } from 'react';
import { advanceStarfield, createStarfield, getStarFillStyle } from '../utils/starfield';

export function CosmicSky() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isReduced = motionQuery.matches;
    setReducedMotion(isReduced);

    const stars = createStarfield();
    let width = window.innerWidth || 1280;
    let height = window.innerHeight || 800;

    const resize = () => {
      width = window.innerWidth || 1280;
      height = window.innerHeight || 800;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const renderFrame = (timeSeconds: number) => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const x = star.xNorm * width;
        const y = star.yNorm * (height + star.size * 2) - star.size;
        const twinkle = isReduced
          ? 0
          : Math.sin(timeSeconds * star.twinkleSpeed + star.twinklePhase) * 0.14;
        const alpha = star.baseAlpha + twinkle;
        ctx.fillStyle = getStarFillStyle(star.tint, alpha);
        ctx.fillRect(x, y, star.size, star.size);
      }
    };

    resize();
    renderFrame(0);

    let rafId = 0;
    let lastTs = 0;

    const loop = (now: number) => {
      if (isReduced) {
        rafId = 0;
        return;
      }
      if (!document.hidden) {
        if (lastTs === 0) lastTs = now;
        const dt = (now - lastTs) / 1000;
        lastTs = now;
        advanceStarfield(stars, dt, height);
        renderFrame(now / 1000);
      } else {
        lastTs = now;
      }
      rafId = window.requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (!isReduced && rafId === 0) {
        lastTs = 0;
        rafId = window.requestAnimationFrame(loop);
      }
    };

    const stopLoop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      isReduced = event.matches;
      setReducedMotion(isReduced);
      if (isReduced) {
        stopLoop();
        renderFrame(0);
      } else {
        startLoop();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    startLoop();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      stopLoop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <div
      className="sky-container"
      data-live-background={reducedMotion ? 'reduced-motion' : 'active'}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} id="star-canvas" />
      <div className="shooting-star" style={{ left: '8%', top: '12%' }} />
      <div className="shooting-star s2" style={{ left: '52%', top: '6%' }} />
      <div className="shooting-star s3" style={{ left: '72%', top: '28%' }} />
    </div>
  );
}
