import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Building2,
  UserPlus,
  KeyRound,
  X,
  TreePine
} from 'lucide-react';
import { CanopyLogo } from '../../assets/BotanicalIcons';
import { useAuth } from '../../context/AuthContext';
import { ApiError, canopyApi } from '../../utils/apiClient';
import { NATURE_IMAGES } from '../../data/images';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // If already authenticated, redirect to overview or intended target
  if (isAuthenticated) {
    const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/overview';
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your institutional email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({
        email: cleanEmail,
        password,
        remember_me: rememberMe,
      });
      const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/overview';
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr?.status === 401) {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
      } else if (apiErr?.status === 403) {
        setErrorMsg(apiErr.message || 'Account has been deactivated. Please contact an administrator.');
      } else {
        setErrorMsg(apiErr?.message || "We couldn't connect right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsForgotLoading(true);
    setForgotStatus(null);
    try {
      const res = await canopyApi.forgotPassword(forgotEmail.trim());
      setForgotStatus(res.message);
    } catch {
      setForgotStatus(
        'If an account exists for this address, password recovery instructions have been dispatched. For immediate assistance, your campus administrator can reset your password directly.'
      );
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--warm-ivory)',
        color: 'var(--charcoal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1020px',
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: '620px'
        }}
        className="auth-split-card"
      >
        {/* Left: Nature Photograph Split Panel */}
        <div
          style={{
            position: 'relative',
            backgroundImage: `linear-gradient(rgba(43, 45, 66, 0.45), rgba(54, 90, 64, 0.7)), url(${NATURE_IMAGES.authCover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '3rem 2.5rem',
            color: 'var(--white)'
          }}
          className="auth-image-panel"
        >
          {/* Top Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
              color: 'var(--white)',
              zIndex: 1
            }}
          >
            <CanopyLogo size={32} />
            <span
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: '1.6rem',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: 'var(--white)'
              }}
            >
              Canopy
            </span>
          </Link>

          {/* Bottom Quote / Mission */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(6px)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: '1rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              <TreePine size={13} />
              Educational Sustainability
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: '2rem',
                lineHeight: 1.25,
                fontWeight: 400,
                color: 'var(--white)',
                marginBottom: '0.75rem'
              }}
            >
              Small shifts.<br />Greener campuses.
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Standardized environmental accounting and decarbonization intelligence for colleges and universities.
            </p>
          </div>
        </div>

        {/* Right: Login Form */}
        <div
          style={{
            padding: '3.5rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--white)'
          }}
          className="auth-form-panel"
        >
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: '1.85rem',
                fontWeight: 400,
                color: 'var(--charcoal)',
                marginBottom: '0.35rem'
              }}
            >
              Sign In
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Access your institution's carbon accounting workspace.
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid rgba(181, 74, 59, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                color: 'var(--color-danger)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="email" className="form-label">
                Institutional Email Address
              </label>
              <div className="input-wrapper">
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@college.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="password" className="form-label" style={{ margin: 0 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--forest-green)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-wrapper">
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    accentColor: 'var(--forest-green)',
                    width: '15px',
                    height: '15px',
                    cursor: 'pointer',
                  }}
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                justifyContent: 'center',
                marginTop: '0.5rem'
              }}
            >
              {isLoading ? (
                <span>Signing In…</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Register / Join links */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <Link
              to="/onboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--forest-green-subtle)',
                border: '1px solid rgba(54, 90, 64, 0.2)',
                color: 'var(--forest-green)',
                padding: '0.7rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Building2 size={16} />
              <span>Register New Institution Campus</span>
            </Link>

            <Link
              to="/join"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent',
                border: '1px dashed var(--border)',
                color: 'var(--text-secondary)',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              <UserPlus size={15} />
              <span>Have an invitation token? Join Campus</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--charcoal)', fontWeight: 600 }}>
                <KeyRound size={18} color="var(--forest-green)" />
                <span>Password Recovery</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStatus(null);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {forgotStatus ? (
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--forest-green)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {forgotStatus}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotStatus(null);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                    Enter your registered institutional email address. Password reset instructions will be provided or contact your Campus Administrator for instant credential recovery.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@college.edu.in"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="btn btn-primary"
                      style={{ flex: 1.5 }}
                    >
                      {isForgotLoading ? 'Sending…' : 'Send Instructions'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .auth-split-card {
            grid-template-columns: 1fr !important;
          }
          .auth-image-panel {
            display: none !important;
          }
          .auth-form-panel {
            padding: 2.5rem 1.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};
