import React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ type = 'info', title, children, dismissible = false, onDismiss, className = '', ...props }, ref) => {
    const [isDismissed, setIsDismissed] = React.useState(false);

    const typeStyles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    if (isDismissed) return null;

    const handleDismiss = () => {
      setIsDismissed(true);
      onDismiss?.();
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border px-4 py-3 flex items-start gap-3 ${typeStyles[type]} ${className}`}
        {...props}
      >
        <div className="flex-1">
          {title && <h3 className="font-semibold">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="text-sm font-semibold hover:opacity-75"
            aria-label="Close alert"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
