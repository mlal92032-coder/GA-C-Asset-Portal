'use client';

import { motion } from 'framer-motion';
import { shimmer } from '@/lib/animations';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const baseClasses = {
    text: 'h-4 rounded',
    circle: 'w-12 h-12 rounded-full',
    rect: 'h-12 rounded',
  };

  return (
    <motion.div
      className={`${baseClasses[variant]} ${className} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]`}
      animate={shimmer.animate}
      transition={shimmer.animate.transition}
    />
  );
}

// Skeleton for a card layout
export function SkeletonCard() {
  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-3">
      <Skeleton className="mb-3 h-6 w-2/3" />
      <Skeleton className="mb-3 h-4" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}

// Skeleton for a table layout
export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for a list of items
export function SkeletonList() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded" />
      ))}
    </div>
  );
}

// Skeleton for dashboard stats
export function SkeletonStats() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Skeleton for form fields
export function SkeletonFormField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

// Skeleton for page header
export function SkeletonPageHeader() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
