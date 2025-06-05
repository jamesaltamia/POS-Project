import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // FIXED: now includes /api
  withCredentials: true,
});

// Sanctum XSRF config (set on the custom instance)
api.defaults.xsrfCookieName = 'XSRF-TOKEN';
api.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

// Force X-XSRF-TOKEN header from cookie on every request
api.interceptors.request.use(config => {
  const xsrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  if (xsrfToken) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }
  return config;
});

export default api; 

await api.get('/sanctum/csrf-cookie', {
  baseURL: 'http://localhost:8000', // not /api
  withCredentials: true,
}); 