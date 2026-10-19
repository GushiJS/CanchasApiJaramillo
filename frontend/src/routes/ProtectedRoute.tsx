import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-container" role="status" aria-live="polite">
        <div className="spinner" aria-label="Cargando autenticación..."></div>
        <p className="sr-only">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirige al login guardando la ruta de origen para volver tras autenticarse
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
