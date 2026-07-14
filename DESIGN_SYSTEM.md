# Design System Documentation

**Enterprise Asset Management System - Comprehensive UI Design System**

This document provides complete guidance for using the design system components, tokens, and patterns in the asset management application.

---

## Table of Contents

1. [Overview](#overview)
2. [Design Tokens](#design-tokens)
3. [Component Library](#component-library)
4. [Accessibility](#accessibility)
5. [Dark Mode](#dark-mode)
6. [Best Practices](#best-practices)
7. [Component API Reference](#component-api-reference)

---

## Overview

### Philosophy

Our design system is built on principles of **clarity, consistency, and accessibility**. Every component is:

- **Accessible**: WCAG 2.1 AAA compliant
- **Typed**: Full TypeScript support
- **Animated**: Smooth Framer Motion transitions
- **Responsive**: Mobile-first design
- **Themeable**: Dark mode support

### Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Animations
- **CVA** - Component variants
- **Zod** - Schema validation

### Color Palette

The system uses a professional, vibrant palette with 10 shades per color:

```typescript
// Primary (Blue) - Brand color
primary: #0ea5e9 (500), with shades 50-900

// Secondary (Slate) - Neutral background
secondary: #64748b (500), with shades 50-900

// Semantic Colors
success: #10b981 (Green)
warning: #f59e0b (Amber)
error: #ef4444 (Red)
info: #3b82f6 (Blue)
```

---

## Design Tokens

### Importing Tokens

```typescript
import { designSystem, colors } from '@/components/ui';

// Access tokens
const primaryColor = colors.primary[500];
const spacing = designSystem.spacing.md;
const radius = designSystem.radius.lg;
```

### Available Token Categories

#### Colors
- Primary, Secondary, Success, Warning, Error, Info, Purple, Teal
- Each with 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 shades
- Semantic colors for specific use cases

#### Spacing
- xs (4px) → 5xl (96px)
- Base unit: 8px
- Consistent padding, margin, gaps

#### Border Radius
- none, xs, sm, md, lg, xl, 2xl, 3xl, full

#### Shadows
- xs, sm, md, lg, xl, 2xl
- Inner shadows for depth
- Elevation system

#### Typography
- Font sizes: xs → 6xl
- Font weights: 100 → 900
- Line heights: tight, normal, relaxed, loose

#### Transitions
- Durations: fast (100ms), normal (300ms), slow (500ms)
- Easing functions: linear, easeIn, easeOut, easeInOut

---

## Component Library

### 30+ Production-Ready Components

#### Priority 1: Core Components (9)
Essential UI building blocks used in most interfaces.

**1. Button**
```tsx
<Button variant="primary" size="md">
  Click me
</Button>

// Variants: primary, secondary, danger, success, ghost, outline
// Sizes: xs, sm, md, lg, xl
// Props: isLoading, icon, iconRight, disabled
```

**2. FormInput**
```tsx
<FormInput
  type="email"
  placeholder="Enter email"
  label="Email"
  error="Invalid email"
  icon={<Mail />}
  helperText="We'll never share your email"
/>

// Icon support (left/right)
// Validation states: error, success, warning
// With helper text
```

**3. Card**
```tsx
<Card variant="interactive" padding="lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>

// Variants: default, interactive, flat, elevated, bordered
// Subcomponents for structure
```

**4. Modal**
```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
>
  <ModalContent>
    Are you sure?
  </ModalContent>
  <ModalFooter>
    <Button>Cancel</Button>
    <Button>Confirm</Button>
  </ModalFooter>
</Modal>

// Variants: dialog, alert, confirm, drawer
// Focus management
// Keyboard navigation (Escape closes)
```

**5. Alert**
```tsx
<Alert type="success" title="Success" dismissible>
  Operation completed successfully
</Alert>

// Types: success, warning, error, info
// Dismissible option
// Custom icons
```

**6. Toast**
```tsx
const { success, error } = useToasts();
success('File saved successfully!');

// Auto-dismiss with duration
// Toast stacking
// Multiple types
```

**7. Badge**
```tsx
<Badge variant="success" dot>Active</Badge>

// 8 variants
// Dot indicator
// Filled/outlined styles
```

**8. Avatar**
```tsx
<Avatar name="John Doe" size="lg" />
<Avatar src="avatar.jpg" status="online" />

// Fallback to initials
// Status indicator
// AvatarGroup component
```

**9. Progress**
```tsx
<Progress value={65} variant="primary" showValue />
<CircularProgress value={75} size={100} />

// Determinate and indeterminate states
// Linear and circular variants
// Color options
```

#### Priority 2: Form & Layout Components (9)

**Checkbox & CheckboxGroup**
```tsx
<Checkbox label="Accept terms" checked={accepted} />
<CheckboxGroup
  label="Select options"
  options={[...]}
  value={selected}
  onChange={setSelected}
/>
```

**Radio & RadioGroup**
```tsx
<RadioGroup
  name="choice"
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' }
  ]}
  value={selected}
  onChange={setSelected}
/>
```

**Select**
```tsx
<Select
  options={[...]}
  value={selected}
  onChange={setSelected}
  isMulti
  isSearchable
  isClearable
/>
```

**Tabs**
```tsx
<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="a">Tab A</TabsTrigger>
    <TabsTrigger value="b">Tab B</TabsTrigger>
  </TabsList>
  <TabsContent value="a">Content A</TabsContent>
  <TabsContent value="b">Content B</TabsContent>
</Tabs>
```

**Dropdown**
```tsx
<Dropdown trigger={<Button>Menu</Button>}>
  <DropdownItem>Edit</DropdownItem>
  <DropdownDivider />
  <DropdownItem variant="danger">Delete</DropdownItem>
</Dropdown>
```

#### Priority 3: Advanced Components (5+)

**DataTable**
```tsx
<DataTable
  columns={[
    { id: 'name', header: 'Name', accessor: 'name', sortable: true },
    { id: 'email', header: 'Email', accessor: 'email' }
  ]}
  data={users}
  sort={sort}
  onSort={handleSort}
  pagination={pagination}
  onPaginate={handlePaginate}
  selectedRows={selected}
  onSelectRows={setSelected}
/>
```

**Skeleton Loaders**
```tsx
<Skeleton />
<SkeletonText lines={3} />
<SkeletonCard withImage lines={2} />
```

**Spinners**
```tsx
<Spinner size="lg" color="primary" />
<SpinnerDots size="md" />
<SpinnerRing size="lg" />
<SpinnerWithText label="Loading..." />
```

---

## Accessibility

### WCAG 2.1 AAA Compliance

All components meet or exceed WCAG 2.1 AAA standards:

**Color Contrast**
- Text: 7:1 minimum (AAA standard)
- Graphics: 3:1 minimum
- Verified against design tokens

**Keyboard Navigation**
- All interactive elements are keyboard accessible
- Tab order is logical and predictable
- Focus indicators are visible (2px ring, 2px offset)
- Escape closes modals and dropdowns

**Screen Reader Support**
- Semantic HTML (`<button>`, `<input>`, `<label>`)
- ARIA labels and descriptions
- `aria-label` for icon-only buttons
- `aria-invalid` for form errors
- `aria-expanded` for collapsible content
- `role` attributes where needed

**Reduced Motion**
- Animations respect `prefers-reduced-motion`
- Alternative animations provided
- No flashing or epilepsy-inducing effects

### Common Accessibility Patterns

```tsx
// Form with proper labels
<label htmlFor="email">Email</label>
<FormInput id="email" type="email" />

// Icon button with label
<Button
  variant="ghost"
  size="icon"
  aria-label="Close dialog"
>
  <X className="w-5 h-5" />
</Button>

// Disabled state with tooltip
<Button disabled aria-disabled="true">
  Disabled action
</Button>

// Error message linked to input
<FormInput
  id="name"
  aria-describedby="name-error"
  error={error}
/>
<div id="name-error" role="alert">
  {error}
</div>
```

---

## Dark Mode

### Implementation Status

Dark mode support is built into the design system with:

- System preference detection (`prefers-color-scheme`)
- Manual toggle capability
- Smooth CSS transitions (300ms)
- Per-user preference storage
- No flash on page load

### Dark Mode Colors

```typescript
// Light mode (default)
background: #ffffff
foreground: #0f172a
primary: #0ea5e9

// Dark mode
background: #0f172a
foreground: #f8fafc
primary: #0ea5e9 (same, adjusted opacity)
```

### Using Dark Mode

```tsx
// In components
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  Content
</div>

// Tailwind dark mode prefix
className="dark:bg-slate-900 dark:text-white"
```

---

## Best Practices

### 1. Component Composition

```tsx
// Good: Compose components
<Card variant="interactive">
  <CardHeader>
    <CardTitle>Asset Details</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Avoid: Nesting incompatible components
<Button>
  <Modal>
    {/* Modals should be at page level */}
  </Modal>
</Button>
```

### 2. Spacing & Alignment

```tsx
// Good: Use consistent spacing from design tokens
<div className="space-y-4">
  <FormInput />
  <FormInput />
  <Button>Submit</Button>
</div>

// Avoid: Magic numbers
<div style={{ marginBottom: '15px' }}>
  {/* 15px is not in design system */}
</div>
```

### 3. Typography

```tsx
// Good: Use semantic HTML + Tailwind classes
<h1 className="text-3xl font-bold">Page Title</h1>
<p className="text-base text-slate-600">Body text</p>

// Avoid: Styling text without semantic meaning
<div className="text-2xl font-bold">
  {/* Should be <h1> */}
</div>
```

### 4. Color Usage

```tsx
// Good: Use semantic color variants
<Alert type="error">Error message</Alert>
<Badge variant="success">Active</Badge>

// Avoid: Random colors
<div style={{ color: '#ff6b6b' }}>
  {/* Use design system colors */}
</div>
```

### 5. Form Validation

```tsx
// Good: Provide clear error feedback
<FormInput
  label="Email"
  type="email"
  error={emailError}
  helperText="We'll never share your email"
  icon={<Mail />}
/>

// Avoid: Silent validation
<input type="email" />
```

### 6. Loading States

```tsx
// Good: Use appropriate loading indicators
<Spinner /> {/* For inline loading */}
<SkeletonCard /> {/* For content preview */}
<Button isLoading>Saving...</Button> {/* For actions */}

// Avoid: No feedback
<Button>Save</Button>
```

### 7. Animation Usage

```tsx
// Good: Use animations for clarity
<Card animate variant="interactive" />
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Avoid: Excessive animations
// Keep animations under 500ms
// Avoid animation on every interaction
```

---

## Component API Reference

### Common Props

Most components support these standard props:

```typescript
// Styling
className?: string          // Custom Tailwind classes
style?: CSSProperties      // Inline styles

// Behavior
disabled?: boolean         // Disable interaction
onClick?: () => void      // Click handler

// Accessibility
aria-label?: string       // Screen reader label
aria-describedby?: string // Linked description
role?: string            // Semantic role

// Refs
ref?: React.Ref<HTMLElement> // DOM access
```

### Variant Props

Components using CVA (class-variance-authority) accept variant props:

```typescript
variant?: 'primary' | 'secondary' | 'danger' | ...
size?: 'sm' | 'md' | 'lg' | 'xl'
color?: 'primary' | 'success' | 'warning' | 'error'
```

### Common Event Handlers

```typescript
onChange?: (value: T) => void    // Value changed
onClick?: (e: MouseEvent) => void // Element clicked
onSubmit?: (e: FormEvent) => void // Form submitted
onFocus?: (e: FocusEvent) => void // Element focused
onBlur?: (e: FocusEvent) => void  // Element blurred
```

---

## Advanced Usage

### Custom Styling

```tsx
// Extend with custom classes
<Button className="custom-shadow">
  Custom styled button
</Button>

// Use tailwind-merge to avoid conflicts
import { cn } from '@/components/ui';

const customClass = "px-8"; // Overrides default padding
<Button className={cn("px-4", customClass)}>
  Button
</Button>
```

### Creating New Components

```tsx
import { cva } from 'class-variance-authority';
import { cn } from '@/components/ui';

const customVariants = cva('base-styles', {
  variants: {
    variant: {
      primary: 'primary-styles',
      secondary: 'secondary-styles',
    },
  },
});

export function CustomComponent({ variant, ...props }) {
  return (
    <div className={cn(customVariants({ variant }))} {...props}>
      Content
    </div>
  );
}
```

### Using with React Hook Form

```tsx
import { FormInput } from '@/components/ui';
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <FormInput
      {...register('email')}
      type="email"
      label="Email"
      error={errors.email?.message}
    />
  );
}
```

### Using with Zod Validation

```tsx
import { z } from 'zod';
import { FormInput } from '@/components/ui';

const schema = z.object({
  email: z.string().email('Invalid email'),
});

function validateEmail(email: string) {
  try {
    schema.parse({ email });
    return null;
  } catch (error) {
    return error.errors[0].message;
  }
}

export function Form() {
  const [email, setEmail] = useState('');
  const error = validateEmail(email);

  return (
    <FormInput
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={error}
    />
  );
}
```

---

## Performance Optimization

### Code Splitting

Components are modular and can be imported individually:

```tsx
// Good: Only import what you need
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';

// Avoid: Importing the entire library
import * as UI from '@/components/ui';
```

### Memoization

```tsx
import React from 'react';

// Memoize expensive components
export const OptimizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
}, (prev, next) => prev.data === next.data);
```

### Animation Performance

- Use Framer Motion's built-in optimizations
- Keep animations under 500ms
- Use `will-change` CSS for smooth animations
- Profile with browser DevTools

---

## Support & Resources

### Contributing

To add or modify components:

1. Follow existing component structure
2. Ensure TypeScript types are complete
3. Add WCAG 2.1 AAA support
4. Include Framer Motion animations
5. Write comprehensive prop documentation
6. Test keyboard navigation
7. Test with screen readers

### Quick Reference

- **Design Tokens**: `src/lib/design-tokens.ts`
- **Animations**: `src/lib/animations.ts`
- **Components**: `src/components/ui/`
- **Utils**: `src/lib/utils.ts`

### External Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [Framer Motion Docs](https://www.framer.com/motion)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

---

**Last Updated**: July 2026
**Component Count**: 30+
**Accessibility Level**: WCAG 2.1 AAA
**TypeScript**: Strict Mode
