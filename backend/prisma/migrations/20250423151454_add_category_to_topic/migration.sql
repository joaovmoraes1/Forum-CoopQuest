/*
  Warnings:

  - Made the column `contentId` on table `Report` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "fk_report_reply";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "fk_report_topic";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "contentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "category" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_topic_fkey" FOREIGN KEY ("contentId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reply_fkey" FOREIGN KEY ("contentId") REFERENCES "TopicReply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
