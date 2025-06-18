/*
  Warnings:

  - You are about to drop the column `requirementId` on the `labour_profiles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "labour_profiles" DROP CONSTRAINT "labour_profiles_requirementId_fkey";

-- DropIndex
DROP INDEX "labour_profiles_requirementId_idx";

-- AlterTable
ALTER TABLE "labour_profiles" DROP COLUMN "requirementId";
