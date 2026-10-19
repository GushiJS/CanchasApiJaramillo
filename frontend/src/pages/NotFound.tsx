import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', maxWidth: '550px' }}>
      <div className="card" style={{ padding: '3rem 2rem' }}>
        <HelpCircle size={56} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem' }} aria-hidden="true" />
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>404 — Página no encontrada</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          La ruta solicitada no existe o fue modificada en el enrutador de la aplicación.
        </p>
        <Link to="/" className="btn btn-primary" style={{ margin: '0 auto' }}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </div>
  );
};
