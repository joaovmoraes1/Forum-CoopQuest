require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const http = require('http');
const { Server } = require('socket.io');
const DOMPurify = require('isomorphic-dompurify');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Inicialize o app
const app = express();

const uploadsDir =
  process.env.NODE_ENV === 'production'
    ? '/tmp/uploads'
    : path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.userId}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static('/tmp/uploads'));
} else {
  app.use(express.static(path.join(__dirname, '../public')));
}

const prisma = new PrismaClient();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5173',
  'https://forum-coop-quest.vercel.app',
  'https://forum-coopquest.onrender.com',
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
app.set('io', io);
global.io = io;

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'forumcoopquest@gmail.com',
    pass: 'obbp slmn tfmr lcru',
  },
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`Recebendo requisição: ${req.method} ${req.originalUrl}`);
  next();
});

// JWT check
if (!process.env.JWT_SECRET) {
  console.error('Erro: JWT_SECRET não está definido no arquivo .env');
  process.exit(1);
}

// Suporte user
async function createSupportUser() {
  try {
    const supportEmail = 'forumcoopquest@gmail.com';
    let supportUser = await prisma.user.findUnique({ where: { email: supportEmail } });
    if (!supportUser) {
      // Cria o usuário de suporte com avatar
      supportUser = await prisma.user.create({
        data: {
          name: 'Suporte',
          email: supportEmail,
          password: await bcrypt.hash('senha_segura', 10),
          lastActivity: new Date(),
          isOnline: false,
          level: 1,
          projects: 0,
          avatar: '/coopquest-logo.png',
        },
      });
      console.log(`Usuário de suporte criado com ID ${supportUser.id}`);
    } else {
      // Se já existe, atualiza o avatar se estiver diferente
      if (supportUser.avatar !== '/coopquest-logo.png') {
        await prisma.user.update({
          where: { id: supportUser.id },
          data: { avatar: '/coopquest-logo.png' },
        });
        console.log('Avatar do suporte atualizado!');
      }
    }
    process.env.SUPPORT_USER_ID = supportUser.id.toString();
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Usuário de suporte já existe, ignorando erro de duplicidade.');
    } else {
      console.error('Erro ao criar/verificar usuário de suporte:', error.message);
    }
  }
}
createSupportUser().catch(console.error);

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido ou formato inválido' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userExists = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!userExists) {
      return res.status(401).json({ error: 'Usuário não encontrado. Faça login novamente.' });
    }
    await prisma.user.update({
      where: { id: decoded.id },
      data: { lastActivity: new Date(), isOnline: true },
    });
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error.message);
    return res.status(401).json({ error: 'Token inválido', details: error.message });
  }
};

// --- Rotas de Usuários ---

// Rota para buscar um usuário por ID (usada pelo UserProfile.tsx)
// Rota /api/users/:id
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        lastActivity: true,
        isOnline: true,
        level: true,
        projects: true,
        title: true,
        location: true,
        instagramUrl: true,
        linkedinUrl: true,
        githubUrl: true,
        skills: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Formatar skills como string separada por vírgulas
    const formattedUser = {
      ...user,
      skills: user.skills?.join(', ') || '', // Corrigir aqui
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error.message);
    res.status(500).json({ error: 'Erro ao buscar usuário', details: error.message });
  }
});
// Upload de avatar do usuário
app.post('/api/users/:id/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  const userId = Number(req.params.id);
  if (isNaN(userId) || userId !== req.userId) {
    return res.status(403).json({ error: 'Não autorizado' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo não enviado' });
  }
  const avatarPath = `/uploads/${req.file.filename}`;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath }
    });
    res.json({ avatar: avatarPath });
  } catch (error) {
    console.error('Erro ao salvar avatar:', error);
    res.status(500).json({ error: 'Erro ao salvar avatar', details: error.message });
  }
});

// Rota temporária para listar usuários (depuração)
app.get('/api/debug/user-details/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        lastActivity: true,
        isOnline: true,
        level: true,
        projects: true,
        title: true,
        location: true,
        instagramUrl: true,
        linkedinUrl: true,
        githubUrl: true,
        skills: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar detalhes do usuário', details: error.message });
  }
});

// Registro de usuário
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    console.log('Dados recebidos para registro:', { name, email, password: password ? '[presente]' : '[ausente]' });

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        lastActivity: new Date(),
        isOnline: true,
        level: 1,
        projects: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        lastActivity: true,
        isOnline: true,
        level: true,
        projects: true,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        lastActivity: user.lastActivity?.toISOString(),
      },
      token,
    });
  } catch (error) {
    console.error('Erro no registro:', error.message);
    res.status(500).json({ error: 'Erro ao criar conta', details: error.message });
  }
});

// Login de usuário
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Tentativa de login:', {
      email,
      passwordProvided: !!password,
      passwordLength: password?.length || 0,
    });

    if (!email || !password) {
      console.log('Campos obrigatórios ausentes:', { emailProvided: !!email, passwordProvided: !!password });
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log('Email normalizado:', normalizedEmail);

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        avatar: true,
        bio: true,
        createdAt: true,
        lastActivity: true,
        isOnline: true,
        level: true,
        projects: true,
      },
    });

    console.log('Usuário encontrado:', user ? { id: user.id, email: user.email } : 'Nenhum usuário encontrado');

    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Senha válida:', isValidPassword);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActivity: new Date(), isOnline: true },
    });

    const { password: _, ...userWithoutPassword } = user;

    console.log('Login bem-sucedido:', { userId: user.id });

    return res.json({
      user: {
        ...userWithoutPassword,
        createdAt: userWithoutPassword.createdAt.toISOString(),
        lastActivity: userWithoutPassword.lastActivity?.toISOString(),
      },
      token,
    });
  } catch (error) {
    console.error('Erro no login:', error.message);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});
// Solicitar recuperação
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ message: 'Se o e-mail existir, enviaremos instruções.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hora

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: expires },
    });

await transporter.sendMail({
  to: user.email,
  subject: 'Recuperação de senha',
  text: `Clique para redefinir: https://forum-coop-quest.vercel.app/redefinir-senha?token=${token}`,
});


    res.json({ message: 'Se o e-mail existir, enviaremos instruções.' });
  } catch (error) {
    console.error('Erro em /api/auth/forgot-password:', error);
    res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
});

// Redefinir senha
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const reset = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!reset || reset.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Token inválido ou expirado' });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } });
  await prisma.passwordResetToken.delete({ where: { token } });
  res.json({ message: 'Senha redefinida com sucesso' });
});

