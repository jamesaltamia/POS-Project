import api from './axios';

export const getCsrfCookie = async () => {
  await api.get('/sanctum/csrf-cookie', {
    baseURL: import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000',
  });
};

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/login', { email, password });
  return data.user || data; // Expecting user object from backend
};

export const logout = async () => {
  await api.post('/logout');
};

export const register = async (user: { username: string; email: string; password: string }) => {
  const { data } = await api.post('/register', user);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/user');
  return data;
}; 