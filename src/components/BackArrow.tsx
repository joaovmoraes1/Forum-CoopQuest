import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BackArrowProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const BackArrow: React.FC<BackArrowProps> = ({ to, children, className }) => (
  <Link
    to={to}
    className={`group inline-flex items-center font-medium transition-colors duration-300 text-orange-400 hover:text-orange-500 ${className || ''}`}
  >
    <ArrowLeft
      className="mr-2 transition-transform duration-200 group-hover:-translate-x-1
        h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
      strokeWidth={2.5}
    />
    <span className="text-base sm:text-lg">{children}</span>
  </Link>
);

export default BackArrow;