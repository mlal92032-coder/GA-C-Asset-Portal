# AGENT TEAM BRIEFING & COORDINATION PROTOCOL
**EAM System - Phase 2 Team Structure**

**Date**: 2026-07-13  
**Status**: Ready for kickoff  
**Orchestrator**: Claude Code (Multi-Agent Orchestrator)  
**Timeline**: 4 weeks starting 2026-07-14  

---

## TEAM STRUCTURE

### 1. FRONTEND AGENT
**Specialization**: React components, pages, forms, Tailwind styling, animations  
**Key Responsibilities**:
- Component development & maintenance
- Page layouts & routing
- Form UI & user interactions
- Responsive design & mobile optimization
- CSS/Tailwind styling
- User feedback (toasts, notifications)

**Primary Phase 2A Tasks**:
- Task 2A.1: Toast System Integration (3 days)
- Task 2A.3: DataTable Integration (2 days)
- Task 2A.5: Mobile UX improvements (Phase 2B)

**Files They Own**:
```
src/components/ *.tsx
src/app/ *.tsx (pages, layouts)
src/styles/ *.css
src/hooks/ (ui-related)
```

**Mandatory Checks Before Code Review**:
- [ ] All components have fully typed props (no implicit any)
- [ ] No hardcoded strings (use constants or i18n)
- [ ] Error states explicitly handled
- [ ] Loading states shown
- [ ] Mobile breakpoints tested
- [ ] Dark mode tested
- [ ] Accessibility considered (keyboard nav, focus states)
- [ ] No console errors or warnings
- [ ] TypeScript strict mode passes

**Code Review Template**:
```markdown
## Component: [ComponentName]

### Props
- [ ] All props typed
- [ ] Default values provided
- [ ] PropTypes validate shape

### States
- [ ] State initialized correctly
- [ ] No unnecessary re-renders
- [ ] useEffect dependencies correct

### Styling
- [ ] Tailwind classes used (no inline styles except gradients)
- [ ] Responsive breakpoints working
- [ ] Dark mode colors applied
- [ ] Z-index managed globally

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus visible
- [ ] ARIA labels present
- [ ] Color contrast ≥4.5:1
```

---

### 2. BACKEND AGENT
**Specialization**: API routes, database queries, validation, business logic  
**Key Responsibilities**:
- API route implementation
- Zod validation schemas
- Prisma database queries
- Response formatting & error handling
- Pagination & filtering
- Performance optimization

**Primary Phase 2A Tasks**:
- Task 2A.2: Form Validation Schema Centralization (5 days)
- Task 2A.4: Asset Transfer API (4 days)
- Task 2A.5: Security hardening (3 days)

**Files They Own**:
```
src/app/api/ *.ts
src/lib/validation/ *.ts
src/lib/prisma.ts
src/lib/auth-options.ts
src/types/ *.ts
prisma/schema.prisma
```

**Mandatory Checks Before Code Review**:
- [ ] Session auth on every endpoint (`getServerSession`)
- [ ] Zod validation on all inputs
- [ ] Prisma singleton imported from `@/lib/prisma`
- [ ] AuditLog created for CREATE/UPDATE/DELETE
- [ ] Response format matches standard structure
- [ ] No passwords in responses
- [ ] Error messages user-friendly
- [ ] Pagination implemented correctly
- [ ] No N+1 queries (use include/select)
- [ ] Database relationships correct
- [ ] TypeScript strict mode passes
- [ ] ESLint passes

**Code Review Template**:
```markdown
## API Route: [METHOD] /api/[route]

### Authentication
- [ ] getServerSession called
- [ ] Session validated
- [ ] Error response 401

### Authorization
- [ ] Permissions checked
- [ ] Error response 403
- [ ] User/org boundaries enforced

### Validation
- [ ] Zod schema defined in `/src/lib/validation/`
- [ ] safeParse used (not parse)
- [ ] Error response includes field details

### Database
- [ ] Prisma queries optimized
- [ ] No N+1 patterns
- [ ] Proper relationships used
- [ ] Cascading deletes correct

### Response Format
- [ ] Follows standard structure
- [ ] Pagination implemented
- [ ] Error object formatted
- [ ] Timestamp included

### Audit Logging
- [ ] AuditLog.create called
- [ ] All fields populated
- [ ] Before/after values tracked

### Testing
- [ ] Unit test for logic
- [ ] Integration test with auth
- [ ] Edge cases handled
- [ ] Test passes
```

