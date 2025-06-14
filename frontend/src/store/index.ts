import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import transactionReducer from './slices/transactionSlice';
import feedbackReducer from './slices/feedbackSlice';
import userReducer from './slices/userSlice';
import farewellMessageReducer from './slices/farewellMessageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    transactions: transactionReducer,
    feedback: feedbackReducer,
    users: userReducer,
    farewellMessages: farewellMessageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 