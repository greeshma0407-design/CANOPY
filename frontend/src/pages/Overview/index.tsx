import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Bus,
  Trash2,
  Globe2,
  TreePine,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Calculator,
  Sliders,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { KPICard } from '../../components/ui/KPICard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmissionsTrendChart } from '../../components/charts/EmissionsTrendChart';
import { CategoryDonutChart } from '../../components/charts/CategoryDonutChart';
import { useCampusData } from '../../hooks/useCampusData';
import { mockRecommendations } from '../../data/recommendations';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    campus,
    selectedPeriod,
    monthlyEmissions,
    categoryBreakdowns,
    totalEmissions_t_co2e,
    dataCompletenessPct
  } = useCampusData();

  // Top 3 actionable recommendations for roadmap preview
  const topRoadmap = mockRecommendations.slice(0, 3);

  // Equivalent trees calculation for 68 tCO2e reduction achieved vs baseline
  const avoidedVsBaseline = 73.0; // 915 baseline - 842 current = 73 tCO2e avoided
  const treesEquivalent = Math.round((avoidedVsBaseline * 1000) / 22);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner / Context Line */}
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
            {campus.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Reporting Cycle: <strong style={{ color: 'var(--sage)' }}>{selectedPeriod.label}</strong> &bull; Location: {campus.location} &bull; Population: {campus.population.toLocaleString()}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="illustrative">Illustrative Demo Data</Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/calculator')}
            icon={<Calculator size={15} />}
          >
            Calculate Entry
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/simulator')}
            icon={<Sliders size={15} />}
          >
            Simulate Reductions
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid-cols-4">
        <KPICard
          label="Total Campus Emissions"
          value={totalEmissions_t_co2e}
          unit="tCO2e"
          icon={Globe2}
          trendPct={-8.0}
          trendDirection="down"
          periodComparison="vs CY 2024 baseline (915 t)"
          isDesirableDown={true}
        />
        <KPICard
          label="Electricity Share"
          value={522.0}
          unit="tCO2e (62%)"
          icon={Zap}
          trendPct={-5.0}
          trendDirection="down"
          periodComparison="vs previous year"
          isDesirableDown={true}
        />
        <KPICard
          label="Transport Share"
          value={202.0}
          unit="tCO2e (24%)"
          icon={Bus}
          trendPct={2.0}
          trendDirection="up"
          periodComparison="increased ridership"
          isDesirableDown={true}
        />
        <KPICard
          label="Waste & Landfill Share"
          value={118.0}
          unit="tCO2e (14%)"
          icon={Trash2}
          trendPct={-1.0}
          trendDirection="down"
          periodComparison="diverted composting"
          isDesirableDown={true}
        />
      </div>

      {/* Main Charts Row: Trend Line & Category Donut */}
      <div className="grid-cols-2-1">
        <Card
          title="Carbon Footprint Overview"
          subtitle="Monthly emissions trend across electricity, transport, and waste streams (tCO2e)"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Period:</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--sage)', fontWeight: 600 }}>12 Months (2025)</span>
            </div>
          }
        >
          <EmissionsTrendChart data={monthlyEmissions} height={310} />
        </Card>

        <Card
          title="Carbon Breakdown"
          subtitle="Proportional share by GHG emission category"
          action={<Badge variant="info">CY 2025</Badge>}
        >
          <CategoryDonutChart data={categoryBreakdowns} totalEmissions={totalEmissions_t_co2e} height={310} />
        </Card>
      </div>

      {/* Data Completeness & Quick Actions Row */}
      <div className="grid-cols-3">
        {/* Data Completeness Card */}
        <Card title="Data Quality & Completeness" subtitle="Inventory health score for active period">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Completeness Level</span>
              <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                High Confidence ({dataCompletenessPct}%)
              </Badge>
            </div>
            <ProgressBar value={dataCompletenessPct} max={100} color="var(--sage)" height={10} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Verified Utility Invoices:</span>
                <strong style={{ color: 'var(--text-primary)' }}>12 of 12 months</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Commuter Route Logs:</span>
                <strong style={{ color: 'var(--text-primary)' }}>11 of 12 months</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Waste Weighbridge Receipts:</span>
                <strong style={{ color: 'var(--text-primary)' }}>11 of 12 months</strong>
              </div>
            </div>
          </div>
        </Card>

        {/* Sustainability Impact Highlight */}
        <Card
          title="Sustainability Impact"
          subtitle="Equivalency of reductions achieved vs baseline"
          elevated
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(165, 181, 139, 0.15)',
                  color: 'var(--sage)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <TreePine size={32} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  {treesEquivalent.toLocaleString()} Trees
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Carbon absorption equivalent from <strong>{avoidedVsBaseline} tCO2e</strong> avoided emissions this cycle.
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--card-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}
            >
              Calculated at ~22 kg CO2 sequestered annually per mature urban tree in Telangana sub-tropical climate.
            </div>
          </div>
        </Card>

        {/* Quick Actions Card */}
        <Card title="Quick Actions" subtitle="Streamlined carbon workflows">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => navigate('/calculator')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Calculator size={16} color="var(--sage)" />
                <span>Input Activity Data</span>
              </span>
              <ArrowRight size={15} color="var(--text-muted)" />
            </button>

            <button
              onClick={() => navigate('/simulator')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Sliders size={16} color="var(--ochre)" />
                <span>Model Decarbonization</span>
              </span>
              <ArrowRight size={15} color="var(--text-muted)" />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <TrendingDown size={16} color="#8FD895" />
                <span>Export Annual Report</span>
              </span>
              <ArrowRight size={15} color="var(--text-muted)" />
            </button>
          </div>
        </Card>
      </div>

      {/* Lower Row: Reduction Roadmap Preview & Simulator Hero */}
      <div className="grid-cols-2">
        {/* Reduction Roadmap Timeline */}
        <Card
          title="Reduction Roadmap"
          subtitle="Top prioritized campus decarbonization interventions"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/recommendations')}
              icon={<ArrowRight size={14} />}
            >
              View All 8
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {topRoadmap.map(rec => (
              <div
                key={rec.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--card-elevated)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ maxWidth: '75%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {rec.title}
                    </span>
                    <Badge variant={rec.status === 'Completed' ? 'success' : rec.status === 'In Progress' ? 'warning' : 'neutral'}>
                      {rec.status}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                    {rec.short_description}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--sage)' }}>
                    ↓ {rec.estimated_annual_savings_t_co2e} t
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>per annum</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* What-If Simulator Feature Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1B211C 0%, #151B16 100%)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: '-20px',
              bottom: '-20px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(165,181,139,0.12) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} color="var(--ochre)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ochre)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Interactive Scenario Engine
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.45rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              What-If Campus Decarbonization Simulator
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '480px' }}>
              Explore how combinations of rooftop solar arrays, transit modal shifts, and organic dining hall composting can lower MLRIT's emissions toward Net-Zero.
            </p>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button
              variant="primary"
              onClick={() => navigate('/simulator')}
              icon={<Sliders size={16} />}
            >
              Launch Simulator
            </Button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Compare baseline 842 tCO2e vs customized targets
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
