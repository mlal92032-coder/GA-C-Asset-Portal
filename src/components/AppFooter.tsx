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
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageJump = (page: number) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display (max 7 pages)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 3);
      const endPage = Math.min(totalPages, currentPage + 3);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push(-1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  return (
    <footer className="bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/20 border-t border-slate-200/60 px-4 md:px-6 py-4 md:py-5 shadow-sm backdrop-blur-sm">
      <div className="max-w-full mx-auto">
        <div className="space-y-4">
          {/* Top section: Items counter + Page info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Left: Items info */}
            <div className="text-sm text-slate-600">
              {totalItems > 0 ? (
                <span>
                  Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
                  <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
                  <span className="font-semibold text-slate-900">{totalItems}</span> items
                </span>
              ) : (
                <span className="text-slate-500">No items to display</span>
              )}
            </div>

            {/* Right: Page info */}
            {totalPages > 1 && (
              <div className="text-sm text-slate-600 text-right md:text-left">
                Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
                <span className="font-semibold text-slate-900">{totalPages}</span>
              </div>
            )}
          </div>

          {/* Pagination controls - Always show if more than 1 page */}
          {totalPages > 1 && (
            <>
              <div className="border-t border-slate-200/50"></div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {/* Previous button */}
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 transition-all font-medium"
                  title="Previous page"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, idx) => {
                    if (page === -1) {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400">
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageJump(page)}
                        className={`w-9 h-9 rounded-lg font-semibold text-sm transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg'
                            : 'border border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400'
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Next button */}
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 transition-all font-medium"
                  title="Next page"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bottom section: Items per page + copyright */}
        <div className="mt-4 pt-3 border-t border-slate-200/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Items per page dropdown */}
            {totalItems > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-600">Items per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => onItemsPerPageChange?.(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            )}

            {/* Right: Copyright info */}
            <div className="flex flex-col md:flex-row gap-2 text-xs text-slate-500">
              <p>© 2024-2026 SEF Asset Management System</p>
              <p className="hidden md:inline">|</p>
              <p>v2.0 Professional | {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
