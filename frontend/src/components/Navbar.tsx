import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogIn, LogOut, PlusCircle, Shield, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header" style={{
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '64px',
        padding: '0.5rem 1rem'
      }}>
        {/* Brand / Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'var(--color-primary)',
            fontWeight: 800,
            fontSize: '1.25rem'
          }}
          aria-label="CanchasApi - Inicio"
        >
          <span style={{
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            fontSize: '1.1rem'
          }}>⚽</span>
          <span>Canchas<span style={{ color: 'var(--color-text)' }}>App</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Navegación principal"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.5rem',
          }}
          className="desktop-nav"
        >
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontWeight: 600,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
            })}
          >
            Inicio
          </NavLink>

          <NavLink
            to="/canchas"
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontWeight: 600,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
            })}
          >
            Canchas
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/canchas/nueva"
              style={({ isActive }) => ({
                textDecoration: 'none',
                fontWeight: 600,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
              })}
            >
              <PlusCircle size={18} aria-hidden="true" />
              <span>Nueva Cancha</span>
            </NavLink>
          )}

          {/* User Status / Auth Actions */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
              <span
                className={`badge ${isAdmin ? 'badge-admin' : 'badge-cliente'}`}
                title={`Conectado como ${user.rol}`}
              >
                {isAdmin ? <Shield size={14} aria-hidden="true" /> : <User size={14} aria-hidden="true" />}
                <span>{user.nombre} ({user.rol})</span>
              </span>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                aria-label="Cerrar sesión de usuario"
              >
                <LogOut size={16} aria-hidden="true" />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary btn-sm"
              style={{ marginLeft: '1rem' }}
            >
              <LogIn size={16} aria-hidden="true" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button (Accessible >= 44x44px) */}
        <button
          type="button"
          className="btn btn-secondary mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Menú móvil"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <Link
            to="/"
            onClick={closeMenu}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            Inicio
          </Link>
          <Link
            to="/canchas"
            onClick={closeMenu}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            Canchas Disponibles
          </Link>

          {isAdmin && (
            <Link
              to="/canchas/nueva"
              onClick={closeMenu}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start' }}
            >
              <PlusCircle size={18} aria-hidden="true" />
              <span>Registrar Nueva Cancha</span>
            </Link>
          )}

          {isAuthenticated && user ? (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ padding: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Sesión: <strong>{user.nombre}</strong> ({user.rol})
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LogOut size={18} aria-hidden="true" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="btn btn-primary"
              style={{ justifyContent: 'center' }}
            >
              <LogIn size={18} aria-hidden="true" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </nav>
      )}

      <style>{`
        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
