-- 1. Renomeie a tabela (em vez de dropar)
ALTER TABLE "DailyChallenge" RENAME TO "WeeklyChallenge";

-- 2. Atualize a FK sem dropar (opcional, apenas se o nome da coluna mudar)
-- ALTER TABLE "ChallengeParticipation" RENAME COLUMN "challengeId" TO "weeklyChallengeId";

-- 3. Atualize a FK para apontar para a tabela renomeada (se necessário)
ALTER TABLE "ChallengeParticipation" 
DROP CONSTRAINT "ChallengeParticipation_challengeId_fkey",
ADD CONSTRAINT "ChallengeParticipation_challengeId_fkey" 
FOREIGN KEY ("challengeId") REFERENCES "WeeklyChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;