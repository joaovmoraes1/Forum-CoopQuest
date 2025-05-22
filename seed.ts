import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  // Inserir usuários
  await prisma.user.createMany({
    data: [
      {
        name: 'João Vitor Rodrigues Moraes',
        email: 'joaovitorrodriguesmoraes207@gmail.com',
        password: 'Vencedor17@',
        avatar: '/profile.png',
      },
      {
        name: 'Angela Maria',
        email: 'angelarodrigues851@gmail.com',
        password: 'Vencedor17',
        avatar: '/angelina.png',
      },
      {
        name: 'Sofia Rodrigues Moraes',
        email: 'sof.rodriguesmoraes@gmail.com',
        password: 'Vencedor15@',
        avatar: '/sofia.png',
      },
    ],
  });

  // Inserir tópicos
  await prisma.topic.createMany({
    data: [
      {
        title: 'Jogo de lógica usando JavaScript',
        content: 'abordando lógica',
        author: 'Liedson',
        authorId: 1,
        date: new Date(),
        repliesCount: 0,
        views: 20,
        likes: 0,
      },
    ],
  });

  // Inserir respostas
  await prisma.topicReply.create({
    data: {
      topicId: 1,
      content: 'This is a reply to the first topic',
      author: 'Sofia',
      authorId: 2,
      date: new Date(),
      likes: 0,
    },
  });

  console.log('Dados inseridos com sucesso!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });