const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const saltRounds = 10;

async function main() {
  // Clear all existing data to avoid duplicates
  await prisma.message.deleteMany();
  await prisma.eventParticipation.deleteMany();
  await prisma.event.deleteMany();
  await prisma.challengeParticipation.deleteMany();
  await prisma.dailyChallenge.deleteMany();
  await prisma.report.deleteMany();
  await prisma.topicReply.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.user.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.tutorial.deleteMany();

  // Seed Users
  const users = [
    {
      email: "joaovitorrodriguesmoraes207@gmail.com",
      password: "Vencedor17@",
      name: "João Moraes",
      avatar: "profile.png",
      phone: "9198161403",
      location: "Cidade Nova",
      bio: "Gosto de Futebol",
    },
    {
      email: "angelarodrigues851@gmail.com",
      password: "Vencedor17",
      name: "Angela Maria",
      avatar: "angelina.png",
      phone: "91985047454",
      location: "Terra Alta",
      bio: "Amo tecnologia",
    },
    {
      email: "sof.rodriguesmoraes@gmail.com",
      password: "Vencedor15@",
      name: "Sofia Rodrigues",
      avatar: "sofia.png",
      phone: "91989198203",
      location: "Castanhal",
      bio: "Sou Terapeuta Ocupacional",
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        createdAt: new Date(),
        lastActivity: new Date(),
        isOnline: false,
        level: 1,
        projects: 0,
      },
    });
    console.log(`✅ Usuário criado: ${user.email}`);
  }

  // Fetch created users to get their IDs
  const joao = await prisma.user.findUnique({
    where: { email: "joaovitorrodriguesmoraes207@gmail.com" },
  });
  const angela = await prisma.user.findUnique({
    where: { email: "angelarodrigues851@gmail.com" },
  });
  const sofia = await prisma.user.findUnique({
    where: { email: "sof.rodriguesmoraes@gmail.com" },
  });

  // Seed Topics
  await prisma.topic.createMany({
    data: [
      {
        title: "Dicas para iniciantes em programação",
        content:
          "Quais são as melhores práticas para quem está começando a programar? Compartilhe suas dicas!",
        category: "programacao",
        author: joao.name,
        authorId: joao.id,
        date: new Date(),
        repliesCount: 1,
        views: 10,
        likes: 3,
        tags: ["programacao", "iniciante"],
      },
      {
        title: "Melhores jogos cooperativos de 2025",
        content:
          "Quais jogos cooperativos vocês recomendam este ano? Estou procurando algo novo para jogar com amigos.",
        category: "jogos",
        author: angela.name,
        authorId: angela.id,
        date: new Date(),
        repliesCount: 1,
        views: 15,
        likes: 5,
        tags: ["jogos", "cooperativo"],
      },
    ],
  });

  // Fetch created topics to get their IDs
  const topic1 = await prisma.topic.findFirst({
    where: { title: "Dicas para iniciantes em programação" },
  });
  const topic2 = await prisma.topic.findFirst({
    where: { title: "Melhores jogos cooperativos de 2025" },
  });

  // Seed TopicReplies
  await prisma.topicReply.createMany({
    data: [
      {
        topicId: topic1.id,
        content:
          "Recomendo começar com Python, é bem amigável para iniciantes!",
        author: angela.name,
        authorId: angela.id,
        date: new Date(),
        likes: 2,
      },
      {
        topicId: topic2.id,
        content: "Experimente Overcooked 2, é muito divertido em grupo!",
        author: sofia.name,
        authorId: sofia.id,
        date: new Date(),
        likes: 4,
      },
    ],
  });

  // Fetch created reply to get its ID (if needed for reports)
  const reply1 = await prisma.topicReply.findFirst({
    where: {
      content: "Recomendo começar com Python, é bem amigável para iniciantes!",
    },
  });

  // Seed Reports
  await prisma.report.create({
    data: {
      userId: sofia.id,
      date: new Date(),
      contentId: topic1.id,
      contentType: "topic",
      reason: "spam",
    },
  });

  // Seed DailyChallenge
  await prisma.dailyChallenge.create({
    data: {
      title: "Desafio de Programação: Fibonacci",
      description:
        "Escreva uma função para gerar a sequência de Fibonacci até o 10º termo.",
      tips: "Use um loop ou recursão para calcular os termos.",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expira em 7 dias
      active: true,
      reward: 50,
    },
  });

  // Fetch created challenge to get its ID
  const challenge = await prisma.dailyChallenge.findFirst({
    where: { title: "Desafio de Programação: Fibonacci" },
  });

  // Seed ChallengeParticipation
  await prisma.challengeParticipation.createMany({
    data: [
      {
        userId: joao.id,
        challengeId: challenge.id,
        progress: 5,
        completed: false,
      },
      {
        userId: angela.id,
        challengeId: challenge.id,
        progress: 8,
        completed: true,
      },
    ],
  });

  // Seed Events
  await prisma.event.createMany({
    data: [
      {
        title: "Introdução à Lógica de Programação",
        description: "Aprenda os conceitos básicos de lógica de programação.",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Daqui a 2 dias
        time: "18:00",
        participants: 0,
        type: "Workshop",
      },
      {
        title: "Desafios de Lógica para Iniciantes",
        description: "Resolva problemas práticos de lógica de programação.",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Daqui a 5 dias
        time: "19:00",
        participants: 0,
        type: "Competicao",
      },
      {
        title: "Lógica de Programação Avançada",
        description: "Aprofunde seus conhecimentos em lógica.",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Daqui a 10 dias
        time: "20:00",
        participants: 0,
        type: "Meetup",
      },
    ],
  });

  // Fetch all created events
  const events = await prisma.event.findMany();

  // Seed EventParticipation (João e Sofia participam de todos os eventos)
  const eventParticipationData = [];
  for (const event of events) {
    eventParticipationData.push(
      { userId: joao.id, eventId: event.id },
      { userId: sofia.id, eventId: event.id }
    );
  }
  await prisma.eventParticipation.createMany({
    data: eventParticipationData,
  });

  // Seed Messages
  await prisma.message.createMany({
    data: [
      {
        senderId: joao.id,
        recipientId: angela.id,
        content: "Oi Angela, você vai ao workshop de lógica?",
        date: new Date(),
      },
      {
        senderId: angela.id,
        recipientId: joao.id,
        content: "Oi João, sim, estarei lá! Nos vemos no evento.",
        date: new Date(),
      },
    ],
  });

  // Seed FAQs
  await prisma.faq.createMany({
    data: [
      {
        category: "geral",
        question: "Como posso me registrar no CoopQuest?",
        answer:
          'Para se registrar, clique em "Registrar" na página inicial e preencha o formulário com seu nome, email e senha.',
      },
      {
        category: "geral",
        question: "O que é o CoopQuest?",
        answer:
          "O CoopQuest é uma plataforma de fórum colaborativo para entusiastas de jogos, programação e desafios diários. Nossa comunidade compartilha conhecimento, participa de desafios e cresce junto.",
      },
      {
        category: "forum",
        question: "Como criar um novo tópico no fórum?",
        answer:
          'Para criar um novo tópico, navegue até a categoria desejada e clique no botão "Novo Tópico". Preencha o título, o conteúdo da mensagem e adicione tags relevantes. Clique em "Publicar" para criar seu tópico.',
      },
      {
        category: "desafios",
        question: "Como participar dos desafios diários?",
        answer:
          'Acesse a seção "Desafios" no menu principal. Selecione o desafio atual e clique em "Participar". Siga as instruções fornecidas e envie sua solução dentro do prazo indicado.',
      },
      {
        category: "perfil",
        question: "Como altero minha senha?",
        answer:
          'Vá até as configurações do seu perfil e clique em "Alterar Senha". Insira sua senha atual e a nova senha.',
      },
      {
        category: "suporte",
        question: "Como entrar em contato com o suporte?",
        answer:
          'Você pode entrar em contato com nossa equipe de suporte através do formulário na página "Suporte" ou criar um tópico na categoria "Suporte" no fórum.',
      },
    ],
  });

  // Seed Tutorials
  await prisma.tutorial.createMany({
    data: [
      {
        title: "Primeiros Passos no CoopQuest",
        description: "Aprenda a criar sua conta e começar a usar a plataforma.",
        link: "/tutoriais/primeiros-passos",
        icon: "HelpCircle",
      },
      {
        title: "Participando de Eventos",
        description:
          "Descubra como se inscrever e participar de eventos no CoopQuest.",
        link: "/tutoriais/eventos",
        icon: "Calendar",
      },
      {
        title: "Participando de Desafios",
        description:
          "Como participar e enviar soluções para os desafios diários.",
        link: "/tutoriais/desafios",
        icon: "Calendar",
      },
      {
        title: "Criando Tópicos Eficientes",
        description: "Dicas para criar tópicos que recebem respostas rápidas.",
        link: "/tutoriais/topicos-eficientes",
        icon: "HelpCircle",
      },
      {
        title: "Configurações de Privacidade",
        description:
          "Como gerenciar suas configurações de privacidade e segurança.",
        link: "/tutoriais/privacidade",
        icon: "HelpCircle",
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });