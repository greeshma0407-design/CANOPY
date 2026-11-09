import React, { useState } from 'react';
import {
  Trash2,
  Save,
  CheckCircle,
} from 'lucide-react';
import { canopyApi } from '../../utils/apiClient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useCampusData } from '../../hooks/useCampusData';
import { mockEmissionFactors } from '../../data/emissionFactors';
import { Campus } from '../../types';

export const SettingsPage: React.FC = () => {
  const { campus, setCampus } = useCampusData();

  // Local form state cloned from campus
  const [formData, setFormData] = useState<Campus>({ ...campus });
  const [preferredUnit, setPreferredUnit] = useState<string>('tCO2e');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await canopyApi.updateMyCampus({
        name: formData.name,
        location: formData.location,
        institution_name: formData.institution_name,
        institution_type: formData.institution_type,
        student_count: formData.studentCount,
        faculty_count: formData.facultyCount,
        staff_count: formData.staffCount,
        campus_area_acres: formData.campusAreaAcres,
        built_up_area_sq_m: formData.builtUpAreaSqM,
        building_count: formData.buildingCount,
        timezone: formData.timezone,
      });
      setCampus({
        ...formData,
        population: (formData.studentCount || 0) + (formData.facultyCount || 0) + (formData.staffCount || 0)
      });
      setSaveSuccessMsg('Campus profile successfully updated.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err?.message || "We couldn't update your campus profile right now. Please try again.");
    }
  };

  const handleClearSessionData = () => {
    if (window.confirm('Are you sure you want to clear locally cached session drafts?')) {
      window.localStorage.removeItem('canopy_session_records');
      window.localStorage.removeItem('canopy_saved_scenarios');
      window.localStorage.removeItem('canopy_recommendations_list');
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1080px' }}>
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
            Campus Settings & Preferences
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Configure institutional boundaries, reporting metrics, and verified emission factor references.
          </p>
        </div>
      </div>

      {saveSuccessMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--forest-green-subtle)',
            border: '1px solid rgba(54, 90, 64, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--forest-green)',
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

      {/* 1. Institutional Boundary Profile */}
      <Card
        title="1. Institutional Campus Profile"
        subtitle="Operational parameters used for per-capita and built-up area intensity calculations"
      >
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <Input
              label="Campus Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Parent Institution / University"
              value={formData.institution_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, institution_name: e.target.value }))}
            />
            <Select
              label="Institution Classification"
              options={[
                { value: 'Autonomous Engineering College', label: 'Autonomous Engineering College' },
                { value: 'State Public University', label: 'State Public University' },
                { value: 'Private University', label: 'Private University' },
                { value: 'Institute of National Importance', label: 'Institute of National Importance (IIT/NIT)' },
                { value: 'Liberal Arts & Sciences', label: 'Liberal Arts & Sciences' }
              ]}
              value={formData.institution_type || 'Autonomous Engineering College'}
              onChange={(e) => setFormData(prev => ({ ...prev, institution_type: e.target.value }))}
            />
            <Input
              label="Campus Geographic Location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
            <Input
              label="Total Enrolled Students"
              type="number"
              min="0"
              value={formData.studentCount || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, studentCount: parseInt(e.target.value) || 0 }))}
            />
            <Input
              label="Teaching Faculty Count"
              type="number"
              min="0"
              value={formData.facultyCount || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, facultyCount: parseInt(e.target.value) || 0 }))}
            />
            <Input
              label="Administrative & Support Staff"
              type="number"
              min="0"
              value={formData.staffCount || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, staffCount: parseInt(e.target.value) || 0 }))}
            />
            <Input
              label="Campus Area (Acres)"
              type="number"
              min="0"
              step="0.1"
              value={formData.campusAreaAcres || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, campusAreaAcres: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Built-Up Enclosed Floor Area (m²)"
              type="number"
              min="0"
              step="100"
              value={formData.builtUpAreaSqM || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, builtUpAreaSqM: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Academic Year Baseline"
              value={formData.academicYear || '2025-2026'}
              onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="primary" type="submit" icon={<Save size={15} />}>
              Save Campus Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Accounting Preferences */}
      <Card
        title="2. Carbon Accounting Units & Standards"
        subtitle="Global warming potential and unit metrics applied across dashboards"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
          <Select
            label="Primary Emission Unit"
            options={[
              { value: 'tCO2e', label: 'Metric Tonnes CO2 equivalent (tCO2e)' },
              { value: 'kgCO2e', label: 'Kilograms CO2 equivalent (kgCO2e)' }
            ]}
            value={preferredUnit}
            onChange={(e) => setPreferredUnit(e.target.value)}
          />

          <Select
            label="Global Warming Potential (GWP) Standard"
            options={[
              { value: 'ar6', label: 'IPCC Sixth Assessment Report (AR6 — 100-Year)' },
              { value: 'ar5', label: 'IPCC Fifth Assessment Report (AR5 — 100-Year)' }
            ]}
            value="ar6"
            onChange={() => {}}
          />

          <Select
            label="Accounting Boundary Method"
            options={[
              { value: 'operational', label: 'Operational Control (GHG Protocol)' },
              { value: 'financial', label: 'Financial Control' },
              { value: 'equity', label: 'Equity Share' }
            ]}
            value="operational"
            onChange={() => {}}
          />
        </div>
      </Card>

      {/* 3. Reference Emission Factors Table */}
      <Card
        title="3. Verified Emission Factors Reference Table"
        subtitle="Regional factors applied to convert activity quantities into carbon equivalents"
      >
        <div className="table-container" style={{ marginTop: '0.75rem' }}>
          <table className="canopy-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Activity Stream</th>
                <th>Factor Value</th>
                <th>Units</th>
                <th>Geographic Region</th>
                <th>Standard Source</th>
              </tr>
            </thead>
            <tbody>
              {mockEmissionFactors.map(ef => (
                <tr key={ef.id}>
                  <td>
                    <Badge variant={ef.category === 'electricity' ? 'success' : ef.category === 'transport' ? 'warning' : 'info'}>
                      {ef.category}
                    </Badge>
                  </td>
                  <td style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                    {ef.activity_type.replace(/_/g, ' ')}
                  </td>
                  <td style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{ef.factor_value}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{ef.factor_unit}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{ef.geography}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ef.source_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. Session & Storage Management */}
      <Card
        title="4. Browser Session Data Management"
        subtitle="Manage local browser drafts and temporary calculations"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem',
            backgroundColor: 'var(--warm-ivory)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            marginTop: '0.5rem',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
              Reset Local Session Drafts
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Clears custom simulator drafts and local session caches without affecting permanent database records.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearSessionData}
            icon={<Trash2 size={14} />}
          >
            Clear Local Drafts
          </Button>
        </div>
      </Card>
    </div>
  );
};
