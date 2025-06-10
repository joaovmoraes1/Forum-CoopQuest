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
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
      <h2 className="text-base sm:text-2xl font-semibold text-white mb-2 sm:mb-6 flex items-center gap-2">
        Tópicos
      </h2>
      
      {isLoading ? (
        <div className="text-center py-6 sm:py-10">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 sm:mt-4 text-gray-400 text-xs sm:text-sm">Carregando tópicos...</p>
        </div>
      ) : topics.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:gap-6">
          {topics.map((topic) => (
            <div key={topic.id} className="bg-gray-700 p-3 sm:p-5 rounded-lg shadow-md hover:bg-gray-600 transition-colors">
              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
                <img
                  src={topic.authorUser.avatar || 'https://via.placeholder.com/40'}
                  alt={topic.authorUser.name}
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3">
                    <Link to={`/topico/${topic.id}`} className="text-base sm:text-xl font-semibold text-orange-500 hover:underline">
                      {topic.title}
                    </Link>
                    {topic.category && (
                      <span className="text-xs sm:text-sm bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full">
                        {topic.category}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300 mt-1 sm:mt-2">
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
                    <div className="mt-1 sm:mt-2 flex flex-wrap gap-1 sm:gap-2">
                      {topic.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-600 text-gray-300 px-2 sm:px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs sm:text-sm text-gray-400 mt-2 sm:mt-3 flex gap-2 sm:gap-4">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" /> {topic.repliesCount} Respostas
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> {topic.views} Visualizações
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-300 text-center py-4 sm:py-6 text-xs sm:text-sm">Nenhum tópico encontrado.</p>
      )}
    </div>
  );
};

export default TopicsList;