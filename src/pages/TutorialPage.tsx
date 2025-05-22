import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAccessibility } from '@/components/Layout';
import { Tutorial } from '@/services/topics';

// Define valid slug types
type ValidSlug = 'primeiros-passos' | 'eventos' | 'desafios' | 'topicos-eficientes' | 'privacidade' | 'guia-de-inicio-rapido';

// Content map with typed slugs
const contentMap: Record<ValidSlug, JSX.Element> = {
  'primeiros-passos': (
    <>
      <p className="text-gray-200 mb-4">
        Bem-vindo ao CoopQuest! Este tutorial irá guiá-lo pelos primeiros passos para começar a usar a plataforma.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">1. Crie sua Conta</h3>
      <p className="text-gray-200 mb-4">
        Clique em "Registrar" na página inicial e preencha o formulário com seu nome, email e senha. Após o registro, você poderá fazer login.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">2. Explore o Fórum</h3>
      <p className="text-gray-200 mb-4">
        Navegue até a seção "Fórum" para participar de discussões e criar tópicos.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">3. Participe de Desafios</h3>
      <p className="text-gray-200 mb-4">
        Confira os desafios diários na seção "Desafios" e comece a ganhar pontos!
      </p>
    </>
  ),
  'eventos': (
    <>
      <p className="text-gray-200 mb-4">
        Este tutorial irá mostrar como você pode participar de eventos no CoopQuest.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">1. Acesse a Seção de Eventos</h3>
      <p className="text-gray-200 mb-4">
        Na página "Comunidade", clique na aba "Eventos" para ver os eventos disponíveis.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">2. Inscreva-se em um Evento</h3>
      <p className="text-gray-200 mb-4">
        Clique no evento desejado e depois em "Participar". Você receberá uma confirmação de inscrição.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">3. Participe do Evento</h3>
      <p className="text-gray-200 mb-4">
        No dia do evento, acesse novamente a página do evento para obter mais detalhes ou links de participação.
      </p>
    </>
  ),
  'desafios': (
    <>
      <p className="text-gray-200 mb-4">
        Este tutorial irá guiá-lo sobre como participar e enviar soluções para os desafios diários no CoopQuest.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">1. Acesse os Desafios</h3>
      <p className="text-gray-200 mb-4">
        Vá para a seção "Desafios" no menu principal e escolha o desafio do dia.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">2. Participe do Desafio</h3>
      <p className="text-gray-200 mb-4">
        Leia as instruções do desafio e clique em "Participar". Envie sua solução dentro do prazo.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">3. Ganhe Pontos</h3>
      <p className="text-gray-200 mb-4">
        Complete o desafio para ganhar pontos de reputação e subir no ranking!
      </p>
    </>
  ),
  'topicos-eficientes': (
    <>
      <p className="text-gray-200 mb-4">
        Dicas para criar tópicos que recebem respostas rápidas no fórum do CoopQuest.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">1. Escolha um Título Claro</h3>
      <p className="text-gray-200 mb-4">
        Use títulos descritivos, como "Problema com Login no App", para atrair usuários que podem ajudar.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">2. Forneça Detalhes</h3>
      <p className="text-gray-200 mb-4">
        Explique o problema ou dúvida com detalhes, incluindo o que você já tentou fazer.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">3. Use Tags Relevantes</h3>
      <p className="text-gray-200 mb-4">
        Adicione tags como "bug" ou "pergunta" para ajudar outros a encontrar seu tópico.
      </p>
    </>
  ),
  'privacidade': (
    <>
      <p className="text-gray-200 mb-4">
        Aprenda a gerenciar suas configurações de privacidade e segurança no CoopQuest.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">1. Acesse as Configurações</h3>
      <p className="text-gray-200 mb-4">
        Clique no seu nome de usuário e selecione "Configurações" no menu.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">2. Ajuste a Privacidade</h3>
      <p className="text-gray-200 mb-4">
        Na aba "Privacidade", você pode controlar quem vê suas atividades e informações pessoais.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">3. Gerencie Notificações</h3>
      <p className="text-gray-200 mb-4">
        Escolha quais notificações você deseja receber, como respostas a tópicos ou mensagens.
      </p>
    </>
  ),
  'guia-de-inicio-rapido': (
    <>
      <p className="text-gray-200 mb-4">
        Um guia para iniciantes sobre como começar a usar o CoopQuest e explorar suas funcionalidades.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">1. Registre-se</h3>
      <p className="text-gray-200 mb-4">
        Crie uma conta gratuita clicando em "Registrar" na página inicial.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">2. Complete seu Perfil</h3>
      <p className="text-gray-200 mb-4">
        Adicione uma foto e informações básicas para se conectar com a comunidade.
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">3. Participe da Comunidade</h3>
      <p className="text-gray-200 mb-4">
        Explore o fórum, participe de desafios e interaga com outros usuários.
      </p>
    </>
  ),
};

