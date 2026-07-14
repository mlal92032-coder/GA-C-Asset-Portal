/**
 * Checkbox Component
 * ============================================================================
 * Accessible checkbox input with custom styling.
 *
 * Features:
 * - Fully accessible with ARIA attributes
 * - Support for indeterminate state
 * - Custom color variants
 * - Size options
 * - Label support
 *
 * Usage:
 *   <Checkbox label="Accept terms" onChange={handleChange} />
 *   <Checkbox checked={true} indeterminate={false} />
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  cn(
    'flex items-center gap-2 cursor-pointer select-none',
    'focus-within:outline-none'
  ),
  {
    variants: {
      size: {
        sm: '[&_input]:w-4 [&_input]:h-4 [&_svg]:w-3 [&_svg]:h-3',
        md: '[&_input]:w-5 [&_input]:h-5 [&_svg]:w-4 [&_svg]:h-4',
        lg: '[&_input]:w-6 [&_input]:h-6 [&_svg]:w-5 [&_svg]:h-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const checkboxInputVariants = cva(
  cn(
    'appearance-none relative w-5 h-5 rounded-md',
    'border-2 border-slate-300 bg-white',
    'cursor-pointer transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    'checked:bg-blue-500 checked:border-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'disabled:bg-slate-100 disabled:border-slate-200'
  ),
  {
    variants: {
      color: {
        blue: 'checked:bg-blue-500 checked:border-blue-500 focus:ring-blue-500',
        green: 'checked:bg-green-500 checked:border-green-500 focus:ring-green-500',
        red: 'checked:bg-red-500 checked:border-red-500 focus:ring-red-500',
        purple: 'checked:bg-purple-500 checked:border-purple-500 focus:ring-purple-500',
      },
    },
    defaultVariants: {
      color: 'blue',
    },
  }
);

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    VariantProps<typeof checkboxVariants> {
  /** Label text */
  label?: React.ReactNode;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Color variant */
  color?: VariantProps<typeof checkboxInputVariants>['color'];
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
}

/**
 * Checkbox component with label support
 *
 * @example
 * <Checkbox
 *   label="Accept terms and conditions"
 *   onChange={handleChange}
 * />
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      size,
      color,
      label,
      indeterminate,
      helperText,
      error,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    // Set indeterminate state
    React.useEffect(() => {
      if (inputRef.current && indeterminate !== undefined) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <div className="flex flex-col gap-1.5">
        <label
          className={cn(checkboxVariants({ size }), disabled && 'opacity-60')}
          htmlFor={checkboxId}
        >
          {/* Checkbox Input with Checkmark Animation */}
          <div className="relative">
            <input
              ref={(el) => {
                inputRef.current = el;
                if (typeof ref === 'function') ref(el);
                else if (ref) ref.current = el;
              }}
              type="checkbox"
              id={checkboxId}
              disabled={disabled}
              className={cn(checkboxInputVariants({ color }))}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${checkboxId}-error` : undefined}
              {...props}
            />

            {/* Animated Checkmark */}
            {!indeterminate && (
              <motion.svg
                className={cn(
                  'absolute inset-0 w-5 h-5 text-white pointer-events-none',
                  'flex items-center justify-center'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ scale: 0, opacity: 0 }}
                animate={props.checked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={props.checked ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                />
              </motion.svg>
            )}

            {/* Indeterminate Line */}
            {indeterminate && (
              <motion.div
                className="absolute inset-2 bg-white rounded-sm"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>

          {/* Label */}
          {label && (
            <span
              className={cn(
                'text-sm font-medium text-slate-700',
                disabled && 'text-slate-500'
              )}
            >
              {label}
            </span>
          )}
        </label>

        {/* Error Message */}
        {error && (
          <div
            id={`${checkboxId}-error`}
            className="text-sm text-red-600 font-medium flex items-center gap-1"
            role="alert"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18.101 12.93a1 1 0 00-1.414-1.414L10 17.586l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l8-8z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="text-sm text-slate-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================================================
// Checkbox Group Component
// ============================================================================

interface CheckboxGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Group label */
  label?: string;
  /** Checkbox options */
  options: Array<{
    value: string | number;
    label: React.ReactNode;
    disabled?: boolean;
  }>;
  /** Selected values */
  value?: (string | number)[];
  /** Change handler */
  onChange?: (values: (string | number)[]) => void;
  /** Error message */
  error?: string;
  /** Display direction */
  direction?: 'vertical' | 'horizontal';
}

/**
 * Checkbox group for multiple selections
 */
export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      className,
      label,
      options,
      value = [],
      onChange,
      error,
      direction = 'vertical',
      ...props
    },
    ref
  ) => {
    const handleChange = (optionValue: string | number) => {
      const newValues = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange?.(newValues);
    };

    return (
      <div ref={ref} className={cn('flex flex-col gap-3', className)} {...props}>
        {label && (
          <label className="block text-sm font-medium text-slate-700">{label}</label>
        )}

        <div
          className={cn(
            'flex gap-4',
            direction === 'vertical' && 'flex-col',
            direction === 'horizontal' && 'flex-row flex-wrap'
          )}
        >
          {options.map((option) => (
            <Checkbox
              key={option.value}
              value={option.value}
              label={option.label}
              disabled={option.disabled}
              checked={value.includes(option.value)}
              onChange={() => handleChange(option.value)}
            />
          ))}
        </div>

        {error && (
          <div className="text-sm text-red-600 font-medium" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }
);

CheckboxGroup.displayName = 'CheckboxGroup';
