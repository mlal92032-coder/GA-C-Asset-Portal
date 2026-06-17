'use client';

import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose?: () => void;
}

/**
 * Hook to trap focus within a modal dialog for accessibility
 * - Focuses first focusable element on mount
 * - Traps Tab/Shift+Tab within modal
 * - Returns focus to trigger element on unmount
 * - Handles ESC key to close
 */
export function useFocusTrap({ isOpen, onClose }: UseFocusTrapOptions) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store the element that had focus before modal opened
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus first focusable element in modal
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key closes modal
      if (e.key === 'Escape' && onClose) {
        onClose();
        return;
      }

      // Tab key traps focus
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if on first element, go to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last element, go to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup: return focus to trigger element
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Get all focusable elements within the modal
  const getFocusableElements = (): HTMLElement[] => {
    if (!modalRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const elements = modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
    return Array.from(elements);
  };

  return modalRef;
}
