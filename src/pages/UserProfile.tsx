import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Activity, MapPin, Briefcase, Instagram, Linkedin, Star, Github } from 'lucide-react';
import { useAccessibility } from '@/components/Layout';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  lastActivity?: string;
  isOnline?: boolean;
  level?: number;
  projects?: number;
  title?: string;
  location?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  skills?: string;
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { fontSize } = useAccessibility();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      toast.error('Faça login para acessar o perfil.');
      navigate('/login');
      return;
    }

    if (!id || isNaN(Number(id))) {
      setError('ID de usuário inválido.');
      toast.error('ID de usuário inválido.');
      setIsLoading(false);
      navigate('/comunidade');
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/users/${id}`);
        setUser(response.data);
      } catch (error: any) {
        let errorMessage = 'Erro ao carregar perfil do usuário.';
        if (error.response) {
          if (error.response.status === 404) errorMessage = `Usuário com ID ${id} não encontrado.`;
          else if (error.response.status === 401) {
            errorMessage = 'Sessão expirada. Faça login novamente.';
            localStorage.removeItem('authToken');
            navigate('/login');
            return;
          } else errorMessage = error.response.data?.error || errorMessage;
        } else if (error.request) errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) fetchUser();
  }, [id, isAuthenticated, authLoading, navigate]);

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

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent px-2 sm:px-4 lg:px-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent px-2 sm:px-4 lg:px-8">
        <Card className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 p-2 sm:p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Erro</h2>
          <p className="text-gray-200 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/comunidade')}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
          >
            Voltar para Comunidade
          </Button>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent px-2 sm:px-4 lg:px-8">
        <p className="text-gray-200">Usuário não encontrado.</p>
      </div>
    );
  }

  const avatarUrl = user.avatar || '/default-avatar.png';
  const instagramUsername = extractUsername(user.instagramUrl);
  const linkedinUsername = extractUsername(user.linkedinUrl);
  const githubUsername = extractUsername(user.githubUrl);

  return (
    <div className="min-h-screen bg-transparent py-12 px-2 sm:px-4 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 sm:p-6 rounded-t-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img
                src={avatarUrl}
                alt={user.name}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-extrabold text-white">{user.name}</h1>
                <p className="text-gray-200 text-lg">{user.email}</p>
                <p className="text-sm text-gray-300">Membro desde {formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
          <div className="p-2 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.title && (
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50">
                  <Briefcase className="text-orange-400" size={24} />
                  <div>
                    <p className="text-sm text-gray-400">Título</p>
                    <p className="text-gray-200">{user.title}</p>
                  </div>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50">
                  <MapPin className="text-orange-400" size={24} />
                  <div>
                    <p className="text-sm text-gray-400">Localização</p>
                    <p className="text-gray-200">{user.location}</p>
                  </div>
                </div>
              )}
              {instagramUsername && (
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50">
                  <Instagram className="text-orange-400" size={24} />
                  <div>
                    <p className="text-sm text-gray-400">Instagram</p>
                    <a
                      href={user.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      @{instagramUsername}
                    </a>
                  </div>
                </div>
              )}
              {linkedinUsername && (
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50 transition-colors duration-300">
                    <Linkedin className="text-orange-400" size={24} />
                    <div>
                      <p className="text-sm text-gray-400">LinkedIn</p>
                      <a
                        href={user.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        @{linkedinUsername}
                      </a>
                    </div>
                  </div>
                )}
              {user.githubUrl && (
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50">
                  <Github className="text-orange-400" size={24} />
                  <div>
                    <p className="text-sm text-gray-400">GitHub</p>
                    <a
                      href={user.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      @{extractUsername(user.githubUrl) || 'Usuário não especificado'}
                    </a>
                  </div>
                </div>
              )}
              {user.skills && (
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-600/50">
                  <Star className="text-orange-400" size={24} />
                  <div>
                    <p className="text-sm text-gray-400">Habilidades</p>
                    <p className="text-gray-200">{user.skills}</p>
                  </div>
                </div>
              )}
            </div>
            {user.bio && (
              <div className="mt-6 p-4 rounded-lg bg-gray-600/30">
                <h3 className="text-white text-xl font-bold mb-2">Sobre</h3>
                <p className="text-gray-200">{user.bio}</p>
              </div>
            )}
          </div>
          <div className="border-t border-gray-600/50 p-2 sm:p-6 flex justify-end">
            <Button
              onClick={() => navigate('/comunidade')}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl"
            >
              Voltar para Comunidade
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;