-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT,
    "designation" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VIEW_USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "permissions" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "manufacturers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manufacturer_name" TEXT NOT NULL,
    "country" TEXT,
    "support_email" TEXT,
    "support_phone" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location_name" TEXT NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "room" TEXT,
    "room_type" TEXT,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "furniture_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_tag" TEXT,
    "asset_name" TEXT NOT NULL,
    "serial_number" TEXT,
    "image_url" TEXT,
    "qr_password" TEXT,
    "furniture_type" TEXT,
    "material" TEXT,
    "purchase_date" DATETIME,
    "purchase_price" REAL,
    "company_id" TEXT,
    "manufacturer_id" TEXT,
    "location_id" TEXT,
    "assigned_user_id" TEXT,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "status" TEXT NOT NULL DEFAULT 'IN_STORE',
    "remarks" TEXT,
    "useful_life_years" INTEGER,
    "salvage_value" REAL,
    "depreciation_method" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "furniture_assets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "furniture_assets_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "furniture_assets_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "furniture_assets_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "electronic_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_tag" TEXT,
    "asset_name" TEXT NOT NULL,
    "image_url" TEXT,
    "qr_password" TEXT,
    "device_type" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "purchase_date" DATETIME,
    "warranty_end_date" DATETIME,
    "company_id" TEXT,
    "manufacturer_id" TEXT,
    "location_id" TEXT,
    "assigned_user_id" TEXT,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "status" TEXT NOT NULL DEFAULT 'IN_STORE',
    "last_maintenance_date" DATETIME,
    "remarks" TEXT,
    "useful_life_years" INTEGER,
    "salvage_value" REAL,
    "depreciation_method" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "electronic_assets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "electronic_assets_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "electronic_assets_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "electronic_assets_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vehicle_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_tag" TEXT,
    "asset_name" TEXT NOT NULL,
    "serial_number" TEXT,
    "image_url" TEXT,
    "qr_password" TEXT,
    "vehicle_type" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "registration_number" TEXT NOT NULL,
    "engine_number" TEXT,
    "chassis_number" TEXT,
    "fuel_type" TEXT,
    "purchase_date" DATETIME,
    "purchase_price" REAL,
    "company_id" TEXT,
    "manufacturer_id" TEXT,
    "location_id" TEXT,
    "assigned_user_id" TEXT,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "status" TEXT NOT NULL DEFAULT 'IN_STORE',
    "last_service_date" DATETIME,
    "insurance_expiry_date" DATETIME,
    "remarks" TEXT,
    "useful_life_years" INTEGER,
    "salvage_value" REAL,
    "depreciation_method" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "vehicle_assets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "vehicle_assets_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "vehicle_assets_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "vehicle_assets_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "asset_checkouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_id" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "checked_out_by" TEXT NOT NULL,
    "checked_out_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_return_date" DATETIME,
    "check_in_date" DATETIME,
    "checked_in_by" TEXT,
    "checkout_notes" TEXT,
    "checkin_notes" TEXT,
    "condition" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "asset_checkouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "details" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_id" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_id" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_id" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "user_id" TEXT,
    "maintenance_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "cost" REAL,
    "performed_by" TEXT,
    "next_due_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "odometer_reading" INTEGER,
    "work_type" TEXT,
    "vendor_name" TEXT,
    "payment_method" TEXT,
    "remarks" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "maintenances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "spare_parts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "part_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "part_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" REAL NOT NULL,
    "total_cost" REAL NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "remarks" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "spare_parts_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle_assets" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "delete_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_id" TEXT NOT NULL,
    "asset_type" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" TEXT,
    "review_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "delete_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "furniture_assets_asset_tag_key" ON "furniture_assets"("asset_tag");

-- CreateIndex
CREATE INDEX "furniture_assets_company_id_idx" ON "furniture_assets"("company_id");

-- CreateIndex
CREATE INDEX "furniture_assets_manufacturer_id_idx" ON "furniture_assets"("manufacturer_id");

-- CreateIndex
CREATE INDEX "furniture_assets_location_id_idx" ON "furniture_assets"("location_id");

-- CreateIndex
CREATE INDEX "furniture_assets_assigned_user_id_idx" ON "furniture_assets"("assigned_user_id");

-- CreateIndex
CREATE INDEX "furniture_assets_condition_idx" ON "furniture_assets"("condition");

-- CreateIndex
CREATE INDEX "furniture_assets_status_idx" ON "furniture_assets"("status");

-- CreateIndex
CREATE INDEX "furniture_assets_created_at_idx" ON "furniture_assets"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "electronic_assets_asset_tag_key" ON "electronic_assets"("asset_tag");

