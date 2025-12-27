import type { PaginatedPredictions, PredictionRecord } from '../api/types';

interface FailureTableProps {
  data: PaginatedPredictions | null;
  loading: boolean;
  selectedId: string | null;
  onSelect: (prediction: PredictionRecord) => void;
  onPageChange: (page: number) => void;
}

export function FailureTable({ data, loading, selectedId, onSelect, onPageChange }: FailureTableProps) {
  if (loading && !data) {
    return (
      <div className="border border-zinc-700 rounded-lg bg-zinc-800/50 overflow-hidden">
        <div className="p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
            Failure Explorer
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-700/50 rounded h-12" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
        <div className="text-zinc-500">Failed to load predictions</div>
      </div>
    );
  }

  return (
    <div className="border border-zinc-700 rounded-lg bg-zinc-800/50 overflow-hidden">
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Failure Explorer
            <span className="text-zinc-600 font-normal ml-2">
              ({data.total} results)
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700 text-left">
              <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Image</th>
              <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">True</th>
              <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Predicted</th>
              <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Confidence</th>
              <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700/50">
            {data.predictions.map((pred) => (
              <tr
                key={pred.id}
                onClick={() => onSelect(pred)}
                className={`cursor-pointer transition-colors ${
                  selectedId === pred.id
                    ? 'bg-zinc-700/50'
                    : 'hover:bg-zinc-700/30'
                }`}
              >
                <td className="px-4 py-3">
                  <img
                    src={pred.imageUrl}
                    alt={pred.trueLabel}
                    className="w-8 h-8 rounded border border-zinc-600 object-cover"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-zinc-200">{pred.trueLabel}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm ${pred.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pred.predictedLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pred.confidence > 0.8 ? 'bg-emerald-500' :
                          pred.confidence > 0.5 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pred.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 w-12">
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {pred.isCorrect ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">
                      ✓ Correct
                    </span>
                  ) : pred.isHighConfidenceError ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                      🚨 Dangerous
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                      ✗ Wrong
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="p-4 border-t border-zinc-700 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Page {data.page} of {data.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(data.page - 1)}
              disabled={data.page <= 1}
              className="px-3 py-1 text-xs rounded bg-zinc-900 border border-zinc-600 text-zinc-400 hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(data.page + 1)}
              disabled={data.page >= data.totalPages}
              className="px-3 py-1 text-xs rounded bg-zinc-900 border border-zinc-600 text-zinc-400 hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {data.predictions.length === 0 && (
        <div className="p-8 text-center text-zinc-500 text-sm">
          No predictions match your filters
        </div>
      )}
    </div>
  );
}

