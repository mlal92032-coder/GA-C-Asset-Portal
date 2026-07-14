# Design Implementation Guide
## Asset Management System - Technical Reference

**Version:** 1.0  
**Created:** July 13, 2026  
**Purpose:** Step-by-step implementation of design recommendations

---

## Table of Contents
1. Design Tokens Setup
2. Component Refactoring
3. Animation Implementation
4. Accessibility Fixes
5. Testing Procedures

---

## 1. DESIGN TOKENS SETUP

### 1.1 Create Design Tokens TypeScript File

**File:** `src/lib/design-tokens.ts`

```typescript
// Design tokens for consistent styling across the application
export const tokens = {
  // Color palette
  colors: {
    // Neutral (Slate)
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',      // Improved contrast
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },

    // Primary (Blue)
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',      // Primary
      600: '#2563eb',      // Hover
      700: '#1d4ed8',      // Active
      800: '#1e40af',
      900: '#1e3a8a',
    },

    // Success (Emerald)
    emerald: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',      // Success
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#145231',
    },

    // Warning (Amber)
    amber: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',      // Warning
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },

    // Danger (Red)
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',      // Danger
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },

    // Accent (Indigo)
    indigo: {
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
    },
  },

  // Semantic colors
  semantic: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryActive: '#1d4ed8',
    primaryLight: '#eff6ff',

    secondary: '#475569',  // Updated for accessibility
    secondaryLight: '#f1f5f9',

    success: '#22c55e',    // More vibrant
    successLight: '#f0fdf4',

    warning: '#f59e0b',
    warningLight: '#fffbeb',

    danger: '#ef4444',
    dangerLight: '#fef2f2',

    info: '#3b82f6',
    infoLight: '#eff6ff',
  },

  // Text colors
  text: {
    primary: '#0f172a',      // Slate-900
    secondary: '#475569',    // Slate-600 (improved)
    tertiary: '#94a3b8',     // Slate-400
    disabled: '#cbd5e1',     // Slate-300
    inverse: '#ffffff',
  },

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',    // Slate-50
    tertiary: '#f1f5f9',     // Slate-100
  },

  // Border colors
  border: {
    light: '#e2e8f0',        // Slate-200
    medium: '#cbd5e1',       // Slate-300
    dark: '#94a3b8',         // Slate-400
  },

  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  },

  // Spacing scale
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem',   // 48px
  },

  // Typography
  typography: {
    fontSize: {
      xs: { size: '0.75rem', lineHeight: '1rem' },
      sm: { size: '0.875rem', lineHeight: '1.25rem' },
      base: { size: '1rem', lineHeight: '1.5rem' },
      lg: { size: '1.125rem', lineHeight: '1.75rem' },
      xl: { size: '1.5rem', lineHeight: '2rem' },
      '2xl': { size: '1.875rem', lineHeight: '2.25rem' },
      '3xl': { size: '2.25rem', lineHeight: '2.5rem' },
    },

    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // Border radius
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Transitions & Animations
  transitions: {
    fast: '0.15s',
    base: '0.3s',
    slow: '0.5s',
  },

  easings: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Type-safe exports
export type ColorKey = keyof typeof tokens.colors;
export type SemanticColorKey = keyof typeof tokens.semantic;
export type TextColorKey = keyof typeof tokens.text;
```

### 1.2 Create CSS Custom Properties

**File:** `src/app/tokens.css`

```css
/* Design Tokens - CSS Custom Properties */
:root {
  /* Color Palette */
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;  /* IMPROVED: Better contrast */
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;

  --blue-50: #eff6ff;
  --blue-100: #dbeafe;
  --blue-200: #bfdbfe;
  --blue-300: #93c5fd;
  --blue-400: #60a5fa;
  --blue-500: #3b82f6;
  --blue-600: #2563eb;
  --blue-700: #1d4ed8;
  --blue-800: #1e40af;
  --blue-900: #1e3a8a;

  --emerald-50: #f0fdf4;
  --emerald-100: #dcfce7;
  --emerald-500: #22c55e;
  --emerald-600: #16a34a;
  --emerald-700: #15803d;

  --amber-50: #fffbeb;
  --amber-100: #fef3c7;
  --amber-500: #f59e0b;
  --amber-600: #d97706;
  --amber-700: #b45309;

  --red-50: #fef2f2;
  --red-100: #fee2e2;
  --red-500: #ef4444;
  --red-600: #dc2626;
  --red-700: #b91c1c;

  /* Semantic Colors */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-active: #1d4ed8;
  --color-primary-light: #eff6ff;

  --color-secondary: #475569;
  --color-secondary-light: #f1f5f9;

  --color-success: #22c55e;
  --color-success-light: #f0fdf4;

  --color-warning: #f59e0b;
  --color-warning-light: #fffbeb;

  --color-danger: #ef4444;
  --color-danger-light: #fef2f2;

  /* Text Colors */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #94a3b8;
  --text-disabled: #cbd5e1;
  --text-inverse: #ffffff;

  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;

  /* Border Colors */
  --border-light: #e2e8f0;
  --border-medium: #cbd5e1;
  --border-dark: #94a3b8;

  /* Shadows */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.15);

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 2.5rem;
  --spacing-3xl: 3rem;

  /* Transitions */
  --transition-fast: 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-base: 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-slow: 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-tertiary: #94a3b8;
    --border-light: #334155;
    --border-medium: #475569;
    --border-dark: #64748b;
  }
}
```

