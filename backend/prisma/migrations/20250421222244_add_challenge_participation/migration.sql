/*
  Warnings:

  - The primary key for the `ChallengeParticipation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ChallengeParticipation` table. All the data in the column will be lost.
  - You are about to drop the column `joinedAt` on the `ChallengeParticipation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChallengeParticipation" DROP CONSTRAINT "ChallengeParticipation_pkey",
DROP COLUMN "id",
DROP COLUMN "joinedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD CONSTRAINT "ChallengeParticipation_pkey" PRIMARY KEY ("userId", "challengeId");
