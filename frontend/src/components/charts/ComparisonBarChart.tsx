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
          backgroundColor: '#1B211C',
          border: '1px solid #303A30',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          fontSize: '0.82rem'
        }}
      >
        <div style={{ fontWeight: 600, color: '#F2EFE5', marginBottom: '0.4rem' }}>
          {label}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#A7ADA1' }}>
          <span>Baseline:</span>
          <strong style={{ color: '#F2EFE5' }}>{item.Baseline} tCO2e</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: '#A7ADA1' }}>
          <span>Proposed:</span>
          <strong style={{ color: '#A5B58B' }}>{item.Proposed} tCO2e</strong>
        </div>
        <div
          style={{
            marginTop: '0.4rem',
            paddingTop: '0.4rem',
            borderTop: '1px solid #303A30',
            color: '#8FD895',
            fontWeight: 600
          }}
        >
          Avoided: {item.Reduction} tCO2e ({item.ReductionPct}%)
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
          <CartesianGrid strokeDasharray="3 3" stroke="#232B24" />
          <XAxis
            dataKey="category"
            stroke="#737A6E"
            tick={{ fill: '#A7ADA1', fontSize: 12 }}
            tickLine={{ stroke: '#303A30' }}
          />
          <YAxis
            stroke="#737A6E"
            tick={{ fill: '#A7ADA1', fontSize: 12 }}
            tickLine={{ stroke: '#303A30' }}
            unit=" t"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }}
            formatter={(value) => <span style={{ color: '#A7ADA1' }}>{value}</span>}
          />
          <Bar
            dataKey="Baseline"
            name="Baseline (CY 2025)"
            fill="#6B705C" // olive/gray
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="Proposed"
            name="Modelled Scenario"
            fill="#A5B58B" // sage
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
