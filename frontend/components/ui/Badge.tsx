/**
 * Badge Component
 * ============================================================================
 * Small label component for displaying status, categories, or tags.
 *
 * Variants: primary, secondary, success, warning, error, info
 *
 * Usage:
 *   <Badge>New</Badge>
 *   <Badge variant="success">Active</Badge>
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  cn(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
    'text-xs font-semibold tracking-wide',
    'whitespace-nowrap transition-colors'
  ),
  {
    variants: {
      variant: {
        primary: 'bg-blue-100 text-blue-700 border border-blue-200',
        secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
        success: 'bg-green-100 text-green-700 border border-green-200',
        warning: 'bg-amber-100 text-amber-700 border border-amber-200',
        error: 'bg-red-100 text-red-700 border border-red-200',
        info: 'bg-blue-100 text-blue-700 border border-blue-200',
        purple: 'bg-purple-100 text-purple-700 border border-purple-200',
        teal: 'bg-teal-100 text-teal-700 border border-teal-200',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
      },
      filled: {
        true: 'border-transparent text-white',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        filled: true,
        className: 'bg-blue-500 text-white',
      },
      {
        variant: 'secondary',
        filled: true,
        className: 'bg-slate-500 text-white',
      },
      {
        variant: 'success',
        filled: true,
        className: 'bg-green-500 text-white',
      },
      {
        variant: 'warning',
        filled: true,
        className: 'bg-amber-500 text-white',
      },
      {
        variant: 'error',
        filled: true,
        className: 'bg-red-500 text-white',
      },
      {
        variant: 'info',
        filled: true,
        className: 'bg-blue-500 text-white',
      },
      {
        variant: 'purple',
        filled: true,
        className: 'bg-purple-500 text-white',
      },
      {
        variant: 'teal',
        filled: true,
        className: 'bg-teal-500 text-white',
      },
    ],
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
      filled: false,
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Badge icon */
  icon?: React.ReactNode;
  /** Dot indicator */
  dot?: boolean;
  /** Dot color when showing */
  dotColor?: string;
}

/**
 * Badge component for displaying labels and status
 *
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" dot>Pending</Badge>
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      filled,
      icon,
      dot,
      dotColor = 'currentColor',
      children,
      ...props
    },
    ref
  ) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size, filled }), className)}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
);

Badge.displayName = 'Badge';
