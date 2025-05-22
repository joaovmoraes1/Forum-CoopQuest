/*
  Warnings:

  - You are about to drop the column `category` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Topic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "category",
DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastActivity" DROP NOT NULL,
ALTER COLUMN "lastActivity" DROP DEFAULT;