// Obter dados do usuário autenticado
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        lastActivity: true,
        isOnline: true,
        level: true,
        projects: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        lastActivity: user.lastActivity?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error.message);
    res.status(500).json({ error: 'Erro ao buscar usuário', details: error.message });
  }
});

// Logout de usuário
app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    console.log('Logout solicitado para usuário:', req.userId);
    await prisma.user.update({
      where: { id: req.userId },
      data: { isOnline: false, lastActivity: new Date() },
    });
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer logout:', error.message);
    res.status(500).json({ error: 'Erro ao fazer logout', details: error.message });
  }
});

// Alterar senha
app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    console.log('Tentativa de alteração de senha:', { userId, currentPassword: !!currentPassword, newPassword: !!newPassword });

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova são obrigatórias' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      console.log(`Senha atual incorreta para o usuário ${userId}`);
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error.message);
    res.status(500).json({ error: 'Erro ao alterar senha', details: error.message });
  }
});

// Atualizar perfil do usuário
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, bio, avatar, title, location, instagramUrl, linkedinUrl, githubUrl, skills } = req.body;
  
  if (avatar && avatar.startsWith('data:image')) {
    return res.status(400).json({ error: 'Avatar deve ser um caminho de arquivo, não base64.' });
  }
  console.log('Recebendo dados para atualizar perfil:', {
    id,
    name,
    email,
    bio,
    avatar,
    title,
    location,
    instagramUrl,
    linkedinUrl,
    githubUrl,
    skills,
  });

  try {
    const userId = Number(id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID do usuário deve ser um número' });
    }

    const formattedSkills = skills
      ? Array.isArray(skills)
        ? skills
        : skills.split(',').map((skill) => skill.trim())
      : [];
    const normalizedGithubUrl = githubUrl ? `https://github.com/${githubUrl.replace('https://github.com/', '')}` : undefined;
    const normalizedLinkedinUrl = linkedinUrl ? `https://www.linkedin.com/in/${linkedinUrl.replace('https://www.linkedin.com/in/', '')}` : undefined;
    const normalizedInstagramUrl = instagramUrl ? `https://www.instagram.com/${instagramUrl.replace('https://www.instagram.com/', '')}` : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        bio,
        avatar,
        title,
        location,
        instagramUrl: normalizedInstagramUrl,
        linkedinUrl: normalizedLinkedinUrl,
        githubUrl: normalizedGithubUrl,
        skills: formattedSkills,
      },
    });

    // Corrija aqui: sempre retorne skills como string
    const formattedUser = {
      ...updatedUser,
      skills: updatedUser.skills?.join(', ') || '',
    };

    console.log('Usuário atualizado com sucesso:', formattedUser);
    res.json(formattedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil', details: error.message });
  }
});
// Excluir conta de usuário
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    if (Number(id) !== req.userId) {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    await prisma.$transaction([
      prisma.challengeParticipation.deleteMany({ where: { userId: Number(id) } }),
      prisma.eventParticipation.deleteMany({ where: { userId: Number(id) } }),
      prisma.report.deleteMany({ where: { userId: Number(id) } }),
      prisma.topicReply.deleteMany({ where: { authorId: Number(id) } }),
      prisma.topic.deleteMany({ where: { authorId: Number(id) } }),
      prisma.user.delete({ where: { id: Number(id) } }),
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir conta:', error.message);
    res.status(500).json({ error: 'Erro ao excluir conta', details: error.message });
  }
});

// Obter ID do usuário de suporte
app.get('/api/support-user', async (req, res) => {
  try {
    const supportUser = await prisma.user.findUnique({ where: { email: 'forumcoopquest@gmail.com' } });
    if (!supportUser) {
      return res.status(404).json({ error: 'Usuário de suporte não encontrado' });
    }
    res.json({ supportUserId: supportUser.id });
  } catch (error) {
    console.error('Erro ao buscar usuário de suporte:', error.message);
    res.status(500).json({ error: 'Erro ao buscar usuário de suporte', details: error.message });
  }
});

// Listar membros online
app.get('/api/members/online', async (req, res) => {
  try {
    const onlineMembers = await prisma.user.findMany({
      where: { isOnline: true },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        bio: true,
        createdAt: true,
        level: true,
        projects: true,
        title: true,
        location: true,
        instagramUrl: true,
        linkedinUrl: true,
        githubUrl: true,
        skills: true,
      },
    });

    res.json(onlineMembers);
  } catch (error) {
    console.error('Erro ao buscar membros online:', error.message);
    res.status(500).json({ error: 'Erro ao buscar membros online', details: error.message });
  }
});

// Listar membros em destaque
app.get('/api/members/featured', async (req, res) => {
  try {
    console.log('Buscando membros em destaque...');
    const featuredMembers = await prisma.user.findMany({
      where: { isOnline: true },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        bio: true,
        createdAt: true,
        level: true,
        projects: true,
        title: true,
        location: true,
        instagramUrl: true,
        linkedinUrl: true,
        githubUrl: true, // <-- ADICIONE ESTA LINHA
        skills: true,
      },
    });

    console.log('Membros encontrados:', featuredMembers);
    res.json(featuredMembers);
  } catch (error) {
    console.error('Erro ao buscar membros em destaque:', error.message);
    res.status(500).json({ error: 'Erro ao buscar membros em destaque', details: error.message });
  }
});
// ...outras rotas...

// Adicione aqui:
app.get('/api/members/all', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.userId } },
      select: {
     id: true,
        name: true,
        avatar: true,
        email: true,
        bio: true,
        createdAt: true,
        level: true,
        projects: true,
        title: true,
        location: true,
        instagramUrl: true,
        linkedinUrl: true,
        githubUrl: true, // <-- ADICIONE ESTA LINHA
        skills: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar membros', details: error.message });
  }
});