---

### 3. SECURITY AGENT
**Specialization**: Authentication, authorization, audit logging, rate limiting, compliance  
**Key Responsibilities**:
- Security audit & vulnerability assessment
- Authentication & authorization implementation
- Rate limiting & DDoS protection
- Audit logging & compliance tracking
- Security header management
- Incident response procedures

**Primary Phase 2A Tasks**:
- Task 2A.1: Toast integration (ensure error messages safe)
- Task 2A.2: Schema validation (ensure strict)
- Task 2A.5: Security hardening (3 days)

**Files They Own**:
```
src/middleware.ts
src/lib/auth-options.ts
src/lib/permissions.ts
prisma/schema.prisma (AuditLog model)
```

**Mandatory Checks**:
- [ ] No sensitive data in logs
- [ ] Rate limiting configured
- [ ] Security headers present
- [ ] CSRF tokens implemented
- [ ] XSS protection enabled
- [ ] SQL injection prevention verified
- [ ] Authentication flows secure
- [ ] Permission boundaries enforced
- [ ] Compliance requirements met

**Security Review Checklist**:
```markdown
## Security Review

### Authentication
- [ ] NextAuth configured correctly
- [ ] Session timeout enforced
- [ ] Password hashing (bcryptjs)
- [ ] JWT secrets secure

### Authorization
- [ ] RBAC implemented
- [ ] Permission checks on all endpoints
- [ ] No privilege escalation paths
- [ ] Org boundaries enforced

### Data Protection
- [ ] No PII in logs
- [ ] Passwords never returned
- [ ] Sensitive fields encrypted
- [ ] Data retention policy enforced

### Network Security
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] Security headers present

### Audit & Compliance
- [ ] All mutations logged
- [ ] User actions tracked
- [ ] Retention policy enforced
- [ ] Audit trail immutable

### Vulnerability Testing
- [ ] SQL injection attempts blocked
- [ ] XSS payloads escaped
- [ ] CSRF tokens validated
- [ ] File upload restrictions enforced
```

---

### 4. TESTING AGENT
**Specialization**: Jest tests, component testing, accessibility, E2E scenarios  
**Key Responsibilities**:
- Unit test creation & maintenance
- Integration test scenarios
- Component testing with React Testing Library
- Accessibility testing (WCAG compliance)
- Performance testing
- Test coverage monitoring

**Primary Phase 2A Tasks**:
- Supporting all other agents with test planning
- Phase 2C: Comprehensive testing (5 days)

**Files They Own**:
```
src/__tests__/ *.test.ts(x)
jest.config.js
src/setupTests.ts
```

**Test Requirements**:
- [ ] >80% line coverage
- [ ] All critical paths tested
- [ ] No flaky tests
- [ ] Accessibility tests pass
- [ ] Performance within targets
- [ ] E2E flows validated

**Test Types to Write**:

1. **Unit Tests** (for utilities, schemas, business logic)
```typescript
describe('createFurnitureSchema', () => {
  it('validates valid furniture data', () => {
    const valid = { /* valid data */ };
    expect(createFurnitureSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid data', () => {
    const invalid = { /* invalid data */ };
    expect(createFurnitureSchema.safeParse(invalid).success).toBe(false);
  });
});
```

2. **Component Tests** (React Testing Library)
```typescript
describe('Toast Component', () => {
  it('renders toast message', () => {
    render(<Toast message="Test" type="success" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('closes on button click', () => {
    const onClose = jest.fn();
    render(<Toast message="Test" type="success" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalled();
  });
});
```

