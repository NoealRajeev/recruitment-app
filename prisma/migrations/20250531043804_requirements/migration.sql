/*
  Warnings:

  - You are about to drop the column `accommodation` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `transportation` on the `Requirement` table. All the data in the column will be lost.
  - Added the required column `ticketDetails` to the `Requirement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TicketDetails" AS ENUM ('ONE_YEAR', 'TWO_YEARS');

-- AlterTable
ALTER TABLE "Requirement" DROP COLUMN "accommodation",
DROP COLUMN "transportation",
ADD COLUMN     "ticketDetails" "TicketDetails" NOT NULL;
