import { z } from 'zod';

export const canchaSchema = z.object({
  numero: z.coerce
    .number()
    .int('El número debe ser un número entero')
    .min(1, 'El número de cancha debe ser mayor o igual a 1')
    .max(999, 'El número no puede ser superior a 999'),
  sedeId: z.coerce
    .number()
    .int()
    .min(1, 'Debe seleccionar una sede'),
  tipoCanchaId: z.coerce
    .number()
    .int()
    .min(1, 'Debe seleccionar un tipo de cancha'),
  estado: z.enum(['Disponible', 'Mantenimiento', 'Fuera de servicio']),
});

export type CanchaFormData = z.infer<typeof canchaSchema>;
