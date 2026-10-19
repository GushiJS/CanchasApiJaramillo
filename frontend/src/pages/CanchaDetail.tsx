import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { canchasService } from '../services/canchasService';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  DollarSign,
  Activity,
  Edit,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export const CanchaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  const canchaId = Number(id);

  const {
    data: cancha,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['cancha', canchaId],
    queryFn: () => canchasService.getCanchaById(canchaId),
    enabled: !isNaN(canchaId),
  });

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="card skeleton" style={{ height: '300px' }}></div>
      </div>
    );
  }

  if (isError || !cancha) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
          <AlertTriangle size={48} color="var(--color-danger)" style={{ margin: '0 auto 1rem' }} aria-hidden="true" />
          <h1>Cancha no encontrada</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {(error as { message?: string })?.message || 'La cancha solicitada no existe o fue retirada del sistema.'}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/canchas')}>
            Volver al Listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
      <Link to="/canchas" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Volver al Listado de Canchas</span>
      </Link>

      <article className="card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
        <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', margin: 0, color: 'var(--color-primary)' }}>
              Cancha Deportiva #{cancha.numero}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, marginTop: '0.25rem' }}>
              Identificador único de recurso: #{cancha.id}
            </p>
          </div>

          <div>
            <span className={`badge ${cancha.estado === 'Disponible' ? 'badge-disponible' : cancha.estado === 'Mantenimiento' ? 'badge-mantenimiento' : 'badge-fuera'}`} style={{ fontSize: '0.95rem', padding: '0.35rem 1rem' }}>
              <Activity size={16} aria-hidden="true" />
              <span>{cancha.estado}</span>
            </span>
          </div>
        </header>

        <section aria-label="Información técnica de la cancha" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }}>
              <MapPin size={22} aria-hidden="true" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Sede</strong>
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{cancha.sedeNombre}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', background: '#e0f2fe', color: '#0284c7', borderRadius: 'var(--radius-sm)' }}>
              <Tag size={22} aria-hidden="true" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Superficie / Tipo</strong>
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{cancha.tipoCanchaNombre}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', background: '#dcfce7', color: '#15803d', borderRadius: 'var(--radius-sm)' }}>
              <DollarSign size={22} aria-hidden="true" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Tarifa por Hora</strong>
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                ${cancha.precioPorHora?.toLocaleString('es-CL')} CLP
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', background: '#fef3c7', color: '#b45309', borderRadius: 'var(--radius-sm)' }}>
              <Clock size={22} aria-hidden="true" />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Disponibilidad</strong>
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Bloques de 60 minutos</span>
            </div>
          </div>
        </section>

        {/* Action Controls */}
        <footer style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          {isAdmin && (
            <Link to={`/canchas/${cancha.id}/editar`} className="btn btn-primary" style={{ minHeight: '44px' }}>
              <Edit size={18} aria-hidden="true" />
              <span>Editar Información de Cancha</span>
            </Link>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => alert(`Reserva simulada para la Cancha #${cancha.numero}. En la API se procesa mediante POST /api/v1/reservas.`)}
              style={{ minHeight: '44px' }}
            >
              <Calendar size={18} aria-hidden="true" />
              <span>Solicitar Reserva</span>
            </button>
          ) : (
            <Link to="/login" className="btn btn-secondary" style={{ minHeight: '44px' }}>
              <span>Inicie sesión para reservar esta cancha</span>
            </Link>
          )}
        </footer>
      </article>
    </div>
  );
};
