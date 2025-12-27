import { useState, useEffect } from 'react';
import type { PredictionFilters } from '../api/types';
import { CIFAR10_LABELS } from '../api/types';

interface FiltersBarProps {
  filters: PredictionFilters;
  onFilterChange: (filters: PredictionFilters) => void;
}

export function FiltersBar({ filters, onFilterChange }: FiltersBarProps) {
  // Local state for form inputs (before applying)
  const [localFilters, setLocalFilters] = useState<PredictionFilters>(filters);
  
  // Sync local state when external filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleLocalChange = (key: keyof PredictionFilters, value: string | number | boolean | undefined) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    onFilterChange({
      ...localFilters,
      page: 1 // Reset to first page on filter apply
    });
  };

  const clearFilters = () => {
    const cleared: PredictionFilters = {
      page: 1,
      pageSize: filters.pageSize || 10
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = 
    filters.trueLabel || 
    filters.predictedLabel || 
    filters.minConfidence !== undefined || 
    filters.maxConfidence !== undefined ||
    filters.onlyErrors ||
    filters.onlyHighConfidenceErrors;

  const hasUnappliedChanges = JSON.stringify(localFilters) !== JSON.stringify(filters);

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

      <div className="flex flex-wrap gap-3 items-end">
        {/* True Label Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500 uppercase">True Label</label>
          <select
            value={localFilters.trueLabel || ''}
            onChange={(e) => handleLocalChange('trueLabel', e.target.value || undefined)}
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
            value={localFilters.predictedLabel || ''}
            onChange={(e) => handleLocalChange('predictedLabel', e.target.value || undefined)}
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
            value={localFilters.minConfidence ?? ''}
            onChange={(e) => handleLocalChange('minConfidence', e.target.value ? parseFloat(e.target.value) : undefined)}
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
            value={localFilters.maxConfidence ?? ''}
            onChange={(e) => handleLocalChange('maxConfidence', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="1.0"
            className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 w-20"
          />
        </div>

        {/* Divider */}
        <div className="w-px bg-zinc-700 self-stretch my-1" />

        {/* Checkbox for confident wrong only */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500 uppercase">Options</label>
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.onlyErrors || false}
                onChange={(e) => handleLocalChange('onlyErrors', e.target.checked || undefined)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-900"
              />
              <span className="text-xs text-zinc-300">Errors Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.onlyHighConfidenceErrors || false}
                onChange={(e) => handleLocalChange('onlyHighConfidenceErrors', e.target.checked || undefined)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-red-500 focus:ring-red-500 focus:ring-offset-zinc-900"
              />
              <span className="text-xs text-red-400">Only Confident Wrong</span>
            </label>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-zinc-700 self-stretch my-1" />

        {/* Apply Button */}
        <button
          onClick={applyFilters}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
            hasUnappliedChanges
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

