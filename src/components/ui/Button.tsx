import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'iconLg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  as?: 'button' | 'a' | 'div';
  fullWidth?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200 shadow-sm',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg',
  success: 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  outline: 'bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
};

const sizeClasses: Record<string, string> = {
  xs: 'px-2 py-1.5 text-xs h-7',
  sm: 'px-3 py-2 text-sm h-9',
  md: 'px-4 py-2.5 text-sm h-10',
  lg: 'px-6 py-3 text-base h-11',
  xl: 'px-8 py-4 text-base h-12',
  icon: 'p-2 h-10 w-10',
  iconLg: 'p-3 h-12 w-12',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      icon,
      iconRight,
      disabled,
      children,
      as: Component = 'button',
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const variantClass = variantClasses[variant] || variantClasses.primary;
    const sizeClass = sizeClasses[size] || sizeClasses.md;

    const buttonClass = `inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${variantClass} ${sizeClass} ${fullWidth ? 'w-full' : ''} ${className}`;

    const buttonContent = (
      <>
        {isLoading ? (
          <>
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
            {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
          </>
        )}
      </>
    );

    if (Component === 'a') {
      return (
        <a className={buttonClass} {...(props as any)}>
          {buttonContent}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClass}
        disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';
