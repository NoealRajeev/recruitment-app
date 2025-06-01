/*
  Warnings:

  - You are about to drop the column `skills` on the `Requirement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Requirement" DROP COLUMN "skills",
ADD COLUMN     "startDate" TIMESTAMP(3);
