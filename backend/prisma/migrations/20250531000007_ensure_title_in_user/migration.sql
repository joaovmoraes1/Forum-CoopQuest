-- DropForeignKey
ALTER TABLE "GameRoom" DROP CONSTRAINT "GameRoom_hostId_fkey";

-- AddForeignKey
ALTER TABLE "GameRoom" ADD CONSTRAINT "GameRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON UPDATE CASCADE;