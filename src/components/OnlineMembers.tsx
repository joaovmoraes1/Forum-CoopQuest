// src/components/OnlineMembers.tsx
import React from 'react';

type Member = {
  id: number;
  name: string;
  avatar: string;
};

interface OnlineMembersProps {
  members: Member[];
}

const OnlineMembers: React.FC<OnlineMembersProps> = ({ members }) => {
  return (
    <div className="forum-panel">
      <h2 className="forum-header">Membros Online</h2>
      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center p-2 bg-gray-700 rounded-md">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-8 h-8 rounded-full mr-3"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.png'; // Fallback image
                }}
              />
              <span className="text-white">{member.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-300">Nenhum membro online.</p>
      )}
    </div>
  );
};

export default OnlineMembers;