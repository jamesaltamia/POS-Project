import axios, { type InternalAxiosRequestConfig } from 'axios';

// Define the base URL for the backend API
const API_BASE_URL = 'http://localhost:8000/api';
const ROOT_BACKEND_URL = 'http://localhost:8000'; // For non-/api routes like CSRF cookie

// Create an Axios instance for general API calls
const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending cookies with API requests
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-XSRF-TOKEN': document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || ''
  }
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: Array<{resolve: (value: any) => void, reject: (error: any) => void}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Function to get CSRF cookie from the correct Sanctum endpoint
export const getCsrfCookie = async (): Promise<boolean> => {
  // If we're already refreshing, return the current promise
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  
  try {
    console.log('Fetching CSRF token...');
    const response = await axios.get(`${ROOT_BACKEND_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    
    console.log('CSRF cookie request successful:', {
      status: response.status,
      statusText: response.statusText,
      cookies: document.cookie
    });
    
    processQueue(null, 'CSRF token refreshed');
    return true;
  } catch (error) {
    console.error('Error fetching CSRF token:');
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        },
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
      });
    } else {
      console.error('Non-Axios error:', error);
    }
    
    processQueue(error);
    return false;
  } finally {
    isRefreshing = false;
  }
};

// Request interceptor to add auth token and handle CSRF
API.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Get the CSRF token from cookies
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  // Add CSRF token to headers if it exists
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
  }

  // Add authorization token if it exists
  const authToken = localStorage.getItem('token');
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Skip for login/register and CSRF token endpoints
  const skipAuth = [
    '/login',
    '/register',
    '/sanctum/csrf-cookie'
  ].some(path => config.url?.includes(path));

  if (skipAuth) {
    return config;
  }

  // Get the auth token from localStorage
  const token = localStorage.getItem('token');
  
  // If we have a token, add it to the headers
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Ensure CSRF cookie is set for non-GET requests
  if (config.method?.toLowerCase() !== 'get') {
    await getCsrfCookie();
    
    // Get the CSRF token from cookies
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (csrfToken) {
      config.headers = config.headers || {};
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
    } else {
      console.warn('CSRF token not found in cookies');
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401 errors and token refreshes
API.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details for debugging
    if (error.response) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Skip refresh for login/register endpoints
      if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/register')) {
        return Promise.reject(error);
      }
      
      try {
        console.log('Attempting to refresh session...');
        // Try to refresh the CSRF token
        const refreshSuccess = await getCsrfCookie();
        
        if (refreshSuccess) {
          console.log('Session refreshed, retrying original request');
          // Update the Authorization header with the latest token
          const token = localStorage.getItem('token');
          if (token) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          // Retry the original request with the new token
          return API(originalRequest);
        } else {
          throw new Error('Failed to refresh session');
        }
      } catch (refreshError) {
        console.error('Failed to refresh session:', refreshError);
        // Clear auth state and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, just reject with the error
    return Promise.reject(error);
  }
);

// Add a response interceptor to log all responses for debugging
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('API Request Error:', {
        message: error.message,
        request: error.request
      });
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;