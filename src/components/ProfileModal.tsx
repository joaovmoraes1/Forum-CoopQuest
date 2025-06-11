import React, { useState, useEffect } from 'react';
import api from '../services/api';
import UserProfileDetails from './UserProfileDetails';
import { getAvatarUrl } from '@/lib/avatarUrl';

interface User {
  id: number;
  name: string;
  avatar?: string;
  email: string;
  bio?: string;
  createdAt: string;
  level?: number;
  projects?: number;
  title?: string;
  location?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  skills?: string;
}

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  receiverId: number;
  receiverName?: string;
  receiverAvatar?: string;
  content: string;
  sentAt: string;
  read: boolean;
}

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  initialTab?: 'info' | 'received' | 'sent';
  isOwnProfile: boolean;
  onOpenChat?: (user: User) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onClose,
  initialTab = 'info',
  isOwnProfile,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'received' | 'sent'>(initialTab);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOwnProfile) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const receivedResponse = await api.get(`/messages/received`);
          const sentResponse = await api.get(`/messages/sent`);

          const mappedReceivedMessages = receivedResponse.data.messages.map((msg: any) => ({
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.sender.name,
            senderAvatar: msg.sender.avatar,
            receiverId: msg.recipientId,
            content: msg.content,
            sentAt: msg.date,
            read: msg.isRead,
          }));

          const mappedSentMessages = sentResponse.data.messages.map((msg: any) => ({
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.sender?.name || 'Usuário',
            senderAvatar: msg.sender?.avatar,
            receiverId: msg.recipientId,
            receiverName: msg.recipient?.name || 'Usuário',
            receiverAvatar: msg.recipient?.avatar,
            content: msg.content,
            sentAt: msg.date,
            read: msg.isRead,
          }));

          setReceivedMessages(mappedReceivedMessages);
          setSentMessages(mappedSentMessages);
        } catch (error) {
          console.error('Erro ao buscar mensagens:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    }
  }, [isOwnProfile]);

  const markAsRead = async (messageId: number) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      setReceivedMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
      );
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 sm:p-6 rounded-xl shadow-2xl border border-gray-600 w-full max-w-md sm:max-w-2xl transform transition-all duration-500 overflow-y-auto max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-2 sm:mb-6">
          <h3 className="text-base sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <span className="text-orange-400 text-sm sm:text-lg">👤</span> Perfil de {user.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-lg p-1 sm:p-2 rounded-full hover:bg-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Abas */}
        <div className="border-b border-gray-500 mb-2 sm:mb-6 flex flex-wrap gap-2 sm:gap-4">
          <button
            className={`px-2 sm:px-5 py-1 sm:py-3 text-xs sm:text-sm font-semibold transition-colors duration-300 ${
              activeTab === 'info'
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-300 hover:text-orange-300'
            }`}
            onClick={() => setActiveTab('info')}
          >
            Informações
          </button>
          {isOwnProfile && (
            <>
              <button
                className={`px-2 sm:px-5 py-1 sm:py-3 text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                  activeTab === 'received'
                    ? 'text-orange-400 border-b-2 border-orange-400'
                    : 'text-gray-300 hover:text-orange-300'
                }`}
                onClick={() => setActiveTab('received')}
              >
                Mensagens Recebidas
              </button>
              <button
                className={`px-2 sm:px-5 py-1 sm:py-3 text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                  activeTab === 'sent'
                    ? 'text-orange-400 border-b-2 border-orange-400'
                    : 'text-gray-300 hover:text-orange-300'
                }`}
                onClick={() => setActiveTab('sent')}
              >
                Mensagens Enviadas
              </button>
            </>
          )}
        </div>

        {/* Conteúdo */}
        <div className="min-h-[16rem] sm:min-h-[20rem] max-h-[24rem] sm:max-h-[30rem] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-700">
          {activeTab === 'info' && (
            <UserProfileDetails userId={user.id} />
          )}

          {activeTab === 'received' && isOwnProfile && (
            <div className="grid grid-cols-1 gap-2 sm:gap-4">
              <h4 className="text-base sm:text-xl font-semibold text-white">Mensagens Recebidas</h4>
              {loading ? (
                <p className="text-xs sm:text-sm text-gray-300">Carregando mensagens...</p>
              ) : receivedMessages.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-300">Nenhuma mensagem recebida.</p>
              ) : (
                receivedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 sm:p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start gap-2 sm:gap-4 ${
                      msg.read ? 'bg-gray-700' : 'bg-gray-600'
                    } transition-all duration-200 hover:shadow-lg`}
                  >
                    <img
                      src={getAvatarUrl(msg.senderAvatar)}
                      alt={msg.senderName}
                      className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-orange-400"
                      onError={e => { e.currentTarget.src = '/default-avatar.png'; }}
                    />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-200">
                        De: <span className="font-semibold">{msg.senderName}</span>
                      </p>
                      <p className="text-sm sm:text-base text-gray-100 mt-1">{msg.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.sentAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2">
                      {!msg.read && (
                        <button
                          onClick={() => markAsRead(msg.id)}
                          className="text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-medium transition-colors duration-200"
                        >
                          Marcar como lida
                        </button>
                      )}
                      {onOpenChat && (
                        <button
                          onClick={() =>
                            onOpenChat({
                              id: msg.senderId,
                              name: msg.senderName,
                              avatar: msg.senderAvatar,
                              email: '',
                              createdAt: ''
                            })
                          }
                          className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors duration-200"
                        >
                          Abrir Chat
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sent' && isOwnProfile && (
            <div className="grid grid-cols-1 gap-2 sm:gap-4">
              <h4 className="text-base sm:text-xl font-semibold text-white">Mensagens Enviadas</h4>
              {loading ? (
                <p className="text-xs sm:text-sm text-gray-300">Carregando mensagens...</p>
              ) : sentMessages.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-300">Nenhuma mensagem enviada.</p>
              ) : (
                sentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-2 sm:p-4 rounded-lg bg-gray-700 shadow-md flex flex-col sm:flex-row items-start gap-2 sm:gap-4 transition-all duration-200 hover:shadow-lg"
                  >
                    <img
                      src={getAvatarUrl(msg.receiverAvatar)}
                      alt={msg.receiverName}
                      className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-orange-400"
                      onError={e => { e.currentTarget.src = '/default-avatar.png'; }}
                    />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-200">
                        Para: <span className="font-semibold">{msg.receiverName}</span>
                      </p>
                      <p className="text-sm sm:text-base text-gray-100 mt-1">{msg.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.sentAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {onOpenChat && (
                      <button
                        onClick={() =>
                          onOpenChat({
                            id: msg.receiverId,
                            name: msg.receiverName || 'Usuário',
                            avatar: msg.receiverAvatar,
                            email: '',
                            createdAt: ''
                          })
                        }
                        className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors duration-200"
                      >
                        Abrir Chat
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;