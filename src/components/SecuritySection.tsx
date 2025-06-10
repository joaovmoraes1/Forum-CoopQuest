import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

const SecuritySection: React.FC = () => {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  return (
    <Card className="w-full max-w-md sm:max-w-lg mx-auto bg-slate-800 p-2 sm:p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 gap-2 sm:gap-4">
        <h2 className="text-base sm:text-xl font-bold text-white mb-2 sm:mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          Segurança
        </h2>
        <Button 
          onClick={() => setIsChangePasswordModalOpen(true)}
          variant="outline"
          className="w-full sm:w-auto text-xs sm:text-sm p-2 sm:p-3 bg-gray-700 hover:bg-gray-600 border-gray-600 text-white rounded-lg"
        >
          Alterar Senha
        </Button>
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      </div>
    </Card>
  );
};

export default SecuritySection;