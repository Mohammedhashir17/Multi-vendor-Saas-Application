import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import BackendService from '../../services/backend-service';

const Ctx = createContext(null);
const api = new BackendService();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('baz_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const persistSession = useCallback((res, fallbackUser) => {
    const payload = res.data?.data ?? res.data;
    const u = payload?.user ?? fallbackUser;
    if (!u) return;
    setUser(u);
    localStorage.setItem('baz_user', JSON.stringify(u));
    const token = payload?.token ?? res.data?.token;
    if (token) localStorage.setItem('baz_token', token);
  }, []);

  const login = useCallback(async (emailOrMobile, password) => {
    const res = await api.login({ emailOrMobile, password });
    persistSession(res, { email: emailOrMobile, name: String(emailOrMobile).split('@')[0] });
    return res;
  }, [persistSession]);

  const googleLogin = useCallback(async (credential) => {
    const res = await api.googleAuth({ credential });
    const payload = res.data?.data ?? res.data;
    const email = payload?.user?.email;
    persistSession(res, email ? { email, name: payload.user?.name } : null);
    return res;
  }, [persistSession]);

  const register = useCallback(async (payload) => {
    const res = await api.register(payload);
    return res;
  }, []);

  const verifyRegistrationOtp = useCallback(async (payload) => {
    const res = await api.verifyRegistrationOtp(payload);
    persistSession(res, { email: payload.email });
    return res;
  }, [persistSession]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('baz_user');
    localStorage.removeItem('baz_token');
  }, []);

  const value = useMemo(
    () => ({ user, login, googleLogin, register, verifyRegistrationOtp, logout, api }),
    [user, login, googleLogin, register, verifyRegistrationOtp, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth needs AuthProvider');
  return v;
}
