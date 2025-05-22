import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';
import { useAccessibility } from '@/components/Layout';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const Support = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { fontSize } = useAccessibility();
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || 'João Moraes',
    email: user?.email || 'forumcoopquest@gmail.com',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportUserId, setSupportUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSupportUserId = async () => {
      try {
        const response = await api.get<{ supportUserId: number }>('/support-user');
        setSupportUserId(response.data.supportUserId);
      } catch (error) {
        console.error('Erro ao buscar ID do usuário de suporte:', error);
        toast.error('Não foi possível carregar as informações de suporte. Tente novamente.');
      }
    };
    fetchSupportUserId();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      toast.error(
        <>
          Você precisa estar logado para enviar uma mensagem.{' '}
          <Link to="/login" className="text-orange-400 underline hover:text-orange-500">
            Faça login
          </Link>{' '}
          e tente novamente.
        </>
      );
      navigate('/login');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Por favor, preencha o campo de mensagem.');
      return;
    }

    if (!supportUserId) {
      toast.error('Usuário de suporte não encontrado. Tente novamente mais tarde.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/messages', {
        recipientId: supportUserId,
        content: `Mensagem de Suporte de ${formData.name} (${formData.email}): ${formData.message}`,
      });

      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      setFormData({
        name: user?.name || 'João Moraes',
        email: user?.email || 'forumcoopquest@gmail.com',
        message: '',
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erro ao enviar mensagem:', error.response?.data?.error);
        toast.error(error.response?.data?.error || 'Erro ao enviar mensagem. Tente novamente.');
      } else if (error instanceof Error) {
        console.error('Erro ao enviar mensagem:', error.message);
        toast.error('Erro ao enviar mensagem. Tente novamente.');
      } else {
        console.error('Erro desconhecido ao enviar mensagem:', error);
        toast.error('Erro ao enviar mensagem. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="flex-grow bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen w-full"
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="mb-8 text-center pt-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 mb-4">
          Suporte
        </h1>
        <p className="text-gray-200 text-lg">
          Entre em contato com nossa equipe de suporte para resolver suas dúvidas ou problemas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4">
        <Card
          className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 w-full"
        >
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-bold text-white">
              Enviar uma Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                  Nome
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  className="w-full bg-gray-700 text-white border-gray-600 rounded-xl mt-1 focus:ring-orange-500 focus:border-orange-500"
                  value={formData.name}
                  onChange={handleChange}
                  disabled
                  required
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
                  placeholder="Seu email"
                  className="w-full bg-gray-700 text-white border-gray-600 rounded-xl mt-1 focus:ring-orange-500 focus:border-orange-500"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-200">
                  Mensagem
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Descreva seu problema ou dúvida..."
                  className="w-full bg-gray-700 text-white border-gray-600 rounded-xl mt-1 focus:ring-orange-500 focus:border-orange-500"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300 flex items-center justify-center"
                disabled={isSubmitting || !supportUserId}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500 w-full"
        >
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-bold text-white">
              Outras Opções
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <MessageCircle className="h-6 w-6 text-orange-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Fórum de Suporte
                </h3>
                <p className="text-gray-200">
                  Participe do nosso fórum para obter ajuda da comunidade.
                </p>
                <Link
                  to="/support-forum"
                  className="text-orange-400 hover:text-orange-500 inline-flex items-center mt-2 font-medium transition-colors duration-300"
                >
                  Ir para o Fórum <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MessageCircle className="h-6 w-6 text-orange-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Centro de Ajuda
                </h3>
                <p className="text-gray-200">
                  Consulte nossas FAQs e tutoriais para respostas rápidas.
                </p>
                <Link
                  to="/ajuda"
                  className="text-orange-400 hover:text-orange-500 inline-flex items-center mt-2 font-medium transition-colors duration-300"
                >
                  Ver Centro de Ajuda <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Support;