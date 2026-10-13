'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort?: string;
  currentOrder?: 'asc' | 'desc';
  onSort?: (sortKey: string) => void;
  className?: string;
}

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentOrder,
  onSort,
  className = '',
}: SortableHeaderProps) {
  if (!onSort) {
    return <th className={className}>{label}</th>;
  }

  const isActive = currentSort === sortKey;
  const isAsc = currentOrder === 'asc';

  return (
    <th
      className={`${className} cursor-pointer select-none hover:bg-gray-50`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className="text-gray-400">
          {isActive ? (
            isAsc ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3" />
          )}
        </span>
      </div>
    </th>
  );
}
