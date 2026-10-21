import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import consts from '../consts';

const AUTH_STORAGE_KEY = 'salao-josi-auth';

const AuthContext = createContext(null);

const getStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null;
  } catch (err) {
    return null;
  }
};

const applyToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(getStoredSession);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    applyToken(session?.token);
  }, [session?.token]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setSession(null);
        }

        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const login = async ({ email, senha, accessType }) => {
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', {
        email,
        senha,
        accessType,
        salaoId: consts.salaoId,
      });

      if (data.error) {
        throw new Error(data.message || 'Usuario ou senha invalidos.');
      }

      const nextSession = {
        token: data.token,
        user: data.user,
        accessType: data.accessType,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      applyToken(data.token);

      return nextSession;
    } finally {
      setLoading(false);
    }
  };

  const registerCliente = async ({ cliente }) => {
    setLoading(true);

    try {
      const { data } = await api.post('/auth/cliente/register', {
        cliente,
        salaoId: consts.salaoId,
      });

      if (data.error) {
        throw new Error(data.message || 'Nao foi possivel criar sua conta.');
      }

      const nextSession = {
        token: data.token,
        user: data.user,
        accessType: data.accessType,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      applyToken(data.token);

      return nextSession;
    } finally {
      setLoading(false);
    }
  };

  const requestClientePasswordCode = async ({ email }) => {
    setLoading(true);

    try {
      const { data } = await api.post('/auth/cliente/password-code', {
        email,
      });

      if (data.error) {
        throw new Error(data.message || 'Nao foi possivel enviar o codigo.');
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const resetClientePassword = async ({ email, codigo, novaSenha }) => {
    setLoading(true);

    try {
      const { data } = await api.post('/auth/cliente/reset-password', {
        email,
        codigo,
        novaSenha,
      });

      if (data.error) {
        throw new Error(data.message || 'Nao foi possivel atualizar a senha.');
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    applyToken(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      accessType: session?.accessType || null,
      authenticated: Boolean(session?.token),
      loading,
      login,
      registerCliente,
      requestClientePasswordCode,
      resetClientePassword,
      logout,
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
