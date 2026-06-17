'use client';

import { AlertCircle } from 'lucide-react';
import { SelectHTMLAttributes, ReactNode } from 'react';

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label: string;
  name: string;
  icon?: ReactNode;
  error?: string;
  register?: any;
  options: Array<{ value: string; label: string }>;
}

export default function FormSelect({
  label,
  name,
  icon,
  error,
  register,
  required,
  options,
  disabled,
  ...rest
}: FormSelectProps) {
  const selectProps = register ? register(name) : { name };

  return (
    <div>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <select
          id={name}
          className={`${icon ? 'pl-10' : ''} ${error ? 'error' : ''}`}
          disabled={disabled}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...selectProps}
          {...rest}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p id={`${name}-error`} className="form-error" role="alert">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
