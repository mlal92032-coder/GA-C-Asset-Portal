/**
 * FormInput Component
 * ============================================================================
 * Accessible form input with icon support, validation states, and error messages.
 * Supports all standard HTML input types with proper accessibility attributes.
 *
 * Features:
 * - Icon support (left and right)
 * - Validation states (error, success, warning)
 * - Size variants (sm, md, lg)
 * - Disabled state
 * - Helper and error text
 * - WCAG 2.1 AAA accessible
 *
 * Usage:
 *   <FormInput placeholder="Enter text" />
 *   <FormInput icon={<Icon />} error="Field is required" />
 *   <FormInput type="email" isValid={true} />
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  cn(
    'w-full px-3 py-2 rounded-lg',
    'border border-slate-200 bg-white text-slate-900',
    'placeholder-slate-500 placeholder-opacity-100',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'focus:border-blue-500 focus:ring-blue-500/20',
    'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60',
    'read-only:bg-slate-50 read-only:text-slate-600'
  ),
  {
    variants: {
      size: {
        sm: 'text-sm h-8',
        md: 'text-base h-10',
        lg: 'text-base h-12',
      },
      error: {
        true: 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
        false: '',
      },
      isValid: {
        true: 'border-green-500 focus:ring-green-500/20 focus:border-green-500',
        false: '',
      },
      warning: {
        true: 'border-amber-500 focus:ring-amber-500/20 focus:border-amber-500',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      error: false,
      isValid: false,
      warning: false,
    },
  }
);

interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Icon to display on the left */
  icon?: React.ReactNode;
  /** Icon to display on the right */
  iconRight?: React.ReactNode;
  /** Error message to display */
  error?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Floating label text */
  label?: string;
  /** Show success state */
  isValid?: boolean;
  /** Show warning state */
  warning?: string;
}

/**
 * FormInput component with icon and validation support
 *
 * @example
 * <FormInput
 *   type="email"
 *   placeholder="Enter your email"
 *   icon={<Mail className="w-5 h-5" />}
 *   error="Email is invalid"
 * />
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      className,
      size,
      error,
      isValid,
      warning,
      icon,
      iconRight,
      label,
      helperText,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-2',
              'text-slate-700 transition-colors',
              disabled && 'text-slate-500 opacity-60'
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {/* Left Icon */}
          {icon && (
            <div
              className={cn(
                'absolute left-3 flex items-center justify-center pointer-events-none',
                'text-slate-500 transition-colors',
                error && 'text-red-500',
                isValid && 'text-green-500',
                warning && 'text-amber-500',
                disabled && 'opacity-60'
              )}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ size, error, isValid, warning }),
              icon && 'pl-10',
              iconRight && 'pr-10',
              className
            )}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error || helperText ? `${inputId}-description` : undefined
            }
            {...props}
          />

          {/* Right Icon */}
          {iconRight && (
            <div
              className={cn(
                'absolute right-3 flex items-center justify-center pointer-events-none',
                'text-slate-500 transition-colors',
                error && 'text-red-500',
                isValid && 'text-green-500',
                warning && 'text-amber-500',
                disabled && 'opacity-60'
              )}
              aria-hidden="true"
            >
              {iconRight}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            id={`${inputId}-description`}
            className="mt-1.5 flex items-center gap-1 text-sm text-red-600 font-medium"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18.101 12.93a1 1 0 00-1.414-1.414L10 17.586l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l8-8z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Warning Message */}
        {warning && !error && (
          <div
            id={`${inputId}-description`}
            className="mt-1.5 flex items-center gap-1 text-sm text-amber-600 font-medium"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {warning}
          </div>
        )}

        {/* Helper Text */}
        {helperText && !error && !warning && (
          <p
            id={`${inputId}-description`}
            className="mt-1.5 text-sm text-slate-600"
          >
            {helperText}
          </p>
        )}

        {/* Success Indicator */}
        {isValid && !error && !warning && (
          <p className="mt-1.5 text-sm text-green-600 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Valid
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
