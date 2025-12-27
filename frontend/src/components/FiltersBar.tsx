import type { PredictionFilters } from '../api/types';
import { CIFAR10_LABELS } from '../api/types';

interface FiltersBarProps {
  filters: PredictionFilters;
  onFilterChange: (filters: PredictionFilters) => void;
}

export function FiltersBar({ filters, onFilterChange }: FiltersBarProps) {
  const handleChange = (key: keyof PredictionFilters, value: string | number | boolean | undefined) => {
    onFilterChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page on filter change
    });
  };

  const clearFilters = () => {
    onFilterChange({
      page: 1,
      pageSize: filters.pageSize || 10
    });
  };

  const hasActiveFilters = 
    filters.trueLabel || 
    filters.predictedLabel || 
    filters.minConfidence !== undefined || 
    filters.maxConfidence !== undefined ||
    filters.onlyErrors ||
    filters.onlyHighConfidenceErrors;

  return (
    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Filters
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {/* True Label Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500 uppercase">True Label</label>
          <select
            value={filters.trueLabel || ''}
            onChange={(e) => handleChange('trueLabel', e.target.value || undefined)}
            className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 min-w-[120px]"
          >
            <option value="">All</option>
            {CIFAR10_LABELS.map(label => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
        </div>

        {/* Predicted Label Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500 uppercase">Predicted Label</label>
          <select
            value={filters.predictedLabel || ''}
            onChange={(e) => handleChange('predictedLabel', e.target.value || undefined)}
            className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 min-w-[120px]"
          >
            <option value="">All</option>
            {CIFAR10_LABELS.map(label => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
        </div>

        {/* Min Confidence */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500 uppercase">Min Confidence</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={filters.minConfidence ?? ''}
            onChange={(e) => handleChange('minConfidence', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.0"
            className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 w-20"
          />
        </div>

        {/* Max Confidence */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500 uppercase">Max Confidence</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={filters.maxConfidence ?? ''}
            onChange={(e) => handleChange('maxConfidence', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="1.0"
            className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 w-20"
          />
        </div>

        {/* Divider */}
        <div className="w-px bg-zinc-700 self-stretch my-1" />

        {/* Toggle Filters */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500 uppercase">Quick Filters</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleChange('onlyErrors', filters.onlyErrors ? undefined : true)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filters.onlyErrors
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-600 hover:border-zinc-500'
              }`}
            >
              Errors Only
            </button>
            <button
              onClick={() => handleChange('onlyHighConfidenceErrors', filters.onlyHighConfidenceErrors ? undefined : true)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filters.onlyHighConfidenceErrors
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-600 hover:border-zinc-500'
              }`}
            >
              🚨 Dangerous Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

