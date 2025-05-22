import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Mail, Phone, MapPin, ExternalLink, ChevronRight } from 'lucide-react';
import { useAccessibility } from '@/components/Layout';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { fontSize } = useAccessibility();

  return (
    <footer
      className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <img src="/coopquest-logo.png" alt="CoopQuest Logo" className="h-16 w-17 mr-0" />
              <h3 className="text-xl font-bold text-white">CoopQuest</h3>
            </div>
            <p className="text-gray-200 leading-relaxed">
              Plataforma educacional inovadora para o ensino de lógica de programação através de jogos cooperativos, 
              desenvolvida por estudantes da UEPA Castanhal.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://www.instagram.com/_jmoraexx/"
                aria-label="Instagram"
                className="text-gray-200 hover:text-orange-400 transition-colors duration-300"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/jo%C3%A3omoraes/"
                aria-label="LinkedIn"
                className="text-gray-200 hover:text-orange-400 transition-colors duration-300"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white relative after:content-[''] after:absolute after:w-12 after:h-1 after:bg-orange-500 after:-bottom-2 after:left-0">
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              <li className="group">
                <Link
                  to="/"
                  className="text-gray-200 hover:text-orange-400 transition-colors duration-300 flex items-center"
                >
                  <ChevronRight size={16} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                  <span>Início</span>
                </Link>
              </li>
              <li className="group">
                <Link
                  to="/jogos"
                  className="text-gray-200 hover:text-orange-400 transition-colors duration-300 flex items-center"
                >
                  <ChevronRight size={16} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                  <span>Jogos</span>
                </Link>
              </li>
              <li className="group">
                <Link
                  to="/comunidade"
                  className="text-gray-200 hover:text-orange-400 transition-colors duration-300 flex items-center"
                >
                  <ChevronRight size={16} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                  <span>Comunidade</span>
                </Link>
              </li>
              <li className="group">
                <Link
                  to="/ajuda"
                  className="text-gray-200 hover:text-orange-400 transition-colors duration-300 flex items-center"
                >
                  <ChevronRight size={16} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                  <span>Ajuda</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white relative after:content-[''] after:absolute after:w-12 after:h-1 after:bg-orange-500 after:-bottom-2 after:left-0">
              Recursos
            </h3>
            <ul className="space-y-2">
              <li className="group">
                <Link
                  to="/tutoriais"
                  className="text-gray-200 hover:text-orange-400 transition-colors duration-300 flex items-center"
                >
                  <ChevronRight size={16} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                  <span>Tutoriais</span>
                </Link>
              </li>
              <li className="group">
                <a
                  href="https://github.com/joaovmoraes1/Forum-CoopQuest"
                  className="text-gray-200 hover:text-orange-400 transition-colors duration-300 flex items-center"
                >
                  <ChevronRight size={16} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                  <span>GitHub</span>
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white relative after:content-[''] after:absolute after:w-12 after:h-1 after:bg-orange-500 after:-bottom-2 after:left-0">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail size={18} className="text-orange-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Email:</p>
                  <a

                  >
                  forumcoopquest@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <Phone size={18} className="text-orange-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Telefone:</p>
                  <a
                    href="tel:+5591984791271"
                    className="text-gray-200 hover:text-orange-400 transition-colors duration-300"
                  >
                    (91) 98765-4321
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <MapPin size={18} className="text-orange-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Endereço:</p>
                  <p className="text-gray-200">
                    UEPA - Campus Castanhal<br />
                    Av. Universitária, s/n<br />
                    Castanhal, PA
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-600/50 text-center">
          <p className="text-gray-200">
            © {currentYear} CoopQuest - Todos os direitos reservados. Desenvolvido com ❤️ pela equipe de Engenharia de Software UEPA Castanhal
          </p>
          <div className="mt-4 text-sm text-gray-200 flex justify-center space-x-4">
            <Link to="/termos" className="hover:text-orange-400 transition-colors duration-300">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-orange-400 transition-colors duration-300">
              Política de Privacidade
            </Link>
            <Link to="/cookies" className="hover:text-orange-400 transition-colors duration-300">
              Política de Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;