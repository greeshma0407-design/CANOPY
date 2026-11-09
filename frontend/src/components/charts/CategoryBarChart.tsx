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
import { BarChart3 } from 'lucide-react';
import { MonthlyEmissions } from '../../types';

interface CategoryBarChartProps {
  data: MonthlyEmissions[];
  height?: number;
  stacked?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc: number, cur: any) => acc + (cur.value || 0), 0);
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
        {payload.map((entry: any, index: number) => (
          <div
            key={`bar-tt-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              color: '#555A64',
              margin: '0.2rem 0'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  backgroundColor: entry.color
                }}
              />
              {entry.name}:
            </span>
            <span style={{ fontWeight: 600, color: '#2B2D42' }}>
              {entry.value} t
            </span>
          </div>
        ))}
        <div
          style={{
            marginTop: '0.4rem',
            paddingTop: '0.4rem',
            borderTop: '1px solid #E6E1D6',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 600,
            color: '#2B2D42'
          }}
        >
          <span>Total:</span>
          <span>{Math.round(total * 10) / 10} tCO2e</span>
        </div>
      </div>
    );
  }
  return null;
};

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  data,
  height = 320,
  stacked = true
}) => {
  const hasData = data && data.length > 0 && data.some(d => (d.total_t_co2e || 0) > 0);

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
          padding: '2rem',
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
            color: 'var(--forest-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            border: '1px solid var(--border)'
          }}
        >
          <BarChart3 size={20} />
        </div>
        <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          No emissions breakdown recorded
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: 1.5 }}>
          Activity data will populate this monthly breakdown as records are created.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFECE4" />
          <XAxis
            dataKey="month_short"
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
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            formatter={(value) => <span style={{ color: '#555A64' }}>{value}</span>}
          />
          <Bar
            dataKey="electricity_t_co2e"
            name="Electricity"
            stackId={stacked ? 'a' : undefined}
            fill="#365A40" // forest green
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
          />
          <Bar
            dataKey="transport_t_co2e"
            name="Transport"
            stackId={stacked ? 'a' : undefined}
            fill="#D4A373" // earth ochre
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
          />
          <Bar
            dataKey="waste_t_co2e"
            name="Waste"
            stackId={stacked ? 'a' : undefined}
            fill="#6B705C" // sage
            radius={stacked ? [4, 4, 0, 0] : [4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