// Fetch tutorial data with typed slug parameter
const fetchTutorial = async (slug: string | undefined): Promise<Tutorial> => {
  if (!slug) {
    throw new Error('Slug não fornecido');
  }
  const response = await fetch(`${import.meta.env.VITE_API_URL}/tutorials`);
  if (!response.ok) {
    throw new Error('Erro ao carregar tutoriais');
  }
  const tutorials: Tutorial[] = await response.json();
  const tutorial = tutorials.find((t: Tutorial) => t.link === `/tutoriais/${slug}`);
  if (!tutorial) {
    throw new Error('Tutorial não encontrado');
  }
  return tutorial;
};

const TutorialPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { fontSize } = useAccessibility();

  const { data: tutorial, isLoading, error } = useQuery<Tutorial, Error>({
    queryKey: ['tutorial', slug],
    queryFn: () => fetchTutorial(slug),
  });

  if (error) {
    toast.error(error.message || 'Erro ao carregar tutorial');
  }

  // Check if slug is a valid key in contentMap
  const isValidSlug = (slug: string | undefined): slug is ValidSlug => {
    return !!slug && slug in contentMap;
  };

  return (
    <main
      className="flex-grow bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen py-16"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="mb-8 mx-4 pt-12">
        <Link
          to="/tutoriais"
          className="text-orange-400 hover:text-orange-500 inline-flex items-center mb-4 font-medium transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Tutoriais
        </Link>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-200 mt-4">Carregando tutorial...</p>
          </div>
        ) : error ? (
          <Card
            className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 mx-4"
          >
            <CardContent className="p-8 text-center">
              <p className="text-gray-200 mb-4">Erro ao carregar tutorial: {error.message}</p>
              <Link
                to="/tutoriais"
                className="text-orange-400 hover:text-orange-500 font-medium transition-colors duration-300"
              >
                Voltar para a lista de tutoriais
              </Link>
            </CardContent>
          </Card>
        ) : tutorial ? (
          <Card
            className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 mx-4"
          >
            <CardHeader className="p-6">
              <div className="flex items-center gap-4">
                {tutorial.icon === 'HelpCircle' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="url(#help-grad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <defs>
                      <linearGradient id="help-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="url(#calendar-grad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <defs>
                      <linearGradient id="calendar-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                )}
                <CardTitle className="text-3xl font-bold text-white">
                  {tutorial.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-200">{tutorial.description}</p>
              {slug && isValidSlug(slug) ? (
                contentMap[slug]
              ) : (
                <p className="text-gray-200">Conteúdo do tutorial em desenvolvimento...</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card
            className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 mx-4"
          >
            <CardContent className="p-8 text-center">
              <p className="text-gray-200 mb-4">Tutorial não encontrado.</p>
              <Link
                to="/tutoriais"
                className="text-orange-400 hover:text-orange-500 font-medium transition-colors duration-300"
              >
                Voltar para a lista de tutoriais
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <Card
        className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 mx-4"
      >
        <CardContent className="p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Precisa de mais ajuda?
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Se este tutorial não resolveu sua dúvida, entre em contato com nossa equipe de suporte.
          </p>
          <Link
            to="/suporte"
            className="inline-flex items-center bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
          >
            Contatar Suporte <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </main>
  );
};

export default TutorialPage;