import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CanchasList } from '../pages/CanchasList';
import { AuthProvider } from '../context/AuthContext';
import { canchasService } from '../services/canchasService';
import { sedesService } from '../services/sedesService';
import { tipoCanchasService } from '../services/tipoCanchasService';
import { Cancha } from '../types';

vi.mock('../services/canchasService');
vi.mock('../services/sedesService');
vi.mock('../services/tipoCanchasService');

const mockCanchas: Cancha[] = [
  {
    id: 1,
    numero: 10,
    sedeId: 1,
    sedeNombre: 'Sede Central',
    tipoCanchaId: 1,
    tipoCanchaNombre: 'Fútbol 7',
    precioPorHora: 25000,
    estado: 'Disponible',
  },
  {
    id: 2,
    numero: 20,
    sedeId: 2,
    sedeNombre: 'Sede Norte',
    tipoCanchaId: 2,
    tipoCanchaNombre: 'Pádel Panorámico',
    precioPorHora: 18000,
    estado: 'Mantenimiento',
  },
];

describe('Componente CanchasList (CRUD)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.mocked(sedesService.getSedes).mockResolvedValue([
      { id: 1, nombre: 'Sede Central', direccion: 'Calle 1' },
      { id: 2, nombre: 'Sede Norte', direccion: 'Calle 2' },
    ]);

    vi.mocked(tipoCanchasService.getTiposCancha).mockResolvedValue([
      { id: 1, nombre: 'Fútbol 7', precioPorHora: 25000 },
      { id: 2, nombre: 'Pádel Panorámico', precioPorHora: 18000 },
    ]);
  });

  it('debe renderizar el listado de canchas obtenidas desde la API', async () => {
    vi.mocked(canchasService.getCanchas).mockResolvedValue(mockCanchas);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CanchasList />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/cancha #10/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/cancha #20/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/sede central/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/disponible/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/mantenimiento/i)[0]).toBeInTheDocument();
    });
  });

  it('debe mostrar estado vacío cuando no hay canchas registradas', async () => {
    vi.mocked(canchasService.getCanchas).mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CanchasList />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/no se encontraron canchas/i)).toBeInTheDocument();
    });
  });
});
