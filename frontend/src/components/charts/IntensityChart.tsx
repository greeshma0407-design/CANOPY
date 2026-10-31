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
        <div style={{ color: '#A5B58B', marginBottom: '0.2rem' }}>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#232B24" />
          <XAxis
            dataKey="month"
            stroke="#737A6E"
            tick={{ fill: '#A7ADA1', fontSize: 12 }}
            tickLine={{ stroke: '#303A30' }}
          />
          <YAxis
            stroke="#737A6E"
            tick={{ fill: '#A7ADA1', fontSize: 12 }}
            tickLine={{ stroke: '#303A30' }}
            unit=" kg"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={32}
            wrapperStyle={{ paddingTop: '6px', fontSize: '12px' }}
            formatter={(value) => <span style={{ color: '#A7ADA1' }}>{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="perStudentKg"
            name="Emissions per Student (kgCO2e)"
            stroke="#A5B58B"
            strokeWidth={2}
            dot={{ r: 3, fill: '#A5B58B' }}
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
