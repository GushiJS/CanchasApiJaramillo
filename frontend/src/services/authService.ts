import { apiClient } from '../lib/apiClient';
import { AuthResponse, LoginRequest, RegistroRequest, Usuario } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/usuarios/login', credentials);
    return response.data;
  },

  async registro(data: RegistroRequest): Promise<Usuario> {
    const response = await apiClient.post<Usuario>('/api/v1/usuarios/registro', data);
    return response.data;
  },

  async getProfile(id: number): Promise<Usuario> {
    const response = await apiClient.get<Usuario>(`/api/v1/usuarios/${id}`);
    return response.data;
  },
};
