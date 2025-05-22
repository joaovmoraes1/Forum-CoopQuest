import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Calendar, Activity, Edit, LogOut, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EditProfileModal from '@/components/EditProfileModal';
import { updateProfile } from '@/services/authService';
import { toast } from 'sonner';
import { useAccessibility } from '@/components/Layout';

interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
}

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { fontSize } = useAccessibility();
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const activities = [
          { id: '1', type: 'login', description: 'Login efetuado', date: new Date().toISOString() },
          { id: '2', type: 'update', description: 'Perfil atualizado', date: new Date().toISOString() },
        ];
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, []);

  useEffect(() => {
    setProfileImage(user?.avatar || null);
  }, [user]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validação do tamanho do arquivo (limite de 10 MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeInBytes) {
      toast.error('A imagem deve ter menos de 10 MB.', {
        duration: 5000,
        className: 'error-toast',
      });
      return;
    }

    // Validação do tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Apenas imagens JPEG, PNG ou GIF são permitidas.', {
        duration: 5000,
        className: 'error-toast',
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        if (reader.result) {
          const newAvatarUrl = reader.result as string;
          const response = await updateProfile(user.id, {
            name: user.name,
            email: user.email,
            bio: user.bio || undefined,
            avatar: newAvatarUrl,
          });

          if (response?.data) {
            const updatedUser = response.data as typeof user;
            if (!updatedUser.createdAt) {
              throw new Error('Resposta do servidor não inclui createdAt');
            }
            setUser(updatedUser); // Atualiza o estado global
            setProfileImage(updatedUser.avatar || null); // Atualiza o estado local
            toast.success('Imagem de perfil atualizada com sucesso!', {
              duration: 3000,
              className: 'success-toast',
            });
          } else {
            throw new Error('Resposta inválida do servidor');
          }
        }
      };
      reader.onerror = () => {
        throw new Error('Erro ao ler o arquivo de imagem');
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Erro ao atualizar imagem de perfil:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar imagem de perfil. Tente novamente.';
      toast.error(errorMessage, {
        duration: 5000,
        className: 'error-toast',
      });
      setProfileImage(user.avatar || null);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="container mx-auto">
        <Card
          className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500"
        >
          {/* Profile Header */}
          <div
            className="bg-gradient-to-r from-orange-500 to-yellow-500 p-8 rounded-t-2xl"
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={profileImage || "/default-avatar.png"}
                  alt={user.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm"
                />
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 cursor-pointer transform transition-all hover:scale-110 duration-300"
                >
                  {isUploading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <Upload className="w-5 h-5 text-gray-600" />
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  {user.name}
                </h1>
                <p className="text-gray-200 text-lg">{user.email}</p>
                <p className="text-sm text-gray-300">
                  Membro desde {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="p-8">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="bg-gray-700/50 rounded-xl p-1">
                <TabsTrigger
                  value="info"
                  className="text-gray-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg px-4 py-2"
                >
                  Informações
                </TabsTrigger>
                <TabsTrigger
                  value="activities"
                  className="text-gray-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg px-4 py-2"
                >
                  Atividades
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <UserCircle className="text-orange-400" size={24} />
                  <span className="text-gray-200">{user.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-orange-400" size={24} />
                  <span className="text-gray-200">{formatDate(user.createdAt)}</span>
                </div>
                {user.bio && (
                  <div className="mt-4">
                    <h3 className="text-white text-xl font-bold mb-2">Sobre</h3>
                    <p className="text-gray-200">{user.bio}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activities" className="mt-6 space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-xl border border-gray-600/50"
                  >
                    <Activity className="text-orange-400" size={24} />
                    <div>
                      <p className="text-gray-200">{activity.description}</p>
                      <p className="text-sm text-gray-300">{formatDate(activity.date)}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-600/50 p-8 flex gap-4">
            <Button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
            <Button
              onClick={() => navigate('/configuracoes')}
              className="bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700 hover:text-white rounded-xl py-3 px-4 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              Configurações
            </Button>
            <Button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </Card>
      </div>

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        user={user}
        onProfileUpdated={(updatedUser) => setUser(updatedUser)}
      />
    </div>
  );
}