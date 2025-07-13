-- CreateTable
CREATE TABLE "OfferLetterDetails" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "workingHours" TEXT,
    "workingDays" TEXT,
    "leaveSalary" TEXT,
    "endOfService" TEXT,
    "probationPeriod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferLetterDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfferLetterDetails_requirementId_key" ON "OfferLetterDetails"("requirementId");

-- AddForeignKey
ALTER TABLE "OfferLetterDetails" ADD CONSTRAINT "OfferLetterDetails_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
