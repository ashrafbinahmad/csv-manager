/*
  Warnings:

  - Added the required column `sortOrder` to the `CsvRow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CsvRow" ADD COLUMN     "sortOrder" INTEGER NOT NULL;
