-- AlterTable
ALTER TABLE "Requirement" ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "contractDuration" DROP NOT NULL,
ALTER COLUMN "previousExperience" DROP NOT NULL,
ALTER COLUMN "projectLocation" DROP NOT NULL,
ALTER COLUMN "ticketDetails" DROP NOT NULL;
