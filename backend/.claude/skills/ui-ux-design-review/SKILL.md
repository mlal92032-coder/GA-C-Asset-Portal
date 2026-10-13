---
name: ui-ux-design-review
description: Review React components for design consistency, Tailwind usage, animations, and visual polish. Use when building or refactoring UI components.
---

# UI/UX Design Review

## Instructions

### Step 1: Component Structure Assessment
- Check if the component follows the project's design patterns (blue/green color scheme)
- Verify Tailwind CSS classes are used consistently
- Look for responsive design (mobile, tablet, desktop)
- Check spacing, padding, and margins alignment

### Step 2: Visual Consistency Check
- Verify colors match the design system (blues: blue-600, blue-700, indigo-800; greens: green-600, green-500)
- Check typography hierarchy (headings, body text, labels)
- Ensure icons from lucide-react are used correctly
- Verify borders, shadows, and rounded corners are consistent

### Step 3: Animation Review
- Check Framer Motion animations for smoothness
- Verify animations don't exceed 0.8-1.0s duration for quick feedback
- Ensure animations enhance UX, not distract
- Check AnimatePresence for proper exit animations

### Step 4: Accessibility & Usability
- Verify form labels are properly connected to inputs
- Check button states (hover, disabled, loading)
- Ensure color contrast meets WCAG standards
- Verify keyboard navigation is possible

### Step 5: Performance Check
- Look for unnecessary re-renders in animations
- Check if heavy computations are memoized
- Verify images are optimized
- Check CSS is not duplicated

### Step 6: Provide Recommendations
- Suggest specific Tailwind classes or component restructuring
- Propose animation improvements if needed
- Recommend accessibility fixes
- List any visual inconsistencies found

