import api from './axios';

export const getTransactions = async () => {
  const { data } = await api.get('/transactions');
  return data;
};

export const createTransaction = async (transaction: any) => {
  const { data } = await api.post('/transactions', transaction);
  return data;
}; 