import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  Sliders,
  Database,
  Info,
  Trash2,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useCampusData } from '../../hooks/useCampusData';
import { mockEmissionFactors } from '../../data/emissionFactors';
import { Campus } from '../../types';

export const SettingsPage: React.FC = () => {
  const { campus, setCampus, reportingPeriods } = useCampusData();

  // Local form state cloned from campus
  const [formData, setFormData] = useState<Campus>({ ...campus });
  const [preferredUnit, setPreferredUnit] = useState<string>('tCO2e');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCampus({
      ...formData,
      population: (formData.studentCount || 0) + (formData.facultyCount || 0) + (formData.staffCount || 0)
    });
    setSaveSuccessMsg('Campus profile successfully updated for this browser session.');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleClearSessionData = () => {
    if (window.confirm('Are you sure you want to clear all locally cached session calculations and scenarios?')) {
      window.localStorage.removeItem('canopy_session_records');
      window.localStorage.removeItem('canopy_saved_scenarios');
      window.localStorage.removeItem('canopy_recommendations_list');
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1080px' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
            System Settings & Emission Factors
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Configure campus institutional boundaries, reporting preferences, and audit emission factor catalogues.
          </p>
        </div>
        <div>
          <Badge variant="illustrative">Session Local Storage</Badge>
        </div>
      </div>

      {saveSuccessMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(78, 135, 82, 0.18)',
            border: '1px solid rgba(78, 135, 82, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#8FD895',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.9rem'
          }}
        >
          <CheckCircle size={18} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 1. Campus Profile Configuration */}
      <Card
        title="1. Campus Profile & Boundaries"
        subtitle="Demographic and structural parameters used for intensity normalizations"
      >
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Institution Full Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="Campus Code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <Input
              label="Location / City"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
            <Input
              label="State & Country"
              value={`${formData.state}, ${formData.country}`}
              disabled
              hint="Fixed geographic jurisdiction"
            />
            <Input
              label="Timezone"
              value={formData.timezone}
              onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <Input
              label="Student Body"
              type="number"
              suffix="students"
              value={formData.studentCount}
              onChange={(e) => setFormData(prev => ({ ...prev, studentCount: parseInt(e.target.value) || 0 }))}
            />
            <Input
              label="Faculty Count"
              type="number"
              suffix="faculty"
              value={formData.facultyCount}
              onChange={(e) => setFormData(prev => ({ ...prev, facultyCount: parseInt(e.target.value) || 0 }))}
            />
            <Input
              label="Support Staff"
              type="number"
              suffix="staff"
              value={formData.staffCount}
              onChange={(e) => setFormData(prev => ({ ...prev, staffCount: parseInt(e.target.value) || 0 }))}
            />
            <Input
              label="Built-Up Area"
              type="number"
              suffix="m²"
              value={formData.builtUpAreaSqM}
              onChange={(e) => setFormData(prev => ({ ...prev, builtUpAreaSqM: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Total Campus Population: <strong>{((formData.studentCount || 0) + (formData.facultyCount || 0) + (formData.staffCount || 0)).toLocaleString()} people</strong>
            </span>
            <Button variant="primary" size="sm" type="submit" icon={<Save size={14} />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Reporting Preferences */}
      <Card
        title="2. Reporting Preferences & Standards"
        subtitle="Default units, cycle selection, and baseline references"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
          <Select
            label="Default Reporting Cycle"
            options={reportingPeriods.map(p => ({ value: p.id, label: p.label }))}
            value={reportingPeriods.find(p => p.is_default)?.id || 'period-2025'}
            onChange={() => {}}
          />

          <Select
            label="Preferred Display Unit"
            options={[
              { value: 'tCO2e', label: 'Metric Tonnes (tCO2e)' },
              { value: 'kgCO2e', label: 'Kilograms (kgCO2e)' }
            ]}
            value={preferredUnit}
            onChange={(e) => setPreferredUnit(e.target.value)}
          />

          <Input
            label="Historical Baseline Year"
            value="CY 2024 (915.0 tCO2e)"
            disabled
            hint="Reference year for reduction targets"
          />
        </div>
      </Card>

      {/* 3. Emission Factor Configuration Status */}
      <Card
        title="3. Configured Emission Factors Catalogue"
        subtitle="Audit provenance, authority sources, and validation rules"
        action={
          <Badge variant="warning">
            Stage 2 Integration Pending
          </Badge>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
          <div className="table-container">
            <table className="canopy-table">
              <thead>
                <tr>
                  <th>Factor ID</th>
                  <th>Category</th>
                  <th>Activity Type</th>
                  <th>Factor Value</th>
                  <th>Source Authority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockEmissionFactors.map(factor => (
                  <tr key={factor.id}>
                    <td><code>{factor.id}</code></td>
                    <td style={{ textTransform: 'capitalize' }}>{factor.category}</td>
                    <td style={{ fontSize: '0.8rem' }}>{factor.activity_type.replace(/_/g, ' ')}</td>
                    <td style={{ fontWeight: 600, color: 'var(--sage)' }}>
                      {factor.factor_value} {factor.factor_unit}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {factor.source_name}
                    </td>
                    <td>
                      <Badge variant="illustrative">Illustrative</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--card-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}
          >
            <strong>Factor Governance Rule:</strong> Every factor includes explicit provenance, methodology version, and validity timestamps. If an activity type lacks a verified factor, Canopy marks the output <em>Unavailable</em> rather than interpolating ungrounded estimates.
          </div>
        </div>
      </Card>

      {/* 4. Application Architecture & Stage 2 Info */}
      <Card
        title="4. Application & API Environment"
        subtitle="Frontend and backend integration readiness"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--card-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Frontend Environment (Stage 1)
            </div>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>Version: <code>1.0.0-stage1</code></div>
              <div>Stack: React 19, TypeScript, Vite, Recharts, Lucide</div>
              <div>Design: Dark Botanical Editorial ("Forest at Midnight")</div>
              <div>State: Client memory + LocalStorage</div>
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--card-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Backend Integration (Stage 2 Ready)
            </div>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>API Prefix: <code>/api/v1</code></div>
              <div>Backend Target: Python FastAPI + SQLAlchemy 2.x</div>
              <div>Database: SQLite / PostgreSQL</div>
              <div>Authentication: OAuth2 JWT Token</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Session Data Management */}
      <Card
        title="5. Browser Session Data Management"
        subtitle="Manage local browser storage caches and cached records"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            backgroundColor: 'rgba(192, 87, 70, 0.08)',
            border: '1px solid rgba(192, 87, 70, 0.3)',
            borderRadius: 'var(--radius-md)',
            marginTop: '0.5rem'
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: '#FFAAA0', fontSize: '0.9rem' }}>
              Reset Session Storage & Demo Caches
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Clears custom scenarios, saved activity records, and recommendation status overrides from localStorage.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleClearSessionData}
            icon={<Trash2 size={14} />}
          >
            Clear Session
          </Button>
        </div>
      </Card>
    </div>
  );
};
