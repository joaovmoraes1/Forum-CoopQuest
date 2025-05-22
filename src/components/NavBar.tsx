import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/useAuth';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: 'Logout realizado com sucesso' });
    navigate('/login');
  };

  return (
    <nav
      className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg border-b border-gray-600/50 py-4 px-4 sm:px-8 flex items-center justify-between transition-all duration-300 w-full"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Seção Esquerda: Logo */}
      <div className="flex-shrink-0">
        <Link to="/" className="transform transition-transform hover:scale-105 duration-300">
          <img src="/coopquest-logo.png" alt="CoopQuest Logo" className="h-16" />
        </Link>
      </div>

      {/* Seção Central: Links de Navegação */}
      <div className="flex-1 flex justify-center">
        <div className="flex space-x-10 sm:space-x-12">
          <Link
            to="/"
            className={`flex items-center space-x-2 text-gray-200 hover:text-orange-400 font-semibold transition-colors duration-300 ${
              location.pathname === '/' ? 'text-orange-400' : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#home-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="home-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="hidden sm:block">Início</span>
          </Link>
          <Link
            to="/jogos"
            className={`flex items-center space-x-2 text-gray-200 hover:text-orange-400 font-semibold transition-colors duration-300 ${
              location.pathname === '/jogos' ? 'text-orange-400' : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#gamepad-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="gamepad-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <line x1="6" x2="10" y1="12" y2="12" />
              <line x1="8" x2="8" y1="10" y2="14" />
              <line x1="15" x2="15.01" y1="13" y2="13" />
              <line x1="18" x2="18.01" y1="11" y2="11" />
              <rect width="20" height="14" x="2" y="6" rx="2" />
            </svg>
            <span className="hidden sm:block">Jogos</span>
          </Link>
          <Link
            to="/comunidade"
            className={`flex items-center space-x-2 text-gray-200 hover:text-orange-400 font-semibold transition-colors duration-300 ${
              location.pathname === '/comunidade' ? 'text-orange-400' : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#users-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="users-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 1 1 0 7.75" />
            </svg>
            <span className="hidden sm:block">Comunidade</span>
          </Link>
          <Link
            to="/ajuda"
            className={`flex items-center space-x-2 text-gray-200 hover:text-orange-400 font-semibold transition-colors duration-300 ${
              location.pathname === '/ajuda' ? 'text-orange-400' : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#help-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="help-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <span className="hidden sm:block">Ajuda</span>
          </Link>
        </div>
      </div>

      {/* Seção Direita: Busca, Perfil e Logout */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Campo de Busca */}
        <form onSubmit={handleSearch} className="relative flex-grow md:w-72">
          <input
            type="text"
            placeholder="Buscar no fórum..."
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar no fórum"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors duration-300"
            aria-label="Buscar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
          </button>
        </form>

        {/* Botões de Perfil e Logout */}
        {isAuthenticated ? (
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              onClick={() => navigate('/perfil')}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg flex items-center space-x-2 transform transition-all hover:scale-105 duration-300 hover:shadow-xl"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Foto de perfil" className="w-6 h-6 rounded-full" />
              ) : (
                <User size={16} className="text-white" />
              )}
              <span className="hidden sm:block">{user?.name.split(' ')[0]}</span>
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg flex items-center space-x-2 transform transition-all hover:scale-105 duration-300 hover:shadow-xl"
            >
              <LogOut size={16} className="text-orange-400" />
              <span className="hidden sm:block">Sair</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link to="/login">
              <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300 hover:shadow-xl">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300 hover:shadow-xl">
                Registrar
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;