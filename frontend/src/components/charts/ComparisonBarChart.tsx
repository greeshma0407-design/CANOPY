import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ComparisonDataPoint {
  category: string;
  Baseline: number;
  Proposed: number;
  Reduction: number;
  ReductionPct: number;
}

interface ComparisonBarChartProps {
  data: ComparisonDataPoint[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as ComparisonDataPoint;
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E6E1D6',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          boxShadow: '0 4px 14px rgba(43, 45, 66, 0.08)',
          fontSize: '0.82rem'
        }}
      >
        <div style={{ fontWeight: 600, color: '#2B2D42', marginBottom: '0.4rem' }}>
          {label}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#555A64' }}>
          <span>Current Baseline:</span>
          <strong style={{ color: '#2B2D42' }}>{item.Baseline} tCO2e</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#555A64' }}>
          <span>Projected:</span>
          <strong style={{ color: '#365A40' }}>{item.Proposed} tCO2e</strong>
        </div>
        <div
          style={{
            marginTop: '0.4rem',
            paddingTop: '0.4rem',
            borderTop: '1px solid #E6E1D6',
            color: '#365A40',
            fontWeight: 600
          }}
        >
          Projected Reduction: {item.Reduction} tCO2e ({item.ReductionPct}%)
        </div>
      </div>
    );
  }
  return null;
};

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  data,
  height = 300
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFECE4" />
          <XAxis
            dataKey="category"
            stroke="#7E8490"
            tick={{ fill: '#555A64', fontSize: 12 }}
            tickLine={{ stroke: '#E6E1D6' }}
          />
          <YAxis
            stroke="#7E8490"
            tick={{ fill: '#555A64', fontSize: 12 }}
            tickLine={{ stroke: '#E6E1D6' }}
            unit=" t"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }}
            formatter={(value) => <span style={{ color: '#555A64' }}>{value}</span>}
          />
          <Bar
            dataKey="Baseline"
            name="Current Emissions"
            fill="#6B705C" // sage
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="Proposed"
            name="Projected Emissions"
            fill="#365A40" // forest green
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
