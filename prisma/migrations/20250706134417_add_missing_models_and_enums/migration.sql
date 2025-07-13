-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'ACCOUNT_DELETION_REQUESTED';
ALTER TYPE "AuditAction" ADD VALUE 'ACCOUNT_DELETED';

-- CreateTable
CREATE TABLE "AgencyDocument" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientDocument" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgencyDocument_agencyId_idx" ON "AgencyDocument"("agencyId");

-- CreateIndex
CREATE INDEX "ClientDocument_clientId_idx" ON "ClientDocument"("clientId");

-- AddForeignKey
ALTER TABLE "AgencyDocument" ADD CONSTRAINT "AgencyDocument_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDocument" ADD CONSTRAINT "ClientDocument_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
