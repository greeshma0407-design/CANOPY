import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 2rem',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(165, 181, 139, 0.1)',
          color: 'var(--sage)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}
      >
        <Compass size={36} />
      </div>

      <h1 style={{ fontFamily: 'var(--font-editorial)', fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        404 — Canopy Path Not Found
      </h1>
      <p style={{ maxWidth: '420px', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        The carbon management trail you requested could not be located on this campus server.
      </p>

      <Button variant="primary" onClick={() => navigate('/overview')} icon={<Home size={16} />}>
        Return to Overview
      </Button>
    </div>
  );
};
