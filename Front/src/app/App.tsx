// ─── App Entry Point ──────────────────────────────────────────────────────────
// Manages auth state with localStorage persistence + JWT token.

import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { Toaster } from './components/ui/sonner';
import AppRoutes from '../routes/routes';
import { User } from '../features/shared/types';
import { getToken, clearToken } from '../api/apiClient';
import { logout as apiLogout } from '../api/auth.api';

const USER_KEY = 'dbcas_user';

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    const token = getToken();
    if (raw && token) return JSON.parse(raw);
  } catch { /* ignore parse errors */ }
  return null;
}

export default function App() {
  const [user, setUser] = useState<User | null>(loadStoredUser);

  // Persist user on change
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const handleLogin = (role: string, name: string) => setUser({ role, name });

  const handleLogout = async () => {
    try {
      await apiLogout(); // Calls POST /auth/logout (clears httpOnly refresh cookie)
    } catch {
      // Even if logout API fails, clear local state
    }
    clearToken();
    setUser(null);
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
