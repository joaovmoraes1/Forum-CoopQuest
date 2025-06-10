import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { toast } from 'sonner';

interface Topic {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  authorId: number;
  date: string;
  repliesCount: number;
  views: number;
  likes: number;
  authorUser: {
    name: string;
    avatar?: string;
  };
}

const DiscussionsSection: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get('/topics', {
          params: { page: 1, limit: 5 },
        });
        setTopics(response.data.topics);
      } catch (error: any) {
        toast.error('Erro ao carregar discussões: ' + (error.response?.data?.message || error.message));
      }
    };
    fetchTopics();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800 p-2 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-4">Discussões Recentes</h2>
      {topics.length > 0 ? (
        <ul className="grid grid-cols-1 gap-2 sm:gap-4">
          {topics.map(topic => (
            <li key={topic.id} className="bg-gray-700 p-2 sm:p-4 rounded-lg">
              <Link to={`/topico/${topic.id}`} className="hover:underline">
                <h3 className="text-base sm:text-lg font-semibold text-orange-400">{topic.title}</h3>
              </Link>
              <p className="text-sm sm:text-base text-gray-300 line-clamp-2">{topic.content}</p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1 sm:mt-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={topic.authorUser.avatar || '/default-avatar.png'}
                    alt={topic.authorUser.name}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                  />
                  <span className="text-xs sm:text-sm text-gray-400">Por {topic.authorUser.name}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-400">• {new Date(topic.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-1 sm:mt-2 text-gray-400 text-xs sm:text-sm">
                <span>Respostas: {topic.repliesCount}</span>
                <span>Visualizações: {topic.views}</span>
                <span>Curtidas: {topic.likes}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm sm:text-base text-gray-400">Nenhuma discussão recente para exibir.</p>
      )}
    </div>
  );
};

export default DiscussionsSection;