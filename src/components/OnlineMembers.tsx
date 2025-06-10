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
    <div className="w-full max-w-md sm:max-w-lg mx-auto bg-gray-800 p-2 sm:p-4 rounded-lg shadow-lg">
      <h2 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-4">Membros Online</h2>
      {members.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center p-2 sm:p-3 bg-gray-700 rounded-md">
            <img
                src={member.avatar}
                alt={member.name}
                className="w-16 h-16 rounded-full mr-3 border-2 border-yellow-400"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.png';
                }}
              />
              <span className="text-sm sm:text-base text-white">{member.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-gray-300">Nenhum membro online.</p>
      )}
    </div>
  );
};

export default OnlineMembers;