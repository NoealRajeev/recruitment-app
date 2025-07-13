/*
  Warnings:

  - The values [INITIALIZED,DOCUMENTS,MEDICAL,QVC,POLICE_CLEARANCE,VISA,FLIGHT,ARRIVAL,WORK_PERMIT,CONTRACT,DEPLOYMENT] on the enum `LabourStage` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LabourStage_new" AS ENUM ('VISA_APPLYING', 'QVC_PAYMENT', 'CONTRACT_SIGN', 'MEDICAL_STATUS', 'FINGERPRINT', 'VISA_PRINTING', 'READY_TO_TRAVEL', 'TRAVEL_CONFIRMATION', 'ARRIVAL_CONFIRMATION');
ALTER TABLE "LabourProfile" ALTER COLUMN "currentStage" DROP DEFAULT;
ALTER TABLE "LabourProfile" ALTER COLUMN "currentStage" TYPE "LabourStage_new" USING ("currentStage"::text::"LabourStage_new");
ALTER TABLE "LabourStageHistory" ALTER COLUMN "stage" TYPE "LabourStage_new" USING ("stage"::text::"LabourStage_new");
ALTER TYPE "LabourStage" RENAME TO "LabourStage_old";
ALTER TYPE "LabourStage_new" RENAME TO "LabourStage";
DROP TYPE "LabourStage_old";
ALTER TABLE "LabourProfile" ALTER COLUMN "currentStage" SET DEFAULT 'VISA_APPLYING';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StageStatus" ADD VALUE 'PAID';
ALTER TYPE "StageStatus" ADD VALUE 'SIGNED';
ALTER TYPE "StageStatus" ADD VALUE 'REFUSED';
ALTER TYPE "StageStatus" ADD VALUE 'FIT';
ALTER TYPE "StageStatus" ADD VALUE 'UNFIT';
ALTER TYPE "StageStatus" ADD VALUE 'PASSED';
ALTER TYPE "StageStatus" ADD VALUE 'FILLED';
ALTER TYPE "StageStatus" ADD VALUE 'TRAVELED';
ALTER TYPE "StageStatus" ADD VALUE 'RESCHEDULED';
ALTER TYPE "StageStatus" ADD VALUE 'CANCELED';
ALTER TYPE "StageStatus" ADD VALUE 'ARRIVED';
ALTER TYPE "StageStatus" ADD VALUE 'NOT_ARRIVED';
ALTER TYPE "StageStatus" ADD VALUE 'VISA_PRINTED';

-- AlterTable
ALTER TABLE "LabourProfile" ALTER COLUMN "currentStage" SET DEFAULT 'VISA_APPLYING';
