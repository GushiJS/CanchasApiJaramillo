import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5098';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de Request: adjunta automáticamente el token JWT en cabecera Bearer
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Seguridad: obtención desde sessionStorage (mitigación de persistencia innecesaria)
    const token = sessionStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response: normaliza errores y maneja expiración/códigos HTTP
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; detail?: string; title?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    let message = 'Ha ocurrido un error inesperado al conectar con el servidor.';

    if (data?.error) {
      message = data.error;
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.title) {
      message = data.title;
    } else if (error.message === 'Network Error') {
      message = 'No se pudo conectar con la API. Verifique que el backend esté ejecutándose.';
    }

    if (status === 401) {
      // Manejo de token inválido o expirado
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      window.dispatchEvent(new CustomEvent('auth:expired', { detail: { message: 'Su sesión ha expirado. Por favor ingrese nuevamente.' } }));
    } else if (status === 403) {
      message = 'Acceso denegado: No tiene los permisos necesarios para realizar esta acción.';
    } else if (status === 429) {
      message = 'Límite de intentos excedido (Rate Limit). Espere un minuto antes de volver a intentar.';
    }

    const normalizedError: ApiError = {
      message,
      status,
      detail: data?.detail,
      errors: data?.errors,
    };

    return Promise.reject(normalizedError);
  }
);
