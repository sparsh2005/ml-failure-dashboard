import { useState, useEffect } from 'react';
import type { PredictionFilters, ExportFormat } from '../api/types';
import { CIFAR10_LABELS } from '../api/types';
import { downloadExport } from '../api/client';
import type { SliceSelection } from './ConfusionMatrix';

interface FiltersBarProps {
  filters: PredictionFilters;
  onFilterChange: (filters: PredictionFilters) => void;
  activeSlice?: SliceSelection | null;
  onClearSlice?: () => void;
}

export function FiltersBar({ filters, onFilterChange, activeSlice, onClearSlice }: FiltersBarProps) {
  // Local state for form inputs (before applying)
  const [localFilters, setLocalFilters] = useState<PredictionFilters>(filters);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
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
    onClearSlice?.();
  };

  const handleExport = (format: ExportFormat) => {
    downloadExport(format, filters);
    setShowExportMenu(false);
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
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Filters
          </div>
          
          {/* Active Slice Chip */}
          {activeSlice && (
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-900/40 border border-cyan-600/50 rounded-full">
              <span className="text-xs text-cyan-300 font-medium">
                {activeSlice.trueLabel} → {activeSlice.predLabel}
              </span>
              <button
                onClick={onClearSlice}
                className="text-cyan-400 hover:text-cyan-200 transition-colors"
                title="Clear slice filter"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
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

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
            <svg className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl z-50 overflow-hidden">
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-2"
              >
                <span className="text-emerald-400">CSV</span>
                <span className="text-zinc-500 text-xs">(.csv)</span>
              </button>
              <button
                onClick={() => handleExport('jsonl')}
                className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-2"
              >
                <span className="text-amber-400">JSONL</span>
                <span className="text-zinc-500 text-xs">(.jsonl)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

