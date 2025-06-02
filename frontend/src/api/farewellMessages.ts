import api from './axios';

export const getFarewellMessages = async () => {
  const { data } = await api.get('/farewell-messages');
  return data;
};

export const createFarewellMessage = async (message: any) => {
  const { data } = await api.post('/farewell-messages', message);
  return data;
};

export const updateFarewellMessage = async (id: string, message: any) => {
  const { data } = await api.put(`/farewell-messages/${id}`, message);
  return data;
};

export const deleteFarewellMessage = async (id: string) => {
  await api.delete(`/farewell-messages/${id}`);
}; 