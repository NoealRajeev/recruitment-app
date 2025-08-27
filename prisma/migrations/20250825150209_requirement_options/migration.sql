-- CreateEnum
CREATE TYPE "RequirementOptionType" AS ENUM ('JOB_TITLE', 'TICKET_FREQUENCY', 'WORK_LOCATION', 'PREVIOUS_EXPERIENCE', 'LANGUAGE', 'CURRENCY');

-- CreateTable
CREATE TABLE "RequirementOption" (
    "id" TEXT NOT NULL,
    "type" "RequirementOptionType" NOT NULL,
    "value" VARCHAR(120) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequirementOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequirementOption_type_isActive_order_idx" ON "RequirementOption"("type", "isActive", "order");

-- CreateIndex
CREATE UNIQUE INDEX "RequirementOption_type_value_key" ON "RequirementOption"("type", "value");
