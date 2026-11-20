import { useEffect, useState } from 'react';

export function AppLoader() {
  const [fading, setFading] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const holdMs = reduced ? 60 : 950;

    const fadeTimer = window.setTimeout(() => {
      setFading(true);
    }, holdMs);

    const removeTimer = window.setTimeout(() => {
      setUnmounted(true);
    }, holdMs + 480);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (unmounted) return null;

  return (
    <div
      id="app-loader"
      className={`app-loader ${fading ? 'is-hidden' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="banter-loader" aria-hidden="true">
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
        <div className="banter-loader__box" />
      </div>
      <p>Loading Fluid Flow</p>
    </div>
  );
}
