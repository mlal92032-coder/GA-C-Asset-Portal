'use client';

import { AlertCircle } from 'lucide-react';
import { InputHTMLAttributes, ReactNode } from 'react';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  name: string;
  icon?: ReactNode;
  error?: string;
  register?: any;
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
  ...rest
}: FormInputProps) {
  const inputProps = register ? register(name) : { name };

  return (
    <div>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={name}
          type={type}
          className={`${icon ? 'pl-10' : ''} ${error ? 'error' : ''}`}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...inputProps}
          {...rest}
        />
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
