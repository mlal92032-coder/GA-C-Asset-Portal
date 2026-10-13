'use client';

import { motion } from 'framer-motion';
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
    <motion.div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 p-4 bg-white border border-gray-200 rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div className="text-sm text-gray-700 whitespace-nowrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalItems}</span> results
      </motion.div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <motion.select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 text-sm rounded-md min-h-[2.75rem] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          whileHover={{ borderColor: '#3b82f6' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option} per page
            </option>
          ))}
        </motion.select>

        <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-start">
          {[
            { onClick: () => onPageChange(1), disabled: currentPage === 1, icon: ChevronsLeft, title: 'First page', label: 'Go to first page' },
            { onClick: () => onPageChange(currentPage - 1), disabled: currentPage === 1, icon: ChevronLeft, title: 'Previous page', label: 'Go to previous page' },
          ].map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <motion.button
                key={idx}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className="min-w-[2.75rem] h-[2.75rem] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
                title={btn.title}
                aria-label={btn.label}
                whileHover={!btn.disabled ? { scale: 1.05 } : {}}
                whileTap={!btn.disabled ? { scale: 0.95 } : {}}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <Icon className="w-4 h-4" />
              </motion.button>
            );
          })}

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
                <motion.button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[2.75rem] h-[2.75rem] text-sm rounded-md flex items-center justify-center transition-colors ${
                    currentPage === pageNum ? 'bg-blue-600 text-white font-medium' : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={currentPage === pageNum ? 'page' : undefined}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  {pageNum}
                </motion.button>
              );
            })}
          </div>

          {[
            { onClick: () => onPageChange(currentPage + 1), disabled: currentPage === totalPages, icon: ChevronRight, title: 'Next page', label: 'Go to next page' },
            { onClick: () => onPageChange(totalPages), disabled: currentPage === totalPages, icon: ChevronsRight, title: 'Last page', label: 'Go to last page' },
          ].map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <motion.button
                key={idx}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className="min-w-[2.75rem] h-[2.75rem] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors"
                title={btn.title}
                aria-label={btn.label}
                whileHover={!btn.disabled ? { scale: 1.05 } : {}}
                whileTap={!btn.disabled ? { scale: 0.95 } : {}}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <Icon className="w-4 h-4" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
