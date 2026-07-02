'use client';

import { AlertCircle } from 'lucide-react';
import { TextareaHTMLAttributes } from 'react';

interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label: string;
  name: string;
  error?: string;
  register?: any;
}

export default function FormTextarea({
  label,
  name,
  error,
  register,
  required,
  placeholder,
  disabled,
  rows = 4,
  ...rest
}: FormTextareaProps) {
  const textareaProps = register ? register(name) : { name };

  return (
    <div>
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        className={error ? 'error' : ''}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        aria-label={label}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        autoComplete="off"
        {...textareaProps}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} className="form-error" role="alert">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
