'use client';

import { ReactNode, useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterBarProps {
  children: ReactNode;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  alwaysExpanded?: boolean;
}

export default function FilterBar({
  children,
  hasActiveFilters = false,
  onClearFilters,
  alwaysExpanded = false,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const shouldShowCollapse = !alwaysExpanded;
  const isVisible = alwaysExpanded || isExpanded;

  return (
    <div className="card p-4 sm:p-3 mb-6">
      {/* Header with toggle and clear button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <button
          onClick={() => !alwaysExpanded && setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 font-medium text-gray-700 ${
            shouldShowCollapse ? 'hover:text-gray-900 transition-colors' : 'cursor-default'
          }`}
          disabled={alwaysExpanded}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-600 rounded-full" title="Active filters" />
          )}
          {shouldShowCollapse && (
            isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )
          )}
        </button>

        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Filter content with smooth animation */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-4 border-t border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
}
