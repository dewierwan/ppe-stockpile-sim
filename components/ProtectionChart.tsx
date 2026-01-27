'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SimulationResults } from '@/lib/simulation';

interface ProtectionChartProps {
  results: SimulationResults;
}

export default function ProtectionChart({ results }: ProtectionChartProps) {
  const { dailyData, minProtectionRate } = results;

  const chartData = dailyData.map((day) => ({
    day: day.day,
    protectionRate: day.protectionRate,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-full">
      <h2 className="text-lg font-bold mb-4">Critical Workers Protected</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="protectionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value) => (value as number).toFixed(1) + '%'}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Legend />
          <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="protectionRate" stroke="#10b981" strokeWidth={2} fill="url(#protectionGradient)" name="Protected" />
        </AreaChart>
      </ResponsiveContainer>
      {minProtectionRate < 100 && (
        <p className="text-sm text-red-600 mt-2">
          Min: <strong>{minProtectionRate.toFixed(1)}%</strong> ({(100 - minProtectionRate).toFixed(1)}% unprotected)
        </p>
      )}
    </div>
  );
}
