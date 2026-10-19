import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingrese un formato de correo electrónico válido (ej. usuario@ejemplo.com)'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede superar los 100 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
