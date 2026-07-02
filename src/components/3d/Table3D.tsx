'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

interface Column {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Table3DProps {
  columns: Column[];
  data: any[];
  title?: string;
  pageSize?: number;
  sortable?: boolean;
  striped?: boolean;
}

export default function Table3D({
  columns,
  data,
  title,
  pageSize = 10,
  sortable = true,
  striped = true,
}: Table3DProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = useMemo(
    () => sortedData.slice(startIndex, endIndex),
    [sortedData, startIndex, endIndex]
  );

  const handleSort = (key: string) => {
    if (!sortable) return;

    setSortConfig(prev => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

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
        {/* Top light */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
          style={{ transform: 'translateZ(20px)' }}
        />

        {/* Title */}
        {title && (
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-gray-900 mb-6"
          >
            {title} ({sortedData.length} items)
          </motion.h3>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <motion.table
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <thead>
              <motion.tr
                variants={rowVariants}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200"
              >
                {columns.map(column => (
                  <motion.th
                    key={column.key}
                    whileHover={sortable ? { scale: 1.05 } : {}}
                    onClick={() => handleSort(column.key)}
                    className={`px-6 py-4 text-left text-sm font-bold text-gray-900 ${
                      sortable ? 'cursor-pointer hover:bg-blue-100/50 transition-colors' : ''
                    }`}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {sortable && sortConfig?.key === column.key && (
                        <motion.span
                          initial={{ rotate: 0 }}
                          animate={{ rotate: sortConfig.direction === 'asc' ? 0 : 180 }}
                          transition={{ duration: 0.3 }}
                        >
                          ↑
                        </motion.span>
                      )}
                    </div>
                  </motion.th>
                ))}
              </motion.tr>
            </thead>

            <tbody>
              <motion.tr variants={containerVariants} initial="hidden" animate="visible">
                {paginatedData.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    variants={rowVariants}
                    className={`border-b border-gray-200 transition-all duration-200 hover:shadow-md
                      ${striped && idx % 2 === 0 ? 'bg-gradient-to-r from-blue-50/30 to-indigo-50/30' : 'bg-white'}
                      hover:bg-blue-50/50`}
                    whileHover={{
                      scale: 1.01,
                      x: 2,
                      boxShadow: '0 5px 15px rgba(59, 130, 246, 0.15)',
                    }}
                  >
                    {columns.map(column => (
                      <td
                        key={`${idx}-${column.key}`}
                        className="px-6 py-4 text-sm text-gray-700"
                        style={{ width: column.width }}
                      >
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </motion.tr>
            </tbody>
          </motion.table>
        </div>

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between"
        >
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} items
          </span>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50
                         hover:bg-blue-700 transition-all duration-200"
            >
              ← Prev
            </motion.button>

            <span className="px-4 py-2 text-sm font-semibold text-gray-900 bg-gray-100 rounded-lg">
              Page {currentPage + 1} of {totalPages}
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50
                         hover:bg-blue-700 transition-all duration-200"
            >
              Next →
            </motion.button>
          </div>
        </motion.div>

        {/* Bottom shine */}
        <div
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-200/20 to-transparent"
          style={{ transform: 'translateZ(10px)' }}
        />
      </div>
    </motion.div>
  );
}
