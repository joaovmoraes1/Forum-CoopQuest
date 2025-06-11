import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Heart, Share2, Flag, MessageSquare, Clock } from 'lucide-react';
import ReportModal from '../components/ReportModal';
import { useAccessibility } from '@/components/Layout';
import ChatModal from '../components/ChatModal';
import TopicContent from '@/components/TopicContent';
import { getAvatarUrl } from '@/lib/avatarUrl';


interface AuthorUser {
  name: string;
  avatar?: string;
}

interface Reply {
  id: number;
  content: string;
  author: string;
  authorId: number;
  date: string;
  likes: number;
  authorUser: AuthorUser;
}

interface Topic {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorId: number;
  date: string;
  views: number;
  likes: number;
  repliesCount: number;
  authorUser: AuthorUser;
  replies: Reply[];
}

const Topico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { fontSize } = useAccessibility();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [newReply, setNewReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState<{
    id: number;
    name: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const fetchTopicData = async () => {
      if (!id || isNaN(Number(id))) {
        toast.error('ID do tópico inválido.');
        navigate('/forum');
        return;
      }

      try {
        const response = await api.get(`/topics/${id}`);
        console.log('API Response:', response.data); // Debug log
        setTopic(response.data);
      } catch (error: any) {
        console.error('API Error:', error.response?.data || error.message); // Debug log
        let errorMessage = 'Erro ao carregar o tópico.';
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = 'Tópico não encontrado.';
          } else if (error.response.status === 401) {
            errorMessage = 'Sessão expirada. Faça login novamente.';
            localStorage.removeItem('authToken');
            navigate('/login');
            return;
          } else {
            errorMessage = error.response.data?.error || errorMessage;
          }
        } else if (error.request) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        }
        toast.error(errorMessage);
      }
    };

    fetchTopicData();
  }, [id, navigate]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para responder.');
      return;
    }

    if (!newReply.trim()) {
      toast.error('Você precisa digitar uma resposta.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(`/topics/${id}/replies`, { content: newReply });
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              replies: [
                ...prev.replies,
                {
                  ...response.data,
                  authorUser: {
                    name: user?.name || 'Usuário',
                    avatar: user?.avatar || 'http://localhost:3000/default-avatar.png',
                  },
                },
              ],
              repliesCount: prev.repliesCount + 1,
            }
          : null
      );
      setNewReply('');
      toast.success('Resposta enviada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao enviar resposta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeTopic = async () => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para curtir.');
      return;
    }

    try {
      const response = await api.post(`/topics/${id}/like`);
      setTopic((prev) => (prev ? { ...prev, likes: response.data.likes } : null));
      toast.success('Tópico curtido!');
    } catch {
      toast.error('Erro ao curtir tópico');
    }
  };

  const handleLikeReply = async (replyId: number) => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para curtir.');
      return;
    }

    try {
      const response = await api.post(`/replies/${replyId}/like`);
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              replies: prev.replies.map((reply) =>
                reply.id === replyId ? { ...reply, likes: response.data.likes } : reply
              ),
            }
          : null
      );
      toast.success('Resposta curtida!');
    } catch {
      toast.error('Erro ao curtir resposta');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: topic?.title,
          text: `Confira este tópico no Fórum CoopQuest: ${topic?.title}`,
          url: window.location.href,
        })
        .then(() => {
          toast.success('Tópico compartilhado com sucesso!');
        })
        .catch(() => {
          navigator.clipboard.writeText(window.location.href);
          toast.success('Link copiado para a área de transferência!');
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const handleReport = async (reason: string) => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para reportar.');
      return;
    }

    const contentId = Number(id);
    if (isNaN(contentId)) {
      toast.error('ID do tópico inválido. Tente novamente.');
      return;
    }

    if (!reason.trim()) {
      toast.error('Por favor, selecione um motivo para denunciar.');
      return;
    }

    try {
      await api.post(`/reports`, {
        contentId,
        contentType: 'topic',
        reason,
      });
      toast.success('Tópico reportado. Agradecemos sua colaboração!');
      setIsReportModalOpen(false);
    } catch {
      toast.error('Erro ao reportar o tópico. Tente novamente mais tarde.');
    }
  };

  if (!topic) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-transparent px-2 sm:px-4 lg:px-8"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-6 text-xl font-medium">Carregando tópico...</p>
        </div>
      </div>
    );
  }

  const authorAvatarUrl = topic.authorUser.avatar && topic.authorUser.avatar.startsWith('data:image/')
    ? topic.authorUser.avatar
    : topic.authorUser.avatar
    ? `http://localhost:3000/${topic.authorUser.avatar}`
    : 'http://localhost:3000/default-avatar.png';

  return (
    <div
      className="py-12 px-2 sm:px-4 lg:px-8 bg-transparent min-h-screen w-full max-w-full mx-auto"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl mb-10 p-2 sm:p-6 border border-gray-600/50 w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 mb-6 leading-tight tracking-tight">
          {topic.title}
        </h1>
        <div className="flex items-center gap-4 mb-6">
          <Link to={`/perfil/${topic.authorId}`}>
            <img
              src={getAvatarUrl(topic.authorUser.avatar)}
              alt={topic.authorUser.name}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-2 border-orange-400/50 shadow-sm hover:scale-105 transition"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/150';
              }}
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={`/perfil/${topic.authorId}`}
                className="text-xl font-semibold text-white hover:text-orange-400 transition-colors duration-300"
              >
                {topic.authorUser.name}
              </Link>
              {user?.id !== topic.authorId && (
                <Button
                  size="sm"
                  className="ml-2 bg-coopquest-yellow hover:bg-yellow-400 text-black font-semibold py-1 px-3 rounded-xl shadow"
                  onClick={() =>
                    setShowMessageModal({
                      id: topic.authorId,
                      name: topic.authorUser.name,
                      avatar: topic.authorUser.avatar,
                    })
                  }
                >
                  Conversar
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-200 text-sm mt-1">
              <Clock size={16} className="text-orange-400" />
              <span>
                {new Date(topic.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
            {topic.category}
          </span>
          {topic.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-600/80 text-gray-200 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-gray-500/80 transition-colors duration-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row md:gap-6 text-gray-200 text-sm">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-orange-400" />
            <span className="font-medium">{topic.views} Visualizações</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-orange-400" />
            <span className="font-medium">{topic.likes} Curtidas</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-orange-400" />
            <span className="font-medium">{topic.repliesCount} Respostas</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl p-2 sm:p-6 mb-10 border border-gray-600/50 w-full">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-orange-400">Conteúdo do Tópico</span>
        </h2>
        <TopicContent content={topic.content} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10 w-full">
        <Button
          onClick={handleLikeTopic}
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transform transition-all hover:scale-105 duration-300"
        >
          <Heart size={20} /> Curtir ({topic.likes})
        </Button>
        <Button
          onClick={handleShare}
          className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transform transition-all hover:scale-105 duration-300"
        >
          <Share2 size={20} /> Compartilhar
        </Button>
        <Button
          onClick={() => setIsReportModalOpen(true)}
          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transform transition-all hover:scale-105 duration-300"
        >
          <Flag size={20} /> Reportar
        </Button>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReport}
        contentType="topic"
      />

      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl p-2 sm:p-6 mb-10 border border-gray-600/50 w-full">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <MessageSquare size={24} className="text-orange-400" /> Respostas ({topic.repliesCount})
        </h2>
        {topic.replies.length > 0 ? (
          <div className="space-y-6">
            {topic.replies.map((reply) => {
              const replyAvatarUrl = reply.authorUser.avatar && reply.authorUser.avatar.startsWith('data:image/')
                ? reply.authorUser.avatar
                : reply.authorUser.avatar
                ? `http://localhost:3000/${reply.authorUser.avatar}`
                : 'http://localhost:3000/default-avatar.png';

              return (
                <div key={reply.id} className="resposta-container">
                  <Link to={`/perfil/${reply.authorId}`}>
                    <img
                      src={getAvatarUrl(reply.authorUser.avatar)}
                      alt={reply.authorUser.name}
                      className="resposta-avatar"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="resposta-header">
                      <Link
                        to={`/perfil/${reply.authorId}`}
                        className="text-orange-400 font-semibold hover:underline transition-colors duration-300"
                      >
                        {reply.authorUser.name}
                      </Link>
                      {user?.id !== reply.authorId && (
                        <Button
                          size="sm"
                          className="ml-2 bg-coopquest-yellow hover:bg-yellow-400 text-black font-semibold py-1 px-3 rounded-xl shadow"
                          onClick={() =>
                            setShowMessageModal({
                              id: reply.authorId,
                              name: reply.authorUser.name,
                              avatar: reply.authorUser.avatar,
                            })
                          }
                        >
                          Conversar
                        </Button>
                      )}
                      <span className="text-gray-200 text-sm">
                        {new Date(reply.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <Button
                        onClick={() => handleLikeReply(reply.id)}
                        variant="ghost"
                        className="like-button text-gray-200 hover:text-orange-400 flex items-center gap-2 transition-colors duration-300"
                      >
                        <Heart size={18} /> {reply.likes}
                      </Button>
                    </div>
                    <p className="resposta-content">{reply.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-700/50 rounded-xl p-2 sm:p-6 text-center text-gray-200 shadow-md border border-gray-600/30 w-full">
            Nenhuma resposta ainda. Seja o primeiro a responder!
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl p-2 sm:p-6 border border-gray-600/50 w-full">
          <h2 className="text-2xl font-bold text-white mb-6">Adicionar uma Resposta</h2>
          <form onSubmit={handleReplySubmit} className="space-y-6">
            <Textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Escreva sua resposta..."
              className="bg-gray-700/50 text-white border-gray-600 focus:ring-orange-500 focus:border-orange-500 h-36 rounded-xl placeholder-gray-400 transition-all duration-300 shadow-inner"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-4 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  Enviando...
                </div>
              ) : (
                'Enviar Resposta'
              )}
            </Button>
          </form>
        </div>
      )}

      {showMessageModal && user && (
        <ChatModal
          userId={user.id}
          userAvatar={user.avatar}
          recipient={{
            id: showMessageModal.id,
            name: showMessageModal.name,
            avatar: showMessageModal.avatar,
          }}
          onClose={() => setShowMessageModal(null)}
        />
      )}
    </div>
  );
};

export default Topico;