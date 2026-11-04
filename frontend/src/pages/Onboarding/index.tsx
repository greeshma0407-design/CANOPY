import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Users,
  MapPin,
  Calendar,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { CanopyLogo } from '../../assets/BotanicalIcons';
import { useAuth } from '../../context/AuthContext';
import { CampusOnboardPayload } from '../../types';

export const OnboardingPage: React.FC = () => {
  const { onboardCampus } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CampusOnboardPayload>({
    institution_name: '',
    institution_type: 'Autonomous College',
    campus_name: '',
    city: '',
    state: '',
    country: 'India',
    timezone: 'Asia/Kolkata',

    student_count: 3500,
    faculty_count: 280,
    staff_count: 140,

    campus_area_acres: 25.5,
    built_up_area_sq_m: 45000,
    building_count: 8,

    academic_year: '2025-2026',
    reporting_period_label: 'CY 2025',
    reporting_period_start: '2025-01-01',
    reporting_period_end: '2025-12-31',
    baseline_year: '2023',

    admin_name: '',
    admin_email: '',
    admin_password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (field: keyof CampusOnboardPayload, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.institution_name.trim()) {
      setErrorMsg('Please provide your Institution or College name.');
      return;
    }
    if (!formData.campus_name.trim()) {
      setErrorMsg('Please specify the Campus name (e.g. Main Campus).');
      return;
    }
    if (!formData.admin_name.trim()) {
      setErrorMsg('Please enter the Campus Administrator full name.');
      return;
    }
    if (!formData.admin_email.trim()) {
      setErrorMsg('Please enter an official administrator email address.');
      return;
    }
    if (!formData.admin_password || formData.admin_password.length < 8) {
      setErrorMsg('Administrator password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await onboardCampus(formData);
      navigate('/overview', { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to complete campus registration. Please check the inputs.');
    } finally {
      setIsLoading(false);
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
        padding: '2.5rem 1.5rem',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '800px', width: '100%', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <CanopyLogo size={42} />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.2rem', fontWeight: 600, color: '#F2EFE5' }}>
          Register Your Campus
        </h1>
        <p style={{ color: '#A0A595', fontSize: '0.95rem', marginTop: '0.4rem' }}>
          Initialize your institution’s carbon accounting inventory, configure boundaries, and provision administrator credentials.
        </p>
      </div>

      {/* Main Registration Card */}
      <div
        style={{
          maxWidth: '800px',
          width: '100%',
          backgroundColor: '#151B16',
          border: '1px solid rgba(165, 181, 139, 0.25)',
          borderRadius: '10px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
        }}
      >
        <form onSubmit={handleSubmit} style={{ padding: '2rem 2.25rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'rgba(217, 83, 79, 0.15)',
                border: '1px solid rgba(217, 83, 79, 0.4)',
                borderRadius: '6px',
                padding: '0.85rem 1.25rem',
                color: '#ff8585',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Institutional Identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(165, 181, 139, 0.15)', paddingBottom: '0.5rem' }}>
              <Building2 size={18} color="#A5B58B" />
              <h3 style={{ fontSize: '1.05rem', color: '#A5B58B', fontWeight: 600 }}>1. Institutional Information</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Institution / College Name <span style={{ color: '#D4A373' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad Institute of Technology"
                  value={formData.institution_name}
                  onChange={e => handleChange('institution_name', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Institution Type <span style={{ color: '#6B705C' }}>(Optional)</span>
                </label>
                <select
                  value={formData.institution_type}
                  onChange={e => handleChange('institution_type', e.target.value)}
                  style={inputStyle}
                >
                  <option value="Autonomous College">Autonomous College</option>
                  <option value="University Campus">University Campus</option>
                  <option value="Affiliated Engineering College">Affiliated Engineering College</option>
                  <option value="Medical Institution">Medical Institution</option>
                  <option value="Polytechnic / Vocational">Polytechnic / Vocational</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Campus Name <span style={{ color: '#D4A373' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Campus / Main Campus"
                  value={formData.campus_name}
                  onChange={e => handleChange('campus_name', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  City &amp; State <span style={{ color: '#6B705C' }}>(Optional)</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="City (e.g. Hyderabad)"
                    value={formData.city || ''}
                    onChange={e => handleChange('city', e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    placeholder="State (e.g. Telangana)"
                    value={formData.state || ''}
                    onChange={e => handleChange('state', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Population Boundaries */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(165, 181, 139, 0.15)', paddingBottom: '0.5rem' }}>
              <Users size={18} color="#A5B58B" />
              <h3 style={{ fontSize: '1.05rem', color: '#A5B58B', fontWeight: 600 }}>2. Campus Population</h3>
              <span style={{ fontSize: '0.78rem', color: '#6B705C' }}>Used for per-capita intensity metrics</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Student Count <span style={{ fontSize: '0.75rem', color: '#6B705C' }}>(Headcount)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.student_count || ''}
                  onChange={e => handleChange('student_count', parseInt(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Faculty Count <span style={{ fontSize: '0.75rem', color: '#6B705C' }}>(Teaching Staff)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.faculty_count || ''}
                  onChange={e => handleChange('faculty_count', parseInt(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Non-Teaching Staff <span style={{ fontSize: '0.75rem', color: '#6B705C' }}>(Support Staff)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.staff_count || ''}
                  onChange={e => handleChange('staff_count', parseInt(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical Infrastructure */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(165, 181, 139, 0.15)', paddingBottom: '0.5rem' }}>
              <MapPin size={18} color="#A5B58B" />
              <h3 style={{ fontSize: '1.05rem', color: '#A5B58B', fontWeight: 600 }}>3. Infrastructure &amp; Footprint</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Campus Land Area <span style={{ color: '#A5B58B', fontSize: '0.75rem' }}>[Acres]</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 25.0"
                  value={formData.campus_area_acres || ''}
                  onChange={e => handleChange('campus_area_acres', parseFloat(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Built-up Floor Area <span style={{ color: '#A5B58B', fontSize: '0.75rem' }}>[m²]</span>
                </label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  placeholder="e.g. 48000"
                  value={formData.built_up_area_sq_m || ''}
                  onChange={e => handleChange('built_up_area_sq_m', parseFloat(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Building Count <span style={{ color: '#6B705C' }}>(Optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 6"
                  value={formData.building_count || ''}
                  onChange={e => handleChange('building_count', parseInt(e.target.value) || 0)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Reporting Cycle */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(165, 181, 139, 0.15)', paddingBottom: '0.5rem' }}>
              <Calendar size={18} color="#A5B58B" />
              <h3 style={{ fontSize: '1.05rem', color: '#A5B58B', fontWeight: 600 }}>4. Reporting Cycle &amp; Baseline</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Initial Reporting Period
                </label>
                <input
                  type="text"
                  placeholder="e.g. CY 2025"
                  value={formData.reporting_period_label || 'CY 2025'}
                  onChange={e => handleChange('reporting_period_label', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Academic Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025-2026"
                  value={formData.academic_year || '2025-2026'}
                  onChange={e => handleChange('academic_year', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Baseline Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2023"
                  value={formData.baseline_year || '2023'}
                  onChange={e => handleChange('baseline_year', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Campus Administrator Account */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(165, 181, 139, 0.15)', paddingBottom: '0.5rem' }}>
              <Lock size={18} color="#D4A373" />
              <h3 style={{ fontSize: '1.05rem', color: '#D4A373', fontWeight: 600 }}>5. Primary Campus Administrator Account</h3>
              <span style={{ fontSize: '0.78rem', color: '#6B705C' }}>Full administrator privileges granted</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Administrator Full Name <span style={{ color: '#D4A373' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Arvind Sharma"
                  value={formData.admin_name}
                  onChange={e => handleChange('admin_name', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Official Email Address <span style={{ color: '#D4A373' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@yourcollege.edu.in"
                  value={formData.admin_email}
                  onChange={e => handleChange('admin_email', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#A0A595', marginBottom: '0.35rem' }}>
                  Master Password <span style={{ color: '#D4A373' }}>* (Min 8 chars)</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Create a strong password"
                  value={formData.admin_password}
                  onChange={e => handleChange('admin_password', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(165, 181, 139, 0.2)' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#A0A595',
                fontSize: '0.88rem',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: '#A5B58B',
                color: '#101410',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.15s ease',
              }}
            >
              {isLoading ? 'Creating Campus & Account…' : (
                <>
                  <span>Complete Onboarding</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
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
