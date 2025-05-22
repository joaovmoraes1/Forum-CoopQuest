import React from 'react';
import { User } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';

interface PersonalInfoSectionProps {
  user: User;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ user }) => {
  return (
    <Card className="bg-slate-800">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Informações Pessoais</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Nome</label>
            <p className="text-white">{user.name}</p>
          </div>
          
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <p className="text-white">{user.email}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfoSection;