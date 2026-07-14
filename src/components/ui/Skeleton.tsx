/**
 * Skeleton Component
 * ============================================================================
 * Loading placeholder for content.
 * Creates shimmer effect while content is loading.
 *
 * Usage:
 *   <Skeleton />
 *   <Skeleton className="h-10 w-full" />
 *   <SkeletonText lines={3} />
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Generic skeleton loading placeholder
 *
 * @example
 * <Skeleton className="w-full h-12 rounded-lg" />
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200',
        'bg-[length:200%_100%]',
        className
      )}
      style={{
        animation: 'shimmer 2s infinite',
      }}
      {...props}
    />
  );
}

interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of lines */
  lines?: number;
}

/**
 * Skeleton for text content
 */
export function SkeletonText({ className, lines = 1, ...props }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={cn(
            'h-4 rounded',
            idx === lines - 1 && 'w-3/4' // Last line shorter
          )}
        />
      ))}
    </div>
  );
}

interface SkeletonCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Circle size */
  size?: number;
}

/**
 * Skeleton for circular content (avatars)
 */
export function SkeletonCircle({ className, size = 40, ...props }: SkeletonCircleProps) {
  return (
    <Skeleton
      className={cn('rounded-full', className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show image placeholder */
  withImage?: boolean;
  /** Number of content lines */
  lines?: number;
}

/**
 * Skeleton for card content
 */
export function SkeletonCard({
  className,
  withImage = true,
  lines = 3,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border border-slate-200 space-y-4 bg-white',
        className
      )}
      {...props}
    >
      {withImage && <Skeleton className="w-full h-32 rounded-lg" />}
      <SkeletonText lines={lines} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of rows */
  rows?: number;
  /** Number of columns */
  columns?: number;
}

/**
 * Skeleton for table content
 */
export function SkeletonTable({
  className,
  rows = 5,
  columns = 4,
  ...props
}: SkeletonTableProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-3">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="flex-1 h-10 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Add shimmer animation to global styles
if (typeof document !== 'undefined') {
  const styleId = 'skeleton-shimmer-animation';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% {
          background-position: -200% center;
        }
        100% {
          background-position: 200% center;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
