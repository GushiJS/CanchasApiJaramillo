import { apiClient } from '../lib/apiClient';
import { Cancha, CanchasFilter, CrearCanchaDTO, EditarCanchaDTO } from '../types';

export const canchasService = {
  async getCanchas(filters?: CanchasFilter): Promise<Cancha[]> {
    const params = new URLSearchParams();
    if (filters?.sedeId) params.append('sedeId', filters.sedeId.toString());
    if (filters?.tipoCanchaId) params.append('tipoCanchaId', filters.tipoCanchaId.toString());
    if (filters?.estado) params.append('estado', filters.estado);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<Cancha[]>(`/api/v1/canchas${queryString}`);
    return response.data;
  },

  async getCanchaById(id: number): Promise<Cancha> {
    const response = await apiClient.get<Cancha>(`/api/v1/canchas/${id}`);
    return response.data;
  },

  async createCancha(data: CrearCanchaDTO): Promise<Cancha> {
    const response = await apiClient.post<Cancha>('/api/v1/canchas', data);
    return response.data;
  },

  async updateCancha(id: number, data: EditarCanchaDTO): Promise<void> {
    await apiClient.put(`/api/v1/canchas/${id}`, data);
  },

  async deleteCancha(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/canchas/${id}`);
  },
};
