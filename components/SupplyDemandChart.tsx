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
import { formatBigNumber, formatPerDay } from '@/lib/format';

interface SupplyDemandChartProps {
  results: SimulationResults;
}

export default function SupplyDemandChart({ results }: SupplyDemandChartProps) {
  const { dailyData } = results;

  const chartData = dailyData.map((day) => ({
    day: day.day,
    dailySupply: day.dailySupply,
    dailyDemand: day.dailyDemand,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-full">
      <h2 className="text-lg font-bold mb-4">Daily Supply vs Demand</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis width={70} tickFormatter={(v) => formatBigNumber(v as number)} />
          <Tooltip
            formatter={(value) => formatPerDay(value as number)}
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
