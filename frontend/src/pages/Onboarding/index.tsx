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
  AlertCircle
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
        backgroundColor: 'var(--warm-ivory)',
        color: 'var(--charcoal)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '3rem 1.5rem',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '820px', width: '100%', marginBottom: '2.5rem', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', color: 'var(--charcoal)', marginBottom: '1.25rem' }}>
          <CanopyLogo size={38} />
          <span style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.8rem', color: 'var(--forest-green)' }}>
            Canopy
          </span>
        </Link>
        <h1 style={{ fontFamily: 'var(--font-editorial)', fontSize: '2.4rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>
          Register Your Campus
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto', lineHeight: 1.5 }}>
          Initialize your institution's carbon accounting inventory, configure operational boundaries, and provision administrator credentials.
        </p>
      </div>

      {/* Main Registration Card */}
      <div
        style={{
          maxWidth: '820px',
          width: '100%',
          backgroundColor: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
        }}
      >
        <form onSubmit={handleSubmit} style={{ padding: '2.5rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid rgba(181, 74, 59, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1.25rem',
                color: 'var(--color-danger)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem' }}>
              <Building2 size={20} color="var(--forest-green)" />
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', color: 'var(--charcoal)', fontWeight: 400 }}>
                1. Institutional Information
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Institution / College Name <span style={{ color: 'var(--earth-ochre)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marri Laxman Reddy Institute of Technology"
                  value={formData.institution_name}
                  onChange={e => handleChange('institution_name', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Institution Type
                </label>
                <select
                  value={formData.institution_type}
                  onChange={e => handleChange('institution_type', e.target.value)}
                  className="form-select"
                >
                  <option value="Autonomous College">Autonomous College</option>
                  <option value="University Campus">University Campus</option>
                  <option value="Affiliated Engineering College">Affiliated Engineering College</option>
                  <option value="Medical Institution">Medical Institution</option>
                  <option value="Polytechnic / Vocational">Polytechnic / Vocational</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Campus Name <span style={{ color: 'var(--earth-ochre)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Campus / Tech Park Campus"
                  value={formData.campus_name}
                  onChange={e => handleChange('campus_name', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  City &amp; State
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="City (e.g. Hyderabad)"
                    value={formData.city || ''}
                    onChange={e => handleChange('city', e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="text"
                    placeholder="State (e.g. Telangana)"
                    value={formData.state || ''}
                    onChange={e => handleChange('state', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Population Boundaries */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem' }}>
              <Users size={20} color="var(--forest-green)" />
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', color: 'var(--charcoal)', fontWeight: 400 }}>
                2. Campus Population
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Student Count <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Headcount)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.student_count || ''}
                  onChange={e => handleChange('student_count', parseInt(e.target.value) || 0)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Faculty Count <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Teaching Staff)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.faculty_count || ''}
                  onChange={e => handleChange('faculty_count', parseInt(e.target.value) || 0)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Non-Teaching Staff <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Support Staff)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.staff_count || ''}
                  onChange={e => handleChange('staff_count', parseInt(e.target.value) || 0)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical Infrastructure */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem' }}>
              <MapPin size={20} color="var(--forest-green)" />
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', color: 'var(--charcoal)', fontWeight: 400 }}>
                3. Physical Infrastructure
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Campus Area <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>[Acres]</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 24.5"
                  value={formData.campus_area_acres || ''}
                  onChange={e => handleChange('campus_area_acres', parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Built-up Area <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>[m²]</span>
                </label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  placeholder="e.g. 48500"
                  value={formData.built_up_area_sq_m || ''}
                  onChange={e => handleChange('built_up_area_sq_m', parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Building Count
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 8"
                  value={formData.building_count || ''}
                  onChange={e => handleChange('building_count', parseInt(e.target.value) || 0)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Reporting Cycle */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem' }}>
              <Calendar size={20} color="var(--forest-green)" />
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', color: 'var(--charcoal)', fontWeight: 400 }}>
                4. Reporting Cycle &amp; Baseline
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Initial Cycle Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. CY 2025"
                  value={formData.reporting_period_label || 'CY 2025'}
                  onChange={e => handleChange('reporting_period_label', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Academic Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025-2026"
                  value={formData.academic_year || '2025-2026'}
                  onChange={e => handleChange('academic_year', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Baseline Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2024"
                  value={formData.baseline_year || '2024'}
                  onChange={e => handleChange('baseline_year', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Campus Administrator Account */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem' }}>
              <Lock size={20} color="var(--earth-ochre)" />
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.25rem', color: 'var(--charcoal)', fontWeight: 400 }}>
                5. Primary Administrator Account
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Administrator Name <span style={{ color: 'var(--earth-ochre)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Radhika Rao"
                  value={formData.admin_name}
                  onChange={e => handleChange('admin_name', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Official Email Address <span style={{ color: 'var(--earth-ochre)' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@college.edu.in"
                  value={formData.admin_email}
                  onChange={e => handleChange('admin_email', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Master Password <span style={{ color: 'var(--earth-ochre)' }}>* (Min 8 chars)</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Create a strong password"
                  value={formData.admin_password}
                  onChange={e => handleChange('admin_password', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                padding: '0.8rem 2rem',
                fontSize: '0.95rem'
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
