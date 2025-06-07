import api from './axios';

// Utility function to get a cookie by name
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const getCsrfCookie = async (): Promise<boolean> => {
  try {
    await api.get('/sanctum/csrf-cookie', {
      baseURL: 'http://localhost:8000', // override to avoid /api prefix
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to get CSRF cookie:', error);
    return false;
  }
};

// Define possible role types
type UserRoleString = 'admin' | 'manager' | 'cashier' | 'administrator';

// Define the shape of the role object from the backend
interface UserRoleObject {
  id: number;
  name: UserRoleString;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role_id: number | null;
    created_at: string;
    updated_at: string;
    role?: UserRoleString | UserRoleObject; // Can be string or object
  };
  token: string;
  message?: string;
  status?: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.group('🔐 Login Process');
    console.log('1. Getting CSRF token...');
    
    // First, get CSRF token
    const csrfSuccess = await getCsrfCookie();
    if (!csrfSuccess) {
      throw new Error('Failed to establish secure connection. Please refresh the page and try again.');
    }
    console.log('✅ CSRF token obtained');

    console.log('2. Sending login request to /login endpoint');
    const response = await api.post<LoginResponse>('/login', 
      { email, password },
      {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || ''
        }
      }
    );
    
    console.log('3. Login response received');
    console.log('Response status:', response.status);
    
    // Validate response structure
    if (!response.data.user || !response.data.token) {
      console.error('❌ Invalid response structure:', response.data);
      throw new Error('Invalid response from server');
    }
    
    // Store the token in localStorage
    localStorage.setItem('token', response.data.token);
    
    console.log('✅ Login successful');
    console.log('User ID:', response.data.user.id);
    console.log('User role:', response.data.user.role || 'not specified');
    console.groupEnd();
    
    return response.data;
    
  } catch (error: any) {
    console.group('❌ Login Error');
    
    let errorMessage = 'Login failed. Please check your credentials and try again.';
    
    if (error.response) {
      // Server responded with an error status
      console.error('Error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 401 || error.response.status === 422) {
        errorMessage = error.response.data?.message || 'Invalid email or password.';
      } else if (error.response.status === 419) {
        errorMessage = 'Session expired. Please refresh the page and try again.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
      if (error.message.includes('Network Error')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
    }
    
    console.error('Error details:', error);
    console.groupEnd();
    
    // Create a new error with a user-friendly message
    const loginError = new Error(errorMessage);
    (loginError as any).status = error.response?.status;
    throw loginError;
  }
};

export const logout = async () => {
  await api.post('/logout', {}, {
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });
};

export const register = async (user: { username: string; email: string; password: string }) => {
  const { data } = await api.post('/register', user);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/user');
  return data;
}; 