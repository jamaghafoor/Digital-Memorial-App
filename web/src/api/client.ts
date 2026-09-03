import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
    localStorage.removeItem('adminToken');
    location.assign('/admin/login');
  }
  return Promise.reject(error);
});
