import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string | number;
  username: string;
  name?: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const getInitialAuthState = () => {
  const token = localStorage.getItem('token');
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      user = JSON.parse(userStr);
    }
  } catch {
    user = null;
  }
  return {
    user,
    token: token || null,
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: Omit<User, 'id'> & { id: string | number }; token: string }>
    ) => {
      const { user, token } = action.payload;
      const normalizedUser = {
        ...user,
        id: user.id.toString()
      };
      state.user = normalizedUser;
      state.token = token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer; 