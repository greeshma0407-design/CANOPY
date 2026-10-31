import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useCampusData } from '../../hooks/useCampusData';
import { mockDefaultReport } from '../../data/reports';
import { exportToCSV } from '../../utils/csvExport';
import { Report } from '../../types';

export const ReportsPage: React.FC = () => {
  const {
    campus,
    reportingPeriods,
    selectedPeriodId,
    setSelectedPeriodId,
    selectedPeriod,
    totalEmissions_t_co2e,
    categoryBreakdowns,
    perStudentEmissions
  } = useCampusData();

  const [currentReport, setCurrentReport] = useState<Report>(mockDefaultReport);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedSuccess, setGeneratedSuccess] = useState<boolean>(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setGeneratedSuccess(false);

    setTimeout(() => {
      const elecShare = categoryBreakdowns.find(c => c.category === 'electricity')?.emissions_t_co2e || 522.0;
      const transShare = categoryBreakdowns.find(c => c.category === 'transport')?.emissions_t_co2e || 202.0;
      const wasteShare = categoryBreakdowns.find(c => c.category === 'waste')?.emissions_t_co2e || 118.0;

      const freshReport: Report = {
        ...mockDefaultReport,
        id: `rep-${selectedPeriod.id}-${Date.now()}`,
        period_label: selectedPeriod.label,
        reporting_period_id: selectedPeriod.id,
        generated_at: new Date().toISOString(),
        total_emissions_t_co2e: totalEmissions_t_co2e,
        electricity_t_co2e: elecShare,
        transport_t_co2e: transShare,
        waste_t_co2e: wasteShare,
        per_student_t_co2e: perStudentEmissions
      };

      setCurrentReport(freshReport);
      setIsGenerating(false);
      setGeneratedSuccess(true);
      setTimeout(() => setGeneratedSuccess(false), 3500);
    }, 400);
  };

  const handleExportCSV = () => {
    const rows = categoryBreakdowns.map(c => ({
      Category: c.label,
      'Total Emissions (tCO2e)': c.emissions_t_co2e,
      'Percentage (%)': `${c.percentage}%`,
      'Trend (%)': `${c.trend_direction === 'down' ? '-' : '+'}${Math.abs(c.trend_pct)}%`,
      'Campus Reporting Period': selectedPeriod.label,
      'Institution Name': campus.name,
      'Data Confidence': 'Illustrative Stage 1 Demonstration Data'
    }));

    exportToCSV(rows, `canopy-carbon-report-${selectedPeriod.year}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
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
            Compliance & Sustainability Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Structured GHG emissions inventory reports with methodology audit notes and CSV export.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="illustrative">Illustrative Report Template</Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer size={14} />}
          >
            Print / PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download size={14} />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={isGenerating}
            onClick={handleGenerateReport}
            icon={<Sparkles size={14} />}
          >
            Generate Fresh Report
          </Button>
        </div>
      </div>

      {generatedSuccess && (
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
          <CheckCircle2 size={18} />
          <span>Report successfully compiled from active cycle inventory.</span>
        </div>
      )}

      {/* Control Bar: Reporting Period Select */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          backgroundColor: 'var(--card-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Calendar size={16} color="var(--sage)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Inventory Reporting Cycle:
          </span>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            style={{
              backgroundColor: 'var(--card-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none'
            }}
          >
            {reportingPeriods.map(p => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span>Status: <strong style={{ color: '#8FD895' }}>Audit Ready</strong></span>
          <span>Coverage: <strong>Scope 2 & 3</strong></span>
          <span>Version: <strong>1.0-stage1</strong></span>
        </div>
      </div>

      {/* Report Document Container (Paper / Editorial Styled) */}
      <div
        id="canopy-printable-report"
        style={{
          backgroundColor: '#161C17',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 3.5rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem'
        }}
      >
        {/* Document Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--border)',
            paddingBottom: '2rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)'
                }}
              >
                Canopy
              </span>
              <span style={{ color: 'var(--sage)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                &bull; Campus Carbon Accounting Engine
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {currentReport.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Reporting Target: <strong style={{ color: 'var(--text-primary)' }}>{currentReport.campus_name}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div>Document Ref: <code>{currentReport.id}</code></div>
            <div>Generated: {new Date(currentReport.generated_at).toLocaleDateString()}</div>
            <div style={{ marginTop: '0.4rem' }}>
              <Badge variant="illustrative">Illustrative Report</Badge>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            1. Executive Summary & Inventory Highlights
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {currentReport.sections.find(s => s.id === 'sec-exec')?.text_content}
          </p>

          {/* Key Metric Highlights Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              marginTop: '1.25rem',
              padding: '1.25rem',
              backgroundColor: 'var(--card-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Gross Campus Emissions
              </span>
              <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {currentReport.total_emissions_t_co2e} tCO2e
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Scope 2 (Electricity)
              </span>
              <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--sage)', marginTop: '0.2rem' }}>
                {currentReport.electricity_t_co2e} tCO2e
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Scope 3 (Commuter Transit)
              </span>
              <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--ochre)', marginTop: '0.2rem' }}>
                {currentReport.transport_t_co2e} tCO2e
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Scope 3 (Solid Waste)
              </span>
              <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.6rem', fontWeight: 700, color: '#6B705C', marginTop: '0.2rem' }}>
                {currentReport.waste_t_co2e} tCO2e
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Campus Boundary Profile */}
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            2. Institutional Profile & Boundary Conditions
          </h3>
          <div className="table-container">
            <table className="canopy-table">
              <tbody>
                <tr>
                  <td style={{ width: '35%', color: 'var(--text-secondary)', fontWeight: 600 }}>Campus Institution</td>
                  <td>{campus.name} ({campus.code})</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Location & State</td>
                  <td>{campus.location}, {campus.state}, {campus.country}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Campus Land & Built Space</td>
                  <td>{campus.campusAreaAcres} Acres total land &bull; {campus.builtUpAreaSqM.toLocaleString()} m² built-up gross floor area</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Campus Demographics</td>
                  <td>{campus.studentCount.toLocaleString()} enrolled students &bull; {campus.facultyCount} faculty &bull; {campus.staffCount} staff</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Inventory Boundaries</td>
                  <td>Scope 2 (Metered grid electricity & diesel backup) + Scope 3 (Student buses, commuter cars, two-wheelers, solid waste streams)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Category Breakdown Table */}
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            3. Activity Breakdown & Year-Over-Year Variance
          </h3>
          <div className="table-container">
            <table className="canopy-table">
              <thead>
                <tr>
                  <th>Emission Category</th>
                  <th>Activity Quantity</th>
                  <th>Factor Provenance</th>
                  <th>Emissions (tCO2e)</th>
                  <th>Share (%)</th>
                  <th>YoY Delta</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Electricity (Scope 2)</td>
                  <td>636,585 kWh metered</td>
                  <td>0.820 kgCO2e/kWh (CEA Baseline Database v19)</td>
                  <td style={{ fontWeight: 600, color: 'var(--sage)' }}>{currentReport.electricity_t_co2e}</td>
                  <td>62.0%</td>
                  <td style={{ color: '#8FD895' }}>-5.0% (↓)</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Transportation (Scope 3)</td>
                  <td>1,420,000 p-km / v-km</td>
                  <td>Multi-modal fleet composite (ARAI / CPCB)</td>
                  <td style={{ fontWeight: 600, color: 'var(--ochre)' }}>{currentReport.transport_t_co2e}</td>
                  <td>24.0%</td>
                  <td style={{ color: 'var(--ochre)' }}>+2.0% (↑)</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Waste & Landfill (Scope 3)</td>
                  <td>210 tonnes total waste</td>
                  <td>0.58 t/t landfill &bull; 0.10 t/t composting (IPCC)</td>
                  <td style={{ fontWeight: 600, color: '#6B705C' }}>{currentReport.waste_t_co2e}</td>
                  <td>14.0%</td>
                  <td style={{ color: '#8FD895' }}>-1.0% (↓)</td>
                </tr>
                <tr style={{ backgroundColor: 'var(--card-elevated)', fontWeight: 700 }}>
                  <td>Campus Gross Total</td>
                  <td>—</td>
                  <td>Weighted Average Composite</td>
                  <td style={{ color: 'var(--text-primary)' }}>{currentReport.total_emissions_t_co2e} tCO2e</td>
                  <td>100.0%</td>
                  <td style={{ color: '#8FD895' }}>-8.0% (↓)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Methodology & Limitations */}
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            4. Methodology, Standards & Stage 2 Transition
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            {currentReport.sections.find(s => s.id === 'sec-methodology')?.text_content}
          </p>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--card-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55
            }}
          >
            <strong style={{ color: 'var(--text-primary)' }}>Notice on Stage 1 Data Integrity:</strong>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
              <li>Emission factors applied are illustrative demo factors calibrated to CEA Baseline Database v19 and IPCC guidelines.</li>
              <li>Values are designed for educational campus planning and should not be submitted for regulatory carbon credits.</li>
              <li>Full database persistence and REST API stubs (`/api/v1`) will activate in Stage 2 Python FastAPI deployment.</li>
            </ul>
          </div>
        </div>

        {/* Mandatory Regulatory Disclaimer Footer */}
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(212, 163, 115, 0.08)',
            border: '1px solid rgba(212, 163, 115, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--ochre)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{currentReport.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
