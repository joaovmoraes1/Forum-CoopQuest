-- AlterTable
ALTER TABLE "Report" ADD COLUMN "contentId" INTEGER;

-- Preencher contentId com base em topicId e replyId
UPDATE "Report" SET "contentId" = "topicId" WHERE "contentType" = 'topic' AND "topicId" IS NOT NULL;
UPDATE "Report" SET "contentId" = "replyId" WHERE "contentType" = 'reply' AND "replyId" IS NOT NULL;

-- Tornar contentId NOT NULL após preenchê-lo
ALTER TABLE "Report" ALTER COLUMN "contentId" SET NOT NULL;

-- DropForeignKey (remover as constraints de topicId e replyId, se existirem)
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_topic_fkey";
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_reply_fkey";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "topicId";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "replyId";

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_recipientId_idx" ON "Message"("recipientId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_topic_fkey" FOREIGN KEY ("contentId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reply_fkey" FOREIGN KEY ("contentId") REFERENCES "TopicReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;