### 1.3 Update globals.css

**Replace existing color definitions with:**

```css
/* Import design tokens first */
@import "./tokens.css";

/* Update form input base styling */
input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"],
input[type="number"],
input[type="tel"],
input[type="search"],
select,
textarea {
  border-color: var(--border-light);
  background: var(--bg-primary);
  color: var(--text-primary);
  caret-color: var(--color-primary);
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

/* Button styling */
.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1.5px solid var(--border-light);
}

/* Form labels */
.form-label {
  color: var(--text-primary);
}

.form-label.required::after {
  color: var(--color-danger);
}

/* Cards */
.card {
  background: var(--bg-primary);
  border-color: var(--border-light);
}

/* Tables */
thead th {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-color: var(--border-light);
}

tbody td {
  color: var(--text-secondary);
  border-color: var(--border-light);
}
```

---

## 2. COMPONENT REFACTORING

### 2.1 Enhanced Button Component

**File:** `src/components/Button.tsx` (Updated)

```tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { tokens } from '@/lib/design-tokens';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const sizeConfig = {
  xs: {
    padding: 'px-2 py-1',
    fontSize: 'text-xs',
    height: 'h-7',
    iconSize: 'w-3 h-3',
    gap: 'gap-1',
  },
  sm: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-sm',
    height: 'h-8',
    iconSize: 'w-4 h-4',
    gap: 'gap-1.5',
  },
  md: {
    padding: 'px-4 py-2',
    fontSize: 'text-sm',
    height: 'h-9',
    iconSize: 'w-4 h-4',
    gap: 'gap-2',
  },
  lg: {
    padding: 'px-5 py-2.5',
    fontSize: 'text-base',
    height: 'h-10',
    iconSize: 'w-5 h-5',
    gap: 'gap-2',
  },
  xl: {
    padding: 'px-6 py-3',
    fontSize: 'text-base',
    height: 'h-12',
    iconSize: 'w-5 h-5',
    gap: 'gap-2.5',
  },
};

const variantConfig = {
  primary: {
    base: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800',
    disabled: 'bg-slate-200 text-slate-400 cursor-not-allowed',
  },
  secondary: {
    base: 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 active:bg-slate-300',
    disabled: 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed',
  },
  success: {
    base: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800',
    disabled: 'bg-slate-200 text-slate-400 cursor-not-allowed',
  },
  danger: {
    base: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800',
    disabled: 'bg-slate-200 text-slate-400 cursor-not-allowed',
  },
  warning: {
    base: 'bg-amber-600 text-white shadow-sm hover:bg-amber-700 active:bg-amber-800',
    disabled: 'bg-slate-200 text-slate-400 cursor-not-allowed',
  },
  ghost: {
    base: 'text-slate-700 hover:bg-slate-100 active:bg-slate-200',
    disabled: 'text-slate-400 cursor-not-allowed',
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sizeClass = sizeConfig[size];
  const variantClass = variantConfig[variant];
  const isDisabled = disabled || loading;

  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-lg
    transition-all duration-[${tokens.transitions.fast}]
    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
    disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${sizeClass.padding}
    ${sizeClass.fontSize}
    ${sizeClass.height}
    ${sizeClass.gap}
    ${isDisabled ? variantClass.disabled : variantClass.base}
    ${className}
  `;

  return (
    <motion.button
      className={baseClasses}
      disabled={isDisabled}
      whileHover={!isDisabled ? { y: -2 } : {}}
      whileTap={!isDisabled ? { y: 0 } : {}}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className={sizeClass.iconSize} />
          </motion.div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className={sizeClass.iconSize}>{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className={sizeClass.iconSize}>{icon}</span>}
        </>
      )}
    </motion.button>
  );
}
```

### 2.2 Enhanced Form Input Component

**File:** `src/components/form/FormInput.tsx` (Updated)

```tsx
'use client';

