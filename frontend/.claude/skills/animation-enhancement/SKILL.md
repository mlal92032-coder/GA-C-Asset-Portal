---
name: animation-enhancement
description: Improve Framer Motion animations across the app for better UX. Use when enhancing transitions, micro-interactions, or loading states.
---

# Animation Enhancement

## Instructions

### Step 1: Audit Current Animations
- Search for `motion.` components in codebase
- Check existing `framer-motion` usage
- Identify animations in progress indicators, modals, forms
- Note any janky or slow animations

### Step 2: Understand Framer Motion Basics
- `motion.div`, `motion.button`, etc. add animations
- `animate` prop: target values after mount
- `initial` prop: starting state
- `transition` prop: duration, easing, delay
- `whileHover`, `whileTap`: interactive animations
- `AnimatePresence`: handle mount/unmount animations

### Step 3: Common Animation Patterns

**Fade In:**
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
/>
```

**Slide In:**
```typescript
<motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.5 }}
/>
```

**Scale Up:**
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>
```

### Step 4: Enhance UI Elements
- Add fade-in animations to modals and dropdowns
- Add loading spinner animations
- Add button press feedback (scale, shadow)
- Add success/error state transitions
- Add page transitions on route changes

### Step 5: Improve Form Interactions
- Animate error messages appearing
- Animate field focus states
- Add shake animation for validation errors
- Smooth transitions between form steps
- Success checkmark animation on submit

### Step 6: Add Loading & Status Animations
- Pulsing skeleton loaders
- Rotating spinners
- Progress bar animations
- Status badge color transitions
- Toast notification slide-in

### Step 7: Best Practices
- Keep animations under 500ms for quick feedback
- Use `duration: 0.3` for most micro-interactions
- Avoid animating positions; use `x`, `y` transforms instead
- Use `transition={{ type: 'spring' }}` for bouncy effects
- Use `exit` animations in `AnimatePresence` for removals

### Step 8: Test Performance
- Check performance in DevTools
- Ensure animations don't cause layout shifts
- Verify GPU acceleration (use `transform` not `top/left`)
- Test on slower devices
- Check reduced-motion preferences

