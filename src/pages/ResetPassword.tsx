import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      toast.success('Senha redefinida com sucesso!');
      navigate('/login');
    } catch {
      toast.error('Erro ao redefinir senha.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-orange-400 to-yellow-300">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Token inválido</h2>
          <p className="text-gray-700">O link de redefinição de senha é inválido ou expirou.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-orange-400 to-yellow-300">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <img src="/coopquest-logo.png" alt="Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-3xl font-extrabold text-orange-600 mb-1">Redefinir Senha</h1>
          <p className="text-gray-600 text-base">Crie uma nova senha forte para sua conta.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-left text-gray-700 font-semibold mb-2" htmlFor="newPassword">
              Nova Senha
            </label>
            <input
              id="newPassword"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-lg transition"
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={6}
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-lg shadow transition disabled:opacity-60"
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>
        <div className="mt-8 text-center text-gray-500 text-sm">
          Lembre-se de nunca compartilhar sua senha com ninguém.
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;