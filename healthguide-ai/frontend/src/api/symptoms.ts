import { client } from './client';
import { SymptomCheck, SymptomCheckInput, PaginatedChecks, Stats, NearbyCareResponse } from '../types';

export const symptomsApi = {
  create: async (input: SymptomCheckInput): Promise<SymptomCheck> => {
    const res = await client.post<{ check: SymptomCheck }>('/symptoms', input);
    return res.data.check;
  },

  list: async (page = 1, limit = 10): Promise<PaginatedChecks> => {
    const res = await client.get<PaginatedChecks>('/symptoms', { params: { page, limit } });
    return res.data;
  },

  get: async (id: string): Promise<SymptomCheck> => {
    const res = await client.get<{ check: SymptomCheck }>(`/symptoms/${id}`);
    return res.data.check;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/symptoms/${id}`);
  },

  stats: async (): Promise<Stats> => {
    const res = await client.get<Stats>('/symptoms/stats');
    return res.data;
  },

  nearbyCare: async (params: {
    lat: number;
    lng: number;
    careType: 'doctor' | 'hospital' | 'emergency';
    radiusMeters?: number;
  }): Promise<NearbyCareResponse> => {
    const res = await client.get<NearbyCareResponse>('/symptoms/nearby-care', { params });
    return res.data;
  },
};
