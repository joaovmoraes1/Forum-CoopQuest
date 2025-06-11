import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/useAuth';
import { getAvatarUrl } from '@/lib/avatarUrl';


const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: 'Logout realizado com sucesso' });
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <nav
      className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg border-b border-gray-600/50 py-2 sm:py-4 px-2 sm:px-4 flex items-center justify-between transition-all duration-300 w-full relative"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex-shrink-0 min-w-0 sm:absolute sm:left-4 z-10">
        <Link to="/" className="transform transition-transform hover:scale-105 duration-300 flex items-center">
          <img
            src="/coopquest-logo.png"
            alt="CoopQuest Logo"
            className="h-8 sm:h-10 md:h-12 w-auto max-h-12 max-w-[90px] sm:max-w-[120px] object-contain"
            style={{ maxWidth: '90vw' }}
          />
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="sm:hidden absolute right-4 z-10">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-200 hover:text-orange-400 transition-colors duration-300"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Main Navigation */}
      <div
        className={`${
          isMenuOpen ? 'flex' : 'hidden'
        } sm:flex flex-col sm:flex-row sm:items-center sm:flex-1 absolute sm:static top-16 left-0 w-full sm:w-auto bg-gray-900 sm:bg-transparent p-2 sm:p-0 transition-all duration-300 z-40`}
      >
        {/* Links - Centralizados apenas no desktop */}
        <div className="flex flex-col sm:flex-row sm:justify-center space-y-2 sm:space-y-0 sm:space-x-10 w-full sm:w-auto sm:mx-auto">
          <Link
            to="/"
            className={`flex items-center space-x-2 text-gray-200 hover:text-orange-400 font-semibold transition-colors duration-300 py-2 sm:py-0 ${
              location.pathname === '/' ? 'text-orange-400' : ''
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span>Início</span>
          </Link>
          <Link
            to="/jogos"
            className={`flex items-center space-x-2 text-gray-200 hover:text-orange-400 font-semibold transition-colors duration-300 py-2 sm:py-0 ${
              location.pathname === '/jogos' ? 'text-orange-400' : ''
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span>Jogos</span>
          </Link>
          <Link
            to="/comunidade"
            className={`flex items-center space-x-2 text-gray-200 hover:text-orange-400 font-semibold transition-colors duration-300 py-2 sm:py-0 ${
              location.pathname === '/comunidade' ? 'text-orange-400' : ''
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span>Comunidade</span>
          </Link>
          <Link
            to="/ajuda"
            className={`flex items-center space-x-2 text-gray-200 hover:text-orange-400 font-semibold transition-colors duration-300 py-2 sm:py-0 ${
              location.pathname === '/ajuda' ? 'text-orange-400' : ''
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span>Ajuda</span>
          </Link>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 lg:space-x-4 mt-2 sm:mt-0 w-full sm:w-auto">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative w-full sm:w-48 lg:w-72 mb-2 sm:mb-0">
            <input
              type="text"
              placeholder="Buscar no fórum..."
              className="w-full px-2 sm:px-4 py-1 sm:py-2 bg-gray-700 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 text-sm sm:text-base"
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
                className="w-4 h-4 sm:w-5 sm:h-5"
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

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-4 w-full sm:w-auto">
              <Button
                onClick={() => {
                  navigate('/perfil');
                  setIsMenuOpen(false);
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-1 sm:py-2 px-2 sm:px-4 rounded-xl shadow-lg flex items-center space-x-2 transform transition-all hover:scale-105 duration-300 hover:shadow-xl text-sm sm:text-base"
              >
                {user?.avatar ? (
                  <img  src={getAvatarUrl(user?.avatar)} alt="Foto de perfil" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full" />
                ) : (
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
                <span>{user?.name.split(' ')[0]}</span>
              </Button>
              <Button
                onClick={handleLogout}
                className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 sm:py-2 px-2 sm:px-4 rounded-xl shadow-lg flex items-center space-x-2 transform transition-all hover:scale-105 duration-300 hover:shadow-xl text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span>Sair</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-4 w-full sm:w-auto">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-1 sm:py-2 px-2 sm:px-4 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300 hover:shadow-xl text-sm sm:text-base">
                  Entrar
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 sm:py-2 px-2 sm:px-4 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300 hover:shadow-xl text-sm sm:text-base">
                  Registrar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;