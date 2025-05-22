import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useAccessibility } from '@/components/Layout';

// Define interface for topic data
interface SupportTopic {
  id: number;
  title: string;
  content: string;
  author?: string;
  date: string;
}

// Define interface for new topic input
interface NewTopicInput {
  title: string;
  content: string;
}

const fetchSupportTopics = async (): Promise<SupportTopic[]> => {
  const response = await api.get('/topics?category=suporte');
  return response.data.topics;
};

const createSupportTopic = async ({ title, content }: NewTopicInput): Promise<unknown> => {
  const response = await api.post('/topics', {
    title,
    content,
    category: 'suporte',
    tags: ['suporte'],
  });
  return response.data;
};

const SupportForum: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newTopic, setNewTopic] = useState<NewTopicInput>({ title: '', content: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { fontSize } = useAccessibility();

  const { data: topics, isLoading, error } = useQuery<SupportTopic[], Error>({
    queryKey: ['supportTopics'],
    queryFn: fetchSupportTopics,
  });

  const mutation = useMutation({
    mutationFn: createSupportTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTopics'] });
      toast.success('Tópico de suporte criado com sucesso!');
      setNewTopic({ title: '', content: '' });
      setShowCreateForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar tópico de suporte');
    },
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token) {
      toast.error(
        <>
          Você precisa estar logado para criar um tópico.{' '}
          <Link to="/login" className="text-orange-400 underline hover:text-orange-500">
            Faça login
          </Link>{' '}
          e tente novamente.
        </>
      );
      navigate('/login');
      return;
    }
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }
    mutation.mutate({ ...newTopic });
  };

  if (error) {
    toast.error('Erro ao carregar tópicos de suporte');
  }

  return (
    <main
      className="flex-grow bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen w-full"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="mb-8 text-center pt-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 mb-4">
          Fórum de Suporte
        </h1>
        <p className="text-gray-200 text-lg">
          Encontre ajuda para seus problemas ou dúvidas. Crie um tópico e nossa comunidade ou equipe de suporte irá ajudá-lo.
        </p>
      </div>

      <div className="mb-8 flex justify-center">
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300 flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Tópico de Suporte
        </Button>
      </div>

      {showCreateForm && (
        <Card
          className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 mb-8 w-full mx-4"
        >
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-bold text-white">
              Criar Novo Tópico de Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleCreateTopic} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-200">
                  Título
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Título do tópico (ex.: Problema com Login)"
                  className="w-full bg-gray-700 text-white border-gray-600 rounded-xl mt-1 focus:ring-orange-500 focus:border-orange-500"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-200">
                  Descrição do Problema
                </label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Descreva seu problema ou dúvida com detalhes..."
                  className="w-full bg-gray-700 text-white border-gray-600 rounded-xl mt-1 focus:ring-orange-500 focus:border-orange-500"
                  rows={5}
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300 flex items-center justify-center"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Criando...' : 'Criar Tópico'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-200 mt-4">Carregando tópicos de suporte...</p>
        </div>
      ) : topics && topics.length > 0 ? (
        <div className="space-y-6 w-full px-4">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 w-full"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">{topic.title}</h3>
                    <p className="text-gray-200">{topic.content.substring(0, 100)}...</p>
                    <p className="text-gray-400 text-sm">
                      Criado por {topic.author || 'Anônimo'} em{' '}
                      {new Date(topic.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/topico/${topic.id}`}
                    className="text-orange-400 hover:text-orange-500 inline-flex items-center font-medium transition-colors duration-300"
                  >
                    Ver Tópico <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card
          className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 w-full mx-4"
        >
          <CardContent className="p-8 text-center">
            <p className="text-gray-200 text-lg">
              Nenhum tópico de suporte encontrado. Crie um novo tópico para obter ajuda!
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default SupportForum;