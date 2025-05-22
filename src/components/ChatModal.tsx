import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import api from '@/services/api';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', { autoConnect: false });

interface ChatModalProps {
  userId: number;
  userAvatar?: string;
  recipient: { id: number; name: string; avatar?: string };
  onClose: () => void;
}

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  date: string;
  isRead?: boolean;
  senderAvatar?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ userId, userAvatar, recipient, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [readStatus, setReadStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar histórico e conectar socket
  useEffect(() => {
    socket.connect();
    socket.emit('register', userId);

    api.get(`/messages/history/${recipient.id}`).then(res => {
      // CONVERTE senderId/recipientId para fromUserId/toUserId
      const msgs = (res.data.messages || []).map((msg: any) => ({
        ...msg,
        fromUserId: msg.senderId,
        toUserId: msg.recipientId,
      }));
      setMessages(msgs);
    }).catch(() => {});

    socket.on('private_message', (msg: any) => {
      // Garante que os campos estão corretos
      const mappedMsg = {
        ...msg,
        fromUserId: msg.senderId ?? msg.fromUserId,
        toUserId: msg.recipientId ?? msg.toUserId,
      };
      if (
        (mappedMsg.fromUserId === userId && mappedMsg.toUserId === recipient.id) ||
        (mappedMsg.fromUserId === recipient.id && mappedMsg.toUserId === userId)
      ) {
        setMessages(prev => [...prev, mappedMsg]);
        if (mappedMsg.fromUserId === recipient.id) {
          toast.info(`Nova mensagem de ${recipient.name}`);
        }
      }
    });

    socket.on('typing', ({ fromUserId }) => {
      if (fromUserId === recipient.id) {
        setTypingUser(recipient.name);
        setTimeout(() => setTypingUser(null), 2000);
      }
    });

    socket.on('messages_read', ({ byUserId }) => {
      if (byUserId === recipient.id) {
        setReadStatus(true);
      }
    });

    socket.emit('mark_read', { fromUserId: recipient.id, toUserId: userId });

    return () => {
      socket.off('private_message');
      socket.off('typing');
      socket.off('messages_read');
      socket.disconnect();
    };
  }, [userId, recipient.id, recipient.name]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensagem
  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('private_message', {
        toUserId: recipient.id,
        fromUserId: userId,
        content: input,
      });
      setInput('');
      setReadStatus(false);
    }
  };

  // Emitir evento de "digitando"
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    socket.emit('typing', { toUserId: recipient.id, fromUserId: userId });
  };

  // Verifica se a última mensagem enviada foi lida
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.fromUserId === userId && lastMsg.isRead) {
        setReadStatus(true);
      }
    }
  }, [messages, userId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div
        className="bg-[#384052] p-0 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md relative flex flex-col"
        style={{ maxHeight: 600 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 rounded-t-2xl bg-[#2b3140]">
          <div className="flex items-center gap-3">
            <img
              src={recipient.avatar || '/default-avatar.png'}
              alt={recipient.name}
              className="w-12 h-12 rounded-full border-2 border-orange-400 shadow"
            />
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-purple-300">💬</span> Chat com {recipient.name}
              </h3>
              {typingUser && (
                <span className="text-xs text-orange-300">{typingUser} está digitando...</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-2xl"
            title="Fechar"
          >✕</button>
        </div>
        {/* Mensagens */}
        <div
          className="flex-1 overflow-y-auto bg-[#384052] px-4 py-6 flex flex-col gap-2 custom-scrollbar"
          style={{ minHeight: 200, maxHeight: 350 }}
        >
          {messages.map((msg, idx) => {
            const isMe = msg.fromUserId === userId;
            return (
              <div
                key={idx}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img
                    src={recipient.avatar || '/default-avatar.png'}
                    alt={recipient.name}
                    className="w-8 h-8 rounded-full border border-orange-400"
                  />
                )}
                <div className={`
                  px-4 py-2 rounded-2xl shadow
                  ${isMe
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-br-md'
                    : 'bg-gray-200 text-gray-800 rounded-bl-md'
                  }
                  max-w-[70%] break-words
                `}>
                  <span
                    className="block"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content) }}
                  />
                  <span className="block text-xs text-gray-400 mt-1 text-right">
                    {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && idx === messages.length - 1 && readStatus && (
                    <span className="block text-xs text-green-400 mt-1 text-right">Lida</span>
                  )}
                </div>
                {isMe && (
                  <img
                    src={userAvatar || '/default-avatar.png'}
                    alt="Você"
                    className="w-8 h-8 rounded-full border border-blue-400"
                  />
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="flex gap-2 px-6 py-4 border-t border-gray-700 bg-[#2b3140] rounded-b-2xl">
          <input
            className="flex-1 p-2 rounded-lg bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={input}
            onChange={handleInputChange}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Digite sua mensagem..."
          />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-br from-orange-400 to-orange-600 px-5 py-2 rounded-lg text-white font-semibold hover:scale-105 transition"
          >
            Enviar
          </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222a36;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default ChatModal;