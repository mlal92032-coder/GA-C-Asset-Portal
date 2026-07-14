# Design Quick Reference Guide
## Asset Management System - Visual Standards & Best Practices

**Last Updated:** July 13, 2026

---

## Quick Index
- Color Palette
- Typography Scale
- Spacing System
- Component Sizing
- Animation Timings
- Common Patterns

---

## 1. COLOR PALETTE AT A GLANCE

### Primary Color (Blue)
```
Primary:   #3b82f6 (Blue-500)    ← Use for CTAs, primary actions
Hover:     #2563eb (Blue-600)    ← Hover state
Active:    #1d4ed8 (Blue-700)    ← Pressed/active state
Light:     #eff6ff (Blue-50)     ← Backgrounds, light variants
```

### Semantic Colors
```
Success:   #22c55e (Emerald-500) ← Success messages, confirmed states
Warning:   #f59e0b (Amber-500)   ← Warnings, pending actions
Danger:    #ef4444 (Red-500)     ← Errors, destructive actions
Info:      #3b82f6 (Blue-500)    ← Info, neutral messages
```

### Neutral Colors (Gray Scale)
```
50:   #f8fafc   ← Very light backgrounds
100:  #f1f5f9   ← Light backgrounds
200:  #e2e8f0   ← Borders, dividers
300:  #cbd5e1   ← Secondary borders
400:  #94a3b8   ← Disabled text
500:  #64748b   ← Secondary text (avoid for contrast)
600:  #475569   ← Primary secondary text (IMPROVED)
700:  #334155   ← Headers, labels
800:  #1e293b   ← Dark text
900:  #0f172a   ← Darkest text
```

### WCAG Compliance
```
✅ Dark text (#0f172a) on white:        21:1 (AAA)
✅ Slate-700 (#334155) on white:       11.5:1 (AAA)
✅ Slate-600 (#475569) on white:       8.2:1 (AA) ← IMPROVED
❌ Slate-500 (#64748b) on white:       4.2:1 (FAILS AA) ← Don't use
❌ Slate-400 (#94a3b8) on white:       3.8:1 (FAILS AA) ← Don't use
```

---

## 2. TYPOGRAPHY SCALE

### Font Stack
```
Primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Display: "Plus Jakarta Sans", sans-serif
```

### Size Scale
| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| **xs** | 12px | 1rem | Labels, badges, helper text |
| **sm** | 14px | 1.25rem | Body text, small UI |
| **base** | 16px | 1.5rem | Default body, form inputs |
| **lg** | 18px | 1.75rem | Subheadings, lead text |
| **xl** | 24px | 2rem | Section headings |
| **2xl** | 30px | 2.25rem | Page titles |
| **3xl** | 36px | 2.5rem | Hero headings |

### Font Weight
- **Light (300):** Not recommended for UI
- **Normal (400):** Body text
- **Medium (500):** Labels, slightly emphasized text
- **Semibold (600):** Button text, section headers
- **Bold (700):** Headings, emphasis
- **Extrabold (800):** Hero headings
- **Black (900):** Not used in this system

### Usage Examples
```
Page Title:           3xl / bold (36px, 700)
Section Title:        xl / semibold (24px, 600)
Card Title:           lg / semibold (18px, 600)
Body Text:            base / normal (16px, 400)
Form Label:           sm / medium (14px, 500)
Helper Text:          xs / normal (12px, 400)
Badge:                xs / bold (12px, 700)
Button:               sm / semibold (14px, 600)
```

---

## 3. SPACING SYSTEM

### Scale
```
xs:   4px   (very small gaps)
sm:   8px   (small gaps, padding)
md:   16px  (standard padding)
lg:   24px  (large padding, section spacing)
xl:   32px  (extra large, between major sections)
2xl:  40px  (very large sections)
3xl:  48px  (hero sections)
```

### Common Patterns
```
Card Padding:           16px (md) or 24px (lg)
Section Spacing:        24px (lg) or 32px (xl)
Component Gap:          8px (sm) or 12px (between 8px-16px)
Form Field Spacing:     16px (md) between fields
Group Spacing:          12px (sm) between related items
Border Radius:          8px (md) or 12px (lg)
```

### Breakpoint-Specific Spacing
```
Mobile:   p-2 or p-3 (8-12px)
Tablet:   p-4 (16px)
Desktop:  p-6 or p-8 (24-32px)

Responsive class:  p-2 sm:p-4 md:p-6 lg:p-8
```

---

## 4. COMPONENT SIZING

### Touch Targets (WCAG)
```
Minimum:    44px × 44px (2.75rem × 2.75rem)
Recommended: 48px × 48px (3rem × 3rem) on mobile
```

### Button Sizes
```
xs:  7 height (28px)   — Small inline actions
sm:  8 height (32px)   — Compact buttons
md:  9 height (36px)   — Standard buttons ← USE THIS
lg:  10 height (40px)  — Large buttons
xl:  12 height (48px)  — Extra large, mobile-friendly
```

### Form Input Heights
```
Standard:   2.75rem (44px)  ← WCAG minimum touch target
Compact:    2rem (32px)     ← Only when space-constrained
Spacious:   3rem (48px)     ← Mobile-preferred
```

