export type UserRole = 'Administrador' | 'Trabajador' | 'Cliente';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  fechaCreacion?: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  email: string;
  password: string;
  rol?: UserRole;
}

export type CanchaEstado = 'Disponible' | 'Mantenimiento' | 'Fuera de servicio';

export interface Cancha {
  id: number;
  numero: number;
  sedeId: number;
  sedeNombre: string;
  tipoCanchaId: number;
  tipoCanchaNombre: string;
  precioPorHora: number;
  estado: CanchaEstado;
}

export interface CrearCanchaDTO {
  numero: number;
  sedeId: number;
  tipoCanchaId: number;
  estado: CanchaEstado;
}

export interface EditarCanchaDTO {
  numero: number;
  sedeId: number;
  tipoCanchaId: number;
  estado: CanchaEstado;
}

export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
}

export interface TipoCancha {
  id: number;
  nombre: string;
  descripcion?: string;
  precioPorHora: number;
}

export interface CanchasFilter {
  sedeId?: number;
  tipoCanchaId?: number;
  estado?: string;
  search?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
