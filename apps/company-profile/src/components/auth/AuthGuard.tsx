import {  useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { clearAuth, fetchCurrentUser } from '@/redux/features/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Loader from '@workspace/ui/components/ui/loading';
import { SSO_DASHBOARD_URL } from '@/config';

interface AuthGuardProps {
  requireAdmin?: boolean;
}

const AuthGuard = ({ requireAdmin = false }: AuthGuardProps) => {
  const { isAuthenticated, accessToken, loading, user } = useAppSelector((state: { auth: any }) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken && !user && !loading) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          dispatch(clearAuth());
          window.location.href = `${SSO_DASHBOARD_URL}/login?redirect=${encodeURIComponent(location.pathname)}`;
        }
      } else if (!accessToken && isAuthenticated) {
        dispatch(clearAuth());
      }
    };

    checkAuth();
  }, [accessToken, user, loading, isAuthenticated, dispatch, location.pathname]);

  if (loading && accessToken) {
    return <Loader text="Please wait..." />;
  }

  if (!isAuthenticated) {
    dispatch(clearAuth());
    window.location.href = `${SSO_DASHBOARD_URL}/login?redirect=${encodeURIComponent(location.pathname)}`;
    return null;
  }

  if (requireAdmin && user) {
    const isAdmin = user.roles?.some((role: { role_type: string }) => role.role_type === 'admin');
    if (!isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-gray-700">You don't have permission to access this page.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </button>
        </div>
      );
    }
  }

  return <Outlet />;
};

export default AuthGuard;