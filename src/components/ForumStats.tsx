import React from 'react';
import { MessageSquare, Users, BookOpen } from 'lucide-react';

interface ForumStatsProps {
  topics: number;
  replies: number;
  members: number;
}

const ForumStats: React.FC<ForumStatsProps> = ({ topics, replies, members }) => {
  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto bg-gray-800 p-2 sm:p-4 rounded-lg shadow-lg">
      <h2 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-4">Estatísticas do Fórum</h2>
      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        <div className="flex items-center space-x-2 sm:space-x-3 bg-gray-700 p-2 sm:p-3 rounded-md">
          <BookOpen className="text-coopquest-yellow w-5 h-5 sm:w-6 sm:h-6" />
          <div>
            <p className="text-base sm:text-lg font-bold text-white">{topics}</p>
            <p className="text-xs sm:text-sm text-gray-300">Tópicos</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 bg-gray-700 p-2 sm:p-3 rounded-md">
          <MessageSquare className="text-coopquest-yellow w-5 h-5 sm:w-6 sm:h-6" />
          <div>
            <p className="text-base sm:text-lg font-bold text-white">{replies}</p>
            <p className="text-xs sm:text-sm text-gray-300">Respostas</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 bg-gray-700 p-2 sm:p-3 rounded-md">
          <Users className="text-coopquest-yellow w-5 h-5 sm:w-6 sm:h-6" />
          <div>
            <p className="text-base sm:text-lg font-bold text-white">{members}</p>
            <p className="text-xs sm:text-sm text-gray-300">Membros</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumStats;