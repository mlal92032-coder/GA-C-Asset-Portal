'use client';

import { AlertCircle, X } from 'lucide-react';
import { InputHTMLAttributes, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  name: string;
  icon?: ReactNode;
  error?: string;
  register?: any;
  showClear?: boolean;
  onClear?: () => void;
}

export default function FormInput({
  label,
  name,
  icon,
  error,
  register,
  required,
  type = 'text',
  placeholder,
  disabled,
  showClear,
  onClear,
  value,
  ...rest
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputProps = register ? register(name) : { name };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.label
        htmlFor={name}
        className={`form-label block text-sm font-medium mb-2 transition-colors ${
          error ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-gray-700'
        }`}
        animate={{ y: isFocused ? -2 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      <motion.div
        className="relative"
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
            : '0 0 0 0px rgba(59, 130, 246, 0)',
        }}
        transition={{ duration: 0.2 }}
      >
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={name}
          type={type}
          className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all ${icon ? 'pl-10' : ''} ${showClear && value ? 'pr-10' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200'}`}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          autoComplete={type === 'password' ? 'new-password' : 'off'}
          {...inputProps}
          {...rest}
        />

        {showClear && value && (
          <motion.button
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            aria-label="Clear input"
          >
            <X size={18} />
          </motion.button>
        )}
      </motion.div>

      {error && (
        <motion.p
          id={`${name}-error`}
          className="form-error text-red-500 text-sm mt-1 flex items-center gap-1"
          role="alert"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
