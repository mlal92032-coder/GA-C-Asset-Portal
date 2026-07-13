# PHASE 2 EXECUTION PLAN
**Detailed task breakdown, acceptance criteria, and agent assignments**

**Status**: Ready for execution  
**Duration**: 4 weeks (30 calendar days)  
**Start Date**: 2026-07-14  
**End Date**: 2026-08-13  

---

## PHASE 2A: INTEGRATION & QUICK WINS
**Duration**: 10 days (2026-07-14 to 2026-07-24)  
**Goal**: Connect components, fix UX gaps, establish patterns

---

## TASK 2A.1: TOAST SYSTEM INTEGRATION
**Assigned To**: FRONTEND AGENT  
**Duration**: 3 days  
**Start**: 2026-07-14  
**End**: 2026-07-17  
**Complexity**: LOW  
**Blocker Level**: HIGH

### Deliverables
1. ✅ New file: `/src/hooks/useToast.ts`
2. ✅ New file: `/src/components/ToastProvider.tsx`
3. ✅ Modified: `/src/app/layout.tsx` (add provider)
4. ✅ Modified: `/src/components/ModernFurnitureModal.tsx` (add toast)
5. ✅ Modified: `/src/components/ModernElectronicsModal.tsx` (add toast)
6. ✅ Modified: `/src/components/ModernVehiclesModal.tsx` (add toast)
7. ✅ Modified: `/src/app/assets/furniture/page.tsx` (add toast on CRUD)
8. ✅ Modified: `/src/app/assets/electronics/page.tsx` (add toast on CRUD)
9. ✅ Modified: `/src/app/assets/vehicles/page.tsx` (add toast on CRUD)

### Implementation Steps

**Step 1: Create useToast Hook** (20 min)
```typescript
// File: src/hooks/useToast.ts
'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    message: string,
    type: Toast['type'] = 'info',
    duration = 4000,
    action?: Toast['action']
  ) => {
    const id = Date.now().toString() + Math.random();
    const newToast: Toast = { id, type, message, duration, action };
    setToasts(prev => [...prev, newToast]);

    if (duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
```

**Step 2: Create ToastProvider** (20 min)
```typescript
// File: src/components/ToastProvider.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ToastContainer } from '@/components/Toast';
import { useToast, Toast } from '@/hooks/useToast';

export interface ToastContextType {
  addToast: (
    message: string,
    type?: 'success' | 'error' | 'warning' | 'info',
    duration?: number,
    action?: Toast['action']
  ) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
}
```

**Step 3: Update Root Layout** (10 min)
```typescript
// File: src/app/layout.tsx
// Add to imports:
import { ToastProvider } from '@/components/ToastProvider';

// Wrap children in ToastProvider:
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <SessionProvider>
            {/* existing providers */}
            {children}
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
```

**Step 4: Integrate Toast in Furniture Modal** (15 min)
```typescript
// File: src/components/ModernFurnitureModal.tsx
// Add to imports:
import { useToastContext } from '@/components/ToastProvider';

// Add inside component:
const { addToast } = useToastContext();

// Update handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/furniture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      addToast('Furniture asset created successfully', 'success');
      resetForm();
      onClose();
      // Refresh parent list
      window.location.reload(); // Better: use callback prop
    } else {
      const error = await response.json();
      addToast(error.message || 'Failed to create asset', 'error');
    }
  } catch (error) {
    addToast(error instanceof Error ? error.message : 'Error creating asset', 'error');
  }
};
```

**Step 5: Repeat for Electronics & Vehicles Modals** (30 min)
- Same pattern as Furniture
- File: `/src/components/ModernElectronicsModal.tsx`
- File: `/src/components/ModernVehiclesModal.tsx`

**Step 6: Add Toast to Furniture Page** (10 min)
```typescript
// File: src/app/assets/furniture/page.tsx
// Add import and usage
const { addToast } = useToastContext();

// Add in delete handler:
const handleDelete = async (id: string) => {
  try {
    const res = await fetch(`/api/furniture/${id}`, { method: 'DELETE' });
    if (res.ok) {
      addToast('Asset deleted successfully', 'success');
      // Refresh list
    } else {
      addToast('Failed to delete asset', 'error');
    }
  } catch (error) {
    addToast('Error deleting asset', 'error');
  }
};
```

