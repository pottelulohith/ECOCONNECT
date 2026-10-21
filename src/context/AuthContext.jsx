import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portal, setPortal] = useState('citizen');

  // Check current session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await api.auth.me();
      if (res.user) {
        setUser(res.user);
        setPortal(res.user.role);
      }
    } catch {
      // If no session exists, default demo login for citizen
      try {
        const demoRes = await api.auth.demoLogin('citizen');
        if (demoRes.user) {
          setUser(demoRes.user);
          setPortal('citizen');
        }
      } catch (e) {
        console.warn('Backend not yet reachable on startup:', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchPortalUser = async (targetRole) => {
    setLoading(true);
    const normalizedRole = targetRole === 'municipal' ? 'municipality' : targetRole;
    try {
      const res = await api.auth.demoLogin(normalizedRole);
      if (res?.user) {
        setUser(res.user);
        if (res.token) {
          localStorage.setItem('ecoconnect_token', res.token);
        }
      }
    } catch (err) {
      console.error(`Failed to switch to ${normalizedRole}:`, err);
    } finally {
      setPortal(normalizedRole);
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const res = await api.auth.login(credentials);
    if (res.user) {
      setUser(res.user);
      setPortal(res.user.role);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.user) {
      setUser(res.user);
      setPortal(res.user.role);
    }
    return res;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.auth.updateProfile(data);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        portal,
        setPortal: switchPortalUser,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
