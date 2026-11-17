import { ChevronUp, Clock, History, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { filterKeywords, type KeywordRow } from '../utils/keywords';
import { normalizeSearchQuery } from '../utils/recentSearches';

interface DynamicIslandProps {
  inHeader?: boolean;
  isOpen: boolean;
  query: string;
  matchCount: number;
  visibleKeywords: KeywordRow[];
  recentSearches?: string[];
  onOpen: () => void;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onCommitSearch?: (value: string) => void;
  onRemoveRecentSearch?: (value: string) => void;
  onClearRecentSearches?: () => void;
}

export function DynamicIsland({
  inHeader = false,
  isOpen,
  query,
  matchCount,
  visibleKeywords: _visibleKeywords,
  recentSearches = [],
  onOpen,
  onClose,
  onQueryChange,
  onCommitSearch,
  onRemoveRecentSearch,
  onClearRecentSearches,
}: DynamicIslandProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const diRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const latestQueryRef = useRef(query);
  latestQueryRef.current = query;

  const [bumping, setBumping] = useState(false);
  const prevOpenRef = useRef(isOpen);

  const commitCurrentQuery = useCallback(
    (rawValue: string) => {
      const normalized = normalizeSearchQuery(rawValue);
      if (normalized) {
        onCommitSearch?.(normalized);
      }
    },
    [onCommitSearch],
  );

  const closeWithCommit = useCallback(() => {
    commitCurrentQuery(latestQueryRef.current);
    onClose();
  }, [commitCurrentQuery, onClose]);

  useEffect(() => {
    if (prevOpenRef.current !== isOpen) {
      prevOpenRef.current = isOpen;
      setBumping(false);
      const raf = window.requestAnimationFrame(() => {
        setBumping(true);
      });
      const timer = window.setTimeout(() => {
        setBumping(false);
      }, 540);
      return () => {
        window.cancelAnimationFrame(raf);
        window.clearTimeout(timer);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 260);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        closeWithCommit();
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpen, closeWithCommit]);

  return (
    <div ref={wrapRef} className={`di-wrap ${inHeader ? 'di-in-header' : ''}`}>
      <div
        ref={diRef}
        id="di"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls="di-recent-dropdown"
        aria-label={isOpen ? 'Search game reviews' : 'Open search'}
        className={`di ${isOpen ? 'expanded' : ''} ${bumping ? 'bump' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!isOpen) {
            onOpen();
            return;
          }
          if (e.target === diRef.current) {
            inputRef.current?.focus();
          }
        }}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onOpen();
          }
        }}
      >
        <div className="di-idle">
          <span className="di-dot" />
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Search</span>
        </div>

        <div className="di-expanded">
          <Search className="di-search-icon h-4 w-4" aria-hidden="true" />
          <input
            ref={inputRef}
            id="di-input"
            className="di-input"
            type="text"
            value={query}
            placeholder="Search games, Perfect, Story, Action..."
            autoComplete="off"
            spellCheck={false}
            aria-label="Search game reviews"
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
                diRef.current?.focus();
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const normalized = normalizeSearchQuery(latestQueryRef.current);
                if (normalized) {
                  if (normalized !== latestQueryRef.current) {
                    onQueryChange(normalized);
                  }
                  onCommitSearch?.(normalized);
                }
              }
            }}
          />
          <span className="di-count" id="di-count">
            {matchCount}
          </span>
          <button
            type="button"
            className="di-btn"
            id="di-clear"
            aria-label="Clear search"
            onClick={(e) => {
              e.stopPropagation();
              onQueryChange('');
              inputRef.current?.focus();
            }}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="di-btn"
            id="di-close"
            aria-label="Close search"
            onClick={(e) => {
              e.stopPropagation();
              closeWithCommit();
              diRef.current?.focus();
            }}
          >
            <ChevronUp className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id="di-recent-dropdown"
        data-testid="di-recent-dropdown"
        role="region"
        aria-label="Recent searches"
        aria-hidden={!isOpen}
        onClick={(e) => e.stopPropagation()}
        className={`di-dropdown ${isOpen ? 'is-open' : ''}`}
      >
        <div className="di-dropdown-header">
          <div className="flex items-center gap-1.5">
            <History className="h-3 w-3 text-white" aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-300">
              Recent Searches
            </span>
          </div>
          {recentSearches.length > 0 && (
            <button
              type="button"
              id="di-clear-recent"
              data-testid="di-clear-recent"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => {
                onClearRecentSearches?.();
                inputRef.current?.focus();
              }}
              className="text-[10px] font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {recentSearches.length > 0 ? (
          <ul className="di-recent-list" role="list">
            {recentSearches.map((term) => {
              const hits = filterKeywords(term).length;
              return (
                <li key={term} className="di-recent-row">
                  <button
                    type="button"
                    tabIndex={isOpen ? 0 : -1}
                    data-testid="di-recent-item"
                    onClick={() => {
                      onQueryChange(term);
                      onCommitSearch?.(term);
                      inputRef.current?.focus();
                    }}
                    className="di-recent-select"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="truncate text-xs font-medium text-slate-100">{term}</span>
                    <span className="ml-auto shrink-0 text-[10px] font-medium tabular-nums text-slate-400">
                      {hits} {hits === 1 ? 'hit' : 'hits'}
                    </span>
                  </button>
                  <button
                    type="button"
                    tabIndex={isOpen ? 0 : -1}
                    aria-label={`Remove ${term} from recent searches`}
                    onClick={() => {
                      onRemoveRecentSearch?.(term);
                      inputRef.current?.focus();
                    }}
                    className="di-recent-remove"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="di-recent-empty" data-testid="di-recent-empty">
            <p className="text-xs font-medium text-slate-300">No recent searches yet</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Search a game or verdict and press Enter to save your last 5 queries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