3. **API Route Tests**
```typescript
describe('POST /api/furniture', () => {
  it('creates furniture with valid data', async () => {
    const response = await fetch('/api/furniture', {
      method: 'POST',
      body: JSON.stringify({ /* valid */ }),
    });
    expect(response.status).toBe(201);
  });

  it('rejects invalid data', async () => {
    const response = await fetch('/api/furniture', {
      method: 'POST',
      body: JSON.stringify({ /* invalid */ }),
    });
    expect(response.status).toBe(400);
  });

  it('requires authentication', async () => {
    const response = await fetch('/api/furniture', {
      method: 'POST',
      body: JSON.stringify({ /* data */ }),
    });
    expect(response.status).toBe(401);
  });
});
```

4. **Accessibility Tests** (jest-axe)
```typescript
describe('Modal Accessibility', () => {
  it('passes accessibility tests', async () => {
    const { container } = render(<Modal isOpen={true} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('trap focus in modal', () => {
    render(<Modal isOpen={true} />);
    const firstButton = screen.getAllByRole('button')[0];
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);
  });
});
```

---

### 5. ASSET AGENT
**Specialization**: Asset CRUD, checkout/checkin, depreciation, lifecycle workflows  
**Key Responsibilities**:
- Asset management features
- Checkout/checkin workflows
- Depreciation calculations
- Asset transfer logic
- Maintenance scheduling
- Asset lifecycle tracking

**Primary Phase 2A Tasks**:
- Task 2A.1: Toast feedback for asset operations (support)
- Task 2A.4: Asset Transfer feature (4 days)
- Task 2A.5: Workflow testing (support)

**Files They Own**:
```
src/app/api/assets/ *.ts
src/app/api/checkout/ *.ts
src/app/api/maintenance/ *.ts
src/lib/depreciation/ *.ts
src/components/*Asset*.tsx
```

**Workflow Requirements**:
- [ ] Asset creation → no errors
- [ ] Asset update → audit log created
- [ ] Asset deletion → soft delete preserved
- [ ] Checkout flow → state machine enforced
- [ ] Checkin flow → condition captured
- [ ] Transfer flow → audit trail maintained
- [ ] Notifications sent to relevant users
- [ ] Data consistency maintained

**Depreciation Calculations**:
```typescript
// Straight-line
depreciationPerYear = (purchasePrice - salvageValue) / usefulLifeYears

// Declining Balance
depreciationPerYear = bookValue * (2 / usefulLifeYears)
```

---

### 6. ANALYTICS AGENT
**Specialization**: Dashboard analytics, reporting, data visualization  
**Key Responsibilities**:
- Analytics endpoint design
- Dashboard metric calculation
- Report generation
- Data visualization
- CSV/PDF export
- Trend analysis

**Primary Phase 2B Tasks**:
- Task 2B.4: Advanced Analytics (5 days, Phase 2B)

**Files They Own**:
```
src/app/api/analytics/ *.ts
src/components/AdvancedAnalytics.tsx
src/lib/analytics/ *.ts
src/app/dashboard/ *.tsx
```

**Metrics to Calculate**:
- Total assets by type
- Asset utilization rate
- Depreciation schedule
- Maintenance costs
- Budget variance
- Asset lifecycle distribution
- ROI by asset type

---

## COORDINATION PROTOCOL

### Daily Standup (Async)
**When**: End of day (6 PM UTC)  
**Format**: Slack message or status update  
**Required**:
1. What was completed today
2. What's blocked (if anything)
3. What's starting tomorrow

**Example**:
```
✅ COMPLETED:
- Toast hook implemented & tested
- Integrated into 2/3 modals

⚠️ BLOCKED:
- Waiting on response format clarification

📅 TOMORROW:
- Integrate toast into 3 asset pages
- Start DataTable refactoring
```

### Hand-off Protocol

**When Code is Ready**:

