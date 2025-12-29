import type { ConfusionMatrix } from '../api/types';

// Slice selection from confusion matrix cell click
export interface SliceSelection {
  trueLabel: string;
  predLabel: string;
}

interface ConfusionMatrixProps {
  data: ConfusionMatrix | null;
  loading: boolean;
  onCellClick?: (slice: SliceSelection) => void;
  activeSlice?: SliceSelection | null;
}

export function ConfusionMatrixDisplay({ data, loading, onCellClick, activeSlice }: ConfusionMatrixProps) {
  if (loading) {
    return (
      <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
          Confusion Matrix
        </div>
        <div className="animate-pulse bg-zinc-700/50 rounded h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
        <div className="text-zinc-500">Failed to load confusion matrix</div>
      </div>
    );
  }

  const handleCellClick = (trueLabel: string, predLabel: string, value: number, isDiagonal: boolean) => {
    // Only trigger on off-diagonal cells with errors
    if (!isDiagonal && value > 0 && onCellClick) {
      onCellClick({ trueLabel, predLabel });
    }
  };

  const isCellActive = (trueLabel: string, predLabel: string): boolean => {
    return activeSlice?.trueLabel === trueLabel && activeSlice?.predLabel === predLabel;
  };

  return (
    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Confusion Matrix
        <span className="text-zinc-600 font-normal ml-2">(rows: true label, columns: predicted)</span>
        {onCellClick && (
          <span className="text-cyan-500/70 font-normal ml-2">· Click cell to explore slice</span>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-1 text-zinc-500 font-normal"></th>
              {data.labels.map((label, i) => (
                <th 
                  key={i} 
                  className="p-1 text-zinc-400 font-medium text-center min-w-[40px]"
                  title={label}
                >
                  {label.slice(0, 4)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row, i) => (
              <tr key={i}>
                <td className="p-1 text-zinc-400 font-medium text-right pr-2">
                  {data.labels[i]}
                </td>
                {row.map((value, j) => {
                  const isDiagonal = i === j;
                  const isClickable = !isDiagonal && value > 0 && onCellClick;
                  const isActive = isCellActive(data.labels[i], data.labels[j]);
                  
                  return (
                    <td
                      key={j}
                      onClick={() => handleCellClick(data.labels[i], data.labels[j], value, isDiagonal)}
                      className={`p-1 text-center border min-w-[40px] transition-all ${
                        isActive
                          ? 'bg-cyan-600/40 text-cyan-300 font-bold border-cyan-500 ring-2 ring-cyan-500/50'
                          : isDiagonal 
                            ? 'bg-emerald-900/30 text-emerald-400 font-medium border-zinc-700' 
                            : value > 0 
                              ? 'bg-red-900/20 text-red-400 border-zinc-700' 
                              : 'text-zinc-600 border-zinc-700'
                      } ${isClickable ? 'cursor-pointer hover:bg-red-800/40 hover:border-red-500 hover:text-red-300' : ''}`}
                      title={`True: ${data.labels[i]}, Pred: ${data.labels[j]}, Count: ${value}${isClickable ? ' (click to explore)' : ''}`}
                    >
                      {value > 0 ? value : '·'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-900/30 border border-emerald-800" />
          <span>Correct (diagonal)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-900/20 border border-red-900" />
          <span>Misclassified (clickable)</span>
        </div>
        {activeSlice && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cyan-600/40 border border-cyan-500" />
            <span>Active slice</span>
          </div>
        )}
      </div>
    </div>
  );
}

