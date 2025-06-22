-- AlterTable
ALTER TABLE "LabourAssignment" ADD COLUMN     "isBackup" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "LabourAssignment_isBackup_idx" ON "LabourAssignment"("isBackup");

-- CreateIndex
CREATE INDEX "LabourAssignment_clientStatus_idx" ON "LabourAssignment"("clientStatus");

-- CreateIndex
CREATE INDEX "LabourAssignment_adminStatus_clientStatus_idx" ON "LabourAssignment"("adminStatus", "clientStatus");
