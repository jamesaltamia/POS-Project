import api from './axios';

export const getCsrfCookie = async () => {
  await api.get('/sanctum/csrf-cookie', {
    baseURL: 'http://localhost:8000', // override to avoid /api prefix
    withCredentials: true,
  });
};

export const login = async (email: string, password: string) => {
  await getCsrfCookie();
  const { data } = await api.post('/login', { email, password });
  return data; // Return the whole response, not just data.user
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