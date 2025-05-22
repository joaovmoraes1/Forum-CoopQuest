/*
  Warnings:

  - Made the column `lastActivity` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Topic" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastActivity" SET NOT NULL,
ALTER COLUMN "lastActivity" SET DEFAULT CURRENT_TIMESTAMP;
