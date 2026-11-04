import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { CanopyLogo } from '../../assets/BotanicalIcons';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-main)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ animation: 'pulse 1.8s infinite ease-in-out' }}>
          <CanopyLogo size={48} />
        </div>
        <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', color: 'var(--sage)' }}>
          Canopy Carbon Platform
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Verifying session credentials…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '520px',
          margin: '0 auto',
        }}
      >
        <ShieldAlert size={48} color="var(--ochre)" />
        <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.6rem', color: 'var(--text-primary)' }}>
          Restricted Platform Access
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Your current account role (<strong>{role}</strong>) does not have authorization to view this section.
          Contact your campus system administrator to request elevated permissions.
        </p>
        <div style={{ marginTop: '0.5rem' }}>
          <Button variant="primary" onClick={() => window.location.href = '/overview'}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : null;
};
