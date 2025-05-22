import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Usa a variável de ambiente para local e produção
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('Requisição enviada:', {
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
      method: config.method,
      token: token ? 'Presente' : 'Ausente',
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', {
      message: error.message,
      stack: error.stack,
    });
    toast.error('Erro ao enviar requisição. Tente novamente.');
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', {
      url: response.config.url,
      fullUrl: `${response.config.baseURL}${response.config.url}`,
      status: response.status,
      data: JSON.stringify(response.data, null, 2),
    });
    return response;
  },
  (error) => {
    console.error('Erro no interceptor de resposta:', {
      url: error.config?.url,
      fullUrl: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A',
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.code === 'ECONNABORTED') {
      toast.error('Tempo limite de conexão excedido. Verifique sua conexão.');
      return Promise.reject(new Error('Timeout'));
    }

    if (!error.response) {
      toast.error('Erro de conexão com o servidor. Tente novamente mais tarde.');
      return Promise.reject(new Error('Network Error'));
    }

    const status = error.response?.status;
    const errorMessage = error.response?.data?.error || 'Erro inesperado';

    if (status === 401) {
      const noRedirectRoutes = ['/auth/me', '/auth/login', '/auth/register'];
      const shouldRedirect = !noRedirectRoutes.some((route) =>
        error.config.url.includes(route)
      );

      if (shouldRedirect) {
        toast.error('Sessão expirada. Faça login novamente.');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    } else if (status !== 500) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api;