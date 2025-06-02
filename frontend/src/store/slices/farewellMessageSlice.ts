import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FarewellMessage {
  id: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FarewellMessageState {
  messages: FarewellMessage[];
  selectedMessage: FarewellMessage | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FarewellMessageState = {
  messages: [],
  selectedMessage: null,
  isLoading: false,
  error: null,
};

const farewellMessageSlice = createSlice({
  name: 'farewellMessages',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<FarewellMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<FarewellMessage>) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action: PayloadAction<FarewellMessage>) => {
      const idx = state.messages.findIndex(m => m.id === action.payload.id);
      if (idx !== -1) state.messages[idx] = action.payload;
    },
    deleteMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
    },
    setSelectedMessage: (state, action: PayloadAction<FarewellMessage | null>) => {
      state.selectedMessage = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  setSelectedMessage,
  setLoading,
  setError,
} = farewellMessageSlice.actions;

export default farewellMessageSlice.reducer; 