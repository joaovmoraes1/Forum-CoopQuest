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
    <div className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-2 sm:p-6 text-center">
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
        Participe do Desafio Diário!
      </h3>
      <p className="text-sm sm:text-base text-gray-200 mb-2 sm:mb-4">
        Faça login ou crie uma conta para participar e acompanhar seu progresso.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <Button
          onClick={() => navigate('/Login')}
          className="w-full p-2 sm:p-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg"
          aria-label="Fazer login na sua conta"
        >
          Entrar
        </Button>
        <Button
          onClick={() => navigate('/Register')}
          className="w-full p-2 sm:p-3 bg-white hover:bg-gray-100 text-blue-600 font-bold rounded-lg"
          aria-label="Criar uma nova conta"
        >
          Cadastrar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-gray-900 rounded-xl p-2 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-center mb-2 sm:mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
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

      <h2 className="text-lg sm:text-2xl font-bold text-white text-center mb-1 sm:mb-2">Desafio Diário</h2>
      <h3 className="text-base sm:text-xl font-semibold text-yellow-300 text-center mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-gray-300 text-center mb-2 sm:mb-4">{description}</p>

      {error && (
        <div className="w-full max-w-md mx-auto bg-red-600/20 border border-red-600 p-2 sm:p-3 rounded-lg mb-2 sm:mb-4 text-red-300 text-center text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg p-2 sm:p-4 mb-2 sm:mb-6">
        <p className="text-xs sm:text-sm text-gray-300 font-medium mb-1 sm:mb-2">Dicas:</p>
        {Array.isArray(tips) && tips.length > 0 ? (
          <ul className="list-disc list-inside grid grid-cols-1 gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-gray-400">Nenhuma dica disponível.</p>
        )}
      </div>

      {!isAuthenticated ? (
        <NotLoggedInPrompt />
      ) : (
        <>
          {isDisplayPage ? (
            <div className="w-full max-w-md mx-auto bg-green-600/20 border border-green-600 p-2 sm:p-4 rounded-lg grid grid-cols-1 gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
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
                <p className="text-sm sm:text-base text-green-300 font-medium">
                  Você já está participando deste desafio!
                </p>
              </div>
            </div>
          ) : isParticipating ? (
            <div className="w-full max-w-md mx-auto bg-green-600/20 border border-green-600 p-2 sm:p-4 rounded-lg grid grid-cols-1 gap-2 sm:gap-3">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green w-4 sm:w-5 h-4 sm:h-5"
                  aria-hidden="true"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className="text-sm sm:text-base text-green-300 font-medium">
                  Você já está participando deste desafio!
                </p>
              </div>
              <Button
                onClick={() => navigate('/daily-challenge')}
                className="w-full p-2 sm:p-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg"
                aria-label="Acessar detalhes do desafio"
              >
                Acessar Desafio
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleParticipate}
              disabled={isLoading}
              className="w-full p-2 sm:p-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold rounded-lg transition-transform duration-300 transform hover:scale-105"
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