'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { buttonHover, buttonTap } from '@/lib/animations';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  onClick,
  type = 'button',
  title,
  id,
  name,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-info',
  }[variant];

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: '',
  }[size];

  return (
    <motion.button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      whileHover={!disabled && !loading ? buttonHover : {}}
      whileTap={!disabled && !loading ? buttonTap : {}}
      onClick={onClick}
      title={title}
      id={id}
      name={name}
    >
      {loading ? (
        <>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 className="w-4 h-4" />
          </motion.div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && (
            <motion.span className="flex-shrink-0" whileHover={{ scale: 1.1 }}>
              {icon}
            </motion.span>
          )}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
  tooltip?: string;
}

export function IconButton({
  variant = 'secondary',
  size = 'md',
  icon,
  tooltip,
  disabled,
  className = '',
  onClick,
  type = 'button',
  ...props
}: IconButtonProps) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-info',
  }[variant];

  return (
    <motion.button
      type={type}
      className={`btn ${variantClass} ${className}`}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={tooltip}
      title={tooltip}
      whileHover={!disabled ? buttonHover : {}}
      whileTap={!disabled ? buttonTap : {}}
      onClick={onClick}
    >
      <motion.div whileHover={{ rotate: 5, scale: 1.1 }}>
        {icon}
      </motion.div>
    </motion.button>
  );
}
