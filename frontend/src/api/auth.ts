import api from './axios';

export const getCsrfCookie = async () => {
  await api.get('/sanctum/csrf-cookie');
};

export const login = async (email: string, password: string) => {
  await getCsrfCookie();
  const { data } = await api.post('/api/login', { email, password });
  return data; // Return the whole response, not just data.user
};

export const logout = async () => {
  await api.post('/api/logout');
};

export const register = async (user: { username: string; email: string; password: string }) => {
  const { data } = await api.post('/api/register', user);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/api/user');
  return data;
}; 