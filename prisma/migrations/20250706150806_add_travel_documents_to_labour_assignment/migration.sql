/*
  Warnings:

  - The values [ACCOUNT_DELETION_REQUESTED,ACCOUNT_DELETED] on the enum `AuditAction` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `AgencyDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuditAction_new" AS ENUM ('USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE', 'CLIENT_CREATE', 'CLIENT_READ', 'CLIENT_UPDATE', 'CLIENT_DELETE', 'AGENCY_CREATE', 'AGENCY_READ', 'AGENCY_UPDATE', 'AGENCY_DELETE', 'REQUIREMENT_CREATE', 'REQUIREMENT_READ', 'REQUIREMENT_UPDATE', 'REQUIREMENT_DELETE', 'LABOUR_PROFILE_CREATE', 'LABOUR_PROFILE_READ', 'LABOUR_PROFILE_UPDATE', 'LABOUR_PROFILE_DELETE', 'LABOUR_PROFILE_DOCUMENT_UPLOAD', 'LABOUR_PROFILE_STATUS_CHANGE', 'LABOUR_PROFILE_VERIFICATION_CHANGE', 'DOCUMENT_CREATE', 'DOCUMENT_READ', 'DOCUMENT_UPDATE', 'DOCUMENT_DELETE', 'OTP_CREATE', 'OTP_READ', 'OTP_UPDATE', 'OTP_DELETE', 'NOTIFICATION_CREATE', 'NOTIFICATION_READ', 'NOTIFICATION_UPDATE', 'NOTIFICATION_DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ACCOUNT_RECOVERY');
ALTER TABLE "audit_logs" ALTER COLUMN "action" TYPE "AuditAction_new" USING ("action"::text::"AuditAction_new");
ALTER TYPE "AuditAction" RENAME TO "AuditAction_old";
ALTER TYPE "AuditAction_new" RENAME TO "AuditAction";
DROP TYPE "AuditAction_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "AgencyDocument" DROP CONSTRAINT "AgencyDocument_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "ClientDocument" DROP CONSTRAINT "ClientDocument_clientId_fkey";

-- DropTable
DROP TABLE "AgencyDocument";

-- DropTable
DROP TABLE "ClientDocument";
