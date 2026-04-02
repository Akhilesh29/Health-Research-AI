import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('hg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally → clear auth and redirect
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hg_token');
      localStorage.removeItem('hg_user');
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);
