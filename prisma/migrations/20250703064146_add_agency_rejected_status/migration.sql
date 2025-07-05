-- AlterEnum
ALTER TYPE "RequirementStatus" ADD VALUE 'AGENCY_REJECTED';

-- AlterTable
ALTER TABLE "JobRole" ADD COLUMN     "needsMoreLabour" BOOLEAN NOT NULL DEFAULT false;