**BACKEND AGENT → FRONTEND AGENT**
```markdown
## HAND-OFF: Form Validation Schemas

### What's Ready
- ✅ All schemas in /src/lib/validation/
- ✅ TypeScript types exported
- ✅ API routes updated

### For Frontend Agent
1. Schemas are: createFurnitureSchema, updateFurnitureSchema, etc.
2. Import: import { createFurnitureSchema } from '@/lib/validation'
3. Can now use in components for client-side validation
4. Example: `schema.safeParse(formData)`

### Questions? Contact me at:
[Slack/email]
```

**FRONTEND AGENT → TESTING AGENT**
```markdown
## HAND-OFF: Toast System Implementation

### What's Complete
- ✅ useToast hook created
- ✅ ToastProvider component
- ✅ Integrated into 6 files (3 modals + 3 pages)

### For Testing Agent
1. Test the hook: `/src/hooks/__tests__/useToast.test.ts`
2. Test the component: `/src/components/__tests__/Toast.test.tsx`
3. Test integration: `/src/__tests__/e2e/toast-integration.test.tsx`

### Critical Paths to Test
- Create asset → success toast
- Invalid form → error toast
- Multiple operations → stack correctly
- Close button → dismisses toast
- Auto-dismiss → removes after 4s

### Questions? Contact me at:
[Slack/email]
```

**SECURITY AGENT → ALL AGENTS**
```markdown
## SECURITY AUDIT: Phase 2A Code

### Issues Found: 2
1. ❌ POST /api/assets/transfer missing rate limit middleware
   - Fix: Add to middleware.ts
   - Severity: MEDIUM

2. ⚠️ Error message leaks database field names
   - Fix: Use generic "Validation failed" message
   - Severity: LOW

### Approved: 3
✅ Authentication checks on all routes
✅ Zod validation complete
✅ AuditLog entries created

### Please Address Before Merge
[Link to PR comments]
```

### Escalation Protocol

**Issue Severity Levels**:

**P1 - CRITICAL** (fixes blocker for others):
- Notify: All team, Orchestrator
- Response: Immediate (15 min)
- Example: Build broken, blocking all tests

**P2 - HIGH** (impacts schedule):
- Notify: Relevant agents, Orchestrator
- Response: Within 1 hour
- Example: API response format wrong, Frontend can't use

**P3 - MEDIUM** (nice-to-fix):
- Notify: Relevant agent only
- Response: Within 4 hours
- Example: CSS spacing off by 2px, security best practice

**P4 - LOW** (documentation/polish):
- No urgent response needed
- Example: Comment typo, nice-to-have optimization

### Decision Making

**By Role** (in order of authority):
1. **Technical Lead**: Architecture, tech stack decisions
2. **Orchestrator**: Feature scope, timeline, priorities
3. **Relevant Agent**: Implementation approach
4. **Team**: Process improvements

**Escalation Path**:
```
Disagreement between agents
  ↓
Try consensus (15 min)
  ↓
Escalate to Orchestrator
  ↓
Orchestrator decides (5 min)
  ↓
Decision recorded
```

---

## PHASE 2A AGENT SCHEDULE

```
Week 1 (July 14-18):
┌─────────────────────────────────────────┐
│ MON 7/14  │ TUE 7/15  │ WED 7/16  │...  │
├─────────────────────────────────────────┤
│ FRONTEND  │ FRONTEND  │ FRONTEND  │     │ Task 2A.1: Toast
│ + support from TESTING
│
│ BACKEND (prep Day 2)  │ BACKEND   │...  │ Task 2A.2: Validation
│
│ SECURITY (prep Day 5)                  │ Task 2A.5: Hardening
└─────────────────────────────────────────┘

Week 2 (July 21-25):
┌─────────────────────────────────────────┐
│ MON 7/21  │ TUE 7/22  │ WED 7/23  │...  │
├─────────────────────────────────────────┤
│           │ FRONTEND  │ FRONTEND  │...  │ Task 2A.3: DataTable
│
│ ASSET     │ ASSET     │ ASSET     │...  │ Task 2A.4: Transfer
│ + BACKEND │ + BACKEND │ + BACKEND │
│
│ SECURITY  │ SECURITY  │ SECURITY  │     │ Task 2A.5: Hardening
│ + ALL                                  │
│
│ TESTING (all)                           │ Support + Start 2A tests
└─────────────────────────────────────────┘
```

