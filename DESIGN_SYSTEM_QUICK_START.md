# Design System Quick Start Guide

Get up and running with the design system in 5 minutes.

## Installation

The design system is already integrated. Just import and use!

```bash
# All components are in src/components/ui/
# All design tokens are in src/lib/design-tokens.ts
```

## Basic Usage

### Import Components

```tsx
import {
  Button,
  FormInput,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  Toast,
} from '@/components/ui';
```

### Build a Simple Form

```tsx
import { useState } from 'react';
import { Button, FormInput, Card, CardContent, CardHeader, CardTitle, Alert } from '@/components/ui';

export function AssetForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Your API call here
      console.log('Submitted:', name);
    } catch (err) {
      setError('Failed to save asset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Create Asset</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Asset Name"
            placeholder="e.g., Laptop"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Asset
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Display a Data Table

```tsx
import { DataTable } from '@/components/ui';
import { useState } from 'react';

const columns = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'status', header: 'Status', accessor: 'status' },
  { id: 'date', header: 'Created', accessor: 'created_at' },
];

export function AssetList() {
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' as const });

  return (
    <DataTable
      columns={columns}
      data={assets}
      sort={sort}
      onSort={setSort}
    />
  );
}
```

### Use Modals

```tsx
import { Modal, ModalContent, ModalFooter, Button, useToasts } from '@/components/ui';
import { useState } from 'react';

