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
          backgroundColor: '#1B211C',
          border: '1px solid #303A30',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          fontSize: '0.82rem'
        }}
      >
        <div style={{ fontWeight: 600, color: '#F2EFE5', marginBottom: '0.4rem' }}>
          {label} 2025
        </div>
        {payload.map((entry: any, index: number) => (
          <div
            key={`bar-tt-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              color: '#A7ADA1',
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
            <span style={{ fontWeight: 600, color: '#F2EFE5' }}>
              {entry.value} t
            </span>
          </div>
        ))}
        <div
          style={{
            marginTop: '0.4rem',
            paddingTop: '0.4rem',
            borderTop: '1px solid #303A30',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 600,
            color: '#F2EFE5'
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
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#232B24" />
          <XAxis
            dataKey="month_short"
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
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            formatter={(value) => <span style={{ color: '#A7ADA1' }}>{value}</span>}
          />
          <Bar
            dataKey="electricity_t_co2e"
            name="Electricity"
            stackId={stacked ? 'a' : undefined}
            fill="#A5B58B" // sage
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
          />
          <Bar
            dataKey="transport_t_co2e"
            name="Transport"
            stackId={stacked ? 'a' : undefined}
            fill="#D4A373" // ochre
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
          />
          <Bar
            dataKey="waste_t_co2e"
            name="Waste"
            stackId={stacked ? 'a' : undefined}
            fill="#6B705C" // olive
            radius={stacked ? [4, 4, 0, 0] : [4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
