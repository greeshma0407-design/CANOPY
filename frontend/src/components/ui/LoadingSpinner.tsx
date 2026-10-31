import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Calculating emissions...',
  size = 28
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem',
        color: 'var(--sage)'
      }}
    >
      <Loader2
        size={size}
        style={{
          animation: 'spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite'
        }}
      />
      {label && (
        <span
          style={{
            marginTop: '0.85rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}
        >
          {label}
        </span>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
