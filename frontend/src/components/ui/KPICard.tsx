import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ElementType;
  trendPct?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  periodComparison?: string;
  isDesirableDown?: boolean; // For carbon emissions, down is good (success)
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  trendPct,
  trendDirection = 'neutral',
  periodComparison = 'vs last period',
  isDesirableDown = true,
  className = ''
}) => {
  // Determine color coding based on whether down is desirable
  let trendClass = 'trend-neutral';
  let TrendIcon = Minus;

  if (trendDirection === 'down') {
    TrendIcon = ArrowDownRight;
    trendClass = isDesirableDown ? 'trend-down' : 'trend-up';
  } else if (trendDirection === 'up') {
    TrendIcon = ArrowUpRight;
    trendClass = isDesirableDown ? 'trend-up' : 'trend-down';
  }

  return (
    <div className={`kpi-card ${className}`}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <div className="kpi-icon-wrap">
          <Icon size={18} />
        </div>
      </div>

      <div className="kpi-value-row">
        <span className="kpi-value">{value}</span>
        <span className="kpi-unit">{unit}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
        {trendPct !== undefined ? (
          <div className={`kpi-trend ${trendClass}`}>
            <TrendIcon size={14} />
            <span>{Math.abs(trendPct)}%</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.2rem' }}>
              {periodComparison}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {periodComparison}
          </span>
        )}
      </div>
    </div>
  );
};