export function DeleteAssetModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { success } = useToasts();

  const handleDelete = async () => {
    try {
      // Delete logic
      success('Asset deleted successfully');
      setIsOpen(false);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="danger">
        Delete
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Delete Asset">
        <ModalContent>
          Are you sure? This action cannot be undone.
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

### Handle Forms with Validation

```tsx
import { FormInput, Button, Alert } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const assetSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

type AssetFormData = z.infer<typeof assetSchema>;

export function ValidatedAssetForm() {
  const { register, formState: { errors }, handleSubmit } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  });

  const onSubmit = (data: AssetFormData) => {
    console.log('Valid data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Asset Name"
        {...register('name')}
        error={errors.name?.message}
      />

      <FormInput
        label="Contact Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />

      <FormInput
        label="Quantity"
        type="number"
        {...register('quantity', { valueAsNumber: true })}
        error={errors.quantity?.message}
      />

      <Button type="submit" fullWidth>
        Create Asset
      </Button>
    </form>
  );
}
```

## Component Cheat Sheet

### Buttons
```tsx
<Button>Primary Button</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button size="lg">Large</Button>
<Button isLoading>Loading...</Button>
<Button icon={<Icon />}>With Icon</Button>
```

### Forms
```tsx
<FormInput label="Text" placeholder="Enter text" />
<FormInput type="email" label="Email" />
<FormInput type="password" label="Password" />
<FormInput error="This field is required" />
<FormInput icon={<Icon />} />

<Checkbox label="Accept terms" />
<Radio label="Option A" name="choice" />

<Select options={[...]} value={value} onChange={setValue} />
<Select isMulti options={[...]} />
```

### Feedback
```tsx
<Alert type="success">Success message</Alert>
<Alert type="error">Error message</Alert>
<Alert type="warning">Warning message</Alert>

<Toast type="success" message="Saved!" />
<Badge>Active</Badge>
<Progress value={65} />
```

### Layout
```tsx
<Card>
  <CardHeader>Header</CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>

<Modal isOpen={open} onClose={close}>
  <ModalContent>Content</ModalContent>
</Modal>

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="a">Tab A</TabsTrigger>
  </TabsList>
  <TabsContent value="a">Content</TabsContent>
</Tabs>

<Dropdown trigger={<Button>Menu</Button>}>
  <DropdownItem>Option 1</DropdownItem>
  <DropdownItem variant="danger">Delete</DropdownItem>
</Dropdown>
```

### Loading
```tsx
<Skeleton />
<SkeletonText lines={3} />
<SkeletonCard />
<SkeletonTable />

<Spinner />
<SpinnerDots />
<SpinnerRing />
<SpinnerWithText label="Loading..." />
```

## Design Tokens

### Using Colors
```tsx
import { colors } from '@/components/ui';

const bgColor = colors.primary[500];     // #0ea5e9
const lightBg = colors.primary[100];     // #e0f2fe
const darkBg = colors.primary[900];      // #0c2d6b
```

### Using Spacing
```tsx
import { designSystem } from '@/components/ui';

const padding = designSystem.spacing.md;  // 1rem
const margin = designSystem.spacing.lg;   // 1.5rem

// Or use Tailwind directly
<div className="p-4 m-2">Content</div>
```

### Using Typography
```tsx
<h1 className="text-4xl font-bold">Heading</h1>
<p className="text-base text-slate-600">Body text</p>
<small className="text-sm text-slate-500">Small text</small>
```

## Common Patterns

### Loading State
```tsx
export function AssetList() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <SkeletonCard />;
  }

  return <DataTable columns={columns} data={assets} />;
}
```

### Error Handling
```tsx
export function SafeComponent() {
  const [error, setError] = useState('');

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  return <div>Content</div>;
}
```

### Form with Toast Feedback
```tsx
export function AssetForm() {
  const { success, error } = useToasts();

  const handleSubmit = async () => {
    try {
      await saveAsset();
      success('Asset saved successfully!');
    } catch (err) {
      error('Failed to save asset');
    }
  };

  return <Button onClick={handleSubmit}>Save</Button>;
}
```

### Modal Confirmation
```tsx
export function ConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Delete</Button>

      <AlertModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type="error"
        title="Delete Asset"
        actionLabel="Delete"
        onAction={handleDelete}
      >
        This action cannot be undone.
      </AlertModal>
    </>
  );
}
```

## Advanced Tips

### Customize Component Styling
```tsx
import { cn } from '@/components/ui';

<Button className={cn("custom-class", someCondition && "extra-class")}>
  Custom Button
</Button>
```

### Compose Components
```tsx
const FormSection = ({ title, children }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

<FormSection title="Asset Details">
  <FormInput label="Name" />
</FormSection>
```

### Create Reusable Form Fields
```tsx
interface FieldProps {
  label: string;
  error?: string;
  helperText?: string;
}

const EmailField = (props: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) => (
  <FormInput type="email" {...props} />
);

// Usage
<EmailField label="Email" error={error} />
```

## Performance Tips

1. **Import only what you need**
   ```tsx
   import { Button } from '@/components/ui/Button';  // Good
   import { Button } from '@/components/ui';         // Also okay
   ```

2. **Memoize expensive components**
   ```tsx
   export const OptimizedList = React.memo(DataTable);
   ```

3. **Use `cn()` for dynamic classes**
   ```tsx
   import { cn } from '@/components/ui';
   className={cn(baseClass, isActive && "active-class")}
   ```

4. **Keep animations fast**
   - Use 100-300ms for interactive animations
   - Use 300-500ms for transitions
   - Avoid animations on every render

## Troubleshooting

### Button not responding to clicks
- Check if `disabled` prop is set
- Verify `onClick` handler is defined
- Check z-index if covered by another element

### FormInput not showing error
- Ensure `error` prop is passed
- Check if validation is running
- Verify error message is not empty

### Modal not visible
- Check `isOpen` prop is true
- Verify z-index (should be 50+)
- Check if parent has `overflow: hidden`

### Styling not applying
- Use `cn()` to merge classes properly
- Check Tailwind is configured
- Verify class syntax is correct

## Next Steps

1. Read the [full Design System documentation](./DESIGN_SYSTEM.md)
2. Explore component examples in your IDE
3. Check TypeScript types for complete prop options
4. Test accessibility with keyboard navigation
5. Use in your pages and features

---

**Need Help?** Check the component TypeScript definitions or the design system documentation.
