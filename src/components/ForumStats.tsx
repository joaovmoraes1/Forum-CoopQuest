
import React from 'react';
import { MessageSquare, Users, BookOpen } from 'lucide-react';

interface ForumStatsProps {
  topics: number;
  replies: number;
  members: number;
}

const ForumStats: React.FC<ForumStatsProps> = ({ topics, replies, members }) => {
  return (
    <div className="forum-panel">
      <h2 className="forum-header">Estatísticas do Fórum</h2>
      <div className="space-y-3">
        <div className="flex items-center space-x-3 bg-gray-700 p-3 rounded-md">
          <BookOpen className="text-coopquest-yellow" size={24} />
          <div>
            <p className="text-lg font-bold">{topics}</p>
            <p className="text-sm text-gray-300">Tópicos</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-gray-700 p-3 rounded-md">
          <MessageSquare className="text-coopquest-yellow" size={24} />
          <div>
            <p className="text-lg font-bold">{replies}</p>
            <p className="text-sm text-gray-300">Respostas</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-gray-700 p-3 rounded-md">
          <Users className="text-coopquest-yellow" size={24} />
          <div>
            <p className="text-lg font-bold">{members}</p>
            <p className="text-sm text-gray-300">Membros</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumStats;
