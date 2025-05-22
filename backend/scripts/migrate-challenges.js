const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateChallenges() {
  try {
    // Verificar se a tabela antiga "DailyChallenge" existe e contém dados
    // Nota: A consulta raw pode variar dependendo do banco de dados (aqui é para PostgreSQL)
    const oldChallenges = await prisma.$queryRaw`SELECT * FROM "DailyChallenge"`;
    
    if (oldChallenges && oldChallenges.length > 0) {
      console.log(`Encontrados ${oldChallenges.length} desafios diários para migrar...`);

      // Inserir os dados na nova tabela WeeklyChallenge
      for (const challenge of oldChallenges) {
        await prisma.weeklyChallenge.create({
          data: {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            tips: challenge.tips,
            startDate: challenge.startDate,
            endDate: challenge.endDate,
            active: challenge.active,
            reward: challenge.reward,
          },
        });
      }

      console.log('Migração de desafios concluída com sucesso!');
    } else {
      console.log('Nenhum desafio diário encontrado para migrar.');
    }
  } catch (error) {
    console.error('Erro ao migrar desafios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateChallenges();