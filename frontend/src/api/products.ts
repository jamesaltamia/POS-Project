import api from './axios';

export const getProducts = async () => {
  const { data } = await api.get('/products');
  return data;
};

export const getProduct = async (id: string) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const createProduct = async (product: any) => {
  const { data } = await api.post('/products', product);
  return data;
};

export const updateProduct = async (id: string, product: any) => {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id: string) => {
  await api.delete(`/products/${id}`);
}; 