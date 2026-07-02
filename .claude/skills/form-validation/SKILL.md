---
name: form-validation
description: Review, improve, and create form schemas using React Hook Form and Zod validation. Use when building forms or fixing validation issues.
---

# Form Validation

## Instructions

### Step 1: Understand Form Stack
- Project uses: React Hook Form + Zod
- Zod provides schema validation
- React Hook Form manages form state
- Resolvers bridge the two libraries

### Step 2: Create Zod Schema
```typescript
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  // Add fields...
});

type FormData = z.infer<typeof formSchema>;
```

### Step 3: Set Up React Hook Form
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: '', password: '' }
});
```

### Step 4: Build Form Fields
- Use `form.register()` for inputs
- Display `form.formState.errors` for validation messages
- Add real-time validation feedback
- Use `isValidating`, `isSubmitting` states

### Step 5: Handle Form Submission
- Validate data with Zod schema
- Check permissions/roles before submitting
- Handle API errors gracefully
- Show success/error toast notifications
- Reset form on success

### Step 6: Add Custom Validation
- Create custom Zod validators for complex rules
- Example: password strength, email uniqueness
- Use `.refine()` or `.superRefine()` for advanced checks
- Validate dependent fields (password match, etc.)

### Step 7: Test Form Validation
- Test valid submissions
- Test invalid inputs (wrong email, short password)
- Test async validations (email uniqueness)
- Test error message display
- Test accessibility (label/input connection)

### Step 8: Optimize UX
- Add field-level validation feedback
- Use debounce for async validations
- Show loading state during submission
- Disable submit button during submission
- Add confirm dialogs for destructive actions

