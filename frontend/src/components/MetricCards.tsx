import type { OverviewMetrics } from '../api/types';

interface MetricCardsProps {
  metrics: OverviewMetrics | null;
  loading: boolean;
}

function MetricCard({ 
  label, 
  value, 
  subValue,
  variant = 'default' 
}: { 
  label: string; 
  value: string | number; 
  subValue?: string;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}) {
  const variantStyles = {
    default: 'border-zinc-700 bg-zinc-800/50',
    danger: 'border-red-500/50 bg-red-950/30',
    success: 'border-emerald-500/50 bg-emerald-950/30',
    warning: 'border-amber-500/50 bg-amber-950/30'
  };

  const valueStyles = {
    default: 'text-zinc-100',
    danger: 'text-red-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400'
  };

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]}`}>
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">
        {label}
      </div>
      <div className={`text-2xl font-semibold ${valueStyles[variant]}`}>
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-zinc-500 mt-1">{subValue}</div>
      )}
    </div>
  );
}

function FailureBreakdownBar({ metrics }: { metrics: OverviewMetrics }) {
  const segments = [
    { value: metrics.correctConfident, label: 'Correct & Confident', color: 'bg-emerald-500' },
    { value: metrics.correctUnsure, label: 'Correct & Unsure', color: 'bg-emerald-700' },
    { value: metrics.wrongUnsure, label: 'Wrong & Unsure', color: 'bg-amber-500' },
    { value: metrics.wrongConfident, label: 'Wrong & Confident', color: 'bg-red-500' },
  ];

  return (
    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
        Prediction Breakdown
      </div>
      
      {/* Stacked bar */}
      <div className="flex h-6 rounded overflow-hidden mb-3">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`${seg.color} transition-all`}
            style={{ width: `${seg.value}%` }}
            title={`${seg.label}: ${seg.value.toFixed(1)}%`}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${seg.color}`} />
            <span className="text-zinc-400">{seg.label}</span>
            <span className="text-zinc-300 ml-auto">{seg.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricCards({ metrics, loading }: MetricCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 h-24" />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-zinc-500 py-8">
        Failed to load metrics
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Model info header */}
      <div className="flex items-baseline gap-4 mb-2">
        <h2 className="text-lg font-semibold text-zinc-200">{metrics.modelName}</h2>
        <span className="text-sm text-zinc-500">{metrics.datasetName}</span>
        <span className="text-sm text-zinc-600">•</span>
        <span className="text-sm text-zinc-500">{metrics.totalSamples.toLocaleString()} samples</span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Accuracy"
          value={`${(metrics.accuracy * 100).toFixed(2)}%`}
          variant="default"
        />
        <MetricCard
          label="Precision"
          value={`${(metrics.precision * 100).toFixed(2)}%`}
        />
        <MetricCard
          label="Recall"
          value={`${(metrics.recall * 100).toFixed(2)}%`}
        />
        <MetricCard
          label="F1 Score"
          value={`${(metrics.f1Score * 100).toFixed(2)}%`}
        />
        <MetricCard
          label="Avg Confidence"
          value={`${(metrics.avgConfidence * 100).toFixed(1)}%`}
        />
        <MetricCard
          label="Total Failures"
          value={metrics.totalFailures.toLocaleString()}
          subValue={`${((metrics.totalFailures / metrics.totalSamples) * 100).toFixed(2)}% error rate`}
          variant="warning"
        />
      </div>

      {/* Failure breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FailureBreakdownBar metrics={metrics} />
        
        {/* Dangerous errors highlight */}
        <div className="border border-red-500/30 rounded-lg p-4 bg-red-950/20">
          <div className="text-xs font-medium uppercase tracking-wider text-red-400 mb-2">
            ⚠️ Dangerous Errors (High Confidence + Wrong)
          </div>
          <div className="text-3xl font-bold text-red-400">
            {metrics.wrongConfident.toFixed(1)}%
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            These are predictions where the model was confident but wrong — the most dangerous failure mode.
          </p>
        </div>
      </div>
    </div>
  );
}

