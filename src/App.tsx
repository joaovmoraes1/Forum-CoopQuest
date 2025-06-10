import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeAccessibilityProvider } from './contexts/ThemeAccessibilityContext';
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';

// Lazy loading para todas as páginas
const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Jogos = lazy(() => import('./pages/Jogos'));
const Comunidade = lazy(() => import('./pages/Comunidade'));
const Ajuda = lazy(() => import('./pages/Ajuda'));
const Topico = lazy(() => import('./pages/Topico'));
const NotFound = lazy(() => import('./pages/NotFound'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Profile = lazy(() => import('./pages/Profile'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const DailyChallengeDisplay = lazy(() => import('./pages/DailyChallengeDisplay'));
const Settings = lazy(() => import('./pages/Settings'));
const SearchBar = lazy(() => import('./pages/SearchBar'));
const SupportForum = lazy(() => import('./pages/SupportForum'));
const TopicsPage = lazy(() => import('./pages/TopicsPage'));
const Tutorials = lazy(() => import('./pages/Tutorials'));
const TutorialPage = lazy(() => import('./pages/TutorialPage'));
const Support = lazy(() => import('./pages/Support'));
const Videos = lazy(() => import('./pages/Videos'));
const Lobby = lazy(() => import('./pages/jogos/Lobby'));
const GameRoom = lazy(() => import('./pages/jogos/GameRoom'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword')); 

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeAccessibilityProvider>
          <TooltipProvider>
            <Toaster position="top-right" richColors closeButton />
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/ajuda" element={<Ajuda />} />
                  <Route path="/topics" element={<TopicsPage />} />
                  <Route path="/tutoriais" element={<Tutorials />} />
                  <Route path="/tutoriais/:slug" element={<TutorialPage />} />
                  <Route path="/suporte" element={<Support />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/esqueci-senha" element={<ForgotPassword />} />
                  <Route path="/redefinir-senha" element={<ResetPassword />} />
                  <Route path="/jogos" element={<ProtectedRoute><Jogos /></ProtectedRoute>} />
                  <Route path="/comunidade" element={<ProtectedRoute><Comunidade /></ProtectedRoute>} />
                  <Route path="/support-forum" element={<ProtectedRoute><SupportForum /></ProtectedRoute>} />
                  <Route path="/topico/:id" element={<ProtectedRoute><Topico /></ProtectedRoute>} />
                  <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
                  <Route path="/search-bar" element={<ProtectedRoute><SearchBar /></ProtectedRoute>} />
                  <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/perfil/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  <Route path="/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallengeDisplay /></ProtectedRoute>} />
                  <Route path="/lobby" element={<Lobby />} />
                  <Route path="/game/:roomCode" element={<GameRoom />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </TooltipProvider>
        </ThemeAccessibilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;