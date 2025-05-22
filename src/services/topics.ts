import api from './api';

// Interface para Tópicos
export interface Topic {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorId: number;
  date: string;
  views: number;
  likes: number;
  repliesCount: number;
  authorUser: {
    name: string;
    avatar?: string;
  };
}

// Interface para Respostas de Tópicos
export interface TopicReply {
  id: number;
  content: string;
  author: string;
  authorId: number;
  date: string;
  likes: number;
  authorUser: {
    name: string;
    avatar?: string;
  };
}

// Interface para FAQs
export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

// Interface para Tutoriais
export interface Tutorial {
  id: number;
  title: string;
  description: string;
  link: string;
  icon: string;
}

// Interface para Eventos
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  participants: number;
  eventType: string;
}

// Interface para Mensagens
export interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  recipientId: number;
  recipientName: string;
  date: string;
}

// Interface para Usuários
export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
}

// Interface genérica para os resultados da busca
export interface SearchResult {
  type: 'topic' | 'reply' | 'faq' | 'tutorial' | 'event' | 'message' | 'user';
  id: number;
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  author?: string;
  authorId?: number;
  date?: string;
  views?: number;
  likes?: number;
  repliesCount?: number;
  authorUser?: {
    name: string;
    avatar?: string;
  };
  topicId?: number;
  topicTitle?: string;
  question?: string;
  answer?: string;
  description?: string;
  link?: string;
  icon?: string;
  time?: string;
  participants?: number;
  eventType?: string;
  senderId?: number;
  senderName?: string;
  recipientId?: number;
  recipientName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
}

// Interface para os dados de criação de tópicos
export interface CreateTopicData {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

// Interface para os dados de criação de respostas
export interface CreateReplyData {
  content: string;
}

// Interface para a resposta de listagem de tópicos
export interface TopicsResponse {
  topics: Topic[];
  total: number;
  pages: number;
}

// Interface para a resposta da busca global
export interface SearchForumResponse {
  results: SearchResult[];
  total: number;
  pages: number;
}

// Função para buscar tópicos (sem alterações)
export async function getTopics(page: number = 1, limit: number = 10, search?: string): Promise<TopicsResponse> {
  try {
    const response = await api.get('/topics', {
      params: { page, limit, search },
    });
    console.log('Resposta bruta da API em getTopics:', JSON.stringify(response.data, null, 2));

    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Resposta da API inválida: dados não encontrados');
    }

    const { topics, total, pages } = response.data;
    if (!Array.isArray(topics) || typeof total !== 'number' || typeof pages !== 'number') {
      console.log('Formato inválido - topics:', topics, 'total:', total, 'pages:', pages);
      throw new Error('Resposta da API inválida: formato de tópicos, total ou pages inválido');
    }

    return { topics, total, pages };
  } catch (error: any) {
    console.error('Erro ao buscar tópicos:', error);
    throw error;
  }
}

// Função para buscar um tópico específico (sem alterações)
export async function getTopic(id: number): Promise<Topic> {
  try {
    const response = await api.get(`/topics/${id}`);
    console.log('Resposta de getTopic:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar tópico:', error);
    throw error;
  }
}

// Função para criar um tópico (sem alterações)
export async function createTopic(data: CreateTopicData): Promise<Topic> {
  try {
    const topicData: CreateTopicData = {
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category.trim(),
      tags: Array.isArray(data.tags) ? data.tags.map(tag => tag.trim()).filter(tag => tag) : [],
    };
    const response = await api.post('/topics', topicData);
    console.log('Resposta de createTopic:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar tópico:', error);
    throw error;
  }
}

// Função para buscar respostas de um tópico (sem alterações)
export async function getTopicReplies(topicId: number): Promise<TopicReply[]> {
  try {
    const response = await api.get(`/topics/${topicId}/replies`);
    console.log('Resposta de getTopicReplies:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar respostas:', error);
    throw error;
  }
}

// Função para criar uma resposta (sem alterações)
export async function createReply(topicId: number, data: CreateReplyData): Promise<TopicReply> {
  try {
    const response = await api.post(`/topics/${topicId}/replies`, {
      content: data.content.trim(),
    });
    console.log('Resposta de createReply:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar resposta:', error);
    throw error;
  }
}

// Função para curtir um tópico (sem alterações)
export async function likeTopic(topicId: number): Promise<{ likes: number }> {
  try {
    const response = await api.post(`/topics/${topicId}/like`);
    console.log('Resposta de likeTopic:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao curtir tópico:', error);
    throw error;
  }
}

// Função para curtir uma resposta (sem alterações)
export async function likeReply(replyId: number): Promise<{ likes: number }> {
  try {
    const response = await api.post(`/replies/${replyId}/like`);
    console.log('Resposta de likeReply:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao curtir resposta:', error);
    throw error;
  }
}

// Parâmetros para a busca global
export interface SearchForumParams {
  query: string;
  page?: number;
  limit?: number;
}

// Função para busca global no fórum
export async function searchForum(params: SearchForumParams): Promise<SearchForumResponse> {
  const { query, page = 1, limit = 10 } = params;
  try {
    const response = await api.get('/search', {
      params: { q: query, page, limit },
    });
    console.log('Resposta de searchForum:', JSON.stringify(response.data, null, 2));

    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Resposta da API inválida: dados não encontrados');
    }

    const { results, total, pages } = response.data;
    if (!Array.isArray(results) || typeof total !== 'number' || typeof pages !== 'number') {
      console.log('Formato inválido - results:', results, 'total:', total, 'pages:', pages);
      throw new Error('Resposta da API inválida: formato de resultados, total ou pages inválido');
    }

    return { results, total, pages };
  } catch (error: any) {
    console.error('Erro ao realizar busca global:', error);
    throw error;
  }
}

// Função para reportar conteúdo (sem alterações)
export async function reportContent(type: 'topic' | 'reply', id: number, reason: string): Promise<{ message: string }> {
  try {
    const response = await api.post('/reports', {
      contentType: type,
      contentId: id,
      reason: reason.trim(),
    });
    console.log('Resposta de reportContent:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao reportar conteúdo:', error);
    throw error;
  }
}