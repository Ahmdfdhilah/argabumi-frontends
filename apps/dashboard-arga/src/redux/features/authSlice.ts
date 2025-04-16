// src/redux/features/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '@/config';
import { jwtDecode } from 'jwt-decode';

// Types
export interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_superuser: boolean;
  allowed_apps: Array<{
    id: number;
    code: string;
  }>;
}

interface TokenData {
  exp: number;
  sub: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_superuser: boolean;
  allowed_apps?: Array<{
    id: number;
    code: string;
  }>;
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

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

// Extract user data from token
function extractUserFromToken(token: string | null): UserData | null {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<TokenData>(token);
    return {
      id: parseInt(decoded.sub),
      email: decoded.email,
      first_name: decoded.first_name,
      last_name: decoded.last_name,
      is_active: decoded.is_active,
      is_superuser: decoded.is_superuser,
      allowed_apps: decoded.allowed_apps || []
    };
  } catch (error) {
    console.error("Error extracting user data from token:", error);
    return null;
  }
}

// Get tokens from localStorage and validate them
function getInitialTokenState() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const tokenExpiration = getTokenExpiration(accessToken);
  
  // Check if token is expired
  if (tokenExpiration && tokenExpiration < Date.now()) {
    // Token is expired, clear local storage
    localStorage.removeItem('accessToken');
    return {
      accessToken: null,
      refreshToken,
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
  user: extractUserFromToken(initialTokenState.accessToken),
  accessToken: initialTokenState.accessToken,
  refreshToken: initialTokenState.refreshToken,
  tokenExpiration: initialTokenState.tokenExpiration,
  loading: false,
  error: null
};

// Async thunks
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async () => {
    // Redirect to backend's Google OAuth login endpoint
    window.location.href = `${API_BASE_URL}/auth/login`;
    return null;
  }
);

export const handleOAuthCallback = createAsyncThunk(
  'auth/handleOAuthCallback',
  async (code: string, { rejectWithValue }) => {
    try {
      // Handle OAuth callback with code
      const response = await axios.get(`${API_BASE_URL}/auth/callback?code=${code}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Check for "token used too early" error
        const errorDetail = error.response.data?.detail;
        if (errorDetail && typeof errorDetail === 'string' && 
            errorDetail.includes('Token used too early')) {
          // Wait for 3 seconds and retry once
          console.log('Token timing issue detected, retrying in 3 seconds...');
          await delay(3000);
          try {
            const retryResponse = await axios.get(`${API_BASE_URL}/auth/callback?code=${code}`);
            return retryResponse.data;
          } catch (retryError) {
            if (axios.isAxiosError(retryError) && retryError.response) {
              return rejectWithValue(retryError.response.data);
            }
            return rejectWithValue('Error after retry attempt');
          }
        }
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('An error occurred during authentication');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.accessToken) {
        return rejectWithValue('No access token found');
      }
      
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
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

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.accessToken) {
        return rejectWithValue('No access token found');
      }
      
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      
      // Also revoke the refresh token if available
      if (auth.refreshToken) {
        try {
          await axios.post(`${API_BASE_URL}/auth/revoke`, {
            refresh_token: auth.refreshToken
          });
        } catch (error) {
          console.error("Error revoking refresh token:", error);
          // Continue with logout even if revoke fails
        }
      }
      
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      return null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('An error occurred during logout');
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
      
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: auth.refreshToken
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.detail?.includes('Token used too early')) {
        // Wait for 3 seconds and retry once for this specific error
        await delay(3000);
        try {
          const { auth } = getState() as { auth: AuthState };
          const retryResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: auth.refreshToken
          });
          return retryResponse.data;
        } catch (retryError) {
          if (axios.isAxiosError(retryError) && retryError.response) {
            return rejectWithValue(retryError.response.data);
          }
          return rejectWithValue('Failed to refresh token after retry');
        }
      }
      
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Failed to refresh token');
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
      state.user = extractUserFromToken(accessToken);
      
      // Store in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiration = null;
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
    // handleOAuthCallback
    builder.addCase(handleOAuthCallback.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(handleOAuthCallback.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
        state.tokenExpiration = getTokenExpiration(action.payload.access_token);
        state.user = extractUserFromToken(action.payload.access_token);
        
        // Store in localStorage
        localStorage.setItem('accessToken', action.payload.access_token);
        localStorage.setItem('refreshToken', action.payload.refresh_token);
      }
    });
    builder.addCase(handleOAuthCallback.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
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
      
      // Only clear token if it's a 401 error
      if (action.meta.rejectedWithValue) {
        // If it was an auth error, log out completely
        state.accessToken = null;
        localStorage.removeItem('accessToken');
      }
    });
    
    // logoutUser
    builder.addCase(logoutUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiration = null;
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      // Even if server logout fails, clear local state
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiration = null;
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
      state.user = extractUserFromToken(action.payload.access_token);
      
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
  }
});

export const { setTokens, clearAuth, updateUserData } = authSlice.actions;
export default authSlice.reducer;