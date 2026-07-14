/**
 * UI Components Barrel Export
 * ============================================================================
 * Central export point for all UI components in the design system.
 * Provides a clean, organized API for importing components.
 */

// ============================================================================
// CORE COMPONENTS (Priority 1)
// ============================================================================

// Button Component
export { Button } from './Button';
export type { ButtonProps } from './Button';

// Form Input Component
export { FormInput } from './FormInput';
export type { FormInputProps } from './FormInput';

// Card Component & Subcomponents
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';
export type { CardProps } from './Card';

// Modal Component & Subcomponents
export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  AlertModal,
} from './Modal';
export type { ModalProps, AlertModalProps } from './Modal';

// Alert Component
export { Alert } from './Alert';
export type { AlertProps } from './Alert';

// Toast Component & Hook
export { Toast, ToastContainer, useToasts } from './Toast';
export type { ToastProps } from './Toast';

// ============================================================================
// SECONDARY COMPONENTS (Priority 2)
// ============================================================================

// Badge Component
export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

// Avatar Component & Group
export { Avatar, AvatarGroup } from './Avatar';
export type { AvatarProps, AvatarGroupProps } from './Avatar';

// Progress Components
export { Progress, CircularProgress } from './Progress';
export type { ProgressProps, CircularProgressProps } from './Progress';

// Checkbox Component & Group
export { Checkbox, CheckboxGroup } from './Checkbox';
export type { CheckboxProps, CheckboxGroupProps } from './Checkbox';

// Radio Component & Group
export { Radio, RadioGroup } from './Radio';
export type { RadioProps, RadioGroupProps } from './Radio';

// Select Component
export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

// Tabs Components
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from './Tabs';

// Dropdown Components
export {
  Dropdown,
  DropdownItem,
  DropdownDivider,
  DropdownLabel,
  DropdownCheckboxItem,
} from './Dropdown';
export type {
  DropdownProps,
  DropdownItemProps,
  DropdownCheckboxItemProps,
} from './Dropdown';

// ============================================================================
// ADVANCED COMPONENTS (Priority 3)
// ============================================================================

// DataTable Component
export { DataTable } from './DataTable';
export type { DataTableProps, Column, SortConfig, PaginationConfig } from './DataTable';

// Loading Components
export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonTable,
} from './Skeleton';

export {
  Spinner,
  SpinnerDots,
  SpinnerRing,
  SpinnerWithText,
} from './Spinner';

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { cn } from '@/lib/utils';
export { designSystem, colors as designColors } from '@/lib/design-tokens';
export * from '@/lib/animations';
