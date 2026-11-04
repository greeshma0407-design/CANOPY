import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { canopyApi, RecommendationRead } from '../../utils/apiClient';
import { Recommendation, RecommendationStatus, ImpactLevel } from '../../types';

// Map backend RecommendationRead → frontend Recommendation type
function mapApiRec(r: RecommendationRead): Recommendation {
  let assumptions: string[] = [];
  let co_benefits: string[] = [];

  try {
    assumptions = typeof r.assumptions === 'string'
      ? JSON.parse(r.assumptions)
      : (r.assumptions as string[]) || [];
  } catch { assumptions = []; }

  try {
    co_benefits = typeof r.co_benefits === 'string'
      ? JSON.parse(r.co_benefits)
      : (r.co_benefits as string[]) || [];
  } catch { co_benefits = []; }

  return {
    id: r.id,
    title: r.title,
    category: r.category as Recommendation['category'],
    category_label: r.category.charAt(0).toUpperCase() + r.category.slice(1),
    short_description: r.short_description,
    rationale: r.rationale || '',
    effort_level: r.effort_level as Recommendation['effort_level'],
    impact_level: r.impact_level as ImpactLevel,
    priority: r.priority,
    rule_key: r.rule_key,
    assumptions,
    co_benefits,
    estimated_annual_savings_t_co2e: r.estimated_annual_savings_tco2e || 0,
    cost_estimate: r.cost_estimate || '—',
    payback_period: r.payback_period || '—',
    target_quarter: r.target_quarter || '—',
    timeline: r.timeline || '—',
    status: (r.status || 'Pending') as RecommendationStatus,
  };
}

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'impact' | 'effort' | 'category'>('impact');

  // Expanded assumptions accordion state (set of recommendation IDs)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await canopyApi.getRecommendations();
      setRecommendations(data.map(mapApiRec));
      setIsLive(true);
    } catch (err: unknown) {
      console.warn('[CANOPY] Recommendations API error:', err);
      setApiError('Backend unreachable — no recommendations loaded.');
      setIsLive(false);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRecommendations(); }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleUpdateStatus = (id: string, newStatus: RecommendationStatus) => {
    setRecommendations(prev =>
      prev.map(rec => (rec.id === id ? { ...rec, status: newStatus } : rec))
    );
  };

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setImpactFilter('all');
    setStatusFilter('all');
  };

  const filtered = recommendations.filter(rec => {
    if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;
    if (impactFilter !== 'all' && rec.impact_level !== impactFilter) return false;
    if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
    return true;
  });

  const impactOrder: Record<ImpactLevel, number> = {
    'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1
  };
  const effortOrder: Record<string, number> = { 'Low': 1, 'Medium': 2, 'High': 3 };

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'impact') {
      return (impactOrder[b.impact_level] || 0) - (impactOrder[a.impact_level] || 0)
        || b.estimated_annual_savings_t_co2e - a.estimated_annual_savings_t_co2e;
    }
    if (sortBy === 'effort') {
      return (effortOrder[a.effort_level] || 0) - (effortOrder[b.effort_level] || 0);
    }
    if (sortBy === 'category') { return a.category.localeCompare(b.category); }
    return 0;
  });

  const totalPotentialAvoided = recommendations.reduce((acc, r) => acc + r.estimated_annual_savings_t_co2e, 0);
  const inProgressCount = recommendations.filter(r => r.status === 'In Progress').length;
  const completedCount = recommendations.filter(r => r.status === 'Completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>Decarbonization Recommendations</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Prioritized capital projects and behavioral shifts with cost-payback and carbon provenance.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isLive
            ? <Badge variant="success">Live Backend Data</Badge>
            : <Badge variant="illustrative">Illustrative Cost &amp; Carbon Savings</Badge>
          }
          <Button variant="ghost" size="sm" onClick={fetchRecommendations} icon={<RefreshCw size={14} />}>Refresh</Button>
          <Button variant="ghost" size="sm" onClick={handleResetFilters} icon={<RotateCcw size={14} />}>Reset Filters</Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} color="var(--sage)" style={{ margin: '0 auto 0.75rem auto' }} />
          <p>Loading recommendations from backend…</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && apiError && (
        <div style={{
          padding: '1rem 1.25rem', backgroundColor: 'rgba(192,87,70,0.1)', border: '1px solid rgba(192,87,70,0.3)',
          borderRadius: 'var(--radius-md)', color: '#FFAAA0', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} /><span>{apiError}</span>
        </div>
      )}

      {/* Summary */}
      {!isLoading && recommendations.length > 0 && (
        <div className="grid-cols-4">
          <Card>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Reduction Potential</div>
            <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--sage)', marginTop: '0.3rem' }}>
              {totalPotentialAvoided.toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>tCO2e/yr</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{recommendations.length} active recommendations</div>
          </Card>
          <Card>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>In Progress</div>
            <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--ochre)', marginTop: '0.3rem' }}>{inProgressCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Active implementation</div>
          </Card>
          <Card>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Completed</div>
            <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: '#8FD895', marginTop: '0.3rem' }}>{completedCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Realized savings</div>
          </Card>
          <Card>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Shown (Filtered)</div>
            <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.3rem' }}>{sorted.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>of {recommendations.length} total</div>
          </Card>
        </div>
      )}

      {/* Filter Bar */}
      {!isLoading && recommendations.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.75rem 1rem',
          backgroundColor: 'var(--card-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={14} color="var(--sage)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>Filter:</span>
          </div>
          {['all', 'electricity', 'transport', 'waste'].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
              padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)',
              border: categoryFilter === cat ? '1px solid var(--sage)' : '1px solid var(--border)',
              backgroundColor: categoryFilter === cat ? 'var(--card-elevated)' : 'transparent',
              color: categoryFilter === cat ? 'var(--sage)' : 'var(--text-secondary)',
              fontSize: '0.75rem', cursor: 'pointer', textTransform: 'capitalize'
            }}>{cat === 'all' ? 'All Categories' : cat}</button>
          ))}
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />
          {['all', 'Very High', 'High', 'Medium', 'Low'].map(imp => (
            <button key={imp} onClick={() => setImpactFilter(imp)} style={{
              padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)',
              border: impactFilter === imp ? '1px solid var(--sage)' : '1px solid var(--border)',
              backgroundColor: impactFilter === imp ? 'var(--card-elevated)' : 'transparent',
              color: impactFilter === imp ? 'var(--sage)' : 'var(--text-secondary)',
              fontSize: '0.75rem', cursor: 'pointer'
            }}>{imp === 'all' ? 'All Impacts' : imp}</button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpDown size={13} color="var(--text-muted)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sort:</span>
            {(['impact', 'effort', 'category'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                padding: '0.25rem 0.55rem', borderRadius: 'var(--radius-sm)',
                border: sortBy === s ? '1px solid var(--sage)' : '1px solid var(--border)',
                backgroundColor: sortBy === s ? 'var(--card-elevated)' : 'transparent',
                color: sortBy === s ? 'var(--sage)' : 'var(--text-secondary)',
                fontSize: '0.75rem', cursor: 'pointer', textTransform: 'capitalize'
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Empty after filter */}
      {!isLoading && !apiError && recommendations.length === 0 && (
        <Card>
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Lightbulb size={32} color="var(--sage)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.35rem' }}>No recommendations found</h4>
            <p style={{ fontSize: '0.85rem' }}>No recommendations are currently available from the backend.</p>
          </div>
        </Card>
      )}
      {!isLoading && sorted.length === 0 && recommendations.length > 0 && (
        <Card>
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No recommendations match the current filters.{' '}
              <button onClick={handleResetFilters} style={{ color: 'var(--sage)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Reset filters
              </button>
            </p>
          </div>
        </Card>
      )}

      {/* Recommendation Cards */}
      {!isLoading && sorted.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sorted.map(rec => {
            const isExpanded = expandedIds.has(rec.id);
            const impactColor =
              rec.impact_level === 'Very High' ? '#8FD895'
              : rec.impact_level === 'High' ? 'var(--sage)'
              : rec.impact_level === 'Medium' ? 'var(--ochre)'
              : 'var(--text-muted)';

            return (
              <Card key={rec.id}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                        <Lightbulb size={16} color="var(--ochre)" />
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{rec.title}</span>
                        <Badge variant="neutral" style={{ textTransform: 'capitalize' }}>{rec.category}</Badge>
                        <Badge variant={rec.impact_level === 'Very High' || rec.impact_level === 'High' ? 'success' : 'neutral'}>
                          {rec.impact_level} Impact
                        </Badge>
                        <Badge variant="neutral">Effort: {rec.effort_level}</Badge>
                      </div>
                      <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {rec.short_description}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.5rem', fontWeight: 700, color: impactColor }}>
                        {rec.estimated_annual_savings_t_co2e.toFixed(1)}
                        <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.3rem' }}>tCO2e/yr</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                        {(['Pending', 'In Progress', 'Completed'] as RecommendationStatus[]).map(s => (
                          <button key={s} onClick={() => handleUpdateStatus(rec.id, s)} style={{
                            padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                            border: rec.status === s ? '1px solid var(--sage)' : '1px solid var(--border)',
                            backgroundColor: rec.status === s ? 'var(--card-elevated)' : 'transparent',
                            color: rec.status === s ? 'var(--sage)' : 'var(--text-muted)',
                            fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'
                          }}>
                            {s === 'Completed' ? <CheckCircle2 size={11} /> : s === 'In Progress' ? <Clock size={11} /> : <ShieldCheck size={11} />}
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cost / Timeline row */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
                    padding: '0.75rem 1rem', backgroundColor: 'var(--card-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Estimated Investment:</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{rec.cost_estimate}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Payback Period:</span>
                      <div style={{ fontWeight: 600, color: 'var(--sage)', marginTop: '0.15rem' }}>{rec.payback_period}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Target Quarter:</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{rec.target_quarter} ({rec.timeline})</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Accounting Rule:</span>
                      <div style={{ fontWeight: 500, color: 'var(--ochre)', marginTop: '0.15rem' }}><code>{rec.rule_key}</code></div>
                    </div>
                  </div>

                  {/* Accordion */}
                  <div>
                    <button onClick={() => toggleExpand(rec.id)} style={{
                      background: 'none', border: 'none', color: 'var(--sage)', fontSize: '0.82rem',
                      fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0
                    }}>
                      <span>{isExpanded ? 'Hide Calculation Assumptions' : 'View Calculation Assumptions & Rationale'}</span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    {isExpanded && (
                      <div style={{
                        marginTop: '0.75rem', padding: '1rem', backgroundColor: 'var(--card-primary)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem',
                        display: 'flex', flexDirection: 'column', gap: '0.65rem'
                      }}>
                        {rec.rationale && (
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>Scientific Rationale:</strong>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.82rem' }}>{rec.rationale}</p>
                          </div>
                        )}
                        {rec.assumptions.length > 0 && (
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>Underlying Baseline Assumptions:</strong>
                            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
                              {rec.assumptions.map((asm, idx) => <li key={idx} style={{ marginBottom: '0.2rem' }}>{asm}</li>)}
                            </ul>
                          </div>
                        )}
                        {rec.co_benefits.length > 0 && (
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>Co-Benefits:</strong>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                              {rec.co_benefits.map((benefit, idx) => (
                                <span key={idx} style={{
                                  padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--card-elevated)', border: '1px solid var(--border)',
                                  color: 'var(--text-secondary)', fontSize: '0.75rem'
                                }}>🌿 {benefit}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