---

## DEPENDENCIES & BLOCKED STATES

### Forward Dependencies (What you need to start)
```
Task 2A.1 (Toast) ─→ Nothing (start immediately)
Task 2A.2 (Validation) ─→ Nothing (start immediately)
Task 2A.3 (DataTable) ─→ Nothing (can start but Toast finishes first)
Task 2A.4 (Transfer) ─→ Task 2A.2 (need Validation schemas)
Task 2A.5 (Security) ─→ Nothing (start mid-way through)
```

### Backward Dependencies (What depends on you)
```
Task 2A.1 (Toast) ←─ All feedback flows, modals, CRUD pages
Task 2A.2 (Validation) ←─ Task 2A.4 (Transfer), Phase 2B forms
Task 2A.3 (DataTable) ←─ Phase 2B analytics (uses same component)
Task 2A.4 (Transfer) ←─ Phase 2B bulk operations (need transfer logic)
Task 2A.5 (Security) ←─ All API endpoints (need rate limiting)
```

---

## QUALITY GATES

### Before Any Code Merge

**Mandatory**:
- [ ] TypeScript compiles without errors
- [ ] ESLint passes (0 errors)
- [ ] All tests pass
- [ ] Code review approved by 1 senior agent

**For APIs**:
- [ ] Auth check implemented
- [ ] Validation with Zod
- [ ] AuditLog created (if mutation)
- [ ] Response format matches standard
- [ ] No passwords in response

**For Components**:
- [ ] All props typed
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Mobile responsive
- [ ] Accessibility checklist passed

**For Tests**:
- [ ] >80% coverage for new code
- [ ] All edge cases tested
- [ ] No flaky tests
- [ ] Accessibility tests pass

### Code Review Checklist Template

```markdown
## Code Review: [Task Name]

### ✅ APPROVED
- [ ] Functionality works as designed
- [ ] No regressions detected
- [ ] Code quality good
- [ ] Tests comprehensive
- [ ] Security review passed

### ⚠️ CHANGES REQUESTED
1. [Issue description]
   - [ ] Frontend Agent: Component props need types
   - **Severity**: MEDIUM
   - **Guidance**: Use `interface Props { ... }` instead of implicit any

2. [Issue description]
   - [ ] Backend Agent: Missing AuditLog creation
   - **Severity**: HIGH
   - **Guidance**: Add after database.update() call

### 🚀 READY TO MERGE
Once issues above resolved, this is approved to merge to main.

**Approved By**: [Agent Name]  
**Date**: 2026-07-XX  
**Notes**: Great work on the implementation!
```

---

## COMMUNICATION CHANNELS

### For Coordination
- **Slack**: #eam-phase2-team
- **Email**: software.sub@sef.org.pk (escalations only)

### For Code
- **GitHub**: Pull requests, code review
- **Merge Strategy**: Squash + merge to main

### For Documentation
- **GitHub Wiki**: Architecture, design decisions
- **Project Root**: README.md, PHASE_2_*.md files

### For Issues
- **GitHub Issues**: Bugs, feature requests
- **Labels**: 
  - `bug` (critical)
  - `enhancement` (nice-to-have)
  - `phase-2a` (Phase 2A task)
  - `blocked` (waiting on something)
  - `security` (security-related)

---

## AGENT SPECIALIZATION GUIDE

### When to Ask Another Agent

**FRONTEND ASKS BACKEND**:
- "What does the API return for X?"
- "Can the API support Y filtering?"
- "Performance target for Z query?"

**BACKEND ASKS FRONTEND**:
- "Where would this form go in the UI?"
- "Can we display X on the page?"
- "Should the error message say Y?"

**SECURITY ASKS ALL**:
- "Can you review this for security?"
- "Is this data exposure a risk?"
- "Should we rate limit this endpoint?"

