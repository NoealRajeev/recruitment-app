/*
  Warnings:

  - You are about to drop the column `deadline` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Requirement` table. All the data in the column will be lost.
  - Added the required column `contractDuration` to the `Requirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousExperience` to the `Requirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectLocation` to the `Requirement` table without a default value. This is not possible if the table is not empty.
  - Made the column `startDate` on table `Requirement` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ContractDuration" AS ENUM ('ONE_YEAR', 'TWO_YEARS', 'UNLIMITED');

-- CreateEnum
CREATE TYPE "PreviousExperience" AS ENUM ('FRESH', 'GCC_EXPERIENCE', 'LOCAL_EXPERIENCE', 'ANY');

-- AlterTable
ALTER TABLE "Requirement" DROP COLUMN "deadline",
DROP COLUMN "description",
DROP COLUMN "nationality",
DROP COLUMN "quantity",
DROP COLUMN "title",
ADD COLUMN     "accommodation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contractDuration" "ContractDuration" NOT NULL,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "preferredAge" INTEGER,
ADD COLUMN     "previousExperience" "PreviousExperience" NOT NULL,
ADD COLUMN     "projectLocation" TEXT NOT NULL,
ADD COLUMN     "specialNotes" TEXT,
ADD COLUMN     "totalExperienceYears" INTEGER,
ADD COLUMN     "transportation" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "startDate" SET NOT NULL;

-- CreateTable
CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "nationality" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
