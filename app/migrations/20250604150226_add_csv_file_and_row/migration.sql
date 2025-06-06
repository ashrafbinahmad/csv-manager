-- DropForeignKey
ALTER TABLE "CsvRow" DROP CONSTRAINT "CsvRow_csvFileId_fkey";

-- CreateIndex
CREATE INDEX "CsvFile_userId_idx" ON "CsvFile"("userId");

-- CreateIndex
CREATE INDEX "CsvRow_csvFileId_idx" ON "CsvRow"("csvFileId");

-- CreateIndex
CREATE INDEX "CsvRow_rowIndex_idx" ON "CsvRow"("rowIndex");

-- AddForeignKey
ALTER TABLE "CsvRow" ADD CONSTRAINT "CsvRow_csvFileId_fkey" FOREIGN KEY ("csvFileId") REFERENCES "CsvFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
