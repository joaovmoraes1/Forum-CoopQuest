/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ChallengeParticipation` table. All the data in the column will be lost.
  - You are about to alter the column `progress` on the `ChallengeParticipation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Made the column `tips` on table `DailyChallenge` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChallengeParticipation" DROP COLUMN "createdAt",
ALTER COLUMN "progress" SET DEFAULT 0,
ALTER COLUMN "progress" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "DailyChallenge" ALTER COLUMN "tips" SET NOT NULL;
