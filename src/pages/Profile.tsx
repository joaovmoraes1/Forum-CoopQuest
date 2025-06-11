import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Calendar, Activity, Edit, LogOut, Upload, MapPin, Briefcase, Instagram, Linkedin, Star, Github } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EditProfileModal from '@/components/EditProfileModal';
import { updateProfile } from '@/services/authService';
import { toast } from 'sonner';
import { useAccessibility } from '@/components/Layout';
import api from '@/services/api';
import { getAvatarUrl } from '@/lib/avatarUrl';


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

  // Adicione esta linha:
  const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) return;
        const response = await api.get(`/users/${user.id}`);
        setUser(response.data);
        setProfileImage(response.data.avatar || null);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id, setUser]);

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeInBytes) {
      toast.error('A imagem deve ter menos de 10 MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Apenas imagens JPEG, PNG ou GIF são permitidas.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post(`/users/${user.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data?.avatar) {
        setUser({ ...user, avatar: response.data.avatar });
        setProfileImage(response.data.avatar);
        toast.success('Imagem de perfil atualizada com sucesso!');
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar imagem de perfil:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao atualizar imagem de perfil. Tente novamente.');
      setProfileImage(user.avatar || null);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const extractUsername = (url?: string) => {
    if (!url) return null;
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment);
      if (parsedUrl.hostname.includes('linkedin.com')) {
        const inIndex = pathSegments.indexOf('in');
        return inIndex !== -1 && inIndex + 1 < pathSegments.length ? pathSegments[inIndex + 1] : null;
      }
      return pathSegments[0] || null;
    } catch {
      return null;
    }
  };

  if (isLoading || !user) {
    return (
      <div
        className="flex justify-center items-center min-h-screen bg-transparent"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  const instagramUsername = extractUsername(user.instagramUrl);
  const linkedinUsername = extractUsername(user.linkedinUrl);
  const githubUsername = extractUsername(user.githubUrl);

  return (
    <div
      className="min-h-screen bg-transparent py-8 px-2 sm:px-4 md:px-6 lg:px-8 w-full"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="w-full max-w-4xl mx-auto">
        <Card
          className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500"
        >
          <div
            className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 sm:p-4 md:p-6 lg:p-8 rounded-t-2xl"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8">
              <div className="relative">
              <img
                  src={getAvatarUrl(profileImage ?? undefined)}
                  alt={user.name}
                  className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105"
                />
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 cursor-pointer transform transition-all hover:scale-110 duration-300 shadow-md"
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
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">{user.name}</h1>
                <p className="text-gray-200 text-base sm:text-lg md:text-xl mt-1">{user.email}</p>
                <p className="text-sm text-gray-300">Membro desde {formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="p-2 sm:p-4 md:p-6 lg:p-8">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="bg-gray-700/50 rounded-xl p-1 mb-4 sm:mb-6">
                <TabsTrigger
                  value="info"
                  className="text-gray-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg px-3 py-2 sm:px-4 sm:py-2 transition-all duration-300"
                >
                  Informações
                </TabsTrigger>
                <TabsTrigger
                  value="activities"
                  className="text-gray-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg px-3 py-2 sm:px-4 sm:py-2 transition-all duration-300"
                >
                  Atividades
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  <div className="flex items-center gap-3 p-2 sm:p-3 md:p-4 rounded-lg hover:bg-gray-600/50 transition-colors duration-300">
                    <UserCircle className="text-orange-400" size={24} />
                    <div>
                      <p className="text-sm text-gray-400">Nome</p>
                      <p className="text-gray-200">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 sm:p-3 md:p-4 rounded-lg hover:bg-gray-600/50 transition-colors duration-300">
                    <Calendar className="text-orange-400" size={24} />
                    <div>
                      <p className="text-sm text-gray-400">Membro desde</p>
                      <p className="text-gray-200">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                  {user.title && (
                    <div className="flex items-center gap-3 p-2 sm:p-3 md:p-4 rounded-lg hover:bg-gray-600/50 transition-colors duration-300">
                      <Briefcase className="text-orange-400" size={24} />
                      <div>
                        <p className="text-sm text-gray-400">Profissão</p>
                        <p className="text-gray-200">{user.title}</p>
                      </div>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-3 p-2 sm:p-3 md:p-4 rounded-lg hover:bg-gray-600/50 transition-colors duration-300">
                      <MapPin className="text-orange-400" size={24} />
                      <div>
                        <p className="text-sm text-gray-400">Localização</p>
                        <p className="text-gray-200">{user.location}</p>
                      </div>
                    </div>
                  )}
                {instagramUsername && (
                    <div className="flex items-center gap-3 p-2 sm:p-3 md:p-4 rounded-lg hover:bg-gray-600/50 transition-colors duration-300">
                      <a
                        href={user.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:underline"
                        aria-label={`Perfil do Instagram de ${instagramUsername}`}
                      >
                        <Instagram className="text-orange-400" size={24} />
                        <span>@{instagramUsername}</span>
                      </a>
                    </div>
                  )}
                  {linkedinUsername && (
                    <div className="flex items-center gap-3 p-2 sm:p-3 md:p-4 rounded-lg hover:bg-gray-600/50 transition-colors duration-300">
                      <a
                        href={user.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:underline"
                        aria-label={`Perfil do LinkedIn de ${linkedinUsername}`}
                      >
                        <Linkedin className="text-orange-400" size={24} />
                        <span>@{linkedinUsername}</span>
                      </a>
                    </div>
                  )}
                  {githubUsername && (
                    <div className="flex items-center gap-3 p-2 sm:p-3 md:p-4 rounded-lg hover:bg-gray-600/50 transition-colors duration-300">
                      <a
                        href={user.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:underline"
                        aria-label={`Perfil do GitHub de ${githubUsername}`}
                      >
                        <Github className="text-orange-400" size={24} />
                        <span>@{githubUsername}</span>
                      </a>
                    </div>
                  )}
                  {user.skills && (
                    <div className="flex items-center gap-3 p-2 sm:p-3 md:p-4 rounded-lg hover:bg-gray-600/50 transition-colors duration-300">
                      <Star className="text-orange-400" size={24} />
                      <div>
                        <p className="text-sm text-gray-400">Habilidades</p>
                        <p className="text-gray-200">{user.skills}</p>
                      </div>
                    </div>
                  )}
                </div>
                {user.bio && (
                  <div className="mt-4 sm:mt-6 p-2 sm:p-4 md:p-6 rounded-lg bg-gray-600/30">
                    <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-2">Sobre</h3>
                    <p className="text-gray-200 leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-2 sm:p-4 md:p-6 rounded-xl border border-gray-600/50 hover:bg-gray-600/50 transition-colors duration-300"
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

          <div className="border-t border-gray-600/50 p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col sm:flex-row justify-center sm:justify-end gap-2 sm:gap-4">
            <Button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
            <Button
              onClick={() => navigate('/configuracoes')}
              className="bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700 hover:text-white rounded-xl py-2 sm:py-3 px-4 sm:px-6 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              Configurações
            </Button>
            <Button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
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
        onProfileUpdated={(updatedUser) =>
          setUser({ 
            ...user, 
            ...updatedUser, 
            createdAt: updatedUser.createdAt || user.createdAt,
            skills: Array.isArray(updatedUser.skills)
              ? updatedUser.skills.join(', ')
              : updatedUser.skills
          })
        }
      />
    </div>
  );
}