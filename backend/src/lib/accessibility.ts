// Accessibility utilities for ARIA labels, keyboard navigation, and inclusive design

/**
 * Generate unique ID for ARIA-related attributes
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Common ARIA labels for UI elements
 */
export const ariaLabels = {
  close: 'Close',
  delete: 'Delete',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  submit: 'Submit',
  loading: 'Loading',
  menu: 'Menu',
  search: 'Search',
  filter: 'Filter',
  sort: 'Sort',
  expand: 'Expand',
  collapse: 'Collapse',
  previous: 'Previous',
  next: 'Next',
  firstPage: 'First page',
  lastPage: 'Last page',
  settings: 'Settings',
  notifications: 'Notifications',
  profile: 'Profile',
  logout: 'Sign out',
};

/**
 * Keyboard event handler utilities
 */
export const keyboardShortcuts = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  SPACE: ' ',
};

/**
 * Check if key pressed is Escape
 */
export function isEscapeKey(event: KeyboardEvent): boolean {
  return event.key === keyboardShortcuts.ESCAPE;
}

/**
 * Check if key pressed is Enter
 */
export function isEnterKey(event: KeyboardEvent): boolean {
  return event.key === keyboardShortcuts.ENTER;
}

/**
 * Check if key pressed is Space
 */
export function isSpaceKey(event: KeyboardEvent): boolean {
  return event.key === keyboardShortcuts.SPACE;
}

/**
 * Check if arrow key was pressed
 */
export function isArrowKey(event: KeyboardEvent): boolean {
  return [
    keyboardShortcuts.ARROW_UP,
    keyboardShortcuts.ARROW_DOWN,
    keyboardShortcuts.ARROW_LEFT,
    keyboardShortcuts.ARROW_RIGHT,
  ].includes(event.key);
}

/**
 * Trap focus within an element (useful for modals and dialogs)
 */
export function setupFocusTrap(element: HTMLElement, onEscape?: () => void): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isEscapeKey(e)) {
      onEscape?.();
      return;
    }

    if (e.key === keyboardShortcuts.TAB) {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Announce message to screen readers using aria-live
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 3000);
}

/**
 * Skip link for keyboard navigation
 */
export function createSkipLink(): HTMLElement {
  const link = document.createElement('a');
  link.href = '#main-content';
  link.textContent = 'Skip to main content';
  link.className = 'sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-blue-600 focus:text-white';
  return link;
}

/**
 * ARIA roles for different sections
 */
export const ariaRoles = {
  navigation: 'navigation',
  main: 'main',
  region: 'region',
  contentinfo: 'contentinfo',
  banner: 'banner',
  complementary: 'complementary',
};

/**
 * Common ARIA descriptions
 */
export const ariaDescriptions = {
  requiredField: 'This field is required',
  optional: 'This field is optional',
  loading: 'Content is loading',
  error: 'An error occurred',
  success: 'Operation was successful',
  noData: 'No data available',
};
