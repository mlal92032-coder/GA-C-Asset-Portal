/**
 * Avatar Component
 * ============================================================================
 * Profile picture component with fallback to initials.
 * Supports multiple sizes and shapes.
 *
 * Sizes: xs, sm, md, lg, xl
 * Shapes: circle, square
 *
 * Usage:
 *   <Avatar src="..." alt="User" />
 *   <Avatar name="John Doe" />
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'inline-flex items-center justify-center flex-shrink-0 font-semibold text-white',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-lg',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

interface AvatarProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'>,
    VariantProps<typeof avatarVariants> {
  /** Image source URL */
  src?: string;
  /** Fallback text (name or initials) */
  name?: string;
  /** Background color */
  bg?: string;
  /** Status badge ('online', 'offline', 'away') */
  status?: 'online' | 'offline' | 'away';
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get color hash from name
 */
function getColorFromName(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * Avatar component for displaying user profile pictures
 *
 * @example
 * <Avatar src="avatar.jpg" alt="John Doe" />
 * <Avatar name="John Doe" />
 */
export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  (
    {
      className,
      size,
      shape,
      src,
      name = 'User',
      alt,
      bg,
      status,
      onError,
      ...props
    },
    ref
  ) => {
    const [hasError, setHasError] = React.useState(!src);
    const colorClass = bg || getColorFromName(name);
    const initials = getInitials(name);

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-slate-400',
      away: 'bg-amber-500',
    };

    if (hasError || !src) {
      return (
        <div className={cn(avatarVariants({ size, shape }), colorClass, className)}>
          {initials}
        </div>
      );
    }

    return (
      <div className={cn('relative inline-flex flex-shrink-0')}>
        <img
          ref={ref}
          src={src}
          alt={alt || name}
          className={cn(avatarVariants({ size, shape }), 'object-cover', className)}
          onError={(e) => {
            setHasError(true);
            onError?.(e);
          }}
          {...props}
        />
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white',
              statusColors[status],
              size === 'xs' && 'h-2 w-2',
              size === 'sm' && 'h-2.5 w-2.5',
              size === 'md' && 'h-3 w-3',
              size === 'lg' && 'h-3.5 w-3.5',
              size === 'xl' && 'h-4 w-4'
            )}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// ============================================================================
// Avatar Group Component
// ============================================================================

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatar array items */
  items: AvatarProps[];
  /** Maximum avatars to display (rest in +n indicator) */
  max?: number;
  /** Avatar size */
  size?: VariantProps<typeof avatarVariants>['size'];
  /** Avatar shape */
  shape?: VariantProps<typeof avatarVariants>['shape'];
}

/**
 * Avatar group for displaying multiple avatars
 */
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      className,
      items,
      max = 3,
      size = 'md',
      shape = 'circle',
      ...props
    },
    ref
  ) => {
    const displayItems = items.slice(0, max);
    const remaining = Math.max(0, items.length - max);

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center -space-x-3',
          '[&_img]:border-2 [&_img]:border-white',
          className
        )}
        {...props}
      >
        {displayItems.map((item, index) => (
          <Avatar key={index} {...item} size={size} shape={shape} />
        ))}
        {remaining > 0 && (
          <div
            className={cn(
              avatarVariants({ size, shape }),
              'bg-slate-300 text-slate-700 font-bold border-2 border-white'
            )}
          >
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
