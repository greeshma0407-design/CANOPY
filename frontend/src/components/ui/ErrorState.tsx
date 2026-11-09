import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  style?: React.CSSProperties;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Information Unavailable',
  description = "We couldn't load your campus information right now. Please try again.",
  onRetry,
  style
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
        border: '1px solid rgba(181, 74, 59, 0.2)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'rgba(181, 74, 59, 0.04)',
        ...style
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(181, 74, 59, 0.1)',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.85rem'
        }}
      >
        <AlertCircle size={24} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 400 }}>
        {title}
      </h3>
      <p style={{ maxWidth: '440px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: onRetry ? '1.25rem' : 0 }}>
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