**Step 7: Repeat for Electronics & Vehicles Pages** (20 min)

### Acceptance Criteria
- [ ] Hook creates and destroys toasts correctly
- [ ] Provider wraps layout properly
- [ ] New furniture asset shows success toast
- [ ] Form errors show error toast (red)
- [ ] Success shows success toast (green)
- [ ] Toast appears in bottom-right corner
- [ ] Toast auto-dismisses after 4s
- [ ] Manual dismiss button works
- [ ] No console errors
- [ ] Multiple toasts stack without overlap
- [ ] Same pattern applied to all 3 modals
- [ ] Same pattern applied to all 3 asset pages

### Testing Checklist
- [ ] Create furniture asset → success toast appears
- [ ] Try to create with invalid data → error toast appears
- [ ] Delete furniture asset → success toast appears
- [ ] Switch pages → toast stays visible
- [ ] Close toast manually → disappears immediately
- [ ] Multiple operations → toasts stack properly
- [ ] Check all 3 asset types work

---

## TASK 2A.2: FORM VALIDATION SCHEMA CENTRALIZATION
**Assigned To**: BACKEND AGENT  
**Duration**: 5 days  
**Start**: 2026-07-17  
**End**: 2026-07-22  
**Complexity**: MEDIUM  
**Blocker Level**: MEDIUM

### Deliverables
1. ✅ New file: `/src/lib/validation/common.ts`
2. ✅ New file: `/src/lib/validation/furniture.ts`
3. ✅ New file: `/src/lib/validation/electronics.ts`
4. ✅ New file: `/src/lib/validation/vehicles.ts`
5. ✅ New file: `/src/lib/validation/index.ts` (export all)
6. ✅ Modified: `/src/app/api/furniture/route.ts` (use schemas)
7. ✅ Modified: `/src/app/api/electronics/route.ts` (use schemas)
8. ✅ Modified: `/src/app/api/vehicles/route.ts` (use schemas)

### Implementation Steps

**Step 1: Create Common Schemas** (30 min)
```typescript
// File: src/lib/validation/common.ts
import { z } from 'zod';

// Common patterns
export const idSchema = z.string().cuid('Invalid ID');
export const emailSchema = z.string().email('Invalid email');
export const phoneSchema = z.string().optional().or(z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone'));
export const urlSchema = z.string().url('Invalid URL').optional();

// Numeric schemas
export const priceSchema = z.union([
  z.number().nonnegative('Price must be non-negative'),
  z.string().transform(v => parseFloat(v))
]).refine(n => n >= 0, 'Price must be non-negative');

export const quantitySchema = z.number().int('Quantity must be integer').positive('Quantity must be positive');

export const dateSchema = z.string().refine(
  (date) => !isNaN(Date.parse(date)),
  'Invalid date format'
);

// File upload
export const fileSchema = z.instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, 'File must be less than 5MB')
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'File must be a valid image (JPEG, PNG, WebP)'
  );

// Common asset fields
export const assetNameSchema = z.string()
  .min(1, 'Asset name is required')
  .max(255, 'Asset name must be less than 255 characters');

export const serialNumberSchema = z.string()
  .min(1, 'Serial number is required')
  .max(100, 'Serial number must be less than 100 characters');

export const notesSchema = z.string().max(2000, 'Notes must be less than 2000 characters').optional();

export const statusSchema = z.enum(['IN_USE', 'IN_STORE', 'DISPOSED', 'AUCTION']);
export const conditionSchema = z.enum(['GOOD', 'REPAIR', 'DAMAGED']);

export const dateRange = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  'Start date must be before end date'
);
```

**Step 2: Create Furniture Schemas** (30 min)
```typescript
// File: src/lib/validation/furniture.ts
import { z } from 'zod';
import {
  idSchema,
  assetNameSchema,
  serialNumberSchema,
  priceSchema,
  dateSchema,
  notesSchema,
  statusSchema,
  conditionSchema,
} from './common';

export const furnitureAssetType = z.enum([
  'DESK',
  'CHAIR',
  'TABLE',
  'CABINET',
  'SHELF',
  'SOFA',
  'BED',
  'OTHER',
]);

export const createFurnitureSchema = z.object({
  assetName: assetNameSchema,
  serialNumber: serialNumberSchema,
  assetType: furnitureAssetType,
  purchaseDate: dateSchema,
  purchasePrice: priceSchema,
  salvageValue: priceSchema.default(0),
  usefulLifeYears: z.number().int().positive('Useful life must be positive').default(5),
  manufacturerId: idSchema,
  locationId: idSchema,
  assignedUserId: idSchema.optional(),
  condition: conditionSchema.default('GOOD'),
  status: statusSchema.default('IN_STORE'),
  notes: notesSchema,
  imageUrls: z.array(z.string().url()).optional().default([]),
});

export const updateFurnitureSchema = createFurnitureSchema.partial();

export type CreateFurnitureInput = z.infer<typeof createFurnitureSchema>;
export type UpdateFurnitureInput = z.infer<typeof updateFurnitureSchema>;
```

**Step 3: Create Electronics Schemas** (30 min)
```typescript
// File: src/lib/validation/electronics.ts
import { z } from 'zod';
import {
  idSchema,
  assetNameSchema,
  serialNumberSchema,
  priceSchema,
  dateSchema,
  notesSchema,
  statusSchema,
  conditionSchema,
} from './common';

export const electronicsType = z.enum([
  'LAPTOP',
  'DESKTOP',
  'MONITOR',
  'PRINTER',
  'SCANNER',
  'COPIER',
  'PHONE',
  'TABLET',
  'SERVER',
  'ROUTER',
  'SWITCH',
  'OTHER',
]);

export const createElectronicsSchema = z.object({
  assetName: assetNameSchema,
  serialNumber: serialNumberSchema,
  assetType: electronicsType,
  purchaseDate: dateSchema,
  purchasePrice: priceSchema,
  salvageValue: priceSchema.default(0),
  usefulLifeYears: z.number().int().positive().default(3),
  manufacturerId: idSchema,
  locationId: idSchema,
  assignedUserId: idSchema.optional(),
  condition: conditionSchema.default('GOOD'),
  status: statusSchema.default('IN_STORE'),
  specifications: z.string().max(500).optional(),
  powerConsumptionWatts: z.number().positive().optional(),
  batteryCapacityMah: z.number().positive().optional(),
  notes: notesSchema,
  imageUrls: z.array(z.string().url()).optional().default([]),
});

export const updateElectronicsSchema = createElectronicsSchema.partial();

export type CreateElectronicsInput = z.infer<typeof createElectronicsSchema>;
export type UpdateElectronicsInput = z.infer<typeof updateElectronicsSchema>;
```

**Step 4: Create Vehicles Schemas** (30 min)
```typescript
// File: src/lib/validation/vehicles.ts
import { z } from 'zod';
import {
  idSchema,
  assetNameSchema,
  serialNumberSchema,
  priceSchema,
  dateSchema,
  notesSchema,
  statusSchema,
  conditionSchema,
} from './common';

export const vehicleType = z.enum([
  'CAR',
  'TRUCK',
  'VAN',
  'MOTORCYCLE',
  'FORKLIFT',
  'CRANE',
  'OTHER',
]);

export const fuelType = z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG']);

export const createVehicleSchema = z.object({
  assetName: assetNameSchema,
  serialNumber: serialNumberSchema, // VIN
  registrationNumber: z.string().min(1, 'Registration number required'),
  vehicleType: vehicleType,
  purchaseDate: dateSchema,
  purchasePrice: priceSchema,
  salvageValue: priceSchema.default(0),
  usefulLifeYears: z.number().int().positive().default(5),
  manufacturerId: idSchema,
  locationId: idSchema,
  assignedUserId: idSchema.optional(),
  condition: conditionSchema.default('GOOD'),
  status: statusSchema.default('IN_STORE'),
  fuelType: fuelType,
  currentOdometerReading: z.number().nonnegative().default(0),
  engineCapacity: z.string().optional(),
  seatCapacity: z.number().int().positive().optional(),
  notes: notesSchema,
  imageUrls: z.array(z.string().url()).optional().default([]),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
```

**Step 5: Create Index File** (10 min)
```typescript
// File: src/lib/validation/index.ts
export * from './common';
export * from './furniture';
export * from './electronics';
export * from './vehicles';
```

**Step 6: Update Furniture API Route** (20 min)
```typescript
// File: src/app/api/furniture/route.ts
// Add to imports:
import { createFurnitureSchema, updateFurnitureSchema } from '@/lib/validation';

// Update POST handler:
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate with schema
    const validationResult = createFurnitureSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // ... rest of implementation
  } catch (error) {
    // error handling
  }
}

// Similar for PUT (update) handler using updateFurnitureSchema
```

**Step 7: Repeat for Electronics & Vehicles APIs** (20 min each)

### Acceptance Criteria
- [ ] All schema files compile without TS errors
- [ ] All enums are correctly defined
- [ ] Common schemas work across all asset types
- [ ] API routes use centralized schemas
- [ ] Types export correctly from schemas
- [ ] Invalid data rejected with proper error messages
- [ ] Valid data passes validation
- [ ] No duplicate validation logic
- [ ] Error responses include field-level details
- [ ] Backwards compatible with existing API responses

### Testing Checklist
- [ ] Test valid furniture creation data
- [ ] Test invalid furniture data (each field)
- [ ] Test date validation
- [ ] Test price validation
- [ ] Test file upload validation
- [ ] Test enum validation
- [ ] Test required vs optional fields
- [ ] Test validation on all 3 asset types

---

## TASK 2A.3: DATATABLE INTEGRATION - FURNITURE PAGE
**Assigned To**: FRONTEND AGENT  
**Duration**: 2 days  
**Start**: 2026-07-22  
**End**: 2026-07-24  
**Complexity**: LOW  
**Blocker Level**: LOW

### Deliverables
1. ✅ Modified: `/src/app/assets/furniture/page.tsx` (use DataTable)
2. ✅ No new component files needed

### Implementation Steps

**Step 1: Plan Column Configuration** (20 min)
Define which columns to show, make sortable, etc.:
```typescript
const columns = [
  { key: 'assetTag', label: 'Asset Tag', sortable: true, width: '120px' },
  { key: 'assetName', label: 'Asset Name', sortable: true, width: '200px' },
  { key: 'assetType', label: 'Type', sortable: true, width: '120px' },
  { key: 'location', label: 'Location', sortable: false, width: '150px' },
  { key: 'assignedUser', label: 'Assigned To', sortable: false, width: '150px' },
  { key: 'condition', label: 'Condition', sortable: true, width: '100px' },
  { key: 'status', label: 'Status', sortable: true, width: '100px' },
  { key: 'purchasePrice', label: 'Price', sortable: true, width: '120px' },
  { key: 'actions', label: 'Actions', sortable: false, width: '150px' },
];
```

**Step 2: Update State Management** (30 min)
Keep existing state (filters, pagination) compatible with DataTable

**Step 3: Replace Table Markup** (45 min)
Find `<table>` element around line 300, replace with:
```typescript
<DataTable
  data={filteredAssets}
  columns={columns}
  searchable={true}
  searchKeys={['assetTag', 'assetName', 'serialNumber']}
  onRowClick={(row) => handleEdit(row.id)}
  pagination={{
    page: currentPage,
    limit: limit,
    total: totalAssets,
    onChange: setCurrentPage,
  }}
  actions={[
    {
      label: 'Edit',
      onClick: (row) => handleEdit(row.id),
      variant: 'secondary',
    },
    {
      label: 'Delete',
      onClick: (row) => handleDelete(row.id),
      variant: 'danger',
    },
    {
      label: 'Checkout',
      onClick: (row) => handleCheckout(row.id),
      variant: 'primary',
    },
  ]}
/>
```

**Step 4: Test Sorting** (30 min)
- Click each column header
- Verify sort direction indicator
- Check data sorted correctly
- Test multiple column sorts

**Step 5: Test Filtering** (30 min)
- Test search box
- Verify results update
- Test filter dropdowns (if any)
- Verify pagination updates

**Step 6: Test Pagination** (20 min)
- Click page numbers
- Click next/previous
- Verify data updates
- Check page indicator

