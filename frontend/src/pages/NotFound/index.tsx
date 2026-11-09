import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, TreePine } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(54, 90, 64, 0.08)',
          color: 'var(--forest-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          border: '1px solid rgba(54, 90, 64, 0.2)',
        }}
      >
        <Compass size={40} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-editorial)',
          fontSize: '2.6rem',
          color: 'var(--text-primary)',
          marginBottom: '0.6rem',
        }}
      >
        Trail Not Found
      </h1>
      <p
        style={{
          maxWidth: '460px',
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          fontSize: '1rem',
          lineHeight: 1.6,
        }}
      >
        The page you are looking for does not exist or has been moved. Let’s get you back to your campus sustainability hub.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="secondary" onClick={() => navigate('/')} icon={<TreePine size={16} />}>
          Canopy Home
        </Button>
        <Button variant="primary" onClick={() => navigate('/overview')} icon={<ArrowLeft size={16} />}>
          Campus Overview
        </Button>
      </div>
    </div>
  );
};
