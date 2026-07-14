'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Edit2, Trash2, Download } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onClose: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
  isLoading = false,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-2xl p-4 z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <motion.div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm md:text-base">
                {selectedCount} selected
              </span>
            </motion.div>

            <div className="flex gap-2 flex-wrap">
              {onEdit && (
                <motion.button
                  onClick={onEdit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Edit selected items"
                >
                  <Edit2 size={16} />
                  <span className="hidden md:inline">Edit</span>
                </motion.button>
              )}

              {onDuplicate && (
                <motion.button
                  onClick={onDuplicate}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Duplicate selected items"
                >
                  <Copy size={16} />
                  <span className="hidden md:inline">Duplicate</span>
                </motion.button>
              )}

              {onExport && (
                <motion.button
                  onClick={onExport}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Export selected items"
                >
                  <Download size={16} />
                  <span className="hidden md:inline">Export</span>
                </motion.button>
              )}

              {onDelete && (
                <motion.button
                  onClick={onDelete}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Delete selected items"
                >
                  <Trash2 size={16} />
                  <span className="hidden md:inline">Delete</span>
                </motion.button>
              )}

              <motion.button
                onClick={onClose}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Clear selection"
              >
                <X size={16} />
                <span className="hidden md:inline">Clear</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
