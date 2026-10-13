---
name: asset-management-features
description: Build and enhance core asset management features like checkout, checkin, audit logging, and reporting. Use when implementing new asset workflows or fixing bugs.
disable-model-invocation: true
---

# Asset Management Features

## Instructions

### Step 1: Understand Asset Management Core
- **Assets**: Physical items tracked by the system (laptops, furniture, etc.)
- **Checkout**: User takes asset out of inventory
- **Checkin**: User returns asset to inventory
- **Audit Logs**: Track all asset movements and changes
- **Reports**: Analytics on asset status, usage, locations

### Step 2: Asset Model Structure
- Asset has: id, name, category, model, serialNumber, status, location, employee
- Status: AVAILABLE, CHECKED_OUT, MAINTENANCE, RETIRED, MISSING
- Location: office, employee desk, storage, etc.
- Relationships: HasMany checkout history, assignments, attachments

### Step 3: Implement Checkout Flow
1. Validate asset exists and is AVAILABLE
2. Create checkout record with timestamp and user
3. Update asset status to CHECKED_OUT
4. Assign to employee
5. Create audit log entry
6. Send notification (if configured)
7. Return success with checkout details

### Step 4: Implement Checkin Flow
1. Validate asset is CHECKED_OUT
2. Find active checkout record
3. Update checkout with return timestamp and condition notes
4. Update asset status to AVAILABLE
5. Clear employee assignment
6. Create audit log entry
7. Handle damage/maintenance states if reported

### Step 5: Build Audit Logging
- Log all asset changes: checkout, checkin, status updates
- Include: user, action, timestamp, asset, old value, new value
- Use middleware to capture changes automatically
- Create audit trail views for compliance

### Step 6: Create Reporting Features
- Asset utilization report (how many checked out)
- Location distribution report
- Employee asset list
- Overdue returns (checkout > X days)
- Audit trail export
- Damage/maintenance reports

### Step 7: Add QR Code / Barcode Integration
- Generate QR codes linking to asset details
- Print asset tags with QR codes
- Scan with mobile to quick checkout/checkin
- Use `qrcode.react` for generation
- Use phone camera for scanning

### Step 8: Implement Permissions & Workflow
- **VIEW_USER**: Read-only access to own assets
- **USER**: Can checkout/checkin their own assets
- **SUPER_ADMIN**: Full control, can checkout for others, override statuses
- Enforce role-based access in middleware
- Log permission checks for audit trail

### Step 9: Error Handling & Edge Cases
- Asset already checked out by someone else
- Asset in maintenance/retired state
- User trying to checkout more than allowed
- Concurrent checkout attempts
- Return with damage/issues

### Step 10: Testing New Features
- Test checkout/checkin workflows
- Test permission restrictions
- Test audit logging
- Test report generation
- Test QR code scanning
- Test error scenarios

