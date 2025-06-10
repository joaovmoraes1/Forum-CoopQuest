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
      <h2 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-4 flex items-center">
        <svg className="w-6 h-6 text-yellow-400 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m13-7A4 4 0 1117 4a4 4 0 012 7.13M7 7A4 4 0 107 15a4 4 0 000-8z" />
        </svg>
        Membros Online
      </h2>
      {members.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center p-2 sm:p-3 bg-gray-700 rounded-md mb-2">
              <div className="relative w-16 h-16 rounded-full border-2 border-yellow-400 overflow-hidden bg-gray-900 flex-shrink-0">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png';
                  }}
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <span className="ml-3 text-sm sm:text-base text-white flex-1">{member.name}</span>
              <button className="ml-2 px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition">
                Conversar
              </button>
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