// performance-management/src/components/AuthGuard.tsx
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { clearAuth, fetchCurrentUser } from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Loader from '@workspace/ui/components/ui/loading';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, accessToken, loading, user } = useAppSelector((state: { auth: any; }) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
 
  useEffect(() => {
    const checkAuth = async () => {
      // If we have a token but no user data, try to fetch the user
      if (accessToken && !user && !loading) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          // Clear auth state and redirect to login
          dispatch(clearAuth());
          navigate('/login');
        }
      } 
      // If there's no token but isAuthenticated is true, there's an inconsistency
      else if (!accessToken && isAuthenticated) {
        dispatch(clearAuth());
      }
    };
    
    checkAuth();
  }, [accessToken, user, loading, isAuthenticated, dispatch, navigate]);
  
  if (loading && accessToken) {
    return (
      <Loader text='Please wait...' />
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;