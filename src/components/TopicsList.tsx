import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { Topic } from '@/services/topics';
import { MessageSquare, Eye } from 'lucide-react';

interface TopicsListProps {
  topics: Topic[];
  isLoading?: boolean;
}

const TopicsList: React.FC<TopicsListProps> = ({ 
  topics, 
  isLoading = false 
}) => {
  return (
    <div className="forum-panel">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
       
      </h2>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando tópicos...</p>
        </div>
      ) : topics.length > 0 ? (
        <div className="space-y-6">
          {topics.map((topic) => (
            <div key={topic.id} className="bg-gray-700 p-5 rounded-lg shadow-md hover:bg-gray-600 transition-colors">
              <div className="flex items-start gap-4">
                <img
                  src={topic.authorUser.avatar || 'https://via.placeholder.com/40'}
                  alt={topic.authorUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-3">
                    <Link to={`/topico/${topic.id}`} className="text-xl font-semibold text-orange-500 hover:underline">
                      {topic.title}
                    </Link>
                    {topic.category && (
                      <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full">
                        {topic.category}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300 mt-2">
                    <span>
                      Por{' '}
                      <Link to={`/perfil/${topic.authorId}`} className="text-orange-500 hover:underline">
                        {topic.authorUser.name}
                      </Link>
                      {' • '}
                      {new Date(topic.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {topic.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {topic.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-600 text-gray-300 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-sm text-gray-400 mt-3 flex gap-4">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={16} /> {topic.repliesCount} Respostas
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={16} /> {topic.views} Visualizações
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-300 text-center py-6">Nenhum tópico encontrado.</p>
      )}
    </div>
  );
};

export default TopicsList;