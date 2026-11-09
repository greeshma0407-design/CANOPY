import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  Sliders,
  BarChart3,
  Lightbulb,
  FileText,
  Users,
  Settings,
  X,
  MapPin
} from 'lucide-react';
import { CanopyLogo } from '../../assets/BotanicalIcons';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  campusName?: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  roles?: UserRole[];
}

const allNavItems: NavItem[] = [
  { path: '/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/calculator', label: 'Carbon Calculator', icon: Calculator, roles: ['ADMIN', 'CAMPUS_ADMIN', 'CAMPUS_MANAGER', 'DATA_ENTRY_OPERATOR'] },
  { path: '/simulator', label: 'What-If Simulator', icon: Sliders, roles: ['ADMIN', 'CAMPUS_ADMIN', 'CAMPUS_MANAGER'] },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/recommendations', label: 'Recommendations', icon: Lightbulb, roles: ['ADMIN', 'CAMPUS_ADMIN', 'CAMPUS_MANAGER', 'VIEWER'] },
  { path: '/reports', label: 'Reports', icon: FileText, roles: ['ADMIN', 'CAMPUS_ADMIN', 'CAMPUS_MANAGER', 'VIEWER'] },
  { path: '/users', label: 'User Management', icon: Users, roles: ['ADMIN', 'CAMPUS_ADMIN'] },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile, campusName }) => {
  const { role, user } = useAuth();

  const navItems = allNavItems.filter(item => {
    if (!item.roles) return true;
    return role ? item.roles.includes(role) : true;
  });

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(43, 45, 66, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 998
          }}
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          flexShrink: 0,
          backgroundColor: 'var(--white)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          maxHeight: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 999,
          transition: 'transform var(--transition-normal)',
          transform: mobileOpen ? 'translateX(0)' : undefined
        }}
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Sidebar Brand Header */}
        <div
          style={{
            padding: '1.5rem 1.4rem 1.25rem 1.4rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CanopyLogo size={32} />
              <span
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '1.55rem',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  color: 'var(--forest-green)'
                }}
              >
                Canopy
              </span>
            </div>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--sage)',
                marginTop: '0.3rem',
                letterSpacing: '0.01em'
              }}
            >
              Small shifts. Greener campuses.
            </p>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="mobile-close-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.35rem'
            }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.85rem', overflowY: 'auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.75rem 0.6rem 0.75rem'
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)'
              }}
            >
              Campus Navigation
            </span>
            {role && (
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--forest-green-subtle)',
                  color: 'var(--forest-green)',
                  fontWeight: 600
                }}
              >
                {role.replace('CAMPUS_', '')}
              </span>
            )}
          </div>
          <ul style={{ listStyle: 'none' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.path} style={{ marginBottom: '0.25rem' }}>
                  <NavLink
                    to={item.path}
                    onClick={onCloseMobile}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      color: isActive ? 'var(--forest-green)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--forest-green-subtle)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--forest-green)' : '3px solid transparent',
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: 'none',
                      fontSize: '0.88rem',
                      transition: 'all var(--transition-fast)'
                    })}
                  >
                    <Icon size={18} style={{ opacity: 0.9 }} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Campus Summary */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--card-elevated)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <MapPin size={15} color="var(--forest-green)" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {campusName || 'Canopy Campus'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {user?.email || 'Logged In'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          aside.sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            z-index: 1000;
          }
          aside.sidebar.mobile-open {
            transform: translateX(0) !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};