import { AlertCircle, X } from 'lucide-react';
import { InputHTMLAttributes, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  name: string;
  icon?: ReactNode;
  error?: string;
  register?: any;
  showClear?: boolean;
  onClear?: () => void;
  helpText?: string;
}

export default function FormInput({
  label,
  name,
  icon,
  error,
  register,
  required,
  type = 'text',
  placeholder,
  disabled,
  showClear,
  onClear,
  value,
  helpText,
  ...rest
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputProps = register ? register(name) : { name };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      {/* Label */}
      <label
        htmlFor={name}
        className={`
          block text-sm font-medium mb-2
          transition-colors duration-200
          ${error ? 'text-red-600' : isFocused ? 'text-blue-600' : 'text-slate-700'}
        `}
      >
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          autoComplete={type === 'password' ? 'new-password' : 'off'}
          className={`
            w-full px-3 py-2.5 text-sm
            border rounded-lg
            transition-all duration-200
            focus:outline-none
            ${icon ? 'pl-10' : ''}
            ${showClear && value ? 'pr-10' : ''}
            ${
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
            }
            ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white'}
          `}
          {...inputProps}
          {...rest}
        />

        {/* Clear Button */}
        {showClear && value && (
          <motion.button
            onClick={onClear}
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Clear input"
          >
            <X size={18} />
          </motion.button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          id={`${name}-error`}
          role="alert"
          className="flex items-center gap-1.5 mt-1.5 text-sm text-red-600 font-medium"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.p>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <p id={`${name}-help`} className="mt-1.5 text-sm text-slate-500">
          {helpText}
        </p>
      )}
    </motion.div>
  );
}
```

### 2.3 Enhanced Card Component

**File:** `src/components/Card.tsx` (New)

```tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

type CardVariant = 'default' | 'elevated' | 'outlined';
type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  hover?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  default: 'bg-white border border-slate-200 shadow-sm',
  elevated: 'bg-white shadow-lg shadow-slate-200/50',
  outlined: 'bg-slate-50 border border-slate-200',
};

