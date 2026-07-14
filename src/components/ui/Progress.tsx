/**
 * Progress Component
 * ============================================================================
 * Visual progress indicator component with multiple styles.
 * Supports determinate and indeterminate states.
 *
 * Variants: primary, success, warning, error, info
 *
 * Usage:
 *   <Progress value={65} />
 *   <Progress value={75} variant="success" label="Uploading..." />
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const progressVariants = cva(
  'h-2 w-full rounded-full overflow-hidden bg-slate-100',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const progressBarVariants = cva(
  'h-full rounded-full transition-all duration-500 ease-out origin-left',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-blue-400 to-blue-600',
        success: 'bg-gradient-to-r from-green-400 to-green-600',
        warning: 'bg-gradient-to-r from-amber-400 to-amber-600',
        error: 'bg-gradient-to-r from-red-400 to-red-600',
        info: 'bg-gradient-to-r from-cyan-400 to-cyan-600',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  /** Progress value (0-100) */
  value?: number;
  /** Progress bar variant */
  variant?: VariantProps<typeof progressBarVariants>['variant'];
  /** Show label */
  label?: React.ReactNode;
  /** Show percentage */
  showValue?: boolean;
  /** Indeterminate state (loading) */
  isIndeterminate?: boolean;
  /** Animated state */
  animated?: boolean;
  /** Custom class for the progress bar */
  barClassName?: string;
}

/**
 * Progress bar component
 *
 * @example
 * <Progress value={65} variant="primary" />
 * <Progress isIndeterminate label="Loading..." />
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      size,
      variant = 'primary',
      value = 0,
      label,
      showValue = false,
      isIndeterminate = false,
      animated = true,
      barClassName,
      ...props
    },
    ref
  ) => {
    const progress = Math.min(Math.max(value, 0), 100);

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        {/* Label */}
        {(label || showValue) && (
          <div className="mb-2 flex items-center justify-between">
            {label && (
              <span className="text-sm font-medium text-slate-700">{label}</span>
            )}
            {showValue && (
              <span className="text-sm font-semibold text-slate-600">
                {isIndeterminate ? '...' : `${progress}%`}
              </span>
            )}
          </div>
        )}

        {/* Progress bar container */}
        <div
          className={cn(progressVariants({ size }), className)}
          role="progressbar"
          aria-valuenow={isIndeterminate ? undefined : progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ? String(label) : 'Progress'}
        >
          {/* Progress fill */}
          {isIndeterminate ? (
            // Indeterminate (animated) progress
            <motion.div
              className={cn(
                'h-full rounded-full w-1/3',
                progressBarVariants({ variant }),
                'animate-pulse'
              )}
              animate={{
                x: ['0%', '200%', '-100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ) : (
            // Determinate progress
            <motion.div
              className={cn(progressBarVariants({ variant }), barClassName)}
              initial={{ width: 0 }}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: animated ? 0.6 : 0,
                ease: 'easeOut',
              }}
            />
          )}
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// ============================================================================
// Circular Progress Component
// ============================================================================

interface CircularProgressProps extends React.SVGAttributes<SVGSVGElement> {
  /** Progress value (0-100) */
  value?: number;
  /** Circle diameter */
  size?: number;
  /** Progress bar thickness */
  thickness?: number;
  /** Progress variant */
  variant?: VariantProps<typeof progressBarVariants>['variant'];
  /** Show percentage label */
  showValue?: boolean;
  /** Indeterminate state */
  isIndeterminate?: boolean;
}

const variantColors = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
};

/**
 * Circular progress indicator
 *
 * @example
 * <CircularProgress value={75} size={100} />
 */
export const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  (
    {
      value = 0,
      size = 120,
      thickness = 4,
      variant = 'primary',
      showValue = true,
      isIndeterminate = false,
      ...props
    },
    ref
  ) => {
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(value, 0), 100);
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const color = variantColors[variant];

    return (
      <div className="inline-flex items-center justify-center relative">
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          {...props}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={thickness}
          />

          {/* Progress circle */}
          {isIndeterminate ? (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeDasharray={circumference}
              strokeDashoffset={0}
              strokeLinecap="round"
              animate={{
                rotate: [0, 360],
                strokeDashoffset: [circumference, 0],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                strokeDashoffset: { duration: 1.5, repeat: Infinity },
              }}
            />
          ) : (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              animate={{
                strokeDashoffset,
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
              }}
            />
          )}
        </svg>

        {/* Value label */}
        {showValue && !isIndeterminate && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-700">{progress}%</span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';
