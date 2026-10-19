import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

describe('Componente Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('debe renderizar el formulario con campos de correo y contraseña accesibles', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar al sistema/i })).toBeInTheDocument();
  });

  it('debe validar en cliente formato de correo electrónico inválido', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitBtn = screen.getByRole('button', { name: /entrar al sistema/i });

    fireEvent.change(emailInput, { target: { value: 'correo-invalido' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/formato de correo electrónico válido/i)).toBeInTheDocument();
    });
  });

  it('debe llamar al servicio de autenticación y almacenar token al ingresar credenciales válidas', async () => {
    const mockAuthResponse = {
      token: 'jwt-token-valido-123',
      usuario: {
        id: 1,
        nombre: 'Administrador General',
        email: 'admin@canchas.com',
        rol: 'Administrador' as const,
      },
    };

    vi.mocked(authService.login).mockResolvedValueOnce(mockAuthResponse);

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /entrar al sistema/i });

    fireEvent.change(emailInput, { target: { value: 'admin@canchas.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Admin123!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'admin@canchas.com',
        password: 'Admin123!',
      });
      expect(sessionStorage.getItem('auth_token')).toBe('jwt-token-valido-123');
    });
  });
});
