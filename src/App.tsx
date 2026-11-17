import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppLoader } from './components/AppLoader';
import { ClientTestimonial } from './components/ClientTestimonial';
import { CosmicSky } from './components/CosmicSky';
import { FeaturesSection } from './components/FeaturesSection';
import { HeroDashboard } from './components/HeroDashboard';
import { LogosAndBento } from './components/LogosAndBento';
import { PricingSection } from './components/PricingSection';
import { ReviewDeckSection } from './components/ReviewDeckSection';
import {
  RouteTransitionLoader,
  type TransitionLoaderPhase,
} from './components/RouteTransitionLoader';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { WaitlistSection } from './components/WaitlistSection';
import {
  REVIEWS_HASH,
  ROUTE_LOADER_FADE_MS,
  ROUTE_LOADER_HOLD_MS,
  resolvePageFromLocation,
  type AppPage,
} from './utils/appRoute';
import { filterKeywords } from './utils/keywords';
import {
  addRecentSearch,
  loadRecentSearches,
  removeRecentSearch,
  saveRecentSearches,
} from './utils/recentSearches';

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>(() =>
    typeof window !== 'undefined' ? resolvePageFromLocation(window.location.hash) : 'home',
  );
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );
  const [diOpen, setDiOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());
  const [termsOpen, setTermsOpen] = useState(true);
  const [transitionPhase, setTransitionPhase] = useState<TransitionLoaderPhase>('idle');
  const transitionTimersRef = useRef<number[]>([]);

  const visibleKeywords = useMemo(() => filterKeywords(query), [query]);

  const clearTransitionTimers = useCallback(() => {
    for (const id of transitionTimersRef.current) {
      window.clearTimeout(id);
    }
    transitionTimersRef.current = [];
  }, []);

  useEffect(() => () => clearTransitionTimers(), [clearTransitionTimers]);

  const runPageTransition = useCallback(
    (switchPage: () => void) => {
      clearTransitionTimers();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const swapMs = reduced ? 10 : 180;
      const holdMs = reduced ? 90 : ROUTE_LOADER_HOLD_MS;
      const fadeMs = reduced ? 60 : ROUTE_LOADER_FADE_MS;

      setTransitionPhase('entering');

      const tSwap = window.setTimeout(() => {
        switchPage();
      }, swapMs);

      const tFade = window.setTimeout(() => {
        setTransitionPhase('fading');
      }, holdMs);

      const tIdle = window.setTimeout(() => {
        setTransitionPhase('idle');
      }, holdMs + fadeMs);

      transitionTimersRef.current = [tSwap, tFade, tIdle];
    },
    [clearTransitionTimers],
  );

  const navigateToReviews = useCallback(() => {
    setDiOpen(false);
    if (activePage === 'reviews') {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    runPageTransition(() => {
      if (window.location.hash !== REVIEWS_HASH) {
        window.history.pushState({ page: 'reviews' }, '', REVIEWS_HASH);
      }
      setActivePage('reviews');
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }, [activePage, runPageTransition]);

  const navigateToHome = useCallback(
    (sectionId?: string) => {
      setDiOpen(false);
      const nextUrl = `${window.location.pathname}${window.location.search}${sectionId ? `#${sectionId}` : ''}`;

      if (activePage === 'home') {
        window.history.pushState({ page: 'home', sectionId: sectionId ?? null }, '', nextUrl);
        if (sectionId) {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      runPageTransition(() => {
        window.history.pushState({ page: 'home', sectionId: sectionId ?? null }, '', nextUrl);
        setActivePage('home');
        window.setTimeout(() => {
          if (sectionId) {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'auto', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'auto' });
          }
        }, 40);
      });
    },
    [activePage, runPageTransition],
  );

  const handleOpenDi = useCallback(() => {
    setDiOpen(true);
  }, []);

  const handleCloseDi = useCallback(() => {
    setDiOpen(false);
    setQuery('');
  }, []);

  const handleCommitSearch = useCallback((rawQuery: string) => {
    setRecentSearches((prev) => {
      const next = addRecentSearch(prev, rawQuery);
      if (next !== prev) {
        saveRecentSearches(next);
      }
      return next;
    });
  }, []);

  const handleRemoveRecentSearch = useCallback((rawQuery: string) => {
    setRecentSearches((prev) => {
      const next = removeRecentSearch(prev, rawQuery);
      saveRecentSearches(next);
      return next;
    });
  }, []);

  const handleClearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    saveRecentSearches([]);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => {
      setIsMobile(mq.matches);
      setDiOpen(false);
      setQuery('');
    };
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      const next = resolvePageFromLocation(window.location.hash);
      setActivePage(next);
      if (next === 'reviews') {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = Array.from(document.querySelectorAll('.reveal, .chart'));
    if (reduced || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activePage]);

  useEffect(() => {
    const root = document.documentElement;
    let rafId = 0;
    let lastX = 0;
    let lastY = 0;

    const updateMouseTracker = () => {
      rafId = 0;
      root.setAttribute('data-site-mouse-active', 'true');
      root.style.setProperty('--site-mx', `${lastX.toFixed(1)}px`);
      root.style.setProperty('--site-my', `${lastY.toFixed(1)}px`);

      const cards = document.querySelectorAll<HTMLElement>('.logo-glow-card');
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--card-mx', `${(lastX - r.left).toFixed(1)}px`);
        card.style.setProperty('--card-my', `${(lastY - r.top).toFixed(1)}px`);
      });
    };

    const handleMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafId === 0) {
        rafId = requestAnimationFrame(updateMouseTracker);
      }
    };

    const handleLeave = () => {
      root.setAttribute('data-site-mouse-active', 'false');
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <>
      <AppLoader />
      <RouteTransitionLoader phase={transitionPhase} />
      <CosmicSky />

      <SiteHeader
        isMobile={isMobile}
        diOpen={diOpen}
        query={query}
        matchCount={visibleKeywords.length}
        visibleKeywords={visibleKeywords}
        recentSearches={recentSearches}
        onOpenDi={handleOpenDi}
        onCloseDi={handleCloseDi}
        onQueryChange={setQuery}
        onCommitSearch={handleCommitSearch}
        onRemoveRecentSearch={handleRemoveRecentSearch}
        onClearRecentSearches={handleClearRecentSearches}
        activePage={activePage}
        onNavigateHome={navigateToHome}
      />

      <main className="relative z-10">
        {activePage === 'reviews' ? (
          <ReviewDeckSection onBackHome={() => navigateToHome()} />
        ) : (
          <>
            <HeroDashboard
              isMobile={isMobile}
              diOpen={diOpen}
              query={query}
              visibleKeywords={visibleKeywords}
              recentSearches={recentSearches}
              onOpenDi={handleOpenDi}
              onCloseDi={handleCloseDi}
              onQueryChange={setQuery}
              onCommitSearch={handleCommitSearch}
              onRemoveRecentSearch={handleRemoveRecentSearch}
              onClearRecentSearches={handleClearRecentSearches}
              onOpenReviews={navigateToReviews}
            />
            <LogosAndBento />
            <FeaturesSection />
            <ClientTestimonial />
            <PricingSection />
            <WaitlistSection />
          </>
        )}
      </main>

      {activePage === 'home' && (
        <SiteFooter termsOpen={termsOpen} onTermsOpenChange={setTermsOpen} />
      )}
    </>
  );
}
