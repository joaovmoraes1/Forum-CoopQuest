/*
  Warnings:

  - You are about to drop the column `status` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TopicReply` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Challenge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChallengePlayers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TopicReply" DROP CONSTRAINT "TopicReply_topicId_fkey";

-- DropForeignKey
ALTER TABLE "_ChallengePlayers" DROP CONSTRAINT "_ChallengePlayers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChallengePlayers" DROP CONSTRAINT "_ChallengePlayers_B_fkey";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "category",
DROP COLUMN "tags",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "TopicReply" DROP COLUMN "updatedAt",
ALTER COLUMN "content" SET DEFAULT '';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdmin",
DROP COLUMN "updatedAt",
DROP COLUMN "username";

-- DropTable
DROP TABLE "Challenge";

-- DropTable
DROP TABLE "_ChallengePlayers";

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tips" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeParticipation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeParticipation_pkey" PRIMARY KEY ("id")
);

-- RenameForeignKey
ALTER TABLE "Report" RENAME CONSTRAINT "Report_reply_fkey" TO "fk_report_reply";

-- RenameForeignKey
ALTER TABLE "Report" RENAME CONSTRAINT "Report_topic_fkey" TO "fk_report_topic";

-- AddForeignKey
ALTER TABLE "TopicReply" ADD CONSTRAINT "TopicReply_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipation" ADD CONSTRAINT "ChallengeParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipation" ADD CONSTRAINT "ChallengeParticipation_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "DailyChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
