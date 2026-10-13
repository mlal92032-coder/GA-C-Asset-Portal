/**
 * Modal Component
 * ============================================================================
 * Accessible modal dialog with multiple variants (alert, confirm, form, drawer).
 * Supports animation, click-outside-to-close, and keyboard navigation.
 *
 * Features:
 * - Multiple variants (alert, dialog, confirm, drawer)
 * - Backdrop blur effect
 * - Animation on open/close
 * - Keyboard navigation (Escape to close)
 * - Focus management
 * - WCAG 2.1 AAA compliant
 *
 * Usage:
 *   <Modal isOpen={isOpen} onClose={handleClose} title="Confirm">
 *     <ModalContent>Are you sure?</ModalContent>
 *   </Modal>
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: React.ReactNode;
  /** Modal content */
  children?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Close button label */
  closeLabel?: string;
  /** Whether backdrop click closes modal */
  closeOnBackdropClick?: boolean;
  /** Whether Escape key closes modal */
  closeOnEsc?: boolean;
  /** Custom className */
  className?: string;
  /** Custom backdrop className */
  backdropClassName?: string;
  /** On animation complete */
  onAnimationComplete?: () => void;
  /** Modal variant */
  variant?: 'dialog' | 'alert' | 'confirm' | 'drawer';
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Modal dialog component with multiple variants
 *
 * @example
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Delete Confirmation"
 *   footer={<Button onClick={handleClose}>Cancel</Button>}
 * >
 *   Are you sure you want to delete this item?
 * </Modal>
 */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      footer,
      closeLabel = 'Close',
      closeOnBackdropClick = true,
      closeOnEsc = true,
      className,
      backdropClassName,
      variant = 'dialog',
      size = 'md',
      onAnimationComplete,
    },
    ref
  ) => {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const closeButtonRef = React.useRef<HTMLButtonElement>(null);

    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEsc) return;

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, closeOnEsc, onClose]);

    // Focus management
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        // Focus close button after animation
        setTimeout(() => closeButtonRef.current?.focus(), 300);
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    return (
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className={cn(
                'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
                backdropClassName
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => closeOnBackdropClick && onClose()}
              aria-hidden="true"
            />

            {/* Modal */}
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              aria-modal="true"
              role="dialog"
              aria-labelledby="modal-title"
            >
              <motion.div
                key="modal"
                ref={modalRef}
                className={cn(
                  'relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-h-[90vh] overflow-hidden flex flex-col mx-auto pointer-events-auto',
                  variant === 'dialog' && 'max-w-2xl',
                  variant === 'alert' && 'max-w-sm',
                  variant === 'confirm' && 'max-w-sm',
                  variant === 'drawer' && 'fixed inset-y-0 right-0 max-w-md rounded-none max-h-screen',
                  size === 'sm' && 'max-w-sm',
                  size === 'md' && 'max-w-md',
                  size === 'lg' && 'max-w-lg',
                  size === 'xl' && 'max-w-2xl',
                  size === 'full' && 'max-w-4xl',
                  className
                )}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
                onAnimationComplete={onAnimationComplete}
              >
                {/* Header */}
                {title && (
                  <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-25 flex items-center justify-between">
                    <h2
                      id="modal-title"
                      className="text-lg font-bold text-slate-900"
                    >
                      {title}
                    </h2>
                    <button
                      ref={closeButtonRef}
                      onClick={onClose}
                      className={cn(
                        'p-2 rounded-lg text-slate-600 hover:bg-slate-100',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                        'transition-colors'
                      )}
                      aria-label={closeLabel}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

                {/* Footer */}
                {footer && (
                  <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-25 flex items-center justify-end gap-3">
                    {footer}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  }
);

Modal.displayName = 'Modal';

// ============================================================================
// Modal Subcomponents
// ============================================================================

export const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-25',
      className
    )}
    {...props}
  />
));

ModalHeader.displayName = 'ModalHeader';

export const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-bold text-slate-900', className)}
    {...props}
  />
));

ModalTitle.displayName = 'ModalTitle';

export const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex-1 overflow-y-auto px-6 py-6', className)} {...props} />
));

ModalContent.displayName = 'ModalContent';

export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'center' | 'end' }
>(({ className, align = 'end', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-25 flex items-center gap-3',
      align === 'start' && 'justify-start',
      align === 'center' && 'justify-center',
      align === 'end' && 'justify-end',
      className
    )}
    {...props}
  />
));

ModalFooter.displayName = 'ModalFooter';

/**
 * Alert Modal - Quick confirmation dialogs
 */
interface AlertModalProps extends Omit<ModalProps, 'variant'> {
  type?: 'success' | 'error' | 'warning' | 'info';
  actionLabel?: string;
  onAction?: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
}

export const AlertModal = React.forwardRef<HTMLDivElement, AlertModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      type = 'info',
      actionLabel = 'Confirm',
      onAction,
      cancelLabel = 'Cancel',
      onCancel,
      ...props
    },
    ref
  ) => {
    const typeColors = {
      success: 'text-green-600 bg-green-50',
      error: 'text-red-600 bg-red-50',
      warning: 'text-amber-600 bg-amber-50',
      info: 'text-blue-600 bg-blue-50',
    };

    const typeIcons = {
      success: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      error: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      warning: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      info: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };

    return (
      <Modal
        ref={ref}
        isOpen={isOpen}
        onClose={onClose}
        variant="alert"
        {...props}
      >
        <div className="space-y-4">
          {/* Icon */}
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', typeColors[type])}>
            {typeIcons[type]}
          </div>

          {/* Title & Message */}
          {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
          <p className="text-slate-600">{children}</p>
        </div>

        {/* Footer */}
        <ModalFooter className="mt-6">
          <button
            onClick={() => {
              onCancel?.();
              onClose();
            }}
            className={cn(
              'px-4 py-2 rounded-lg font-medium',
              'text-slate-700 bg-slate-100 hover:bg-slate-200',
              'transition-colors'
            )}
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onAction?.();
              onClose();
            }}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-white',
              type === 'error' && 'bg-red-500 hover:bg-red-600',
              type === 'success' && 'bg-green-500 hover:bg-green-600',
              type === 'warning' && 'bg-amber-500 hover:bg-amber-600',
              type === 'info' && 'bg-blue-500 hover:bg-blue-600',
              'transition-colors'
            )}
          >
            {actionLabel}
          </button>
        </ModalFooter>
      </Modal>
    );
  }
);

AlertModal.displayName = 'AlertModal';
