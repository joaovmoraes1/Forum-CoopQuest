/*
  Warnings:

  - You are about to drop the column `twitterUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "twitterUrl",
ADD COLUMN     "instagramUrl" TEXT;
