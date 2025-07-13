-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('USER_REGISTERED', 'USER_VERIFIED', 'USER_SUSPENDED', 'USER_DELETED', 'PASSWORD_CHANGED', 'ACCOUNT_RECOVERY', 'REQUIREMENT_CREATED', 'REQUIREMENT_UPDATED', 'REQUIREMENT_STATUS_CHANGED', 'REQUIREMENT_FORWARDED_TO_AGENCY', 'REQUIREMENT_ACCEPTED', 'REQUIREMENT_REJECTED', 'REQUIREMENT_NEEDS_REVISION', 'LABOUR_PROFILE_CREATED', 'LABOUR_PROFILE_STATUS_CHANGED', 'LABOUR_PROFILE_VERIFIED', 'LABOUR_PROFILE_DOCUMENT_UPLOADED', 'LABOUR_PROFILE_STAGE_UPDATED', 'ASSIGNMENT_CREATED', 'ASSIGNMENT_STATUS_CHANGED', 'ASSIGNMENT_FEEDBACK_RECEIVED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'OFFER_LETTER_GENERATED', 'OFFER_LETTER_SIGNED', 'VISA_UPLOADED', 'TRAVEL_DOCUMENTS_UPLOADED', 'STAGE_COMPLETED', 'STAGE_FAILED', 'STAGE_PENDING_ACTION', 'TRAVEL_CONFIRMED', 'ARRIVAL_CONFIRMED', 'LABOUR_DEPLOYED', 'AGENCY_ASSIGNED', 'AGENCY_RESPONSE_RECEIVED', 'AGENCY_STATUS_CHANGED', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'WELCOME_MESSAGE');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "senderId" TEXT,
    "entityType" VARCHAR(50),
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "actionUrl" TEXT,
    "actionText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_senderId_idx" ON "Notification"("senderId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_isArchived_idx" ON "Notification"("isArchived");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_entityType_entityId_idx" ON "Notification"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_isRead_idx" ON "Notification"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_recipientId_isArchived_idx" ON "Notification"("recipientId", "isArchived");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
