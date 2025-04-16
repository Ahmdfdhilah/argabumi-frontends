// src/redux/reducers.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/redux/features/authSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
});

export type RootReducer = ReturnType<typeof rootReducer>;