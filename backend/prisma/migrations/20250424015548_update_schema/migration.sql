/*
  Warnings:
  - Changed the type of `contentType` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
*/

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('topic', 'reply');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Competicao', 'Workshop', 'Meetup');

-- Adicionar uma nova coluna temporária para contentType na tabela Report
ALTER TABLE "Report" ADD COLUMN "contentType_temp" "ContentType";

-- Copiar os dados existentes de contentType para contentType_temp, convertendo os valores
UPDATE "Report"
SET "contentType_temp" = CASE
  WHEN "contentType" = 'topic' THEN 'topic'::"ContentType"
  WHEN "contentType" = 'reply' THEN 'reply'::"ContentType"
  ELSE 'topic'::"ContentType" -- Valor padrão para casos inválidos
END;

-- Dropar a coluna antiga contentType
ALTER TABLE "Report" DROP COLUMN "contentType";

-- Renomear a coluna temporária para contentType
ALTER TABLE "Report" RENAME COLUMN "contentType_temp" TO "contentType";

-- Tornar a coluna contentType obrigatória (NOT NULL)
ALTER TABLE "Report" ALTER COLUMN "contentType" SET NOT NULL;

-- Verificar se a tabela Event já existe antes de criá-la
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Event') THEN
    CREATE TABLE "Event" (
      "id" SERIAL NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL,
      "time" TEXT NOT NULL,
      "participants" INTEGER NOT NULL DEFAULT 0,
      "type" "EventType" NOT NULL,
      CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
    );
  ELSE
    -- Se a tabela Event já existe, verificar se a coluna type precisa ser convertida
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Event' AND column_name = 'type' AND data_type = 'text') THEN
      -- Adicionar coluna temporária para type
      ALTER TABLE "Event" ADD COLUMN "type_temp" "EventType";

      -- Copiar os dados existentes de type para type_temp
      UPDATE "Event"
      SET "type_temp" = CASE
        WHEN "type" = 'Competição' THEN 'Competicao'::"EventType"
        WHEN "type" = 'Workshop' THEN 'Workshop'::"EventType"
        WHEN "type" = 'Meetup' THEN 'Meetup'::"EventType"
        ELSE 'Competicao'::"EventType" -- Valor padrão para casos inválidos
      END;

      -- Dropar a coluna antiga type
      ALTER TABLE "Event" DROP COLUMN "type";

      -- Renomear a coluna temporária para type
      ALTER TABLE "Event" RENAME COLUMN "type_temp" TO "type";

      -- Tornar a coluna type obrigatória (NOT NULL)
      ALTER TABLE "Event" ALTER COLUMN "type" SET NOT NULL;
    END IF;
  END IF;
END $$;

-- Verificar se a tabela EventParticipation já existe antes de criá-la
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'EventParticipation') THEN
    CREATE TABLE "EventParticipation" (
      "userId" INTEGER NOT NULL,
      "eventId" INTEGER NOT NULL,
      CONSTRAINT "EventParticipation_pkey" PRIMARY KEY ("userId","eventId")
    );

    -- Adicionar chaves estrangeiras para EventParticipation
    ALTER TABLE "EventParticipation" ADD CONSTRAINT "EventParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    ALTER TABLE "EventParticipation" ADD CONSTRAINT "EventParticipation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;