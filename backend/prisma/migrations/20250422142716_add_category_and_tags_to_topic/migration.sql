/*
  Warnings:

  - Added the required column `category` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[];
