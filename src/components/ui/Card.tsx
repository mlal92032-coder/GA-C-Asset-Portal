/**
 * Card Component
 * ============================================================================
 * Flexible container component with multiple variants and hover effects.
 * Supports interactive states, borders, and shadow variations.
 *
 * Variants: default, interactive, flat, elevated, bordered
 *
 * Usage:
 *   <Card>Card content</Card>
 *   <Card variant="interactive" onClick={handleClick}>Clickable card</Card>
 *   <Card className="p-6">Custom spacing</Card>
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  cn(
    'rounded-xl bg-white transition-all duration-300',
    'overflow-hidden'
  ),
  {
    variants: {
      variant: {
        default: cn(
          'border border-slate-200 shadow-md',
          'hover:shadow-lg hover:border-slate-300'
        ),
        interactive: cn(
          'border border-slate-200 shadow-md cursor-pointer',
          'hover:shadow-xl hover:border-blue-300 hover:-translate-y-1',
          'active:shadow-md active:translate-y-0',
          'transition-transform'
        ),
        flat: 'bg-slate-50 border border-slate-100',
        elevated: cn(
          'shadow-lg border border-slate-100',
          'hover:shadow-2xl'
        ),
        bordered: 'border-2 border-slate-300 shadow-sm',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Whether to apply hover animation */
  animate?: boolean;
  /** Click handler for interactive cards */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Role for accessibility */
  role?: string;
}

/**
 * Card component with multiple variants
 *
 * @example
 * <Card variant="interactive" onClick={handleClick}>
 *   <h3>Title</h3>
 *   <p>Content</p>
 * </Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      animate = variant === 'interactive',
      children,
      role,
      ...props
    },
    ref
  ) => {
    const Comp = animate ? motion.div : 'div';

    const motionProps = animate
      ? {
          whileHover: { y: -4 },
          transition: { duration: 0.2 },
        }
      : {};

    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        role={role || (props.onClick ? 'button' : undefined)}
        tabIndex={props.onClick ? 0 : undefined}
        {...motionProps}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// Card Subcomponents
// ============================================================================

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'bordered';
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-6 py-4 border-b border-slate-200',
        variant === 'accent' && 'bg-gradient-to-r from-blue-50 to-blue-25',
        variant === 'bordered' && 'border-b-2 border-blue-500',
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, level = 'h3', ...props }, ref) => {
    const HeadingTag = level as any;
    return (
      <HeadingTag
        ref={ref}
        className={cn(
          'text-lg font-bold text-slate-900 tracking-tight',
          className
        )}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-600 leading-relaxed', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
));

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'center' | 'end' }
>(({ className, align = 'end', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex gap-3 px-6 py-4 border-t border-slate-200',
      align === 'start' && 'justify-start',
      align === 'center' && 'justify-center',
      align === 'end' && 'justify-end',
      className
    )}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';
