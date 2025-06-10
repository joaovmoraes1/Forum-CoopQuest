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
      className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto"
      style={{ fontSize: `${fontSize}px` }}
    >
      <input
        type="text"
        className="w-full px-3 sm:px-4 lg:px-8 py-2 rounded-full bg-gray-600/50 border border-gray-200 focus:border-gray-400 transition-colors text-white"
        placeholder="Search the forum..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <button
        type="submit"
        className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 text-gray-400 hover:text-gray-600"
        aria-label="Search"
      >
        <Search size={20} />
      </button>
    </form>
  );
};

export default SearchBar;