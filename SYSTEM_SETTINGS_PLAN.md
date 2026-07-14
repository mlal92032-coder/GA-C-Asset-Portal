# 🏢 ASSET MANAGEMENT SYSTEM - COMPLETE SETTINGS ARCHITECTURE

**Organization Level: Sindh Education Foundation (SEF)**

---

## 📋 CURRENT STATE ANALYSIS

### ✅ What Exists:
1. **Admin Settings** - Only navigation page (8 categories link to non-functional sub-pages)
2. **User Settings** - Exists but limited functionality
3. **Database Models** - 50+ tables (Furniture, Electronics, Vehicles, Users, Companies, Locations, Manufacturers, etc.)
4. **APIs** - 55+ endpoints already built
5. **Auth System** - JWT-based with 3 roles (SUPER_ADMIN, USER, VIEW_USER)

### ❌ What's Missing:
1. **Unified Settings Database** - No SystemSettings or AppSettings model
2. **Functional Admin Settings Pages** - All 8 categories are empty
3. **Security Configuration** - No centralized security settings
4. **Audit Trail for Settings** - No logging of who changed what
5. **Settings API Endpoints** - No /api/settings/* endpoints

---

## 🎯 PROPOSED UNIFIED SETTINGS SYSTEM

### MERGE STRATEGY:
**One Unified Settings Page** → User access based on role
- **SUPER_ADMIN**: Full access to ALL settings
- **USER**: Access to Department/Personal settings only
- **VIEW_USER**: Read-only access to relevant settings

---

## 📊 COMPLETE SETTINGS STRUCTURE

### **1. SYSTEM SETTINGS** (SUPER_ADMIN ONLY)
```
├── Organization Info
│   ├── Organization Name (Sindh Education Foundation)
│   ├── Organization Logo/Banner
│   ├── Organization Address
│   ├── Contact Email
│   ├── Support Phone
│   ├── Website URL
│   └── Registration Number
│
├── Branding & Display
│   ├── Application Title
│   ├── Primary Color Theme
│   ├── Secondary Color Theme
│   ├── Logo URL
│   ├── Favicon URL
│   ├── Dashboard Background Image
│   └── Login Page Banner
│
├── Regional Settings
│   ├── Country
│   ├── Timezone (Asia/Karachi)
│   ├── Date Format (DD/MM/YYYY, MM/DD/YYYY)
│   ├── Currency (PKR)
│   ├── Language (Urdu, English)
│   └── Number Format
│
├── Asset Management Defaults
│   ├── Default Depreciation Method (Straight-line, Declining Balance)
│   ├── Default Useful Life (Years)
│   ├── Auto-generate Asset Tags (Yes/No)
│   ├── Asset Tag Prefix (SEF-)
│   ├── Asset Tag Format
│   ├── Stock Reorder Level
│   └── Default Asset Condition
│
├── System Performance
│   ├── Items Per Page (10, 25, 50, 100)
│   ├── Max Upload File Size (MB)
│   ├── Enable Bulk Operations
│   ├── Enable QR Codes
│   ├── Enable Barcodes
│   └── Enable CSV Export
```

### **2. SECURITY & ACCESS CONTROL** (SUPER_ADMIN ONLY)
```
├── Authentication Settings
│   ├── Session Timeout (minutes)
│   ├── Max Login Attempts
│   ├── Lockout Duration (minutes)
│   ├── Require 2FA (Yes/No)
│   ├── Allow Social Login
│   ├── Password Expiry Days
│   ├── Minimum Password Length
│   ├── Password Complexity Rules
│   └── Remember Device Duration
│
├── Role Management
│   ├── SUPER_ADMIN Permissions (fixed, view only)
│   ├── USER Permissions (customize per module)
│   │   ├── Dashboard: view
│   │   ├── Furniture: create, read, update, delete, checkout, checkin
│   │   ├── Electronics: create, read, update, delete, checkout, checkin
│   │   ├── Vehicles: create, read, update, delete, manage
│   │   ├── Locations: create, read, update, delete
│   │   ├── Companies: create, read, update, delete
│   │   ├── Manufacturers: create, read, update, delete
│   │   ├── Users: read only OR manage (if admin)
│   │   ├── Audit Logs: read only
│   │   ├── Reports: view, export
│   │   └── Settings: read own settings
│   └── VIEW_USER Permissions (fixed, read-only)
│       └── All modules: view only
│
├── Data Privacy
│   ├── GDPR Compliance Mode
│   ├── Data Retention Period (years)
│   ├── Auto-delete Old Records
│   ├── Encryption for Sensitive Fields
│   ├── API Key Rotation Interval
│   └── Backup Encryption
│
├── Audit & Logging
│   ├── Enable Audit Logging (Yes/No)
│   ├── Log Retention Days
│   ├── Log Sensitive Actions Only (Yes/No)
│   ├── Alert on Failed Login Attempts
│   ├── Alert on Bulk Operations
│   └── Alert on Permission Changes
│
├── IP Whitelist
│   ├── Enable IP Restriction
│   ├── Allowed IP Addresses (list)
│   └── Admin IP Override
```

### **3. ORGANIZATION STRUCTURE** (SUPER_ADMIN + DEPARTMENT HEADS)
```
├── Companies/Offices
│   ├── List all companies
│   ├── Add/Edit/Delete Company
│   ├── Company Head Assignment
│   ├── Budget Allocation
│   └── Phone/Email/Address
│
├── Departments
│   ├── Create Departments
│   ├── Assign Department Head
│   ├── Assign Employees to Department
│   ├── Department Budget
│   └── Department Asset Allocation
│
├── Locations/Rooms
│   ├── Building/Floor/Room Structure
│   ├── Room Types (Hall, Community Room, Office, etc.)
│   ├── Capacity Information
│   ├── Equipment in Room
│   └── Maintenance Schedule per Location
│
├── Teams
│   ├── Create/Manage Teams
│   ├── Team Lead Assignment
│   ├── Team Permissions
│   └── Cross-functional Teams
```

### **4. ASSET STRUCTURE** (SUPER_ADMIN + INVENTORY MANAGER)
```
├── Asset Categories
│   ├── Furniture Types (Chair, Table, Cabinet, etc.)
│   ├── Electronics Types (Laptop, Monitor, Printer, etc.)
│   ├── Vehicle Types (Car, Bike, Bus, etc.)
│   └── Custom Categories
│
├── Asset Models/Variants
│   ├── Add Model for each type
│   ├── Specifications (color, size, material)
│   ├── Default Price
│   └── Depreciation Schedule
│
├── Manufacturers
│   ├── Add/Edit Manufacturers
│   ├── Contact Information
│   ├── Warranty Support Email
│   └── Support Phone
│
├── Condition Status
│   ├── Good
│   ├── Repair Needed
│   ├── Damaged
│   ├── Custom Status (define if needed)
│   └── Depreciation Factor per Status
│
├── Asset Status Labels
│   ├── In Use
│   ├── In Storage
│   ├── Disposed
│   ├── Auction
│   └── Custom Status
```

### **5. USER & TEAM MANAGEMENT** (SUPER_ADMIN + HR MANAGER)
```
├── User Management
│   ├── Create/Edit/Delete Users
│   ├── Bulk Upload Users (CSV)
│   ├── Assign Roles
│   ├── Assign Department
│   ├── Assign Teams
│   ├── Deactivate/Activate Users
│   ├── Reset Password
│   ├── View User Activity Log
│   └── Export User List
│
├── User Permissions
│   ├── Per-User Module Access
│   ├── Per-User Asset Type Access
│   ├── Per-Department Access
│   ├── Per-Location Access
│   ├── Override Global Permissions
│   └── Schedule Access (time-based)
│
├── Employee Directory
│   ├── List All Employees
│   ├── Employee Profile (Name, Email, Phone, Dept, Designation)
│   ├── Employee Photo
│   ├── Employee Permissions Summary
│   └── Contact History
```

### **6. NOTIFICATIONS & ALERTS** (ALL USERS can customize their own)
```
├── Email Notifications
│   ├── Enable/Disable Email Alerts
│   ├── Alert Email Address
│   ├── Frequency (Real-time, Daily Digest, Weekly)
│   ├── Notification Types:
│   │   ├── New Asset Added
│   │   ├── Asset Checkout
│   │   ├── Asset Checkin
│   │   ├── Maintenance Due
│   │   ├── Warranty Expiring
│   │   ├── Asset Disposal
│   │   ├── System Alerts
│   │   └── Approval Requests
│   └── Alert Recipient Groups
│
├── In-App Notifications
│   ├── Sound Alerts (Bell sound enabled ✓)
│   ├── Desktop Notifications
│   ├── Notification Retention (days)
│   └── Auto-delete Old Notifications
│
├── Alert Thresholds
│   ├── Maintenance Alert Days Before Due
│   ├── Warranty Alert Days Before Expiry
│   ├── Stock Level Alert
│   ├── Budget Variance Alert (%)
│   └── Checkout Overdue Alert Days
│
├── Webhook Integrations
│   ├── Enable Webhooks
│   ├── Webhook URLs
│   ├── Events to Send
│   ├── Retry Policy
│   └── Webhook Logs
```

### **7. REPORTS & ANALYTICS** (SUPER_ADMIN + MANAGERS)
```
├── Report Configuration
│   ├── Available Reports:
│   │   ├── Asset Inventory Report
│   │   ├── Asset Depreciation Report
│   │   ├── User Activity Report
│   │   ├── Checkout/Checkin Report
│   │   ├── Maintenance Report
│   │   ├── Budget Report
│   │   ├── Asset Condition Report
│   │   ├── Location-wise Asset Report
│   │   └── Department-wise Asset Report
│   ├── Report Schedule (Daily, Weekly, Monthly)
│   ├── Report Format (PDF, Excel, CSV)
│   ├── Report Recipients
│   └── Data Range (Last 30, 60, 90, 365 days)
│
├── Dashboard Customization
│   ├── Widget Selection
│   ├── Widget Order
│   ├── Chart Types
│   └── Refresh Interval
│
├── Export Settings
│   ├── Default Export Format
│   ├── Include Sensitive Data
│   ├── Encryption for Export
│   └── Retention Period for Exports
```

### **8. MAINTENANCE & SYSTEM** (SUPER_ADMIN ONLY)
```
├── Database Management
│   ├── Database Size
│   ├── Last Backup Date
│   ├── Backup Frequency (Daily, Weekly)
│   ├── Backup Retention (days)
│   ├── Automatic Backup Enable/Disable
│   ├── Manual Backup Now
│   ├── Restore From Backup
│   └── Database Optimization
│
├── File Management
│   ├── Total Uploaded Files
│   ├── Storage Used (MB/GB)
│   ├── Storage Quota
│   ├── Clean Orphaned Files
│   ├── Accepted File Types
│   ├── Max File Size
│   └── File Retention Policy
│
├── System Health
│   ├── Server Status
│   ├── Database Status
│   ├── API Response Time
│   ├── Error Rate
│   ├── Active Users Count
│   └── System Uptime %
│
├── Maintenance Tasks
│   ├── Schedule Maintenance Window
│   ├── Enable Maintenance Mode
│   ├── Clear Cache
│   ├── Rebuild Search Index
│   ├── Verify Data Integrity
│   └── Clean Logs (older than X days)
│
├── API & Integration
│   ├── API Version
│   ├── API Rate Limiting (requests/minute)
│   ├── API Key Management
│   ├── Third-party Integrations
│   ├── Webhook Configuration
│   └── API Documentation Link
```

### **9. PERSONAL SETTINGS** (ALL USERS)
```
├── Profile Information
│   ├── Full Name
│   ├── Email Address
│   ├── Phone Number
│   ├── Designation
│   ├── Department
│   ├── Profile Photo
│   └── Bio/Signature
│
├── Account Security
│   ├── Current Password
│   ├── Change Password
│   ├── Two-Factor Authentication Setup
│   ├── Active Sessions List
│   ├── Logout All Other Sessions
│   └── Account Activity Log
│
├── Preferences
│   ├── Theme (Light/Dark)
│   ├── Language
│   ├── Timezone
│   ├── Date Format
│   ├── Items Per Page
│   └── Auto-save Drafts
│
├── Notifications (Personal)
│   ├── Email Notifications Preference
│   ├── Sound Alerts
│   ├── Notification Types to Receive
│   └── Quiet Hours (Do Not Disturb)
│
├── API Tokens (if applicable)
│   ├── Generate API Token
│   ├── API Token History
│   ├── Revoke Tokens
│   └── Token Permissions
```

---

## 🗄️ DATABASE MODELS NEEDED

### 1. **SystemSettings**
```typescript
{
  id: string
  // System Info
  organizationName: string
  organizationLogo: string
  timezone: string
  dateFormat: string
  currency: string
  language: string
  
  // Asset Defaults
  assetTagPrefix: string
  defaultDepreciationMethod: string
  autoGenerateAssetTags: boolean
  
  // Performance
  itemsPerPage: number
  enableQRCodes: boolean
  enableBarcodes: boolean
  
  createdAt: DateTime
  updatedAt: DateTime
  updatedBy: string (userId)
}
```

### 2. **SecuritySettings**
```typescript
{
  id: string
  organizationId?: string
  
  // Authentication
  sessionTimeoutMinutes: number
  maxLoginAttempts: number
  lockoutDurationMinutes: number
  require2FA: boolean
  passwordExpiryDays: number
  minPasswordLength: number
  
  // Audit
  enableAuditLogging: boolean
  logRetentionDays: number
  
  // IP Whitelist
  enableIPRestriction: boolean
  allowedIPs: string[] // JSON array
  
  createdAt: DateTime
  updatedAt: DateTime
  updatedBy: string
}
```

### 3. **NotificationPreferences**
```typescript
{
  id: string
  userId: string (or null for system-wide)
  
  // Email Settings
  emailNotificationsEnabled: boolean
  emailAddress: string
  emailFrequency: 'REALTIME' | 'DAILY' | 'WEEKLY'
  
  // In-App Settings
  inAppNotificationsEnabled: boolean
  soundEnabled: boolean
  desktopNotificationsEnabled: boolean
  
  // Alert Types (bitmap or JSON)
  alertTypes: {
    assetAdded: boolean
    assetCheckout: boolean
    assetCheckin: boolean
    maintenanceDue: boolean
    warrantyExpiring: boolean
    approvalRequests: boolean
    systemAlerts: boolean
  }
  
  // Thresholds
  maintenanceAlertDays: number
  warrantyAlertDays: number
  overdueCheckoutDays: number
  
  // Quiet Hours
  quietHoursEnabled: boolean
  quietHoursStart: string // "18:00"
  quietHoursEnd: string   // "09:00"
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 4. **SettingsAuditLog** (Track all changes)
```typescript
{
  id: string
  userId: string
  settingCategory: string
  fieldName: string
  oldValue: string
  newValue: string
  changeReason?: string
  createdAt: DateTime
}
```

### 5. **UserPermissionOverrides** (Per-user custom permissions)
```typescript
{
  id: string
  userId: string
  module: string (dashboard, furniture, electronics, vehicles, etc.)
  action: 'view' | 'create' | 'edit' | 'delete' | 'checkout' | 'checkin' | 'export' | 'import'
  allowed: boolean
  validFrom: DateTime
  validUntil?: DateTime
  reason?: string
  appliedBy: string (admin userId)
  createdAt: DateTime
}
```

---

## 🔌 API ENDPOINTS NEEDED

### Settings Management
```
GET    /api/settings/system              → Get system settings
PUT    /api/settings/system              → Update system settings
GET    /api/settings/security            → Get security settings
PUT    /api/settings/security            → Update security settings
GET    /api/settings/notifications       → Get notification settings
PUT    /api/settings/notifications       → Update notification settings
GET    /api/settings/user/:userId        → Get user-specific settings
PUT    /api/settings/user/:userId        → Update user-specific settings
GET    /api/settings/audit-log           → Get settings change history
```

### Permission Management
```
GET    /api/permissions/roles            → Get all roles with permissions
PUT    /api/permissions/roles/:role      → Update role permissions
GET    /api/permissions/user/:userId     → Get user-specific permissions
PUT    /api/permissions/user/:userId     → Set user-specific permissions
GET    /api/permissions/audit            → Audit log of permission changes
POST   /api/permissions/test             → Test if user has permission
```

### Organization Management
```
GET    /api/organization/info            → Get org info
PUT    /api/organization/info            → Update org info
GET    /api/departments                  → List all departments
POST   /api/departments                  → Create department
PUT    /api/departments/:id              → Update department
DELETE /api/departments/:id              → Delete department
```

---

## 🎨 UNIFIED SETTINGS UI LAYOUT

```
┌─────────────────────────────────────────────┐
│  Settings                                   │
│  Your admin control panel                   │
└─────────────────────────────────────────────┘

Sidebar Navigation (Sticky):
├── 📋 System Settings      (SUPER_ADMIN only)
├── 🔒 Security & Access   (SUPER_ADMIN only)
├── 🏢 Organization         (SUPER_ADMIN + HR)
├── 📦 Asset Structure      (SUPER_ADMIN + Inv)
├── 👥 Users & Teams        (SUPER_ADMIN + HR)
├── 🔔 Notifications        (ALL - customize own)
├── 📊 Reports              (SUPER_ADMIN + Mgrs)
├── ⚙️ Maintenance           (SUPER_ADMIN only)
└── 👤 Profile Settings     (ALL - own profile)

Main Content Area:
┌─────────────────────────────────────────────┐
│ Breadcrumb: Settings > System               │
│                                             │
│ [Save] [Cancel] [Reset to Default] [Help]  │
│                                             │
│ Organization Info                           │
│  ├─ Name:        [Input] ✓                  │
│  ├─ Logo:        [Upload] [Preview]        │
│  ├─ Address:     [Textarea]                 │
│  ├─ Phone:       [Input]                    │
│  ├─ Support Email: [Input]                  │
│  └─ Website:     [Input]                    │
│                                             │
│ Branding                                    │
│  ├─ Primary Color:    [Color Picker]        │
│  ├─ Secondary Color:  [Color Picker]        │
│  └─ Theme:           [Light / Dark / Auto]  │
│                                             │
│ Regional Settings                           │
│  ├─ Country:     [Dropdown]                 │
│  ├─ Timezone:    [Dropdown] (Asia/Karachi)  │
│  ├─ Date Format: [Radio: DD/MM/YYYY]        │
│  ├─ Currency:    [Dropdown] (PKR)           │
│  └─ Language:    [Dropdown] (Urdu/English)  │
│                                             │
│ [Save Settings]                             │
└─────────────────────────────────────────────┘
```

---

## 📈 IMPLEMENTATION ROADMAP

### Phase 1: Database & API (Week 1)
- [ ] Create 5 new Prisma models (SystemSettings, SecuritySettings, etc.)
- [ ] Run migrations
- [ ] Create API endpoints (/api/settings/*)
- [ ] Create permission endpoints (/api/permissions/*)

### Phase 2: Admin Settings Pages (Week 2)
- [ ] System Settings page (functional)
- [ ] Security Settings page (functional)
- [ ] Organization Management page
- [ ] Asset Structure page
- [ ] Users & Teams page

### Phase 3: Notification & Personal Settings (Week 3)
- [ ] Notification Settings page
- [ ] Personal Profile Settings page (merge User Settings here)
- [ ] Reports Configuration page
- [ ] Maintenance page

### Phase 4: Integration & Polish (Week 4)
- [ ] Settings Audit Logging
- [ ] Settings Change Notifications
- [ ] Settings Import/Export
- [ ] Settings Backup/Restore
- [ ] Complete Testing

---

## ✅ CHECKLIST FOR IMPLEMENTATION

### Database
- [ ] Create SystemSettings table
- [ ] Create SecuritySettings table
- [ ] Create NotificationPreferences table
- [ ] Create SettingsAuditLog table
- [ ] Create UserPermissionOverrides table
- [ ] Update User model with preferences
- [ ] Add migrations

### API Routes
- [ ] /api/settings/* endpoints (CRUD)
- [ ] /api/permissions/* endpoints (CRUD + validation)
- [ ] /api/organization/* endpoints
- [ ] Add permission checks to all endpoints
- [ ] Add audit logging to all setting changes

### Frontend Pages
- [ ] Unified /settings page (with role-based sidebar)
- [ ] /settings/system (System Settings)
- [ ] /settings/security (Security & Permissions)
- [ ] /settings/organization (Org Structure)
- [ ] /settings/assets (Asset Structure)
- [ ] /settings/users (User Management)
- [ ] /settings/notifications (Notification Settings)
- [ ] /settings/profile (Personal Profile - unified)
- [ ] /settings/reports (Report Configuration)
- [ ] /settings/maintenance (System Maintenance)

### Features
- [ ] Settings search/filter
- [ ] Settings change history view
- [ ] Bulk permission assignment
- [ ] Settings export/import (JSON)
- [ ] Settings backup before major changes
- [ ] Audit trail for all changes
- [ ] Notification when settings are changed by others
- [ ] Permission conflict detection
- [ ] Settings validation and error handling

---

## 🔐 SECURITY NOTES

1. **All settings changes must be logged** with userId, timestamp, old value, new value
2. **Only SUPER_ADMIN can access System/Security settings**
3. **Audit log must be immutable** (never deletable)
4. **API endpoints must validate permissions** before processing
5. **Settings changes should trigger notifications** to affected users
6. **Sensitive settings (passwords, API keys) should be encrypted** in database
7. **Settings export should require additional confirmation** from admin
8. **IP Whitelist should be checked on every API request** if enabled

---

## 📝 ORGANIZATION PROFILE (SEF - Sindh Education Foundation)

**Type**: Government Organization  
**Size**: Large (Multiple offices/locations)  
**Asset Types**: 
- Furniture (Chairs, Tables, Cabinets for classrooms/offices)
- Electronics (Computers, Printers, Projectors for education)
- Vehicles (Transport for organization)

**Key Features Needed**:
- Department/Office-wise asset tracking
- Multi-location inventory
- Role-based permissions (Admin, Manager, Staff, Viewer)
- Bulk upload capabilities
- Export reports for audits
- Maintenance scheduling
- Depreciation calculation
- Asset allocation tracking

---

## 🎯 FINAL ARCHITECTURE

```
┌─────────────────────────────────────────┐
│     UNIFIED SETTINGS SYSTEM             │
│     (Role-based Access Control)         │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Settings Service Layer                  │
│ ├─ GET/PUT System Settings              │
│ ├─ GET/PUT Security Settings            │
│ ├─ GET/PUT User Preferences             │
│ ├─ Audit Settings Changes               │
│ └─ Validate Permissions                 │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ API Routes (/api/settings/*)            │
│ ├─ POST, GET, PUT, DELETE routes        │
│ ├─ Permission validation middleware     │
│ ├─ Audit logging middleware             │
│ └─ Error handling & validation          │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Database Models (Prisma)                │
│ ├─ SystemSettings                       │
│ ├─ SecuritySettings                     │
│ ├─ NotificationPreferences              │
│ ├─ UserPermissionOverrides              │
│ ├─ SettingsAuditLog                     │
│ └─ Updated User model                   │
└─────────────────────────────────────────┘
```

---

**NEXT STEP**: Confirm you want to proceed with this plan, or request modifications!
