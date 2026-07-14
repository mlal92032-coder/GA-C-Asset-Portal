'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { InputHTMLAttributes, ReactNode, useId, useState } from 'react';
import { generateId } from '@/lib/accessibility';

interface AccessibleInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  required?: boolean;
  description?: string;
}

export function AccessibleInput({
  label,
  error,
  helperText,
  icon,
  required,
  description,
  ...props
}: AccessibleInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const descId = `${id}-description`;
  const helperId = `${id}-helper`;
  const [isFocused, setIsFocused] = useState(false);

  const describedBy = [
    error ? errorId : null,
    description ? descId : null,
    helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.label
        htmlFor={id}
        className={`block text-sm font-medium mb-2 transition-colors ${
          error ? 'text-red-600' : isFocused ? 'text-blue-600' : 'text-gray-700'
        }`}
        animate={{ y: isFocused ? -2 : 0 }}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </motion.label>

      {description && (
        <p id={descId} className="text-xs text-gray-500 mb-2">
          {description}
        </p>
      )}

      <motion.div
        className="relative"
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
            : '0 0 0 0px rgba(59, 130, 246, 0)',
        }}
      >
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}

        <input
          id={id}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          aria-required={required}
          className={`w-full px-3 py-2 ${icon ? 'pl-10' : ''} border-2 rounded-lg transition-colors outline-none ${
            error
              ? 'border-red-300 bg-red-50'
              : isFocused
                ? 'border-blue-500 bg-white'
                : 'border-gray-200 bg-gray-50'
          }`}
          {...props}
        />
      </motion.div>

      {helperText && !error && (
        <p id={helperId} className="text-xs text-gray-500 mt-1">
          {helperText}
        </p>
      )}

      {error && (
        <motion.p
          id={errorId}
          className="text-red-600 text-sm mt-1 flex items-center gap-1"
          role="alert"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={16} />
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
