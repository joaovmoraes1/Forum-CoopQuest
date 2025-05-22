import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth, User } from '@/contexts/AuthContext'; // Importa o tipo User correto
import { updateProfile } from '@/services/authService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle, Mail, User as UserIcon } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User; // Usa o tipo User do AuthContext
  onProfileUpdated?: (updatedUser: User) => void; // Usa o tipo User do AuthContext
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  }, [user, isOpen]);

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: '', email: '', bio: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await updateProfile(user.id, {
        name: formData.name,
        email: formData.email,
        bio: formData.bio || undefined,
        avatar: user.avatar || undefined, // Preserve the existing avatar
      });

      if (response?.data) {
        const updatedUser = response.data as User; // Tipa explicitamente como User do AuthContext
        // Verifica se createdAt está presente (deve estar, pois o backend retorna)
        if (!updatedUser.createdAt) {
          throw new Error('Resposta do servidor não inclui createdAt');
        }
        setUser(updatedUser);
        if (onProfileUpdated) {
          onProfileUpdated(updatedUser);
        }
        toast.success('Perfil atualizado com sucesso!', {
          duration: 3000,
          className: 'success-toast',
        });
        onClose();
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar perfil. Verifique seus dados e tente novamente.';
      toast.error(errorMessage, {
        duration: 5000,
        className: 'error-toast',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 text-white border-orange-500">
        <DialogHeader>
          <div className="bg-orange-500 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
            <UserCircle className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-center text-orange-400">
            Editar Perfil
          </DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            Atualize suas informações pessoais abaixo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
              <UserIcon size={16} className="text-orange-400" />
              Nome
            </Label>
            <div className="relative">
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent pl-3"
                placeholder="Seu nome completo"
              />
            </div>
            {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
              <Mail size={16} className="text-orange-400" />
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent pl-3"
                placeholder="seu.email@exemplo.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-slate-300 flex items-center gap-2">
              <UserIcon size={16} className="text-orange-400" />
              Bio
            </Label>
            <div className="relative">
              <Input
                id="bio"
                name="bio"
                type="text"
                value={formData.bio}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent pl-3"
                placeholder="Fale sobre você"
              />
            </div>
            {errors.bio && <p className="text-red-400 text-sm">{errors.bio}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Salvando...
                </span>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;