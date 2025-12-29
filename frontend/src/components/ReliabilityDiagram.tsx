import { useState, useEffect } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar
} from 'recharts';
import type { CalibrationData } from '../api/types';
import { getCalibration } from '../api/client';

export default function ReliabilityDiagram() {
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getCalibration();
        setCalibration(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load calibration data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Reliability Diagram</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading calibration data...</div>
        </div>
      </div>
    );
  }

  if (error || !calibration) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Reliability Diagram</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-red-400">{error || 'No data available'}</div>
        </div>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = calibration.bins.map((bin) => ({
    bin: `${(bin.range[0] * 100).toFixed(0)}-${(bin.range[1] * 100).toFixed(0)}%`,
    avgConfidence: bin.avgConf * 100,
    accuracy: bin.accuracy * 100,
    count: bin.count,
    gap: Math.abs(bin.accuracy - bin.avgConf) * 100,
    // For perfect calibration line
    perfect: ((bin.range[0] + bin.range[1]) / 2) * 100
  }));

  const ecePercent = (calibration.ece * 100).toFixed(2);

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Reliability Diagram</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">ECE:</span>
          <span className={`text-sm font-mono font-semibold ${
            calibration.ece < 0.05 ? 'text-emerald-400' : 
            calibration.ece < 0.1 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {ecePercent}%
          </span>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="bin" 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569' }}
              label={{ value: 'Confidence Bin', position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569' }}
              domain={[0, 100]}
              label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
              formatter={(value: number | undefined, name: string | undefined) => {
                const safeName = name ?? 'unknown';
                if (value === undefined) return ['N/A', safeName];
                if (safeName === 'accuracy') return [`${value.toFixed(1)}%`, 'Accuracy'];
                if (safeName === 'avgConfidence') return [`${value.toFixed(1)}%`, 'Avg Confidence'];
                if (safeName === 'count') return [value, 'Sample Count'];
                if (safeName === 'gap') return [`${value.toFixed(1)}%`, 'Calibration Gap'];
                return [value, safeName];
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
              formatter={(value: string) => {
                if (value === 'accuracy') return 'Accuracy';
                if (value === 'avgConfidence') return 'Avg Confidence';
                if (value === 'perfect') return 'Perfect Calibration';
                return value;
              }}
            />
            
            {/* Perfect calibration reference line (diagonal) */}
            <Line
              type="linear"
              dataKey="perfect"
              stroke="#6b7280"
              strokeDasharray="5 5"
              dot={false}
              name="perfect"
              strokeWidth={1.5}
            />
            
            {/* Gap area showing miscalibration */}
            <Bar 
              dataKey="gap" 
              fill="#ef444440" 
              name="gap"
              barSize={20}
            />
            
            {/* Actual accuracy line */}
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#22d3ee"
              strokeWidth={2.5}
              dot={{ fill: '#22d3ee', strokeWidth: 2, r: 4 }}
              name="accuracy"
            />
            
            {/* Average confidence line */}
            <Line
              type="monotone"
              dataKey="avgConfidence"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ fill: '#a78bfa', strokeWidth: 2, r: 3 }}
              name="avgConfidence"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-slate-500">
        <p>
          <span className="text-slate-400 font-medium">Expected Calibration Error (ECE)</span> measures the difference 
          between predicted confidence and actual accuracy. Lower is better.
        </p>
        <p className="mt-1">
          Perfect calibration: when a model says "80% confident", it should be correct 80% of the time.
        </p>
      </div>
    </div>
  );
}