-- CreateIndex
CREATE UNIQUE INDEX "electronic_assets_serial_number_key" ON "electronic_assets"("serial_number");

-- CreateIndex
CREATE INDEX "electronic_assets_company_id_idx" ON "electronic_assets"("company_id");

-- CreateIndex
CREATE INDEX "electronic_assets_manufacturer_id_idx" ON "electronic_assets"("manufacturer_id");

-- CreateIndex
CREATE INDEX "electronic_assets_location_id_idx" ON "electronic_assets"("location_id");

-- CreateIndex
CREATE INDEX "electronic_assets_assigned_user_id_idx" ON "electronic_assets"("assigned_user_id");

-- CreateIndex
CREATE INDEX "electronic_assets_condition_idx" ON "electronic_assets"("condition");

-- CreateIndex
CREATE INDEX "electronic_assets_status_idx" ON "electronic_assets"("status");

-- CreateIndex
CREATE INDEX "electronic_assets_created_at_idx" ON "electronic_assets"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_assets_asset_tag_key" ON "vehicle_assets"("asset_tag");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_assets_registration_number_key" ON "vehicle_assets"("registration_number");

-- CreateIndex
CREATE INDEX "vehicle_assets_company_id_idx" ON "vehicle_assets"("company_id");

-- CreateIndex
CREATE INDEX "vehicle_assets_manufacturer_id_idx" ON "vehicle_assets"("manufacturer_id");

-- CreateIndex
CREATE INDEX "vehicle_assets_location_id_idx" ON "vehicle_assets"("location_id");

-- CreateIndex
CREATE INDEX "vehicle_assets_assigned_user_id_idx" ON "vehicle_assets"("assigned_user_id");

-- CreateIndex
CREATE INDEX "vehicle_assets_condition_idx" ON "vehicle_assets"("condition");

-- CreateIndex
CREATE INDEX "vehicle_assets_status_idx" ON "vehicle_assets"("status");

-- CreateIndex
CREATE INDEX "vehicle_assets_created_at_idx" ON "vehicle_assets"("created_at");

-- CreateIndex
CREATE INDEX "asset_checkouts_asset_id_idx" ON "asset_checkouts"("asset_id");

-- CreateIndex
CREATE INDEX "asset_checkouts_user_id_idx" ON "asset_checkouts"("user_id");

-- CreateIndex
CREATE INDEX "asset_checkouts_checked_out_by_idx" ON "asset_checkouts"("checked_out_by");

-- CreateIndex
CREATE INDEX "asset_checkouts_asset_type_idx" ON "asset_checkouts"("asset_type");

-- CreateIndex
CREATE INDEX "asset_checkouts_checked_out_at_idx" ON "asset_checkouts"("checked_out_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "attachments_asset_id_idx" ON "attachments"("asset_id");

-- CreateIndex
CREATE INDEX "attachments_asset_type_idx" ON "attachments"("asset_type");

-- CreateIndex
CREATE INDEX "reviews_asset_id_idx" ON "reviews"("asset_id");

-- CreateIndex
CREATE INDEX "reviews_asset_type_idx" ON "reviews"("asset_type");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");

-- CreateIndex
CREATE INDEX "maintenances_asset_id_idx" ON "maintenances"("asset_id");

-- CreateIndex
CREATE INDEX "maintenances_asset_type_idx" ON "maintenances"("asset_type");

-- CreateIndex
CREATE INDEX "maintenances_maintenance_date_idx" ON "maintenances"("maintenance_date");

-- CreateIndex
CREATE INDEX "maintenances_status_idx" ON "maintenances"("status");

-- CreateIndex
CREATE INDEX "maintenances_user_id_idx" ON "maintenances"("user_id");

-- CreateIndex
CREATE INDEX "spare_parts_part_date_idx" ON "spare_parts"("part_date");

-- CreateIndex
CREATE INDEX "spare_parts_vehicle_id_idx" ON "spare_parts"("vehicle_id");

-- CreateIndex
CREATE INDEX "spare_parts_created_at_idx" ON "spare_parts"("created_at");

-- CreateIndex
CREATE INDEX "delete_requests_asset_id_idx" ON "delete_requests"("asset_id");

-- CreateIndex
CREATE INDEX "delete_requests_asset_type_idx" ON "delete_requests"("asset_type");

-- CreateIndex
CREATE INDEX "delete_requests_status_idx" ON "delete_requests"("status");

-- CreateIndex
CREATE INDEX "delete_requests_requested_by_id_idx" ON "delete_requests"("requested_by_id");

-- CreateIndex
CREATE INDEX "delete_requests_created_at_idx" ON "delete_requests"("created_at");
