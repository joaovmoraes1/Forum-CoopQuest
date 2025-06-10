import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AccountManagementSection: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-lg mx-auto bg-slate-800 p-6 mt-6">
      <div className="p-6">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Gerenciamento da Conta</h2>
        
        <div className="grid grid-cols-1 gap-6">
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full max-w-md mx-auto p-3 text-white border-white"
          >
            Voltar
          </Button>
          <Button 
            variant="destructive"
            onClick={logout}
            className="w-full max-w-md mx-auto p-3 mt-4"
          >
            Sair da Conta
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AccountManagementSection;