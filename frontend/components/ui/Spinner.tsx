/**
 * Spinner Component
 * ============================================================================
 * Loading spinner for indicating async operations.
 *
 * Sizes: sm, md, lg
 * Colors: primary, success, warning, error, info
 *
 * Usage:
 *   <Spinner />
 *   <Spinner size="lg" color="success" />
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    },
    color: {
      primary: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-amber-500',
      error: 'text-red-500',
      info: 'text-cyan-500',
      white: 'text-white',
      slate: 'text-slate-500',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {}

/**
 * Loading spinner component
 *
 * @example
 * <Spinner size="lg" color="primary" />
 */
export function Spinner({
  className,
  size,
  color,
  ...props
}: SpinnerProps) {
  return (
    <svg
      className={cn(spinnerVariants({ size, color }), className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Dot spinner (bouncing dots)
 */
export function SpinnerDots({ size = 'md', color = 'primary' }: Omit<SpinnerProps, 'children'>) {
  const sizeClass = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  }[size || 'md'];

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  }[size || 'md'];

  const colorClass = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-cyan-500',
    white: 'bg-white',
    slate: 'bg-slate-500',
  }[color || 'primary'];

  return (
    <div className={cn('flex items-center', sizeClass)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('rounded-full', dotSize, colorClass)}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Ring spinner (growing ring)
 */
export function SpinnerRing({ size = 'md', color = 'primary' }: Omit<SpinnerProps, 'children'>) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size || 'md'];

  const colorClass = {
    primary: 'border-blue-500',
    success: 'border-green-500',
    warning: 'border-amber-500',
    error: 'border-red-500',
    info: 'border-cyan-500',
    white: 'border-white',
    slate: 'border-slate-500',
  }[color || 'primary'];

  return (
    <motion.div
      className={cn('rounded-full border-2 border-transparent', sizeClass, colorClass)}
      style={{
        borderTopColor: 'currentColor',
        borderRightColor: 'currentColor',
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

interface SpinnerWithTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spinner size */
  size?: VariantProps<typeof spinnerVariants>['size'];
  /** Spinner color */
  color?: VariantProps<typeof spinnerVariants>['color'];
  /** Label text */
  label?: string;
}

/**
 * Spinner with optional label
 */
export function SpinnerWithText({
  size = 'md',
  color = 'primary',
  label,
  className,
  ...props
}: SpinnerWithTextProps) {
  return (
    <div
      className={cn('flex flex-col items-center gap-3 justify-center', className)}
      {...props}
    >
      <Spinner size={size} color={color} />
      {label && (
        <p className={cn(
          'text-sm font-medium',
          color === 'white' ? 'text-white' : `text-${color}-600`
        )}>
          {label}
        </p>
      )}
    </div>
  );
}
