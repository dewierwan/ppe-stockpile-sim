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
} from 'recharts';
import { SimulationResults } from '@/lib/simulation';

interface SupplyDemandChartProps {
  results: SimulationResults;
}

export default function SupplyDemandChart({ results }: SupplyDemandChartProps) {
  const { dailyData } = results;

  const chartData = dailyData.map((day) => ({
    day: day.day,
    dailySupply: day.dailySupply / 1_000_000,
    dailyDemand: day.dailyDemand / 1_000_000,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-full">
      <h2 className="text-lg font-bold mb-4">Daily Supply vs Demand</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis label={{ value: 'M/day', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value: number) => value.toFixed(2) + 'M'}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Legend />
          <Line type="monotone" dataKey="dailySupply" stroke="#10b981" strokeWidth={2} name="Supply" dot={false} />
          <Line type="monotone" dataKey="dailyDemand" stroke="#ef4444" strokeWidth={2} name="Demand" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
