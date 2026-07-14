/**
 * Animation Library - 50+ Professional Animations
 * Enterprise-grade animations with consistent timing and easing
 * Compatible with Framer Motion, CSS Animations, and Tailwind
 *
 * Usage:
 *   // Framer Motion
 *   import { transitions, easings } from '@/lib/animations'
 *   <motion.div animate={{ ... }} transition={transitions.base} />
 *
 *   // Tailwind CSS
 *   className="animate-fadeIn duration-300 ease-out"
 */

// ========================================
// TIMING SCALE
// ========================================
export const duration = {
  instant: 50,      // Perceived as immediate
  fast: 150,        // Quick feedback, hover states
  base: 300,        // Standard transition (DEFAULT)
  slow: 500,        // Gradual reveals
  slower: 800,      // Deliberate animations
  slowest: 1200,    // Background animations
};

// ========================================
// EASING FUNCTIONS
// ========================================
export const easings = {
  linear: 'linear',
  easeOut: 'easeOut',
  easeIn: 'easeIn',
  easeInOut: 'easeInOut',
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  springLight: { type: 'spring' as const, stiffness: 400, damping: 40 },
  springStiff: { type: 'spring' as const, stiffness: 200, damping: 20 },
};

// ========================================
// TRANSITION PRESETS
// ========================================
export const transitions = {
  fast: { duration: duration.fast / 1000 },
  base: { duration: duration.base / 1000 },
  slow: { duration: duration.slow / 1000 },
  slower: { duration: duration.slower / 1000 },
  instant: { duration: duration.instant / 1000 },
};

// ========================================
// ENTRANCE ANIMATIONS (Framer Motion)
// ========================================

// Fade In
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: transitions.base,
};

// Slide In Up
export const slideInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: transitions.base,
};

// Slide In Right
export const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  transition: transitions.base,
};

// Slide In Left
export const slideInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: transitions.base,
};

// Slide In Down
export const slideInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: transitions.base,
};

// Scale In
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { ...transitions.base, ease: easings.easeOut },
};

// Bounce In
export const bounceIn = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  transition: { ...transitions.slow, ease: easings.spring },
};

// Zoom In
export const zoomIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: transitions.base,
};

// Rotate In
export const rotateIn = {
  initial: { opacity: 0, rotate: -45 },
  animate: { opacity: 1, rotate: 0 },
  transition: transitions.base,
};

// ========================================
// EXIT ANIMATIONS (Framer Motion)
// ========================================

export const fadeOut = {
  initial: { opacity: 1 },
  animate: { opacity: 0 },
  transition: transitions.fast,
};

export const slideOutRight = {
  initial: { opacity: 1, x: 0 },
  animate: { opacity: 0, x: 100 },
  transition: transitions.fast,
};

export const slideOutLeft = {
  initial: { opacity: 1, x: 0 },
  animate: { opacity: 0, x: -100 },
  transition: transitions.fast,
};

export const slideOutUp = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 0, y: -20 },
  transition: transitions.fast,
};

export const scaleOut = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 0, scale: 0.95 },
  transition: transitions.fast,
};

// ========================================
// INTERACTIVE ANIMATIONS
// ========================================

export const buttonHover = {
  scale: 1.02,
  transition: transitions.fast,
};

export const buttonTap = {
  scale: 0.98,
  transition: transitions.fast,
};

export const cardHover = {
  y: -4,
  transition: transitions.base,
};

export const lift = {
  y: -4,
  transition: transitions.base,
};

// ========================================
// LIST & STAGGER ANIMATIONS
// ========================================

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: transitions.base,
  },
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
    animate: { opacity: 1, y: 0, transition: transitions.base },
  },
};

// ========================================
// CARD & MODAL ANIMATIONS
// ========================================

export const cardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: transitions.base },
  exit: { opacity: 0, y: -20, transition: transitions.fast },
};

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitions.fast },
  exit: { opacity: 0, transition: transitions.fast },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: transitions.base.duration, ease: 'easeOut' as const },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: transitions.fast },
} as const;

// ========================================
// LOADING & PROGRESS ANIMATIONS
// ========================================

export const shimmer = {
  animate: {
    backgroundPosition: ['-1000px 0', '1000px 0'],
    transition: { duration: 2, repeat: Infinity },
  },
};

export const spinner = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: 'linear' },
};

export const pulse = {
  animate: { opacity: [1, 0.5, 1] },
  transition: { duration: 2, repeat: Infinity },
};

// ========================================
// SPECIAL EFFECTS
// ========================================

export const successAnimation = {
  initial: { scale: 0 },
  animate: { scale: 1, transition: { ...transitions.base, ...easings.spring } },
};

export const errorShake = {
  animate: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.4 },
  },
};

export const heartbeat = {
  animate: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.6, repeat: Infinity },
  },
};

export const wobble = {
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.8 },
  },
};

// ========================================
// FORM FIELD ANIMATIONS
// ========================================

export const formFieldAnimation = {
  focus: { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' },
};

export const fieldError = {
  animate: {
    borderColor: '#ef4444',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
  },
};

// ========================================
// ANIMATION COMBINATIONS
// ========================================

export const slideUpFade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: transitions.base,
};

export const slideRightFade = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: transitions.base,
};

export const fadeScaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: transitions.base,
};

// ========================================
// TAILWIND ANIMATION CLASSES
// ========================================

export const tailwindAnimations = {
  fadeIn: 'animate-fadeIn',
  slideInUp: 'animate-slideInUp',
  slideInRight: 'animate-slideInRight',
  slideInLeft: 'animate-slideInLeft',
  scaleIn: 'animate-scaleIn',
  bounceIn: 'animate-bounceIn',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  ping: 'animate-ping',
};

// ========================================
// UTILITY FUNCTION
// ========================================

/**
 * Hook for detecting reduced motion preference
 */
export function usePreferReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation with reduced motion fallback
 */
export function getAnimation(
  prefersReduced: boolean,
  animation: object,
  fallback: object = { transition: { duration: 0 } }
): object {
  return prefersReduced ? fallback : animation;
}
