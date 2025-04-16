import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/redux/hooks'
import { setTokens } from '@/redux/features/authSlice'
import { useToast } from "@workspace/ui/components/sonner"
import Loader from '@workspace/ui/components/ui/loading'

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');

    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (accessToken && refreshToken) {
      dispatch(setTokens({ accessToken, refreshToken }));
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully",
      });
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, dispatch, toast]);

  return (
    <Loader text='Processing authentication...' />
  );
}