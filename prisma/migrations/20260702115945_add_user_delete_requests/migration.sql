-- CreateTable
CREATE TABLE "user_delete_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" TEXT,
    "review_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_delete_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "user_delete_requests_user_id_idx" ON "user_delete_requests"("user_id");

-- CreateIndex
CREATE INDEX "user_delete_requests_status_idx" ON "user_delete_requests"("status");

-- CreateIndex
CREATE INDEX "user_delete_requests_requested_by_id_idx" ON "user_delete_requests"("requested_by_id");

-- CreateIndex
CREATE INDEX "user_delete_requests_created_at_idx" ON "user_delete_requests"("created_at");
