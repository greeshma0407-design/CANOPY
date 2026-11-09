import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { CanopyLogo } from '../../assets/BotanicalIcons';
import { canopyApi } from '../../utils/apiClient';
import { useAuth } from '../../context/AuthContext';
import { InvitationVerifyResponse } from '../../types';

export const JoinCampusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const { registerInvited } = useAuth();
  const navigate = useNavigate();

  const [tokenInput, setTokenInput] = useState(tokenFromUrl);
  const [inviteDetails, setInviteDetails] = useState<InvitationVerifyResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const verifyToken = async (tokenToTest: string) => {
    if (!tokenToTest.trim()) return;
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const data = await canopyApi.verifyInvitation(tokenToTest.trim());
      setInviteDetails(data);
    } catch (err: any) {
      setInviteDetails(null);
      setVerifyError(err?.message || 'The invitation link or token is invalid or has expired.');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      verifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteDetails) return;
    if (!fullName.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }
    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await registerInvited({
        token: inviteDetails.token,
        full_name: fullName.trim(),
        password,
      });
      navigate('/overview', { replace: true });
    } catch (err: any) {
      setSubmitError(err?.message || 'We could not complete your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--warm-ivory)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%', marginBottom: '1.75rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <CanopyLogo size={42} />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: '2.1rem',
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}
        >
          Join Your Campus Team
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
          Accept your institutional invitation to collaborate on verified carbon accounting.
        </p>
      </div>

      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {!inviteDetails ? (
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: '1.25rem',
                color: 'var(--forest-green)',
                marginBottom: '0.5rem',
              }}
            >
              Enter Invitation Token
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Your campus administrator provided you with a secure invitation link or token.
            </p>

            {verifyError && (
              <div
                style={{
                  backgroundColor: 'rgba(192, 87, 70, 0.08)',
                  border: '1px solid rgba(192, 87, 70, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  color: 'var(--danger)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{verifyError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Paste invitation token..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="canopy-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                disabled={isVerifying || !tokenInput.trim()}
                onClick={() => verifyToken(tokenInput)}
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                {isVerifying ? 'Checking…' : 'Verify'}
              </button>
            </div>

            <div
              style={{
                textAlign: 'center',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-light)',
              }}
            >
              <Link
                to="/login"
                style={{
                  color: 'var(--forest-green)',
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                &larr; Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Valid Invitation Card */}
            <div
              style={{
                backgroundColor: 'rgba(54, 90, 64, 0.05)',
                border: '1px solid rgba(54, 90, 64, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--forest-green)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Verified Campus Invitation</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                <strong>Campus:</strong> {inviteDetails.campus_name}
              </div>
              {inviteDetails.institution_name && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <strong>Institution:</strong> {inviteDetails.institution_name}
                </div>
              )}
              <div style={{ fontSize: '0.82rem', color: 'var(--earth-ochre)', fontWeight: 600, marginBottom: '0.25rem' }}>
                <strong>Assigned Role:</strong> {inviteDetails.role.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <strong>Invited Account:</strong> {inviteDetails.email}
              </div>
            </div>

            {submitError && (
              <div
                style={{
                  backgroundColor: 'rgba(192, 87, 70, 0.08)',
                  border: '1px solid rgba(192, 87, 70, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  color: 'var(--danger)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{submitError}</span>
              </div>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                Full Name <span style={{ color: 'var(--earth-ochre)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="canopy-input"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                Set Password <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>(Min. 8 characters)</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="canopy-input"
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-light)',
              }}
            >
              <button
                type="button"
                onClick={() => setInviteDetails(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Use different token
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {isSubmitting ? 'Creating account…' : 'Complete Setup'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Trust reassurance */}
      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
        }}
      >
        <ShieldCheck size={15} color="var(--forest-green)" />
        <span>End-to-end encrypted campus sustainability records</span>
      </div>
    </div>
  );
};
