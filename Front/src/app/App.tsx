// ─── App Entry Point ──────────────────────────────────────────────────────────
// Thin shell: manages auth state and delegates routing to AppRoutes.

import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { Toaster } from './components/ui/sonner';
import AppRoutes from '../routes/routes';
import { User } from '../features/shared/types';
import { clearToken, getToken } from '../api/apiClient';

const USER_KEY = 'dbcas_user_data';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  // If token is missing but user data exists, clear user (session expired/invalid)
  useEffect(() => {
    if (!getToken()) {
      handleLogout();
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    clearToken();
  };

  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <AppRoutes user={user} onLogin={handleLogin} onLogout={handleLogout} />
      </BrowserRouter>
    </>
  );
}
