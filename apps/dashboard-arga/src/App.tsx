// src/App.tsx
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Dashboard from './pages/Dashboard';
import { persistor, store } from './redux/store';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Auth/Login';
import { Toaster } from "@workspace/ui/components/sonner";
import AuthCallback from '@/pages/Auth/AuthCallback';
import { PersistGate } from 'redux-persist/integration/react';
import AuthProvider from './components/AuthProvider';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <BrowserRouter>
            <Toaster />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } />
              {/* Add more protected routes as needed */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;