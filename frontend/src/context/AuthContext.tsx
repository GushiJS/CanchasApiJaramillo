import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, LoginRequest } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCliente: boolean;
  loading: boolean;
  sessionMessage: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearSessionMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem('auth_token');
  });

  const [user, setUser] = useState<Usuario | null>(() => {
    const savedUser = sessionStorage.getItem('auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser) as Usuario;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    // Escuchar expiración de token emitida desde el interceptor Axios
    const handleAuthExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      setToken(null);
      setUser(null);
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      setSessionMessage(customEvent.detail?.message || 'Su sesión ha expirado.');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setLoading(true);
    setSessionMessage(null);
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.usuario);
      sessionStorage.setItem('auth_token', response.token);
      sessionStorage.setItem('auth_user', JSON.stringify(response.usuario));
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    setSessionMessage(null);
  };

  const clearSessionMessage = () => {
    setSessionMessage(null);
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.rol === 'Administrador';
  const isCliente = user?.rol === 'Cliente';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isCliente,
        loading,
        sessionMessage,
        login,
        logout,
        clearSessionMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
