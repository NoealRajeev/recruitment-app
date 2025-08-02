/*
  Warnings:

  - The `department` column on the `admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Department" AS ENUM ('RECRUITMENT', 'HR', 'OPERATIONS', 'FINANCE', 'COMPLIANCE', 'BUSINESS_DEVELOPMENT', 'IT', 'MARKETING');

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "department",
ADD COLUMN     "department" "Department";
