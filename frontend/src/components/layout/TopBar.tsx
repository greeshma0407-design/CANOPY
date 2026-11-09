import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Calendar } from 'lucide-react';
import { ReportingPeriod } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onToggleMobile: () => void;
  reportingPeriods: ReportingPeriod[];
  selectedPeriodId: string;
  onSelectPeriod: (id: string) => void;
  pageTitle?: string;
  campusName?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleMobile,
  reportingPeriods,
  selectedPeriodId,
  onSelectPeriod,
  pageTitle = 'Overview',
  campusName
}) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.full_name || 'Campus Administrator';
  const displayRole = (role || 'ADMIN').replace(/_/g, ' ');
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CA';

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 900
      }}
    >
      {/* Left: Mobile hamburger & Greeting / Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button
          onClick={onToggleMobile}
          className="mobile-hamburger-btn"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '0.4rem'
          }}
          aria-label="Toggle Navigation"
        >
          <Menu size={22} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: '1.25rem',
                fontWeight: 400,
                color: 'var(--text-primary)'
              }}
            >
              {campusName || 'Campus Workspace'}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--forest-green-subtle)',
                color: 'var(--forest-green)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--forest-green)'
                }}
              />
              Active Session
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            {pageTitle}
          </div>
        </div>
      </div>

      {/* Right Controls: Reporting Period Selector, User Profile & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Reporting Period Selector */}
        {reportingPeriods && reportingPeriods.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--card-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.35rem 0.75rem',
            }}
          >
            <Calendar size={14} color="var(--forest-green)" />
            <select
              value={selectedPeriodId}
              onChange={(e) => onSelectPeriod(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
              }}
              aria-label="Select Reporting Period"
            >
              {reportingPeriods.map((period) => (
                <option key={period.id} value={period.id} style={{ color: '#2B2D42', background: '#FFFFFF' }}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* User Profile Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--forest-green)',
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.03em'
            }}
            title={displayName}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {displayName}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {displayRole}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.5rem',
            transition: 'all var(--transition-fast)'
          }}
          title="Sign Out"
          aria-label="Sign Out"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-danger)';
            e.currentTarget.style.borderColor = 'rgba(181, 74, 59, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
