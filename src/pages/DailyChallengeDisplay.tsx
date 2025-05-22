import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, ArrowLeft, Info, Code } from "lucide-react";
import { checkChallengeParticipation, participateInChallenge } from "@/services/stats";
import api from "@/services/api";
import MDEditor from '@uiw/react-md-editor';

interface Challenge {
  id: number;
  title: string;
  description: string;
  tips?: string[];
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: "Subsequência Crescente Máxima",
    description: "Dado um array de inteiros, encontre o comprimento da maior subsequência crescente estrita. Uma subsequência crescente estrita é uma sequência onde os números estão em ordem estritamente crescente, mas não precisam ser consecutivos no array. Por exemplo, no array [10, 22, 9, 33, 21, 50, 41, 60, 80], a maior subsequência crescente é [10, 22, 33, 50, 60, 80], com comprimento 6. Retorne o comprimento da maior subsequência.",
    tips: [
      "Use programação dinâmica para otimizar a solução.",
      "Crie um array auxiliar para rastrear o maior comprimento até cada posição.",
      "Compare cada elemento com os anteriores para formar a subsequência ideal.",
    ],
  },
  {
    id: 2,
    title: "Dois Números que Somam",
    description: "Dado um array de inteiros e um valor alvo, encontre dois números no array que somam exatamente ao valor alvo e retorne seus índices. Você pode assumir que existe exatamente uma solução e que não pode usar o mesmo elemento duas vezes. Por exemplo, dado o array [2, 7, 11, 15] e alvo 9, retorne [0, 1], pois 2 + 7 = 9.",
    tips: [
      "Utilize um mapa hash para armazenar números e índices enquanto itera.",
      "Para cada número, cheque se o complemento (alvo - número) existe no mapa.",
      "Garanta uma solução com complexidade O(n) em uma única passagem.",
    ],
  },
  {
    id: 3,
    title: "Palíndromo Mais Longo",
    description: "Escreva uma função que encontre o palíndromo mais longo dentro de uma string. Um palíndromo é uma sequência de caracteres que lê a mesma coisa para frente e para trás (ex.: 'radar', 'level'). Por exemplo, na string 'babad', o palíndromo mais longo é 'bab' (ou 'aba'), e você deve retornar 'bab'. Se houver múltiplos palíndromos de mesmo comprimento, retorne o primeiro encontrado.",
    tips: [
      "Use a técnica de expansão ao redor do centro para verificar palíndromos.",
      "Considere cada caractere e cada par de caracteres como possíveis centros.",
      "Trate casos especiais como strings vazias ou de um único caractere.",
    ],
  },
  {
    id: 4,
    title: "Números Primos até N",
    description: "Dado um número inteiro N, escreva uma função que retorne todos os números primos de 2 até N, inclusive. Um número primo é um número maior que 1 que só é divisível por 1 e por ele mesmo. Por exemplo, se N = 10, a saída deve ser [2, 3, 5, 7]. Use o Crivo de Eratóstenes para resolver este problema de forma eficiente e complete este desafio diário para ganhar pontos!",
    tips: [
      "Implemente o Crivo de Eratóstenes usando um array booleano para marcar primos.",
      "Itere apenas até a raiz quadrada de N para melhorar a eficiência.",
      "Inicialize o array booleano corretamente e marque múltiplos como não primos.",
    ],
  },
  {
    id: 5,
    title: "Inversão de Palavras",
    description: "Dada uma string contendo palavras separadas por espaços, inverta a ordem das palavras. Por exemplo, dada a string 'hello world', a saída deve be 'world hello'. Certifique-se de tratar múltiplos espaços corretamente e remover espaços extras no início ou no fim da string resultante.",
    tips: [
      "Divida a string em um array de palavras usando split().",
      "Inverta o array de palavras e junte novamente com join().",
      "Use trim() para remover espaços extras no início e no fim.",
    ],
  },
  {
    id: 6,
    title: "Soma Máxima de Subarray",
    description: "Dado um array de inteiros (que pode conter números negativos), encontre a soma máxima de um subarray contíguo. Por exemplo, no array [-2, 1, -3, 4, -1, 2, 1, -5, 4], o subarray com soma máxima é [4, -1, 2, 1], com soma 6. Retorne o valor da soma máxima.",
    tips: [
      "Use o algoritmo de Kadane para encontrar a soma máxima de forma eficiente.",
      "Mantenha variáveis para rastrear a soma atual e a soma máxima global.",
      "Reinicie a soma atual sempre que ela se tornar negativa.",
    ],
  },
  {
    id: 7,
    title: "Validação de Parênteses",
    description: "Dada uma string contendo apenas os caracteres '(', ')', '{', '}', '[' e ']', determine se a string é válida. Uma string é válida se os parênteses abertos são fechados na ordem correta. Por exemplo, '()[]{}' é válida, mas '(]' e '([)]' não são. Retorne true se a string for válida, e false caso contrário.",
    tips: [
      "Use uma pilha para rastrear os parênteses abertos durante a iteração.",
      "Para cada parêntese fechado, verifique se ele corresponde ao topo da pilha.",
      "A string é válida se a pilha estiver vazia ao final do processo.",
    ],
  },
];

