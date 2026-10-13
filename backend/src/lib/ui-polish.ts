/**
 * UI Polish and Polish Pass Utilities
 * Handles responsive design, animations, and micro-interactions
 */

/**
 * Viewport breakpoints (Tailwind CSS standard)
 */
export const BREAKPOINTS = {
  xs: 320,   // iPhone SE
  sm: 640,   // iPhone 11
  md: 768,   // iPad
  lg: 1024,  // iPad Pro / Desktop
  xl: 1280,  // Desktop
  '2xl': 1536, // Large Desktop
} as const;

/**
 * Check if viewport matches breakpoint
 */
export function isViewport(breakpoint: keyof typeof BREAKPOINTS): boolean {
  if (typeof window === 'undefined') return false;

  const width = window.innerWidth;
  const breakpointValue = BREAKPOINTS[breakpoint];

  switch (breakpoint) {
    case 'xs':
      return width < BREAKPOINTS.sm;
    case 'sm':
      return width >= BREAKPOINTS.sm && width < BREAKPOINTS.md;
    case 'md':
      return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    case 'lg':
      return width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl;
    case 'xl':
      return width >= BREAKPOINTS.xl && width < BREAKPOINTS['2xl'];
    case '2xl':
      return width >= BREAKPOINTS['2xl'];
    default:
      return false;
  }
}

/**
 * Accessibility helpers
 */
export const A11y = {
  /**
   * Skip to main content link
   */
  skipLink: {
    className: 'sr-only focus:not-sr-only',
    href: '#main-content',
  },

  /**
   * Screen reader only text
   */
  srOnly: 'sr-only',

  /**
   * Visually hidden but available to screen readers
   */
  visuallyHidden: 'absolute w-0 h-0 p-0 m-0 overflow-hidden border-0',

  /**
   * Focus visible ring for keyboard navigation
   */
  focusRing: 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',

  /**
   * Reduced motion preference
   */
  reduceMotion: '@media (prefers-reduced-motion: reduce)',
};

/**
 * Interaction patterns
 */
export const Interactions = {
  /**
   * Standard button hover/active states
   */
  buttonHover: 'hover:shadow-md hover:scale-[1.02] transition-all duration-200 active:scale-95',

  /**
   * Card hover effect
   */
  cardHover: 'hover:shadow-lg hover:scale-[1.01] transition-all duration-300',

  /**
   * Link hover effect
   */
  linkHover: 'hover:opacity-80 transition-opacity duration-200',

  /**
   * Smooth fade in
   */
  fadeIn: 'animate-fade-in',

  /**
   * Smooth slide in from bottom
   */
  slideUp: 'animate-slide-up',

  /**
   * Pulse animation for alerts
   */
  pulse: 'animate-pulse',
};

/**
 * Touch target sizing (WCAG AA - 48x48px minimum)
 */
export const TouchTargets = {
  small: 'min-h-[2.75rem] min-w-[2.75rem]', // 44px (old standard)
  medium: 'min-h-[3rem] min-w-[3rem]', // 48px (WCAG AA)
  large: 'min-h-[3.5rem] min-w-[3.5rem]', // 56px
};

/**
 * Confirmation dialog pattern
 */
export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'danger' | 'primary' | 'success';
}

/**
 * Smooth scroll to element
 */
export function smoothScroll(elementId: string, behavior: ScrollBehavior = 'smooth'): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior });
  }
}

/**
 * Format duration for display (e.g., "2 hours ago")
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;

  return 'just now';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T = any>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Debounce function for input/resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll/resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Get scroll progress (0-100)
 */
export function getScrollProgress(): number {
  if (typeof window === 'undefined') return 0;

  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;
  const scrolled = window.scrollY;

  return documentHeight > 0 ? Math.round((scrolled / documentHeight) * 100) : 0;
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Print-friendly styles
 */
export const PrintStyles = {
  /**
   * Hide elements when printing
   */
  noPrint: 'print:hidden',

  /**
   * Show elements only when printing
   */
  printOnly: 'hidden print:block',

  /**
   * Adjust page breaks for printing
   */
  pageBreak: 'print:page-break-inside-avoid',

  /**
   * Increase contrast for printing
   */
  printText: 'print:text-black print:bg-white',
};

/**
 * Color contrast helper
 */
export function getContrastColor(hexColor: string): 'white' | 'black' {
  // Remove # if present
  const color = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white text for dark backgrounds, black text for light backgrounds
  return luminance > 0.5 ? 'black' : 'white';
}
