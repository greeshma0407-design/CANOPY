import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { MonthlyEmissions } from '../../types';

interface EmissionsTrendChartProps {
  data: MonthlyEmissions[];
  height?: number;
  showTotalLine?: boolean;
}

// Clean nature-inspired tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E6E1D6',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          boxShadow: '0 4px 14px rgba(43, 45, 66, 0.08)'
        }}
      >
        <div style={{ fontWeight: 600, color: '#2B2D42', marginBottom: '0.4rem', fontSize: '0.88rem' }}>
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div
            key={`item-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              fontSize: '0.82rem',
              color: '#555A64',
              margin: '0.25rem 0'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: entry.color
                }}
              />
              {entry.name}:
            </span>
            <span style={{ fontWeight: 600, color: '#2B2D42' }}>
              {entry.value} tCO2e
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const EmissionsTrendChart: React.FC<EmissionsTrendChartProps> = ({
  data,
  height = 320,
  showTotalLine = true
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
            width: '48px',
            height: '48px',
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
          <TrendingUp size={22} />
        </div>
        <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          No monthly trend data available
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '360px', lineHeight: 1.5 }}>
          As you log utility invoices and activity records for your campus, monthly trend lines will automatically appear here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
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
            formatter={(value) => <span style={{ color: '#555A64', fontSize: '0.82rem' }}>{value}</span>}
          />
          {showTotalLine && (
            <Line
              type="monotone"
              dataKey="total_t_co2e"
              name="Total Campus"
              stroke="#2B2D42"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#2B2D42' }}
              activeDot={{ r: 6 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="electricity_t_co2e"
            name="Electricity"
            stroke="#365A40" // forest green
            strokeWidth={2}
            dot={{ r: 2, fill: '#365A40' }}
          />
          <Line
            type="monotone"
            dataKey="transport_t_co2e"
            name="Transport"
            stroke="#D4A373" // earth ochre
            strokeWidth={2}
            dot={{ r: 2, fill: '#D4A373' }}
          />
          <Line
            type="monotone"
            dataKey="waste_t_co2e"
            name="Waste"
            stroke="#6B705C" // sage
            strokeWidth={2}
            dot={{ r: 2, fill: '#6B705C' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
