'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { formStagger } from '@/lib/animations';

interface ResponsiveFormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function ResponsiveForm({ children, onSubmit, className = '' }: ResponsiveFormProps) {
  return (
    <motion.form
      onSubmit={onSubmit}
      className={`space-y-4 md:space-y-6 ${className}`}
      variants={formStagger.container}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.form>
  );
}

interface FormGroupProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function FormGroup({ children, columns = 1, className = '' }: FormGroupProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 md:gap-6 ${className}`}>
      {children}
    </div>
  );
}

interface FormRowProps {
  children: ReactNode;
  className?: string;
}

export function FormRow({ children, className = '' }: FormRowProps) {
  return <div className={`space-y-4 md:space-y-6 ${className}`}>{children}</div>;
}

interface FormActionsProps {
  children: ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between';
  className?: string;
}

export function FormActions({
  children,
  justify = 'end',
  className = '',
}: FormActionsProps) {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <motion.div
      className={`flex flex-col-reverse md:flex-row gap-3 ${justifyClasses[justify]} mt-6 md:mt-8 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

interface MobileTouchButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

export function MobileTouchButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: MobileTouchButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`w-full md:w-auto px-6 py-3 md:py-2 rounded-lg font-medium transition-colors ${variantClasses[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.button>
  );
}
