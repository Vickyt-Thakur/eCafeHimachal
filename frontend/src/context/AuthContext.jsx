import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => setUser(null)).finally(() => setCheckingSession(false));
  }, []);

  async function login(identifier, password, role) {
    const endpoint = { CUSTOMER: '/auth/login/customer', PARTNER: '/auth/login/partner', ADMIN: '/auth/login/admin' }[role];
    if (!endpoint) throw new Error('A valid login role is required.');
    const { data } = await api.post(endpoint, { identifier, password });
    setUser(data.user);
    return data.user;
  }

  async function logout() { await api.post('/auth/logout'); setUser(null); }

  return <AuthContext.Provider value={{ user, setUser, checkingSession, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
