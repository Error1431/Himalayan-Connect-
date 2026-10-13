import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

const readJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const getAccessToken = () => {
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('hc_token') ||
    readJson('user')?.token ||
    null
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readJson('user'));
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await api.get('/auth/me');
      setUser(res.data.user || res.data);
      localStorage.setItem('user', JSON.stringify(res.data.user || res.data));
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      localStorage.removeItem('hc_token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    const accessToken = data.accessToken || data.token;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('hc_token', accessToken);

    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);

    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);

    const accessToken = data.accessToken || data.token;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('hc_token', accessToken);

    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);

    return data;
  };

  // Used by the /oauth-success page after a Google OAuth redirect: the
  // backend has already issued our JWTs, we just need to store them and
  // fetch the account (same tokens/shape as email+password login).
  const loginWithTokens = async (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('hc_token', accessToken);

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    const res = await api.get('/auth/me');
    const loadedUser = res.data.user || res.data;
    localStorage.setItem('user', JSON.stringify(loadedUser));
    setUser(loadedUser);

    return loadedUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('hc_token');
    localStorage.removeItem('user');

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loginWithTokens, loading }}>
      {children}
    </AuthContext.Provider>
  );
};