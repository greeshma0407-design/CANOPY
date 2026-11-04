import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserPlus,
  KeyRound,
  X,
} from 'lucide-react';
import { CanopyLogo } from '../../assets/BotanicalIcons';
import { useAuth } from '../../context/AuthContext';
import { ApiError, canopyApi } from '../../utils/apiClient';

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
      setErrorMsg('Please enter your email address.');
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
        setErrorMsg(apiErr.message || 'Account has been deactivated. Contact an administrator.');
      } else {
        setErrorMsg(apiErr?.message || 'Unable to connect to authentication server. Please try again.');
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
        'Password recovery dispatched. For immediate assistance, your institution’s Campus Administrator can reset your password directly.'
      );
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#101410',
        color: '#F2EFE5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient botanical glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '20%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(165, 181, 139, 0.08) 0%, rgba(16, 20, 16, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 163, 115, 0.05) 0%, rgba(16, 20, 16, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Canopy Header / Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#151B16',
              border: '1px solid rgba(165, 181, 139, 0.3)',
              marginBottom: '1rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            }}
          >
            <CanopyLogo size={36} />
          </div>
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '2.1rem',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#F2EFE5',
              margin: '0 0 0.35rem 0',
            }}
          >
            CANOPY
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: '#A5B58B',
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            Small shifts. Greener campuses.
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            backgroundColor: '#151B16',
            border: '1px solid rgba(165, 181, 139, 0.25)',
            borderRadius: '8px',
            padding: '2rem',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#F2EFE5', margin: '0 0 0.25rem 0' }}>
              Sign In to Your Campus
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#6B705C', margin: 0 }}>
              Access your institution’s carbon accounting inventory and analytics.
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                backgroundColor: 'rgba(217, 83, 79, 0.15)',
                border: '1px solid rgba(217, 83, 79, 0.4)',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                color: '#ff8585',
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: '#A5B58B',
                  marginBottom: '0.4rem',
                }}
              >
                Institutional Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6B705C',
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
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#101410',
                    border: '1px solid rgba(165, 181, 139, 0.25)',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                    color: '#F2EFE5',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label
                  htmlFor="password"
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: '#A5B58B',
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D4A373',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6B705C',
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
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#101410',
                    border: '1px solid rgba(165, 181, 139, 0.25)',
                    borderRadius: '6px',
                    padding: '0.65rem 2.4rem 0.65rem 2.4rem',
                    color: '#F2EFE5',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6B705C',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#A0A595' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    accentColor: '#A5B58B',
                    width: '14px',
                    height: '14px',
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
              style={{
                backgroundColor: '#A5B58B',
                color: '#101410',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.35rem',
                transition: 'background-color 0.15s ease',
              }}
            >
              {isLoading ? (
                <span>Authenticating…</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* New Campus & Invitations Action Row */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(165, 181, 139, 0.15)',
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
                backgroundColor: 'rgba(165, 181, 139, 0.08)',
                border: '1px solid rgba(165, 181, 139, 0.25)',
                color: '#F2EFE5',
                padding: '0.65rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'background-color 0.15s ease',
              }}
            >
              <Building2 size={16} color="#A5B58B" />
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
                border: '1px dashed rgba(212, 163, 115, 0.3)',
                color: '#D4A373',
                padding: '0.6rem 1rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                textDecoration: 'none',
              }}
            >
              <UserPlus size={15} />
              <span>Have an invitation token? Join Campus</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: '#6B705C' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#A5B58B" />
            <span>Multi-Tenant Architecture Active &bull; Strict Campus Isolation</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#151B16',
              border: '1px solid rgba(165, 181, 139, 0.3)',
              borderRadius: '8px',
              padding: '1.75rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D4A373', fontWeight: 600 }}>
                <KeyRound size={18} />
                <span>Password Recovery</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStatus(null);
                }}
                style={{ background: 'none', border: 'none', color: '#A0A595', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {forgotStatus ? (
              <div>
                <p style={{ fontSize: '0.85rem', color: '#A5B58B', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  {forgotStatus}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStatus(null);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#A5B58B',
                    color: '#101410',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '0.6rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <p style={{ fontSize: '0.82rem', color: '#A0A595', lineHeight: '1.4', marginBottom: '1rem' }}>
                  Enter your registered institutional email address. Password reset instructions will be provided or contact your Campus Administrator for instant credential recovery.
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="email"
                    required
                    placeholder="name@college.edu.in"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: '#101410',
                      border: '1px solid rgba(165, 181, 139, 0.25)',
                      borderRadius: '5px',
                      padding: '0.65rem 0.85rem',
                      color: '#F2EFE5',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(165, 181, 139, 0.25)',
                      color: '#A0A595',
                      borderRadius: '5px',
                      padding: '0.6rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    style={{
                      flex: 1.5,
                      backgroundColor: '#A5B58B',
                      color: '#101410',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '0.6rem',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: isForgotLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isForgotLoading ? 'Sending…' : 'Send Instructions'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
