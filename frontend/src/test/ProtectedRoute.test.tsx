import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { RoleGuard } from '../routes/RoleGuard';

describe('Protección de Rutas y Control de Acceso (RBAC)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('debe redirigir a /login cuando un usuario no autenticado intenta acceder a una ruta protegida', () => {
    render(
      <MemoryRouter initialEntries={['/privado']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Página de Login</div>} />
            <Route
              path="/privado"
              element={
                <ProtectedRoute>
                  <div>Contenido Privado</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Página de Login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Privado')).not.toBeInTheDocument();
  });

  it('debe permitir acceso al contenido cuando el usuario está autenticado', () => {
    sessionStorage.setItem('auth_token', 'test-token');
    sessionStorage.setItem(
      'auth_user',
      JSON.stringify({ id: 1, nombre: 'Juan', email: 'juan@test.com', rol: 'Cliente' })
    );

    render(
      <MemoryRouter initialEntries={['/privado']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/privado"
              element={
                <ProtectedRoute>
                  <div>Contenido Privado Visible</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenido Privado Visible')).toBeInTheDocument();
  });

  it('debe redirigir a /403 cuando un Cliente intenta acceder a una ruta de Administrador', () => {
    sessionStorage.setItem('auth_token', 'test-token');
    sessionStorage.setItem(
      'auth_user',
      JSON.stringify({ id: 2, nombre: 'Cliente Test', email: 'cliente@test.com', rol: 'Cliente' })
    );

    render(
      <MemoryRouter initialEntries={['/admin-only']}>
        <AuthProvider>
          <Routes>
            <Route path="/403" element={<div>403 Acceso Denegado</div>} />
            <Route
              path="/admin-only"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['Administrador']}>
                    <div>Panel Administrativo Secreto</div>
                  </RoleGuard>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('403 Acceso Denegado')).toBeInTheDocument();
    expect(screen.queryByText('Panel Administrativo Secreto')).not.toBeInTheDocument();
  });
});
