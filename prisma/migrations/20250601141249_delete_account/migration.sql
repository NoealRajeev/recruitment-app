-- CreateEnum
CREATE TYPE "DeletionType" AS ENUM ('SCHEDULED', 'IMMEDIATE');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ACCOUNT_RECOVERED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletionType" "DeletionType";
