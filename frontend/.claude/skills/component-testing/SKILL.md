---
name: component-testing
description: Set up and run tests for React components, hooks, and utilities. Use when adding new features or fixing bugs to ensure components work correctly.
---

# Component Testing

## Instructions

### Step 1: Test Framework Setup (if not exists)
- Check if Jest or Vitest is installed (`npm list jest` or `npm list vitest`)
- If missing, ask user which framework to install (Jest recommended for Next.js)
- Set up `jest.config.js` or `vitest.config.ts`
- Configure testing library: `@testing-library/react` and `@testing-library/jest-dom`

### Step 2: Identify Test Needs
- List components/hooks that need tests
- Prioritize: forms, auth flows, critical business logic, hooks
- Determine test types needed: unit, integration, E2E

### Step 3: Write Component Tests
- Test component rendering with default props
- Test user interactions (clicks, form inputs, submissions)
- Test conditional rendering (error states, loading states)
- Test props passing and callbacks

### Step 4: Write Hook Tests
- Use `renderHook` from testing library
- Test hook state changes and side effects
- Test dependencies array behavior
- Test error handling

### Step 5: Write Utility Tests
- Test auth functions (password hashing, token validation)
- Test date/time utilities
- Test permission checks
- Test data formatting functions

### Step 6: Run & Validate Tests
- Run: `npm test` (configure in package.json)
- Aim for >80% coverage on critical paths
- Ensure all tests pass
- Check for console errors/warnings

### Step 7: Integrate into CI/CD
- Add test command to `.github/workflows/` if using GitHub Actions
- Ensure tests run before deployment
- Track coverage metrics over time

