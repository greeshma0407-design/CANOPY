import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, LogOut } from 'lucide-react';
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

  const displayName = user?.full_name || 'Dr. Radhika Rao';
  const displayRole = (role || 'ADMIN').replace(/_/g, ' ');
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CR';

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: 'var(--bg-topbar)',
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
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
            >
              Welcome, {displayName} 🌱
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(78, 135, 82, 0.18)',
                color: '#8FD895',
                border: '1px solid rgba(78, 135, 82, 0.4)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#4E8752'
                }}
              />
              {campusName ? `${campusName.split(' ')[0]} · Live` : 'MLRIT · Live'}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Canopy Dashboard &bull; {pageTitle}
          </div>
        </div>
      </div>

      {/* Right Controls: Search, Period Selector, Notifications, User Avatar & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Search bar */}
        <div
          className="topbar-search"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search records, factors, assets..."
            style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.85rem 0.45rem 2.2rem',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              width: '220px',
              outline: 'none',
              transition: 'border-color var(--transition-fast), width var(--transition-fast)'
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--border-focus)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Reporting Period Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <select
            value={selectedPeriodId}
            onChange={(e) => onSelectPeriod(e.target.value)}
            style={{
              backgroundColor: 'var(--card-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 500,
              padding: '0.45rem 0.75rem',
              cursor: 'pointer',
              outline: 'none'
            }}
            title="Select Reporting Period"
          >
            {reportingPeriods.map(p => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notification Bell */}
        <button
          style={{
            position: 'relative',
            background: 'var(--card-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            padding: '0.45rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--ochre)'
            }}
          />
        </button>

        {/* User Profile Avatar & Role */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            paddingLeft: '0.5rem',
            borderLeft: '1px solid var(--border)'
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--olive)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '2px solid var(--sage-dim)'
            }}
          >
            {initials}
          </div>
          <div className="topbar-user-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.1
              }}
            >
              {displayName}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--sage)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              {displayRole}
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'transparent',
              border: '1px solid rgba(165, 181, 139, 0.25)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              padding: '0.4rem 0.65rem',
              fontSize: '0.78rem',
              cursor: 'pointer',
              marginLeft: '0.4rem',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(192, 87, 70, 0.5)';
              (e.currentTarget as HTMLElement).style.color = '#FFAAA0';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(165, 181, 139, 0.25)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
            title="Sign out of Canopy"
          >
            <LogOut size={14} />
            <span className="logout-btn-label">Sign Out</span>
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mobile-hamburger-btn {
            display: block !important;
          }
          .topbar-search {
            display: none !important;
          }
        }
        @media (max-width: 650px) {
          .topbar-user-info {
            display: none !important;
          }
          .logout-btn-label {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
