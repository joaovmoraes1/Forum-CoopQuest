import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAccessibility } from '@/components/Layout';

const Register = () => {
  const { fontSize } = useAccessibility();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Preencha todos os campos obrigatórios.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Digite um e-mail válido.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const success = await register(formData.name, formData.email, formData.password);
      if (success) {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        toast.success('Conta criada com sucesso! Faça login para continuar.');
      } else {
        setError('Não foi possível criar sua conta. O e-mail pode já estar em uso.');
      }
    } catch (err) {
      console.error('Erro ao registrar:', err);
      setError('Ocorreu um erro ao criar sua conta. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4"
      style={{ fontSize: `${fontSize}px` }}
    >
      <Card
        className="max-w-md w-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500"
      >
        <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 rounded-t-2xl">
          <CardTitle className="text-3xl font-extrabold text-white text-center">
            Registrar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-xl text-white text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                Nome completo
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-gray-700 text-white border-gray-600 rounded-xl mt-1"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-gray-700 text-white border-gray-600 rounded-xl mt-1"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="bg-gray-700 text-white border-gray-600 rounded-xl mt-1"
              />
              <p className="text-xs text-gray-300 mt-1">Mínimo de 6 caracteres</p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
                Confirmar senha
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-gray-700 text-white border-gray-600 rounded-xl mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Criar conta'}
            </Button>
          </form>
          <div className="text-center mt-6">
            <p className="text-gray-200">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-orange-400 hover:text-orange-500 font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;