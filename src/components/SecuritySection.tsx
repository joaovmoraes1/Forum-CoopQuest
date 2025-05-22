import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

const SecuritySection: React.FC = () => {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  return (
    <Card className="bg-slate-800">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          Segurança
        </h2>
        
        <div className="space-y-4">
          <Button 
            onClick={() => setIsChangePasswordModalOpen(true)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Alterar Senha
          </Button>
        </div>

        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      </div>
    </Card>
  );
};

export default SecuritySection;