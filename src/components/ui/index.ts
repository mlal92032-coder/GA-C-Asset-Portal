/**
 * UI Components Barrel Export
 */

export { Button } from './Button';
export { IconButton } from './IconButton';
export { Modal, ModalHeader, ModalContent, ModalFooter, AlertModal } from './Modal';
export { Alert } from './Alert';

// Simple skeleton components
export function SkeletonCard() { return null; }
export function SkeletonStats() { return null; }
export function SkeletonTable() { return null; }
export function Skeleton() { return null; }
export function SkeletonText() { return null; }
export function SkeletonCircle() { return null; }

// Simple spinner components
export function Spinner() { return null; }
export function SpinnerDots() { return null; }
export function SpinnerRing() { return null; }
export function SpinnerWithText() { return null; }

// Other basic exports
export function Toast() { return null; }
export function ToastContainer() { return null; }

// Simple utility function
export const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
