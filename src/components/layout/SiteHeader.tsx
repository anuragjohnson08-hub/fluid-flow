import {
  BarChart3,
  Bell,
  ChevronDown,
  Code2,
  FileCheck,
  Link2,
  Menu,
  Radar,
  Sparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { AppPage } from '../../utils/appRoute';
import { getSectionScrollTarget } from '../../utils/appRoute';
import type { KeywordRow } from '../../utils/keywords';
import { LiquidWaterSurface } from '../ui/liquid-glass-navbar';
import { DynamicIsland } from '../widgets/DynamicIsland';

interface SiteHeaderProps {
  isMobile: boolean;
  diOpen: boolean;
  query: string;
  matchCount: number;
  visibleKeywords: KeywordRow[];
  recentSearches: string[];
  onOpenDi: () => void;
  onCloseDi: () => void;
  onQueryChange: (value: string) => void;
  onCommitSearch: (value: string) => void;
  onRemoveRecentSearch: (value: string) => void;
  onClearRecentSearches: () => void;
  activePage?: AppPage;
  onNavigateHome?: (sectionId?: string) => void;
}

type DesktopMenuId = 'features' | 'developers' | 'company';

export function SiteHeader({
  isMobile,
  diOpen,
  query,
  matchCount,
  visibleKeywords,
  recentSearches,
  onOpenDi,
  onCloseDi,
  onQueryChange,
  onCommitSearch,
  onRemoveRecentSearch,
  onClearRecentSearches,
  activePage = 'home',
  onNavigateHome,
}: SiteHeaderProps) {
  const [openMenu, setOpenMenu] = useState<DesktopMenuId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNavIndex, setActiveNavIndex] = useState(0);
  const [hoveredDropIndex, setHoveredDropIndex] = useState<number | null>(null);
  const [navRipple, setNavRipple] = useState<{ index: number; seq: number } | null>(null);
  const lastHoverOpenRef = useRef<{ id: DesktopMenuId; at: number } | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);
  const mobileContentRef = useRef<HTMLDivElement | null>(null);
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const desktopItemRefs = useRef<(HTMLElement | null)[]>([]);
  const menuPanelRefs = useRef<Record<DesktopMenuId, HTMLDivElement | null>>({
    features: null,
    developers: null,
    company: null,
  });
  const activeSubPanelRef = useRef<HTMLElement | null>(null);
  const activeBridgeTriggerRef = useRef<HTMLElement | null>(null);
  const [morphMetrics, setMorphMetrics] = useState({
    ballTop: 11,
    ballRight: 17,
    ballWidth: 36,
    ballHeight: 36,
    openTop: 66,
    openWidth: 358,
    openHeight: 300,
  });

  const measureMobileMorph = useCallback(() => {
    const pill = pillRef.current;
    const btn = menuBtnRef.current;
    const content = mobileContentRef.current;
    if (!pill || !btn || !content) return;
    const pillRect = pill.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    if (pillRect.width === 0 || btnRect.width === 0) return;
    setMorphMetrics({
      ballTop: Math.round(btnRect.top - pillRect.top),
      ballRight: Math.round(pillRect.right - btnRect.right),
      ballWidth: Math.round(btnRect.width),
      ballHeight: Math.round(btnRect.height),
      openTop: Math.round(pillRect.height + 8),
      openWidth: Math.round(pillRect.width),
      openHeight: Math.round(content.scrollHeight + 2),
    });
  }, []);

  useLayoutEffect(() => {
    measureMobileMorph();
    window.addEventListener('resize', measureMobileMorph);
    return () => window.removeEventListener('resize', measureMobileMorph);
  }, [measureMobileMorph, isMobile]);

  const activeMenu = openMenu;
  const waterActiveIndex =
    openMenu !== null && hoveredDropIndex !== null ? hoveredDropIndex : activeNavIndex;

  useLayoutEffect(() => {
    if (!openMenu) {
      activeSubPanelRef.current = null;
      activeBridgeTriggerRef.current = null;
      return;
    }
    activeSubPanelRef.current = menuPanelRefs.current[openMenu];
    const triggerIdx = openMenu === 'features' ? 0 : openMenu === 'developers' ? 1 : 2;
    activeBridgeTriggerRef.current = desktopItemRefs.current[triggerIdx];
  }, [openMenu]);

  const closeMenus = () => {
    lastHoverOpenRef.current = null;
    setOpenMenu(null);
    setHoveredDropIndex(null);
  };

  const triggerDesktopNavSelect = (idx: number) => {
    setActiveNavIndex(idx);
    setHoveredDropIndex(null);
    setNavRipple((prev) => ({ index: idx, seq: (prev?.seq ?? 0) + 1 }));
  };

  const handleMenuPointerEnter = (id: DesktopMenuId, idx: number, pointerType: string) => {
    if (pointerType === 'touch') return;
    lastHoverOpenRef.current = { id, at: Date.now() };
    setOpenMenu(id);
    setActiveNavIndex(idx);
    setHoveredDropIndex(null);
  };

  const handleMenuPointerLeave = (id: DesktopMenuId, pointerType: string) => {
    if (pointerType === 'touch') return;
    if (lastHoverOpenRef.current?.id === id) {
      lastHoverOpenRef.current = null;
    }
    setOpenMenu((prev) => (prev === id ? null : prev));
    setHoveredDropIndex(null);
  };

  const handleMenuClick = (id: DesktopMenuId, idx: number) => {
    triggerDesktopNavSelect(idx);
    setOpenMenu((prev) => {
      if (prev === id) {
        const hoverInfo = lastHoverOpenRef.current;
        if (hoverInfo && hoverInfo.id === id && Date.now() - hoverInfo.at < 240) {
          lastHoverOpenRef.current = null;
          return id;
        }
        lastHoverOpenRef.current = null;
        return null;
      }
      lastHoverOpenRef.current = null;
      return id;
    });
  };

  useEffect(() => {
    const closeAll = () => {
      lastHoverOpenRef.current = null;
      setOpenMenu(null);
      setHoveredDropIndex(null);
      setMobileMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        lastHoverOpenRef.current = null;
        setOpenMenu(null);
        setHoveredDropIndex(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', closeAll);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleHeaderAnchorClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!onNavigateHome) return;
    const anchor = (e.target as HTMLElement | null)?.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') ?? '';
    if (href === '#' || href === '#/') {
      e.preventDefault();
      closeMenus();
      setMobileMenuOpen(false);
      onNavigateHome();
      return;
    }
    const sectionId = getSectionScrollTarget(href);
    if (sectionId && activePage === 'reviews') {
      e.preventDefault();
      closeMenus();
      setMobileMenuOpen(false);
      onNavigateHome(sectionId);
    }
  };

  return (
    <header
      className="fixed inset-x-0 top-4 z-50 px-4"
      onClick={handleHeaderAnchorClick}
    >
      <div
        ref={pillRef}
        className="relative mx-auto flex max-w-[1080px] items-center justify-between gap-2 sm:gap-3 rounded-full border border-[#262626] bg-[#000000]/95 backdrop-blur-xl px-3 sm:px-4 py-2.5 shadow-[0_8px_40px_-12px_rgba(0,0,0,.9)]"
      >
        <div className="flex items-center gap-2.5 shrink-0">
          <a href="#/" className="flex items-center gap-2 shrink-0" aria-label="Fluid Flow home">
            <svg
              className="h-7 w-7 shrink-0 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.65)]"
              viewBox="0 0 28 28"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="orb-logo" cx=".35" cy=".3" r="1">
                  <stop offset="0%" stopColor="#D9F99D" />
                  <stop offset="45%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#065F46" />
                </radialGradient>
              </defs>
              <circle cx="14" cy="14" r="12" fill="url(#orb-logo)" />
              <ellipse cx="10" cy="9" rx="4" ry="2.5" fill="#fff" opacity=".55" />
            </svg>
            <div className="leading-tight whitespace-nowrap">
              <span className="block text-xs sm:text-sm font-bold text-white">
                Fluid Flow
              </span>
              <span className="block text-[9px] font-medium text-[#a3a3a3]">
                One-Stop Hub
              </span>
            </div>
          </a>

          <a
            href="#bento"
            className="hidden lg:inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full border border-[#262626] bg-[#0d0d0d] px-2.5 py-1 text-[10px] font-medium text-[#a3a3a3] hover:border-white/40 hover:text-white transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span>1.4K Rated</span>
          </a>
        </div>

        <div
          className="flex md:hidden items-center gap-0.5 rounded-full border border-[#262626] bg-[#0d0d0d] p-1 text-[10px] font-semibold text-[#a3a3a3] shrink-0"
          aria-label="Quick mobile navigation"
        >
          <a
            href="#bento"
            className="rounded-full px-2 py-0.5 text-white bg-[#1a1a1a] hover:text-white transition-colors"
          >
            Reviews
          </a>
          <a
            href="#pricing"
            className="hidden sm:inline-block rounded-full px-2 py-0.5 hover:text-white transition-colors"
          >
            Verdicts
          </a>
          <a
            href="#features"
            className="rounded-full px-2 py-0.5 hover:text-white transition-colors"
          >
            Picks
          </a>
        </div>

        <nav
          ref={desktopNavRef}
          className="nimbus-surface-host relative hidden md:flex items-center gap-1 rounded-full border border-[#262626]/80 px-1.5 py-1 text-sm text-[#a3a3a3]"
          aria-label="Primary"
        >
          <div
            className="relative"
            onPointerEnter={(e) => handleMenuPointerEnter('features', 0, e.pointerType)}
            onPointerLeave={(e) => handleMenuPointerLeave('features', e.pointerType)}
          >
            <button
              ref={(el) => {
                desktopItemRefs.current[0] = el;
              }}
              type="button"
              aria-current={activeNavIndex === 0 ? 'page' : undefined}
              className={`relative z-[61] inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 transition-colors duration-200 active:scale-95 cursor-pointer ${
                activeNavIndex === 0 || activeMenu === 'features'
                  ? 'text-white font-medium'
                  : 'hover:text-white'
              }`}
              aria-expanded={activeMenu === 'features'}
              aria-controls="dd-features"
              onPointerEnter={(e) => {
                if (e.pointerType !== 'touch') {
                  setHoveredDropIndex(null);
                  setActiveNavIndex(0);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClick('features', 0);
              }}
            >
              Reviews{' '}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-500 [transition-timing-function:var(--ios-spring)] ${
                  activeMenu === 'features' ? 'rotate-180 text-white' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            <span
              style={{ '--menu-w': '256px' } as React.CSSProperties}
              className={`nav-hover-bridge ${activeMenu === 'features' ? 'is-open' : ''}`}
              aria-hidden="true"
            />
            <span
              aria-hidden="true"
              style={{ '--menu-w': '256px', '--menu-h': '178px' } as React.CSSProperties}
              className={`nav-morph-glass ${activeMenu === 'features' ? 'is-open' : ''}`}
            />
            <div
              ref={(el) => {
                menuPanelRefs.current.features = el;
              }}
              id="dd-features"
              aria-hidden={activeMenu !== 'features'}
              style={{ '--menu-w': '256px', '--menu-h': '178px' } as React.CSSProperties}
              className={`nav-morph-menu ${activeMenu === 'features' ? 'is-open' : ''}`}
              onPointerLeave={(e) => {
                if (e.pointerType !== 'touch') setHoveredDropIndex(null);
              }}
            >
              <div className="nav-morph-inner p-2">
                <a
                  ref={(el) => {
                    desktopItemRefs.current[5] = el;
                  }}
                  href="#bento"
                  tabIndex={activeMenu === 'features' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(5);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 0 } as React.CSSProperties}
                  className={`nav-morph-item flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 5 ? 'text-white font-medium' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-white" aria-hidden="true" /> One-Stop Game Reviews
                </a>
                <a
                  ref={(el) => {
                    desktopItemRefs.current[6] = el;
                  }}
                  href="#bento"
                  tabIndex={activeMenu === 'features' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(6);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 1 } as React.CSSProperties}
                  className={`nav-morph-item flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 6 ? 'text-white font-medium' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <FileCheck className="h-4 w-4 text-white" aria-hidden="true" /> Story, Graphics &amp; Action
                </a>
                <a
                  ref={(el) => {
                    desktopItemRefs.current[7] = el;
                  }}
                  href="#pricing"
                  tabIndex={activeMenu === 'features' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(7);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 2 } as React.CSSProperties}
                  className={`nav-morph-item flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 7 ? 'text-white font-medium' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <Link2 className="h-4 w-4 text-white" aria-hidden="true" /> Simple Own Ratings
                </a>
                <a
                  ref={(el) => {
                    desktopItemRefs.current[8] = el;
                  }}
                  href="#features"
                  tabIndex={activeMenu === 'features' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(8);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 3 } as React.CSSProperties}
                  className={`nav-morph-item flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 8 ? 'text-white font-medium' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 text-white" aria-hidden="true" /> Smart Game Suggestions
                </a>
              </div>
            </div>
          </div>

          <div
            className="relative"
            onPointerEnter={(e) => handleMenuPointerEnter('developers', 1, e.pointerType)}
            onPointerLeave={(e) => handleMenuPointerLeave('developers', e.pointerType)}
          >
            <button
              ref={(el) => {
                desktopItemRefs.current[1] = el;
              }}
              type="button"
              aria-current={activeNavIndex === 1 ? 'page' : undefined}
              className={`relative z-[61] inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 transition-colors duration-200 active:scale-95 cursor-pointer ${
                activeNavIndex === 1 || activeMenu === 'developers'
                  ? 'text-white font-medium'
                  : 'hover:text-white'
              }`}
              aria-expanded={activeMenu === 'developers'}
              aria-controls="dd-developers"
              onPointerEnter={(e) => {
                if (e.pointerType !== 'touch') {
                  setHoveredDropIndex(null);
                  setActiveNavIndex(1);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClick('developers', 1);
              }}
            >
              Ratings{' '}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-500 [transition-timing-function:var(--ios-spring)] ${
                  activeMenu === 'developers' ? 'rotate-180 text-white' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            <span
              style={{ '--menu-w': '232px' } as React.CSSProperties}
              className={`nav-hover-bridge ${activeMenu === 'developers' ? 'is-open' : ''}`}
              aria-hidden="true"
            />
            <span
              aria-hidden="true"
              style={{ '--menu-w': '232px', '--menu-h': '178px' } as React.CSSProperties}
              className={`nav-morph-glass ${activeMenu === 'developers' ? 'is-open' : ''}`}
            />
            <div
              ref={(el) => {
                menuPanelRefs.current.developers = el;
              }}
              id="dd-developers"
              aria-hidden={activeMenu !== 'developers'}
              style={{ '--menu-w': '232px', '--menu-h': '178px' } as React.CSSProperties}
              className={`nav-morph-menu ${activeMenu === 'developers' ? 'is-open' : ''}`}
              onPointerLeave={(e) => {
                if (e.pointerType !== 'touch') setHoveredDropIndex(null);
              }}
            >
              <div className="nav-morph-inner p-2">
                <a
                  ref={(el) => {
                    desktopItemRefs.current[9] = el;
                  }}
                  href="#pricing"
                  tabIndex={activeMenu === 'developers' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(9);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 0 } as React.CSSProperties}
                  className={`nav-morph-item flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 9 ? 'text-white font-medium' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <Code2 className="h-4 w-4 text-white" aria-hidden="true" /> Perfect, Okish, Time Waste
                </a>
                <a
                  ref={(el) => {
                    desktopItemRefs.current[10] = el;
                  }}
                  href="#features"
                  tabIndex={activeMenu === 'developers' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(10);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 1 } as React.CSSProperties}
                  className={`nav-morph-item flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 10 ? 'text-white font-medium' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <Bell className="h-4 w-4 text-white" aria-hidden="true" /> Story Depth Scores
                </a>
                <a
                  ref={(el) => {
                    desktopItemRefs.current[11] = el;
                  }}
                  href="#features"
                  tabIndex={activeMenu === 'developers' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(11);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 2 } as React.CSSProperties}
                  className={`nav-morph-item flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 11 ? 'text-white font-medium' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <Radar className="h-4 w-4 text-white" aria-hidden="true" /> Graphics &amp; Visual Craft
                </a>
                <a
                  ref={(el) => {
                    desktopItemRefs.current[12] = el;
                  }}
                  href="#features"
                  tabIndex={activeMenu === 'developers' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(12);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 3 } as React.CSSProperties}
                  className={`nav-morph-item flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 12 ? 'text-white font-medium' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <FileCheck className="h-4 w-4 text-white" aria-hidden="true" /> Action &amp; Combat Feel
                </a>
              </div>
            </div>
          </div>

          <div
            className="relative"
            onPointerEnter={(e) => handleMenuPointerEnter('company', 2, e.pointerType)}
            onPointerLeave={(e) => handleMenuPointerLeave('company', e.pointerType)}
          >
            <button
              ref={(el) => {
                desktopItemRefs.current[2] = el;
              }}
              type="button"
              aria-current={activeNavIndex === 2 ? 'page' : undefined}
              className={`relative z-[61] inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 transition-colors duration-200 active:scale-95 cursor-pointer ${
                activeNavIndex === 2 || activeMenu === 'company'
                  ? 'text-white font-medium'
                  : 'hover:text-white'
              }`}
              aria-expanded={activeMenu === 'company'}
              aria-controls="dd-company"
              onPointerEnter={(e) => {
                if (e.pointerType !== 'touch') {
                  setHoveredDropIndex(null);
                  setActiveNavIndex(2);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClick('company', 2);
              }}
            >
              About{' '}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-500 [transition-timing-function:var(--ios-spring)] ${
                  activeMenu === 'company' ? 'rotate-180 text-white' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            <span
              style={{ '--menu-w': '196px' } as React.CSSProperties}
              className={`nav-hover-bridge ${activeMenu === 'company' ? 'is-open' : ''}`}
              aria-hidden="true"
            />
            <span
              aria-hidden="true"
              style={{ '--menu-w': '196px', '--menu-h': '178px' } as React.CSSProperties}
              className={`nav-morph-glass ${activeMenu === 'company' ? 'is-open' : ''}`}
            />
            <div
              ref={(el) => {
                menuPanelRefs.current.company = el;
              }}
              id="dd-company"
              aria-hidden={activeMenu !== 'company'}
              style={{ '--menu-w': '196px', '--menu-h': '178px' } as React.CSSProperties}
              className={`nav-morph-menu ${activeMenu === 'company' ? 'is-open' : ''}`}
              onPointerLeave={(e) => {
                if (e.pointerType !== 'touch') setHoveredDropIndex(null);
              }}
            >
              <div className="nav-morph-inner p-2">
                <a
                  ref={(el) => {
                    desktopItemRefs.current[13] = el;
                  }}
                  href="#clients"
                  tabIndex={activeMenu === 'company' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(13);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 0 } as React.CSSProperties}
                  className={`nav-morph-item block whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 13 ? 'text-white font-medium' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Why Fluid Flow
                </a>
                <a
                  ref={(el) => {
                    desktopItemRefs.current[14] = el;
                  }}
                  href="#pricing"
                  tabIndex={activeMenu === 'company' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(14);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 1 } as React.CSSProperties}
                  className={`nav-morph-item block whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 14 ? 'text-white font-medium' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Rating Standard
                </a>
                <a
                  ref={(el) => {
                    desktopItemRefs.current[15] = el;
                  }}
                  href="#features"
                  tabIndex={activeMenu === 'company' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(15);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 2 } as React.CSSProperties}
                  className={`nav-morph-item block whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 15 ? 'text-white font-medium' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Suggestion Logic
                </a>
                <a
                  ref={(el) => {
                    desktopItemRefs.current[16] = el;
                  }}
                  href="#cta"
                  tabIndex={activeMenu === 'company' ? 0 : -1}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setHoveredDropIndex(16);
                  }}
                  onClick={closeMenus}
                  style={{ '--item-i': 3 } as React.CSSProperties}
                  className={`nav-morph-item block whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${
                    waterActiveIndex === 16 ? 'text-white font-medium' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Early Access
                </a>
              </div>
            </div>
          </div>

          <a
            ref={(el) => {
              desktopItemRefs.current[3] = el;
            }}
            href="#features"
            aria-current={activeNavIndex === 3 ? 'page' : undefined}
            onClick={() => triggerDesktopNavSelect(3)}
            onPointerEnter={(e) => {
              if (e.pointerType !== 'touch') {
                setHoveredDropIndex(null);
                setActiveNavIndex(3);
              }
            }}
            className={`relative z-10 rounded-full px-3.5 py-1.5 transition-colors ${
              activeNavIndex === 3 ? 'text-white font-medium' : 'hover:text-white'
            }`}
          >
            Suggestions
          </a>
          <a
            ref={(el) => {
              desktopItemRefs.current[4] = el;
            }}
            href="#pricing"
            aria-current={activeNavIndex === 4 ? 'page' : undefined}
            onClick={() => triggerDesktopNavSelect(4)}
            onPointerEnter={(e) => {
              if (e.pointerType !== 'touch') {
                setHoveredDropIndex(null);
                setActiveNavIndex(4);
              }
            }}
            className={`relative z-10 rounded-full px-3.5 py-1.5 transition-colors ${
              activeNavIndex === 4 ? 'text-white font-medium' : 'hover:text-white'
            }`}
          >
            Verdicts
          </a>
          <LiquidWaterSurface
            hostRef={desktopNavRef}
            itemRefs={desktopItemRefs}
            activeIndex={waterActiveIndex}
            orientation="horizontal"
            tone="mono"
            borderRadius={999}
            enabled={!isMobile}
            rippleSignal={navRipple}
            subPanelRef={activeSubPanelRef}
            bridgeTriggerRef={activeBridgeTriggerRef}
            subPanelActive={openMenu !== null}
            subPanelKey={openMenu ?? ''}
            subPanelRadius={16}
          />
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#cta"
            className="gradient-button gradient-button--header hidden sm:inline-flex"
          >
            <Sparkles className="gradient-button__icon" aria-hidden="true" />
            <span className="gradient-text">Join Fluid Flow</span>
          </a>

          <div id="di-header-slot" className="flex md:hidden">
            {isMobile && (
              <DynamicIsland
                inHeader
                isOpen={diOpen}
                query={query}
                matchCount={matchCount}
                visibleKeywords={visibleKeywords}
                recentSearches={recentSearches}
                onOpen={onOpenDi}
                onClose={onCloseDi}
                onQueryChange={onQueryChange}
                onCommitSearch={onCommitSearch}
                onRemoveRecentSearch={onRemoveRecentSearch}
                onClearRecentSearches={onClearRecentSearches}
              />
            )}
          </div>

          <button
            ref={menuBtnRef}
            type="button"
            id="menu-btn"
            className={`relative z-50 md:hidden flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 active:scale-90 ${
              mobileMenuOpen
                ? 'border-white/50 bg-white/15 text-white'
                : 'border-white/15 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
            }`}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
            onClick={(e) => {
              e.stopPropagation();
              measureMobileMorph();
              setMobileMenuOpen((prev) => !prev);
            }}
          >
            <span
              className={`menu-icon-layer ${
                mobileMenuOpen ? 'opacity-0 scale-50 -rotate-90' : 'opacity-100 scale-100 rotate-0'
              }`}
              aria-hidden="true"
            >
              <Menu className="h-4 w-4" />
            </span>
            <span
              className={`menu-icon-layer ${
                mobileMenuOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90'
              }`}
              aria-hidden="true"
            >
              <X className="h-4 w-4" />
            </span>
          </button>
        </div>

        <div
          id="mobile-menu"
          aria-hidden={!mobileMenuOpen}
          onClick={(e) => e.stopPropagation()}
          className={`mobile-morph-menu md:hidden ${mobileMenuOpen ? 'is-open' : ''}`}
          style={{
            top: mobileMenuOpen ? `${morphMetrics.openTop}px` : `${morphMetrics.ballTop}px`,
            right: mobileMenuOpen ? '0px' : `${morphMetrics.ballRight}px`,
            width: mobileMenuOpen ? `${morphMetrics.openWidth}px` : `${morphMetrics.ballWidth}px`,
            height: mobileMenuOpen ? `${morphMetrics.openHeight}px` : `${morphMetrics.ballHeight}px`,
            borderRadius: mobileMenuOpen ? '24px' : '999px',
          }}
        >
          <div ref={mobileContentRef} className="mobile-morph-inner p-4">
            <nav className="flex flex-col gap-1 text-sm text-slate-300">
              <a
                href="#bento"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => setMobileMenuOpen(false)}
                style={{ '--item-i': 0 } as React.CSSProperties}
                className="mobile-morph-item whitespace-nowrap rounded-xl px-3 py-2.5 hover:bg-white/5 hover:text-white"
              >
                One-Stop Reviews
              </a>
              <a
                href="#features"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => setMobileMenuOpen(false)}
                style={{ '--item-i': 1 } as React.CSSProperties}
                className="mobile-morph-item whitespace-nowrap rounded-xl px-3 py-2.5 hover:bg-white/5 hover:text-white"
              >
                Story, Graphics &amp; Action
              </a>
              <a
                href="#pricing"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => setMobileMenuOpen(false)}
                style={{ '--item-i': 2 } as React.CSSProperties}
                className="mobile-morph-item whitespace-nowrap rounded-xl px-3 py-2.5 hover:bg-white/5 hover:text-white"
              >
                Perfect, Okish, Time Waste
              </a>
              <a
                href="#features"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => setMobileMenuOpen(false)}
                style={{ '--item-i': 3 } as React.CSSProperties}
                className="mobile-morph-item whitespace-nowrap rounded-xl px-3 py-2.5 hover:bg-white/5 hover:text-white"
              >
                Game Suggestions
              </a>
              <a
                href="#clients"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => setMobileMenuOpen(false)}
                style={{ '--item-i': 4 } as React.CSSProperties}
                className="mobile-morph-item whitespace-nowrap rounded-xl px-3 py-2.5 hover:bg-white/5 hover:text-white"
              >
                Why Fluid Flow
              </a>
              <a
                href="#cta"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => setMobileMenuOpen(false)}
                style={{ '--item-i': 5 } as React.CSSProperties}
                className="mobile-morph-item btn-purple mt-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-center font-semibold text-black"
              >
                Join Fluid Flow
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
