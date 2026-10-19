import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginSchema, LoginFormData } from '../schemas/authSchema';
import { Alert } from '../components/Alert';
import { LogIn, ShieldAlert, Sparkles } from 'lucide-react';
import { ApiError } from '../types';

export const Login: React.FC = () => {
  const { login, sessionMessage, clearSessionMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirección hacia la página que el usuario intentó visitar, o a /canchas por defecto
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/canchas';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    setSubmitting(true);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.status === 429) {
        setApiError('Límite de intentos excedido (Rate Limit: máx 5 solicitudes por minuto). Por seguridad, intente en 60 segundos.');
      } else if (error.status === 401) {
        setApiError('Credenciales incorrectas. Verifique su correo y contraseña.');
      } else {
        setApiError(error.message || 'Error al iniciar sesión.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <div className="container" style={{ maxWidth: '480px', padding: '2rem 1rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 1rem',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogIn size={28} aria-hidden="true" />
          </div>
          <h1 id="login-heading" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Iniciar Sesión
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Acceda a su cuenta para gestionar y reservar canchas
          </p>
        </div>

        {sessionMessage && (
          <Alert type="warning" title="Sesión Expirada" onClose={clearSessionMessage}>
            {sessionMessage}
          </Alert>
        )}

        {apiError && (
          <Alert type="danger" title="Error de Autenticación" onClose={() => setApiError(null)}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby="login-heading">
          {/* Email input */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Correo Electrónico <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="admin@canchas.com"
              aria-required="true"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <span id="email-error" role="alert" className="form-error">
                <ShieldAlert size={16} aria-hidden="true" />
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password input */}
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Contraseña <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              aria-required="true"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            {errors.password && (
              <span id="password-error" role="alert" className="form-error">
                <ShieldAlert size={16} aria-hidden="true" />
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', fontSize: '1rem' }}
            disabled={submitting}
          >
            {submitting ? 'Autenticando...' : 'Entrar al Sistema'}
          </button>
        </form>

        {/* Quick autofill for live teacher demo */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={16} aria-hidden="true" />
            <span>Autocompletar para Demostración en Vivo:</span>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleFillDemo('admin@canchas.com', 'Admin123!')}
              aria-label="Cargar credenciales de Administrador"
            >
              Admin (Full)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleFillDemo('cliente@canchas.com', 'Cliente123!')}
              aria-label="Cargar credenciales de Cliente"
            >
              Cliente (Básico)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
