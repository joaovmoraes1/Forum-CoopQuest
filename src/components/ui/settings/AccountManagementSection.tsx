import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const AccountManagementSection: React.FC = () => {
  const { logout } = useAuth();

  return (
    <section className="bg-slate-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Gerenciamento da Conta</h2>
      <div className="space-y-4">
        <Button 
          variant="destructive"
          onClick={logout}
        >
          Sair da Conta
        </Button>
      </div>
    </section>
  );
};

export default AccountManagementSection;