**Step 7: Fix Styling Issues** (15 min)
- Verify column widths
- Check alignment
- Test responsive behavior
- Mobile breakpoint handling

### Acceptance Criteria
- [ ] DataTable component displays furniture data
- [ ] Sorting works on all sortable columns
- [ ] Sort indicator shows direction
- [ ] Search filters by assetTag/assetName
- [ ] Pagination controls work
- [ ] Page updates when navigating
- [ ] Row click goes to detail/edit
- [ ] Edit/Delete buttons work
- [ ] Checkout button works
- [ ] Column widths appropriate
- [ ] Mobile responsive (stacks on small screens)
- [ ] No console errors
- [ ] No console warnings

### Testing Checklist
- [ ] Load furniture page
- [ ] Verify DataTable displays
- [ ] Sort by Asset Tag
- [ ] Sort by Price (ascending then descending)
- [ ] Search for asset
- [ ] Go to page 2
- [ ] Click Edit on asset
- [ ] Click Delete (verify confirmation)
- [ ] Test on mobile (width <768px)
- [ ] Check accessibility with Tab key

---

## TASK 2A.4: ASSET TRANSFER FEATURE
**Assigned To**: ASSET AGENT + BACKEND AGENT  
**Duration**: 4 days  
**Start**: 2026-07-20  
**End**: 2026-07-24  
**Complexity**: MEDIUM  
**Blocker Level**: MEDIUM

### Database Changes
```prisma
// File: prisma/schema.prisma
model AssetTransfer {
  id              String   @id @default(cuid())
  assetType       String   // 'FURNITURE' | 'ELECTRONICS' | 'VEHICLE'
  assetId         String
  
  fromUserId      String?
  fromLocationId  String?
  toUserId        String?
  toLocationId    String?
  
  transferDate    DateTime @default(now())
  reason          String?
  notes           String?
  
  createdBy       String
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  
  @@index([assetId])
  @@index([transferDate])
  @@index([assetType])
}
```

**Migration Command**:
```bash
npx prisma migrate dev --name add_asset_transfer_model
```

### API Endpoints

**POST /api/assets/[id]/transfer**
```typescript
// Request
{
  assetType: 'FURNITURE' | 'ELECTRONICS' | 'VEHICLE',
  toUserId?: string,
  toLocationId?: string,
  reason?: string,
  notes?: string,
}

// Response
{
  success: true,
  data: {
    id: string,
    assetId: string,
    fromUserId?: string,
    toUserId?: string,
    transferDate: ISO8601,
    createdBy: string,
  },
  message: 'Asset transferred successfully',
}
```

**GET /api/assets/[id]/transfer-history**
```typescript
// Response
{
  success: true,
  data: [
    {
      id: string,
      fromUser?: User,
      toUser?: User,
      transferDate: ISO8601,
      reason?: string,
      notes?: string,
    }
  ],
  pagination: { page, limit, total },
}
```

**POST /api/bulk/transfer**
```typescript
// Request
{
  assetIds: string[],
  assetType: string,
  toUserId?: string,
  toLocationId?: string,
  reason?: string,
}

// Response
{
  success: boolean,
  data: {
    succeeded: number,
    failed: number,
    transfers: Array<{ assetId, success, error? }>,
  },
}
```

### UI Components

**Transfer Modal**:
- Asset selector (auto-filled if called from asset detail)
- From location/user display (read-only)
- To location selector (dropdown)
- To user selector (dropdown)
- Reason dropdown (Personnel Change, Location Change, Asset Exchange, etc.)
- Notes text area
- Confirmation button

**Transfer History**:
- Timeline view showing all transfers
- Each entry: Date, From/To, Reason, Created By
- Expandable for notes

### Implementation Steps

**Step 1: Create Migration** (10 min)
```bash
cd /path/to/project
npx prisma migrate dev --name add_asset_transfer
```

