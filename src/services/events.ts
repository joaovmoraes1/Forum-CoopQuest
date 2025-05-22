import api from './api';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  participants: number;
  type: 'Competição' | 'Workshop' | 'Meetup';
}

export const getEvents = async (): Promise<{ data?: Event[]; error?: string }> => {
  try {
    const response = await api.get('/events');
    console.log('Resposta de getEvents:', response.data);
    return { data: response.data };
  } catch (error: any) {
    console.error('Erro ao buscar eventos:', error);
    return { error: error.message || 'Erro ao conectar com o servidor' };
  }
};

export const participateEvent = async (eventId: string): Promise<{ success?: boolean; error?: string }> => {
  try {
    const response = await api.post(`/events/${eventId}/participate`);
    console.log('Resposta de participateEvent:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao participar do evento:', error);
    return { error: error.message || 'Erro ao conectar com o servidor' };
  }
};


export const checkParticipation = async (eventId: string): Promise<{ isParticipating: boolean; error?: string }> => {
  try {
    const response = await api.get(`/events/${eventId}/participation`);
    return { isParticipating: response.data.success || false };
  } catch (error: any) {
    console.error('Erro ao verificar participação no evento:', error);
    return { isParticipating: false, error: error.message || 'Erro ao verificar participação' };
  }
};