const paddingClasses = {
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export function Card({
  variant = 'default',
  padding = 'md',
  interactive = false,
  hover = true,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      className={`
        rounded-lg
        transition-all duration-200
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${interactive ? 'cursor-pointer' : ''}
        ${hover ? 'hover:shadow-md' : ''}
        ${className}
      `}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

---

## 3. ANIMATION IMPLEMENTATION

### 3.1 Enhanced Animation Library

**File:** `src/lib/animations.ts` (Complete Replacement)

```typescript
import { Variants } from 'framer-motion';

// Standard timing
export const timings = {
  instant: 0.05,
  fast: 0.15,
  base: 0.3,
  slow: 0.5,
  slower: 0.8,
};

// Standard easing functions
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  spring: [0.25, 0.46, 0.45, 0.94],
};

// ===== ENTRANCE ANIMATIONS =====
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: timings.base },
};

export const slideInFromLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: timings.base, ease: 'easeOut' },
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: timings.base, ease: 'easeOut' },
};

export const slideInFromTop: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: timings.base, ease: 'easeOut' },
};

export const slideInFromBottom: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: timings.base, ease: 'easeOut' },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: timings.base, ease: 'easeOut' },
};

// ===== SUCCESS ANIMATIONS =====
export const successPulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
  },
  transition: { duration: timings.slow, ease: 'easeInOut' },
};

export const successCheck = {
  initial: { scale: 0, rotate: -45 },
  animate: { scale: 1, rotate: 0 },
  transition: { type: 'spring', stiffness: 200, damping: 20 },
};

// ===== ERROR ANIMATIONS =====
export const errorShake = {
  animate: {
    x: [-8, 8, -8, 8, 0],
  },
  transition: {
    duration: timings.base,
    times: [0, 0.25, 0.5, 0.75, 1],
  },
};

// ===== LOADING ANIMATIONS =====
export const spin = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: 'linear' },
};

export const pulse = {
  animate: { opacity: [0.6, 1, 0.6] },
  transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
};

export const shimmer = {
  animate: {
    backgroundPosition: ['-1000px 0', '1000px 0'],
  },
  transition: { duration: 2, repeat: Infinity, ease: 'linear' },
};

// ===== INTERACTIVE ANIMATIONS =====
export const buttonHover = {
  scale: 1.02,
  transition: { duration: timings.fast },
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: timings.instant },
};

export const hoverLift = {
  whileHover: {
    y: -4,
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  transition: { duration: timings.fast },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)',
  },
  transition: { duration: timings.fast },
};

// ===== STAGGER ANIMATIONS =====
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: timings.base },
  },
};

export const staggerFast = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: timings.fast },
    },
  },
};

// ===== MODAL ANIMATIONS =====
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: timings.fast },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: timings.base,
      ease: 'easeOut',
    },
  },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

// ===== CARD ANIMATIONS =====
export const cardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: timings.base },
};

// ===== FORM ANIMATIONS =====
export const formFieldAnimation = {
  focus: { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' },
};

export const formStagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  },
  item: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: timings.base },
  },
};
```

---

## 4. ACCESSIBILITY FIXES

### 4.1 Color Contrast Fix in globals.css

```css
/* WCAG AA Compliant Colors */
:root {
  /* Updated secondary color for better contrast */
  --secondary: #475569;      /* Changed from #64748b */
  --text-secondary: #475569; /* Better contrast on light bg */
}

/* Form labels - darker for accessibility */
.form-label {
  color: #1f2937;           /* Darker than current */
  font-weight: 500;
}

/* Placeholder text - darker for visibility */
input::placeholder,
textarea::placeholder {
  color: #6b7280;           /* Darker gray */
  opacity: 1;
}

/* Link colors - must meet 4.5:1 contrast */
a {
  color: #1d4ed8;           /* Primary-700 */
}

a:visited {
  color: #4f46e5;           /* Indigo-600 */
}

/* Error text */
.form-error {
  color: #b91c1c;           /* Red-700 for better contrast */
}

/* Ensure helper text is readable */
.form-helper {
  color: #4b5563;           /* Darker than current */
  font-size: 0.875rem;
}
```

### 4.2 Keyboard Navigation Enhancement

```tsx
// Example: Update FormInput for better keyboard support
<input
  // ... existing props
  onKeyDown={(e) => {
    if (showClear && value && e.key === 'Escape') {
      onClear?.();
    }
  }}
/>
```

### 4.3 ARIA Labels Enhancement

```tsx
// Button example
<button
  aria-label={`${action} ${itemName}`}
  aria-busy={loading}
  aria-disabled={disabled}
>
  {children}
</button>

// Form example
<input
  aria-label={label}
  aria-required={required}
  aria-invalid={!!error}
  aria-describedby={error ? `${name}-error` : `${name}-help`}
/>
```

---

## 5. TESTING PROCEDURES

### 5.1 Color Contrast Testing Checklist

```bash
# Install accessibility testing tools
npm install -D axe-core jest-axe

# Test color contrast with WebAIM
# https://webaim.org/resources/contrastchecker/

# Test with color blindness simulator
# https://www.color-blindness.com/coblis-color-blindness-simulator/
```

### 5.2 Accessibility Testing Checklist

- [ ] All buttons are keyboard accessible (Tab key)
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Focus ring is visible on all interactive elements
- [ ] Focus order follows visual order (top-to-bottom)
- [ ] Form labels connected to inputs
- [ ] Error messages linked to fields
- [ ] Icons have alt text or aria-labels
- [ ] Color is not sole indicator of status

### 5.3 Responsive Testing Breakpoints

```
Mobile:     375px (iPhone 12/13 mini)
Mobile+:    414px (iPhone 14 Plus)
Tablet:     768px (iPad)
Desktop:    1024px (MacBook Air)
Wide:       1280px (1080p monitor)
Ultra:      1536px (4K display)
```

---

## 6. IMPLEMENTATION CHECKLIST

- [ ] Design tokens file created
- [ ] CSS custom properties defined
- [ ] Color contrast issues fixed
- [ ] Button component refactored
- [ ] Form input component enhanced
- [ ] Card component created
- [ ] Animation library updated
- [ ] Modal accessibility improved
- [ ] Keyboard navigation tested
- [ ] Screen reader tested (NVDA/JAWS)
- [ ] Responsive layout verified
- [ ] Dark mode tested
- [ ] Documentation created
- [ ] Team training completed

---

**Document Version:** 1.0  
**Last Updated:** July 13, 2026  
**Next Update:** After Phase 1 completion
