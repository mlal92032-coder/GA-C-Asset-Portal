/**
 * Select Component
 * ============================================================================
 * Accessible dropdown select component with custom styling.
 * Supports single and multiple selections.
 *
 * Features:
 * - Fully accessible keyboard navigation
 * - Custom styling
 * - Icon support
 * - Disabled state
 * - Error handling
 * - Clearable option
 *
 * Usage:
 *   <Select options={[...]} value={selected} onChange={setSelected} />
 *   <Select isMulti options={[...]} />
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const selectTriggerVariants = cva(
  cn(
    'w-full px-3 py-2 rounded-lg',
    'border border-slate-200 bg-white text-slate-900',
    'transition-all duration-200 flex items-center justify-between gap-2',
    'cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'focus:border-blue-500 focus:ring-blue-500/20',
    'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60',
    'hover:border-slate-300'
  ),
  {
    variants: {
      size: {
        sm: 'text-sm h-8',
        md: 'text-base h-10',
        lg: 'text-base h-12',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  group?: string;
}

interface SelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange'>,
    VariantProps<typeof selectTriggerVariants> {
  /** Select options */
  options: SelectOption[];
  /** Selected value(s) */
  value?: string | number | (string | number)[];
  /** Change handler */
  onChange?: (value: string | number | (string | number)[]) => void;
  /** Multi-select mode */
  isMulti?: boolean;
  /** Show clear button */
  isClearable?: boolean;
  /** Searchable */
  isSearchable?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Icon */
  icon?: React.ReactNode;
  /** Custom render for selected value */
  renderValue?: (value: SelectOption | SelectOption[]) => React.ReactNode;
}

/**
 * Select dropdown component with custom styling
 *
 * @example
 * <Select
 *   options={[
 *     { value: 'a', label: 'Option A' },
 *     { value: 'b', label: 'Option B' },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 *   placeholder="Select an option..."
 * />
 */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      size,
      options,
      value,
      onChange,
      isMulti,
      isClearable,
      isSearchable,
      placeholder = 'Select...',
      label,
      error,
      helperText,
      icon,
      renderValue,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Get selected option(s)
    const selectedOptions = React.useMemo(() => {
      if (!value) return [];
      const values = isMulti ? (Array.isArray(value) ? value : [value]) : [value];
      return options.filter((opt) => values.includes(opt.value));
    }, [value, options, isMulti]);

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
      if (!isSearchable || !searchText) return options;
      return options.filter((opt) =>
        String(opt.label).toLowerCase().includes(searchText.toLowerCase())
      );
    }, [options, searchText, isSearchable]);

    // Handle option click
    const handleSelectOption = (option: SelectOption) => {
      if (isMulti) {
        const values = Array.isArray(value) ? value : [];
        const newValues = values.includes(option.value)
          ? values.filter((v) => v !== option.value)
          : [...values, option.value];
        onChange?.(newValues);
      } else {
        onChange?.(option.value);
        setIsOpen(false);
        setSearchText('');
      }
    };

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(isMulti ? [] : '');
    };

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          triggerRef.current &&
          menuRef.current &&
          !triggerRef.current.contains(e.target as Node) &&
          !menuRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {label}
          </label>
        )}

        {/* Select Trigger */}
        <div className="relative">
          <button
            ref={(el) => {
              triggerRef.current = el;
              if (typeof ref === 'function') ref(el);
              else if (ref) ref.current = el;
            }}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(selectTriggerVariants({ size }), className)}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-labelledby={selectId}
            {...props}
          >
            {/* Selected value display */}
            <div className="flex items-center gap-2 flex-1 min-w-0 text-left">
              {icon && <span className="flex-shrink-0">{icon}</span>}

              {selectedOptions.length > 0 ? (
                <span className="truncate">
                  {renderValue ? (
                    renderValue(isMulti ? selectedOptions : selectedOptions[0])
                  ) : isMulti ? (
                    `${selectedOptions.length} selected`
                  ) : (
                    selectedOptions[0]?.label
                  )}
                </span>
              ) : (
                <span className="text-slate-500">{placeholder}</span>
              )}
            </div>

            {/* Chevron & Clear */}
            {isClearable && selectedOptions.length > 0 ? (
              <button
                className="flex-shrink-0 p-0.5 hover:bg-slate-100 rounded"
                onClick={handleClear}
                type="button"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              <svg
                className={cn(
                  'flex-shrink-0 w-5 h-5 transition-transform',
                  isOpen && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={menuRef}
                className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-lg shadow-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Search */}
                {isSearchable && (
                  <div className="p-2 border-b border-slate-200">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className={cn(selectTriggerVariants({ size: 'sm' }), 'mb-0')}
                      autoFocus
                    />
                  </div>
                )}

                {/* Options */}
                <ul
                  className="max-h-64 overflow-y-auto py-1"
                  role="listbox"
                  aria-multiselectable={isMulti}
                >
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={selectedOptions.some(
                          (o) => o.value === option.value
                        )}
                      >
                        <button
                          onClick={() => handleSelectOption(option)}
                          disabled={option.disabled}
                          className={cn(
                            'w-full text-left px-3 py-2 flex items-center gap-2 transition-colors',
                            'hover:bg-blue-50 hover:text-blue-900',
                            option.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                            selectedOptions.some((o) => o.value === option.value) &&
                              'bg-blue-50 text-blue-900 font-medium'
                          )}
                          type="button"
                        >
                          {isMulti && (
                            <input
                              type="checkbox"
                              checked={selectedOptions.some(
                                (o) => o.value === option.value
                              )}
                              readOnly
                              className="w-4 h-4 cursor-pointer"
                            />
                          )}
                          {option.icon && (
                            <span className="flex-shrink-0">{option.icon}</span>
                          )}
                          <span className="flex-1">{option.label}</span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-slate-500 text-center">
                      No options found
                    </li>
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-1.5 text-sm text-red-600 font-medium" role="alert">
            {error}
          </div>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
