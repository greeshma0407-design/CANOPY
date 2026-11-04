import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
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
      setVerifyError(err?.message || 'Invalid or expired invitation token.');
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
      setSubmitError(err?.message || 'Failed to complete registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#101410',
        color: '#F2EFE5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div style={{ maxWidth: '520px', width: '100%', marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <CanopyLogo size={38} />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.9rem', color: '#F2EFE5' }}>
          Join Your Campus Team
        </h1>
        <p style={{ color: '#A0A595', fontSize: '0.88rem', marginTop: '0.35rem' }}>
          Accept your invitation to collaborate on your institution’s carbon accounting inventory.
        </p>
      </div>

      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#151B16',
          border: '1px solid rgba(165, 181, 139, 0.25)',
          borderRadius: '10px',
          padding: '2rem',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
        }}
      >
        {!inviteDetails ? (
          <div>
            <h3 style={{ fontSize: '1rem', color: '#A5B58B', marginBottom: '0.75rem' }}>
              Enter Invitation Token
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#A0A595', marginBottom: '1rem' }}>
              Your Campus Administrator provided you with a secure invitation link or token.
            </p>

            {verifyError && (
              <div
                style={{
                  backgroundColor: 'rgba(217, 83, 79, 0.15)',
                  border: '1px solid rgba(217, 83, 79, 0.4)',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  color: '#ff8585',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{verifyError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                placeholder="Paste invitation token here..."
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                style={inputStyle}
              />
              <button
                type="button"
                disabled={isVerifying || !tokenInput.trim()}
                onClick={() => verifyToken(tokenInput)}
                style={{
                  backgroundColor: '#A5B58B',
                  color: '#101410',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {isVerifying ? 'Verifying…' : 'Verify'}
              </button>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(165, 181, 139, 0.15)' }}>
              <Link to="/login" style={{ color: '#A0A595', fontSize: '0.85rem', textDecoration: 'none' }}>
                &larr; Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Valid Invitation Badge */}
            <div
              style={{
                backgroundColor: 'rgba(165, 181, 139, 0.12)',
                border: '1px solid rgba(165, 181, 139, 0.3)',
                borderRadius: '6px',
                padding: '0.85rem 1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#A5B58B', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <CheckCircle2 size={16} />
                <span>Invitation Verified</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#F2EFE5' }}>
                <strong>Campus:</strong> {inviteDetails.campus_name}
              </div>
              {inviteDetails.institution_name && (
                <div style={{ fontSize: '0.8rem', color: '#A0A595' }}>
                  <strong>Institution:</strong> {inviteDetails.institution_name}
                </div>
              )}
              <div style={{ fontSize: '0.8rem', color: '#D4A373', marginTop: '0.2rem' }}>
                <strong>Assigned Role:</strong> {inviteDetails.role}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#A0A595', marginTop: '0.2rem' }}>
                <strong>Invited Email:</strong> {inviteDetails.email}
              </div>
            </div>

            {submitError && (
              <div
                style={{
                  backgroundColor: 'rgba(217, 83, 79, 0.15)',
                  border: '1px solid rgba(217, 83, 79, 0.4)',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  color: '#ff8585',
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
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                Your Full Name <span style={{ color: '#D4A373' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                Set Password <span style={{ color: '#D4A373' }}>* (Min 8 characters)</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Choose a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setInviteDetails(null)}
                style={{ background: 'none', border: 'none', color: '#A0A595', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Use different token
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#A5B58B',
                  color: '#101410',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.7rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {isSubmitting ? 'Registering…' : 'Complete Registration'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#101410',
  border: '1px solid rgba(165, 181, 139, 0.25)',
  borderRadius: '5px',
  padding: '0.65rem 0.85rem',
  color: '#F2EFE5',
  fontSize: '0.88rem',
  outline: 'none',
  boxSizing: 'border-box',
};
