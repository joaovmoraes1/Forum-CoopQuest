import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Activity } from 'lucide-react';
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
        console.log('Dados do usuário recebidos:', response.data);
        setUser(response.data);
      } catch (error: any) {
        console.error('Erro ao buscar usuário:', error);
        let errorMessage = 'Erro ao carregar perfil do usuário.';
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = `Usuário com ID ${id} não encontrado.`;
          } else if (error.response.status === 401) {
            errorMessage = 'Sessão expirada. Faça login novamente.';
            localStorage.removeItem('authToken');
            navigate('/login');
            return;
          } else {
            errorMessage = error.response.data?.error || errorMessage;
          }
        } else if (error.request) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUser();
    }
  }, [id, isAuthenticated, authLoading, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (authLoading || isLoading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800"
        style={{ fontSize: `${fontSize}px` }}
      >
        <Card className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 p-8">
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
      <div
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800"
        style={{ fontSize: `${fontSize}px` }}
      >
        <p className="text-gray-200">Usuário não encontrado.</p>
      </div>
    );
  }

  // Construção correta da URL do avatar
  const avatarUrl = user.avatar && user.avatar.startsWith('data:image/')
    ? user.avatar
    : user.avatar
    ? `http://localhost:3000/${user.avatar}` // Usando a porta correta do backend
    : 'http://localhost:3000/default-avatar.png'; // Fallback para o avatar padrão

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="container mx-auto">
        <Card className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-8 rounded-t-2xl">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm"
                  onError={(e) => {
                    console.log(`Erro ao carregar avatar do usuário ${user.name} (URL: ${avatarUrl}):`, e);
                    e.currentTarget.src = 'https://via.placeholder.com/150';
                  }}
                />
                <span
                  className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 border-white ${
                    user.isOnline ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                ></span>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{user.name}</h1>
                <p className="text-gray-200 text-lg">{user.email}</p>
                <p className="text-sm text-gray-300">Membro desde {formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-orange-400" size={24} />
              <span className="text-gray-200">Membro desde {formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="text-orange-400" size={24} />
              <span className="text-gray-200">
                Última atividade: {user.lastActivity ? formatDate(user.lastActivity) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="text-orange-400" size={24} />
              <span className="text-gray-200">Nível: {user.level || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="text-orange-400" size={24} />
              <span className="text-gray-200">Projetos: {user.projects || 0}</span>
            </div>
            {user.bio && (
              <div className="mt-4">
                <h3 className="text-white text-xl font-bold mb-2">Sobre</h3>
                <p className="text-gray-200">{user.bio}</p>
              </div>
            )}
          </div>
          <div className="border-t border-gray-600/50 p-8 flex gap-4">
            <Button
              onClick={() => navigate('/comunidade')}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
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