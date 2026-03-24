/**
 * lib/axios.ts
 * Instância global do Axios com interceptores para autenticação e erros.
 */
import axios from 'axios';

const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function normalizeBaseUrl(url: string): string {
  if (!url) return 'http://localhost:8000';
  const hasProtocol = /^https?:\/\//i.test(url);
  const isLocalhost  = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(url);
  const protocol     = isLocalhost ? 'http' : 'https';
  const withProtocol = hasProtocol ? url : `${protocol}://${url}`;
  return withProtocol.replace(/\/$/, '');
}

export const BASE_URL = normalizeBaseUrl(RAW_BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor de requisição: Adiciona o token se existir
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Interceptor de resposta: Captura 401 e redireciona para o login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // Evita loops de redirecionamento se já estiver no login
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?error=unauthorized';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
