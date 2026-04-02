import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem('hg_token', token);
    localStorage.setItem('hg_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('hg_token');
    localStorage.removeItem('hg_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem('hg_token');
    const userRaw = localStorage.getItem('hg_user');
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw) as User;
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('hg_token');
        localStorage.removeItem('hg_user');
      }
    }
  },
}));
