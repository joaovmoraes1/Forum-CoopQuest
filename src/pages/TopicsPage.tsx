import React, { useEffect, useState } from 'react';
import TopicsList from '../components/TopicsList';
import { getTopics, Topic } from '@/services/topics';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '@/components/Layout';

const TopicsPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMoreTopics, setHasMoreTopics] = useState(false);
  const navigate = useNavigate();
  const { fontSize } = useAccessibility();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async (pageNum = 1, perPage = 10) => {
    try {
      setIsLoadingTopics(true);
      const response = await getTopics(pageNum, perPage);
      console.log('Resposta de getTopics em TopicsPage:', JSON.stringify(response, null, 2));

      if (pageNum === 1) {
        setTopics(response.topics);
      } else {
        setTopics((prev) => [...prev, ...response.topics]);
      }
      setHasMoreTopics(response.topics.length === perPage && pageNum < response.pages);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Erro ao carregar tópicos:', error.message);
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        toast.error('Erro ao carregar tópicos. Tente novamente mais tarde.');
      }
      setTopics([]);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleLoadMoreTopics = async () => {
    if (isLoadingTopics || !hasMoreTopics) return;
    const nextPage = page + 1;
    await fetchTopics(nextPage);
  };

  return (
    <main
      className="flex-grow bg-transparent min-h-screen py-12 px-2 sm:px-4 lg:px-8"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div
        className="mb-8 bg-gradient-to-r from-orange-500 to-yellow-500 p-2 sm:p-6 rounded-2xl shadow-2xl text-center border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 w-full max-w-full mx-auto"
      >
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 mb-2">
          Todos os Tópicos
        </h1>
        <p className="text-lg text-gray-200 w-full max-w-xl mx-auto">
          Explore os tópicos mais recentes da comunidade CoopQuest
        </p>
      </div>

      <Card
        className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 w-full max-w-full mx-auto"
      >
        <CardHeader className="border-b border-gray-600/50 p-2 sm:p-6">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#message-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="message-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Lista de Tópicos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <TopicsList
            topics={topics}
            isLoading={isLoadingTopics}
          />
          {hasMoreTopics && (
            <div className="mt-8 text-center">
              <Button
                onClick={handleLoadMoreTopics}
                disabled={isLoadingTopics}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
              >
                {isLoadingTopics ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Carregando...
                  </div>
                ) : (
                  'Carregar Mais Tópicos'
                )}
              </Button>
            </div>
          )}
          {!hasMoreTopics && topics.length > 0 && (
            <p className="text-gray-200 text-center mt-8">
              Não há mais tópicos para carregar.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default TopicsPage;