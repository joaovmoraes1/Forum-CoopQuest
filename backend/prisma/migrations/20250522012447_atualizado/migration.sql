-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reply_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_topic_fkey";

-- DropIndex
DROP INDEX "ChallengeParticipation_challengeId_idx";

-- DropIndex
DROP INDEX "ChallengeParticipation_userId_idx";

-- DropIndex
DROP INDEX "DailyChallenge_startDate_idx";

-- DropIndex
DROP INDEX "Event_date_idx";

-- DropIndex
DROP INDEX "EventParticipation_eventId_idx";

-- DropIndex
DROP INDEX "EventParticipation_userId_idx";

-- DropIndex
DROP INDEX "Faq_category_idx";

-- DropIndex
DROP INDEX "Report_userId_idx";

-- DropIndex
DROP INDEX "Topic_authorId_idx";

-- DropIndex
DROP INDEX "TopicReply_authorId_idx";

-- DropIndex
DROP INDEX "TopicReply_topicId_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- CreateTable
CREATE TABLE "GameRoom" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" INTEGER NOT NULL,
    "guestId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GameRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameRoom_code_key" ON "GameRoom"("code");

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
