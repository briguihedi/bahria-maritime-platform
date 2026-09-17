import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('bahria_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bahria_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('bahria_user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('bahria_token');
        localStorage.removeItem('bahria_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('bahria_token', data.token);
    localStorage.setItem('bahria_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  // ── NEW register — no token, just sends verification email ──
  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    // Don't store token or user — must verify email first
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bahria_token');
    localStorage.removeItem('bahria_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}