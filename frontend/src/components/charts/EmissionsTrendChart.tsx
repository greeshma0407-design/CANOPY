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
import { MonthlyEmissions } from '../../types';

interface EmissionsTrendChartProps {
  data: MonthlyEmissions[];
  height?: number;
  showTotalLine?: boolean;
}

// Custom dark botanical tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#1B211C',
          border: '1px solid #303A30',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ fontWeight: 600, color: '#F2EFE5', marginBottom: '0.4rem', fontSize: '0.88rem' }}>
          {label} 2025
        </div>
        {payload.map((entry: any, index: number) => (
          <div
            key={`item-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              fontSize: '0.8rem',
              color: '#A7ADA1',
              margin: '0.2rem 0'
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
            <span style={{ fontWeight: 600, color: '#F2EFE5' }}>
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
  return (
    <div style={{ width: '100%', height, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
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
          {showTotalLine && (
            <Line
              type="monotone"
              dataKey="total_t_co2e"
              name="Total Campus"
              stroke="#F2EFE5"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#F2EFE5' }}
              activeDot={{ r: 6 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="electricity_t_co2e"
            name="Electricity"
            stroke="#A5B58B" // sage
            strokeWidth={2}
            dot={{ r: 2, fill: '#A5B58B' }}
          />
          <Line
            type="monotone"
            dataKey="transport_t_co2e"
            name="Transport"
            stroke="#D4A373" // ochre
            strokeWidth={2}
            dot={{ r: 2, fill: '#D4A373' }}
          />
          <Line
            type="monotone"
            dataKey="waste_t_co2e"
            name="Waste"
            stroke="#6B705C" // olive
            strokeWidth={2}
            dot={{ r: 2, fill: '#6B705C' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