**TESTING ASKS EVERYONE**:
- "What are the critical paths for X?"
- "What edge cases should we test?"
- "How should error Y be handled?"

**ASSET ASKS BACKEND**:
- "How do I query assets with status Y?"
- "Should transfers cascade on delete?"

**ANALYTICS ASKS BACKEND**:
- "Can you create an index for metric X?"
- "Performance target for dashboard load?"

---

## SUCCESS METRICS

### Phase 2A Completion Criteria

**By Feature**:
1. ✅ Toast System: All modals show feedback
2. ✅ Validation Schemas: No duplicate logic
3. ✅ DataTable: Furniture page uses component
4. ✅ Asset Transfer: Full workflow end-to-end
5. ✅ Security Hardening: Rate limiting active

**By Quality**:
- ✅ 80%+ test coverage
- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors
- ✅ <3s page load time
- ✅ <200ms API response time

**By Team**:
- ✅ No blocked threads >4 hours
- ✅ All code reviews completed within 24h
- ✅ All team members shipped code
- ✅ Zero security incidents
- ✅ <5 regressions in production

---

## AGENT RESOURCES

### Documentation to Read
1. **Architecture**: `/ORCHESTRATION_MASTER_PLAN.md` - Full context
2. **Execution**: `/PHASE_2_EXECUTION_PLAN.md` - Detailed tasks
3. **Patterns**: `/AGENT_QUICK_START.md` - Code patterns
4. **Database**: `/prisma/schema.prisma` - Data models
5. **Types**: `/src/types/` - TypeScript type definitions

### Tools Available
- **Git**: Version control (`git log`, `git diff`, etc.)
- **TypeScript**: Type checking (`tsc --noEmit`)
- **Jest**: Testing (`npm test`)
- **ESLint**: Linting (`npm run lint`)
- **Prisma**: Database tools (`npx prisma studio`)

### Getting Help
1. Check documentation first
2. Ask related agent
3. Post in #eam-phase2-team Slack
4. Escalate to Orchestrator if blocked >30 min

---

## KICKOFF CHECKLIST

**Before Starting Phase 2A:**

- [ ] Read ORCHESTRATION_MASTER_PLAN.md
- [ ] Read PHASE_2_EXECUTION_PLAN.md (your tasks)
- [ ] Read this Agent Team Briefing
- [ ] Review current codebase structure
- [ ] Understand database schema
- [ ] Set up local dev environment
- [ ] Run existing tests (`npm test`)
- [ ] Build project successfully (`npm run build`)
- [ ] Create feature branch
- [ ] Assign yourself to relevant GitHub issues
- [ ] Join #eam-phase2-team Slack channel
- [ ] Introduce yourself to team

**First Task**:
1. FRONTEND: Start Task 2A.1 (Toast System)
2. BACKEND: Start Task 2A.2 (Validation Schemas)
3. SECURITY: Prep for Task 2A.5 (Security Hardening)
4. TESTING: Set up test infrastructure
5. ASSET: Prepare Task 2A.4 (Asset Transfer)

---

## FINAL NOTES

### Core Principles
1. **Async First**: Assume team is not available, communicate clearly
2. **Tests First**: Write tests before code when possible
3. **Security Always**: Never skip security checks
4. **Quality Over Speed**: One day late is better than buggy
5. **Help Others**: Unblock teammates even if not your task

### Red Flags to Report Immediately
- Security vulnerability discovered
- Build broken (can't compile)
- Test suite failing >5 tests
- Blocker preventing others from working
- Scope creep on task
- Burnout/capacity issues

### Green Flags You're Doing It Right
- Code review has 1-2 small comments
- Tests all pass first try
- Teammates thank you for helping
- Feature works as expected
- No emergencies

---

**Document Version**: 1.0  
**Status**: ACTIVE (Ready for implementation)  
**Last Updated**: 2026-07-13  
**Next Review**: 2026-07-25 (Phase 2A completion)

**Let's build something great!** 🚀
