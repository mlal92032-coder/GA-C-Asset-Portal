'use client';

import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  variant?: 'ring' | 'dots' | 'bars';
}

export function Spinner({ size = 'md', color = 'primary', variant = 'ring' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colors = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  if (variant === 'dots') {
    return (
      <div className={`${sizes[size]} flex items-center justify-center gap-1`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`rounded-full ${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5'} ${colors[color].replace('text-', 'bg-')}`}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={`${sizes[size]} flex items-center justify-center gap-1`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`rounded-sm ${size === 'sm' ? 'w-1 h-2' : size === 'md' ? 'w-1.5 h-3' : 'w-2 h-4'} ${colors[color].replace('text-', 'bg-')}`}
            animate={{ scaleY: [0.4, 1, 0.4] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    );
  }

  // Default ring variant
  return (
    <motion.div
      className={`${sizes[size]} ${colors[color]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

// Export all variants for convenience
export function SpinnerRing(props: Omit<SpinnerProps, 'variant'>) {
  return <Spinner {...props} variant="ring" />;
}

export function SpinnerDots(props: Omit<SpinnerProps, 'variant'>) {
  return <Spinner {...props} variant="dots" />;
}

export function SpinnerBars(props: Omit<SpinnerProps, 'variant'>) {
  return <Spinner {...props} variant="bars" />;
}
