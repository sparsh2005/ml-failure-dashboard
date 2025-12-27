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

interface ErrorsByClassProps {
  data: ErrorsByClass | null;
  loading: boolean;
}

export function ErrorsByClassChart({ data, loading }: ErrorsByClassProps) {
  if (loading) {
    return (
      <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
          Error Counts by Class
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

  // Sort by error count descending
  const sortedData = [...data].sort((a, b) => b.errorCount - a.errorCount);
  
  const chartData = sortedData.map(item => ({
    className: item.className,
    errors: item.errorCount,
    total: item.totalSamples
  }));

  // Color scale based on error count
  const maxErrors = Math.max(...chartData.map(d => d.errors));
  const getBarColor = (errors: number) => {
    const ratio = errors / maxErrors;
    if (ratio > 0.7) return '#ef4444'; // High - red
    if (ratio > 0.4) return '#f59e0b'; // Medium - amber
    return '#22c55e'; // Low - green
  };

  return (
    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Error Counts by Class
        <span className="text-zinc-600 font-normal ml-2">(which classes have most errors?)</span>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 70, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#4b5563' }}
            />
            <YAxis
              type="category"
              dataKey="className"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#4b5563' }}
              width={65}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                fontSize: 12
              }}
              formatter={(value, _name, props) => {
                const total = (props as { payload: { total: number } }).payload.total;
                const numValue = typeof value === 'number' ? value : 0;
                const rate = ((numValue / total) * 100).toFixed(1);
                return [`${numValue} errors (${rate}% of ${total})`, 'Errors'];
              }}
            />
            <Bar dataKey="errors" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.errors)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary */}
      <div className="flex gap-4 mt-3 text-xs">
        <div className="text-zinc-500">
          Most errors: <span className="text-red-400 font-medium">{sortedData[0]?.className}</span> ({sortedData[0]?.errorCount})
        </div>
        <div className="text-zinc-500">
          Least errors: <span className="text-emerald-400 font-medium">{sortedData[sortedData.length - 1]?.className}</span> ({sortedData[sortedData.length - 1]?.errorCount})
        </div>
      </div>
    </div>
  );
}

