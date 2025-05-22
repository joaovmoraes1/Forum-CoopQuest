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
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Discussões Recentes</h2>
      {topics.length > 0 ? (
        <ul className="space-y-4">
          {topics.map(topic => (
            <li key={topic.id} className="bg-gray-700 p-4 rounded-lg">
              <Link to={`/topico/${topic.id}`} className="hover:underline">
                <h3 className="text-lg font-semibold text-orange-400">{topic.title}</h3>
              </Link>
              <p className="text-gray-300 line-clamp-2">{topic.content}</p>
              <div className="flex items-center space-x-2 mt-2">
                <img
                  src={topic.authorUser.avatar || '/default-avatar.png'}
                  alt={topic.authorUser.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-gray-400">Por {topic.authorUser.name}</span>
                <span className="text-gray-400">• {new Date(topic.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex space-x-4 mt-2 text-gray-400">
                <span>Respostas: {topic.repliesCount}</span>
                <span>Visualizações: {topic.views}</span>
                <span>Curtidas: {topic.likes}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">Nenhuma discussão recente para exibir.</p>
      )}
    </div>
  );
};

export default DiscussionsSection;