import api from './axios';

export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

export const getUser = async (id: string) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const createUser = async (user: any) => {
  const { data } = await api.post('/users', user);
  return data;
};

export const updateUser = async (id: string, user: any) => {
  const { data } = await api.put(`/users/${id}`, user);
  return data;
};

export const deleteUser = async (id: string) => {
  await api.delete(`/users/${id}`);
}; 