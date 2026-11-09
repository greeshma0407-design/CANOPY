import React from 'react';
import { Sprout } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sprout,
  title,
  description,
  action,
  style
}) => {
  return (
    <div
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--forest-green-subtle)',
        ...style
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--white)',
          color: 'var(--forest-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Icon size={26} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.4rem', fontWeight: 400 }}>
        {title}
      </h3>
      <p style={{ maxWidth: '440px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: action ? '1.25rem' : 0, lineHeight: 1.5 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
