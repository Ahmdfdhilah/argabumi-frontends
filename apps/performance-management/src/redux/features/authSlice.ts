// src/redux/features/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL_SSO, API_BASE_URL_PERFORMANCE_MANAGEMENT } from '@/config';
import { jwtDecode } from 'jwt-decode';

// Types for the target application user structure
export interface UserData {
  user_id: number;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_is_active: boolean;
  user_sso_id: string;
  user_employee_id: string | null;
  employee_name: string | null;
  org_unit_name: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface TokenData {
  exp: number;
  sub: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  tokenExpiration: number | null;
}

// Helper function to check token and extract expiration
function getTokenExpiration(token: string | null): number | null {
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenData>(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

// Get initial state from localStorage
function getInitialTokenState() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const tokenExpiration = getTokenExpiration(accessToken);

  // Check if token is expired or invalid
  if (!accessToken || (tokenExpiration && tokenExpiration < Date.now())) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return {
      accessToken: null,
      refreshToken: null,
      tokenExpiration: null,
      isAuthenticated: false
    };
  }

  return {
    accessToken,
    refreshToken,
    tokenExpiration,
    isAuthenticated: !!accessToken
  };
}

// Initial state
const initialTokenState = getInitialTokenState();
const initialState: AuthState = {
  isAuthenticated: initialTokenState.isAuthenticated,
  user: null,
  accessToken: initialTokenState.accessToken,
  refreshToken: initialTokenState.refreshToken,
  tokenExpiration: initialTokenState.tokenExpiration,
  loading: false,
  error: null
};

// Async thunks
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.accessToken) {
        return rejectWithValue('No access token found');
      }

      // Fetch user data from Performance Management service instead of SSO
      const response = await axios.get(`${API_BASE_URL_PERFORMANCE_MANAGEMENT}/users/me`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('An error occurred fetching user data');
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.accessToken) {
        return rejectWithValue('No access token found');
      }

      // Verify token with SSO service
      const response = await axios.post(`${API_BASE_URL_SSO}/auth/verify`, {}, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Token verification failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.refreshToken) {
        return rejectWithValue('No refresh token found');
      }

      // Use SSO service for token refresh
      const response = await axios.post(`${API_BASE_URL_SSO}/auth/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${auth.refreshToken}`
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to refresh token');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (auth.accessToken) {
        // Notify SSO service about logout
        try {
          await axios.post(`${API_BASE_URL_SSO}/auth/logout`, {}, {
            headers: {
              Authorization: `Bearer ${auth.accessToken}`
            }
          });
        } catch (error) {
          console.error("Error during SSO logout:", error);
          // Continue with local logout even if SSO logout fails
        }
      }

      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      return null;
    } catch (error) {
      return rejectWithValue('An error occurred during logout');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string, refreshToken: string }>) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.tokenExpiration = getTokenExpiration(accessToken);

      // Store in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    clearAuth: (state) => {
      // Completely reset state to default values
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiration = null;
      state.loading = false;
      state.error = null;

      // Clear from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    // Helper to update user data manually if needed
    updateUserData: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    // fetchCurrentUser
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // verifyToken
    builder.addCase(verifyToken.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyToken.fulfilled, (state) => {
      state.loading = false;
      // Token is valid, no state change needed
    });
    builder.addCase(verifyToken.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;

      // If token verification fails, clear auth
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiration = null;

      // Clear from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });

    // refreshToken
    builder.addCase(refreshToken.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.loading = false;
      state.accessToken = action.payload.access_token;
      state.tokenExpiration = getTokenExpiration(action.payload.access_token);

      // Store in localStorage
      localStorage.setItem('accessToken', action.payload.access_token);
    });
    builder.addCase(refreshToken.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;

      // If refresh token failed, clear auth
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiration = null;

      // Clear from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });

    // logoutUser
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiration = null;
      state.loading = false;
    });
  }
});

export const { setTokens, clearAuth, updateUserData } = authSlice.actions;
export default authSlice.reducer;