**Step 2: Create API Route** (60 min)
```typescript
// File: src/app/api/assets/[id]/transfer/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const transferSchema = z.object({
  assetType: z.enum(['FURNITURE', 'ELECTRONICS', 'VEHICLE']),
  toUserId: z.string().optional(),
  toLocationId: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => data.toUserId || data.toLocationId,
  'Must specify either toUserId or toLocationId'
);

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check permissions
  if (!hasPermission(user, 'ASSET', 'TRANSFER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validation = transferSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          details: validation.error.flatten().fieldErrors,
        },
      }, { status: 400 });
    }

    const { assetType, toUserId, toLocationId, reason, notes } = validation.data;

    // Validate asset exists
    const asset = await getAssetById(params.id, assetType);
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Create transfer record
    const transfer = await prisma.assetTransfer.create({
      data: {
        assetId: params.id,
        assetType,
        fromUserId: asset.assignedUserId || undefined,
        fromLocationId: asset.locationId,
        toUserId,
        toLocationId,
        reason,
        notes,
        createdBy: user.id,
      },
    });

    // Update asset with new assignment
    await updateAssetAssignment(params.id, assetType, toUserId, toLocationId);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'TRANSFER',
        entity: assetType,
        entityId: params.id,
        details: `Transferred to ${toUserId ? 'user' : 'location'}`,
        timestamp: new Date(),
      },
    });

    // Send notifications
    if (toUserId) {
      await createNotification(
        toUserId,
        `Asset ${asset.assetName} assigned to you`,
        'ASSET_ASSIGNED'
      );
    }

    return NextResponse.json({
      success: true,
      data: transfer,
      message: 'Asset transferred successfully',
    });

  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: 'Failed to transfer asset' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getAssetById(id: string, type: string) {
  const model = type === 'FURNITURE' ? prisma.furnitureAsset :
                type === 'ELECTRONICS' ? prisma.electronicAsset :
                prisma.vehicleAsset;
  
  return model.findUnique({
    where: { id },
    include: { assignedUser: true, location: true },
  });
}

async function updateAssetAssignment(id: string, type: string, userId?: string, locationId?: string) {
  const model = type === 'FURNITURE' ? prisma.furnitureAsset :
                type === 'ELECTRONICS' ? prisma.electronicAsset :
                prisma.vehicleAsset;

  return model.update({
    where: { id },
    data: {
      assignedUserId: userId || null,
      locationId: locationId || undefined,
    },
  });
}
```

**Step 3: Create Transfer Modal** (60 min)
```typescript
// File: src/components/TransferAssetModal.tsx
'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { FormSelect, FormInput, FormTextarea } from '@/components/FormInputs';
import { useToastContext } from '@/components/ToastProvider';

interface TransferAssetModalProps {
  isOpen: boolean;
  assetId: string;
  assetType: 'FURNITURE' | 'ELECTRONICS' | 'VEHICLE';
  currentAssignee?: string;
  currentLocation?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransferAssetModal({
  isOpen,
  assetId,
  assetType,
  currentAssignee,
  currentLocation,
  onClose,
  onSuccess,
}: TransferAssetModalProps) {
  const { addToast } = useToastContext();
  const [toUserId, setToUserId] = useState<string>('');
  const [toLocationId, setToLocationId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId && !toLocationId) {
      addToast('Select either a user or location', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/assets/${assetId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetType,
          toUserId: toUserId || undefined,
          toLocationId: toLocationId || undefined,
          reason,
          notes,
        }),
      });

      if (response.ok) {
        addToast('Asset transferred successfully', 'success');
        onSuccess();
        onClose();
      } else {
        addToast('Failed to transfer asset', 'error');
      }
    } catch (error) {
      addToast('Error transferring asset', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Asset">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-100 p-3 rounded text-sm">
          <p>Current: {currentAssignee || currentLocation}</p>
        </div>

        <FormSelect
          label="Transfer To (User)"
          value={toUserId}
          onChange={setToUserId}
          options={[
            { value: '', label: '-- Select User --' },
            // Fetch from API
          ]}
        />

        <FormSelect
          label="Transfer To (Location)"
          value={toLocationId}
          onChange={setToLocationId}
          options={[
            { value: '', label: '-- Select Location --' },
            // Fetch from API
          ]}
        />

        <FormSelect
          label="Reason"
          value={reason}
          onChange={setReason}
          options={[
            { value: '', label: '-- Select Reason --' },
            { value: 'PERSONNEL_CHANGE', label: 'Personnel Change' },
            { value: 'LOCATION_CHANGE', label: 'Location Change' },
            { value: 'ASSET_EXCHANGE', label: 'Asset Exchange' },
            { value: 'MAINTENANCE', label: 'Maintenance' },
            { value: 'OTHER', label: 'Other' },
          ]}
        />

        <FormTextarea
          label="Notes"
          value={notes}
          onChange={setNotes}
          placeholder="Additional notes..."
        />

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Transferring...' : 'Transfer'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
```

