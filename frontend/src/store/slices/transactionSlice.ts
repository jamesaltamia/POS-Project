import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from './productSlice';

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'card';
  status: 'pending' | 'completed' | 'cancelled';
  cashierId: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TransactionState {
  transactions: Transaction[];
  currentCart: CartItem[];
  selectedTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  currentCart: [],
  selectedTransaction: null,
  isLoading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.currentCart.find(
        item => item.product.id === action.payload.product.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.subtotal = existingItem.quantity * existingItem.product.price;
      } else {
        state.currentCart.push({
          ...action.payload,
          subtotal: action.payload.quantity * action.payload.product.price,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.currentCart = state.currentCart.filter(
        item => item.product.id !== action.payload
      );
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const item = state.currentCart.find(
        item => item.product.id === action.payload.productId
      );
      if (item) {
        item.quantity = action.payload.quantity;
        item.subtotal = item.quantity * item.product.price;
      }
    },
    clearCart: (state) => {
      state.currentCart = [];
    },
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
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
  setTransactions,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  setSelectedTransaction,
  setLoading,
  setError,
} = transactionSlice.actions;

export default transactionSlice.reducer; 