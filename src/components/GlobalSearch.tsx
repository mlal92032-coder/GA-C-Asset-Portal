'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Loader2,
  Armchair,
  Monitor,
  Car,
  Building2,
  MapPin,
  X,
} from 'lucide-react';

type SearchResult = {
  id: string;
  type: 'FURNITURE' | 'ELECTRONIC' | 'VEHICLE' | 'COMPANY' | 'LOCATION';
  assetTag?: string | null;
  assetName?: string;
  companyName?: string;
  locationName?: string;
  condition?: string;
  status?: string;
  email?: string | null;
  building?: string | null;
};

type GroupedResults = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SearchResult[];
  hrefPrefix: string;
};

const DEBOUNCE_MS = 300;

const typeIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FURNITURE: Armchair,
  ELECTRONIC: Monitor,
  VEHICLE: Car,
  COMPANY: Building2,
  LOCATION: MapPin,
};

const typeBadgeColor: Record<string, string> = {
  FURNITURE: 'bg-amber-100 text-amber-700',
  ELECTRONIC: 'bg-blue-100 text-blue-700',
  VEHICLE: 'bg-emerald-100 text-emerald-700',
  COMPANY: 'bg-violet-100 text-violet-700',
  LOCATION: 'bg-sky-100 text-sky-700',
};

function getDisplayLabel(item: SearchResult): string {
  switch (item.type) {
    case 'FURNITURE':
    case 'ELECTRONIC':
    case 'VEHICLE':
      return item.assetName || item.assetTag || 'Unknown';
    case 'COMPANY':
      return item.companyName || 'Unknown';
    case 'LOCATION':
      return item.locationName || 'Unknown';
  }
}

function getSubLabel(item: SearchResult): string {
  switch (item.type) {
    case 'FURNITURE':
    case 'ELECTRONIC':
    case 'VEHICLE':
      return item.assetTag || '';
    case 'COMPANY':
      return item.email || '';
    case 'LOCATION':
      return item.building || '';
  }
}

function getResultHref(item: SearchResult): string {
  switch (item.type) {
    case 'FURNITURE':
      return `/assets/furniture/${item.id}`;
    case 'ELECTRONIC':
      return `/assets/electronics/${item.id}`;
    case 'VEHICLE':
      return `/assets/vehicles/${item.id}`;
    case 'COMPANY':
      return `/admin/offices`;
    case 'LOCATION':
      return `/admin/locations`;
  }
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value || value.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setIsOpen(true);
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, DEBOUNCE_MS);
  };

  const handleSelect = (item: SearchResult) => {
    const href = getResultHref(item);
    router.push(href);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && results[highlightedIndex]) {
      e.preventDefault();
      handleSelect(results[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Keyboard shortcut: Ctrl+K or / to focus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !e.ctrlKey && !e.metaKey)) {
        const target = e.target as HTMLElement;
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable;
        if (!isInput) {
          e.preventDefault();
          inputRef.current?.focus();
          inputRef.current?.select();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group results by type
  const groupedResults: GroupedResults[] = [];

  const assetTypes = ['FURNITURE', 'ELECTRONIC', 'VEHICLE'] as const;
  const assetItems = results.filter((r) => assetTypes.includes(r.type as any));
  if (assetItems.length > 0) {
    groupedResults.push({
      label: 'Assets',
      icon: Armchair,
      items: assetItems,
      hrefPrefix: '/assets/',
    });
  }

  const companyItems = results.filter((r) => r.type === 'COMPANY');
  if (companyItems.length > 0) {
    groupedResults.push({
      label: 'Offices',
      icon: Building2,
      items: companyItems,
      hrefPrefix: '/admin/offices',
    });
  }

  const locationItems = results.filter((r) => r.type === 'LOCATION');
  if (locationItems.length > 0) {
    groupedResults.push({
      label: 'Locations',
      icon: MapPin,
      items: locationItems,
      hrefPrefix: '/admin/locations',
    });
  }

  const hasResults = groupedResults.length > 0;
  const showDropdown = isOpen && (query.length >= 2 || loading);

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          placeholder="Search assets, offices, locations..."
          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all hover:border-slate-300"
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin z-10" />
        )}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-200 z-10"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {/* Keyboard shortcut hint - only show when empty */}
        {!query && !loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:flex items-center gap-1 z-10">
            <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-400 text-[10px] font-mono border border-slate-200 rounded">/</kbd>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="search-dropdown absolute left-0 right-0 mt-2 bg-white rounded-lg border border-slate-200 shadow-2xl max-h-[70vh] overflow-y-auto z-40"
        >
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : !hasResults ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Search className="w-8 h-8 mb-2 text-slate-400" />
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="py-2">
              {groupedResults.map((group) => (
                <div key={group.label} className="mb-2 last:mb-0">
                  <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <group.icon className="w-3.5 h-3.5" />
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const globalIndex = results.findIndex((r) => r.id === item.id && r.type === item.type);
                    const isHighlighted = globalIndex === highlightedIndex;
                    const IconComponent = typeIconMap[item.type] || Search;

                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setHighlightedIndex(globalIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-100 last:border-b-0 ${
                          isHighlighted
                            ? 'bg-blue-50'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {getDisplayLabel(item)}
                          </p>
                          {getSubLabel(item) && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {getSubLabel(item)}
                            </p>
                          )}
                        </div>
                        <span className={`badge ${typeBadgeColor[item.type]} flex-shrink-0 text-xs`}>
                          {item.type.charAt(0) + item.type.slice(1).toLowerCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Keyboard shortcut hint */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 text-xs font-mono">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-100 text-xs font-mono">↓</kbd>{' '}
              to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 text-xs font-mono">↵</kbd>{' '}
              to select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 text-xs font-mono">esc</kbd>{' '}
              to close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
