import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  tooltip?: string;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600',
  secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  success: 'bg-green-500 text-white hover:bg-green-600',
  ghost: 'text-slate-700 hover:bg-slate-100',
};

const sizeClasses: Record<string, string> = {
  sm: 'p-1.5 h-8 w-8',
  md: 'p-2 h-10 w-10',
  lg: 'p-3 h-12 w-12',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className = '',
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      disabled,
      icon,
      children,
      tooltip,
      title,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const variantClass = variantClasses[variant] || variantClasses.secondary;
    const sizeClass = sizeClasses[size] || sizeClasses.md;

    const buttonClass = `inline-flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${sizeClass} ${className}`;

    return (
      <button
        ref={ref}
        className={buttonClass}
        disabled={isDisabled}
        title={tooltip || title}
        {...props}
      >
        {isLoading ? (
          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : icon ? (
          icon
        ) : (
          children
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
