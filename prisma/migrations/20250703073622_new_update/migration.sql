-- CreateTable
CREATE TABLE "JobRoleForwarding" (
    "id" TEXT NOT NULL,
    "jobRoleId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobRoleForwarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobRoleForwarding_jobRoleId_agencyId_key" ON "JobRoleForwarding"("jobRoleId", "agencyId");

-- AddForeignKey
ALTER TABLE "JobRoleForwarding" ADD CONSTRAINT "JobRoleForwarding_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRoleForwarding" ADD CONSTRAINT "JobRoleForwarding_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
