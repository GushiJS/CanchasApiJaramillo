import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { canchasService } from '../services/canchasService';
import { sedesService } from '../services/sedesService';
import { tipoCanchasService } from '../services/tipoCanchasService';
import { canchaSchema, CanchaFormData } from '../schemas/canchaSchema';
import { Alert } from '../components/Alert';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { ApiError } from '../types';

export const CanchaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const canchaId = Number(id);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  // Consultar recursos relacionados para poblar selectores
  const { data: sedes = [], isLoading: loadingSedes } = useQuery({
    queryKey: ['sedes'],
    queryFn: sedesService.getSedes,
  });

  const { data: tiposCancha = [], isLoading: loadingTipos } = useQuery({
    queryKey: ['tiposCancha'],
    queryFn: tipoCanchasService.getTiposCancha,
  });

  // Consultar datos de la cancha en modo edición
  const { data: existingCancha, isLoading: loadingCancha } = useQuery({
    queryKey: ['cancha', canchaId],
    queryFn: () => canchasService.getCanchaById(canchaId),
    enabled: isEditing && !isNaN(canchaId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CanchaFormData>({
    resolver: zodResolver(canchaSchema) as any,
    defaultValues: {
      numero: 1,
      sedeId: 1,
      tipoCanchaId: 1,
      estado: 'Disponible',
    },
  });

  // Prellenar campos al editar
  useEffect(() => {
    if (existingCancha) {
      reset({
        numero: existingCancha.numero,
        sedeId: existingCancha.sedeId,
        tipoCanchaId: existingCancha.tipoCanchaId,
        estado: existingCancha.estado,
      });
    }
  }, [existingCancha, reset]);

  // Mutación de creación / edición
  const mutation = useMutation({
    mutationFn: async (data: CanchaFormData) => {
      if (isEditing) {
        await canchasService.updateCancha(canchaId, data);
      } else {
        await canchasService.createCancha(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canchas'] });
      queryClient.invalidateQueries({ queryKey: ['cancha', canchaId] });
      navigate('/canchas');
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      setServerError(error.message || 'Error al guardar la información de la cancha.');
    },
  });

  const onSubmit = (data: CanchaFormData) => {
    setServerError(null);
    mutation.mutate(data);
  };

  const isLoadingData = (isEditing && loadingCancha) || loadingSedes || loadingTipos;

  if (isLoadingData) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="card skeleton" style={{ height: '350px', maxWidth: '600px', margin: '0 auto' }}></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '650px', padding: '2rem 1rem' }}>
      <Link to="/canchas" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Cancelar y Volver</span>
      </Link>

      <div className="card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 id="cancha-form-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            {isEditing ? `Editar Cancha #${existingCancha?.numero}` : 'Registrar Nueva Cancha'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            {isEditing
              ? 'Modifique los atributos de la cancha y guarde los cambios.'
              : 'Complete el formulario con la información de la nueva cancha.'}
          </p>
        </header>

        {serverError && (
          <Alert type="danger" title="Error devuelto por la API" onClose={() => setServerError(null)}>
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby="cancha-form-title">
          {/* Número de cancha */}
          <div className="form-group">
            <label htmlFor="numero" className="form-label">
              Número de Cancha <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              id="numero"
              type="number"
              min="1"
              max="999"
              className={`form-control ${errors.numero ? 'is-invalid' : ''}`}
              placeholder="Ej. 1"
              aria-required="true"
              aria-invalid={errors.numero ? 'true' : 'false'}
              aria-describedby={errors.numero ? 'numero-error' : 'numero-hint'}
              {...register('numero')}
            />
            <span id="numero-hint" className="form-hint">
              Número correlativo o identificador de la cancha en el recinto.
            </span>
            {errors.numero && (
              <span id="numero-error" role="alert" className="form-error">
                <AlertCircle size={16} aria-hidden="true" />
                {errors.numero.message}
              </span>
            )}
          </div>

          {/* Sede (Recurso relacionado) */}
          <div className="form-group">
            <label htmlFor="sedeId" className="form-label">
              Sede / Recinto <span className="required" aria-hidden="true">*</span>
            </label>
            <select
              id="sedeId"
              className={`form-control ${errors.sedeId ? 'is-invalid' : ''}`}
              aria-required="true"
              aria-invalid={errors.sedeId ? 'true' : 'false'}
              aria-describedby={errors.sedeId ? 'sedeId-error' : undefined}
              {...register('sedeId')}
            >
              <option value="">-- Seleccione una Sede --</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.direccion})
                </option>
              ))}
            </select>
            {errors.sedeId && (
              <span id="sedeId-error" role="alert" className="form-error">
                <AlertCircle size={16} aria-hidden="true" />
                {errors.sedeId.message}
              </span>
            )}
          </div>

          {/* Tipo de Cancha (Recurso relacionado) */}
          <div className="form-group">
            <label htmlFor="tipoCanchaId" className="form-label">
              Tipo de Cancha / Superficie <span className="required" aria-hidden="true">*</span>
            </label>
            <select
              id="tipoCanchaId"
              className={`form-control ${errors.tipoCanchaId ? 'is-invalid' : ''}`}
              aria-required="true"
              aria-invalid={errors.tipoCanchaId ? 'true' : 'false'}
              aria-describedby={errors.tipoCanchaId ? 'tipoCanchaId-error' : undefined}
              {...register('tipoCanchaId')}
            >
              <option value="">-- Seleccione Tipo de Cancha --</option>
              {tiposCancha.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} — ${t.precioPorHora?.toLocaleString('es-CL')} / hr
                </option>
              ))}
            </select>
            {errors.tipoCanchaId && (
              <span id="tipoCanchaId-error" role="alert" className="form-error">
                <AlertCircle size={16} aria-hidden="true" />
                {errors.tipoCanchaId.message}
              </span>
            )}
          </div>

          {/* Estado de disponibilidad */}
          <div className="form-group">
            <label htmlFor="estado" className="form-label">
              Estado Operativo <span className="required" aria-hidden="true">*</span>
            </label>
            <select
              id="estado"
              className={`form-control ${errors.estado ? 'is-invalid' : ''}`}
              aria-required="true"
              aria-invalid={errors.estado ? 'true' : 'false'}
              aria-describedby={errors.estado ? 'estado-error' : undefined}
              {...register('estado')}
            >
              <option value="Disponible">Disponible</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Fuera de servicio">Fuera de servicio</option>
            </select>
            {errors.estado && (
              <span id="estado-error" role="alert" className="form-error">
                <AlertCircle size={16} aria-hidden="true" />
                {errors.estado.message}
              </span>
            )}
          </div>

          {/* Submission Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <Link to="/canchas" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || mutation.isPending}
            >
              <Save size={18} aria-hidden="true" />
              <span>{mutation.isPending ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Cancha'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
