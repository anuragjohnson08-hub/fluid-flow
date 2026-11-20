import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppLoader } from './components/layout/AppLoader';
import { CosmicSky } from './components/layout/CosmicSky';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { ClientTestimonial } from './components/sections/ClientTestimonial';
import { FeaturesSection } from './components/sections/FeaturesSection';
import { HeroDashboard } from './components/sections/HeroDashboard';
import { LogosAndBento } from './components/sections/LogosAndBento';
import { PricingSection } from './components/sections/PricingSection';
import { ReviewDeckSection } from './components/sections/ReviewDeckSection';
import { WaitlistSection } from './components/sections/WaitlistSection';
import { PacketCardTransition } from './components/widgets/PacketCardTransition';
import {
  REVIEWS_HASH,
  resolvePageFromLocation,
  type AppPage,
  type PacketOriginRect,
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
  const [packetOrigin, setPacketOrigin] = useState<PacketOriginRect | null>(null);

  const visibleKeywords = useMemo(() => filterKeywords(query), [query]);

  const navigateToReviews = useCallback(
    (originRect?: PacketOriginRect) => {
      setDiOpen(false);
      if (activePage === 'reviews') {
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }
      if (originRect) {
        setPacketOrigin(originRect);
        return;
      }
      if (window.location.hash !== REVIEWS_HASH) {
        window.history.pushState({ page: 'reviews' }, '', REVIEWS_HASH);
      }
      setActivePage('reviews');
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [activePage],
  );

  const handlePacketComplete = useCallback(() => {
    if (window.location.hash !== REVIEWS_HASH) {
      window.history.pushState({ page: 'reviews' }, '', REVIEWS_HASH);
    }
    setActivePage('reviews');
    window.scrollTo({ top: 0, behavior: 'auto' });
    setPacketOrigin(null);
  }, []);

  const navigateToHome = useCallback(
    (sectionId?: string) => {
      setDiOpen(false);
      setPacketOrigin(null);
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

      window.history.pushState({ page: 'home', sectionId: sectionId ?? null }, '', nextUrl);
      setActivePage('home');
      window.setTimeout(() => {
        if (sectionId) {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'auto', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      }, 40);
    },
    [activePage],
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

      {packetOrigin && (
        <PacketCardTransition
          originRect={packetOrigin}
          onComplete={handlePacketComplete}
        />
      )}

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
