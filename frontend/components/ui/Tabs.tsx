/**
 * Tabs Component
 * ============================================================================
 * Accessible tab interface component with keyboard navigation.
 *
 * Features:
 * - Keyboard navigation (arrows, Home, End)
 * - Animated content transitions
 * - Custom styling
 * - Icon support
 *
 * Usage:
 *   <Tabs value={tab} onChange={setTab}>
 *     <TabsList>
 *       <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *       <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="tab1">Content 1</TabsContent>
 *   </Tabs>
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const tabsListVariants = cva(
  'flex items-center border-b border-slate-200',
  {
    variants: {
      variant: {
        underline: 'gap-0',
        pill: 'gap-2 p-1 bg-slate-100 rounded-lg border-none',
        segments: 'gap-0 bg-slate-100 rounded-lg border-none p-1',
      },
    },
    defaultVariants: {
      variant: 'underline',
    },
  }
);

const tabsTriggerVariants = cva(
  cn(
    'relative px-4 py-2.5 text-sm font-medium',
    'transition-colors duration-200 cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    'text-slate-600 hover:text-slate-900',
    'disabled:text-slate-400 disabled:cursor-not-allowed'
  ),
  {
    variants: {
      variant: {
        underline: 'border-b-2 border-b-transparent hover:border-b-slate-300',
        pill: 'rounded-md',
        segments: 'rounded-md flex-1',
      },
    },
    defaultVariants: {
      variant: 'underline',
    },
  }
);

// ============================================================================
// Tabs Context
// ============================================================================

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
  variant: VariantProps<typeof tabsListVariants>['variant'];
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within <Tabs>');
  }
  return context;
};

// ============================================================================
// Tabs Component
// ============================================================================

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current active tab */
  value: string;
  /** Tab change handler */
  onValueChange: (value: string) => void;
  /** Tab variant */
  variant?: VariantProps<typeof tabsListVariants>['variant'];
}

/**
 * Tabs container
 *
 * @example
 * <Tabs value={tab} onValueChange={setTab}>
 *   <TabsList>
 *     <TabsTrigger value="a">Tab A</TabsTrigger>
 *     <TabsTrigger value="b">Tab B</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="a">Content A</TabsContent>
 *   <TabsContent value="b">Content B</TabsContent>
 * </Tabs>
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    { className, value, onValueChange, variant = 'underline', children, ...props },
    ref
  ) => (
    <TabsContext.Provider value={{ value, onValueChange, variant }}>
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
);

Tabs.displayName = 'Tabs';

// ============================================================================
// TabsList Component
// ============================================================================

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { variant } = useTabsContext();

    return (
      <div
        ref={ref}
        className={cn(tabsListVariants({ variant }), className)}
        role="tablist"
        {...props}
      />
    );
  }
);

TabsList.displayName = 'TabsList';

// ============================================================================
// TabsTrigger Component
// ============================================================================

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Tab value */
  value: string;
  /** Tab icon */
  icon?: React.ReactNode;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, icon, children, disabled, ...props }, ref) => {
    const { value: activeValue, onValueChange, variant } = useTabsContext();
    const isActive = value === activeValue;
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const triggers = document.querySelectorAll('[role="tab"]:not([disabled])');
      const currentIndex = Array.from(triggers).indexOf(
        e.currentTarget
      );

      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % triggers.length;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
        e.preventDefault();
      } else if (e.key === 'Home') {
        nextIndex = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        nextIndex = triggers.length - 1;
        e.preventDefault();
      }

      if (nextIndex !== null) {
        const nextTrigger = triggers[nextIndex] as HTMLButtonElement;
        nextTrigger.focus();
      }
    };

    return (
      <button
        ref={(el) => {
          triggerRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        role="tab"
        aria-selected={isActive}
        aria-controls={`content-${value}`}
        disabled={disabled}
        onClick={() => onValueChange(value)}
        onKeyDown={handleKeyDown}
        className={cn(
          tabsTriggerVariants({ variant }),
          isActive &&
            variant === 'underline' &&
            'border-b-blue-500 text-slate-900',
          isActive &&
            (variant === 'pill' || variant === 'segments') &&
            'bg-white text-slate-900 shadow-sm',
          className
        )}
        {...props}
      >
        {/* Animated underline */}
        {variant === 'underline' && isActive && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            layoutId="tab-indicator"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        {/* Content */}
        <span className="flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </span>
      </button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

// ============================================================================
// TabsContent Component
// ============================================================================

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tab value */
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: activeValue } = useTabsContext();
    const isActive = value === activeValue;

    return (
      <motion.div
        ref={ref}
        role="tabpanel"
        aria-labelledby={`trigger-${value}`}
        id={`content-${value}`}
        hidden={!isActive}
        className={cn('mt-4', !isActive && 'hidden', className)}
        initial={{ opacity: 0, y: 10 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

TabsContent.displayName = 'TabsContent';
