import { apiClient } from '../lib/apiClient';
import { TipoCancha } from '../types';

export const tipoCanchasService = {
  async getTiposCancha(): Promise<TipoCancha[]> {
    const response = await apiClient.get<TipoCancha[]>('/api/v1/tipocanchas');
    return response.data;
  },
};