**Step 4: Integrate into Asset Pages** (30 min)
Add transfer button to each asset page (furniture, electronics, vehicles)

**Step 5: Create Transfer History View** (45 min)
Timeline component showing all transfers

### Acceptance Criteria
- [ ] Transfer API endpoint works
- [ ] Transfer creates audit log
- [ ] Transfer creates asset transfer record
- [ ] Asset assignment updates
- [ ] Recipient gets notification
- [ ] Transfer modal displays correctly
- [ ] Validation works (must select user or location)
- [ ] Transfer history shows all transfers
- [ ] No permission bypass
- [ ] Error handling works

### Testing Checklist
- [ ] Create transfer (furniture to user)
- [ ] Create transfer (furniture to location)
- [ ] Verify audit log entry
- [ ] Verify notification sent
- [ ] View transfer history
- [ ] Test validation (neither selected)
- [ ] Test bulk transfer
- [ ] Check permissions (VIEW_USER cannot transfer)

---

## TASK 2A.5: SECURITY HARDENING
**Assigned To**: SECURITY AGENT  
**Duration**: 3 days  
**Start**: 2026-07-22  
**End**: 2026-07-25  
**Complexity**: MEDIUM  
**Blocker Level**: MEDIUM

### Deliverables
1. ✅ New file: `/src/middleware/rateLimiter.ts`
2. ✅ New file: `/src/middleware/securityHeaders.ts`
3. ✅ Modified: `/src/middleware.ts` (add rate limiting + headers)
4. ✅ Modified: API routes (add authentication audit logging)
5. ✅ Modified: Failed login handler (add logging)

### Implementation

**Step 1: Implement Rate Limiting** (90 min)
- Install: `npm install express-rate-limit`
- Global limit: 100 req/min per IP
- Login limit: 10 req/min per IP
- API limit: 50 req/min per user

**Step 2: Add Security Headers** (60 min)
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

**Step 3: Enhance Audit Logging** (60 min)
- Log failed authentication attempts
- Log permission denials
- Log IP address for all API calls
- Log rate limit violations

**Step 4: Add Failed Login Logging** (30 min)
- Create endpoint for failed login attempts
- Log with timestamp + IP
- Alert if >5 failures from same IP

### Acceptance Criteria
- [ ] Rate limiting works globally
- [ ] Rate limiting works per-endpoint
- [ ] Security headers present in responses
- [ ] Failed auth attempts logged
- [ ] Permission denials logged
- [ ] No legitimate traffic blocked
- [ ] Error messages don't leak info

---

## PHASE 2A SUMMARY

**Timeline**: 2026-07-14 to 2026-07-24 (11 days)

**Completed Features**:
- ✅ Toast System (3 days)
- ✅ Form Validation Schemas (5 days)
- ✅ DataTable Integration (2 days)
- ✅ Asset Transfer (4 days)
- ✅ Security Hardening (3 days)

**Parallel Tasks** (can overlap):
- Day 1-3: Toast System
- Day 2-4: Validation Schemas (start before toast complete)
- Day 4-5: DataTable
- Day 4-7: Asset Transfer
- Day 6-8: Security (start after core features)

**Go/No-Go Criteria for Phase 2B**:
- [ ] All 5 Phase 2A tasks complete
- [ ] <2 critical bugs outstanding
- [ ] <10 non-critical bugs
- [ ] 80%+ test coverage
- [ ] All team members sign off

---

## PHASE 2B: ADVANCED FEATURES (Days 11-20)

[Detailed tasks for Phase 2B will follow in next section, covering:]
- Mobile Experience Enhancement
- NotificationCenter Integration
- Bulk Operations
- Advanced Analytics

---

**Document Status**: ACTIVE (Ready for execution)  
**Next Review**: After Phase 2A completion (2026-07-25)
