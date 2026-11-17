import { ROUTE_LOADER_LETTERS } from '../utils/appRoute';

export type TransitionLoaderPhase = 'idle' | 'entering' | 'fading';

interface RouteTransitionLoaderProps {
  phase: TransitionLoaderPhase;
}

export function RouteTransitionLoader({ phase }: RouteTransitionLoaderProps) {
  if (phase === 'idle') return null;

  return (
    <div
      data-testid="route-transition-loader"
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className={`route-transition-overlay ${phase === 'fading' ? 'is-fading' : ''}`}
    >
      <div className="loader-wrapper" aria-hidden="true">
        {ROUTE_LOADER_LETTERS.map((letter, idx) => (
          <span key={idx} className="loader-letter">
            {letter}
          </span>
        ))}
        <div className="loader" />
      </div>
    </div>
  );
}
