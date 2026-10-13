'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AppFooterProps {
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export default function AppFooter({
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 10,
  totalItems = 0,
  onPageChange,
  onItemsPerPageChange,
}: AppFooterProps) {
  const handlePrevious = () => {
    if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) onPageChange(currentPage + 1);
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  return (
    <footer className="bg-white border-t border-slate-200 px-3 py-0.5 shadow-none text-xs">
      <div className="flex items-center justify-between gap-1.5">
        {/* Left: Items info */}
        <div className="text-slate-600">
          {totalItems > 0 ? (
            <span>
              {startItem}-{endItem} of {totalItems}
            </span>
          ) : (
            <span className="text-slate-500">No items</span>
          )}
        </div>

        {/* Center: Page controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-all"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-600 font-medium px-1.5 min-w-fit">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-all"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Items per page */}
        {totalItems > 0 && (
          <div className="flex items-center gap-1">
            <label className="text-slate-600">Per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange?.(parseInt(e.target.value, 10))}
              className="px-1.5 py-0.5 text-xs border border-slate-300 rounded bg-white text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>10</option>
              <option>20</option>
              <option>30</option>
              <option>50</option>
            </select>
          </div>
        )}
      </div>
    </footer>
  );
}
