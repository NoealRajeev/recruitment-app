-- AlterTable
ALTER TABLE "LabourAssignment" ADD COLUMN     "additionalDocumentsUrls" TEXT[],
ADD COLUMN     "employmentContractUrl" TEXT,
ADD COLUMN     "flightTicketUrl" TEXT,
ADD COLUMN     "medicalCertificateUrl" TEXT,
ADD COLUMN     "policeClearanceUrl" TEXT,
ADD COLUMN     "travelDate" TIMESTAMP(3);
