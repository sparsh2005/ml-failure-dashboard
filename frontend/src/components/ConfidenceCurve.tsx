import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { ConfidenceCurve } from '../api/types';

interface ConfidenceCurveProps {
  data: ConfidenceCurve | null;
  loading: boolean;
}

export function ConfidenceCurveChart({ data, loading }: ConfidenceCurveProps) {
  if (loading) {
    return (
      <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
          Accuracy per Confidence Bin
        </div>
        <div className="animate-pulse bg-zinc-700/50 rounded h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
        <div className="text-zinc-500">Failed to load confidence curve</div>
      </div>
    );
  }

  const chartData = data.map(point => ({
    bin: point.confidenceBucket,
    accuracy: Math.round(point.accuracyInBucket * 100),
    total: point.totalCount
  }));

  return (
    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Accuracy per Confidence Bin
        <span className="text-zinc-600 font-normal ml-2">(is the model well-calibrated?)</span>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="bin"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#4b5563' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#4b5563' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                fontSize: 12
              }}
              formatter={(value) => [`${value}%`, 'Accuracy']}
              labelFormatter={(label) => `Confidence: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={{ fill: '#fbbf24', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#fbbf24' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-zinc-500 mt-3">
        A well-calibrated model should have accuracy ≈ confidence. If accuracy is lower than confidence in high bins, the model is overconfident.
      </p>
    </div>
  );
}

