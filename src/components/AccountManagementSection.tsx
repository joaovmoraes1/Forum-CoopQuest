import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AccountManagementSection: React.FC = () => {
  const { logout } = useAuth();

  return (
    <Card className="bg-slate-800">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Gerenciamento da Conta</h2>
        
        <div className="space-y-4">
          <Button 
            variant="destructive"
            onClick={logout}
            className="w-full sm:w-auto"
          >
            Sair da Conta
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AccountManagementSection;