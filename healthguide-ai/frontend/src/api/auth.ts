import { client } from './client';
import { AuthResponse, User } from '../types';

export const authApi = {
  signup: async (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/auth/signup', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  me: async (): Promise<User> => {
    const res = await client.get<{ user: User }>('/auth/me');
    return res.data.user;
  },
};
