import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      role="contentinfo"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: '2rem 1rem',
        marginTop: 'auto',
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
      }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', textAlign: 'center' }}>
        <p style={{ margin: 0 }}>
          <strong>CanchasApi Web</strong> — Evaluación 2: Consumo de APIs RESTful, Seguridad de Extremo a Extremo y Accesibilidad WCAG 2.2 AA.
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>
          Lenguaje Programación Web II · Instituto Profesional Virginio Gómez · Gustavo Jaramillo (2026)
        </p>
      </div>
    </footer>
  );
};
