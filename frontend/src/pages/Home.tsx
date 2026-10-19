import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, ShieldCheck, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';

export const Home: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Hero Section */}
      <section
        aria-labelledby="hero-title"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '750px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Plataforma Segura · WCAG 2.2 AA · OWASP Top 10</span>
          </div>

          <h1 id="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 800 }}>
            Gestión y Reserva Inteligente de Canchas Deportivas
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Bienvenido al sistema integral de reservas. Administre canchas, consulte disponibilidad en tiempo real según sedes y superficies, con seguridad de extremo a extremo y navegación 100% accesible.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Link to="/canchas" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.75rem 1.5rem' }}>
              <Calendar size={20} aria-hidden="true" />
              <span>Explorar Canchas</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            {!isAuthenticated ? (
              <Link to="/login" className="btn btn-secondary" style={{ fontSize: '1.05rem', padding: '0.75rem 1.5rem' }}>
                <UserCheck size={20} aria-hidden="true" />
                <span>Ingresar al Sistema</span>
              </Link>
            ) : isAdmin ? (
              <Link to="/canchas/nueva" className="btn btn-secondary" style={{ fontSize: '1.05rem', padding: '0.75rem 1.5rem' }}>
                <span>+ Registrar Cancha (Admin)</span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* Grid of Highlights */}
      <section aria-labelledby="highlights-title" style={{ marginBottom: '2rem' }}>
        <h2 id="highlights-title" style={{ marginBottom: '1.5rem' }}>
          Características del Sistema
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Card 1 */}
          <div className="card">
            <div style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
              <Calendar size={32} aria-hidden="true" />
            </div>
            <h3>Operaciones CRUD Completas</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Gestión total del recurso principal Canchas (listar con filtros, consultar detalle, crear, modificar y eliminar con confirmación) y recursos vinculados (Sedes y Tipos de Cancha).
            </p>
          </div>

          {/* Card 2 */}
          <div className="card">
            <div style={{ color: '#0284c7', marginBottom: '0.75rem' }}>
              <ShieldCheck size={32} aria-hidden="true" />
            </div>
            <h3>Seguridad y Autorización RBAC</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Autenticación JWT, tokens Bearer en interceptores, rutas protegidas por roles (Administrador y Cliente), bloqueo en backend con 403 Forbidden y Rate Limiting contra ataques de fuerza bruta.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card">
            <div style={{ color: '#16a34a', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={32} aria-hidden="true" />
            </div>
            <h3>Accesibilidad WCAG 2.2 AA</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Navegación 100% por teclado, foco visible reforzado, landmarks semánticos, contraste de color verificado (&gt; 4.5:1), controles táctiles de 44×44px y diseño adaptable desde 320px.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Credentials Alert */}
      <section aria-labelledby="demo-title">
        <div className="card" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <h2 id="demo-title" style={{ fontSize: '1.2rem', color: '#166534', marginBottom: '0.5rem' }}>
            ℹ️ Cuentas para Demostración en Vivo
          </h2>
          <p style={{ color: '#15803d', marginBottom: '0.75rem' }}>
            Puede iniciar sesión con cualquiera de los siguientes perfiles para comprobar la restricción de rutas y acciones:
          </p>
          <ul style={{ paddingLeft: '1.25rem', color: '#166534', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li><strong>Administrador:</strong> <code>admin@canchas.com</code> / Clave: <code>Admin123!</code> (Acceso completo a crear, editar y eliminar)</li>
            <li><strong>Cliente:</strong> <code>cliente@canchas.com</code> / Clave: <code>Cliente123!</code> (Solo lectura y reserva, bloqueado ante acciones administrativas con 403)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
