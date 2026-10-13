/**
 * Toast Component
 * ============================================================================
 * Non-intrusive notification component that appears at the bottom right.
 * Multiple toasts stack automatically.
 *
 * Types: success, error, warning, info, loading
 *
 * Usage:
 *   <Toast type="success" title="Success">File saved</Toast>
 *   <Toast type="error" duration={5000}>An error occurred</Toast>
 */

import React, { useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  cn(
    'flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg',
    'pointer-events-auto backdrop-blur-sm border'
  ),
  {
    variants: {
      type: {
        success: 'bg-green-500 border-green-600 text-white',
        error: 'bg-red-500 border-red-600 text-white',
        warning: 'bg-amber-500 border-amber-600 text-white',
        info: 'bg-blue-500 border-blue-600 text-white',
        loading: 'bg-slate-700 border-slate-800 text-white',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  }
);

interface ToastProps extends VariantProps<typeof toastVariants> {
  /** Toast ID (unique identifier) */
  id?: string;
  /** Toast type */
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading';
  /** Toast title */
  title?: React.ReactNode;
  /** Toast message */
  message?: React.ReactNode;
  /** Children (alternative to message) */
  children?: React.ReactNode;
  /** Auto-dismiss time in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Callback when toast is dismissed */
  onDismiss?: (id?: string) => void;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Action button */
  action?: React.ReactNode;
  /** Position in stack */
  index?: number;
}

const icons = {
  success: (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  loading: (
    <svg className="w-5 h-5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ),
};

/**
 * Toast notification component
 *
 * @example
 * <Toast
 *   type="success"
 *   title="Success"
 *   message="Your changes have been saved"
 *   duration={3000}
 * />
 */
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      id,
      type = 'info',
      title,
      message,
      children,
      duration = 4000,
      onDismiss,
      icon,
      action,
      index = 0,
    },
    ref
  ) => {
    useEffect(() => {
      if (duration === 0) return;

      const timer = setTimeout(() => {
        onDismiss?.(id);
      }, duration);

      return () => clearTimeout(timer);
    }, [duration, onDismiss, id]);

    return (
      <motion.div
        ref={ref}
        className={cn(toastVariants({ type }))}
        initial={{ opacity: 0, y: 20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 20, x: 20 }}
        transition={{ duration: 0.2 }}
        style={{
          marginTop: `${index * 12}px`,
        }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Icon */}
        {icon || icons[type]}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && <div className="font-semibold text-sm leading-tight">{title}</div>}
          <div className={cn('text-sm', title && 'mt-0.5')}>
            {message || children}
          </div>
        </div>

        {/* Action & Close */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {action}
          <button
            onClick={() => onDismiss?.(id)}
            className={cn(
              'rounded-md p-1 opacity-70 hover:opacity-100',
              'focus:outline-none focus:ring-1 focus:ring-white/50',
              'transition-opacity'
            )}
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </motion.div>
    );
  }
);

Toast.displayName = 'Toast';

// ============================================================================
// Toast Container (for managing multiple toasts)
// ============================================================================

interface ToastContainerProps {
  toasts: (ToastProps & { id: string })[];
  onDismiss: (id: string) => void;
}

/**
 * Container for displaying multiple toasts
 */
export const ToastContainer = React.forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ toasts, onDismiss }, ref) => {
    return (
      <div
        ref={ref}
        className="fixed bottom-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast, index) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                {...toast}
                index={index}
                onDismiss={onDismiss}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

ToastContainer.displayName = 'ToastContainer';

// ============================================================================
// Toast Hook
// ============================================================================

/**
 * Hook for managing toasts
 *
 * @example
 * const { toasts, showToast, dismissToast } = useToasts();
 * showToast({ type: 'success', message: 'Saved!' });
 */
export function useToasts() {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([]);

  const showToast = React.useCallback(
    (props: Omit<ToastProps, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { ...props, id }]);
      return id;
    },
    []
  );

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = React.useCallback(
    (message: React.ReactNode, title?: React.ReactNode) => {
      return showToast({ type: 'success', message, title });
    },
    [showToast]
  );

  const error = React.useCallback(
    (message: React.ReactNode, title?: React.ReactNode) => {
      return showToast({ type: 'error', message, title });
    },
    [showToast]
  );

  const warning = React.useCallback(
    (message: React.ReactNode, title?: React.ReactNode) => {
      return showToast({ type: 'warning', message, title });
    },
    [showToast]
  );

  const info = React.useCallback(
    (message: React.ReactNode, title?: React.ReactNode) => {
      return showToast({ type: 'info', message, title });
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  };
}