### Icon Sizes
```
xs:  16px (small buttons, badges)
sm:  20px (navigation items)
md:  24px (headers, standard UI)
lg:  32px (prominent icons)
xl:  48px (hero sections, empty states)
```

### Card Dimensions
```
Minimum width:   280px  (mobile)
Standard width:  320px  (card grid)
Maximum width:   600px  (single card)

Stat cards:      100px height minimum
Content cards:   auto (content-driven)
```

---

## 5. ANIMATION TIMINGS

### Duration Reference
```
Instant:    50ms   (0.05s)  ← User perceives as immediate
Fast:       150ms  (0.15s)  ← Quick feedback, micro-interactions
Base:       300ms  (0.3s)   ← Standard transitions ← USE THIS
Slow:       500ms  (0.5s)   ← Gradual reveals
Slower:     800ms  (0.8s)   ← Deliberate, special moments
```

### Common Animation Patterns
```
Button hover:           150ms spring
Button press:           100ms scale down
Modal enter:            300ms scale + fade
Tooltip show:           200ms fade
Loading spinner:        1000ms continuous
List item entrance:     300ms staggered (50ms between items)
Form shake error:       400ms
Toast notification:     300ms slide in, 4000ms visible
```

### Animation Easing
```
Linear:      constant speed (loading spinners, progress bars)
Ease Out:    fast start, slow end (entrances)
Ease In:     slow start, fast end (exits)
Ease In-Out: slow start, fast middle, slow end
Spring:      bouncy, natural feeling (interactions)
```

---

## 6. SHADOW ELEVATION SYSTEM

### Depth Levels
```
Subtle (xs):    0 1px 2px 0 rgba(0,0,0,0.05)
Small (sm):     0 1px 3px 0 rgba(0,0,0,0.1)
Medium (md):    0 4px 6px -1px rgba(0,0,0,0.1)
Large (lg):     0 10px 15px -3px rgba(0,0,0,0.1)
Extra (xl):     0 20px 25px -5px rgba(0,0,0,0.1)
Maximum (2xl):  0 25px 50px -12px rgba(0,0,0,0.15)
```

### Usage
```
Card default:        sm shadow
Card hover:          md shadow (+2px lift)
Elevated card:       lg shadow
Modal backdrop:      xl shadow
Modal content:       2xl shadow + slightly blurred backdrop
Button hover:        md shadow (with lift)
Floating action:     lg shadow
```

---

## 7. BORDER & RADIUS SYSTEM

### Border Radius
```
xs:   6px   (small elements)
sm:   8px   (buttons, small cards)
md:   12px  (default cards, inputs)
lg:   16px  (large cards, containers)
xl:   20px  (prominent elements)
2xl:  24px  (hero sections)
full: 9999px (circles, pills)
```

### Border Widths
```
Hairline:  1px   (most borders)
Thin:      1.5px (form inputs, prominent borders)
Regular:   2px   (active states)
Thick:     3px   (focus rings)
```

### Border Colors
```
Light:     #e2e8f0 (Slate-200) ← Default borders
Medium:    #cbd5e1 (Slate-300) ← Hover borders
Dark:      #94a3b8 (Slate-400) ← Secondary borders
Focus:     #3b82f6 (Blue-500)  ← Focus rings
Error:     #ef4444 (Red-500)   ← Error borders
```

---

## 8. COMMON COMPONENT PATTERNS

### Primary Button
```
Default:   bg-blue-600 text-white
Hover:     bg-blue-700 shadow-md transform -translate-y-0.5
Active:    bg-blue-800
Disabled:  bg-slate-200 text-slate-400 cursor-not-allowed
Focus:     outline-2 outline-blue-500 outline-offset-2
```

### Secondary Button
```
Default:   bg-slate-100 text-slate-900 border border-slate-200
Hover:     bg-slate-200 border-slate-300
Active:    bg-slate-300
Disabled:  bg-slate-100 text-slate-400 border-slate-200
```

### Form Input
```
Default:   border-slate-200 bg-white
Hover:     border-slate-300
Focus:     border-blue-500 ring-2 ring-blue-500/10
Error:     border-red-500 ring-2 ring-red-500/10
Disabled:  bg-slate-50 border-slate-200 text-slate-400
```

### Card
```
Default:   bg-white border border-slate-200 rounded-lg shadow-sm
Hover:     shadow-md -translate-y-1 border-slate-300
```

### Data Table Header
```
Background:  linear-gradient(to bottom, #f8fafc, #ffffff)
Text:        text-slate-900 font-semibold uppercase
Border:      border-b border-slate-200
```

### Badge
```
Success:   bg-emerald-100 text-emerald-700
Warning:   bg-amber-100 text-amber-700
Danger:    bg-red-100 text-red-700
Info:      bg-blue-100 text-blue-700
```

---

## 9. RESPONSIVE BREAKPOINTS

### Tailwind Breakpoints
```
Default:  Any device (mobile-first)
sm:       640px  (landscape phones)
md:       768px  (tablets)
lg:       1024px (laptops)
xl:       1280px (large monitors)
2xl:      1536px (ultra-wide displays)
```

