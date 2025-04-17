import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setTokens, fetchCurrentUser, refreshToken } from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Loader from '@workspace/ui/components/ui/loading';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isAuthenticated, accessToken, tokenExpiration, loading: authLoading } = useAppSelector((state: { auth: any; }) => state.auth);
  const [initialLoading, setInitialLoading] = useState(true);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle SSO token on initial load
  useEffect(() => {
    const handleInitialAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ssoToken = urlParams.get('sso_token');
        const refreshTokenValue = urlParams.get('refresh_token');
        
        // Only process tokens if we're not already authenticated
        if (ssoToken && !isAuthenticated) {
          console.log('SSO token detected, setting credentials');
          
          // First set the tokens in Redux and localStorage (regular action, no unwrap)
          dispatch(setTokens({ 
            accessToken: ssoToken, 
            refreshToken: refreshTokenValue || ssoToken // Use refresh token if provided, otherwise use SSO token
          }));
          
          // Then fetch user data (this is an async thunk, so we can use unwrap)
          await dispatch(fetchCurrentUser()).unwrap();
          
          // Only clean up URL after we've processed the tokens
          const cleanUrl = location.pathname;
          navigate(cleanUrl, { replace: true });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    handleInitialAuth();
  }, []);

  // Set up token refresh mechanism (separate from initial auth)
  useEffect(() => {
    if (!isAuthenticated || !tokenExpiration) return;

    const timeToRefresh = tokenExpiration - Date.now() - (5 * 60 * 1000);
    console.log(`Token will be refreshed in ${Math.round(timeToRefresh/1000)} seconds`);
    
    const refreshTimer = setTimeout(() => {
      console.log('Refreshing token...');
      dispatch(refreshToken());
    }, Math.max(0, timeToRefresh));

    return () => clearTimeout(refreshTimer);
  }, [tokenExpiration, isAuthenticated, dispatch]);

  // Make sure we have user data whenever we're authenticated
  useEffect(() => {
    const ensureUserData = async () => {
      if (accessToken && isAuthenticated && !initialLoading) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };
    
    ensureUserData();
  }, [accessToken, isAuthenticated, initialLoading, dispatch]);

  // Show loader during initial authentication or when auth state is loading
  if (initialLoading || authLoading) {
    return <Loader text="Initializing..." />;
  }

  return <>{children}</>;
};

export default AuthProvider;