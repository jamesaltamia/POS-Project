import api from './axios';

export const submitFeedback = async (feedback: any) => {
  const { data } = await api.post('/feedback', feedback);
  return data;
};

export const getFeedback = async () => {
  const { data } = await api.get('/feedback');
  return data;
}; 