### Mobile-First Pattern
```
<div className="
  w-full sm:w-1/2 md:w-1/3 lg:w-1/4
  p-2 sm:p-3 md:p-4 lg:p-6
  text-sm sm:text-base md:text-lg
">
```

### Common Responsive Values
```
Padding:    p-2 sm:p-3 md:p-4 lg:p-6
Gap:        gap-2 sm:gap-3 md:gap-4
Text Size:  text-sm sm:text-base md:text-lg
Grid Cols:  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

---

## 10. DO's AND DON'Ts

### DO ✅
- Use primary color (#3b82f6) for main actions
- Follow the spacing scale (4px, 8px, 16px, 24px, etc.)
- Use 300ms animations for standard transitions
- Apply box shadows for elevation
- Test color contrast with WebAIM
- Use semantic HTML elements
- Include ARIA labels on interactive elements
- Provide visual focus indicators
- Use Lucide icons consistently
- Test on multiple breakpoints

### DON'T ❌
- Don't use Slate-500 (#64748b) for primary text (low contrast)
- Don't use Slate-400 (#94a3b8) for body text (fails WCAG)
- Don't create custom colors outside the palette
- Don't animate for more than 1 second (feels slow)
- Don't remove focus rings or outlines
- Don't use only color to indicate status
- Don't mix CSS classes with Tailwind classes
- Don't hardcode spacing values
- Don't create new button variants
- Don't forget alt text for images and icons

---

## 11. ACCESSIBILITY CHECKLIST

### Before Shipping
- [ ] Text contrast ratio ≥ 4.5:1 for normal text
- [ ] Text contrast ratio ≥ 3:1 for large text
- [ ] All buttons are keyboard accessible
- [ ] Focus ring is visible on interactive elements
- [ ] Forms have labels connected to inputs
- [ ] Error messages are linked to fields
- [ ] Icon-only buttons have aria-labels
- [ ] Active navigation items have aria-current
- [ ] Modals trap focus and have close button
- [ ] Images have descriptive alt text

---

## 12. MIGRATION EXAMPLES

### From Old to New

**Color Variable**
```tsx
// Before
color: '#64748b'

// After
color: tokens.colors.slate[600]
// or use CSS variable
color: var(--text-secondary)
```

**Button Component**
```tsx
// Before
<button className="btn btn-primary">Save</button>

// After
<Button variant="primary">Save</Button>
```

**Form Input**
```tsx
// Before
<input className="form-input" />

// After
<FormInput label="Name" name="name" required />
```

**Spacing**
```tsx
// Before
<div style={{ padding: '16px' }}>

// After
<div className="p-4">  {/* md = 16px */}
```

---

## 13. QUICK COPY-PASTE SNIPPETS

### Button Group
```tsx
<div className="flex gap-3 justify-end">
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Save</Button>
</div>
```

### Form Section
```tsx
<div className="space-y-4">
  <h3 className="text-lg font-semibold text-slate-900">Section Title</h3>
  <FormInput label="Field" name="field" required />
  <FormInput label="Email" name="email" type="email" required />
</div>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Content</Card>
  <Card>Content</Card>
  <Card>Content</Card>
</div>
```

### Alert Message
```tsx
<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
  <p className="text-sm text-amber-900 font-medium">Warning message</p>
</div>
```

### Empty State
```tsx
<div className="py-12 text-center">
  <div className="text-slate-400 mb-3">
    <PackageIcon className="w-12 h-12 mx-auto" />
  </div>
  <h3 className="text-lg font-semibold text-slate-900 mb-1">No items</h3>
  <p className="text-slate-600">Create one to get started</p>
</div>
```

---

## 14. DESIGN TOKEN USAGE IN CODE

### TypeScript
```tsx
import { tokens } from '@/lib/design-tokens';

// Use tokens object
const color = tokens.colors.blue[600];
const shadow = tokens.shadows.lg;
const spacing = tokens.spacing.md;
```

### CSS
```css
/* Use CSS variables */
color: var(--text-primary);
background: var(--bg-secondary);
box-shadow: var(--shadow-md);
padding: var(--spacing-md);
```

### Tailwind (Preferred)
```tsx
<div className="
  bg-blue-600
  text-slate-900
  p-4
  rounded-lg
  shadow-md
">
  Content
</div>
```

---

## 15. FILE STRUCTURE

```
src/
├── lib/
│   ├── design-tokens.ts       ← All token definitions
│   ├── animations.ts          ← Animation presets
│   └── colors.ts              ← Color utilities
├── components/
│   ├── Button.tsx             ← Enhanced button
│   ├── Card.tsx               ← New card component
│   ├── form/
│   │   └── FormInput.tsx       ← Enhanced input
│   └── ...
├── app/
│   ├── globals.css            ← Global styles + tokens
│   ├── tokens.css             ← CSS custom properties
│   └── layout.tsx
└── styles/
    └── animations.css         ← Animation classes
```

---

**Version:** 1.0  
**Last Updated:** July 13, 2026  
**Used by:** Development Team  
**Questions?** Refer to DESIGN_IMPLEMENTATION_GUIDE.md
