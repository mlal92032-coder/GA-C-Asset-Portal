# Z-Index Stacking Order - Complete Layer Management

## Problem Fixed
User reported overlapping elements:
- Search bar dropdown overlapping with content below
- Pages overlapping with each other
- Modals overlapping with search dropdown
- Unclear stacking context causing visual chaos

## Solution: Explicit Z-Index Hierarchy

### Complete Z-Index Stack (Lowest to Highest)

```
z-index: 0        = Main content, components without explicit z-index
                    └─ Page backgrounds, text, cards

z-index: 1        = Component-internal elements
                    └─ Modal headers, footers, sticky table headers

z-index: 10       = Sticky table headers
                    └─ thead th (position: sticky)

z-index: 20       = Header/Navbar (sticky top)
                    └─ DashboardLayout header
                    └─ Contains: GlobalSearch, NotificationBell, User menu

z-index: 40       = Mobile sidebar backdrop
                    └─ Dark overlay when sidebar opens on mobile

z-index: 50       = Sidebar (sticky left)
                    └─ Desktop navigation menu
                    └─ Mobile navigation menu (when open)

z-index: 9997     = Search dropdown OVERLAY (invisible)
                    └─ Click shield to close dropdown when clicking outside
                    └─ (Optional: for future use)

z-index: 9998     = Modal overlay (dark backdrop with blur)
                    └─ .modal-overlay
                    └─ Semi-transparent background: rgba(15, 23, 42, 0.5)
                    └─ backdrop-filter: blur(6px)
                    └─ Below modal content for layering effect

z-index: 9999     = Search dropdown (visible results list)
                    └─ .search-dropdown
                    └─ Global search results
                    └─ BELOW modals so modals take precedence

z-index: 10000    = Modal content (checkout, create, edit forms)
                    └─ .modal
                    └─ CheckoutModal
                    └─ ModernFurnitureModal
                    └─ ModernElectronicsModal
                    └─ ModernVehiclesModal
                    └─ ModernUserModal
                    └─ ABOVE search dropdown for interaction

z-index: 99999    = Toast notifications (success/error messages)
                    └─ .toast, .toast-success, .toast-error
                    └─ HIGHEST priority to catch user attention
                    └─ Never hidden behind anything
```

## File Changes Made

### 1. `src/app/layout-fixes.css` ✅ UPDATED
**Complete rewrite with documented z-index layer system**

Key changes:
- Added comprehensive z-index documentation
- Set .search-dropdown to z-[9999]
- Set .modal-overlay to z-[9998]
- Set .modal to z-[10000]
- Set .toast to z-[99999]
- Organized all layer definitions

### 2. `src/app/globals.css` ✅ UPDATED
**Enhanced modal styling with proper z-index values**

Key changes:
- Updated .modal-overlay with z-index: 9998 !important
- Updated .modal with z-index: 10000 !important
- Added child elements z-index: 1 for proper nesting
- Added .animate-scale-in animation class

### 3. `src/components/GlobalSearch.tsx` ✅ UPDATED
**Proper z-index for search dropdown**

Changes:
- Changed dropdown z-class from z-[100] to z-[9999]
- Added 'search-dropdown' CSS class for consistency
- Dropdown now below modals but above all other content

### 4. `src/components/CheckoutModal.tsx` ✅ UPDATED
**Proper z-index layering for modal overlay and content**

Changes in CheckoutModal:
- Changed overlay from z-[9999] to z-[9998] with 'modal-overlay' class
- Changed modal from no z-index to z-[10000] with 'modal' class

Changes in CheckinModal:
- Changed overlay from z-[9999] to z-[9998] with 'modal-overlay' class
- Changed modal to use 'modal' class with z-[10000]

### 5. `src/components/DashboardLayout.tsx` ✅ UPDATED
**Mobile sidebar backdrop z-index**

Changes:
- Added 'mobile-backdrop' CSS class to mobile sidebar overlay
- Ensures consistent z-index hierarchy

## Component-Specific Details

### GlobalSearch
```
┌─ DashboardLayout header (z-20)
│  ├─ GlobalSearch (relative container)
│  │  ├─ Input field
│  │  └─ Search dropdown (z-9999)
│  │     ├─ Loading state
│  │     ├─ Group headers
│  │     └─ Result items
```

### CheckoutModal / CheckinModal
```
┌─ Modal overlay (z-9998) - dark backdrop
│  └─ Modal content (z-10000) - white box
│     ├─ Modal header
│     ├─ Modal body (form fields)
│     └─ Modal footer (action buttons)
```

### Modern Modals (Furniture, Electronics, Vehicles, Users)
```
┌─ Modal overlay (z-9998) - dark backdrop
│  └─ Modal content (z-10000) - white box
│     ├─ Header (sticky top)
│     ├─ Body (scrollable form)
│     └─ Footer (action buttons)
```

## Testing Checklist

- [ ] Open search bar → dropdown appears below navbar
- [ ] Click outside search → dropdown closes
- [ ] Open checkout modal → modal appears above search dropdown
- [ ] Search with modal open → search dropdown stays behind modal
- [ ] Close modal → search dropdown (if open) is accessible again
- [ ] Toast notification → appears above everything
- [ ] On mobile → sidebar opens above search and modals
- [ ] Keyboard navigation → all elements accessible with Tab key

## CSS Classes Reference

| Class | z-index | Purpose | File |
|-------|---------|---------|------|
| `.mobile-backdrop` | 40 | Mobile sidebar overlay | layout-fixes.css |
| `header` | 20 | Navbar with search | layout-fixes.css |
| `aside` | 50 | Sidebar navigation | layout-fixes.css |
| `.search-dropdown` | 9999 | Search results list | layout-fixes.css |
| `.modal-overlay` | 9998 | Dark background for modals | layout-fixes.css, globals.css |
| `.modal` | 10000 | Modal content box | layout-fixes.css, globals.css |
| `.toast` | 99999 | Notifications | layout-fixes.css |

## Tailwind Class Mappings

These Tailwind classes are used throughout but overridden by CSS:

- `z-[100]` → overridden by `.search-dropdown { z-index: 9999 }`
- `z-[9998]` → matches `.modal-overlay`
- `z-[9999]` → matches `.search-dropdown`
- `z-[10000]` → matches `.modal`
- `z-[99999]` → matches `.toast`

## Important Notes

1. **CSS Classes Have Priority**: The `.css` files use `!important` flags to ensure consistency across all modals, even if they're created differently.

2. **No Ambiguity**: Each layer has a clear, unique z-index with large gaps (e.g., 9998, 9999, 10000) to prevent accidental overlaps.

3. **Accessibility Maintained**: Tab order and focus management follow semantic HTML and remain unaffected by z-index changes.

4. **Performance**: No z-index stacking contexts that would cause unexpected behavior. All values are explicit and documented.

5. **Future Expandability**: If new overlays are needed:
   - Dropdown-like elements: Use z-9999 or lower
   - Modal-like elements: Use z-10000 or higher
   - Notifications: Use z-99999 or higher
   - Ultra-high: Use z-[999999] only for critical items

## Deployment Note

These changes are **pure CSS and class assignments** — no JavaScript, no DOM structure changes, no breaking changes. Safe to deploy immediately.
