import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Forbidden: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', maxWidth: '600px' }}>
      <div className="card" style={{ padding: '3rem 2rem' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <ShieldX size={40} aria-hidden="true" />
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-danger)' }}>
          403 — Acceso Denegado
        </h1>

        <p style={{ color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>
          No tiene los permisos requeridos para acceder a esta sección.
        </p>

        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
          Su perfil actual está registrado como <strong>{user?.rol || 'Invitado'}</strong>. Esta vista y sus operaciones
          están restringidas exclusivamente a usuarios con rol <strong>Administrador</strong>, tal como lo exige el control de acceso OWASP API5 (Broken Function Level Authorization).
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Volver a la Página Principal</span>
          </Link>
          <Link to="/canchas" className="btn btn-secondary">
            <span>Ver Canchas Disponibles</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
