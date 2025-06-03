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

  if (!token) return <div>Token inválido.</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="Nova senha"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
      </button>
    </form>
  );
};

export default ResetPassword;