import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  Sliders,
  BarChart3,
  Lightbulb,
  FileText,
  Settings,
  X,
  MapPin
} from 'lucide-react';
import { CanopyLogo, CampusTreeIllustration } from '../../assets/BotanicalIcons';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { path: '/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/calculator', label: 'Carbon Calculator', icon: Calculator },
  { path: '/simulator', label: 'What-If Simulator', icon: Sliders },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 998
          }}
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
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
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)'
                }}
              >
                Canopy
              </span>
            </div>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--sage)',
                fontStyle: 'italic',
                marginTop: '0.35rem',
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
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              padding: '0.4rem 0.75rem 0.6rem 0.75rem'
            }}
          >
            Campus Navigation
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
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--card-elevated)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--sage)' : '3px solid transparent',
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

        {/* Bottom Campus Illustration & Status Indicator */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'rgba(16, 20, 16, 0.4)'
          }}
        >
          <CampusTreeIllustration />

          <div
            style={{
              marginTop: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--card-primary)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <MapPin size={14} color="var(--sage)" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  MLRIT Hyderabad
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  3,400 Campus Pop.
                </div>
              </div>
            </div>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
                boxShadow: '0 0 6px rgba(78, 135, 82, 0.7)'
              }}
              title="Campus Node Active"
            />
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          aside.sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          aside.sidebar.mobile-open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};
