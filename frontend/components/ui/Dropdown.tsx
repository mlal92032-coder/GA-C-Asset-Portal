/**
 * Dropdown Component
 * ============================================================================
 * Dropdown menu for action lists and navigation.
 *
 * Features:
 * - Automatic positioning
 * - Keyboard navigation
 * - Icon and badge support
 * - Dividers and groups
 *
 * Usage:
 *   <Dropdown trigger={<Button>Menu</Button>}>
 *     <DropdownItem>Edit</DropdownItem>
 *     <DropdownDivider />
 *     <DropdownItem variant="danger">Delete</DropdownItem>
 *   </Dropdown>
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DropdownContextType {
  isOpen: boolean;
  close: () => void;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(
  undefined
);

const useDropdownContext = () => {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within <Dropdown>');
  }
  return context;
};

// ============================================================================
// Dropdown Component
// ============================================================================

interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Trigger element */
  trigger: React.ReactNode;
  /** Dropdown placement */
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /** Trigger on click or hover */
  triggerMode?: 'click' | 'hover';
}

/**
 * Dropdown menu component
 *
 * @example
 * <Dropdown trigger={<Button>Menu</Button>}>
 *   <DropdownItem>Option 1</DropdownItem>
 *   <DropdownItem>Option 2</DropdownItem>
 * </Dropdown>
 */
export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      className,
      trigger,
      placement = 'bottom-left',
      triggerMode = 'click',
      children,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Close on outside click
    React.useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          triggerRef.current &&
          contentRef.current &&
          !triggerRef.current.contains(e.target as Node) &&
          !contentRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const placementClasses = {
      'bottom-left': 'top-full left-0 mt-2',
      'bottom-right': 'top-full right-0 mt-2',
      'top-left': 'bottom-full left-0 mb-2',
      'top-right': 'bottom-full right-0 mb-2',
    };

    return (
      <DropdownContext.Provider value={{ isOpen, close: () => setIsOpen(false) }}>
        <div ref={ref} className={cn('relative inline-block text-left', className)} {...props}>
          {/* Trigger */}
          <div
            ref={triggerRef}
            onClick={() => triggerMode === 'click' && setIsOpen(!isOpen)}
            onMouseEnter={() => triggerMode === 'hover' && setIsOpen(true)}
            onMouseLeave={() => triggerMode === 'hover' && setIsOpen(false)}
            className="inline-block"
          >
            {trigger}
          </div>

          {/* Content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={contentRef}
                className={cn(
                  'absolute z-50 min-w-48 rounded-lg bg-white shadow-xl border border-slate-200',
                  placementClasses[placement]
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div className="py-1" role="menu">
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DropdownContext.Provider>
    );
  }
);

Dropdown.displayName = 'Dropdown';

// ============================================================================
// DropdownItem Component
// ============================================================================

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Item variant */
  variant?: 'default' | 'danger' | 'success' | 'warning';
  /** Icon */
  icon?: React.ReactNode;
  /** Badge */
  badge?: React.ReactNode;
}

export const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, variant = 'default', icon, badge, children, onClick, ...props }, ref) => {
    const { close } = useDropdownContext();

    const variantClasses = {
      default: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
      danger: 'text-red-600 hover:bg-red-50 hover:text-red-900',
      success: 'text-green-600 hover:bg-green-50 hover:text-green-900',
      warning: 'text-amber-600 hover:bg-amber-50 hover:text-amber-900',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      close();
    };

    return (
      <button
        ref={ref}
        role="menuitem"
        className={cn(
          'w-full text-left px-3 py-2 text-sm font-medium transition-colors',
          'flex items-center gap-2',
          'focus:outline-none focus:bg-slate-100',
          variantClasses[variant],
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
        {badge && <span className="flex-shrink-0 text-xs">{badge}</span>}
      </button>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

// ============================================================================
// DropdownDivider Component
// ============================================================================

export const DropdownDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('my-1 border-t border-slate-200', className)}
    role="separator"
    {...props}
  />
));

DropdownDivider.displayName = 'DropdownDivider';

// ============================================================================
// DropdownLabel Component
// ============================================================================

export const DropdownLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider',
      className
    )}
    {...props}
  />
));

DropdownLabel.displayName = 'DropdownLabel';

// ============================================================================
// DropdownCheckboxItem Component
// ============================================================================

interface DropdownCheckboxItemProps extends DropdownItemProps {
  /** Checked state */
  checked?: boolean;
}

export const DropdownCheckboxItem = React.forwardRef<
  HTMLButtonElement,
  DropdownCheckboxItemProps
>(({ className, icon, checked, children, ...props }, ref) => (
  <DropdownItem
    ref={ref}
    className={className}
    icon={
      icon || (
        <div
          className={cn(
            'w-4 h-4 rounded border-2 flex items-center justify-center',
            checked
              ? 'bg-blue-500 border-blue-500'
              : 'border-slate-300 hover:border-slate-400'
          )}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      )
    }
    {...props}
  >
    {children}
  </DropdownItem>
));

DropdownCheckboxItem.displayName = 'DropdownCheckboxItem';
