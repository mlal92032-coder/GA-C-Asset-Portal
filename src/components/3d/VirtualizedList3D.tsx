'use client';

import { motion } from 'framer-motion';
import { useMemo, useState, useCallback } from 'react';

interface VirtualizedItem {
  id: string;
  [key: string]: any;
}

interface VirtualizedList3DProps {
  items: VirtualizedItem[];
  renderItem: (item: VirtualizedItem, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  columns?: number;
  title?: string;
  pageSize?: number;
}

export default function VirtualizedList3D({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  columns = 1,
  title,
  pageSize = 20,
}: VirtualizedList3DProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Pagination calculation
  const itemsPerPage = pageSize;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  }, [currentPage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ perspective: 1200 }}
      className="relative w-full"
    >
      <div
        className="relative bg-white rounded-xl p-6 overflow-hidden"
        style={{
          boxShadow: `
            0 0 0 1px rgba(59, 130, 246, 0.1),
            0 10px 30px rgba(59, 130, 246, 0.15),
            0 20px 40px rgba(0, 0, 0, 0.1)
          `,
        }}
      >
        {/* Header */}
        {title && (
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-gray-900 mb-4"
          >
            {title}
          </motion.h3>
        )}

        {/* Items Grid */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          initial="hidden"
          animate="visible"
          style={{
            height: containerHeight,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '16px',
            overflow: 'auto',
            paddingRight: '8px',
          }}
          className="scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50"
        >
          {paginatedItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: 'spring', stiffness: 100 },
                },
              }}
              whileHover={{
                scale: 1.02,
                rotateX: 3,
                rotateY: -3,
              }}
              style={{
                transformStyle: 'preserve-3d',
                minHeight: itemHeight,
              }}
            >
              <div
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 h-full
                           border border-gray-200 hover:border-blue-300 transition-all duration-300
                           shadow-sm hover:shadow-md"
              >
                {renderItem(item, startIndex + index)}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between"
        >
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, items.length)} of {items.length} items
          </span>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-blue-700 transition-colors duration-200"
            >
              Previous
            </motion.button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                const pageNum = Math.max(0, currentPage - 2) + idx;
                if (pageNum >= totalPages) return null;

                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-semibold transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum + 1}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-blue-700 transition-colors duration-200"
            >
              Next
            </motion.button>
          </div>

          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
