// ─── App Entry Point ──────────────────────────────────────────────────────────
// Thin shell: manages auth state and delegates routing to AppRoutes.

import { useState } from 'react';
import { BrowserRouter } from 'react-router';
import { Toaster } from './components/ui/sonner';
import AppRoutes from '../routes/routes';
import { User } from '../features/shared/types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (role: string, name: string) => setUser({ role, name });
  const handleLogout = () => setUser(null);

  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <AppRoutes user={user} onLogin={handleLogin} onLogout={handleLogout} />
      </BrowserRouter>
    </>
  );
}
