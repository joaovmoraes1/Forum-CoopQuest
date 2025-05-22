import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, HelpCircle, VideoIcon, Search, ArrowRight, Users, Calendar, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FaqItem {
  question: string;
  answer: string;
}

type FaqItems = {
  [key: string]: FaqItem[];
};

const Ajuda = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const faqCategories = [
    { id: 'geral', title: 'Geral' },
    { id: 'forum', title: 'Fórum' },
    { id: 'desafios', title: 'Desafios' },
    { id: 'perfil', title: 'Perfil' },
    { id: 'suporte', title: 'Suporte' }
  ];

  const faqItems: FaqItems = {
    geral: [
      {
        question: 'O que é o CoopQuest?',
        answer: 'O CoopQuest é uma plataforma de fórum colaborativo para entusiastas de jogos, programação e desafios diários. Nossa comunidade compartilha conhecimento, participa de desafios e aprende junto!'
      },
      {
        question: 'Como começar a usar o CoopQuest?',
        answer: 'Para começar, crie uma conta gratuita clicando no botão "Registrar" no canto superior direito. Em seguida, explore as categorias do fórum, participe de discussões e experimente os desafios diários!'
      }
    ],
    forum: [
      {
        question: 'Como criar um novo tópico no fórum?',
        answer: 'Para criar um novo tópico, navegue até a categoria desejada e clique no botão "Novo Tópico". Preencha o título, o conteúdo da mensagem e adicione tags relevantes. Clique em "Publicar" para compartilhar seu tópico com a comunidade.'
      },
      {
        question: 'Como encontrar tópicos específicos?',
        answer: 'Use a barra de pesquisa no topo do site para buscar tópicos específicos. Você pode filtrar por palavra-chave, categoria, autor ou data. Também pode usar tags para encontrar conteúdos relevantes.'
      },
      {
        question: 'Como posso marcar uma resposta como solução?',
        answer: 'Se você criou um tópico e recebeu uma resposta que resolve seu problema, clique no botão "Marcar como Solução" ao lado da resposta. Isso ajuda outros usuários a encontrarem soluções rapidamente!'
      }
    ],
    desafios: [
      {
        question: 'Como participar dos desafios diários?',
        answer: 'Acesse a seção "Desafios" no menu principal. Selecione o desafio atual e clique em "Participar". Siga as instruções fornecidas e envie sua solução dentro do prazo indicado.'
      },
      {
        question: 'Como funcionam os pontos de reputação?',
        answer: 'Pontos de reputação são concedidos por participação ativa no fórum, respostas úteis e participação em desafios. Quanto mais você contribuir, mais pontos ganhará, desbloqueando conquistas e níveis!'
      }
    ],
    perfil: [
      {
        question: 'Como editar meu perfil?',
        answer: 'Clique no seu nome de usuário no canto superior direito e selecione "Editar Perfil". Lá você pode atualizar sua foto, informações pessoais, links sociais e configurações de privacidade.'
      },
      {
        question: 'Como alterar minha senha?',
        answer: 'Vá para seu perfil, clique na aba "Segurança" e selecione "Alterar Senha". Você precisará informar sua senha atual antes de definir uma nova senha.'
      }
    ],
    suporte: [
      {
        question: 'Como entrar em contato com o suporte?',
        answer: 'Você pode entrar em contato com nossa equipe de suporte através do email suporte@coopquest.com ou criar um tópico na categoria "Suporte" no fórum. Nossa equipe responderá em breve!'
      },
      {
        question: 'Como reportar um problema técnico?',
        answer: 'Use o formulário de "Reportar Bug" disponível no rodapé do site. Inclua detalhes como seu navegador, sistema operacional e passos para reproduzir o problema.'
      }
    ]
  };

  const tutorialItems = [
    {
      title: 'Primeiros Passos',
      description: 'Aprenda a navegar e usar os recursos básicos do CoopQuest',
      icon: <Users className="h-6 w-6 text-orange-400" />,
      link: '/tutoriais/primeiros-passos'
    },
    {
      title: 'Participando de Desafios',
      description: 'Como participar e enviar soluções para os desafios diários',
      icon: <Calendar className="h-6 w-6 text-orange-400" />,
      link: '/tutoriais/desafios'
    },
    {
      title: 'Criando Tópicos Eficientes',
      description: 'Dicas para criar tópicos que recebem respostas rápidas',
      icon: <HelpCircle className="h-6 w-6 text-orange-400" />,
      link: '/tutoriais/topicos-eficientes'
    },
    {
      title: 'Configurações de Privacidade',
      description: 'Como gerenciar suas configurações de privacidade e segurança',
      icon: <Shield className="h-6 w-6 text-orange-400" />,
      link: '/tutoriais/privacidade'
    }
  ];

  const filteredFaqItems: { [key: string]: FaqItem[] } = Object.keys(faqItems).reduce((acc: { [key: string]: FaqItem[] }, categoryId: string) => {
    const filtered = faqItems[categoryId].filter((item: FaqItem) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[categoryId] = filtered;
    }
    return acc;
  }, {} as { [key: string]: FaqItem[] });

  const filteredTutorialItems = tutorialItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-grow py-12 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 mb-4 tracking-tight">
          Centro de Ajuda
        </h1>
        <p className="text-lg text-gray-200 font-light max-w-2xl mx-auto">
          Encontre respostas para suas dúvidas e aprenda a utilizar o CoopQuest de forma eficiente.
        </p>
      </div>

      {/* Search Bar */}
      <div className="my-12 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="Pesquisar no centro de ajuda..."
            className="w-full bg-gray-800 text-white border border-gray-600/50 pl-12 py-6 rounded-xl shadow-lg focus:border-orange-400/50 focus:ring-orange-400/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
        </div>
      </div>

      {/* Cards Section */}
      {(!searchQuery || filteredTutorialItems.length > 0 || Object.keys(filteredFaqItems).length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-2xl border border-gray-600/50 shadow-2xl transform transition-all hover:shadow-3xl hover:border-orange-400/50 duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-gray-700/50 p-3 rounded-full shadow-sm">
                <BookOpen className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="font-bold text-xl ml-4 text-white">Tutoriais</h3>
            </div>
            <p className="text-gray-200 mb-4 font-light">Guias passo a passo para ajudar você a começar e dominar o CoopQuest</p>
            <Link to="/tutoriais" className="text-orange-400 hover:text-orange-300 inline-flex items-center font-medium">
              Ver tutoriais <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Card>
          <Card className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-2xl border border-gray-600/50 shadow-2xl transform transition-all hover:shadow-3xl hover:border-orange-400/50 duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-gray-700/50 p-3 rounded-full shadow-sm">
                <HelpCircle className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="font-bold text-xl ml-4 text-white">FAQ</h3>
            </div>
            <p className="text-gray-200 mb-4 font-light">Respostas para as perguntas mais frequentes sobre o uso da plataforma</p>
            <a href="#faq" className="text-orange-400 hover:text-orange-300 inline-flex items-center font-medium">
              Ver perguntas <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Card>
          <Card className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-2xl border border-gray-600/50 shadow-2xl transform transition-all hover:shadow-3xl hover:border-orange-400/50 duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-gray-700/50 p-3 rounded-full shadow-sm">
                <VideoIcon className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="font-bold text-xl ml-4 text-white">Vídeos</h3>
            </div>
            <p className="text-gray-200 mb-4 font-light">Tutoriais em vídeo para aprender visualmente como usar o CoopQuest</p>
            <Link to="/videos" className="text-orange-400 hover:text-orange-300 inline-flex items-center font-medium">
              Ver vídeos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Card>
          <Card className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-2xl border border-gray-600/50 shadow-2xl transform transition-all hover:shadow-3xl hover:border-orange-400/50 duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-gray-700/50 p-3 rounded-full shadow-sm">
                <HelpCircle className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="font-bold text-xl ml-4 text-white">Suporte</h3>
            </div>
            <p className="text-gray-200 mb-4 font-light">Entre em contato com nossa equipe de suporte para resolver problemas</p>
            <Link to="/suporte" className="text-orange-400 hover:text-orange-300 inline-flex items-center font-medium">
              Pedir ajuda <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Card>
        </div>
      )}

      {/* Popular Tutorials Section */}
      {(!searchQuery || filteredTutorialItems.length > 0) && (
        <div className="mb-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 text-white">Tutoriais Populares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(searchQuery ? filteredTutorialItems : tutorialItems).map((item, index) => (
              <Card key={index} className="bg-gradient-to-r from-gray-800 to-gray-700 p-5 rounded-2xl border border-gray-600/50 shadow-2xl transform transition-all hover:shadow-3xl hover:border-orange-400/50 duration-300">
                <div className="flex items-center mb-3">
                  {item.icon}
                  <h3 className="font-bold text-lg ml-3 text-white">{item.title}</h3>
                </div>
                <p className="text-gray-200 text-sm mb-3 font-light">{item.description}</p>
                <Link to={item.link} className="text-orange-400 text-sm hover:text-orange-300 inline-flex items-center font-medium">
                  Ler tutorial <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div id="faq" className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl border border-gray-600/50 p-6 mb-12 shadow-2xl mx-4 sm:mx-6 lg:mx-8 transform transition-all hover:shadow-3xl duration-300">
        <h2 className="text-3xl font-bold mb-6 text-white">Perguntas Frequentes</h2>
        {searchQuery && Object.keys(filteredFaqItems).length === 0 && filteredTutorialItems.length === 0 ? (
          <p className="text-gray-200 text-center font-light">Nenhum resultado encontrado para "{searchQuery}".</p>
        ) : (
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="mb-6 bg-gray-700/50 p-1 rounded-xl shadow-lg">
              {faqCategories
                .filter((category: { id: string; title: string }) => !searchQuery || filteredFaqItems[category.id])
                .map(category => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="px-4 py-2 text-gray-200 font-medium data-[state=active]:bg-gray-600/80 data-[state=active]:text-white rounded-lg transition-colors duration-300"
                  >
                    {category.title}
                  </TabsTrigger>
                ))}
            </TabsList>

            {Object.keys(searchQuery ? filteredFaqItems : faqItems).map(categoryId => (
              <TabsContent key={categoryId} value={categoryId}>
                <Accordion type="single" collapsible className="w-full">
                  {(searchQuery ? filteredFaqItems[categoryId] : faqItems[categoryId]).map((item: FaqItem, index: number) => (
                    <AccordionItem key={index} value={`${categoryId}-item-${index}`} className="border-b border-gray-600/50">
                      <AccordionTrigger className="text-white py-4 hover:text-orange-400 font-medium">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-200 pb-4 font-light">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </main>
  );
};

export default Ajuda;