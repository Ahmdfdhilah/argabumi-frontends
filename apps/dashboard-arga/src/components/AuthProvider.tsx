// src/components/AuthProvider.tsx 
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { refreshToken, clearAuth } from '@/redux/features/authSlice';
import { jwtDecode } from 'jwt-decode';

interface TokenData {
    exp: number;
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const { accessToken, refreshToken: refreshTokenValue, isAuthenticated } = useAppSelector(state => state.auth);

    // Set up automatic token refresh
    useEffect(() => {
        if (!accessToken || !isAuthenticated) return;

        try {
            // Decode token to get expiration
            const decoded = jwtDecode<TokenData>(accessToken);
            const expirationTime = decoded.exp * 1000; // Convert to milliseconds

            // Calculate time until token expires
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            // If token is already expired, try to refresh immediately
            if (timeUntilExpiry <= 0) {
                if (refreshTokenValue) {
                    dispatch(refreshToken());
                } else {
                    dispatch(clearAuth());
                }
                return;
            }

            // Set timer to refresh 1 minute before expiration
            const refreshTime = Math.max(timeUntilExpiry - 60000, 0);

            const refreshTimer = setTimeout(() => {
                if (refreshTokenValue) {
                    dispatch(refreshToken());
                }
            }, refreshTime);

            return () => {
                clearTimeout(refreshTimer);
            };
        } catch (error) {
            console.error("Error setting up token refresh:", error);
            // If we can't decode the token, consider it invalid
            dispatch(clearAuth());
        }
    }, [accessToken, isAuthenticated, refreshTokenValue, dispatch]);

    return <>{children}</>;
};

export default AuthProvider;