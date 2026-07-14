/**
 * Radio Component
 * ============================================================================
 * Accessible radio button input with custom styling.
 * For single selection from multiple options.
 *
 * Features:
 * - Fully accessible with ARIA attributes
 * - Color variants
 * - Size options
 * - Label support
 * - Radio group wrapper
 *
 * Usage:
 *   <Radio name="option" value="a" label="Option A" />
 *   <RadioGroup name="choice" options={[...]} />
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const radioVariants = cva(
  cn(
    'flex items-center gap-2 cursor-pointer select-none',
    'focus-within:outline-none'
  ),
  {
    variants: {
      size: {
        sm: '[&_input]:w-4 [&_input]:h-4',
        md: '[&_input]:w-5 [&_input]:h-5',
        lg: '[&_input]:w-6 [&_input]:h-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const radioInputVariants = cva(
  cn(
    'appearance-none relative w-5 h-5 rounded-full',
    'border-2 border-slate-300 bg-white',
    'cursor-pointer transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    'checked:border-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'disabled:bg-slate-100 disabled:border-slate-200'
  ),
  {
    variants: {
      color: {
        blue: 'checked:border-blue-500 focus:ring-blue-500',
        green: 'checked:border-green-500 focus:ring-green-500',
        red: 'checked:border-red-500 focus:ring-red-500',
        purple: 'checked:border-purple-500 focus:ring-purple-500',
      },
    },
    defaultVariants: {
      color: 'blue',
    },
  }
);

interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    VariantProps<typeof radioVariants> {
  /** Label text */
  label?: React.ReactNode;
  /** Color variant */
  color?: VariantProps<typeof radioInputVariants>['color'];
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
}

/**
 * Radio component with label support
 *
 * @example
 * <Radio
 *   name="option"
 *   value="a"
 *   label="Option A"
 *   onChange={handleChange}
 * />
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      size,
      color,
      label,
      helperText,
      error,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          className={cn(radioVariants({ size }), disabled && 'opacity-60')}
          htmlFor={radioId}
        >
          {/* Radio Input with Animated Indicator */}
          <div className="relative">
            <input
              ref={ref}
              type="radio"
              id={radioId}
              disabled={disabled}
              className={cn(radioInputVariants({ color }))}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${radioId}-error` : undefined}
              {...props}
            />

            {/* Animated Indicator Dot */}
            <motion.div
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                'pointer-events-none'
              )}
              initial={{ scale: 0 }}
              animate={props.checked ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  color === 'blue' && 'bg-blue-500',
                  color === 'green' && 'bg-green-500',
                  color === 'red' && 'bg-red-500',
                  color === 'purple' && 'bg-purple-500'
                )}
              />
            </motion.div>
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
            id={`${radioId}-error`}
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

Radio.displayName = 'Radio';

// ============================================================================
// Radio Group Component
// ============================================================================

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Group name */
  name: string;
  /** Group label */
  label?: string;
  /** Radio options */
  options: Array<{
    value: string | number;
    label: React.ReactNode;
    disabled?: boolean;
    helperText?: string;
  }>;
  /** Selected value */
  value?: string | number;
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Error message */
  error?: string;
  /** Display direction */
  direction?: 'vertical' | 'horizontal';
  /** Color variant for all radios */
  color?: VariantProps<typeof radioInputVariants>['color'];
}

/**
 * Radio group for single selection from multiple options
 *
 * @example
 * <RadioGroup
 *   name="choice"
 *   options={[
 *     { value: 'a', label: 'Option A' },
 *     { value: 'b', label: 'Option B' },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 * />
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      name,
      label,
      options,
      value,
      onChange,
      error,
      direction = 'vertical',
      color,
      ...props
    },
    ref
  ) => {
    return (
      <fieldset ref={ref} className={cn('flex flex-col gap-3', className)} {...props}>
        {label && (
          <legend className="block text-sm font-medium text-slate-700">{label}</legend>
        )}

        <div
          className={cn(
            'flex gap-4',
            direction === 'vertical' && 'flex-col',
            direction === 'horizontal' && 'flex-row flex-wrap'
          )}
        >
          {options.map((option) => (
            <Radio
              key={option.value}
              name={name}
              value={option.value}
              label={option.label}
              disabled={option.disabled}
              checked={value === option.value}
              onChange={() => onChange?.(option.value)}
              color={color}
              helperText={option.helperText}
            />
          ))}
        </div>

        {error && (
          <div
            className="text-sm text-red-600 font-medium flex items-center gap-1"
            role="alert"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}
      </fieldset>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
