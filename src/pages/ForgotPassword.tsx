import React, { useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Se o e-mail existir, você receberá instruções para redefinir sua senha.');
    } catch {
      toast.error('Erro ao solicitar recuperação de senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full p-3 mb-2 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white text-center">Recuperar senha</h2>
            <p className="text-gray-300 text-sm mt-2 text-center">
              Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-orange-400 hover:text-orange-500 font-medium"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;