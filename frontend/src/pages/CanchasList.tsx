import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { canchasService } from '../services/canchasService';
import { sedesService } from '../services/sedesService';
import { tipoCanchasService } from '../services/tipoCanchasService';
import { useAuth } from '../context/AuthContext';
import { Cancha, CanchaEstado } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { Alert } from '../components/Alert';
import {
  Search,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FilterX,
} from 'lucide-react';

export const CanchasList: React.FC = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Filtros de estado
  const [selectedSede, setSelectedSede] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estado del modal de confirmación de eliminación
  const [canchaToDelete, setCanchaToDelete] = useState<Cancha | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Consulta de canchas con TanStack Query
  const {
    data: canchas = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['canchas', selectedSede, selectedTipo, selectedEstado],
    queryFn: () =>
      canchasService.getCanchas({
        sedeId: selectedSede ? Number(selectedSede) : undefined,
        tipoCanchaId: selectedTipo ? Number(selectedTipo) : undefined,
        estado: selectedEstado || undefined,
      }),
  });

  // Consultas de recursos relacionados para filtros
  const { data: sedes = [] } = useQuery({
    queryKey: ['sedes'],
    queryFn: sedesService.getSedes,
  });

  const { data: tiposCancha = [] } = useQuery({
    queryKey: ['tiposCancha'],
    queryFn: tipoCanchasService.getTiposCancha,
  });

  // Mutación de eliminación
  const deleteMutation = useMutation({
    mutationFn: (id: number) => canchasService.deleteCancha(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canchas'] });
      setActionSuccess(`La cancha #${canchaToDelete?.numero} fue eliminada exitosamente.`);
      setCanchaToDelete(null);
    },
    onError: (err: { message?: string }) => {
      setActionError(err.message || 'No fue posible eliminar la cancha.');
      setCanchaToDelete(null);
    },
  });

  // Filtrado local por término de búsqueda (número o nombre de tipo/sede)
  const filteredCanchas = useMemo(() => {
    if (!searchTerm.trim()) return canchas;
    const term = searchTerm.toLowerCase();
    return canchas.filter(
      (c) =>
        c.numero.toString().includes(term) ||
        c.sedeNombre?.toLowerCase().includes(term) ||
        c.tipoCanchaNombre?.toLowerCase().includes(term)
    );
  }, [canchas, searchTerm]);

  const handleResetFilters = () => {
    setSelectedSede('');
    setSelectedTipo('');
    setSelectedEstado('');
    setSearchTerm('');
  };

  const getStatusBadge = (estado: CanchaEstado) => {
    switch (estado) {
      case 'Disponible':
        return (
          <span className="badge badge-disponible">
            <CheckCircle size={14} aria-hidden="true" />
            <span>Disponible</span>
          </span>
        );
      case 'Mantenimiento':
        return (
          <span className="badge badge-mantenimiento">
            <AlertTriangle size={14} aria-hidden="true" />
            <span>Mantenimiento</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-fuera">
            <XCircle size={14} aria-hidden="true" />
            <span>Fuera de servicio</span>
          </span>
        );
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Listado de Canchas Deportivas</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            Explore y gestione las canchas disponibles, filtradas por sede y tipo de superficie.
          </p>
        </div>

        {isAdmin && (
          <Link to="/canchas/nueva" className="btn btn-primary">
            <PlusCircle size={20} aria-hidden="true" />
            <span>Registrar Nueva Cancha</span>
          </Link>
        )}
      </div>

      {actionSuccess && (
        <Alert type="success" title="Operación Exitosa" onClose={() => setActionSuccess(null)}>
          {actionSuccess}
        </Alert>
      )}

      {actionError && (
        <Alert type="danger" title="Error" onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {/* Filters Section */}
      <section
        aria-label="Filtros de canchas"
        className="card"
        style={{ marginBottom: '1.5rem', padding: '1.25rem' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          {/* Search Input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="filter-search" className="form-label">
              Buscar por texto / número
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="filter-search"
                type="text"
                className="form-control"
                placeholder="Ej. Cancha 1, Pádel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search
                size={18}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
            </div>
          </div>

          {/* Sede Select */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="filter-sede" className="form-label">
              Filtrar por Sede
            </label>
            <select
              id="filter-sede"
              className="form-control"
              value={selectedSede}
              onChange={(e) => setSelectedSede(e.target.value)}
            >
              <option value="">Todas las Sedes</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo Cancha Select */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="filter-tipo" className="form-label">
              Tipo de Cancha
            </label>
            <select
              id="filter-tipo"
              className="form-control"
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
            >
              <option value="">Todos los Tipos</option>
              {tiposCancha.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado Select */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="filter-estado" className="form-label">
              Estado
            </label>
            <select
              id="filter-estado"
              className="form-control"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
            >
              <option value="">Cualquier Estado</option>
              <option value="Disponible">Disponible</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Fuera de servicio">Fuera de servicio</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {(selectedSede || selectedTipo || selectedEstado || searchTerm) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
              style={{ minHeight: '44px' }}
              aria-label="Limpiar todos los filtros"
            >
              <FilterX size={18} aria-hidden="true" />
              <span>Limpiar Filtros</span>
            </button>
          )}
        </div>
      </section>

      {/* Loading State with Skeletons */}
      {isLoading && (
        <div role="status" aria-live="polite" aria-label="Cargando listado de canchas...">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="card skeleton" style={{ height: '180px' }}></div>
            ))}
          </div>
          <p className="sr-only">Cargando canchas desde el servidor...</p>
        </div>
      )}

      {/* Error State with Retry Button */}
      {isError && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <AlertTriangle size={48} color="var(--color-danger)" aria-hidden="true" style={{ margin: '0 auto 1rem' }} />
          <h2>Error al obtener las canchas</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            {(error as { message?: string })?.message || 'No fue posible conectar con el servicio de canchas.'}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => refetch()}>
            <RefreshCw size={18} aria-hidden="true" />
            <span>Reintentar Conexión</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredCanchas.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
          <h2>No se encontraron canchas</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            No hay canchas que coincidan con los filtros aplicados. Intente seleccionar otra sede o limpiar los filtros.
          </p>
          <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
            Mostrar Todas las Canchas
          </button>
        </div>
      )}

      {/* Results View: Desktop Table + Mobile Cards */}
      {!isLoading && !isError && filteredCanchas.length > 0 && (
        <>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }} aria-live="polite">
            Mostrando <strong>{filteredCanchas.length}</strong> canchas encontradas.
          </p>

          {/* 1. Desktop Table */}
          <div className="desktop-table card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="responsive-table">
              <caption className="sr-only">Listado de canchas disponibles con detalles y opciones de gestión</caption>
              <thead>
                <tr>
                  <th scope="col">Número</th>
                  <th scope="col">Tipo de Cancha</th>
                  <th scope="col">Sede</th>
                  <th scope="col">Precio / Hora</th>
                  <th scope="col">Estado</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCanchas.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                        Cancha #{c.numero}
                      </strong>
                    </td>
                    <td>{c.tipoCanchaNombre}</td>
                    <td>{c.sedeNombre}</td>
                    <td>${c.precioPorHora?.toLocaleString('es-CL')} / hr</td>
                    <td>{getStatusBadge(c.estado)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Link
                          to={`/canchas/${c.id}`}
                          className="btn btn-secondary btn-sm"
                          aria-label={`Ver detalles de Cancha #${c.numero}`}
                        >
                          <Eye size={16} aria-hidden="true" />
                          <span>Ver</span>
                        </Link>

                        {isAdmin && (
                          <>
                            <Link
                              to={`/canchas/${c.id}/editar`}
                              className="btn btn-secondary btn-sm"
                              aria-label={`Editar Cancha #${c.numero}`}
                            >
                              <Edit size={16} aria-hidden="true" />
                              <span>Editar</span>
                            </Link>

                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => setCanchaToDelete(c)}
                              aria-label={`Eliminar Cancha #${c.numero}`}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                              <span>Eliminar</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Mobile Cards Layout */}
          <div className="mobile-cards">
            {filteredCanchas.map((c) => (
              <article key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary)' }}>
                    Cancha #{c.numero}
                  </h2>
                  {getStatusBadge(c.estado)}
                </div>

                <div style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                  <div><strong>Superficie:</strong> {c.tipoCanchaNombre}</div>
                  <div><strong>Sede:</strong> {c.sedeNombre}</div>
                  <div><strong>Tarifa:</strong> ${c.precioPorHora?.toLocaleString('es-CL')} / hora</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <Link
                    to={`/canchas/${c.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, minHeight: '44px' }}
                    aria-label={`Ver detalles de Cancha #${c.numero}`}
                  >
                    <Eye size={16} aria-hidden="true" />
                    <span>Detalle</span>
                  </Link>

                  {isAdmin && (
                    <>
                      <Link
                        to={`/canchas/${c.id}/editar`}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, minHeight: '44px' }}
                        aria-label={`Editar Cancha #${c.numero}`}
                      >
                        <Edit size={16} aria-hidden="true" />
                        <span>Editar</span>
                      </Link>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ minHeight: '44px' }}
                        onClick={() => setCanchaToDelete(c)}
                        aria-label={`Eliminar Cancha #${c.numero}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        <span>Eliminar</span>
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Accessible Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(canchaToDelete)}
        title="Confirmar Eliminación"
        message={`¿Está completamente seguro de eliminar la Cancha #${canchaToDelete?.numero} de la sede ${canchaToDelete?.sedeNombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Cancha"
        cancelText="Conservar Cancha"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (canchaToDelete) {
            deleteMutation.mutate(canchaToDelete.id);
          }
        }}
        onCancel={() => setCanchaToDelete(null)}
      />
    </div>
  );
};
