# Z-Index Stacking Hierarchy

This guide documents the standardized z-index stacking order used throughout the application. This ensures predictable layering of overlays, modals, dropdowns, and notifications.

## Stacking Order (Low to High Priority)

```
z-0      = Default (base layer, static content)
z-10     = Base interactive elements (buttons, inputs, cards)
z-20     = Tooltips, popovers
z-30     = Drawers, side panels (mobile sidebar)
z-40     = Dropdowns, autocomplete suggestions, comboboxes
z-50     = Modal backdrops, large overlays, full-screen overlays
z-51     = Modal content (sits directly above backdrop for interaction)
z-9999   = Toast notifications, critical alerts (always on top)
```

## Component Mapping

### Toast Notifications
- **File**: `src/components/Toast.tsx`
- **Z-Index**: `z-[9999]`
- **Container**: `.fixed.bottom-4.right-4.z-[9999]`
- **Priority**: HIGHEST - Always visible above all other elements
- **Fixed Position**: Bottom-right corner
- **Accessibility**: No need for focus trap, auto-dismiss with progress bar

### Modal Components
- **Backdrop Z-Index**: `z-50`
- **Content Z-Index**: `z-51` (above backdrop)
- **Files Affected**:
  - `src/components/Modal.tsx` - Generic modal wrapper
  - `src/components/CheckoutModal.tsx` - Checkout/Checkin functionality
  - `src/components/ModernFurnitureModal.tsx` - Furniture creation/editing
  - `src/components/ModernElectronicsModal.tsx` - Electronics creation/editing
  - `src/components/ModernVehiclesModal.tsx` - Vehicles creation/editing
  - `src/components/ModernUserModal.tsx` - User creation/editing
  - `src/components/MaintenanceHistoryModal.tsx`
  - `src/components/MaintenanceSection.tsx`

**Backdrop**:
```tsx
<motion.div
  className="fixed inset-0 bg-black/40 z-50"
  aria-hidden="true"
/>
```

**Content Container**:
```tsx
<div className="fixed inset-0 z-51 flex items-center justify-center p-4">
  {/* Modal content here */}
</div>
```

**ARIA Attributes**:
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
```

### Dropdowns & Comboboxes
- **File**: `src/components/form/FormCombobox.tsx`
- **Z-Index**: `z-40`
- **Container**: `.absolute.top-full.z-40`
- **Note**: Must be below modals (z-40 < z-50)
- **Positioning**: Positioned relative to parent input

### Mobile Sidebar
- **File**: `src/components/DashboardLayout.tsx`
- **Backdrop**: `z-40` (mobile only)
- **Sidebar**: `z-50` (mobile only)
- **Desktop**: `z-30` (sticky sidebar)
- **Mobile Backdrop**:
  ```tsx
  className="mobile-backdrop fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
  ```
- **Mobile Sidebar**:
  ```tsx
  className="fixed top-0 left-0 h-full z-50 lg:hidden"
  ```

### Desktop Header & Navigation
- **File**: `src/components/DashboardLayout.tsx`
- **Mobile Header**: `z-20` (sticky top header on mobile)
- **Desktop Sidebar**: `z-30` (sticky left sidebar)
- **Content Area**: `z-10` (main content)

### Notification Center Panel
- **File**: `src/components/NotificationCenter.tsx`
- **Backdrop**: `z-40`
- **Panel**: `z-50`
- **Note**: Behaves like a dropdown positioned absolutely from bell icon

### Special Cases

#### Focus Trap (useFocusTrap hook)
- Used in: `CheckoutModal.tsx`, `ModernFurnitureModal.tsx`, etc.
- Ensures keyboard focus stays within modal while open
- Works regardless of z-index (focus management is separate from stacking)

#### Escape Key Handling
- All modals should close when Escape key is pressed
- Implementation: `useEffect` hook listening to `keydown` events
- Should not interfere with nested interactive elements

## Validation Checklist

When working with z-index values:

- [ ] Toast notifications appear above all modals
- [ ] Modal content is clickable (z-51) while backdrop is behind (z-50)
- [ ] Backdrop click closes modal (has onclick handler)
- [ ] Dropdowns appear above buttons but below modals
- [ ] No two elements have conflicting z-index in same stacking context
- [ ] Mobile sidebar overlays backdrop correctly
- [ ] ARIA attributes present:
  - `role="dialog"` on modal
  - `aria-modal="true"` on modal
  - `aria-labelledby="[id]"` pointing to modal title
  - `aria-hidden="true"` on backdrop (non-interactive)

## Tailwind Classes Used

- `z-[9999]` - Toast (arbitrary value)
- `z-[9998]` - Checkout modal overlay (arbitrary value)
- `z-[10000]` - Checkout modal content (arbitrary value)
- `z-10` - Standard interactive elements
- `z-20` - Mobile header
- `z-30` - Desktop sidebar, drawers
- `z-40` - Dropdowns, mobile backdrop
- `z-50` - Modal backdrops, overlays
- `z-51` - Modal content (NOTE: Need to verify this works in Tailwind v4)

## Notes on Tailwind v4 with Custom Z-Index

Tailwind CSS 4 supports arbitrary values, so `z-[9999]` works fine. However, for standard values (z-10, z-20, etc.), we should verify the default scale includes all needed values.

If using custom z-index scale in `tailwind.config.ts`, ensure:
```js
extend: {
  zIndex: {
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    51: '51',
    // z-9999 can use arbitrary syntax: z-[9999]
  }
}
```

## Common Pitfalls

1. **Stacking Context**: Z-index is relative to the nearest positioned ancestor. Fixed position elements create a new stacking context.
2. **Dropdown in Modal**: If a dropdown inside a modal can't be seen, its z-index must be higher than the modal but positioned absolutely/fixed to the viewport.
3. **Multiple Modals**: If stacking multiple modals, use incrementing z-index (51, 52, 53, etc.) to maintain visibility order.
4. **Mobile vs Desktop**: Different z-index strategies may be needed for responsive behavior.

## Testing Focus Trap

```
1. Open modal
2. Tab through all interactive elements
3. Verify focus doesn't escape modal
4. Shift+Tab (reverse) - focus should loop back
5. Escape key closes modal
6. Focus returns to trigger element after close
```

## Testing Visual Stacking

```
1. Open modal
2. Trigger toast notification → Toast appears on top
3. Open dropdown inside modal → Dropdown clips at modal boundary or shows above
4. Close modal with Escape
5. Try all of the above with keyboard-only (no mouse)
```

## Accessibility Testing

Use DevTools Accessibility inspector:
- [ ] Modal has `role="dialog"`
- [ ] Modal has `aria-modal="true"`
- [ ] Modal has `aria-labelledby` pointing to title
- [ ] Close button has `aria-label`
- [ ] Backdrop has `aria-hidden="true"`
- [ ] Focus trap works (Tab doesn't leave modal)
- [ ] Screen reader announces modal title
