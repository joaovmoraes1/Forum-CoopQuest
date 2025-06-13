import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink, ChevronRight } from 'lucide-react';
import { useAccessibility } from '@/components/Layout';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { fontSize } = useAccessibility();

  return (
    <footer
      className="w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white py-8"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="w-full  px-0 sm:px-0">
        {/* Conteúdo principal */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-0">


          {/* Logo e descrição */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/coopquest-logo.png"
                alt="CoopQuest Logo"
                className="w-12 md:w-16 h-auto"
              />
              <h2 className="text-lg md:text-xl font-bold">COOP QUEST</h2>
            </div>
            <p className="text-xs md:text-sm text-gray-300">
              Plataforma educacional inovadora para o ensino de lógica de programação através de jogos cooperativos, desenvolvida por estudantes da UEPA Castanhal.
            </p>
          </div>

          {/* Links Rápidos */}
         <div>
  <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 pb-2 border-b border-orange-500">
    Links Rápidos
  </h3>
  <ul className="space-y-2">
    {['Início', 'Jogos', 'Comunidade', 'Ajuda'].map((item) => (
      <li key={item}>
        <Link
          to={item === 'Início' ? '/' : `/${item.toLowerCase()}`}
          className="text-xs md:text-sm text-gray-300 hover:text-orange-400 transition-colors flex items-center"
        >
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-orange-500 mr-1" />
          {item}
        </Link>
      </li>
    ))}
  </ul>
</div>

          {/* Recursos */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 pb-2 border-b border-orange-500">
              Recursos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/tutoriais"
                  className="text-xs md:text-sm text-gray-300 hover:text-orange-400 transition-colors flex items-center"
                >
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-orange-500 mr-1" />
                  Tutoriais
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/joaovmoraes1/Forum-CoopQuest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs md:text-sm text-gray-300 hover:text-orange-400 transition-colors flex items-center"
                >
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-orange-500 mr-1" />
                  GitHub
                  <ExternalLink className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 pb-2 border-b border-orange-500">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mt-0.5 mr-2" />
                <a href="mailto:forumcoopquest@gmail.com" className="text-xs md:text-sm text-gray-300 hover:text-orange-400">
                  forumcoopquest@gmail.com
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mt-0.5 mr-2" />
                <span className="text-xs md:text-sm text-gray-300">(91) 98161-6403</span>
              </li>
              <li className="flex items-start">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mt-0.5 mr-2" />
                <div className="text-xs md:text-sm text-gray-300">
                  UEPA - Campus Castanhal<br />
                  Av. Universitária, s/n<br />
                  Castanhal, PA
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div className="pt-6 border-t border-gray-700">
          <p className="text-xs md:text-sm text-gray-300 text-center mb-3">
            © {currentYear} CoopQuest - Todos os direitos reservados. Desenvolvido com ❤️ pela equipe de Engenharia de Software UEPA Castanhal
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs md:text-sm text-gray-300">
            <Link to="/termos" className="hover:text-orange-400 transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-orange-400 transition-colors">
              Política de Privacidade
            </Link>
            <Link to="/cookies" className="hover:text-orange-400 transition-colors">
              Política de Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;