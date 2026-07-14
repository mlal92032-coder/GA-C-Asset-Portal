# COMPONENT LIBRARY GUIDE
## Professional Component Standards & Best Practices

**Version:** 1.0  
**Created:** July 13, 2026  
**Status:** Production Ready  

---

## TABLE OF CONTENTS

1. [Component Architecture](#component-architecture)
2. [Button Component](#button-component)
3. [Form Components](#form-components)
4. [Card Components](#card-components)
5. [Layout Components](#layout-components)
6. [Data Display Components](#data-display-components)
7. [Modal & Overlay Components](#modal--overlay-components)
8. [Navigation Components](#navigation-components)
9. [Feedback Components](#feedback-components)
10. [Advanced Components](#advanced-components)

---

## COMPONENT ARCHITECTURE

### Component Structure

```
Component/
├── Component.tsx          # Main component file
├── Component.test.tsx     # Unit tests
├── Component.stories.tsx  # Storybook stories
├── types.ts              # TypeScript interfaces
└── index.ts              # Barrel export
```

### TypeScript Interface Pattern

```typescript
import { ReactNode, HTMLAttributes } from 'react';

export interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the component */
  variant?: 'primary' | 'secondary' | 'tertiary';
  
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Additional CSS class */
  className?: string;
  
  /** Children content */
  children: ReactNode;
  
  /** Callback function */
  onClick?: () => void;
  
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

export const Component: React.FC<ComponentProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn(
        'base-styles',
        variant === 'primary' && 'primary-styles',
        size === 'md' && 'md-size',
        className
      )}
      {...props}
    >
      {props.children}
    </div>
  );
};
```

### Naming Conventions

- **Components:** PascalCase (Button, FormInput, StatCard)
- **Props:** camelCase (isLoading, onClick, variant)
- **Types/Interfaces:** PascalCase ending with Props (ButtonProps, FormInputProps)
- **CSS Classes:** kebab-case (primary-button, form-input-wrapper)
- **Files:** PascalCase.tsx (Button.tsx, FormInput.tsx)

---

## BUTTON COMPONENT

### Component Interface

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isDisabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  'aria-label'?: string;
}
```

### Usage Examples

```tsx
// Primary button
<Button variant="primary">Save</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// With icon
<Button icon={<CheckIcon />}>Confirm</Button>

// Loading state
<Button isLoading>Saving...</Button>

// Disabled state
<Button disabled>Unavailable</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Full width (mobile)
<Button fullWidth>Full Width</Button>

// Danger action
<Button variant="danger">Delete</Button>
```

### Styling

```css
/* Base button styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: 0.75rem;
  transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/* Size variants */
.btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; height: 2rem; }
.btn-md { padding: 0.75rem 1.5rem; font-size: 1rem; height: 2.5rem; } /* DEFAULT */
.btn-lg { padding: 1rem 2rem; font-size: 1rem; height: 3rem; }
.btn-xl { padding: 1.25rem 2rem; font-size: 1rem; height: 3.5rem; }

/* Primary variant */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

/* Secondary variant */
.btn-secondary {
  background: #f8fafc;
  color: #334155;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}
.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

/* Disabled state */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #e2e8f0 !important;
  color: #94a3b8;
}

/* Loading state */
.btn.loading {
  pointer-events: none;
}
.btn.loading::after {
  content: '';
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

---

## FORM COMPONENTS

### FormInput Component

```typescript
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outline';
}
```

```tsx
// Basic usage
<FormInput
  label="Email"
  type="email"
  placeholder="you@example.com"
  required
/>

// With error
<FormInput
  label="Email"
  type="email"
  error="Invalid email format"
  helperText="Please enter a valid email"
/>

// With icon
<FormInput
  label="Search"
  icon={<SearchIcon />}
  placeholder="Type to search..."
/>

// Disabled
<FormInput
  label="Archived"
  value="Item"
  disabled
/>
```

### FormSelect Component

```typescript
interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
}
```

```tsx
<FormSelect
  label="Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ]}
  required
/>
```

### FormTextarea Component

```typescript
interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
  maxLength?: number;
  showCounter?: boolean;
}
```

```tsx
<FormTextarea
  label="Description"
  placeholder="Enter description"
  rows={4}
  maxLength={500}
  showCounter
/>
```

### FormCheckbox & FormRadio

```tsx
// Checkbox
<FormCheckbox
  name="agree"
  label="I agree to terms"
  required
/>

// Radio group
<fieldset>
  <legend>Choose an option</legend>
  <FormRadio name="option" value="a" label="Option A" />
  <FormRadio name="option" value="b" label="Option B" />
  <FormRadio name="option" value="c" label="Option C" />
</fieldset>
```

### FormDateInput Component

```typescript
interface FormDateInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  min?: string;
  max?: string;
}
```

```tsx
<FormDateInput
  label="Delivery Date"
  min="2024-01-01"
  max="2024-12-31"
  required
/>
```

### FormSection Component

```tsx
<FormSection title="Personal Information" description="Your personal details">
  <FormInput label="First Name" />
  <FormInput label="Last Name" />
  <FormInput label="Email" type="email" />
</FormSection>
```

---

## CARD COMPONENTS

### Standard Card

```typescript
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
  children: ReactNode;
}
```

```tsx
// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Interactive card
<Card interactive onClick={handleClick}>
  <h3>Clickable Card</h3>
</Card>

// Elevated card
<Card variant="elevated">
  Premium content
</Card>
```

### Stat Card

```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  change?: { value: number; isPositive: boolean };
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'green' | 'amber' | 'red';
}
```

```tsx
<StatCard
  label="Total Assets"
  value={1234}
  icon={<PackageIcon />}
  change={{ value: 12.5, isPositive: true }}
  color="blue"
/>

<StatCard
  label="Available Assets"
  value={856}
  icon={<CheckIcon />}
  change={{ value: 3.2, isPositive: true }}
  color="green"
/>

<StatCard
  label="Maintenance Due"
  value={45}
  icon={<AlertIcon />}
  change={{ value: 5.1, isPositive: false }}
  color="amber"
/>

<StatCard
  label="Damaged Assets"
  value={12}
  icon={<AlertIcon />}
  change={{ value: 2.3, isPositive: false }}
  color="red"
/>
```

### Grid Card

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
  <Card>Item 4</Card>
</div>
```

---

## LAYOUT COMPONENTS

### Container

```typescript
interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
}
```

```tsx
<Container maxWidth="lg" padding="lg">
  {/* Page content */}
</Container>
```

### PageHeader

```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}
```

```tsx
<PageHeader
  title="Asset Management"
  description="Manage all company assets"
  icon={<Package />}
  action={<Button>+ New Asset</Button>}
/>
```

### Sidebar Layout

```tsx
<div className="flex h-screen">
  <Sidebar className="w-64">
    {/* Navigation items */}
  </Sidebar>
  <div className="flex-1 flex flex-col">
    <TopNav />
    <main className="flex-1 overflow-auto">
      {/* Page content */}
    </main>
    <Footer />
  </div>
</div>
```

---

## DATA DISPLAY COMPONENTS

### Table Component

```typescript
interface TableProps {
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
  }>;
  data: Array<Record<string, any>>;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: Record<string, any>) => void;
  loading?: boolean;
  empty?: ReactNode;
}
```

```tsx
<Table
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
  ]}
  data={assets}
  onSort={handleSort}
  onRowClick={handleRowClick}
/>
```

### List Component

```tsx
<List>
  <ListItem>
    <ListItemIcon><CheckIcon /></ListItemIcon>
    <ListItemText primary="Item name" secondary="Item details" />
    <ListItemAction>
      <Button size="sm">Action</Button>
    </ListItemAction>
  </ListItem>
</List>
```

### Empty State Component

```typescript
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}
```

```tsx
<EmptyState
  icon={<PackageIcon />}
  title="No assets found"
  description="Create your first asset to get started"
  action={<Button>+ New Asset</Button>}
/>
```

### Skeleton Loader

```tsx
<div className="space-y-4">
  <Skeleton height="20px" width="60%" />
  <Skeleton height="16px" width="100%" />
  <Skeleton height="16px" width="80%" />
  <Skeleton height="40px" width="100%" />
</div>
```

---

## MODAL & OVERLAY COMPONENTS

### Modal Component

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeButton?: boolean;
  backdrop?: 'static' | 'clickable';
  children: ReactNode;
}
```

```tsx
const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
  
  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Modal Title"
    size="md"
  >
    <div className="p-4">
      <p>Modal content</p>
    </div>
    <div className="flex gap-3 justify-end p-4 border-t">
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary">Save</Button>
    </div>
  </Modal>
</>
```

### Dialog Component (Confirmation)

```typescript
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'info' | 'warning' | 'danger';
}
```

```tsx
<Dialog
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Asset"
  message="Are you sure you want to delete this asset? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
/>
```

### Drawer Component (Side Panel)

```typescript
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}
```

```tsx
<Drawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Filter Assets"
  position="right"
>
  {/* Filter form */}
</Drawer>
```

---

## NAVIGATION COMPONENTS

### Sidebar Component

```typescript
interface SidebarProps {
  items: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    children?: SidebarProps['items'];
  }>;
  onItemClick?: (id: string) => void;
  activeId?: string;
  collapsible?: boolean;
}
```

### Breadcrumb Component

```tsx
<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/assets">Assets</BreadcrumbItem>
  <BreadcrumbItem active>Asset Details</BreadcrumbItem>
</Breadcrumb>
```

### Tabs Component

```typescript
interface TabsProps {
  tabs: Array<{ id: string; label: string; content: ReactNode }>;
  activeId?: string;
  onTabChange?: (id: string) => void;
}
```

```tsx
<Tabs
  tabs={[
    { id: 'details', label: 'Details', content: <AssetDetails /> },
    { id: 'history', label: 'History', content: <AssetHistory /> },
    { id: 'maintenance', label: 'Maintenance', content: <MaintenanceLog /> },
  ]}
  onTabChange={handleTabChange}
/>
```

---

## FEEDBACK COMPONENTS

### Alert Component

```typescript
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  icon?: ReactNode;
  onClose?: () => void;
  action?: ReactNode;
}
```

```tsx
<Alert
  variant="success"
  title="Asset Created"
  message="The new asset has been successfully created."
/>

<Alert
  variant="error"
  title="Error"
  message="Failed to save changes. Please try again."
  action={<Button size="sm">Retry</Button>}
  onClose={handleClose}
/>
```

### Toast/Notification Component

```typescript
interface ToastProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
}
```

```tsx
// Using a Toast service
toast.success('Asset saved successfully');
toast.error('Failed to delete asset', { duration: 6000 });
toast.warning('This action cannot be undone');
```

### Badge Component

```typescript
interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
}
```

```tsx
<Badge variant="success">Available</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Out of Service</Badge>
<Badge variant="info" icon={<AlertIcon />}>Alert</Badge>
```

### Spinner Component

```tsx
<Spinner size="md" variant="primary" />
```

---

## ADVANCED COMPONENTS

### FileUpload Component

```typescript
interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  onUpload?: (files: File[]) => void;
  onError?: (error: string) => void;
}
```

```tsx
<FileUpload
  accept="image/*,.pdf"
  multiple
  maxSize={5 * 1024 * 1024} // 5MB
  onUpload={handleUpload}
  onError={handleError}
/>
```

### DateRangePicker Component

```typescript
interface DateRangePickerProps {
  value?: { start?: Date; end?: Date };
  onChange?: (range: { start?: Date; end?: Date }) => void;
  minDate?: Date;
  maxDate?: Date;
  presets?: Array<{ label: string; value: { start: Date; end: Date } }>;
}
```

### SearchBar Component

```tsx
<SearchBar
  placeholder="Search assets..."
  onSearch={handleSearch}
  suggestions={suggestions}
  filters={[
    { label: 'Status', options: ['Active', 'Inactive'] },
    { label: 'Category', options: ['Electronics', 'Furniture'] },
  ]}
/>
```

### Chart Components

```tsx
// Bar Chart
<BarChart
  data={chartData}
  xAxis="month"
  yAxis="value"
  title="Asset Acquisition Trend"
/>

// Pie Chart
<PieChart
  data={statusDistribution}
  title="Asset Status Distribution"
/>

// Line Chart
<LineChart
  data={timelineData}
  xAxis="date"
  yAxis="value"
  title="Monthly Checkouts"
/>
```

### Map Component

```tsx
<AssetMap
  markers={assets.map(a => ({
    id: a.id,
    lat: a.latitude,
    lng: a.longitude,
    label: a.name,
  }))}
  onMarkerClick={handleMarkerClick}
  zoom={12}
/>
```

---

## COMPOSITION PATTERNS

### Form Pattern

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  <FormSection title="Basic Information">
    <FormInput
      label="Asset Name"
      name="name"
      required
      value={formData.name}
      onChange={handleChange}
      error={errors.name}
    />
  </FormSection>

  <FormSection title="Details">
    <FormSelect
      label="Category"
      name="category"
      options={categories}
      value={formData.category}
      onChange={handleChange}
    />
  </FormSection>

  <div className="flex gap-3 justify-end">
    <Button variant="secondary" type="reset">
      Cancel
    </Button>
    <Button variant="primary" type="submit" isLoading={isSubmitting}>
      Save Asset
    </Button>
  </div>
</form>
```

### List Pattern

```tsx
<div className="space-y-4">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-bold">Assets</h2>
    <Button>+ New Asset</Button>
  </div>

  {loading ? (
    <Skeleton />
  ) : assets.length > 0 ? (
    <Table columns={columns} data={assets} />
  ) : (
    <EmptyState title="No assets found" />
  )}
</div>
```

### Filter & Search Pattern

```tsx
<div className="space-y-4">
  <SearchBar
    placeholder="Search..."
    onSearch={setSearchTerm}
  />

  <FilterBar>
    <FilterSelect
      label="Status"
      value={status}
      onChange={setStatus}
      options={statusOptions}
    />
    <FilterDateRange
      label="Date Range"
      value={dateRange}
      onChange={setDateRange}
    />
    <Button variant="secondary" onClick={resetFilters}>
      Reset
    </Button>
  </FilterBar>

  <Table data={filteredData} />
</div>
```

---

## TESTING COMPONENTS

### Unit Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Saving...</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('disabled');
  });

  it('has correct size classes', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-lg');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
```

### Accessibility Test Template

```typescript
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

describe('Button - Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is keyboard accessible', () => {
    render(
      <>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </>
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveFocus();
    userEvent.tab();
    expect(buttons[1]).toHaveFocus();
  });

  it('has proper ARIA labels', () => {
    render(<Button aria-label="Close modal">✕</Button>);
    expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
  });
});
```

---

## COMPONENT CHECKLIST

Before shipping a component:

- [ ] **Functionality**
  - [ ] All props work as documented
  - [ ] All callbacks fire correctly
  - [ ] Default props are sensible

- [ ] **Styling**
  - [ ] Matches design system
  - [ ] All variants are applied correctly
  - [ ] All sizes work as expected
  - [ ] Responsive behavior works
  - [ ] Dark mode works (if applicable)

- [ ] **Interactions**
  - [ ] Hover states visible
  - [ ] Focus states visible and correct
  - [ ] Active states correct
  - [ ] Disabled states clear

- [ ] **Accessibility**
  - [ ] Keyboard navigation works
  - [ ] Focus trap (modals)
  - [ ] ARIA labels present
  - [ ] Color contrast adequate
  - [ ] No axe violations

- [ ] **Documentation**
  - [ ] Props documented
  - [ ] Usage examples in stories
  - [ ] Variants documented
  - [ ] Accessibility notes

- [ ] **Testing**
  - [ ] Unit tests pass
  - [ ] Accessibility tests pass
  - [ ] Visual regression tests pass

---

**Last Updated:** July 13, 2026  
**Next Review:** August 13, 2026  
**Maintained By:** Component Team  
