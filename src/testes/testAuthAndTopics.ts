import * as authService from '../services/authService';
import * as topicsService from '../services/topics';

async function testAuthAndTopics() {
  try {
    // Registrar um usuário
    const registerResponse = await authService.register({
      name: 'João Teste',
      email: 'joao.teste@example.com',
      password: 'Senha123!',
    });

    if (registerResponse.data) {
      const userId = registerResponse.data.user.id;
      console.log('Usuário registrado:', registerResponse.data.user);

      // Fazer login
      const loginResponse = await authService.login({
        email: 'joao.teste@example.com',
        password: 'Senha123!',
      });
      console.log('Login bem-sucedido:', loginResponse);

      // Criar um tópico (sem userId, pois o backend deve obtê-lo do token JWT)
      const topicResponse = await topicsService.createTopic({
        title: 'Tópico de Teste',
        content: 'Este é um tópico de teste criado automaticamente.',
        category: 'geral' // ou a categoria correta
      });
      console.log('Tópico criado:', topicResponse);
    } else {
      console.error('Erro ao registrar:', registerResponse);
    }
  } catch (error: any) {
    console.error('Erro no teste:', error.response?.data || error.message);
  }
}

testAuthAndTopics();