/*
  Warnings:

  - You are about to drop the column `columnHeaders` on the `CsvFile` table. All the data in the column will be lost.
  - Added the required column `batchTypeId` to the `CsvFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CsvFile" DROP COLUMN "columnHeaders",
ADD COLUMN     "batchTypeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BatchType" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "columns" TEXT[],

    CONSTRAINT "BatchType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CsvFile_batchTypeId_idx" ON "CsvFile"("batchTypeId");

-- AddForeignKey
ALTER TABLE "CsvFile" ADD CONSTRAINT "CsvFile_batchTypeId_fkey" FOREIGN KEY ("batchTypeId") REFERENCES "BatchType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
