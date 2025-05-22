import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAccessibility } from '@/components/Layout';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { fontSize } = useAccessibility();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full"
      style={{ fontSize: `${fontSize}px` }}
    >
      <input
        type="text"
        placeholder="Buscar no fórum..."
        className="w-full rounded-xl bg-gray-700 px-4 py-3 text-white placeholder-gray-300 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200 hover:text-orange-400 transition-all duration-300"
        aria-label="Buscar"
      >
        <Search size={20} />
      </button>
    </form>
  );
};

export default SearchBar;