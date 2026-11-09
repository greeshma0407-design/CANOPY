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
  Calculator,
  Sliders,
  Sparkles,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { KPICard } from '../../components/ui/KPICard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmissionsTrendChart } from '../../components/charts/EmissionsTrendChart';
import { CategoryDonutChart } from '../../components/charts/CategoryDonutChart';
import { useCampusData } from '../../hooks/useCampusData';
import { useAuth } from '../../context/AuthContext';
import { mockRecommendations } from '../../data/recommendations';
import { canopyApi } from '../../utils/apiClient';
import { Recommendation } from '../../types';
import { NATURE_IMAGES } from '../../data/images';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    campus,
    selectedPeriod,
    monthlyEmissions,
    categoryBreakdowns,
    totalEmissions_t_co2e,
    dataCompletenessPct,
    isLoading,
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
        // Keep fallback recommendations if offline
      });
  }, []);

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

  // Baseline comparison only if actual data exists
  const hasRealData = totalEmissions_t_co2e > 0;
  const baselineEmissions = 915.0; // Historic MLRIT baseline
  const avoidedVsBaseline = hasRealData && totalEmissions_t_co2e < baselineEmissions
    ? Math.round((baselineEmissions - totalEmissions_t_co2e) * 10) / 10
    : 0;
  const trendPctVsBaseline = hasRealData
    ? Math.round(((totalEmissions_t_co2e - baselineEmissions) / baselineEmissions) * 100)
    : undefined;
  
  // Tree-equivalent only when documented and actual reductions exist
  const treesEquivalent = avoidedVsBaseline > 0
    ? Math.round((avoidedVsBaseline * 1000) / 22)
    : 0;

  const displayName = user?.full_name ? user.full_name.split(' ')[0] : 'Campus';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', minWidth: 0 }}>
      {/* Nature Photographic Hero Section */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: 'var(--forest-green)',
          boxShadow: 'var(--shadow-md)',
          minHeight: '210px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '2.25rem 2.5rem',
          color: 'var(--white)',
          backgroundImage: `linear-gradient(to right, rgba(43, 45, 66, 0.85) 0%, rgba(54, 90, 64, 0.75) 60%, rgba(54, 90, 64, 0.4) 100%), url(${NATURE_IMAGES.dashboardBanner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(6px)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem'
            }}
          >
            <TreePine size={13} />
            {selectedPeriod.label} Sustainability Cycle
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              color: 'var(--white)',
              lineHeight: 1.2,
              fontWeight: 400,
              marginBottom: '0.4rem'
            }}
          >
            Welcome, {displayName}.
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.98rem', lineHeight: 1.5 }}>
            {campus.name} &bull; {campus.location} &bull; Population: {campus.population.toLocaleString()}
          </p>
        </div>

        {/* Quick actions top-right on desktop */}
        <div
          style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
          className="dashboard-hero-actions"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={refetch}
            icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: 'var(--charcoal)', border: 'none' }}
          >
            Sync
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/calculator')}
            icon={<Calculator size={15} />}
            style={{ backgroundColor: 'var(--white)', color: 'var(--forest-green)', border: 'none', fontWeight: 600 }}
          >
            Calculate Entry
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid-cols-4">
        <KPICard
          label="Total Campus Emissions"
          value={hasRealData ? totalEmissions_t_co2e : '0.0'}
          unit="tCO2e"
          icon={Globe2}
          trendPct={trendPctVsBaseline}
          trendDirection={trendPctVsBaseline !== undefined && trendPctVsBaseline <= 0 ? 'down' : 'up'}
          periodComparison={hasRealData ? `vs baseline (${baselineEmissions} t)` : 'Awaiting activity data'}
          isDesirableDown={true}
        />
        <KPICard
          label="Electricity Stream"
          value={hasRealData ? elecVal : '0.0'}
          unit={hasRealData ? `tCO2e (${elecPct}%)` : 'tCO2e'}
          icon={Zap}
          periodComparison="Scope 2 Purchased Grid & Solar"
          isDesirableDown={true}
        />
        <KPICard
          label="Transport Stream"
          value={hasRealData ? transVal : '0.0'}
          unit={hasRealData ? `tCO2e (${transPct}%)` : 'tCO2e'}
          icon={Bus}
          periodComparison="Scope 3 Commuter & Shuttle Fleets"
          isDesirableDown={true}
        />
        <KPICard
          label="Waste & Landfill"
          value={hasRealData ? wasteVal : '0.0'}
          unit={hasRealData ? `tCO2e (${wastePct}%)` : 'tCO2e'}
          icon={Trash2}
          periodComparison="Scope 3 Municipal & Compost"
          isDesirableDown={true}
        />
      </div>

      {/* Main Charts Row: Trend Line & Category Donut */}
      <div className="grid-cols-2-1">
        <Card
          title="Emissions Trend"
          subtitle="Monthly carbon trajectory across electricity, transport, and waste (tCO2e)"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Period:</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--forest-green)', fontWeight: 600 }}>{selectedPeriod.label}</span>
            </div>
          }
        >
          <EmissionsTrendChart data={monthlyEmissions} height={310} />
        </Card>

        <Card
          title="Category Breakdown"
          subtitle="Proportional share by emission stream"
          action={<Badge variant="success">{selectedPeriod.label}</Badge>}
        >
          <CategoryDonutChart data={categoryBreakdowns} totalEmissions={totalEmissions_t_co2e} height={310} />
        </Card>
      </div>

      {/* Data Quality & Environmental Impact Row */}
      <div className="grid-cols-3">
        {/* Data Completeness Card */}
        <Card title="Inventory Completeness" subtitle="Data health score for the active cycle">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Coverage Level</span>
              <Badge variant={dataCompletenessPct >= 80 ? 'success' : dataCompletenessPct > 0 ? 'warning' : 'neutral'} icon={<CheckCircle2 size={12} />}>
                {dataCompletenessPct >= 80 ? 'High Confidence' : dataCompletenessPct > 0 ? 'Partial Data' : 'Initial Setup'} ({dataCompletenessPct}%)
              </Badge>
            </div>
            <ProgressBar value={dataCompletenessPct} max={100} color="var(--forest-green)" height={8} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={14} color="var(--forest-green)" /> Electricity Invoices:
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>{elecVal > 0 ? 'Logged' : 'Pending'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bus size={14} color="var(--earth-ochre)" /> Commuter Distance Logs:
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>{transVal > 0 ? 'Logged' : 'Pending'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trash2 size={14} color="var(--sage)" /> Waste Weighbridge Receipts:
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>{wasteVal > 0 ? 'Logged' : 'Pending'}</strong>
              </div>
            </div>
          </div>
        </Card>

        {/* Sustainability Impact Highlight — Only showing true data */}
        <Card
          title="Environmental Impact"
          subtitle="Documented emission reductions"
          elevated
        >
          {avoidedVsBaseline > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--forest-green-subtle)',
                    color: 'var(--forest-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <TreePine size={30} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                    {treesEquivalent.toLocaleString()} Trees
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Carbon absorption equivalent from <strong>{avoidedVsBaseline} tCO2e</strong> avoided vs baseline.
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem 0.9rem',
                  backgroundColor: 'var(--warm-ivory)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)'
                }}
              >
                Calculated at ~22 kg CO2 sequestered annually per mature urban tree in Indian sub-tropical climate.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '1.5rem 1rem',
                height: '100%',
                backgroundColor: 'var(--warm-ivory)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border)'
              }}
            >
              <TreePine size={28} color="var(--forest-green)" style={{ marginBottom: '0.65rem' }} />
              <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Campus Baseline
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: 1.45 }}>
                {hasRealData
                  ? `Active inventory at ${totalEmissions_t_co2e} tCO2e. Reductions achieved below the historic baseline will reflect tree-equivalent metrics here.`
                  : 'Log activity records to calculate your current emissions and track carbon mitigation progress.'}
              </p>
            </div>
          )}
        </Card>

        {/* Quick Actions Card */}
        <Card title="Quick Actions" subtitle="Direct workflow shortcuts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => navigate('/calculator')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Calculator size={16} color="var(--forest-green)" />
                <span>Calculate & Add Record</span>
              </span>
              <ArrowRight size={15} color="var(--text-muted)" />
            </button>

            <button
              onClick={() => navigate('/simulator')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Sliders size={16} color="var(--earth-ochre)" />
                <span>Simulate Decarbonization</span>
              </span>
              <ArrowRight size={15} color="var(--text-muted)" />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FileSpreadsheet size={16} color="var(--sage)" />
                <span>Download Compliance Report</span>
              </span>
              <ArrowRight size={15} color="var(--text-muted)" />
            </button>
          </div>
        </Card>
      </div>

      {/* Lower Row: Reduction Roadmap Preview & Simulator Feature */}
      <div className="grid-cols-2">
        {/* Reduction Roadmap */}
        <Card
          title="Recommended Interventions"
          subtitle="Top prioritized actions for this cycle"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/recommendations')}
              icon={<ArrowRight size={14} />}
            >
              View All ({recommendations.length})
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
            {topRoadmap.map(rec => (
              <div
                key={rec.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--warm-ivory)',
                  border: '1px solid var(--border)',
                  minWidth: 0,
                  gap: '0.75rem'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {rec.title}
                    </span>
                    <Badge variant={rec.status === 'Completed' ? 'success' : rec.status === 'In Progress' ? 'warning' : 'neutral'}>
                      {rec.status}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {rec.short_description}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.15rem', color: 'var(--forest-green)' }}>
                    ↓ {rec.estimated_annual_savings_t_co2e} t
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>annual savings</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Decarbonization Simulator Feature Card */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} color="var(--forest-green)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--forest-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Scenario Analysis
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.45rem', color: 'var(--charcoal)', marginBottom: '0.5rem', fontWeight: 400 }}>
              What-If Decarbonization Simulator
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '480px' }}>
              Explore how combinations of rooftop solar arrays, transit fleet electrification, and organic dining hall composting can lower campus emissions toward Net-Zero.
            </p>
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              onClick={() => navigate('/simulator')}
              icon={<Sliders size={16} />}
            >
              Launch Simulator
            </Button>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Interactive scenario modeling with instant feedback
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-hero-actions {
            position: static !important;
            margin-top: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};
