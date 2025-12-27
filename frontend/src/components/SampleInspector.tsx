import type { PredictionRecord } from '../api/types';

interface SampleInspectorProps {
  prediction: PredictionRecord | null;
}

export function SampleInspector({ prediction }: SampleInspectorProps) {
  if (!prediction) {
    return (
      <div className="border border-zinc-700 rounded-lg p-6 bg-zinc-800/50 h-full flex items-center justify-center">
        <div className="text-center text-zinc-500">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-sm">Select a prediction to inspect</div>
          <div className="text-xs text-zinc-600 mt-1">Click any row in the table</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-zinc-700 rounded-lg bg-zinc-800/50 overflow-hidden h-full">
      <div className="p-4 border-b border-zinc-700">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Sample Inspector
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Image */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={prediction.imageUrl}
              alt={prediction.trueLabel}
              className="w-32 h-32 rounded-lg border border-zinc-600 object-cover"
            />
            {prediction.isHighConfidenceError && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                🚨
              </div>
            )}
          </div>
        </div>

        {/* Labels comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700">
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1">
              True Label
            </div>
            <div className="text-lg font-semibold text-zinc-200 capitalize">
              {prediction.trueLabel}
            </div>
          </div>
          <div className={`rounded-lg p-3 border ${
            prediction.isCorrect 
              ? 'bg-emerald-950/30 border-emerald-500/30' 
              : 'bg-red-950/30 border-red-500/30'
          }`}>
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-1">
              Predicted
            </div>
            <div className={`text-lg font-semibold capitalize ${
              prediction.isCorrect ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {prediction.predictedLabel}
            </div>
          </div>
        </div>

        {/* Confidence meter */}
        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Model Confidence
            </div>
            <div className={`text-lg font-bold ${
              prediction.confidence > 0.8 ? 'text-emerald-400' :
              prediction.confidence > 0.5 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {(prediction.confidence * 100).toFixed(1)}%
            </div>
          </div>
          <div className="w-full h-3 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                prediction.confidence > 0.8 ? 'bg-emerald-500' :
                prediction.confidence > 0.5 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${prediction.confidence * 100}%` }}
            />
          </div>
          {prediction.isHighConfidenceError && (
            <div className="mt-2 text-xs text-red-400">
              ⚠️ High confidence but wrong — this is a dangerous error
            </div>
          )}
        </div>

        {/* Top predictions */}
        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700">
          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-3">
            Top Predictions
          </div>
          <div className="space-y-2">
            {prediction.topPredictions.map((pred, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 text-xs text-zinc-500 text-right">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm capitalize ${
                      pred.label === prediction.trueLabel ? 'text-emerald-400 font-medium' : 'text-zinc-300'
                    }`}>
                      {pred.label}
                      {pred.label === prediction.trueLabel && (
                        <span className="text-xs ml-1">(correct)</span>
                      )}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {(pred.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pred.label === prediction.trueLabel ? 'bg-emerald-500' : 'bg-zinc-500'
                      }`}
                      style={{ width: `${pred.probability * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status badge */}
        <div className="flex justify-center pt-2">
          {prediction.isCorrect ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
              <span className="text-lg">✓</span> Correct Prediction
            </div>
          ) : prediction.isHighConfidenceError ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
              <span className="text-lg">🚨</span> Dangerous Error
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium">
              <span className="text-lg">✗</span> Misclassification
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

