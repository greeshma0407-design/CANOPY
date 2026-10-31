import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { CategoryBreakdown } from '../../types';

interface CategoryDonutChartProps {
  data: CategoryBreakdown[];
  totalEmissions?: number;
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as CategoryBreakdown;
    return (
      <div
        style={{
          backgroundColor: '#1B211C',
          border: '1px solid #303A30',
          borderRadius: '8px',
          padding: '0.65rem 0.85rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          fontSize: '0.82rem'
        }}
      >
        <div style={{ fontWeight: 600, color: item.color, marginBottom: '0.2rem' }}>
          {item.label}
        </div>
        <div style={{ color: '#F2EFE5', fontWeight: 600 }}>
          {item.emissions_t_co2e} tCO2e ({item.percentage}%)
        </div>
        <div style={{ fontSize: '0.75rem', color: '#A7ADA1', marginTop: '0.2rem' }}>
          Trend: {item.trend_direction === 'down' ? '↓' : '↑'} {Math.abs(item.trend_pct)}% vs baseline
        </div>
      </div>
    );
  }
  return null;
};

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  totalEmissions = 842,
  height = 280
}) => {
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
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
            stroke="#101410"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={40}
            formatter={(value, entry: any) => {
              const breakdown = data.find(d => d.label === value);
              return (
                <span style={{ color: '#A7ADA1', fontSize: '0.78rem', marginRight: '8px' }}>
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
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1
          }}
        >
          {totalEmissions}
        </span>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          tCO2e Total
        </div>
      </div>
    </div>
  );
};
