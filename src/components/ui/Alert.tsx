/**
 * Alert Component
 * ============================================================================
 * Informational alerts with multiple types (success, warning, error, info).
 * Can be dismissible with optional icons and actions.
 *
 * Types: success, warning, error, info
 *
 * Usage:
 *   <Alert type="success">Operation completed successfully</Alert>
 *   <Alert type="error" onDismiss={handleDismiss}>An error occurred</Alert>
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  cn(
    'relative w-full rounded-lg border px-4 py-3 flex items-start gap-3',
    'animate-in fade-in slide-in-from-top-2 duration-300'
  ),
  {
    variants: {
      type: {
        success: cn(
          'bg-green-50 border-green-200 text-green-800',
          '[&_svg]:text-green-500'
        ),
        warning: cn(
          'bg-amber-50 border-amber-200 text-amber-800',
          '[&_svg]:text-amber-500'
        ),
        error: cn(
          'bg-red-50 border-red-200 text-red-800',
          '[&_svg]:text-red-500'
        ),
        info: cn(
          'bg-blue-50 border-blue-200 text-blue-800',
          '[&_svg]:text-blue-500'
        ),
      },
      variant: {
        default: '',
        subtle: 'border-transparent',
        bordered: 'border-2',
      },
    },
    defaultVariants: {
      type: 'info',
      variant: 'default',
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Alert type */
  type?: 'success' | 'warning' | 'error' | 'info';
  /** Alert title */
  title?: React.ReactNode;
  /** Alert description */
  description?: React.ReactNode;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Whether to show dismiss button */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Action button */
  action?: React.ReactNode;
}

const icons = {
  success: (
    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

/**
 * Alert component for displaying informational messages
 *
 * @example
 * <Alert type="success" title="Success">
 *   Operation completed successfully
 * </Alert>
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      type = 'info',
      variant = 'default',
      title,
      children,
      description,
      icon,
      dismissible = false,
      onDismiss,
      action,
      ...props
    },
    ref
  ) => {
    const [isDismissed, setIsDismissed] = React.useState(false);

    const handleDismiss = () => {
      setIsDismissed(true);
      onDismiss?.();
    };

    if (isDismissed) return null;

    return (
      <motion.div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ type, variant }), className)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {/* Icon */}
        {icon || icons[type]}

        {/* Content */}
        <div className="flex-1">
          {title && <h3 className="font-semibold leading-tight">{title}</h3>}
          <div className={cn('text-sm', title && 'mt-1')}>
            {description || children}
          </div>
        </div>

        {/* Action & Dismiss */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {action}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className={cn(
                'rounded-md p-1 hover:opacity-75 transition-opacity',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                type === 'success' && 'focus:ring-green-500',
                type === 'error' && 'focus:ring-red-500',
                type === 'warning' && 'focus:ring-amber-500',
                type === 'info' && 'focus:ring-blue-500'
              )}
              aria-label="Close alert"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    );
  }
);

Alert.displayName = 'Alert';
