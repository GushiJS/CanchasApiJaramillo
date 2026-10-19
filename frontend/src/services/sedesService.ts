import { apiClient } from '../lib/apiClient';
import { Sede } from '../types';

export const sedesService = {
  async getSedes(): Promise<Sede[]> {
    const response = await apiClient.get<Sede[]>('/api/v1/sedes');
    return response.data;
  },
};
