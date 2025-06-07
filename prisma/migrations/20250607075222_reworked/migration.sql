-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('RECRUITMENT_ADMIN', 'CLIENT_ADMIN', 'RECRUITMENT_AGENCY');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'NOT_VERIFIED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'FULFILLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "LabourProfileStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SHORTLISTED', 'DEPLOYED', 'QVC_PROCESS', 'MEDICAL_PROCESS', 'VISA_PROCESS', 'READY_FOR_DEPLOYMENT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LICENSE', 'INSURANCE', 'ID_PROOF', 'ADDRESS_PROOF', 'COMPANY_REGISTRATION', 'PASSPORT', 'CV', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanySector" AS ENUM ('IT', 'REAL_ESTATE', 'HEALTHCARE', 'FINANCE', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION', 'EDUCATION', 'HOSPITALITY', 'OIL_GAS', 'TRANSPORTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ContractDuration" AS ENUM ('ONE_YEAR', 'TWO_YEARS', 'THREE_YEARS', 'UNLIMITED');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('ONE_WAY', 'TWO_WAY', 'NONE');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('FRESH', 'ONE_YEAR', 'TWO_YEARS', 'THREE_YEARS', 'FOUR_YEARS', 'FIVE_PLUS_YEARS');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_STATUS_CHANGED', 'USER_PASSWORD_RESET', 'CLIENT_CREATED', 'CLIENT_UPDATED', 'CLIENT_VERIFIED', 'CLIENT_REJECTED', 'AGENCY_CREATED', 'AGENCY_UPDATED', 'AGENCY_VERIFIED', 'AGENCY_REJECTED', 'REQUIREMENT_CREATED', 'REQUIREMENT_UPDATED', 'REQUIREMENT_STATUS_CHANGED', 'REQUIREMENT_ASSIGNED', 'LABOUR_PROFILE_CREATED', 'LABOUR_PROFILE_UPDATED', 'LABOUR_STATUS_CHANGED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ACCOUNT_RECOVERY');

-- CreateEnum
CREATE TYPE "ProcedureStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'REQUIREMENT', 'LABOUR', 'DOCUMENT', 'ACCOUNT', 'GENERAL');

-- CreateEnum
CREATE TYPE "DeletionType" AS ENUM ('SCHEDULED', 'IMMEDIATE');

-- CreateTable
CREATE TABLE "users" (
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

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyName" VARCHAR(255) NOT NULL,
    "registrationNo" VARCHAR(50),
    "licenseNumber" VARCHAR(50) NOT NULL,
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "regions" TEXT[],
    "website" VARCHAR(255),
    "address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "requirements" (
    "id" TEXT NOT NULL,
    "projectLocation" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "contractDuration" "ContractDuration" NOT NULL,
    "specialNotes" TEXT,
    "status" "RequirementStatus" NOT NULL DEFAULT 'DRAFT',
    "languages" TEXT[],
    "minExperience" "ExperienceLevel" NOT NULL,
    "maxAge" INTEGER,
    "ticketType" "TicketType",
    "ticketProvided" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT NOT NULL,
    "assignedAgencyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_roles" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "nationality" VARCHAR(100) NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "salaryCurrency" VARCHAR(3) NOT NULL DEFAULT 'QAR',
    "requirementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labour_profiles" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "nationality" VARCHAR(100) NOT NULL,
    "maritalStatus" VARCHAR(50),
    "skills" TEXT[],
    "experienceYears" INTEGER NOT NULL,
    "education" TEXT,
    "currentPosition" VARCHAR(100),
    "currentCompany" VARCHAR(100),
    "languages" TEXT[],
    "englishProficiency" VARCHAR(50),
    "email" VARCHAR(255),
    "phone" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "cvUrl" TEXT NOT NULL,
    "passportNumber" VARCHAR(50),
    "passportExpiry" TIMESTAMP(3),
    "visaType" VARCHAR(50),
    "visaExpiry" TIMESTAMP(3),
    "medicalStatus" VARCHAR(50),
    "medicalExpiry" TIMESTAMP(3),
    "photo" TEXT,
    "otherDocs" TEXT[],
    "status" "LabourProfileStatus" NOT NULL DEFAULT 'RECEIVED',
    "statusReason" TEXT,
    "requirementId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "deploymentDate" TIMESTAMP(3),
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labour_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedures" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ProcedureStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "comments" TEXT,
    "metadata" JSONB,
    "requirementId" TEXT,
    "labourProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labour_status_logs" (
    "id" TEXT NOT NULL,
    "status" "LabourProfileStatus" NOT NULL,
    "comments" TEXT,
    "metadata" JSONB,
    "labourProfileId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "labour_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_documents" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "name" VARCHAR(255),
    "description" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT,
    "expiryDate" TIMESTAMP(3),
    "clientId" TEXT NOT NULL,
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_documents" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "name" VARCHAR(255),
    "description" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT,
    "expiryDate" TIMESTAMP(3),
    "agencyId" TEXT NOT NULL,
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agency_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_documents" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "name" VARCHAR(255),
    "description" TEXT,
    "requirementId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirement_documents_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "recipientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_email_status_idx" ON "users"("email", "status");

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
CREATE UNIQUE INDEX "agencies_userId_key" ON "agencies"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "agencies_registrationNo_key" ON "agencies"("registrationNo");

-- CreateIndex
CREATE INDEX "agencies_agencyName_idx" ON "agencies"("agencyName");

-- CreateIndex
CREATE INDEX "agencies_licenseNumber_idx" ON "agencies"("licenseNumber");

-- CreateIndex
CREATE INDEX "agencies_registrationNo_idx" ON "agencies"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- CreateIndex
CREATE INDEX "requirements_clientId_idx" ON "requirements"("clientId");

-- CreateIndex
CREATE INDEX "requirements_status_idx" ON "requirements"("status");

-- CreateIndex
CREATE INDEX "requirements_startDate_idx" ON "requirements"("startDate");

-- CreateIndex
CREATE INDEX "requirements_createdAt_idx" ON "requirements"("createdAt");

-- CreateIndex
CREATE INDEX "requirements_clientId_status_idx" ON "requirements"("clientId", "status");

-- CreateIndex
CREATE INDEX "requirements_assignedAgencyId_status_idx" ON "requirements"("assignedAgencyId", "status");

-- CreateIndex
CREATE INDEX "requirements_startDate_contractDuration_idx" ON "requirements"("startDate", "contractDuration");

-- CreateIndex
CREATE INDEX "job_roles_requirementId_idx" ON "job_roles"("requirementId");

-- CreateIndex
CREATE INDEX "job_roles_nationality_idx" ON "job_roles"("nationality");

-- CreateIndex
CREATE INDEX "job_roles_salary_idx" ON "job_roles"("salary");

-- CreateIndex
CREATE INDEX "labour_profiles_agencyId_idx" ON "labour_profiles"("agencyId");

-- CreateIndex
CREATE INDEX "labour_profiles_requirementId_idx" ON "labour_profiles"("requirementId");

-- CreateIndex
CREATE INDEX "labour_profiles_status_idx" ON "labour_profiles"("status");

-- CreateIndex
CREATE INDEX "labour_profiles_nationality_idx" ON "labour_profiles"("nationality");

-- CreateIndex
CREATE INDEX "labour_profiles_agencyId_status_idx" ON "labour_profiles"("agencyId", "status");

-- CreateIndex
CREATE INDEX "labour_profiles_nationality_gender_idx" ON "labour_profiles"("nationality", "gender");

-- CreateIndex
CREATE INDEX "labour_profiles_status_createdAt_idx" ON "labour_profiles"("status", "createdAt");

-- CreateIndex
CREATE INDEX "procedures_requirementId_idx" ON "procedures"("requirementId");

-- CreateIndex
CREATE INDEX "procedures_labourProfileId_idx" ON "procedures"("labourProfileId");

-- CreateIndex
CREATE INDEX "procedures_status_idx" ON "procedures"("status");

-- CreateIndex
CREATE INDEX "procedures_dueDate_idx" ON "procedures"("dueDate");

-- CreateIndex
CREATE INDEX "labour_status_logs_labourProfileId_idx" ON "labour_status_logs"("labourProfileId");

-- CreateIndex
CREATE INDEX "labour_status_logs_changedById_idx" ON "labour_status_logs"("changedById");

-- CreateIndex
CREATE INDEX "labour_status_logs_createdAt_idx" ON "labour_status_logs"("createdAt");

-- CreateIndex
CREATE INDEX "labour_status_logs_status_createdAt_idx" ON "labour_status_logs"("status", "createdAt");

-- CreateIndex
CREATE INDEX "client_documents_clientId_idx" ON "client_documents"("clientId");

-- CreateIndex
CREATE INDEX "client_documents_type_idx" ON "client_documents"("type");

-- CreateIndex
CREATE INDEX "client_documents_verified_idx" ON "client_documents"("verified");

-- CreateIndex
CREATE INDEX "client_documents_expiryDate_idx" ON "client_documents"("expiryDate");

-- CreateIndex
CREATE INDEX "agency_documents_agencyId_idx" ON "agency_documents"("agencyId");

-- CreateIndex
CREATE INDEX "agency_documents_type_idx" ON "agency_documents"("type");

-- CreateIndex
CREATE INDEX "agency_documents_verified_idx" ON "agency_documents"("verified");

-- CreateIndex
CREATE INDEX "agency_documents_expiryDate_idx" ON "agency_documents"("expiryDate");

-- CreateIndex
CREATE INDEX "requirement_documents_requirementId_idx" ON "requirement_documents"("requirementId");

-- CreateIndex
CREATE INDEX "requirement_documents_type_idx" ON "requirement_documents"("type");

-- CreateIndex
CREATE INDEX "requirement_documents_createdAt_idx" ON "requirement_documents"("createdAt");

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
CREATE INDEX "notifications_recipientId_idx" ON "notifications"("recipientId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_recipientId_read_idx" ON "notifications"("recipientId", "read");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_assignedAgencyId_fkey" FOREIGN KEY ("assignedAgencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_roles" ADD CONSTRAINT "job_roles_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labour_profiles" ADD CONSTRAINT "labour_profiles_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labour_profiles" ADD CONSTRAINT "labour_profiles_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_labourProfileId_fkey" FOREIGN KEY ("labourProfileId") REFERENCES "labour_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labour_status_logs" ADD CONSTRAINT "labour_status_logs_labourProfileId_fkey" FOREIGN KEY ("labourProfileId") REFERENCES "labour_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labour_status_logs" ADD CONSTRAINT "labour_status_logs_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_documents" ADD CONSTRAINT "agency_documents_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_documents" ADD CONSTRAINT "agency_documents_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_documents" ADD CONSTRAINT "requirement_documents_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_documents" ADD CONSTRAINT "requirement_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
