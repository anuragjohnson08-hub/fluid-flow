import { Instagram, Youtube } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CardEdgeToEdge } from './CardEdgeToEdge';

interface SiteFooterProps {
  termsOpen?: boolean;
  onTermsOpenChange?: (open: boolean) => void;
}

export function SiteFooter({
  termsOpen: controlledTermsOpen,
  onTermsOpenChange,
}: SiteFooterProps = {}) {
  const [uncontrolledTermsOpen, setUncontrolledTermsOpen] = useState(true);
  const termsOpen = controlledTermsOpen ?? uncontrolledTermsOpen;
  const setTermsOpen = (next: boolean) => {
    if (onTermsOpenChange) {
      onTermsOpenChange(next);
    } else {
      setUncontrolledTermsOpen(next);
    }
  };

  useEffect(() => {
    if (!termsOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTermsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [termsOpen, onTermsOpenChange]);

  return (
    <footer id="footer" className="relative z-10 border-t border-[#262626] bg-[#000000]">
      <div className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2">
              <svg
                className="h-7 w-7 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.65)]"
                viewBox="0 0 28 28"
                aria-hidden="true"
              >
                <circle cx="14" cy="14" r="12" fill="url(#orb-logo)" />
                <ellipse cx="10" cy="9" rx="4" ry="2.5" fill="#fff" opacity=".55" />
              </svg>
              <span className="text-sm font-bold text-white">Fluid Flow</span>
            </a>

            <p className="mt-4 max-w-xs text-sm text-[#a3a3a3] leading-relaxed">
              Your one-stop game review website. Rated on Story, Graphics, and Action with Perfect, Okish, or Time Waste verdicts and smart suggestions.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#footer"
                aria-label="X / Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#262626] bg-[#0b0b0b] text-[#a3a3a3] hover:text-white hover:border-white/50 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#footer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#262626] bg-[#0b0b0b] text-[#a3a3a3] hover:text-white hover:border-white/50 transition-colors"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#footer"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#262626] bg-[#0b0b0b] text-[#a3a3a3] hover:text-white hover:border-white/50 transition-colors"
              >
                <Youtube className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav aria-label="Reviews">
            <h4 className="text-sm font-semibold text-white">Reviews</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#a3a3a3]">
              <li>
                <a href="#bento" className="hover:text-white transition-colors">
                  All Games
                </a>
              </li>
              <li>
                <a href="#bento" className="hover:text-white transition-colors">
                  One-Stop Hub
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Perfect Picks
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Okish Titles
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Time Waste Alerts
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Ratings">
            <h4 className="text-sm font-semibold text-white">Ratings</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#a3a3a3]">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Story Score
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Graphics Score
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Action Score
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Own Rating Tiers
                </a>
              </li>
              <li>
                <a href="#clients" className="hover:text-white transition-colors">
                  Rating Standard
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Suggestions">
            <h4 className="text-sm font-semibold text-white">Suggestions</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#a3a3a3]">
              <li>
                <a href="#bento" className="hover:text-white transition-colors">
                  Matched Picks
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  By Story
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  By Graphics
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  By Action
                </a>
              </li>
              <li>
                <a href="#cta" className="hover:text-white transition-colors">
                  Early Access
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Fluid Flow">
            <h4 className="text-sm font-semibold text-white">Fluid Flow</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#a3a3a3]">
              <li>
                <a href="#clients" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#cta" className="hover:text-white transition-colors">
                  Updates
                </a>
              </li>
              <li>
                <button
                  type="button"
                  data-testid="open-terms-modal-btn"
                  onClick={() => setTermsOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#262626] pt-6 text-xs text-[#a3a3a3]">
          <p>© 2026 Fluid Flow. All rights reserved.</p>
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="text-[#a3a3a3] hover:text-white transition-colors cursor-pointer"
          >
            Review Terms of Service
          </button>
        </div>
      </div>

      {termsOpen &&
        createPortal(
          <div
            data-testid="terms-popup-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Terms of Service"
            onClick={(e) => {
              if (e.target === e.currentTarget) setTermsOpen(false);
            }}
            className="fixed inset-0 z-[9980] flex items-center justify-center overflow-hidden bg-[#000000]/90 p-4 backdrop-blur-sm"
          >
            <div
              className="terms-sphere-bg pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="loader">
                {Array.from({ length: 9 }).map((_, sIdx) => (
                  <div
                    key={sIdx}
                    className={`sphere sphere${sIdx + 1}`}
                    style={{ ['--rot' as string]: sIdx }}
                  >
                    {Array.from({ length: 9 }).map((__, iIdx) => (
                      <div
                        key={iIdx}
                        className="item"
                        style={{ ['--rot-y' as string]: iIdx + 1 }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative z-10 mx-auto flex w-full max-w-sm items-center justify-center">
              <CardEdgeToEdge
                onAccept={() => setTermsOpen(false)}
                onDecline={() => setTermsOpen(false)}
              />
            </div>
          </div>,
          document.body,
        )}
    </footer>
  );
}
