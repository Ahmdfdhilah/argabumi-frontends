// performance-management/src/components/AuthGuard.tsx
import { ReactNode, useEffect } from 'react';
import { clearAuth, fetchCurrentUser } from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Loader from '@workspace/ui/components/ui/loading';
import {  SSO_DASHBOARD_URL } from '@/config';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, accessToken, loading, user } = useAppSelector((state: { auth: any; }) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      // If we have a token but no user data, try to fetch the user
      if (accessToken && !user && !loading) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          // Clear auth state and redirect to login
          dispatch(clearAuth());
          window.location.href = `${SSO_DASHBOARD_URL}/login`; //harusnya di login curr domain tp nanti saja arahkan ke domain login sso
        }
      } 
      // If there's no token but isAuthenticated is true, there's an inconsistency
      else if (!accessToken && isAuthenticated) {
        dispatch(clearAuth());
      }
    };
    
    checkAuth();
  }, [accessToken, user, loading, isAuthenticated, dispatch]);
  
  if (loading && accessToken) {
    return (
      <Loader text='Please wait...' />
    );
  }
  
  if (!isAuthenticated) {
    dispatch(clearAuth());
    window.location.href = `${SSO_DASHBOARD_URL}/login`;
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;