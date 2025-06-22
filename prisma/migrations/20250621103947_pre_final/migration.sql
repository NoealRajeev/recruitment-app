-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('RECRUITMENT_ADMIN', 'CLIENT_ADMIN', 'RECRUITMENT_AGENCY');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('SUBMITTED', 'VERIFIED', 'REJECTED', 'NOT_VERIFIED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PROFILE_IMAGE', 'LICENSE', 'INSURANCE', 'ID_PROOF', 'ADDRESS_PROOF', 'COMPANY_REGISTRATION', 'PASSPORT', 'CV', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('IMPORTANT', 'SUPPORTING');

-- CreateEnum
CREATE TYPE "CompanySector" AS ENUM ('IT', 'REAL_ESTATE', 'HEALTHCARE', 'FINANCE', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION', 'EDUCATION', 'HOSPITALITY', 'OIL_GAS', 'TRANSPORTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE', 'CLIENT_CREATE', 'CLIENT_READ', 'CLIENT_UPDATE', 'CLIENT_DELETE', 'AGENCY_CREATE', 'AGENCY_READ', 'AGENCY_UPDATE', 'AGENCY_DELETE', 'REQUIREMENT_CREATE', 'REQUIREMENT_READ', 'REQUIREMENT_UPDATE', 'REQUIREMENT_DELETE', 'LABOUR_PROFILE_CREATE', 'LABOUR_PROFILE_READ', 'LABOUR_PROFILE_UPDATE', 'LABOUR_PROFILE_DELETE', 'LABOUR_PROFILE_DOCUMENT_UPLOAD', 'LABOUR_PROFILE_STATUS_CHANGE', 'LABOUR_PROFILE_VERIFICATION_CHANGE', 'DOCUMENT_CREATE', 'DOCUMENT_READ', 'DOCUMENT_UPDATE', 'DOCUMENT_DELETE', 'OTP_CREATE', 'OTP_READ', 'OTP_UPDATE', 'OTP_DELETE', 'NOTIFICATION_CREATE', 'NOTIFICATION_READ', 'NOTIFICATION_UPDATE', 'NOTIFICATION_DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ACCOUNT_RECOVERY');

-- CreateEnum
CREATE TYPE "LabourStage" AS ENUM ('DOCUMENTS_PENDING', 'DOCUMENTS_COMPLETED', 'MEDICAL_PENDING', 'MEDICAL_COMPLETED', 'MEDICAL_FAILED', 'QVC_PENDING', 'QVC_COMPLETED', 'POLICE_CLEARANCE_PENDING', 'POLICE_CLEARANCE_COMPLETED', 'VISA_APPLIED', 'VISA_APPROVED', 'VISA_REJECTED', 'FLIGHT_BOOKED', 'DEPARTED', 'ARRIVED', 'WORK_PERMIT_PENDING', 'WORK_PERMIT_APPROVED', 'CONTRACT_SIGNED', 'DEPLOYED');

-- CreateEnum
CREATE TYPE "DeletionType" AS ENUM ('SCHEDULED', 'IMMEDIATE');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PARTIALLY_SUBMITTED', 'PENDING', 'UNDER_REVIEW', 'FORWARDED', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CLIENT_REVIEW', 'SUBMITTED_TO_CLIENT', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "ContractDuration" AS ENUM ('ONE_MONTH', 'THREE_MONTHS', 'SIX_MONTHS', 'ONE_YEAR', 'TWO_YEARS', 'THREE_YEARS', 'FIVE_PLUS_YEARS');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "LabourProfileStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SHORTLISTED', 'DEPLOYED');

-- CreateEnum
CREATE TYPE "DocumentVerificationStatus" AS ENUM ('PENDING', 'PARTIALLY_VERIFIED', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "altContact" VARCHAR(20),
    "profilePicture" TEXT,
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "resetRequired" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleteAt" TIMESTAMP(3),
    "deletionType" "DeletionType",
    "deletionReason" TEXT,
    "deletionRequestedBy" TEXT,
    "createdById" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "registrationNo" VARCHAR(50),
    "companySector" "CompanySector" NOT NULL,
    "companySize" "CompanySize" NOT NULL,
    "website" VARCHAR(255),
    "address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20),
    "designation" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyName" VARCHAR(255) NOT NULL,
    "registrationNo" VARCHAR(50),
    "licenseNumber" VARCHAR(50) NOT NULL,
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "website" VARCHAR(255),
    "address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "department" VARCHAR(100),
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "labourProfileId" TEXT,
    "status" "AccountStatus" NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'SUPPORTING',
    "requirementId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRequirement" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'IMPORTANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "RequirementStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "nationality" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "contractDuration" "ContractDuration",
    "salaryCurrency" TEXT DEFAULT 'QAR',
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "foodAllowance" DOUBLE PRECISION,
    "foodProvidedByCompany" BOOLEAN NOT NULL DEFAULT false,
    "housingAllowance" DOUBLE PRECISION,
    "housingProvidedByCompany" BOOLEAN NOT NULL DEFAULT false,
    "transportationAllowance" DOUBLE PRECISION,
    "transportationProvidedByCompany" BOOLEAN NOT NULL DEFAULT false,
    "healthInsurance" TEXT NOT NULL,
    "mobileAllowance" DOUBLE PRECISION,
    "mobileProvidedByCompany" BOOLEAN NOT NULL DEFAULT false,
    "natureOfWorkAllowance" DOUBLE PRECISION,
    "otherAllowance" DOUBLE PRECISION,
    "ticketFrequency" TEXT[],
    "workLocations" TEXT[],
    "previousExperience" TEXT[],
    "totalExperienceYears" INTEGER,
    "preferredAge" INTEGER,
    "languageRequirements" TEXT[],
    "specialRequirements" TEXT,
    "assignedAgencyId" TEXT,
    "agencyStatus" "RequirementStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "adminStatus" "RequirementStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabourProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileImage" TEXT,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "nationality" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passportNumber" TEXT NOT NULL,
    "passportExpiry" TIMESTAMP(3) NOT NULL,
    "passportVerified" BOOLEAN NOT NULL DEFAULT false,
    "visaType" TEXT,
    "visaExpiry" TIMESTAMP(3),
    "visaVerified" BOOLEAN NOT NULL DEFAULT false,
    "medicalReport" TEXT,
    "medicalVerified" BOOLEAN NOT NULL DEFAULT false,
    "policeClearance" TEXT,
    "policeVerified" BOOLEAN NOT NULL DEFAULT false,
    "contractVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "LabourProfileStatus" NOT NULL DEFAULT 'RECEIVED',
    "verificationStatus" "DocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentsSubmittedAt" TIMESTAMP(3),
    "documentsVerifiedAt" TIMESTAMP(3),
    "jobRole" TEXT,
    "skills" TEXT[],
    "experience" TEXT,
    "education" TEXT,
    "languages" TEXT[],
    "requirementId" TEXT,
    "agencyId" TEXT NOT NULL,
    "currentStage" "LabourStage" NOT NULL DEFAULT 'DOCUMENTS_PENDING',

    CONSTRAINT "LabourProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabourAssignment" (
    "id" TEXT NOT NULL,
    "jobRoleId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "labourId" TEXT NOT NULL,
    "agencyStatus" "RequirementStatus" NOT NULL DEFAULT 'SUBMITTED',
    "adminStatus" "RequirementStatus" NOT NULL DEFAULT 'PENDING',
    "clientStatus" "RequirementStatus" NOT NULL DEFAULT 'PENDING',
    "adminFeedback" TEXT,
    "clientFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabourAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabourStageHistory" (
    "id" TEXT NOT NULL,
    "labourId" TEXT NOT NULL,
    "stage" "LabourStage" NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "documents" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LabourStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "description" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "affectedFields" TEXT[],
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "performedById" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RequirementAudit" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RequirementAudit_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AuditLogToLabourProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AuditLogToLabourProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_email_status_idx" ON "User"("email", "status");

-- CreateIndex
CREATE UNIQUE INDEX "clients_userId_key" ON "clients"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_registrationNo_key" ON "clients"("registrationNo");

-- CreateIndex
CREATE INDEX "clients_companyName_idx" ON "clients"("companyName");

-- CreateIndex
CREATE INDEX "clients_registrationNo_idx" ON "clients"("registrationNo");

-- CreateIndex
CREATE INDEX "clients_companySector_idx" ON "clients"("companySector");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_userId_key" ON "Agency"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_registrationNo_key" ON "Agency"("registrationNo");

-- CreateIndex
CREATE INDEX "Agency_agencyName_idx" ON "Agency"("agencyName");

-- CreateIndex
CREATE INDEX "Agency_licenseNumber_idx" ON "Agency"("licenseNumber");

-- CreateIndex
CREATE INDEX "Agency_registrationNo_idx" ON "Agency"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- CreateIndex
CREATE INDEX "Document_labourProfileId_idx" ON "Document"("labourProfileId");

-- CreateIndex
CREATE INDEX "Document_ownerId_idx" ON "Document"("ownerId");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_ownerId_type_idx" ON "Document"("ownerId", "type");

-- CreateIndex
CREATE INDEX "Document_requirementId_status_idx" ON "Document"("requirementId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentRequirement_role_documentType_key" ON "DocumentRequirement"("role", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "LabourProfile_email_key" ON "LabourProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LabourProfile_phone_key" ON "LabourProfile"("phone");

-- CreateIndex
CREATE INDEX "LabourProfile_agencyId_idx" ON "LabourProfile"("agencyId");

-- CreateIndex
CREATE INDEX "LabourProfile_requirementId_idx" ON "LabourProfile"("requirementId");

-- CreateIndex
CREATE INDEX "LabourProfile_status_idx" ON "LabourProfile"("status");

-- CreateIndex
CREATE INDEX "LabourProfile_verificationStatus_idx" ON "LabourProfile"("verificationStatus");

-- CreateIndex
CREATE INDEX "LabourProfile_nationality_idx" ON "LabourProfile"("nationality");

-- CreateIndex
CREATE INDEX "LabourProfile_createdAt_idx" ON "LabourProfile"("createdAt");

-- CreateIndex
CREATE INDEX "LabourProfile_name_status_idx" ON "LabourProfile"("name", "status");

-- CreateIndex
CREATE INDEX "LabourProfile_passportNumber_idx" ON "LabourProfile"("passportNumber");

-- CreateIndex
CREATE INDEX "LabourAssignment_agencyId_idx" ON "LabourAssignment"("agencyId");

-- CreateIndex
CREATE INDEX "LabourAssignment_jobRoleId_idx" ON "LabourAssignment"("jobRoleId");

-- CreateIndex
CREATE INDEX "LabourAssignment_labourId_idx" ON "LabourAssignment"("labourId");

-- CreateIndex
CREATE UNIQUE INDEX "LabourAssignment_jobRoleId_labourId_key" ON "LabourAssignment"("jobRoleId", "labourId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_performedById_idx" ON "audit_logs"("performedById");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_action_idx" ON "audit_logs"("entityType", "action");

-- CreateIndex
CREATE INDEX "_RequirementAudit_B_index" ON "_RequirementAudit"("B");

-- CreateIndex
CREATE INDEX "_AuditLogToLabourProfile_B_index" ON "_AuditLogToLabourProfile"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_labourProfileId_fkey" FOREIGN KEY ("labourProfileId") REFERENCES "LabourProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "DocumentRequirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_assignedAgencyId_fkey" FOREIGN KEY ("assignedAgencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabourProfile" ADD CONSTRAINT "LabourProfile_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabourProfile" ADD CONSTRAINT "LabourProfile_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabourAssignment" ADD CONSTRAINT "LabourAssignment_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabourAssignment" ADD CONSTRAINT "LabourAssignment_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabourAssignment" ADD CONSTRAINT "LabourAssignment_labourId_fkey" FOREIGN KEY ("labourId") REFERENCES "LabourProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabourStageHistory" ADD CONSTRAINT "LabourStageHistory_labourId_fkey" FOREIGN KEY ("labourId") REFERENCES "LabourProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequirementAudit" ADD CONSTRAINT "_RequirementAudit_A_fkey" FOREIGN KEY ("A") REFERENCES "audit_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequirementAudit" ADD CONSTRAINT "_RequirementAudit_B_fkey" FOREIGN KEY ("B") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuditLogToLabourProfile" ADD CONSTRAINT "_AuditLogToLabourProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "audit_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuditLogToLabourProfile" ADD CONSTRAINT "_AuditLogToLabourProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "LabourProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
