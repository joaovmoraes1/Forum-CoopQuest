import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, VideoIcon } from 'lucide-react';
import { useAccessibility } from '@/components/Layout';
import { Link } from 'react-router-dom';
import BackArrow from '@/components/BackArrow';

const Videos = () => {
  const { fontSize } = useAccessibility();
  const videoItems = [
    {
      title: 'Introdução à Lógica de Programação',
      description: 'Aprenda os conceitos básicos de lógica de programação e como pensar como um programador.',
      embedUrl: 'https://www.youtube.com/embed/gMxQ8vxH9Vk',
    },
    {
      title: 'Estruturas Condicionais: If, Else e Switch',
      description: 'Entenda como usar estruturas condicionais para tomar decisões no seu código.',
      embedUrl: 'https://www.youtube.com/embed/dd6AbL-hAnE',
    },
  ];

  return (
    <main
      className="flex-grow bg-transparent min-h-screen w-full px-2 sm:px-4 lg:px-8"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="mb-4 mt-4 sm:mt-8">
        <BackArrow to="/ajuda">Voltar para Ajuda</BackArrow>
      </div>
      <Card
        className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 mb-8 w-full max-w-full mx-auto"
      >
        <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 sm:p-6 rounded-t-2xl text-center">
          <CardTitle className="text-4xl font-extrabold text-white">
            Vídeos
          </CardTitle>
          <p className="text-gray-200 text-lg mt-2 w-full max-w-xl mx-auto">
            Assista a tutoriais em vídeo sobre lógica de programação para aprimorar suas habilidades.
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-full mx-auto px-2 sm:px-4 lg:px-8">
        {videoItems.map((video, index) => (
          <Card
            key={index}
            className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 w-full"
          >
            <CardHeader className="p-2 sm:p-6">
              <div className="flex items-center gap-3">
                <VideoIcon className="h-6 w-6 text-orange-400" />
                <CardTitle className="text-xl font-bold text-white">
                  {video.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 space-y-4">
              <p className="text-gray-200">{video.description}</p>
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={video.embedUrl}
                  className="absolute top-0 left-0 h-[80%] sm:h-[90%] w-[80%] sm:w-[90%] rounded-xl mx-auto"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <a
                href={video.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-orange-400 hover:text-orange-500 inline-flex items-center font-medium"
              >
                Assistir no YouTube <ArrowRight className="ml-4 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card
        className="mt-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 w-full max-w-full mx-auto"
      >
        <CardContent className="p-2 sm:p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Precisa de mais ajuda?
          </h2>
          <p className="text-gray-200 w-full max-w-2xl mx-auto">
            Se os vídeos não resolveram sua dúvida, entre em contato com nossa equipe de suporte.
          </p>
          <Link
            to="/suporte"
            className="group bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300 inline-flex items-center"
          >
            Contatar Suporte <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </CardContent>
      </Card>
    </main>
  );
};

export default Videos;