-- CreateTable
CREATE TABLE "asset_add_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_type" TEXT NOT NULL,
    "assetData" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" TEXT,
    "review_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "asset_add_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "asset_add_requests_asset_type_idx" ON "asset_add_requests"("asset_type");

-- CreateIndex
CREATE INDEX "asset_add_requests_status_idx" ON "asset_add_requests"("status");

-- CreateIndex
CREATE INDEX "asset_add_requests_requested_by_id_idx" ON "asset_add_requests"("requested_by_id");

-- CreateIndex
CREATE INDEX "asset_add_requests_created_at_idx" ON "asset_add_requests"("created_at");
