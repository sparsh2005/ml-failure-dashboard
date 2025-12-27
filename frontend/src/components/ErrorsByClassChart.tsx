import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { ErrorsByClass } from '../api/types';

interface ErrorsByClassChartProps {
  data: ErrorsByClass | null;
  loading: boolean;
}

export function ErrorsByClassChart({ data, loading }: ErrorsByClassChartProps) {
  if (loading) {
    return (
      <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
          Error Distribution by Class
        </div>
        <div className="animate-pulse bg-zinc-700/50 rounded h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
        <div className="text-zinc-500">Failed to load error distribution</div>
      </div>
    );
  }

  // Sort by error rate descending
  const sortedData = [...data].sort((a, b) => b.errorRate - a.errorRate);
  
  const chartData = sortedData.map(item => ({
    className: item.className,
    errorRate: item.errorRate * 100,
    errorCount: item.errorCount,
    totalSamples: item.totalSamples,
    avgConfidenceOnErrors: item.avgConfidenceOnErrors * 100
  }));

  // Get color based on error rate
  const getBarColor = (errorRate: number) => {
    if (errorRate >= 15) return '#ef4444'; // High error rate - red
    if (errorRate >= 10) return '#f59e0b'; // Medium - amber
    return '#22c55e'; // Low - green
  };

  return (
    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Error Distribution by Class
        <span className="text-zinc-600 font-normal ml-2">(which classes are hardest?)</span>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              domain={[0, 25]}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#4b5563' }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="className"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#4b5563' }}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                fontSize: 12
              }}
  formatter={(value, name) => {
                if (name === 'errorRate' && typeof value === 'number') return [`${value.toFixed(1)}%`, 'Error Rate'];
                return [String(value), name];
              }}
              labelStyle={{ color: '#e4e4e7' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs">
                      <div className="font-semibold text-zinc-200 mb-2">{data.className}</div>
                      <div className="space-y-1 text-zinc-400">
                        <div>Error Rate: <span className="text-red-400">{data.errorRate.toFixed(1)}%</span></div>
                        <div>Errors: {data.errorCount} / {data.totalSamples}</div>
                        <div>Avg Confidence on Errors: {data.avgConfidenceOnErrors.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="errorRate" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.errorRate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary stats */}
      <div className="flex gap-4 mt-3 text-xs">
        <div className="text-zinc-500">
          Hardest: <span className="text-red-400 font-medium">{sortedData[0]?.className}</span> ({(sortedData[0]?.errorRate * 100).toFixed(1)}%)
        </div>
        <div className="text-zinc-500">
          Easiest: <span className="text-emerald-400 font-medium">{sortedData[sortedData.length - 1]?.className}</span> ({(sortedData[sortedData.length - 1]?.errorRate * 100).toFixed(1)}%)
        </div>
      </div>
    </div>
  );
}

