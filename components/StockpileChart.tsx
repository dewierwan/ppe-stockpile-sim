'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SimulationResults } from '@/lib/simulation';

interface StockpileChartProps {
  results: SimulationResults;
}

export default function StockpileChart({ results }: StockpileChartProps) {
  const { dailyData, shortfallDay } = results;

  const chartData = dailyData.map((day) => ({
    day: day.day,
    stockpile: day.stockpile / 1_000_000,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-full">
      <h2 className="text-lg font-bold mb-4">Stockpile Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis label={{ value: 'Millions', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value: number) => value.toFixed(0) + 'M'}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Legend />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="stockpile" stroke="#8b5cf6" strokeWidth={2} name="Stockpile" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      {shortfallDay !== null && (
        <p className="text-sm text-red-600 mt-2">
          Depleted on <strong>Day {shortfallDay}</strong>
        </p>
      )}
    </div>
  );
}
