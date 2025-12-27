import type { ConfusionMatrix } from '../api/types';

interface ConfusionMatrixProps {
  data: ConfusionMatrix | null;
  loading: boolean;
}

export function ConfusionMatrixDisplay({ data, loading }: ConfusionMatrixProps) {
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

  return (
    <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800/50">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
        Confusion Matrix
        <span className="text-zinc-600 font-normal ml-2">(rows: true label, columns: predicted)</span>
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
                  return (
                    <td
                      key={j}
                      className={`p-1 text-center border border-zinc-700 min-w-[40px] ${
                        isDiagonal 
                          ? 'bg-emerald-900/30 text-emerald-400 font-medium' 
                          : value > 0 
                            ? 'bg-red-900/20 text-red-400' 
                            : 'text-zinc-600'
                      }`}
                      title={`True: ${data.labels[i]}, Pred: ${data.labels[j]}, Count: ${value}`}
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
          <span>Misclassified</span>
        </div>
      </div>
    </div>
  );
}

