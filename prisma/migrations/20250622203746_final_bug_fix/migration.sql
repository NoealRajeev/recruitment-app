/*
  Warnings:

  - The values [DOCUMENTS_PENDING,DOCUMENTS_COMPLETED,MEDICAL_PENDING,MEDICAL_COMPLETED,MEDICAL_FAILED,QVC_PENDING,QVC_COMPLETED,POLICE_CLEARANCE_PENDING,POLICE_CLEARANCE_COMPLETED,VISA_APPLIED,VISA_APPROVED,VISA_REJECTED,FLIGHT_BOOKED,DEPARTED,ARRIVED,WORK_PERMIT_PENDING,WORK_PERMIT_APPROVED,CONTRACT_SIGNED,DEPLOYED] on the enum `LabourStage` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `status` on the `LabourStageHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "LabourStage_new" AS ENUM ('INITIALIZED', 'DOCUMENTS', 'MEDICAL', 'QVC', 'POLICE_CLEARANCE', 'VISA', 'FLIGHT', 'ARRIVAL', 'WORK_PERMIT', 'CONTRACT', 'DEPLOYMENT');
ALTER TABLE "LabourProfile" ALTER COLUMN "currentStage" DROP DEFAULT;
ALTER TABLE "LabourProfile" ALTER COLUMN "currentStage" TYPE "LabourStage_new" USING ("currentStage"::text::"LabourStage_new");
ALTER TABLE "LabourStageHistory" ALTER COLUMN "stage" TYPE "LabourStage_new" USING ("stage"::text::"LabourStage_new");
ALTER TYPE "LabourStage" RENAME TO "LabourStage_old";
ALTER TYPE "LabourStage_new" RENAME TO "LabourStage";
DROP TYPE "LabourStage_old";
ALTER TABLE "LabourProfile" ALTER COLUMN "currentStage" SET DEFAULT 'INITIALIZED';
COMMIT;

-- AlterTable
ALTER TABLE "LabourProfile" ALTER COLUMN "currentStage" SET DEFAULT 'INITIALIZED';

-- AlterTable
ALTER TABLE "LabourStageHistory" DROP COLUMN "status",
ADD COLUMN     "status" "StageStatus" NOT NULL;
