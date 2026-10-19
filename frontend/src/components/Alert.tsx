import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  type?: 'danger' | 'warning' | 'success' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={20} aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle size={20} aria-hidden="true" />;
      case 'success':
        return <CheckCircle2 size={20} aria-hidden="true" />;
      default:
        return <Info size={20} aria-hidden="true" />;
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`alert alert-${type}`}
      style={{ position: 'relative' }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{getIcon()}</div>
      <div style={{ flex: 1 }}>
        {title && <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{title}</strong>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm"
          style={{ minWidth: '32px', minHeight: '32px', padding: '4px', border: 'none' }}
          aria-label="Cerrar notificación"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
