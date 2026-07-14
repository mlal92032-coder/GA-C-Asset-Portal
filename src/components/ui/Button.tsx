/**
 * Button Component
 * ============================================================================
 * Professional, accessible button component with multiple variants and sizes.
 * Supports loading states, disabled states, and icon support.
 *
 * Variants: primary, secondary, danger, success, ghost, outline
 * Sizes: xs, sm, md, lg, xl
 *
 * Usage:
 *   <Button variant="primary" size="md">Click me</Button>
 *   <Button variant="danger" size="lg" isLoading>Deleting...</Button>
 *   <Button as="a" href="/link">Link Button</Button>
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Button style variants using CVA
const buttonVariants = cva(
  // Base styles applied to all buttons
  cn(
    'inline-flex items-center justify-center gap-2 font-semibold',
    'rounded-lg transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'whitespace-nowrap'
  ),
  {
    variants: {
      variant: {
        primary: cn(
          'bg-blue-500 text-white shadow-md',
          'hover:bg-blue-600 hover:shadow-lg hover:scale-[1.02]',
          'active:scale-[0.98]',
          'focus-visible:ring-blue-500 focus-visible:ring-offset-2'
        ),
        secondary: cn(
          'bg-slate-100 text-slate-900 shadow-sm border border-slate-200',
          'hover:bg-slate-200 hover:shadow-md hover:scale-[1.02]',
          'active:scale-[0.98]',
          'focus-visible:ring-slate-500'
        ),
        danger: cn(
          'bg-red-500 text-white shadow-md',
          'hover:bg-red-600 hover:shadow-lg hover:scale-[1.02]',
          'active:scale-[0.98]',
          'focus-visible:ring-red-500'
        ),
        success: cn(
          'bg-green-500 text-white shadow-md',
          'hover:bg-green-600 hover:shadow-lg hover:scale-[1.02]',
          'active:scale-[0.98]',
          'focus-visible:ring-green-500'
        ),
        ghost: cn(
          'bg-transparent text-slate-700 hover:bg-slate-100',
          'active:bg-slate-200',
          'focus-visible:ring-slate-500'
        ),
        outline: cn(
          'bg-transparent border-2 border-blue-500 text-blue-500',
          'hover:bg-blue-50 hover:scale-[1.02]',
          'active:scale-[0.98]',
          'focus-visible:ring-blue-500'
        ),
      },
      size: {
        xs: 'px-2 py-1.5 text-xs h-7 min-w-fit',
        sm: 'px-3 py-2 text-sm h-9 min-w-fit',
        md: 'px-4 py-2.5 text-sm h-10 min-w-fit',
        lg: 'px-6 py-3 text-base h-11 min-w-fit',
        xl: 'px-8 py-4 text-base h-12 min-w-fit',
        icon: 'p-2 h-10 w-10 rounded-lg',
        iconLg: 'p-3 h-12 w-12 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Show loading spinner */
  isLoading?: boolean;
  /** Loading spinner text */
  loadingText?: string;
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Icon to display after text */
  iconRight?: React.ReactNode;
  /** Render as a different element (like <a>) */
  as?: 'button' | 'a' | 'div';
}

/**
 * Button component with multiple variants and states
 *
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="danger" isLoading>Deleting...</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      icon,
      iconRight,
      disabled,
      children,
      as: Component = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    // Motion variants for button interactions
    const motionVariants = {
      initial: { scale: 1 },
      whileHover: { scale: isDisabled ? 1 : 1.02 },
      whileTap: { scale: isDisabled ? 1 : 0.98 },
    };

    const buttonContent = (
      <>
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
            {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
          </>
        )}
      </>
    );

    const combinedClassName = cn(
      buttonVariants({ variant, size, fullWidth }),
      className
    );

    if (Component === 'a') {
      return (
        <motion.a
          className={combinedClassName}
          {...motionVariants}
          {...(props as any)}
          ref={ref as any}
        >
          {buttonContent}
        </motion.a>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={combinedClassName}
        disabled={isDisabled}
        {...motionVariants}
        {...props}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
