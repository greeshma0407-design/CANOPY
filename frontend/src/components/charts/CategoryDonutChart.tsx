import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { CategoryBreakdown } from '../../types';

interface CategoryDonutChartProps {
  data: CategoryBreakdown[];
  totalEmissions?: number;
  height?: number;
}

// Clean nature-inspired tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as CategoryBreakdown;
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E6E1D6',
          borderRadius: '8px',
          padding: '0.65rem 0.9rem',
          boxShadow: '0 4px 14px rgba(43, 45, 66, 0.08)',
          fontSize: '0.82rem'
        }}
      >
        <div style={{ fontWeight: 600, color: item.color, marginBottom: '0.2rem' }}>
          {item.label}
        </div>
        <div style={{ color: '#2B2D42', fontWeight: 600 }}>
          {item.emissions_t_co2e.toLocaleString()} tCO2e ({item.percentage}%)
        </div>
        <div style={{ fontSize: '0.75rem', color: '#555A64', marginTop: '0.2rem' }}>
          Trend: {item.trend_direction === 'down' ? '↓' : '↑'} {Math.abs(item.trend_pct)}% vs baseline
        </div>
      </div>
    );
  }
  return null;
};

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  totalEmissions = 0,
  height = 300
}) => {
  const hasData = totalEmissions > 0 && data.some(d => d.emissions_t_co2e > 0);

  if (!hasData) {
    return (
      <div
        style={{
          width: '100%',
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '1.5rem',
          backgroundColor: 'var(--warm-ivory)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border)'
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--white)',
            color: 'var(--sage)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            border: '1px solid var(--border)'
          }}
        >
          <PieIcon size={20} />
        </div>
        <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          No category emissions yet
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: 1.5 }}>
          Activity data entered in the Calculator will automatically appear in this category breakdown.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height, position: 'relative', minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="emissions_t_co2e"
            nameKey="label"
            cx="50%"
            cy="46%"
            innerRadius="62%"
            outerRadius="82%"
            paddingAngle={3}
            stroke="#FFFFFF"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={44}
            formatter={(value, entry: any) => {
              const breakdown = data.find(d => d.label === value);
              return (
                <span style={{ color: '#555A64', fontSize: '0.8rem', marginRight: '8px' }}>
                  {value} <strong style={{ color: entry.color }}>({breakdown?.percentage}%)</strong>
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label inside Donut Hole */}
      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -65%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: '1.85rem',
            fontWeight: 400,
            color: 'var(--charcoal)',
            lineHeight: 1
          }}
        >
          {totalEmissions}
        </span>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.15rem' }}>
          tCO2e Total
        </div>
      </div>
    </div>
  );
};
