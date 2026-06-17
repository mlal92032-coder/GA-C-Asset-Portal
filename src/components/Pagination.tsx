'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="text-sm text-gray-700 whitespace-nowrap">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 text-sm rounded-md min-h-[2.75rem]"
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option} per page
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-start">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="min-w-[2.75rem] h-[2.75rem] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
            title="First page"
            aria-label="Go to first page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="min-w-[2.75rem] h-[2.75rem] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
            title="Previous page"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[2.75rem] h-[2.75rem] text-sm rounded-md flex items-center justify-center transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white font-medium'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="min-w-[2.75rem] h-[2.75rem] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
            title="Next page"
            aria-label="Go to next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="min-w-[2.75rem] h-[2.75rem] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
            title="Last page"
            aria-label="Go to last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
