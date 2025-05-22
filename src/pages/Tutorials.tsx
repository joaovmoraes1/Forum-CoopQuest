import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAccessibility } from '@/components/Layout';
import { Link } from 'react-router-dom';
import { Tutorial } from '@/services/topics';

// Define a interface Tutorial (caso não esteja definida em topics.ts, mas já foi importada acima)


const fetchTutorials = async (): Promise<Tutorial[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/tutorials`);
  if (!response.ok) {
    throw new Error('Erro ao carregar tutoriais');
  }
  return response.json();
};

const Tutorials = () => {
  const { data: tutorials, isLoading, error } = useQuery({
    queryKey: ['tutorials'],
    queryFn: fetchTutorials,
  });
  const { fontSize } = useAccessibility();

  if (error) {
    toast.error('Erro ao carregar tutoriais');
  }

  return (
    <main
      className="flex-grow bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen w-full"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="mb-8 text-center pt-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 mb-4">
          Tutoriais
        </h1>
        <p className="text-gray-200 text-lg">
          Explore nossos guias passo a passo para dominar o CoopQuest e aproveitar ao máximo a plataforma.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-200 mt-4">Carregando tutoriais...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
          {tutorials?.map((tutorial: Tutorial, index: number) => (
            <Card
              key={index}
              className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 w-full"
            >
              <CardHeader className="p-6">
                <div className="flex items-center gap-4">
                  {tutorial.icon === 'HelpCircle' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
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
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="url(#calendar-grad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <defs>
                        <linearGradient id="calendar-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#eab308', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  )}
                  <CardTitle className="text-xl font-bold text-white">
                    {tutorial.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-gray-200">{tutorial.description}</p>
                <Link
                  to={tutorial.link}
                  className="text-orange-400 hover:text-orange-500 inline-flex items-center font-medium transition-colors duration-300"
                >
                  Ler tutorial <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card
        className="mt-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 w-full mx-4"
      >
        <CardContent className="p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Precisa de mais ajuda?
          </h2>
          <p className="text-gray-200">
            Se os tutoriais não resolveram sua dúvida, entre em contato com nossa equipe de suporte.
          </p>
          <Link
            to="/suporte"
            className="inline-flex items-center bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
          >
            Contatar Suporte <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </main>
  );
};

export default Tutorials;