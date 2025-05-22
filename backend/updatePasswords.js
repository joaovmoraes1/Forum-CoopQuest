const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

require('dotenv').config();

const prisma = new PrismaClient();
const saltRounds = 10;

async function updatePasswords() {
  try {
    // Lista de usuários com as senhas corretas
    const users = [
      { email: 'joaovitorrodriguesmoraes207@gmail.com', password: 'Vencedor17@', name: 'João Moraes', avatar: 'profile.png', phone: '9198161403', location: 'Cidade Nova', bio: 'Gosto de Futebol' },
      { email: 'angelarodrigues851@gmail.com', password: 'Vencedor17', name: 'Angela Maria', avatar: 'angelina.png', phone: '91985047454', location: 'Terra Alta', bio: 'Amo tecnologia' },
      { email: 'sof.rodriguesmoraes@gmail.com', password: 'Vencedor15@', name: 'Sofia Rodrigues', avatar: 'sofia.png', phone: '91989198203', location: 'Castanhal', bio: 'Sou Terapeuta Ocupacional' },
    ];

    // Atualiza ou cria cada usuário
    for (const user of users) {
      // Verifica se o usuário existe
      let existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        console.log(`⚠️ Usuário não encontrado: ${user.email}. Criando novo usuário...`);
        // Cria o usuário
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        existingUser = await prisma.user.create({
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
          },
        });
        console.log(`✅ Novo usuário criado: ${user.email}`);
        continue;
      }

      // Valida o comprimento da senha
      if (user.password.length < 6) {
        console.log(`⚠️ Senha muito curta para ${user.email}: ${user.password}`);
        continue;
      }

      // Verifica se a senha já está criptografada
      if (existingUser.password.startsWith('$2b$')) {
        console.log(`⚠️ Senha já criptografada para: ${user.email}`);
        continue;
      }

      // Criptografa a senha
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      console.log(`🔒 Senha criptografada para ${user.email}: ${hashedPassword}`);

      // Atualiza o usuário no banco de dados
      await prisma.user.update({
        where: { email: user.email },
        data: { password: hashedPassword },
      });

      console.log(`✅ Senha atualizada para: ${user.email}`);
    }

    console.log('\n🚀 Todas as senhas foram processadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar senhas:', error.message);
    if (error.code === 'P2002') {
      console.error('❌ Conflito de constraint único. Verifique o campo mencionado no erro (e.g., id ou email).');
      console.error('Sugerimos verificar a sequência de IDs ou deletar o usuário conflitante.');
    } else if (error.code === 'P1001') {
      console.error('❌ Não foi possível conectar ao banco de dados. Verifique sua conexão.');
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com o banco de dados encerrada.');
  }
}

updatePasswords();