/*
  Warnings:

  - You are about to drop the column `regions` on the `agencies` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'REQUIREMENT_DELETE';
ALTER TYPE "AuditAction" ADD VALUE 'REQUIREMENT_REJECTED';

-- AlterTable
ALTER TABLE "agencies" DROP COLUMN "regions";
