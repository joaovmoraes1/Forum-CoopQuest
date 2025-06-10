import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { deleteAccount } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!user) {
      toast.error('Usuário não encontrado.');
      return;
    }

    if (confirmation !== 'EXCLUIR') {
      toast.error('Digite "EXCLUIR" para confirmar.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(user.id);
      toast.success('Conta excluída com sucesso!', {
        duration: 5000,
        className: 'success-toast',
      });
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Erro ao excluir conta. Por favor, tente novamente.', {
        duration: 5000,
        className: 'error-toast',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto bg-slate-900 text-white border-orange-500 p-2 sm:p-6">
        <DialogHeader className="grid grid-cols-1 gap-2 sm:gap-4">
          <div className="bg-red-500 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-12 sm:h-12 mx-auto flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-center text-red-500">
            Excluir Conta
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-sm sm:text-base">
            <p className="mb-2 sm:mb-4">
              Esta ação <span className="font-bold text-red-400">não pode ser desfeita</span>. Você perderá
              permanentemente:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-2 sm:mb-4">
              <li>Seu perfil e informações pessoais</li>
              <li>Todo seu progresso nos jogos</li>
              <li>Participações em fóruns e comunidades</li>
            </ul>
            <p>
              Digite <span className="font-bold text-orange-400">EXCLUIR</span> para confirmar:
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2 sm:pt-4">
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full p-2 sm:p-3 border border-slate-700 bg-slate-800 rounded text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Digite EXCLUIR"
          />
        </div>

        <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-2 sm:pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white p-2 sm:p-3"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmation !== 'EXCLUIR'}
            className={`w-full bg-red-600 hover:bg-red-700 text-white p-2 sm:p-3 ${
              confirmation !== 'EXCLUIR' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Excluindo...
              </span>
            ) : (
              'Excluir permanentemente'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;