// --- Rotas de Mensagens ---
// Enviar mensagem
app.post('/api/messages', authMiddleware, async (req, res) => {
  const { recipientId, content } = req.body;
  const senderId = req.userId;
  const supportEmail = 'forumcoopquest@gmail.com';
  try {
    // Validação básica
    if (!recipientId || !content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Destinatário e conteúdo são obrigatórios' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ error: 'Mensagem muito longa (máx. 1000 caracteres)' });
    }

    const recipientIdNum = Number(recipientId);
    if (isNaN(recipientIdNum)) {
      return res.status(400).json({ error: 'ID do destinatário inválido' });
    }

    // Cria a mensagem no banco
    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId: recipientIdNum,
        content: content.trim(),
        date: new Date(),
      },
    });

    // Envia e-mail se for mensagem para o suporte
    const supportUser = await prisma.user.findUnique({ where: { email: supportEmail } });
    if (supportUser && recipientIdNum === supportUser.id) {
      try {
        await transporter.sendMail({
          from: supportEmail,
          to: supportEmail,
          subject: 'Nova mensagem de suporte recebida',
          text: `Mensagem de suporte recebida:\n\n${content}\n\nEnviada por usuário ID: ${senderId}`,
        });
        console.log('E-mail de suporte enviado para:', supportEmail);
      } catch (emailError) {
        console.error('Erro ao enviar e-mail de suporte:', emailError.message);
      }
    }

    // EMITA A MENSAGEM PARA AMBOS OS USUÁRIOS
    const io = req.app.get('io') || global.io;
    if (io) {
      [senderId, recipientIdNum].forEach(uid => {
        const socketId = onlineUsers.get(uid);
        if (socketId) {
          io.to(socketId).emit('private_message', {
            id: message.id,
            senderId,
            recipientId: recipientIdNum,
            content: message.content,
            date: message.date,
          });
        }
      });
    }

    res.status(201).json({ success: true, messageId: message.id });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.message);
    res.status(500).json({
      error: 'Erro ao enviar mensagem',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Listar mensagens recebidas
app.get('/api/messages/received', authMiddleware, async (req, res) => {
  const recipientId = req.userId;
  try {
    const messages = await prisma.message.findMany({
      where: { recipientId },
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        content: true,
        date: true,
        isRead: true,
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { date: 'desc' },
    });
    console.log('Mensagens recebidas encontradas:', messages.length);
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Erro ao buscar mensagens recebidas:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar mensagens recebidas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});
// --- Rotas de Tópicos ---

// Criar um novo tópico
app.post('/api/topics', authMiddleware, async (req, res) => {
  const { title, content, category, tags } = req.body;
  const authorId = req.userId;

  try {
    console.log('Dados recebidos para criar tópico:', { title, content, category, tags, authorId });

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' });
    }
    if (!category?.trim()) {
      return res.status(400).json({ error: 'Categoria é obrigatória' });
    }

    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { name: true, avatar: true },
    });

    if (!author) {
      console.log('Usuário não encontrado para authorId:', authorId);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags.map(tag => tag.trim()).filter(tag => tag);
      } else if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else {
        console.log('Formato inválido para tags:', tags);
        return res.status(400).json({ error: 'Tags deve ser uma string ou array' });
      }
    }

    console.log('Tags após conversão:', tagsArray);

    const topic = await prisma.topic.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        tags: tagsArray,
        authorId,
        author: author.name,
        views: 0,
        likes: 0,
        repliesCount: 0,
      },
      include: {
        authorUser: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    console.log('Tópico criado:', { id: topic.id, title: topic.title, date: topic.date });

    res.json({
      id: topic.id,
      title: topic.title,
      content: topic.content,
      category: topic.category,
      tags: topic.tags,
      author: topic.author,
      authorId: topic.authorId,
      date: topic.date.toISOString(),
      views: topic.views,
      likes: topic.likes,
      repliesCount: topic.repliesCount,
      authorUser: topic.authorUser,
    });
  } catch (error) {
    console.error('Erro ao criar tópico:', error.message, error.stack);
    res.status(500).json({
      error: 'Erro ao criar tópico',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Listar tópicos
app.get('/api/topics', async (req, res) => {
  const { page = 1, limit = 10, search, category } = req.query;

  console.log('Requisição recebida para /api/topics:', { page, limit, search, category });

  try {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      console.log('Parâmetros inválidos:', { pageNum, limitNum });
      return res.status(400).json({ error: 'Parâmetros de página e limite devem ser números positivos' });
    }

    const where = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { tags: { hasSome: [search] } },
              ],
            }
          : {},
        category ? { category: { equals: category } } : {},
      ],
    };

    console.log('Condições de busca (where):', where);

    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { date: 'desc' },
        include: {
          authorUser: {
            select: {
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: { replies: true },
          },
        },
      }),
      prisma.topic.count({ where }),
    ]);

    console.log('Tópicos encontrados:', topics);
    console.log('Total de tópicos:', total);

    const formattedTopics = topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      content: topic.content,
      category: topic.category,
      tags: topic.tags || [],
      author: topic.author,
      authorId: topic.authorId,
      date: topic.date.toISOString(),
      views: topic.views,
      likes: topic.likes,
      replies: topic._count.replies,
      repliesCount: topic._count.replies,
      authorUser: topic.authorUser,
    }));

    res.json({
      topics: formattedTopics,
      total,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Erro ao listar tópicos:', error.message);
    res.status(500).json({
      error: 'Erro ao listar tópicos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Buscar tópicos
app.get('/api/topics/search', async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Parâmetro de busca inválido' });
  }

  try {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({ error: 'Parâmetros de página e limite devem ser números positivos' });
    }

    const where = {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: [q] } },
      ],
    };

    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { date: 'desc' },
        include: {
          authorUser: {
            select: {
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: { replies: true },
          },
        },
      }),
      prisma.topic.count({ where }),
    ]);

    const formattedTopics = topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      content: topic.content,
      category: topic.category,
      tags: topic.tags || [],
      author: topic.author,
      authorId: topic.authorId,
      date: topic.date.toISOString(),
      views: topic.views,
      likes: topic.likes,
      replies: topic._count.replies,
      repliesCount: topic._count.replies,
      authorUser: topic.authorUser,
    }));

    res.json({
      topics: formattedTopics,
      total,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Erro ao buscar tópicos:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar tópicos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Obter detalhes de um tópico
// Obter detalhes de um tópico
app.get('/api/topics/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const topicId = Number(id);
    if (isNaN(topicId)) {
      return res.status(400).json({ error: 'ID do tópico deve ser um número' });
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        authorUser: {
          select: {
            name: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            authorUser: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!topic) {
      return res.status(404).json({ error: 'Tópico não encontrado' });
    }

    await prisma.topic.update({
      where: { id: topicId },
      data: { views: { increment: 1 } },
    });

    const formattedTopic = {
      id: topic.id,
      title: topic.title,
      content: topic.content,
      category: topic.category,
      tags: topic.tags || [],
      author: topic.author,
      authorId: topic.authorId,
      date: topic.date.toISOString(),
      views: topic.views + 1,
      likes: topic.likes,
      repliesCount: topic.repliesCount,
      authorUser: {
        name: topic.authorUser.name,
        avatar: topic.authorUser.avatar || '/default-avatar.png', // Fallback no backend
      },
      replies: topic.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        author: reply.author,
        authorId: reply.authorId,
        date: reply.date.toISOString(),
        likes: reply.likes,
        authorUser: {
          name: reply.authorUser.name,
          avatar: reply.authorUser.avatar || '/default-avatar.png', // Fallback no backend
        },
      })),
    };

    res.json(formattedTopic);
  } catch (error) {
    console.error('Erro ao buscar tópico:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar tópico',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Criar uma resposta para um tópico
app.post('/api/topics/:topicId/replies', authMiddleware, async (req, res) => {
  const { topicId } = req.params;
  const { content } = req.body;
  const authorId = req.userId;

  try {
    const topicIdNum = Number(topicId);
    if (isNaN(topicIdNum)) {
      return res.status(400).json({ error: 'ID do tópico deve ser um número' });
    }

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Conteúdo da resposta é obrigatório' });
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicIdNum },
    });

    if (!topic) {
      return res.status(404).json({ error: 'Tópico não encontrado' });
    }

    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { name: true },
    });

    if (!author) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const reply = await prisma.topicReply.create({
      data: {
        content: content.trim(),
        topicId: topicIdNum,
        authorId,
        author: author.name,
        likes: 0,
      },
      include: {
        authorUser: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    await prisma.topic.update({
      where: { id: topicIdNum },
      data: { repliesCount: { increment: 1 } },
    });

    res.json({
      id: reply.id,
      content: reply.content,
      author: reply.author,
      authorId: reply.authorId,
      date: reply.date.toISOString(),
      likes: reply.likes,
      authorUser: reply.authorUser,
    });
  } catch (error) {
    console.error('Erro ao criar resposta:', error.message);
    res.status(500).json({
      error: 'Erro ao criar resposta',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Curtir um tópico
app.post('/api/topics/:id/like', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const topicId = Number(id);
    if (isNaN(topicId)) {
      return res.status(400).json({ error: 'ID do tópico deve ser um número' });
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return res.status(404).json({ error: 'Tópico não encontrado' });
    }

    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: { likes: { increment: 1 } },
    });

    res.json({ likes: updatedTopic.likes });
  } catch (error) {
    console.error('Erro ao curtir tópico:', error.message);
    res.status(500).json({
      error: 'Erro ao curtir tópico',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Curtir uma resposta
app.post('/api/replies/:id/like', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const replyId = Number(id);
    if (isNaN(replyId)) {
      return res.status(400).json({ error: 'ID da resposta deve ser um número' });
    }

    const reply = await prisma.topicReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      return res.status(404).json({ error: 'Resposta não encontrada' });
    }

    const updatedReply = await prisma.topicReply.update({
      where: { id: replyId },
      data: { likes: { increment: 1 } },
    });

    res.json({ likes: updatedReply.likes });
  } catch (error) {
    console.error('Erro ao curtir resposta:', error.message);
    res.status(500).json({
      error: 'Erro ao curtir resposta',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// --- Rotas de Denúncias ---

// Criar uma denúncia
app.post('/api/reports', authMiddleware, async (req, res) => {
  const { contentId, contentType, reason } = req.body;
  const userId = req.userId;

  try {
    console.log('Criando denúncia:', { contentId, contentType, reason, userId });

    if (!contentId || !contentType || !reason) {
      return res.status(400).json({ error: 'contentId, contentType e reason são obrigatórios' });
    }

    if (!['topic', 'reply'].includes(contentType)) {
      return res.status(400).json({ error: 'contentType deve ser "topic" ou "reply"' });
    }

    const contentIdNum = Number(contentId);
    if (isNaN(contentIdNum)) {
      return res.status(400).json({ error: 'contentId deve ser um número' });
    }

    let contentDetails = {};
    if (contentType === 'topic') {
      const topic = await prisma.topic.findUnique({
        where: { id: contentIdNum },
        select: { id: true, title: true },
      });
      if (!topic) {
        return res.status(404).json({ error: 'Tópico não encontrado' });
      }
      contentDetails = { id: topic.id, title: topic.title };
    } else {
      const reply = await prisma.topicReply.findUnique({
        where: { id: contentIdNum },
        select: { id: true, content: true },
      });
      if (!reply) {
        return res.status(404).json({ error: 'Resposta não encontrada' });
      }
      contentDetails = { id: reply.id, content: reply.content };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const report = await prisma.report.create({
      data: {
        userId,
        contentId: contentIdNum,
        contentType,
        reason,
      },
    });

    try {
      const mailOptions = {
        from: 'forumcoopquest@gmail.com',
        to: 'forumcoopquest@gmail.com',
        subject: `Nova Denúncia Recebida - ${contentType === 'topic' ? 'Tópico' : 'Resposta'} ID ${contentIdNum}`,
        text: `
          Uma nova denúncia foi recebida no Fórum CoopQuest:

          Tipo de Conteúdo: ${contentType === 'topic' ? 'Tópico' : 'Resposta'}
          ID do Conteúdo: ${contentIdNum}
          ${contentType === 'topic' ? `Título do Tópico: ${contentDetails.title}` : `Conteúdo da Resposta: ${contentDetails.content}`}
          Motivo da Denúncia: ${reason}
          Denunciado por:
            - Usuário ID: ${userId}
            - Nome: ${user.name}
            - E-mail: ${user.email}
          Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}}

          Por favor, revise a denúncia no sistema.
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('E-mail de denúncia enviado para:', mailOptions.to);
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de denúncia:', {
        message: emailError.message,
        stack: emailError.stack,
      });
    }

    console.log('Denúncia criada com sucesso:', { reportId: report.id });

    res.json({ success: true, reportId: report.id });
  } catch (error) {
    console.error('Erro ao criar denúncia:', {
      message: error.message,
      stack: error.stack,
      payload: { contentId, contentType, reason, userId },
    });
    res.status(500).json({
      error: 'Erro ao criar denúncia',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Listar denúncias
app.get('/api/reports', authMiddleware, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    const formattedReports = await Promise.all(
      reports.map(async (report) => {
        let topicTitle = null;
        let replyContent = null;

        if (report.contentType === 'topic') {
          const topic = await prisma.topic.findUnique({
            where: { id: report.contentId },
            select: { title: true },
          });
          topicTitle = topic?.title || 'Tópico não encontrado';
        } else if (report.contentType === 'reply') {
          const reply = await prisma.topicReply.findUnique({
            where: { id: report.contentId },
            select: { content: true },
          });
          replyContent = reply?.content || 'Resposta não encontrada';
        }

        return {
          id: report.id,
          userId: report.userId,
          userName: report.user.name,
          contentId: report.contentId,
          contentType: report.contentType,
          reason: report.reason,
          date: report.date.toISOString(),
          topicTitle,
          replyContent,
        };
      })
    );

    res.json(formattedReports);
  } catch (error) {
    console.error('Erro ao listar denúncias:', error.message);
    res.status(500).json({
      error: 'Erro ao listar denúncias',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// --- Rotas de Eventos ---

// Rota temporária para criar um evento (depuração)
app.post('/api/debug/seed-event', async (req, res) => {
  try {
    const event = await prisma.event.create({
      data: {
        id: 1,
        title: "Workshop de JavaScript Avançado",
        description: "Um workshop para aprender técnicas avançadas de JavaScript.",
        date: new Date("2025-08-08"),
        time: "14:00",
        participants: 0,
        type: "Workshop",
      },
    });
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar evento', details: error.message });
  }
});

// Listar eventos
app.get('/api/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      participants: event.participants,
      type: event.type,
    })));
  } catch (error) {
    console.error('Erro ao buscar eventos:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar eventos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Criar evento
app.post('/api/events', authMiddleware, async (req, res) => {
  const { title, description, date, time, type } = req.body;

  try {
    if (!title || !description || !date || !time || !type) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (!['Competicao', 'Workshop', 'Meetup'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de evento deve ser "Competicao", "Workshop" ou "Meetup"' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        participants: 0,
        type,
      },
    });

    res.json({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      participants: event.participants,
      type: event.type,
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error.message);
    res.status(500).json({
      error: 'Erro ao criar evento',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Participar de um evento
app.post('/api/events/:id/participate', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const eventId = Number(id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'ID do evento deve ser um número' });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ error: 'Não é possível participar de eventos passados' });
    }

    const existingParticipation = await prisma.eventParticipation.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existingParticipation) {
      return res.status(400).json({ error: 'Você já está participando deste evento' });
    }

    await prisma.eventParticipation.create({
      data: {
        userId,
        eventId,
      },
    });

    await prisma.event.update({
      where: { id: eventId },
      data: { participants: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao participar do evento:', error.message);
    res.status(500).json({
      error: 'Erro ao participar do evento',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Verificar participação em um evento
app.get('/api/events/:id/participation', authMiddleware, async (req, res) => {
  console.log('Acessando endpoint /api/events/:id/participation');
  const { id } = req.params;
  const userId = req.userId;

  try {
    const eventId = Number(id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'ID do evento deve ser um número' });
    }

    const existingParticipation = await prisma.eventParticipation.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    res.json({ success: !!existingParticipation });
  } catch (error) {
    console.error('Erro ao verificar participação no evento:', error.message);
    res.status(500).json({
      error: 'Erro ao verificar participação',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// --- Rotas de Desafios ---

// Obter desafio diário
app.get('/api/challenges/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let challenge = await prisma.dailyChallenge.findFirst({
      where: {
        startDate: { // Use startDate instead of date
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        active: true, // Add active: true to ensure only active challenges are fetched
      },
    });

    if (!challenge) {
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      challenge = await prisma.dailyChallenge.create({
        data: {
          title: `Desafio Diário - ${today.toISOString().split('T')[0]}`,
          description: 'Complete este desafio diário para ganhar pontos!',
          startDate: today,
          endDate: tomorrow, // Set endDate as required by the schema
          active: true,
          reward: 100, // Set a default reward as required by the schema
          tips: 'Comece verificando a documentação', // tips as a string, per the schema
        },
      });
    }

    res.json({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      tips: challenge.tips ? [challenge.tips] : [], // Convert the string to an array for the frontend
    });
  } catch (error) {
    console.error('Erro ao buscar desafio diário:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar desafio diário',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Criar um desafio diário automaticamente se não existir
async function createDefaultChallenge() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingChallenge = await prisma.dailyChallenge.findFirst({
    where: {
      active: true,
      startDate: { gte: today },
      startDate: { lt: tomorrow },
    },
  });

  if (!existingChallenge) {
    await prisma.dailyChallenge.create({
      data: {
        title: "Desafio Inicial",
        description: "Complete este desafio para ganhar pontos!",
        tips: "Comece verificando a documentação", // tips as a string
        startDate: today,
        endDate: tomorrow,
        active: true,
        reward: 100,
      },
    });
    console.log("Desafio diário criado automaticamente!");
  }
}

// Ajustar data do desafio
app.post('/api/challenges/fix-date', async (req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const updated = await prisma.dailyChallenge.updateMany({
      where: { id: 1 },
      data: {
        startDate: today,
        endDate: tomorrow,
        active: true,
      },
    });

    res.json({
      success: true,
      message: `Desafio atualizado. ${updated.count} registro(s) modificado(s)`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Participar de um desafio
app.post('/api/challenges/participate', authMiddleware, async (req, res) => {
  const { challengeId, userId } = req.body; // Add userId to the body
  const authenticatedUserId = req.userId;

  try {
    if (!challengeId || !userId) {
      return res.status(400).json({ error: 'challengeId e userId são obrigatórios' });
    }

    const challengeIdNum = Number(challengeId);
    const userIdNum = Number(userId);
    if (isNaN(challengeIdNum) || isNaN(userIdNum)) {
      return res.status(400).json({ error: 'challengeId e userId devem ser números' });
    }

    // Verify that the authenticated user is the one participating
    if (userIdNum !== authenticatedUserId) {
      return res.status(403).json({ error: 'Não autorizado a participar em nome de outro usuário' });
    }

    const challenge = await prisma.dailyChallenge.findUnique({
      where: { id: challengeIdNum },
    });
    if (!challenge) {
      return res.status(404).json({ error: 'Desafio não encontrado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const existingParticipation = await prisma.challengeParticipation.findUnique({
      where: { userId_challengeId: { userId: userIdNum, challengeId: challengeIdNum } },
    });
    if (existingParticipation) {
      return res.status(400).json({ error: 'Você já está participando deste desafio' });
    }

    const newParticipation = await prisma.challengeParticipation.create({
      data: {
        userId: userIdNum,
        challengeId: challengeIdNum,
        progress: 0,
        completed: false,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao participar do desafio:', error.message);
    res.status(500).json({
      error: 'Erro ao participar do desafio',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Verificar participação em um desafio
app.get('/api/challenges/participation', authMiddleware, async (req, res) => {
  const { challengeId } = req.query;
  const userId = req.userId;

  try {
    console.log('Verificando participação:', { userId, challengeId });

    if (!challengeId) {
      return res.status(400).json({ error: 'challengeId é obrigatório' });
    }

    const challengeIdNum = Number(challengeId);
    if (isNaN(challengeIdNum)) {
      return res.status(400).json({ error: 'challengeId deve ser um número' });
    }

    const challenge = await prisma.dailyChallenge.findUnique({
      where: { id: challengeIdNum },
    });
    if (!challenge) {
      return res.status(404).json({ error: 'Desafio não encontrado' });
    }

    const participation = await prisma.challengeParticipation.findUnique({
      where: { userId_challengeId: { userId, challengeId: challengeIdNum } },
    });

    console.log('Resultado da verificação de participação:', { participation });

    res.json({
      isParticipating: !!participation,
      progress: participation ? participation.progress : 0,
    });
  } catch (error) {
    console.error('Erro ao verificar participação:', error.message);
    res.status(500).json({
      error: 'Erro ao verificar participação',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Atualizar progresso do desafio
app.put('/api/challenges/progress', authMiddleware, async (req, res) => {
  const { challengeId, userId, progress } = req.body;

  try {
    console.log('Recebendo requisição para atualizar progresso:', { challengeId, userId, progress });

    if (!challengeId || !userId || progress === undefined) {
      return res.status(400).json({ error: 'challengeId, userId e progress são obrigatórios' });
    }

    const challengeIdNum = Number(challengeId);
    const userIdNum = Number(userId);
    const progressNum = Number(progress);
    if (isNaN(challengeIdNum) || isNaN(userIdNum) || isNaN(progressNum)) {
      return res.status(400).json({ error: 'challengeId, userId e progress devem ser números' });
    }

    if (progressNum < 0 || progressNum > 100) {
      return res.status(400).json({ error: 'O progresso deve estar entre 0 e 100' });
    }

    const challenge = await prisma.dailyChallenge.findUnique({
      where: { id: challengeIdNum },
    });
    if (!challenge) {
      return res.status(404).json({ error: 'Desafio não encontrado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const participation = await prisma.challengeParticipation.findUnique({
      where: { userId_challengeId: { userId: userIdNum, challengeId: challengeIdNum } },
    });
    if (!participation) {
      return res.status(400).json({ error: 'Você não está participando deste desafio' });
    }

    const updatedParticipation = await prisma.challengeParticipation.update({
      where: { userId_challengeId: { userId: userIdNum, challengeId: challengeIdNum } },
      data: {
        progress: progressNum,
        completed: progressNum >= 100,
      },
    });

    console.log('Progresso atualizado com sucesso:', updatedParticipation);

    res.json({ success: true, progress: updatedParticipation.progress });
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error.message);
    res.status(500).json({
      error: 'Erro ao atualizar progresso',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Enviar código para o desafio diário
app.post('/api/send-code', authMiddleware, async (req, res) => {
  const { code, senderId, challengeId } = req.body;

  try {
    console.log('Recebendo requisição para enviar código:', { code, senderId, challengeId });

    if (!code || !senderId || !challengeId) {
      return res.status(400).json({ error: 'code, senderId e challengeId são obrigatórios' });
    }

    const senderIdNum = Number(senderId);
    const challengeIdNum = Number(challengeId);
    if (isNaN(senderIdNum) || isNaN(challengeIdNum)) {
      return res.status(400).json({ error: 'senderId e challengeId devem ser números' });
    }

    const challenge = await prisma.dailyChallenge.findUnique({
      where: { id: challengeIdNum },
    });
    if (!challenge) {
      return res.status(404).json({ error: 'Desafio não encontrado' });
    }

    const sender = await prisma.user.findUnique({
      where: { id: senderIdNum },
    });
    if (!sender) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const participation = await prisma.challengeParticipation.findUnique({
      where: { userId_challengeId: { userId: senderIdNum, challengeId: challengeIdNum } },
    });
    if (!participation) {
      return res.status(400).json({ error: 'Você não está participando deste desafio' });
    }

    const supportUser = await prisma.user.findUnique({
      where: { email: 'forumcoopquest@gmail.com' },
    });
    if (!supportUser) {
      return res.status(500).json({ error: 'Usuário de suporte não encontrado' });
    }

    try {
      const mailOptions = {
        from: 'forumcoopquest@gmail.com',
        to: 'forumcoopquest@gmail.com',
        subject: `Novo Código Enviado - Desafio ID ${challengeIdNum}`,
        text: `
          Um novo código foi enviado para o desafio diário:

          Desafio ID: ${challengeIdNum}
          Título do Desafio: ${challenge.title}
          Código: 
          ${code}

          Enviado por:
            - Usuário ID: ${senderIdNum}
            - Nome: ${sender.name}
            - E-mail: ${sender.email}
          Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}}

          Por favor, revise o código submetido.
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('E-mail de código enviado para:', supportUser.email);
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de código:', emailError.message);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar código:', error.message);
    res.status(500).json({
      error: 'Erro ao enviar código',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});




// --- Rotas de Ajuda (FAQs e Tutoriais) ---

// Listar FAQs
app.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const formattedFaqs = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push({
        question: faq.question,
        answer: faq.answer,
      });
      return acc;
    }, {});

    res.json({
      faqCategories: Object.keys(formattedFaqs).map(id => ({
        id,
        title: id.charAt(0).toUpperCase() + id.slice(1),
      })),
      faqItems: formattedFaqs,
    });
  } catch (error) {
    console.error('Erro ao listar FAQs:', error.message);
    res.status(500).json({
      error: 'Erro ao listar FAQs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Listar Tutoriais
app.get('/api/tutorials', async (req, res) => {
  try {
    const tutorials = await prisma.tutorial.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const formattedTutorials = tutorials.map(tutorial => ({
      title: tutorial.title,
      description: tutorial.description,
      link: tutorial.link,
      icon: tutorial.icon,
    }));

    res.json(formattedTutorials);
  } catch (error) {
    console.error('Erro ao listar tutoriais:', error.message);
    res.status(500).json({
      error: 'Erro ao listar tutoriais',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Buscar FAQs e Tutoriais
app.get('/api/help/search', async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Parâmetro de busca inválido' });
  }

  try {
    const [faqs, tutorials] = await Promise.all([
      prisma.faq.findMany({
        where: {
          OR: [
            { question: { contains: q, mode: 'insensitive' } },
            { answer: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
      prisma.tutorial.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    const formattedFaqs = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push({
        question: faq.question,
        answer: faq.answer,
      });
      return acc;
    }, {});

    const formattedTutorials = tutorials.map(tutorial => ({
      title: tutorial.title,
      description: tutorial.description,
      link: tutorial.link,
      icon: tutorial.icon,
    }));

    res.json({
      faqCategories: Object.keys(formattedFaqs).map(id => ({
        id,
        title: id.charAt(0).toUpperCase() + id.slice(1),
      })),
      faqItems: formattedFaqs,
      tutorials: formattedTutorials,
    });
  } catch (error) {
    console.error('Erro ao buscar ajuda:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar ajuda',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// --- Rotas de Estatísticas e Busca Global ---

// Obter estatísticas
app.get('/api/stats', async (req, res) => {
  try {
    const [topicsCount, repliesCount, membersCount] = await Promise.all([
      prisma.topic.count(),
      prisma.topicReply.count(),
      prisma.user.count(),
    ]);
    res.json({ topics: topicsCount, replies: repliesCount, members: membersCount });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Busca global no fórum
app.get('/api/search', async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Tentar autenticar se um token for fornecido
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userExists = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (userExists) {
        req.userId = decoded.id;
      }
    } catch (error) {
      console.error('Erro ao verificar token em /api/search:', error.message);
      // Não retorna erro, apenas continua sem req.userId
    }
  }

  const { q, page = 1, limit = 10 } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Parâmetro de busca inválido' });
  }

  try {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({ error: 'Parâmetros de página e limite devem ser números positivos' });
    }

    const searchQuery = q.trim();

    // Buscar em todas as entidades
    const [topics, replies, faqs, tutorials, events, messages, users] = await Promise.all([
      // Tópicos
      prisma.topic.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { content: { contains: searchQuery, mode: 'insensitive' } },
            { tags: { hasSome: [searchQuery] } },
          ],
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          authorUser: {
            select: { name: true, avatar: true },
          },
          _count: { select: { replies: true } },
        },
      }),
      // Respostas de tópicos
      prisma.topicReply.findMany({
        where: {
          content: { contains: searchQuery, mode: 'insensitive' },
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          authorUser: {
            select: { name: true, avatar: true },
          },
          topic: {
            select: { id: true, title: true },
          },
        },
      }),
      // FAQs
      prisma.faq.findMany({
        where: {
          OR: [
            { question: { contains: searchQuery, mode: 'insensitive' } },
            { answer: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      // Tutoriais
      prisma.tutorial.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      // Eventos
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      // Mensagens (apenas para usuários autenticados, se desejar)
    req.userId
  ? prisma.message.findMany({
      where: {
        OR: [
          { content: { contains: searchQuery, mode: 'insensitive' } },
        ],
        AND: [
          {
            OR: [
              { senderId: req.userId },
              { recipientId: req.userId },
            ],
          },
        ],
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        date: true,
        sender: { select: { name: true } },
        recipient: { select: { name: true } },
      },
    })
  : Promise.resolve([]),
      // Usuários
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { bio: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          avatar: true,
        },
      }),
    ]);

    // Contagem total para cada entidade
    const [totalTopics, totalReplies, totalFaqs, totalTutorials, totalEvents, totalMessages, totalUsers] = await Promise.all([
      prisma.topic.count({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { content: { contains: searchQuery, mode: 'insensitive' } },
            { tags: { hasSome: [searchQuery] } },
          ],
        },
      }),
      prisma.topicReply.count({
        where: {
          content: { contains: searchQuery, mode: 'insensitive' },
        },
      }),
      prisma.faq.count({
        where: {
          OR: [
            { question: { contains: searchQuery, mode: 'insensitive' } },
            { answer: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
      }),
      prisma.tutorial.count({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
      }),
      prisma.event.count({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
      }),
      req.userId
        ? prisma.message.count({
            where: {
              OR: [
                { content: { contains: searchQuery, mode: 'insensitive' } },
              ],
              AND: [
                {
                  OR: [
                    { senderId: req.userId },
                    { recipientId: req.userId },
                    
                  ],
                },
              ],
            },
          })
            : Promise.resolve(0),
            prisma.user.count({
              where: {
                OR: [
                  { name: { contains: searchQuery, mode: 'insensitive' } },
                  { email: { contains: searchQuery, mode: 'insensitive' } },
                  { bio: { contains: searchQuery, mode: 'insensitive' } },
                ],
              },
            }),
          ]);
      
          // Formatar os resultados
          const formattedTopics = topics.map(topic => ({
            type: 'topic',
            id: topic.id,
            title: topic.title,
            content: topic.content,
            category: topic.category,
            tags: topic.tags || [],
            author: topic.author,
            authorId: topic.authorId,
            date: topic.date.toISOString(),
            views: topic.views,
            likes: topic.likes,
            replies: topic._count.replies,
            authorUser: topic.authorUser,
          }));
      
          const formattedReplies = replies.map(reply => ({
            type: 'reply',
            id: reply.id,
            content: reply.content,
            topicId: reply.topic.id,
            topicTitle: reply.topic.title,
            author: reply.author,
            authorId: reply.authorId,
            date: reply.date.toISOString(),
            likes: reply.likes,
            authorUser: reply.authorUser,
          }));
      
          const formattedFaqs = faqs.map(faq => ({
            type: 'faq',
            category: faq.category,
            question: faq.question,
            answer: faq.answer,
          }));
      
          const formattedTutorials = tutorials.map(tutorial => ({
            type: 'tutorial',
            title: tutorial.title,
            description: tutorial.description,
            link: tutorial.link,
            icon: tutorial.icon,
          }));
      
          const formattedEvents = events.map(event => ({
            type: 'event',
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date.toISOString().split('T')[0],
            time: event.time,
            participants: event.participants,
            eventType: event.type,
          }));
      
          const formattedMessages = messages.map(message => ({
            type: 'message',
            id: message.id,
            content: message.content,
            sender: message.sender.name,
            recipient: message.recipient.name,
            date: message.date.toISOString(),
          }));
      
          const formattedUsers = users.map(user => ({
            type: 'user',
            id: user.id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
          }));
      
          // Combinar todos os resultados
          const results = [
            ...formattedTopics,
            ...formattedReplies,
            ...formattedFaqs,
            ...formattedTutorials,
            ...formattedEvents,
            ...formattedMessages,
            ...formattedUsers,
          ];
      
          res.json({
            results,
            total: totalTopics + totalReplies + totalFaqs + totalTutorials + totalEvents + totalMessages + totalUsers,
            topics: totalTopics,
            replies: totalReplies,
            faqs: totalFaqs,
            tutorials: totalTutorials,
            events: totalEvents,
            messages: totalMessages,
            users: totalUsers,
            pages: Math.ceil((totalTopics + totalReplies + totalFaqs + totalTutorials + totalEvents + totalMessages + totalUsers) / limitNum),
          });
        } catch (error) {
          console.error('Erro ao realizar busca global:', error.message);
          res.status(500).json({
            error: 'Erro ao realizar busca global',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          });
        }
      });
      
      // --- Rotas de Configuração e Status ---
      
      // Rota de status do servidor
      app.get('/api/status', (req, res) => {
        res.json({ status: 'Servidor rodando', timestamp: new Date().toISOString() });
      });
      
      // Rota para verificar se o servidor está saudável
      app.get('/api/health', async (req, res) => {
        try {
          await prisma.$queryRaw`SELECT 1`;
          res.json({ status: 'healthy', database: 'connected' });
        } catch (error) {
          console.error('Erro na verificação de saúde:', error.message);
          res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
        }
      });
      

      // No index.js
      app.get('/api/debug/check-avatars', async (req, res) => {
        try {
          const users = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          });
          res.json(users);
        } catch (error) {
          res.status(500).json({ error: 'Erro ao verificar avatares', details: error.message });
        }
      });
      
      app.post('/api/debug/fix-avatars', async (req, res) => {
        try {
          await prisma.user.updateMany({
            where: { avatar: { in: [null, ''] } },
            data: { avatar: '/default-avatar.png' },
          });
          res.json({ message: 'Avatars fixed successfully' });
        } catch (error) {
          res.status(500).json({ error: 'Failed to fix avatars' });
        }
      });

      //Buscar mensagens enviadas pelo usuário
app.get('/api/messages/sent', authMiddleware, async (req, res) => {
  const senderId = req.userId;
  try {
    const messages = await prisma.message.findMany({
      where: { senderId },
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        content: true, // Adicionado
        date: true,
        isRead: true,
        recipient: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { date: 'desc' },
    });
    console.log('Mensagens enviadas encontradas:', messages.length);
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Erro ao buscar mensagens enviadas:', error.message);
    res.status(500).json({
      error: 'Erro ao buscar mensagens enviadas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

app.post('/api/messages/mark-read', authMiddleware, async (req, res) => {
  const recipientId = req.userId;
  try {
    await prisma.message.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    const updatedMessages = await prisma.message.findMany({
      where: { recipientId },
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        content: true,
        date: true,
        isRead: true,
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { date: 'desc' },
    });
    console.log('Mensagens marcadas como lidas para o usuário:', recipientId);
    res.status(200).json({ success: true, messages: updatedMessages });
  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error.message);
    res.status(500).json({
      error: 'Erro ao marcar mensagens como lidas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});
app.put('/api/messages/:id/read', authMiddleware, async (req, res) => {
  const messageId = Number(req.params.id);
  const userId = req.userId;

  if (isNaN(messageId)) {
    return res.status(400).json({ error: 'ID da mensagem deve ser um número' });
  }

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }

    if (message.recipientId !== userId) {
      return res.status(403).json({ error: 'Não autorizado a marcar esta mensagem como lida' });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error.message);
    res.status(500).json({
      error: 'Erro ao marcar mensagem como lida',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

app.post('/api/messages/send', authMiddleware, async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.userId;

  if (!receiverId || !content) {
    return res.status(400).json({ error: 'Receiver ID e conteúdo são obrigatórios' });
  }
  if (typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'Conteúdo da mensagem não pode ser vazio' });
  }
  if (content.length > 1000) {
    return res.status(400).json({ error: 'Mensagem muito longa (máx. 1000 caracteres)' });
  }

  // Sanitiza o conteúdo
  const sanitizedContent = DOMPurify.sanitize(content);

  try {
    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId: Number(receiverId),
        content: sanitizedContent,
        date: new Date(),
        isRead: false,
      },
      select: {
        id: true,
        senderId: true,
        recipientId: true,
        content: true,
        date: true,
        isRead: true,
        sender: { select: { name: true, avatar: true } },
        recipient: { select: { name: true, avatar: true } },
      },
    });
    console.log('Mensagem enviada com sucesso:', message);
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.message);
    res.status(500).json({
      error: 'Erro ao enviar mensagem',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Histórico de mensagens entre dois usuários (chat)
app.get('/api/messages/history/:userId', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const otherUserId = Number(req.params.userId);

  if (isNaN(otherUserId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: userId },
        ],
      },
      orderBy: { date: 'asc' },
    });

    // Marcar como lidas as mensagens recebidas
    await prisma.message.updateMany({
      where: {
        recipientId: userId,
        senderId: otherUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico de mensagens' });
  }
});

const onlineUsers = new Map();
io.on('connection', (socket) => {
  // Autenticação simples via evento
  socket.on('register', (userId) => {
    console.log(`Usuário ${userId} registrado no Socket.IO`);
    onlineUsers.set(userId, socket.id);

    // Evento de "digitando"
    socket.on('typing', ({ toUserId, fromUserId }) => {
      const toSocketId = onlineUsers.get(toUserId);
      if (toSocketId) {
        io.to(toSocketId).emit('typing', { fromUserId });
      }
    });

    // Evento de marcar mensagens como lidas
    socket.on('mark_read', async ({ fromUserId, toUserId }) => {
      await prisma.message.updateMany({
        where: {
          senderId: fromUserId,
          recipientId: toUserId,
          isRead: false,
        },
        data: { isRead: true },
      });
      const toSocketId = onlineUsers.get(fromUserId);
      if (toSocketId) {
        io.to(toSocketId).emit('messages_read', { byUserId: toUserId });
      }
    });
  });

  // Evento de mensagem privada
  socket.on('private_message', async ({ toUserId, fromUserId, content }) => {
    if (typeof content !== 'string' || !content.trim() || content.length > 1000) {
      return;
    }
    const sanitizedContent = DOMPurify.sanitize(content);

    const message = await prisma.message.create({
      data: {
        senderId: fromUserId,
        recipientId: toUserId,
        content: sanitizedContent,
        date: new Date(),
        isRead: false,
      },
    });

    const toSocketId = onlineUsers.get(toUserId);
    if (toSocketId) {
      io.to(toSocketId).emit('private_message', {
        id: message.id,
        fromUserId,
        toUserId,
        content: sanitizedContent,
        date: message.date,
      });
    }

    socket.emit('private_message', {
      id: message.id,
      fromUserId,
      toUserId,
      content: sanitizedContent,
      date: message.date,
    });
  });

  socket.on('disconnect', async () => {
    for (const [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId);
        // Atualiza o status isOnline para false no banco de dados
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false, lastActivity: new Date() },
        });
        console.log(`Usuário ${userId} desconectado e marcado como offline`);
        break;
      }
    }
  });
});
// INDEX.js -> GAMES.js
require("./games")(io);
//initializeGameServer(server);

     // --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Servidor rodando na porta ${PORT}`);
    await createSupportUser();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
process.on('SIGTERM', async () => {
  console.log('Recebendo SIGTERM. Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});