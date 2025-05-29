import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarIcon, MessageSquareIcon, UsersIcon, TrophyIcon, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTopics, Topic } from '@/services/topics';
import { getEvents, participateEvent, Event, checkParticipation } from '@/services/events';
import SendMessageModal from '../components/SendMessageModal';
import ProfileModal from '../components/ProfileModal';
import api from '../services/api';
import ChatModal from '../components/ChatModal';

interface Discussion {
  id: string;
  title: string;
  author: string;
  responses: number;
  updatedAt: string;
  tags: string[];
  featured: boolean;
}

interface User {
  id: number;
  name: string;
  avatar?: string;
  email: string;
  bio?: string;
  createdAt: string;
  level?: number;
  projects?: number;
  isOnline?: boolean;
  lastActivity?: string;
}

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  date: string;
  isRead: boolean;
}
const MembrosTab = ({ members, onViewProfile, onSendMessage }: { 
  members: User[], 
  onViewProfile: (member: User) => void, 
  onSendMessage: (member: User) => void,
}) => {
  const { user } = useAuth();
  const filteredMembers = members.filter(
    (member, index, self) => index === self.findIndex((m) => m.id === member.id)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-text">Membros em Destaque</h2>
        <div className="px-4 py-1 bg-green-900/50 text-green-400 border border-green-800/50 rounded-full text-sm shadow-sm">
          Online: {filteredMembers.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-secondary rounded-2xl shadow-2xl border border-border transform transition-all hover:shadow-3xl duration-500 overflow-hidden">
            <div className="p-6 flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-coopquest-yellow/50 shadow-sm">
                  <img
                    src={member.avatar || '/default-avatar.png'}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-secondary"></span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-text text-xl">{member.name}</h3>
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-md">Online</span>
                </div>
                <p className="text-sm text-text/80 font-light">
                  Membro desde: {new Date(member.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                </p>
            
              </div>
            </div>

            <div className="flex border-t border-border">
              <button
                className="flex-1 p-4 text-coopquest-yellow hover:bg-secondary/70 transition-colors text-sm font-medium"
                onClick={() => {
                  onViewProfile(member);
                }}
              >
                Ver Perfil
              </button>
              {user?.id !== member.id && (
                <button
                  className="flex-1 p-4 text-blue-400 hover:bg-secondary/70 transition-colors text-sm font-medium"
                  onClick={() => {
                    onSendMessage(member);
                  }}
                >
                  Enviar Mensagem
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EventosTab = ({ events }: { events: Event[] }) => {
  const navigate = useNavigate();
  const [participationStatus, setParticipationStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const checkAllParticipations = async () => {
      const status: { [key: string]: boolean } = {};
      for (const event of events) {
        const { isParticipating } = await checkParticipation(event.id);
        status[event.id] = isParticipating;
      }
      setParticipationStatus(status);
    };

    if (events.length > 0) {
      checkAllParticipations();
    }
  }, [events]);

  const handleParticipate = async (eventId: string) => {
    try {
      const response = await participateEvent(eventId);
      if (response.success) {
        toast.success('Você se inscreveu no evento com sucesso!');
        setParticipationStatus((prev) => ({ ...prev, [eventId]: true }));
      } else {
        toast.error(response.error || 'Erro ao participar do evento.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao conectar com o servidor.');
    }
  };

  const handleMoreInfo = (event: Event) => {
    toast.info(
      `Detalhes do Evento:\n\n` +
      `Título: ${event.title}\n` +
      `Descrição: ${event.description}\n` +
      `Data: ${event.date}\n` +
      `Horário: ${event.time}\n` +
      `Tipo: ${event.type}\n` +
      `Participantes: ${event.participants}`
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-text">Próximos Eventos</h2>
        <div className="px-4 py-1 bg-blue-900/50 text-blue-400 border border-blue-800/50 rounded-full text-sm shadow-sm">
          {events.length} Eventos Agendados
        </div>
      </div>

      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="bg-secondary rounded-2xl shadow-2xl border border-border transform transition-all hover:shadow-3xl duration-500 overflow-hidden">
            <div className={`h-1 ${event.type === 'Competição' ? 'bg-coopquest-yellow' : 'bg-blue-500'}`}></div>

            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {event.type === 'Competição' ? (
                    <TrophyIcon className="text-coopquest-yellow" size={28} />
                  ) : (
                    <CalendarIcon className="text-blue-400" size={28} />
                  )}
                  <h3 className="text-2xl font-bold text-text">{event.title}</h3>
                </div>
                <span
                  className={`px-4 py-1 rounded-md text-white text-sm font-medium ${
                    event.type === 'Competição' ? 'bg-coopquest-yellow' : 'bg-blue-500'
                  } shadow-sm`}
                >
                  {event.type}
                </span>
              </div>

              <p className="text-text/80 my-4 font-light leading-relaxed">{event.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-text/80">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={20} className="text-coopquest-yellow" />
                  <span>
                    {event.date} - {event.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon size={20} className="text-coopquest-yellow" />
                  <span>{event.participants} participantes confirmados</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 p-4 border-t border-border">
              <button
                className="px-4 py-2 text-text/80 hover:text-text hover:bg-secondary/70 rounded-xl transition-colors font-medium"
                onClick={() => handleMoreInfo(event)}
              >
                Mais Informações
              </button>
              <button
                className={`px-4 py-2 text-white rounded-xl font-medium ${
                  event.type === 'Competição'
                    ? 'bg-coopquest-yellow hover:bg-yellow-400'
                    : 'bg-blue-500 hover:bg-blue-600'
                } ${participationStatus[event.id] ? 'opacity-50 cursor-not-allowed' : ''} transform transition-all hover:scale-105 duration-300 shadow-lg`}
                onClick={() => handleParticipate(event.id)}
                disabled={participationStatus[event.id]}
              >
                {participationStatus[event.id] ? 'Já Participando' : 'Participar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DiscussoesTab = ({ discussions }: { discussions: Discussion[] }) => {
  const navigate = useNavigate();

  const getTagClasses = (tag: string) => {
    if (tag === 'Algoritmos') {
      return 'bg-blue-900/50 text-blue-300 border border-blue-700/50';
    } else if (tag === 'Machine Learning') {
      return 'bg-green-900/50 text-green-300 border border-green-700/50';
    }
    return 'bg-orange-900/50 text-orange-300 border border-orange-700/50';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-text">Discussões Recentes</h2>
        <div className="px-4 py-1 bg-purple-900/50 text-purple-400 border border-purple-800/50 rounded-full text-sm shadow-sm">
          Novos Tópicos: {discussions.length}
        </div>
      </div>

      <div className="space-y-4">
        {discussions.map((discussion) => (
          <div
            key={discussion.id}
            className="bg-secondary rounded-2xl shadow-2xl border border-border transform transition-all hover:shadow-3xl hover:border-border/50 duration-500 p-6 cursor-pointer"
            onClick={() => navigate(`/topico/${discussion.id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-medium text-text">{discussion.title}</h3>
                <p className="text-text/80 text-sm mt-1 font-light">
                  Iniciado por {discussion.author} • {discussion.responses} respostas • {discussion.updatedAt}
                </p>
              </div>
              <span
                className={`px-4 py-1 rounded-md text-white text-sm font-medium ${
                  discussion.featured ? 'bg-purple-600' : 'bg-secondary/70'
                } shadow-sm`}
              >
                {discussion.featured ? 'Em Destaque' : 'Discussão'}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              {discussion.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getTagClasses(tag)} shadow-sm`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transform transition-all hover:scale-105 duration-300 shadow-lg"
            onClick={() => navigate('/forum')}
          >
            Ver Todas as Discussões
          </button>
        </div>
      </div>
    </div>
  );
};

const Comunidade = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'membros' | 'eventos' | 'discussoes'>('membros');
  const [showMessageModal, setShowMessageModal] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false); // Controle único do toast
  const navigate = useNavigate();

  // Fetch unread messages count com controle de toast
  const fetchUnreadCount = useCallback(async () => {
  setIsRefreshing(true);
  try {
    const response = await api.get('/messages/received');
    const messages: Message[] = response.data.messages || [];
    const newUnreadCount = messages.filter((msg) => !msg.isRead).length;
    setUnreadCount(newUnreadCount);

    if (showUpdateToast) {
      toast.success(`Mensagens atualizadas! Você tem ${newUnreadCount} mensagem(s) não lida(s).`);
      setShowUpdateToast(false);
    }
  } catch (error) {
    console.error('Erro ao buscar contagem de mensagens não lidas:', error);
    toast.error('Erro ao atualizar mensagens. Tente novamente.');
  } finally {
    setIsRefreshing(false);
  }
}, [showUpdateToast]);

  // Fetch unread messages initially and every 10 seconds (sem toast automático)
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUnreadCount();
      const interval = setInterval(() => {
        fetchUnreadCount(); // Atualização automática sem toast
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, fetchUnreadCount]);

  // Toast notification for new messages
  useEffect(() => {
    if (unreadCount > prevUnreadCount && unreadCount > 0) {
      toast.info(`Você tem ${unreadCount} nova(s) mensagem(ns)!`, {
        action: {
          label: 'Ver Mensagens',
          onClick: () => {
            if (user) {
              setShowProfileModal(user);
            }
          },
        },
      });
    }
    setPrevUnreadCount(unreadCount);
  }, [unreadCount, user, prevUnreadCount]);

  // Fetch community data
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const membersData = await api.get('/members/featured');
      console.log('Membros em destaque carregados:', membersData.data);
      setMembers(membersData.data);

      const eventsResponse = await getEvents();
      if (eventsResponse.data) {
        setEvents(eventsResponse.data);
      } else {
        toast.error(eventsResponse.error || 'Erro ao carregar eventos.');
      }

      const topicsResponse = await getTopics();
      if (topicsResponse.topics) {
        setDiscussions(
          topicsResponse.topics.map((topic: Topic) => ({
            id: topic.id.toString(),
            title: topic.title,
            author: topic.author,
            responses: topic.repliesCount,
            updatedAt: new Date(topic.date).toLocaleDateString(),
            tags: topic.tags,
            featured: topic.likes > 10,
          }))
        );
      } else {
        toast.error('Erro ao carregar discussões.');
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error(error.message || 'Erro ao carregar dados da comunidade.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      toast.error('Faça login para acessar a comunidade.');
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate, user]);

  // Disparar toast ao abrir o modal de mensagens ou clicar em Atualizar
const handleOpenMessages = async () => {
  if (user) {
    setShowUpdateToast(true);
    try {
      await api.post('/messages/mark-read');
      await fetchUnreadCount(); // Atualiza a contagem após marcar como lido
      setShowProfileModal(user);
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      toast.error('Erro ao atualizar status das mensagens.');
    }
  }
};

  const handleUpdateClick = () => {
    setShowUpdateToast(true); // Ativar toast para a próxima chamada de fetchUnreadCount
    fetchUnreadCount(); // Atualizar ao clicar
  };

  if (authLoading || isLoading) {
    return (
      <main className="flex-grow py-12 min-h-screen flex justify-center items-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-coopquest-yellow border-r-transparent"></div>
          <p className="text-text/80 mt-4 font-light">Carregando comunidade...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow py-12 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="bg-coopquest-yellow text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 mb-2 tracking-tight">
            Comunidade CoopQuest
          </h1>
          <p className="text-base sm:text-lg text-gray-100 max-w-2xl font-light">
            Conheça outros membros da comunidade e participe das discussões.
          </p>
        </div>
      </div>

      <div className="mb-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex bg-secondary/50 rounded-xl overflow-hidden shadow-lg">
            <button
              className={`px-6 py-3 flex items-center gap-2 text-text font-medium ${
                activeTab === 'membros' ? 'bg-secondary/80' : 'hover:bg-secondary/70'
              } transition-colors duration-300`}
              onClick={() => setActiveTab('membros')}
            >
              <UsersIcon size={20} className="text-coopquest-yellow" />
              <span>Membros</span>
            </button>
            <button
              className={`px-6 py-3 flex items-center gap-2 text-text font-medium ${
                activeTab === 'eventos' ? 'bg-secondary/80' : 'hover:bg-secondary/70'
              } transition-colors duration-300`}
              onClick={() => setActiveTab('eventos')}
            >
              <CalendarIcon size={20} className="text-coopquest-yellow" />
              <span>Eventos</span>
            </button>
            <button
              className={`px-6 py-3 flex items-center gap-2 text-text font-medium ${
                activeTab === 'discussoes' ? 'bg-secondary/80' : 'hover:bg-secondary/70'
              } transition-colors duration-300`}
              onClick={() => setActiveTab('discussoes')}
            >
              <MessageSquareIcon size={20} className="text-coopquest-yellow" />
              <span>Discussões</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenMessages}
              className="relative flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Minhas Mensagens</span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={handleUpdateClick}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                  Atualizando...
                </>
              ) : (
                'Atualizar'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        {activeTab === 'membros' && (
          <MembrosTab 
            members={members} 
            onViewProfile={(member) => setShowProfileModal(member)} 
            onSendMessage={(member) => setShowMessageModal(member)}
          />
        )}
        {activeTab === 'eventos' && <EventosTab events={events} />}
        {activeTab === 'discussoes' && <DiscussoesTab discussions={discussions} />}
      </div>

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
  {showProfileModal && (
    <ProfileModal
      user={showProfileModal}
      onClose={() => setShowProfileModal(null)}
      initialTab={showProfileModal.id === user?.id ? 'received' : 'info'}
      isOwnProfile={showProfileModal.id === user?.id}
      onOpenChat={(member) => setShowMessageModal(member)} 
    />
  )}
    </main>
  );
};

export default Comunidade;