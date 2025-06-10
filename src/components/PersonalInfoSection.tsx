import React from 'react';
import { User } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';

interface PersonalInfoSectionProps {
  user: User;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ user }) => {
  return (
    <Card className="w-full max-w-md sm:max-w-lg mx-auto bg-slate-800 p-2 sm:p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 gap-2 sm:gap-4">
        <h2 className="text-base sm:text-xl font-bold text-white mb-2 sm:mb-4">Informações Pessoais</h2>
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          <div>
            <label className="text-xs sm:text-sm text-gray-400">Nome</label>
            <p className="text-sm sm:text-base text-white">{user.name}</p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-400">Email</label>
            <p className="text-sm sm:text-base text-white">{user.email}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfoSection;