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

interface IntensityPoint {
  month: string;
  perStudentKg: number;
  perSqMkg: number;
}

interface IntensityChartProps {
  data: IntensityPoint[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
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
        <div style={{ color: '#365A40', marginBottom: '0.2rem' }}>
          Per Student: <strong>{payload[0]?.value} kgCO2e</strong>
        </div>
        <div style={{ color: '#D4A373' }}>
          Per Built-Up Area: <strong>{payload[1]?.value} kgCO2e/m²</strong>
        </div>
      </div>
    );
  }
  return null;
};

export const IntensityChart: React.FC<IntensityChartProps> = ({
  data,
  height = 260
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFECE4" />
          <XAxis
            dataKey="month"
            stroke="#7E8490"
            tick={{ fill: '#555A64', fontSize: 12 }}
            tickLine={{ stroke: '#E6E1D6' }}
          />
          <YAxis
            stroke="#7E8490"
            tick={{ fill: '#555A64', fontSize: 12 }}
            tickLine={{ stroke: '#E6E1D6' }}
            unit=" kg"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={32}
            wrapperStyle={{ paddingTop: '6px', fontSize: '12px' }}
            formatter={(value) => <span style={{ color: '#555A64' }}>{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="perStudentKg"
            name="Emissions per Student (kgCO2e)"
            stroke="#365A40"
            strokeWidth={2}
            dot={{ r: 3, fill: '#365A40' }}
          />
          <Line
            type="monotone"
            dataKey="perSqMkg"
            name="Emissions per m² Built-Up Area (kgCO2e/m²)"
            stroke="#D4A373"
            strokeWidth={2}
            dot={{ r: 3, fill: '#D4A373' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
