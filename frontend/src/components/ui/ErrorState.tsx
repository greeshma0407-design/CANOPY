import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Calculation Unavailable',
  description,
  onRetry
}) => {
  return (
    <div
      style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(192, 87, 70, 0.4)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'rgba(192, 87, 70, 0.08)'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(192, 87, 70, 0.2)',
          color: '#FFAAA0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.85rem'
        }}
      >
        <AlertTriangle size={24} />
      </div>
      <h3 style={{ fontSize: '1.1rem', color: '#FFAAA0', marginBottom: '0.35rem' }}>
        {title}
      </h3>
      <p style={{ maxWidth: '440px', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: onRetry ? '1.25rem' : 0 }}>
        {description}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} icon={<RefreshCw size={14} />}>
          Try Again
        </Button>
      )}
    </div>
  );
};
