import React, { useState, useEffect } from 'react';
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
  Sparkles,
  RefreshCw
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
import { canopyApi } from '../../utils/apiClient';
import { Recommendation } from '../../types';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    campus,
    selectedPeriod,
    monthlyEmissions,
    categoryBreakdowns,
    totalEmissions_t_co2e,
    dataCompletenessPct,
    isLoading,
    isLiveBackend,
    refetch
  } = useCampusData();

  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);

  useEffect(() => {
    canopyApi.getRecommendations()
      .then(apiRecs => {
        if (apiRecs && apiRecs.length > 0) {
          const mapped: Recommendation[] = apiRecs.map(r => ({
            id: r.id,
            title: r.title,
            category: r.category as 'electricity' | 'transport' | 'waste',
            category_label: r.category.charAt(0).toUpperCase() + r.category.slice(1),
            impact_level: r.impact_level as 'Low' | 'Medium' | 'High' | 'Very High',
            effort_level: r.effort_level as 'Low' | 'Medium' | 'High',
            status: r.status as 'Not Started' | 'Planned' | 'In Progress' | 'Completed',
            short_description: r.short_description,
            rationale: r.rationale || '',
            estimated_annual_savings_t_co2e: r.estimated_annual_savings_tco2e ?? 0,
            cost_estimate: r.cost_estimate || 'N/A',
            payback_period: r.payback_period || 'N/A',
            rule_key: r.rule_key,
            assumptions: typeof r.assumptions === 'string' ? JSON.parse(r.assumptions) : (r.assumptions || []),
            co_benefits: typeof r.co_benefits === 'string' ? JSON.parse(r.co_benefits) : (r.co_benefits || []),
            timeline: r.timeline || '',
            target_quarter: r.target_quarter || ''
          }));
          setRecommendations(mapped);
        }
      })
      .catch(() => {
        // Keep fallback mock recommendations if offline
      });
  }, []);

  // Top 3 actionable recommendations for roadmap preview
  const topRoadmap = recommendations.slice(0, 3);

  // Dynamic category calculations
  const elecBreakdown = categoryBreakdowns.find(c => c.category === 'electricity');
  const transBreakdown = categoryBreakdowns.find(c => c.category === 'transport');
  const wasteBreakdown = categoryBreakdowns.find(c => c.category === 'waste');

  const elecVal = elecBreakdown?.emissions_t_co2e ?? 0;
  const transVal = transBreakdown?.emissions_t_co2e ?? 0;
  const wasteVal = wasteBreakdown?.emissions_t_co2e ?? 0;

  const elecPct = elecBreakdown?.percentage ?? 0;
  const transPct = transBreakdown?.percentage ?? 0;
  const wastePct = wasteBreakdown?.percentage ?? 0;

  // Baseline comparison (CY 2024 baseline = 915.0 tCO2e)
  const baselineEmissions = 915.0;
  const avoidedVsBaseline = Math.max(0, Math.round((baselineEmissions - totalEmissions_t_co2e) * 10) / 10);
  const trendPctVsBaseline = Math.round(((totalEmissions_t_co2e - baselineEmissions) / baselineEmissions) * 100);
  const treesEquivalent = Math.round((avoidedVsBaseline * 1000) / 22);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', minWidth: 0 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
              {campus.name}
            </h1>
            <Badge variant={isLiveBackend ? 'success' : 'illustrative'}>
              {isLiveBackend ? 'Live API Connected' : 'Illustrative Demo Data'}
            </Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Reporting Cycle: <strong style={{ color: 'var(--sage)' }}>{selectedPeriod.label}</strong> &bull; Location: {campus.location} &bull; Population: {campus.population.toLocaleString()}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            icon={<RefreshCw size={14} className={isLoading ? 'spin' : ''} />}
          >
            Refresh Data
          </Button>
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
          trendPct={trendPctVsBaseline}
          trendDirection={trendPctVsBaseline <= 0 ? 'down' : 'up'}
          periodComparison={`vs CY 2024 baseline (${baselineEmissions} t)`}
          isDesirableDown={true}
        />
        <KPICard
          label="Electricity Share"
          value={elecVal}
          unit={`tCO2e (${elecPct}%)`}
          icon={Zap}
          trendPct={-5.0}
          trendDirection="down"
          periodComparison="vs previous year"
          isDesirableDown={true}
        />
        <KPICard
          label="Transport Share"
          value={transVal}
          unit={`tCO2e (${transPct}%)`}
          icon={Bus}
          trendPct={2.0}
          trendDirection="up"
          periodComparison="fleet + commuter routes"
          isDesirableDown={true}
        />
        <KPICard
          label="Waste & Landfill Share"
          value={wasteVal}
          unit={`tCO2e (${wastePct}%)`}
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
              <span style={{ fontSize: '0.78rem', color: 'var(--sage)', fontWeight: 600 }}>{selectedPeriod.label}</span>
            </div>
          }
        >
          <EmissionsTrendChart data={monthlyEmissions} height={310} />
        </Card>

        <Card
          title="Carbon Breakdown"
          subtitle="Proportional share by GHG emission category"
          action={<Badge variant="info">{selectedPeriod.label}</Badge>}
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
              <Badge variant={dataCompletenessPct >= 90 ? 'success' : 'warning'} icon={<CheckCircle2 size={12} />}>
                {dataCompletenessPct >= 90 ? 'High Confidence' : 'Partial Audit'} ({dataCompletenessPct}%)
              </Badge>
            </div>
            <ProgressBar value={dataCompletenessPct} max={100} color="var(--sage)" height={10} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span>Verified Utility Invoices:</span>
                <strong style={{ color: 'var(--text-primary)' }}>12 of 12 months</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span>Commuter Route Logs:</span>
                <strong style={{ color: 'var(--text-primary)' }}>12 of 12 months</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span>Waste Weighbridge Receipts:</span>
                <strong style={{ color: 'var(--text-primary)' }}>12 of 12 months</strong>
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
              View All {recommendations.length}
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
                  border: '1px solid var(--border)',
                  minWidth: 0,
                  gap: '0.75rem'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                      {rec.title}
                    </span>
                    <Badge variant={rec.status === 'Completed' ? 'success' : rec.status === 'In Progress' ? 'warning' : 'neutral'}>
                      {rec.status}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.35, wordBreak: 'break-word' }}>
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
            overflow: 'hidden',
            minWidth: 0
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
              Explore how combinations of rooftop solar arrays, transit modal shifts, and organic dining hall composting can lower {campus?.name || 'campus'} emissions toward Net-Zero.
            </p>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              onClick={() => navigate('/simulator')}
              icon={<Sliders size={16} />}
            >
              Launch Simulator
            </Button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Compare baseline {baselineEmissions} tCO2e vs customized targets
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
