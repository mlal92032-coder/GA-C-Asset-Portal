-- CreateTable
CREATE TABLE "setting_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "requiredRole" TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT,
    "dataType" TEXT NOT NULL DEFAULT 'string',
    "fieldType" TEXT NOT NULL DEFAULT 'text',
    "validation" TEXT,
    "options" TEXT,
    "placeholder" TEXT,
    "helpText" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "system_settings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "setting_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "setting_audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "setting_id" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changeReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "setting_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "setting_audit_logs_setting_id_fkey" FOREIGN KEY ("setting_id") REFERENCES "system_settings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "security_policies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 30,
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "lockoutDurationMinutes" INTEGER NOT NULL DEFAULT 15,
    "passwordExpiryDays" INTEGER NOT NULL DEFAULT 90,
    "passwordHistoryCount" INTEGER NOT NULL DEFAULT 5,
    "minPasswordLength" INTEGER NOT NULL DEFAULT 8,
    "requirePasswordUppercase" BOOLEAN NOT NULL DEFAULT true,
    "requirePasswordNumbers" BOOLEAN NOT NULL DEFAULT true,
    "requirePasswordSpecial" BOOLEAN NOT NULL DEFAULT true,
    "require2FA" BOOLEAN NOT NULL DEFAULT false,
    "allow2FABypass" BOOLEAN NOT NULL DEFAULT false,
    "enableIPRestriction" BOOLEAN NOT NULL DEFAULT false,
    "allowedIPs" TEXT,
    "enableAPIAccess" BOOLEAN NOT NULL DEFAULT true,
    "apiRateLimitPerMinute" INTEGER NOT NULL DEFAULT 100,
    "apiKeyRotationDays" INTEGER NOT NULL DEFAULT 90,
    "enableAuditLogging" BOOLEAN NOT NULL DEFAULT true,
    "logSensitiveActions" BOOLEAN NOT NULL DEFAULT true,
    "auditLogRetentionDays" INTEGER NOT NULL DEFAULT 365,
    "enableGDPRMode" BOOLEAN NOT NULL DEFAULT true,
    "dataRetentionYears" INTEGER NOT NULL DEFAULT 7,
    "autoDeleteOldRecords" BOOLEAN NOT NULL DEFAULT false,
    "encryptSensitiveFields" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailAddress" TEXT,
    "emailFrequency" TEXT NOT NULL DEFAULT 'REALTIME',
    "inAppNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "soundVolume" INTEGER NOT NULL DEFAULT 50,
    "desktopNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "alertTypes" TEXT,
    "maintenanceAlertDays" INTEGER NOT NULL DEFAULT 7,
    "warrantyAlertDays" INTEGER NOT NULL DEFAULT 30,
    "stockLevelAlertThreshold" INTEGER NOT NULL DEFAULT 10,
    "budgetVarianceAlertPercent" INTEGER NOT NULL DEFAULT 10,
    "overdueCheckoutAlertDays" INTEGER NOT NULL DEFAULT 3,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "autoDeleteNotifications" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_permission_overrides" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" DATETIME,
    "reason" TEXT,
    "applied_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_permission_overrides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_permission_overrides_applied_by_fkey" FOREIGN KEY ("applied_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "organization_info" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationName" TEXT NOT NULL,
    "organizationLogo" TEXT,
    "organizationBanner" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "registrationNumber" TEXT,
    "taxNumber" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1e40af',
    "accentColor" TEXT NOT NULL DEFAULT '#f97316',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Karachi',
    "language" TEXT NOT NULL DEFAULT 'en',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '24h',
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "currencySymbol" TEXT NOT NULL DEFAULT '₨',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "asset_defaults" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetTagPrefix" TEXT NOT NULL DEFAULT 'SEF-',
    "autoGenerateTags" BOOLEAN NOT NULL DEFAULT true,
    "defaultCondition" TEXT NOT NULL DEFAULT 'GOOD',
    "defaultStatus" TEXT NOT NULL DEFAULT 'IN_STORE',
    "defaultDepreciationMethod" TEXT NOT NULL DEFAULT 'STRAIGHT_LINE',
    "defaultUsefulLife" INTEGER NOT NULL DEFAULT 5,
    "salvageValuePercent" INTEGER NOT NULL DEFAULT 10,
    "enableQRCodes" BOOLEAN NOT NULL DEFAULT true,
    "enableBarcodes" BOOLEAN NOT NULL DEFAULT false,
    "enableSerialNumbers" BOOLEAN NOT NULL DEFAULT true,
    "stockReorderLevel" INTEGER NOT NULL DEFAULT 5,
    "itemsPerPage" INTEGER NOT NULL DEFAULT 25,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "report_configurations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportName" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "description" TEXT,
    "schedule" TEXT,
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" DATETIME,
    "nextRunAt" DATETIME,
    "format" TEXT NOT NULL DEFAULT 'PDF',
    "recipients" TEXT,
    "includeCharts" BOOLEAN NOT NULL DEFAULT true,
    "includeSummary" BOOLEAN NOT NULL DEFAULT true,
    "dataRange" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "actionType" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "message" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_profile_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT,
    "dateFormat" TEXT,
    "profilePhoto" TEXT,
    "bio" TEXT,
    "signature" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_profile_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "setting_categories_name_key" ON "setting_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "setting_categories_slug_key" ON "setting_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_category_id_key_key" ON "system_settings"("category_id", "key");

-- CreateIndex
CREATE INDEX "setting_audit_logs_user_id_idx" ON "setting_audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "setting_audit_logs_setting_id_idx" ON "setting_audit_logs"("setting_id");

-- CreateIndex
CREATE INDEX "setting_audit_logs_created_at_idx" ON "setting_audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_module_action_key" ON "role_permissions"("role", "module", "action");

-- CreateIndex
CREATE INDEX "user_permission_overrides_user_id_idx" ON "user_permission_overrides"("user_id");

-- CreateIndex
CREATE INDEX "user_permission_overrides_valid_from_valid_until_idx" ON "user_permission_overrides"("valid_from", "valid_until");

-- CreateIndex
CREATE UNIQUE INDEX "user_permission_overrides_user_id_module_action_key" ON "user_permission_overrides"("user_id", "module", "action");

-- CreateIndex
CREATE INDEX "system_logs_user_id_idx" ON "system_logs"("user_id");

-- CreateIndex
CREATE INDEX "system_logs_actionType_idx" ON "system_logs"("actionType");

-- CreateIndex
CREATE INDEX "system_logs_created_at_idx" ON "system_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_settings_user_id_key" ON "user_profile_settings"("user_id");
