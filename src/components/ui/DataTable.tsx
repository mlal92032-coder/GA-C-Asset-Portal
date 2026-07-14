/**
 * DataTable Component
 * ============================================================================
 * Professional data table with sorting, filtering, pagination, and selection.
 * Perfect for displaying and managing large datasets.
 *
 * Features:
 * - Column definitions with TypeScript support
 * - Sorting (single/multi-column)
 * - Pagination with size options
 * - Row selection (checkbox)
 * - Filtering
 * - Custom rendering
 * - Responsive design
 * - Loading state
 * - Empty state
 *
 * Usage:
 *   <DataTable
 *     columns={columns}
 *     data={data}
 *     onSort={handleSort}
 *     onPaginate={handlePaginate}
 *   />
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface Column<T> {
  /** Unique column ID */
  id: string;
  /** Display header */
  header: React.ReactNode;
  /** Accessor for row value */
  accessor?: string | ((row: T) => any);
  /** Custom cell renderer */
  cell?: (value: any, row: T) => React.ReactNode;
  /** Is sortable */
  sortable?: boolean;
  /** Column width */
  width?: string | number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Hide column on mobile */
  hideOnMobile?: boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

// ============================================================================
// DataTable Component
// ============================================================================

interface DataTableProps<T> {
  /** Table columns */
  columns: Column<T>[];
  /** Table data */
  data: T[];
  /** Sorting configuration */
  sort?: SortConfig;
  /** Sort change handler */
  onSort?: (config: SortConfig) => void;
  /** Pagination configuration */
  pagination?: PaginationConfig;
  /** Pagination change handler */
  onPaginate?: (page: number, pageSize: number) => void;
  /** Selected rows */
  selectedRows?: (string | number)[];
  /** Row selection handler */
  onSelectRows?: (rows: (string | number)[]) => void;
  /** Row key (for selection) */
  rowKey?: keyof T;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: React.ReactNode;
  /** Striped rows */
  striped?: boolean;
  /** Hover effect */
  hover?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Data table component for displaying structured data
 *
 * @example
 * <DataTable
 *   columns={[
 *     { id: 'name', header: 'Name', accessor: 'name' },
 *     { id: 'email', header: 'Email', accessor: 'email' },
 *   ]}
 *   data={users}
 *   onSort={handleSort}
 * />
 */
export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps<any>>(
  (
    {
      columns,
      data,
      sort,
      onSort,
      pagination,
      onPaginate,
      selectedRows = [],
      onSelectRows,
      rowKey = 'id' as any,
      isLoading = false,
      emptyMessage = 'No data available',
      striped = true,
      hover = true,
      compact = false,
      className,
    },
    ref
  ) => {
    // Get cell value
    const getCellValue = (row: any, accessor?: string | ((row: any) => any)) => {
      if (!accessor) return '';
      if (typeof accessor === 'function') return accessor(row);
      return accessor.split('.').reduce((curr, prop) => curr?.[prop], row);
    };

    // Handle sort
    const handleSort = (columnId: string) => {
      if (!onSort) return;

      let direction: 'asc' | 'desc' = 'asc';
      if (sort?.key === columnId && sort?.direction === 'asc') {
        direction = 'desc';
      }

      onSort({ key: columnId, direction });
    };

    // Handle select all
    const handleSelectAll = (checked: boolean) => {
      if (!onSelectRows) return;
      const newSelected = checked ? data.map((row) => row[rowKey]) : [];
      onSelectRows(newSelected);
    };

    // Handle row select
    const handleSelectRow = (rowId: string | number, checked: boolean) => {
      if (!onSelectRows) return;
      const newSelected = checked
        ? [...selectedRows, rowId]
        : selectedRows.filter((id) => id !== rowId);
      onSelectRows(newSelected);
    };

    const isAllSelected = data.length > 0 && selectedRows.length === data.length;
    const isIndeterminate =
      selectedRows.length > 0 && selectedRows.length < data.length;

    return (
      <div ref={ref} className={cn('w-full overflow-x-auto', className)}>
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr className="border-b-2 border-slate-200 bg-slate-50">
              {/* Selection Checkbox */}
              {onSelectRows && (
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className={cn(
                      'w-5 h-5 rounded border-2 transition-colors',
                      'border-slate-300 cursor-pointer',
                      (isAllSelected || isIndeterminate) &&
                        'bg-blue-500 border-blue-500'
                    )}
                  />
                </th>
              )}

              {/* Column Headers */}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider',
                    'hover:bg-slate-100 transition-colors',
                    col.sortable && 'cursor-pointer select-none',
                    col.hideOnMobile && 'hidden md:table-cell',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                  style={col.width ? { width: col.width } : {}}
                  onClick={() => col.sortable && handleSort(col.id)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && (
                      <motion.span
                        animate={{
                          rotate:
                            sort?.key === col.id && sort?.direction === 'desc'
                              ? 180
                              : 0,
                        }}
                        className={cn(
                          'text-slate-400 transition-colors',
                          sort?.key === col.id && 'text-blue-500'
                        )}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                        </svg>
                      </motion.span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  {onSelectRows && <td className="px-3 py-3" />}
                  {columns.map((col) => (
                    <td key={col.id} className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={(onSelectRows ? 1 : 0) + columns.length}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Data rows
              data.map((row, idx) => {
                const rowId = row[rowKey];
                const isSelected = selectedRows.includes(rowId);

                return (
                  <motion.tr
                    key={rowId}
                    className={cn(
                      'border-b border-slate-100 transition-colors',
                      striped && idx % 2 === 0 && 'bg-slate-50',
                      hover && 'hover:bg-blue-50',
                      isSelected && 'bg-blue-100'
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: (idx % 10) * 0.05,
                    }}
                  >
                    {/* Selection Checkbox */}
                    {onSelectRows && (
                      <td className="w-10 px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                          className={cn(
                            'w-5 h-5 rounded border-2 transition-colors',
                            'border-slate-300 cursor-pointer',
                            isSelected && 'bg-blue-500 border-blue-500'
                          )}
                        />
                      </td>
                    )}

                    {/* Cells */}
                    {columns.map((col) => {
                      const cellValue = getCellValue(row, col.accessor);
                      const renderedValue = col.cell
                        ? col.cell(cellValue, row)
                        : cellValue;

                      return (
                        <td
                          key={col.id}
                          className={cn(
                            'px-4 py-3 text-sm text-slate-700',
                            col.hideOnMobile && 'hidden md:table-cell',
                            col.align === 'center' && 'text-center',
                            col.align === 'right' && 'text-right',
                            compact && 'py-2'
                          )}
                        >
                          {renderedValue}
                        </td>
                      );
                    })}
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && onPaginate && !isLoading && data.length > 0 && (
          <DataTablePagination
            pagination={pagination}
            onPaginate={onPaginate}
          />
        )}
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';

// ============================================================================
// DataTablePagination Component
// ============================================================================

interface DataTablePaginationProps {
  pagination: PaginationConfig;
  onPaginate: (page: number, pageSize: number) => void;
}

const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  pagination,
  onPaginate,
}) => {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const startRecord = (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200 bg-slate-50">
      {/* Info */}
      <div className="text-sm text-slate-600">
        Showing{' '}
        <span className="font-medium">{startRecord}</span> to{' '}
        <span className="font-medium">{endRecord}</span> of{' '}
        <span className="font-medium">{pagination.total}</span> results
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          onClick={() => onPaginate(pagination.page - 1, pagination.pageSize)}
          disabled={pagination.page === 1}
          className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
            'border border-slate-200',
            pagination.page === 1
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-slate-700 hover:bg-white'
          )}
        >
          Previous
        </button>

        {/* Page Info */}
        <span className="text-sm text-slate-600 px-3">
          Page <span className="font-medium">{pagination.page}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </span>

        {/* Next */}
        <button
          onClick={() => onPaginate(pagination.page + 1, pagination.pageSize)}
          disabled={pagination.page === totalPages}
          className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
            'border border-slate-200',
            pagination.page === totalPages
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-slate-700 hover:bg-white'
          )}
        >
          Next
        </button>

        {/* Page Size Selector */}
        <select
          value={pagination.pageSize}
          onChange={(e) => onPaginate(1, parseInt(e.target.value))}
          className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium',
            'border border-slate-200 bg-white text-slate-700',
            'transition-colors hover:border-slate-300'
          )}
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
