import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';

export interface User {
  instagramUrl: string;
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  title?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  skills?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (updatedUser: User) => void; // Adicionado
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('authToken');

      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        const response = await api.get('/auth/me');
        if (response.data.user) {
          setUser(response.data.user);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          throw new Error('Usuário inválido');
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await api.post('/auth/login', { email, password });

      if (response.data?.token && response.data?.user) {
        localStorage.setItem('authToken', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        toast.success('Login realizado com sucesso!');
        navigate('/');
        return true;
      }

      toast.error('Credenciais inválidas');
      return false;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login. Tente novamente.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await api.post('/auth/register', { name, email, password });

      if (response.data.token && response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        toast.success('Conta criada com sucesso!');
        navigate('/');
        return true;
      }

      toast.error('Erro ao criar conta');
      return false;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao criar conta. Tente novamente.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      delete api.defaults.headers.common['Authorization'];
      toast.success('Logout realizado com sucesso');
      navigate('/');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        setUser,
        updateUser, // Adicionado
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}