import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
  Coins,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { mockRecommendations } from '../../data/recommendations';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Recommendation, RecommendationStatus, ImpactLevel } from '../../types';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useLocalStorage<Recommendation[]>(
    'canopy_recommendations_list',
    mockRecommendations
  );

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'impact' | 'effort' | 'category'>('impact');

  // Expanded assumptions accordion state (set of recommendation IDs)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleUpdateStatus = (id: string, newStatus: RecommendationStatus) => {
    setRecommendations(prev =>
      prev.map(rec => (rec.id === id ? { ...rec, status: newStatus } : rec))
    );
  };

  const handleResetDefaults = () => {
    setRecommendations(mockRecommendations);
    setCategoryFilter('all');
    setImpactFilter('all');
    setStatusFilter('all');
  };

  // Filter logic
  const filtered = recommendations.filter(rec => {
    if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;
    if (impactFilter !== 'all' && rec.impact_level !== impactFilter) return false;
    if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
    return true;
  });

  // Sort logic
  const impactOrder: Record<ImpactLevel, number> = {
    'Very High': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  const effortOrder = {
    'Low': 1,
    'Medium': 2,
    'High': 3
  };

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'impact') {
      return (impactOrder[b.impact_level] || 0) - (impactOrder[a.impact_level] || 0) || b.estimated_annual_savings_t_co2e - a.estimated_annual_savings_t_co2e;
    }
    if (sortBy === 'effort') {
      return (effortOrder[a.effort_level] || 0) - (effortOrder[b.effort_level] || 0);
    }
    if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    }
    return 0;
  });

  // Summary counts
  const totalPotentialAvoided = recommendations.reduce((acc, r) => acc + r.estimated_annual_savings_t_co2e, 0);
  const inProgressCount = recommendations.filter(r => r.status === 'In Progress').length;
  const completedCount = recommendations.filter(r => r.status === 'Completed').length;

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
            Decarbonization Recommendations
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Prioritized capital projects and behavioral shifts with cost-payback and carbon provenance.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="illustrative">Illustrative Cost & Carbon Savings</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            icon={<RotateCcw size={14} />}
          >
            Reset Statuses
          </Button>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid-cols-4">
        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Total Reduction Potential
          </div>
          <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--sage)', marginTop: '0.3rem' }}>
            {totalPotentialAvoided.toFixed(0)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>tCO2e/yr</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Across all 8 evaluated initiatives
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Active in Pipeline
          </div>
          <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--ochre)', marginTop: '0.3rem' }}>
            {inProgressCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Projects</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Currently in active deployment
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Completed Interventions
          </div>
          <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: '#8FD895', marginTop: '0.3rem' }}>
            {completedCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Verified</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Delivered in CY 2025
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Average Payback Period
          </div>
          <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.3rem' }}>
            1.4 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Years</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Rapid energy cost recoupment
          </div>
        </Card>
      </div>

      {/* Filter and Sorting Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          backgroundColor: 'var(--card-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          gap: '1rem'
        }}
      >
        {/* Category & Impact Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Filter size={15} color="var(--sage)" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--card-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="all">All Categories</option>
              <option value="electricity">Electricity (Scope 2)</option>
              <option value="transport">Transportation (Scope 3)</option>
              <option value="waste">Waste & Disposal (Scope 3)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Impact:</span>
            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--card-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="all">All Impact Tiers</option>
              <option value="Very High">Very High (>100 t)</option>
              <option value="High">High (35 - 100 t)</option>
              <option value="Medium">Medium (15 - 35 t)</option>
              <option value="Low">Low (&lt;15 t)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--card-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <ArrowUpDown size={14} />
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'impact' | 'effort' | 'category')}
            style={{
              backgroundColor: 'var(--card-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '0.3rem 0.6rem',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          >
            <option value="impact">Impact Level (High to Low)</option>
            <option value="effort">Implementation Effort (Low to High)</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {sorted.map(rec => {
          const isExpanded = expandedIds.has(rec.id);
          return (
            <Card key={rec.id} elevated={rec.status === 'In Progress'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Top Row: Title, Category Badge, Impact & Effort Badges, Status Select */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                        {rec.title}
                      </h3>
                      <Badge variant="neutral">{rec.category_label}</Badge>
                      <Badge
                        variant={
                          rec.impact_level === 'Very High' || rec.impact_level === 'High'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {rec.impact_level} Impact
                      </Badge>
                      <Badge variant="info">{rec.effort_level} Effort</Badge>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {rec.short_description}
                    </p>
                  </div>

                  {/* Right Column: Estimated Impact & Status Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.65rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--sage)' }}>
                        ↓ {rec.estimated_annual_savings_t_co2e} tCO2e/yr
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ochre)' }}>
                        Illustrative Estimate
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status:</span>
                      <select
                        value={rec.status}
                        onChange={(e) => handleUpdateStatus(rec.id, e.target.value as RecommendationStatus)}
                        style={{
                          backgroundColor:
                            rec.status === 'Completed'
                              ? 'rgba(78, 135, 82, 0.2)'
                              : rec.status === 'In Progress'
                              ? 'rgba(212, 163, 115, 0.2)'
                              : 'var(--card-elevated)',
                          borderColor:
                            rec.status === 'Completed'
                              ? 'var(--color-success)'
                              : rec.status === 'In Progress'
                              ? 'var(--ochre)'
                              : 'var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Economic & Timeline Details Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Investment:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                      {rec.cost_estimate}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Payback Period:</span>
                    <div style={{ fontWeight: 600, color: 'var(--sage)', marginTop: '0.15rem' }}>
                      {rec.payback_period}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Target Quarter:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                      {rec.target_quarter} ({rec.timeline})
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Accounting Rule:</span>
                    <div style={{ fontWeight: 500, color: 'var(--ochre)', marginTop: '0.15rem' }}>
                      <code>{rec.rule_key}</code>
                    </div>
                  </div>
                </div>

                {/* Collapsible Assumptions & Methodology Accordion */}
                <div>
                  <button
                    onClick={() => toggleExpand(rec.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--sage)',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: 0
                    }}
                  >
                    <span>{isExpanded ? 'Hide Calculation Assumptions' : 'View Calculation Assumptions & Rationale'}</span>
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '1rem',
                        backgroundColor: 'var(--card-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem'
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Scientific Rationale:</strong>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.82rem' }}>
                          {rec.rationale}
                        </p>
                      </div>

                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Underlying Baseline Assumptions:</strong>
                        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
                          {rec.assumptions.map((asm, idx) => (
                            <li key={idx} style={{ marginBottom: '0.2rem' }}>{asm}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Co-Benefits:</strong>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                          {rec.co_benefits.map((benefit, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--card-elevated)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-secondary)',
                                fontSize: '0.75rem'
                              }}
                            >
                              ✓ {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
