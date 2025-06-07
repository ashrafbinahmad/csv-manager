/*
  Warnings:

  - Added the required column `userId` to the `BatchType` table without a default value. This is not possible if the table is not empty.

*/
-- First add the column as nullable
ALTER TABLE "BatchType" ADD COLUMN "userId" TEXT;

-- Create an index on the new column
CREATE INDEX "BatchType_userId_idx" ON "BatchType"("userId");

-- Add the foreign key constraint
ALTER TABLE "BatchType" ADD CONSTRAINT "BatchType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update existing records to use the first admin user
UPDATE "BatchType" SET "userId" = (SELECT id FROM "User" WHERE "isAdmin" = true LIMIT 1);

-- Make the column required
ALTER TABLE "BatchType" ALTER COLUMN "userId" SET NOT NULL;
