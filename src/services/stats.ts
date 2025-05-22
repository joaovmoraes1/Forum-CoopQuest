import api from '../services/api';

export const getDailyChallenge = async () => {
  try {
    const response = await api.get('/challenges/daily');
    console.log('Resposta de getDailyChallenge:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro em getDailyChallenge:', error);
    throw error;
  }
};

export const participateInChallenge = async (challengeId: number, userId: number) => {
  try {
    const response = await api.post('/challenges/participate', { challengeId, userId });
    console.log('Resposta de participateInChallenge:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro em participateInChallenge:', error);
    throw error;
  }
};

export const checkChallengeParticipation = async (challengeId: number, userId: number) => {
  try {
    console.log('Verificando participação para:', { challengeId, userId });
    const response = await api.get('/challenges/participation', {
      params: { challengeId },
    });
    console.log('Resposta de checkChallengeParticipation:', response.data);
    return response.data;

  } catch (error: any) {
    console.error('Erro em checkChallengeParticipation:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }

};
export const updateChallengeProgress = async (challengeId: number, userId: number, progress: number) => {
  try {
    const response = await api.put('/challenges/progress', { challengeId, userId, progress });
    console.log('Resposta de updateChallengeProgress:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro em updateChallengeProgress:', error);
    throw error;
  }
};

export const getForumStats = async () => {
  try {
    const response = await api.get('/stats');
    console.log('Resposta de getForumStats:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro em getForumStats:', error);
    throw error;
  }
};

export const getOnlineMembers = async () => {
  try {
    const response = await api.get('/members/online');
    console.log('Resposta de getOnlineMembers:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro em getOnlineMembers:', error);
    throw error;
  }
};