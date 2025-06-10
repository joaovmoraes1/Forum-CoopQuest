import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchForum } from '@/services/topics';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAccessibility } from '@/components/Layout';

interface SearchResult {
  id: number;
  type: 'topic' | 'reply' | 'faq' | 'tutorial' | 'event' | 'message' | 'user';
  title?: string;
  content?: string;
  author?: string;
  category?: string;
  views?: number;
  repliesCount?: number;
  topicId?: number;
  topicTitle?: string;
  question?: string;
  answer?: string;
  link?: string;
  description?: string;
  date?: string;
  eventType?: string;
  participants?: number;
  senderName?: string;
  recipientName?: string;
  bio?: string;
  email?: string;
  username?: string;
  name?: string;
}

const SearchResults = () => {
  const location = useLocation();
  const { fontSize } = useAccessibility();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const searchQuery = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setResults([]);
        setTotalResults(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchForum({
          query: searchQuery,
          page: 1,
          limit: 10,
        });

        setResults(response.results || []);
        setTotalResults(response.total || 0);
        setHasMore(response.results.length < response.total);
        setPage(1);
      } catch (error) {
        console.error('Failed to fetch search results:', error);
        toast.error('Erro ao buscar resultados. Tente novamente mais tarde.');
        setResults([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery]);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;

    const nextPage = page + 1;
    setIsLoading(true);

    try {
      const response = await searchForum({
        query: searchQuery,
        page: nextPage,
        limit: 10,
      });

      setResults((prev) => [...prev, ...(response.results || [])]);
      setHasMore((results.length + response.results.length) < response.total);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more search results:', error);
      toast.error('Erro ao carregar mais resultados.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResultItem = (result: SearchResult) => {
    switch (result.type) {
      case 'topic':
        return (
          <div key={`${result.type}-${result.id}`} className="border-b border-gray-600/50 py-4">
            <Link to={`/topico/${result.id}`} className="text-orange-400 hover:underline">
              <h3 className="text-xl font-semibold">{result.title || 'Título não disponível'}</h3>
            </Link>
            <p className="text-gray-300">
              {result.content ? result.content.slice(0, 100) + '...' : 'Conteúdo não disponível'}
            </p>
            <p className="text-gray-400 text-sm">
              Autor: {result.author || 'Desconhecido'} | Categoria: {result.category || 'N/A'} | Visualizações: {result.views || 0} | Respostas: {result.repliesCount || 0}
            </p>
          </div>
        );
      case 'reply':
        return (
          <div key={`${result.type}-${result.id}`} className="border-b border-gray-600/50 py-4">
            <Link to={`/topico/${result.topicId}`} className="text-orange-400 hover:underline">
              <h3 className="text-xl font-semibold">Resposta em: {result.topicTitle || 'Tópico não disponível'}</h3>
            </Link>
            <p className="text-gray-300">
              {result.content ? result.content.slice(0, 100) + '...' : 'Conteúdo não disponível'}
            </p>
            <p className="text-gray-400 text-sm">Autor: {result.author || 'Desconhecido'}</p>
          </div>
        );
      case 'faq':
        return (
          <div key={`${result.type}-${result.id}`} className="border-b border-gray-600/50 py-4">
            <h3 className="text-xl font-semibold text-orange-400">FAQ: {result.question || 'Pergunta não disponível'}</h3>
            <p className="text-gray-300">
              {result.answer ? result.answer.slice(0, 100) + '...' : 'Resposta não disponível'}
            </p>
            <p className="text-gray-400 text-sm">Categoria: {result.category || 'N/A'}</p>
          </div>
        );
      case 'tutorial':
        return (
          <div key={`${result.type}-${result.id}`} className="border-b border-gray-600/50 py-4">
            <a href={result.link} className="text-orange-400 hover:underline">
              <h3 className="text-xl font-semibold">Tutorial: {result.title || 'Título não disponível'}</h3>
            </a>
            <p className="text-gray-300">
              {result.description ? result.description.slice(0, 100) + '...' : 'Descrição não disponível'}
            </p>
          </div>
        );
      case 'event':
        return (
          <div key={`${result.type}-${result.id}`} className="border-b border-gray-600/50 py-4">
            <h3 className="text-xl font-semibold text-orange-400">Evento: {result.title || 'Título não disponível'}</h3>
            <p className="text-gray-300">
              {result.description ? result.description.slice(0, 100) + '...' : 'Descrição não disponível'}
            </p>
            <p className="text-gray-400 text-sm">
              Data: {result.date || 'N/A'} | Tipo: {result.eventType || 'N/A'} | Participantes: {result.participants || 0}
            </p>
          </div>
        );
      case 'message':
        return (
          <div key={`${result.type}-${result.id}`} className="border-b border-gray-600/50 py-4">
            <h3 className="text-xl font-semibold text-orange-400">Mensagem de {result.senderName || 'Remetente desconhecido'}</h3>
            <p className="text-gray-300">
              {result.content ? result.content.slice(0, 100) + '...' : 'Conteúdo não disponível'}
            </p>
            <p className="text-gray-400 text-sm">Enviada para: {result.recipientName || 'Destinatário desconhecido'}</p>
          </div>
        );
      case 'user':
        return (
          <div key={`${result.type}-${result.id}`} className="border-b border-gray-600/50 py-4">
            <Link to={`/perfil/${result.id}`} className="text-orange-400 hover:underline">
              <h3 className="text-xl font-semibold">Usuário: {result.username || result.name || 'Usuário desconhecido'}</h3>
            </Link>
            <p className="text-gray-300">
              {result.bio ? result.bio.slice(0, 100) + '...' : 'Sem biografia'}
            </p>
            <p className="text-gray-400 text-sm">Email: {result.email || 'N/A'}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main
      className="flex-grow w-full max-w-full mx-auto py-12 px-2 sm:px-4 lg:px-8 bg-transparent min-h-screen"
      style={{ fontSize: `${fontSize}px` }}
    >
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500">
        <CardHeader className="border-b border-gray-600/50 p-2 sm:p-6">
          <CardTitle className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200">
            Resultados da busca: "{searchQuery}"
          </CardTitle>
          <p className="text-gray-200 mt-2 text-lg">
            Encontramos {totalResults} resultado(s) para sua pesquisa.
          </p>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 space-y-6">
          {isLoading && results.length === 0 ? (
            <div className="text-center p-2 sm:p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-200 mt-4">Carregando resultados...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="space-y-4">
                {results.map((result) => renderResultItem(result))}
              </div>
              {hasMore && (
                <Button
                  onClick={handleLoadMore}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Carregando...' : 'Carregar Mais'}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center p-2 sm:p-6 bg-gray-700/50 rounded-xl border border-gray-600/50">
              <p className="text-gray-200 text-lg">
                Nenhum resultado encontrado para "{searchQuery}".
              </p>
              <p className="text-gray-200 mt-2">
                Tente uma nova busca com termos diferentes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default SearchResults;