// Função para destacar código em verde e comentários/texto em cinza
function renderCodePreview(text: string) {
  const lines = text.split('\n');
  // Regex para detectar linhas de código JS
  const codeRegex = /^\s*(let|const|var|function|if|for|while|return|class|import|export|console\.log|{|}|[a-zA-Z0-9_$]+\s*=)/;

  return (
    <div style={{ fontFamily: 'Fira Mono, monospace', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
      {lines.map((line, idx) =>
        codeRegex.test(line) ? (
          <span key={idx} style={{ color: '#22c55e' }}>
            {line + '\n'}
          </span>
        ) : (
          <span key={idx} style={{ color: '#d1d5db' }}>
            {line + '\n'}
          </span>
        )
      )}
    </div>
  );
}

const DailyChallengeDisplay: React.FC = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeMessage, setCodeMessage] = useState("");
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDailyChallenge = async () => {
      try {
        setLoading(true);

        const backendChallenge = await api.get('/challenges/daily');
        console.log('Resposta do backend (challenges/daily):', backendChallenge.data);
        const backendChallengeId = backendChallenge.data.id;

        if (!backendChallengeId || typeof backendChallengeId !== 'number') {
          throw new Error("ID do desafio inválido retornado pelo backend.");
        }

        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / 1000 / 60 / 60 / 24);
        const challengeIndex = dayOfYear % challenges.length;
        const selectedChallenge = challenges[challengeIndex];

        console.log('Desafio selecionado:', selectedChallenge);

        setChallenge({
          ...selectedChallenge,
          id: backendChallengeId,
        });
        setError(null);

        if (isAuthenticated && user) {
          console.log('Usuário autenticado:', { userId: user.id, isAuthenticated });
          if (!user.id || typeof user.id !== 'number') {
            throw new Error("ID do usuário inválido.");
          }

          try {
            const participationResponse = await checkChallengeParticipation(
              backendChallengeId,
              user.id
            );
            console.log('Resposta de checkChallengeParticipation:', participationResponse);
            setIsParticipating(participationResponse.isParticipating || false);
            setProgress(participationResponse.progress || 0);
          } catch (participationError: any) {
            console.error("Failed to check challenge participation:", participationError);
            if (participationError.response?.status === 401) {
              toast.error("Por favor, faça login para participar do desafio.");
              navigate("/login", { state: { from: window.location.pathname } });
            } else {
              setError("Não foi possível verificar a participação. Tente novamente.");
            }
          }
        }
      } catch (err: any) {
        console.error('Erro em fetchDailyChallenge:', err);
        setError("Falha ao carregar o desafio. Tente novamente mais tarde.");
        toast.error("Não foi possível carregar o desafio diário.");
      } finally {
        setLoading(false);
      }
    };
    fetchDailyChallenge();
  }, [isAuthenticated, user, navigate]);

  const handleParticipate = async () => {
    if (!isAuthenticated || !user || !challenge) return;

    try {
      const response = await participateInChallenge(challenge.id, user.id);
      if (response?.success) {
        setIsParticipating(true);
        toast.success("Você foi inscrito no desafio diário!");
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Falha ao participar do desafio.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSendCode = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Por favor, faça login para enviar o código.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    if (!codeMessage.trim()) {
      toast.error("Por favor, insira o código antes de enviar.");
      return;
    }

    if (codeMessage.length > 5000) {
      toast.error("O código é muito longo. O limite máximo é 5000 caracteres.");
      return;
    }

    try {
      const response = await api.post("/send-code", {
        code: codeMessage,
        senderId: user.id,
        challengeId: challenge?.id,
      });

      if (response.status === 200 && response.data.success) {
        toast.success("Resposta enviada com sucesso!");
        setCodeMessage("");
      } else {
        throw new Error("Resposta inesperada do servidor.");
      }
    } catch (err: any) {
      console.error("Error submitting code:", err);
      const errorMessage = err.response?.data?.error || "Falha ao enviar o código. Tente novamente.";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-900">
        <Card className="max-w-lg w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <CardContent className="p-8 text-center">
            <p className="text-gray-300 text-lg mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-900">
        <Card className="max-w-lg w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">
              Nenhum Desafio Disponível
            </h2>
            <p className="text-gray-400">Volte amanhã para um novo desafio!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-900">
      <Card className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-xl border border-gray-700">
        <CardHeader className="bg-blue-600 p-6 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Trophy className="text-white" size={28} />
            <CardTitle className="text-2xl font-semibold text-white">
              Desafio Diário
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600 animate-pulse"
              aria-hidden="true"
            >
              <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>

          <div className="bg-gray-700 p-6 rounded-lg border border-gray-600 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Info className="text-blue-600" size={18} />
              <h4 className="text-sm font-semibold text-gray-300">Descrição do Desafio</h4>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed">
              <strong className="font-medium">{challenge.title}</strong><br />
              {challenge.description}
            </div>
          </div>

          <div className="bg-gray-700 p-6 rounded-lg border border-gray-600 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Info className="text-blue-600" size={18} />
              <h4 className="text-sm font-semibold text-gray-300">Dicas para Resolução</h4>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-400 text-sm">
              {challenge.tips && Array.isArray(challenge.tips) ? (
                challenge.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))
              ) : (
                <li>Nenhuma dica disponível.</li>
              )}
            </ul>
          </div>

          <div className="bg-gray-700 p-6 rounded-lg border border-gray-600 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Code className="text-blue-600" size={20} />
              <h4 className="text-base font-semibold text-gray-300">Envie Sua Solução</h4>
            </div>
            <div className="relative">
              <div data-color-mode="dark" className="border border-gray-600 rounded-lg shadow-sm overflow-hidden">
                <MDEditor
                  value={codeMessage}
                  onChange={(value) => setCodeMessage(value || '')}
                  height={350}
                  textareaProps={{
                    placeholder: "Digite comentários e seu código aqui (ex: // comentário \n let x = 10;)",
                    id: "code",
                    name: "code",
                    required: true,
                  }}
                  preview="edit"
                  enableScroll={true}
                  className="bg-gray-800 text-gray-300 font-mono text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              {codeMessage.trim() && (
                <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-700">
                  {renderCodePreview(codeMessage)}
                </div>
              )}
            </div>
            <Button
              onClick={handleSendCode}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300 shadow-sm"
              aria-label="Enviar código"
            >
              Enviar Solução
            </Button>
          </div>

          {!isParticipating && isAuthenticated && (
            <Button
              onClick={handleParticipate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 rounded-lg transition-transform duration-300 transform hover:scale-105"
              aria-label="Participar do desafio diário"
            >
              {loading ? 'Processando...' : 'Participar do Desafio'}
            </Button>
          )}

          {isParticipating && (
            <div className="bg-green-700/30 border border-green-600 p-4 rounded-lg flex items-center gap-3 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              <p className="text-green-300 text-sm font-medium">
                Você está participando deste desafio!
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => navigate("/")}
              className="bg-gray-600 text-gray-300 hover:bg-gray-500 rounded-lg py-2 px-4 text-sm font-medium transition-colors duration-300"
              aria-label="Voltar para a página inicial"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyChallengeDisplay;