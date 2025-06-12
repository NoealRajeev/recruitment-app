/*
  Warnings:

  - You are about to drop the column `contractDuration` on the `requirements` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `requirements` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "requirements_startDate_contractDuration_idx";

-- DropIndex
DROP INDEX "requirements_startDate_idx";

-- AlterTable
ALTER TABLE "job_roles" ADD COLUMN     "contractDuration" "ContractDuration",
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "requirements" DROP COLUMN "contractDuration",
DROP COLUMN "startDate";

-- CreateIndex
CREATE INDEX "job_roles_startDate_idx" ON "job_roles"("startDate");

-- CreateIndex
CREATE INDEX "job_roles_contractDuration_idx" ON "job_roles"("contractDuration");
