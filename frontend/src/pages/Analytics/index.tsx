import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Filter,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { KPICard } from '../../components/ui/KPICard';
import { EmissionsTrendChart } from '../../components/charts/EmissionsTrendChart';
import { CategoryBarChart } from '../../components/charts/CategoryBarChart';
import { IntensityChart } from '../../components/charts/IntensityChart';
import { useCampusData } from '../../hooks/useCampusData';
import { exportToCSV } from '../../utils/csvExport';
import { canopyApi, AnalyticsTrendEntry } from '../../utils/apiClient';

export const AnalyticsPage: React.FC = () => {
  const {
    campus,
    selectedPeriodId,
    setSelectedPeriodId,
    reportingPeriods,
    monthlyEmissions,
    perStudentEmissions,
    perSqMEmissions,
    isLoading,
    refetch
  } = useCampusData();

  // Filter state: 'all' | 'q1' | 'q2' | 'q3' | 'q4' | 'h1' | 'h2'
  const [filterRange, setFilterRange] = useState<string>('all');
  const [periodTrends, setPeriodTrends] = useState<AnalyticsTrendEntry[]>([]);

  // Fetch backend multi-period trends
  useEffect(() => {
    let isMounted = true;
    const fetchTrends = async () => {
      try {
        const trends = await canopyApi.getTrends(campus.id, 'IN-Telangana');
        if (isMounted) {
          setPeriodTrends(trends);
        }
      } catch (err) {
        console.warn('[CANOPY API] Failed to fetch period trends:', err);
      }
    };
    fetchTrends();
    return () => {
      isMounted = false;
    };
  }, [campus.id]);

  // Filtered monthly data
  const filteredData = monthlyEmissions.filter(m => {
    const monthNum = parseInt(m.month.split('-')[1], 10);
    if (filterRange === 'q1') return monthNum >= 1 && monthNum <= 3;
    if (filterRange === 'q2') return monthNum >= 4 && monthNum <= 6;
    if (filterRange === 'q3') return monthNum >= 7 && monthNum <= 9;
    if (filterRange === 'q4') return monthNum >= 10 && monthNum <= 12;
    if (filterRange === 'h1') return monthNum >= 1 && monthNum <= 6;
    if (filterRange === 'h2') return monthNum >= 7 && monthNum <= 12;
    return true; // 'all'
  });

  // Calculate intensity trend points
  const intensityData = filteredData.map(m => ({
    month: m.month_short,
    perStudentKg: Math.round(((m.total_t_co2e * 1000) / campus.studentCount) * 10) / 10,
    perSqMkg: Math.round(((m.total_t_co2e * 1000) / campus.builtUpAreaSqM) * 100) / 100
  }));

  const handleExportCSV = () => {
    const rows = filteredData.map(m => ({
      Month: m.month_name,
      'Electricity (tCO2e)': m.electricity_t_co2e,
      'Transportation (tCO2e)': m.transport_t_co2e,
      'Waste & Landfill (tCO2e)': m.waste_t_co2e,
      'Total Emissions (tCO2e)': m.total_t_co2e,
      'Per-Student (kgCO2e)': Math.round((m.total_t_co2e * 1000) / campus.studentCount),
      'Completeness Status': m.is_complete ? 'Complete' : 'Pending'
    }));

    exportToCSV(rows, `canopy-analytics-${filterRange}-2025.csv`);
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
            Historical Emissions Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Multi-source monthly trends, campus intensity metrics, and longitudinal carbon intensity.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            loading={isLoading}
            icon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download size={14} />}
          >
            Export Table (CSV)
          </Button>
        </div>
      </div>

      {/* Filter and Period Selection Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--card-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={15} color="var(--sage)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Period:
            </span>
          </div>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            style={{
              backgroundColor: 'var(--card-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '0.3rem 0.65rem',
              fontSize: '0.78rem',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {reportingPeriods.map(p => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="var(--sage)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Filter Window:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Full Year (12M)' },
              { id: 'h1', label: 'H1 (Jan - Jun)' },
              { id: 'h2', label: 'H2 (Jul - Dec)' },
              { id: 'q1', label: 'Q1 (Jan - Mar)' },
              { id: 'q2', label: 'Q2 (Apr - Jun)' },
              { id: 'q3', label: 'Q3 (Jul - Sep)' },
              { id: 'q4', label: 'Q4 (Oct - Dec)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterRange(f.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: filterRange === f.id ? 'var(--card-elevated)' : 'transparent',
                  border: filterRange === f.id ? '1px solid var(--sage)' : '1px solid transparent',
                  color: filterRange === f.id ? 'var(--sage)' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: filterRange === f.id ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Intensity Metric Cards */}
      <div className="grid-cols-3">
        <KPICard
          label="Per-Student Carbon Intensity"
          value={perStudentEmissions}
          unit="tCO2e/student/yr"
          icon={Users}
          trendPct={-7.2}
          trendDirection="down"
          periodComparison="based on 3,000 enrolled students"
          isDesirableDown={true}
        />
        <KPICard
          label="Built-Up Area Carbon Intensity"
          value={perSqMEmissions}
          unit="kgCO2e/m²/yr"
          icon={Building2}
          trendPct={-6.5}
          trendDirection="down"
          periodComparison="based on 48,500 m² floor space"
          isDesirableDown={true}
        />
        <KPICard
          label="Campus Population Load"
          value="247"
          unit="kgCO2e/capita"
          icon={BarChart3}
          trendPct={-8.0}
          trendDirection="down"
          periodComparison="student + faculty + staff (3,400)"
          isDesirableDown={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid-cols-2">
        <Card
          title="Monthly Emissions by Category"
          subtitle="Cumulative monthly stack of electricity, transport, and waste"
        >
          <CategoryBarChart data={filteredData} height={300} stacked={true} />
        </Card>

        <Card
          title="Emissions Rate Trendlines"
          subtitle="Individual category trajectory over the chosen evaluation period"
        >
          <EmissionsTrendChart data={filteredData} height={300} showTotalLine={true} />
        </Card>
      </div>

      {/* Intensity Chart */}
      <Card
        title="Campus Carbon Intensity Profile"
        subtitle="Tracking normalized efficiency per student (kgCO2e) and per m² built-up footprint"
      >
        <IntensityChart data={intensityData} height={260} />
      </Card>

      {/* Multi-Period Backend Trends (if available) */}
      {periodTrends.length > 0 && (
        <Card
          title="Multi-Year Longitudinal Trends (/api/v1/analytics/trends)"
          subtitle="Annualized reporting period emissions comparison verified by calculation engine"
          action={
            <Badge variant="success" icon={<TrendingDown size={12} />}>
              Longitudinal Reductions
            </Badge>
          }
        >
          <div className="table-container" style={{ marginTop: '0.5rem' }}>
            <table className="canopy-table">
              <thead>
                <tr>
                  <th>Period Label</th>
                  <th>Date Range</th>
                  <th>Total Emissions (tCO2e)</th>
                  <th>Total Mass (kgCO2e)</th>
                  <th>Audit Completeness</th>
                </tr>
              </thead>
              <tbody>
                {periodTrends.map(t => (
                  <tr key={t.period_id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.label}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {t.start_date} to {t.end_date}
                    </td>
                    <td style={{ fontFamily: 'var(--font-editorial)', fontWeight: 700, color: 'var(--sage)', fontSize: '1.05rem' }}>
                      {t.total_tco2e.toFixed(3)} t
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {t.total_kg_co2e.toLocaleString()} kg
                    </td>
                    <td>
                      <Badge variant={t.completeness_status === 'complete' ? 'success' : 'warning'}>
                        {t.completeness_status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Month-by-Month Tabular Breakdown */}
      <Card
        title="Month-by-Month Carbon Inventory"
        subtitle="Auditable monthly activity sums, verified status, and per-capita intensity"
        action={
          <Badge variant="success" icon={<CheckCircle2 size={12} />}>
            100% Invoices Logged
          </Badge>
        }
      >
        <div className="table-container" style={{ marginTop: '0.5rem' }}>
          <table className="canopy-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Electricity (t)</th>
                <th>Transport (t)</th>
                <th>Waste (t)</th>
                <th>Total (tCO2e)</th>
                <th>Per-Student (kg)</th>
                <th>Confidence Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(m => (
                <tr key={m.month}>
                  <td style={{ fontWeight: 600 }}>{m.month_name}</td>
                  <td style={{ color: 'var(--sage)' }}>{m.electricity_t_co2e.toFixed(1)}</td>
                  <td style={{ color: 'var(--ochre)' }}>{m.transport_t_co2e.toFixed(1)}</td>
                  <td style={{ color: '#6B705C' }}>{m.waste_t_co2e.toFixed(1)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {m.total_t_co2e.toFixed(1)}
                  </td>
                  <td>
                    {Math.round(((m.total_t_co2e * 1000) / campus.studentCount) * 10) / 10} kg
                  </td>
                  <td>
                    <Badge variant={m.is_complete ? 'success' : 'warning'}>
                      {m.is_complete ? 'Verified' : 'Draft'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
