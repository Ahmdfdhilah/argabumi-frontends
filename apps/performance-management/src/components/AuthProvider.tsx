// src/components/AuthProvider.tsx
import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setTokens, fetchCurrentUser, refreshToken } from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Loader from '@workspace/ui/components/ui/loading';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isAuthenticated, accessToken, tokenExpiration, loading } = useAppSelector((state: { auth: any; }) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL parameters on initial load to check for SSO token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('sso_token');
    
    // If we have an SSO token in the URL and we're not already authenticated
    if (ssoToken && !isAuthenticated) {
      // Set the token in our state and localStorage
      dispatch(setTokens({ 
        accessToken: ssoToken, 
        // We don't have refresh token from URL params, so we'll set it to the same value
        // This might need adjustment based on your backend requirements
        refreshToken: ssoToken 
      }));
      
      // Clean up the URL by removing the token
      const cleanUrl = location.pathname;
      navigate(cleanUrl, { replace: true });
    }
  }, [location, dispatch, navigate, isAuthenticated]);

  // Set up token refresh mechanism
  useEffect(() => {
    if (!isAuthenticated || !tokenExpiration) return;

    // Calculate when to refresh (e.g., 5 minutes before expiry)
    const timeToRefresh = tokenExpiration - Date.now() - (5 * 60 * 1000);
    
    // Set up refresh timer
    const refreshTimer = setTimeout(() => {
      dispatch(refreshToken());
    }, Math.max(0, timeToRefresh));

    return () => clearTimeout(refreshTimer);
  }, [tokenExpiration, isAuthenticated, dispatch]);

  // Initial user data fetch when we have a token
  useEffect(() => {
    if (accessToken && isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [accessToken, isAuthenticated, dispatch]);

  if (loading) {
    return <Loader text="Initializing..." />;
  }

  return <>{children}</>;
};

export default AuthProvider;