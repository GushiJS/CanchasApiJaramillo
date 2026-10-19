import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="center-container" role="status" aria-live="polite">
        <div className="spinner" aria-label="Verificando permisos..."></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.rol)) {
    // Redirige a página de acceso denegado (403)
    return <Navigate to="/403" replace />;
  }

  return children;
};
