import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleGuard } from './routes/RoleGuard';

// Vistas
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { CanchasList } from './pages/CanchasList';
import { CanchaDetail } from './pages/CanchaDetail';
import { CanchaForm } from './pages/CanchaForm';
import { Forbidden } from './pages/Forbidden';
import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutos
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main id="main-content" className="main-content" tabIndex={-1}>
              <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/canchas" element={<CanchasList />} />
                <Route path="/canchas/:id" element={<CanchaDetail />} />

                {/* Rutas Privadas protegidas por Rol Administrador */}
                <Route
                  path="/canchas/nueva"
                  element={
                    <ProtectedRoute>
                      <RoleGuard allowedRoles={['Administrador']}>
                        <CanchaForm />
                      </RoleGuard>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/canchas/:id/editar"
                  element={
                    <ProtectedRoute>
                      <RoleGuard allowedRoles={['Administrador']}>
                        <CanchaForm />
                      </RoleGuard>
                    </ProtectedRoute>
                  }
                />

                {/* Errores y Seguridad */}
                <Route path="/403" element={<Forbidden />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
