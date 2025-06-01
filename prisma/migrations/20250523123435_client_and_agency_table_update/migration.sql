/*
  Warnings:

  - You are about to drop the column `isFirstLogin` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registrationNo]` on the table `Agency` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CompanySector" AS ENUM ('IT', 'REAL_ESTATE', 'HEALTHCARE', 'FINANCE', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION', 'EDUCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Agency" ADD COLUMN     "email" TEXT,
ADD COLUMN     "registrationNo" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "companySector" "CompanySector",
ADD COLUMN     "companySize" "CompanySize",
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "registrationNo" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isFirstLogin";

-- CreateIndex
CREATE UNIQUE INDEX "Agency_registrationNo_key" ON "Agency"("registrationNo");

-- CreateIndex
CREATE INDEX "Agency_licenseNumber_registrationNo_idx" ON "Agency"("licenseNumber", "registrationNo");
