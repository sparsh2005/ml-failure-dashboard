import type { ConfusionMatrix } from '../api/types';

interface ConfusionMatrixChartProps {
  data: ConfusionMatrix | null;
  loading: boolean;
}

export function ConfusionMatrixChart({ data, loading }: ConfusionMatrixChartProps) {
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

  // Find max value for color scaling
  const maxVal = Math.max(...data.matrix.flat());
  
  // Get color intensity based on value
  const getColor = (value: number, isDiagonal: boolean) => {
    const intensity = value / maxVal;
    if (isDiagonal) {
      // Green for correct predictions (diagonal)
      const alpha = 0.2 + intensity * 0.6;
      return `rgba(34, 197, 94, ${alpha})`;
    } else {
      // Red for errors (off-diagonal)
      const alpha = value > 0 ? 0.2 + intensity * 0.6 : 0;
      return `rgba(239, 68, 68, ${alpha})`;
    }
  };

  return (
    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Confusion Matrix
        <span className="text-zinc-600 font-normal ml-2">(rows: true, cols: predicted)</span>
      </div>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header row - predicted labels */}
          <div className="flex">
            <div className="w-16 h-8" /> {/* Empty corner */}
            {data.labels.map((label, i) => (
              <div
                key={i}
                className="w-10 h-8 flex items-center justify-center text-[10px] text-zinc-400 font-medium"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {label.slice(0, 4)}
              </div>
            ))}
          </div>
          
          {/* Matrix rows */}
          {data.matrix.map((row, i) => (
            <div key={i} className="flex">
              {/* Row label - true label */}
              <div className="w-16 h-10 flex items-center text-[10px] text-zinc-400 font-medium pr-2 justify-end">
                {data.labels[i]}
              </div>
              
              {/* Matrix cells */}
              {row.map((value, j) => {
                const isDiagonal = i === j;
                return (
                  <div
                    key={j}
                    className="w-10 h-10 flex items-center justify-center text-[10px] border border-zinc-700/50 hover:border-zinc-500 transition-colors cursor-default"
                    style={{ backgroundColor: getColor(value, isDiagonal) }}
                    title={`True: ${data.labels[i]}, Pred: ${data.labels[j]}, Count: ${value}`}
                  >
                    <span className={`${isDiagonal ? 'text-emerald-200' : value > 0 ? 'text-red-200' : 'text-zinc-600'}`}>
                      {value > 0 ? value : '·'}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/50" />
          <span>Correct (diagonal)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/50" />
          <span>Errors (off-diagonal)</span>
        </div>
      </div>
    </div>
  );
}

