'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';

export interface DataColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataColumn<T>[];
  title?: string;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  title,
  searchable = false,
  searchKeys = [],
  onRowClick,
  emptyMessage = 'No data found',
  isLoading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const sortedAndFiltered = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchTerm && searchKeys.length > 0) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) =>
        searchKeys.some((key) => {
          const value = row[key];
          return value ? String(value).toLowerCase().includes(term) : false;
        })
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal < bVal ? -1 : 1;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, sortKey, sortOrder, searchTerm, searchKeys]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSelectRow = (id: string | number) => {
    const idStr = String(id);
    const newSelection = selectedIds.includes(idStr)
      ? selectedIds.filter((sid) => sid !== idStr)
      : [...selectedIds, idStr];
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = sortedAndFiltered.map((row) => String(row.id));
      onSelectionChange?.(allIds);
    } else {
      onSelectionChange?.([]);
    }
  };

  const areAllSelected = sortedAndFiltered.length > 0 && sortedAndFiltered.every(
    (row) => selectedIds.includes(String(row.id))
  );

  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < sortedAndFiltered.length;

  return (
    <motion.div className="card shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      {(title || searchable) && (
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between gap-4">
            {title && <h3 className="font-bold text-lg text-slate-900">{title}</h3>}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-20 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
            <tr>
              {selectable && (
                <th className="px-4 py-4 text-left font-bold text-slate-700 w-14">
                  <input
                    type="checkbox"
                    checked={areAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isIndeterminate;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={String(col.key)} className={`px-6 py-4 text-left font-bold text-slate-700 ${col.width || ''}`}>
                  {col.sortable ? (
                    <motion.button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      {col.label}
                      {sortKey === col.key && (
                        <motion.div initial={{ rotate: 0 }} animate={{ rotate: sortOrder === 'desc' ? 180 : 0 }}>
                          {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </motion.div>
                      )}
                    </motion.button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : sortedAndFiltered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedAndFiltered.map((row, idx) => {
                  const isSelected = selectedIds.includes(String(row.id));
                  return (
                    <motion.tr
                      key={row.id || idx}
                      className={`border-b border-slate-100 transition-colors ${
                        isSelected ? 'bg-blue-100' : 'hover:bg-blue-50'
                      } ${onRowClick || selectable ? 'cursor-pointer' : ''}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={(e) => {
                        if (!onRowClick) return;
                        // Only trigger row click if user didn't click checkbox
                        const target = e.target as HTMLInputElement;
                        if (target.type !== 'checkbox') {
                          onRowClick(row);
                        }
                      }}
                      whileHover={{ x: onRowClick ? 4 : 0 }}
                    >
                      {selectable && (
                        <td className="px-4 py-4 w-14">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(row.id!)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select row ${row.id}`}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={String(col.key)} className="px-6 py-4">
                          {col.render ? col.render(row[col.key], row) : String(row[col.key] || '-')}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {sortedAndFiltered.length > 0 && (
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          Showing {sortedAndFiltered.length} of {data.length} items
        </div>
      )}
    </motion.div>
  );
}
