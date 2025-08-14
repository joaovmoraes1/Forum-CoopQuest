# Fórum CoopQuest - Jogos Cooperativos Educacionais

Bem-vindo ao **Fórum CoopQuest**, uma plataforma inovadora criada como projeto de TCC para promover o aprendizado de lógica de programação através de jogos cooperativos, desafios diários e uma comunidade ativa de estudantes e educadores!

---

## 🚀 Visão Geral

O CoopQuest é um fórum moderno e acessível, onde usuários podem:

- Participar de **desafios diários** para ganhar pontos e subir no ranking.
- Criar e responder **tópicos** sobre programação, jogos e educação.
- Enviar e receber **mensagens privadas** com notificações em tempo real.
- Consultar **FAQs** e **tutoriais** para facilitar o uso da plataforma.
- Gerenciar **perfil**, privacidade e acessibilidade.
- Interagir em **eventos**, workshops e atividades especiais.

---

## 🏆 Diferenciais

- **Gamificação:** Sistema de pontos, níveis e recompensas para engajar os usuários.
- **Acessibilidade:** Ferramentas para tornar o fórum inclusivo para todos.
- **Integração com jogos:** Espaço dedicado para jogos cooperativos educacionais.
- **Moderação ativa:** Sistema de denúncias e suporte integrado.
- **Design responsivo:** Experiência otimizada para desktop, tablet e mobile.
- **Notificações em tempo real:** Chat e atualizações instantâneas via Socket.IO.

---

## 📚 Tecnologias Utilizadas

- **Frontend:** React + TypeScript + TailwindCSS
- **Backend:** Node.js + Express + Prisma ORM
- **Banco de Dados:** PostgreSQL
- **Realtime:** Socket
- **Autenticação:** JWT
- **Email:** Nodemailer (Gmail)
- **Hospedagem:** Vercel/Render

---

## ⚡ Instalação e Uso

### Pré-requisitos

- Node.js >= 18
- PostgreSQL
- Yarn ou npm

### 1. Clone o repositório

```sh
git clone git@github.com:joaovmoraes1/Forum-CoopQuest.git
cd forum-coopquest
```

### 2. Instale as dependências

```sh
npm install
```

### 3. Configure o ambiente

Crie e Edite os arquivos `.env` na raiz e em `/backend` com suas variáveis (URLs, credenciais de email, JWT_SECRET, etc).

### 4. Migre o banco de dados

```sh
npx prisma migrate deploy
```

### 5. Rode o backend

```sh
cd backend
npm start
```

### 6. Rode o frontend

```sh
cd ..
npm run dev
```

## 🧩 Estrutura do Projeto

- `/src` - Frontend React
- `/backend` - API Express + Prisma
- `/public` - Imagens e uploads
- `/prisma` - Migrations e schema do banco

---

## 🔒 Segurança e Privacidade

- Senhas criptografadas (bcrypt)
- Sistema de redefinição de senha por email
- Configurações de privacidade no perfil
- Moderação e denúncias

---

## 👨‍🎓 Sobre o Autor

Projeto desenvolvido por **João Vitor** como Trabalho de Conclusão de Curso (TCC) Bacharelado de Engenharia de Software da UEPA.  
Contato: [joaovitorrodriguesmoraes207@gmail.com]

---

## 💡 Contribua

Sugestões, bugs ou ideias?  
Abra uma issue ou envie um pull request!

---

## 📄 Licença

Este projeto é open-source sob a licença MIT.

---

## 🎉 Obrigado!

Agradeço a todos que apoiaram este projeto.  
Junte-se à comunidade CoopQuest e aprenda brincando!