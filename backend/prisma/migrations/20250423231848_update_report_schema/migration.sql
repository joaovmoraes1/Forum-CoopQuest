/*
  Warnings:

  - You are about to drop the column `contentId` on the `Report` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reply_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_topic_fkey";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "contentId",
ADD COLUMN     "replyId" INTEGER,
ADD COLUMN     "topicId" INTEGER;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "TopicReply"("id") ON DELETE SET NULL ON UPDATE CASCADE;
