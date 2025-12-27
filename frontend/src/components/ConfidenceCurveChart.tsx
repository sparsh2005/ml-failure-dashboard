import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart
} from 'recharts';
import type { ConfidenceCurve } from '../api/types';

interface ConfidenceCurveChartProps {
  data: ConfidenceCurve | null;
  loading: boolean;
}

export function ConfidenceCurveChart({ data, loading }: ConfidenceCurveChartProps) {
  if (loading) {
    return (
      <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
          Confidence vs Correctness
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
    bucket: point.confidenceBucket,
    correct: point.correctCount,
    incorrect: point.incorrectCount,
    accuracy: point.accuracyInBucket * 100,
    total: point.totalCount
  }));

  return (
    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Confidence vs Correctness
        <span className="text-zinc-600 font-normal ml-2">(are confident predictions actually correct?)</span>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="bucket"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#4b5563' }}
            />
            <YAxis
              yAxisId="count"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#4b5563' }}
              label={{
                value: 'Count',
                angle: -90,
                position: 'insideLeft',
                fill: '#9ca3af',
                fontSize: 10
              }}
            />
            <YAxis
              yAxisId="accuracy"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={{ stroke: '#4b5563' }}
              label={{
                value: 'Accuracy %',
                angle: 90,
                position: 'insideRight',
                fill: '#9ca3af',
                fontSize: 10
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                fontSize: 12
              }}
              labelStyle={{ color: '#e4e4e7' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
            />
            <Bar
              yAxisId="count"
              dataKey="correct"
              stackId="stack"
              fill="#22c55e"
              name="Correct"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              yAxisId="count"
              dataKey="incorrect"
              stackId="stack"
              fill="#ef4444"
              name="Incorrect"
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="accuracy"
              type="monotone"
              dataKey="accuracy"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={{ fill: '#fbbf24', strokeWidth: 0, r: 3 }}
              name="Accuracy %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-zinc-500 mt-3">
        Ideally, accuracy should increase with confidence. High-confidence errors (red in high buckets) are dangerous.
      </p>
    </div>
  );
}

