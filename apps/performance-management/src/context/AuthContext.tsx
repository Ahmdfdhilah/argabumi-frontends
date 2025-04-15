import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, username: string) => void;
  logout: () => void;
  updateToken: (newToken: string) => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
  });

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setAuth({
        isAuthenticated: true,
        token,
        user
      });
    }
  }, []);

  const login = (token: string, username: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', username);
    setAuth({
      isAuthenticated: true,
      token,
      user: username
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({
      isAuthenticated: false,
      token: null,
      user: null
    });
  };

  const updateToken = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setAuth(prevAuth => ({
      ...prevAuth,
      token: newToken
    }));
  };

  const getToken = (): string | null => {
    return auth.token;
  };

  return (
    <AuthContext.Provider value={{ 
      ...auth, 
      login, 
      logout, 
      updateToken,
      getToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};