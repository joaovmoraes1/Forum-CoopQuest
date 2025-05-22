import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { participateInChallenge, checkChallengeParticipation } from '@/services/stats';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DailyChallengeProps {
  id: number;
  title: string;
  description: string;
  tips: string[];
  redirectAfterParticipation?: boolean;
  isDisplayPage?: boolean;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({
  id,
  title,
  description,
  tips,
  redirectAfterParticipation = true,
  isDisplayPage = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkParticipationStatus = async () => {
      if (!isAuthenticated || !user) return;
      try {
        setError(null);
        const response = await checkChallengeParticipation(id, user.id);
        setIsParticipating(response.isParticipating || false);
      } catch (err) {
        setError('Falha ao verificar o status de participação.');
        toast.error('Erro ao verificar a participação no desafio');
      }
    };
    checkParticipationStatus();
  }, [id, isAuthenticated, user]);

  const handleParticipate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast.error('Por favor, faça login para participar do desafio.');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setIsLoading(true);
    try {
      const response = await participateInChallenge(id, user.id);
      if (response?.success) {
        setIsParticipating(true);
        toast.success('Você se inscreveu no desafio diário com sucesso!');
        window.dispatchEvent(new CustomEvent('challenge-joined', {
          detail: { challengeId: id, userId: user.id },
        }));
        if (redirectAfterParticipation) {
          navigate('/daily-challenge', { replace: true });
        }
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Falha ao participar do desafio.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const NotLoggedInPrompt = () => (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-center">
      <h3 className="text-xl font-semibold text-white mb-3">
        Participe do Desafio Diário!
      </h3>
      <p className="text-gray-200 mb-4">
        Faça login ou crie uma conta para participar e acompanhar seu progresso.
      </p>
      <div className="flex justify-center gap-3">
        <Button
          onClick={() => navigate('/Login')}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg"
          aria-label="Fazer login na sua conta"
        >
          Entrar
        </Button>
        <Button
          onClick={() => navigate('/Register')}
          className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-2 px-6 rounded-lg"
          aria-label="Criar uma nova conta"
        >
          Cadastrar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-yellow-400"
          aria-hidden="true"
        >
          <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-white text-center mb-2">Desafio Diário</h2>
      <h3 className="text-xl font-semibold text-yellow-300 text-center mb-3">{title}</h3>
      <p className="text-gray-300 text-center mb-4">{description}</p>

      {error && (
        <div className="bg-red-600/20 border border-red-600 p-3 rounded-lg mb-4 text-red-300 text-center">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-300 font-medium mb-2">Dicas:</p>
        {Array.isArray(tips) && tips.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">Nenhuma dica disponível.</p>
        )}
      </div>

      {!isAuthenticated ? (
        <NotLoggedInPrompt />
      ) : (
        <>
          {isDisplayPage ? (
            <div className="bg-green-600/20 border border-green-600 p-4 rounded-lg flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-green-300 font-medium">
                Você já está participando deste desafio!
              </p>
            </div>
          ) : isParticipating ? (
            <div className="bg-green-600/20 border border-green-600 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className="text-green-300 font-medium">
                  Você já está participando deste desafio!
                </p>
              </div>
              <Button
                onClick={() => navigate('/daily-challenge')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg"
                aria-label="Acessar detalhes do desafio"
              >
                Acessar Desafio
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleParticipate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-4 rounded-lg transition-transform duration-300 transform hover:scale-105"
              data-testid="participate-button"
              aria-label="Participar do desafio diário"
            >
              {isLoading ? 'Processando...' : 'Participar agora'}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default DailyChallenge;