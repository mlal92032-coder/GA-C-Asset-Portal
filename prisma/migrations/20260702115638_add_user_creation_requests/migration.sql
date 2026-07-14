-- CreateTable
CREATE TABLE "user_creation_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEW_USER',
    "department" TEXT,
    "designation" TEXT,
    "phone" TEXT,
    "requested_by_id" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" TEXT,
    "review_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_creation_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_creation_requests_email_key" ON "user_creation_requests"("email");

-- CreateIndex
CREATE INDEX "user_creation_requests_email_idx" ON "user_creation_requests"("email");

-- CreateIndex
CREATE INDEX "user_creation_requests_status_idx" ON "user_creation_requests"("status");

-- CreateIndex
CREATE INDEX "user_creation_requests_requested_by_id_idx" ON "user_creation_requests"("requested_by_id");

-- CreateIndex
CREATE INDEX "user_creation_requests_created_at_idx" ON "user_creation_requests"("created_at");
