import { useState, useEffect, useCallback } from 'react';
import {
  MetricCards,
  ConfusionMatrixDisplay,
  ConfidenceCurveChart,
  ErrorsByClassChart,
  FiltersBar,
  FailureTable,
  SampleInspector
} from '../components';
import {
  getOverview,
  getConfusionMatrix,
  getConfidenceCurve,
  getErrorsByClass,
  getPredictions
} from '../api/client';
import type {
  OverviewMetrics,
  ConfusionMatrix,
  ConfidenceCurve,
  ErrorsByClass,
  PaginatedPredictions,
  PredictionFilters,
  PredictionRecord
} from '../api/types';

export function Dashboard() {
  // State for all data
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [confusionMatrix, setConfusionMatrix] = useState<ConfusionMatrix | null>(null);
  const [confidenceCurve, setConfidenceCurve] = useState<ConfidenceCurve | null>(null);
  const [errorsByClass, setErrorsByClass] = useState<ErrorsByClass | null>(null);
  const [predictions, setPredictions] = useState<PaginatedPredictions | null>(null);
  
  // Loading states
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingMatrix, setLoadingMatrix] = useState(true);
  const [loadingCurve, setLoadingCurve] = useState(true);
  const [loadingErrors, setLoadingErrors] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  
  // UI state
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionRecord | null>(null);
  const [filters, setFilters] = useState<PredictionFilters>({
    page: 1,
    pageSize: 10,
    onlyErrors: true // Default to showing only errors
  });

  // Fetch overview data
  useEffect(() => {
    setLoadingOverview(true);
    getOverview()
      .then(setOverview)
      .catch(console.error)
      .finally(() => setLoadingOverview(false));
  }, []);

  // Fetch confusion matrix
  useEffect(() => {
    setLoadingMatrix(true);
    getConfusionMatrix()
      .then(setConfusionMatrix)
      .catch(console.error)
      .finally(() => setLoadingMatrix(false));
  }, []);

  // Fetch confidence curve
  useEffect(() => {
    setLoadingCurve(true);
    getConfidenceCurve()
      .then(setConfidenceCurve)
      .catch(console.error)
      .finally(() => setLoadingCurve(false));
  }, []);

  // Fetch errors by class
  useEffect(() => {
    setLoadingErrors(true);
    getErrorsByClass()
      .then(setErrorsByClass)
      .catch(console.error)
      .finally(() => setLoadingErrors(false));
  }, []);

  // Fetch predictions (with filters)
  const fetchPredictions = useCallback(async () => {
    setLoadingPredictions(true);
    try {
      const data = await getPredictions(filters);
      setPredictions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPredictions(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // Handle filter change
  const handleFilterChange = (newFilters: PredictionFilters) => {
    setFilters(newFilters);
    setSelectedPrediction(null); // Clear selection on filter change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle prediction selection
  const handleSelectPrediction = (prediction: PredictionRecord) => {
    setSelectedPrediction(prediction);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-sm font-bold">
              ML
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-100">ML Failure Analysis Dashboard</h1>
              <p className="text-xs text-zinc-500">Understand where and how your model fails</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-8">
        {/* Section 1: Model Overview */}
        <section>
          <MetricCards metrics={overview} loading={loadingOverview} />
        </section>

        {/* Section 2: Failure Patterns */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">
            Failure Patterns
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <ConfusionMatrixDisplay data={confusionMatrix} loading={loadingMatrix} />
            <ConfidenceCurveChart data={confidenceCurve} loading={loadingCurve} />
            <ErrorsByClassChart data={errorsByClass} loading={loadingErrors} />
          </div>
        </section>

        {/* Section 3 & 4: Failure Explorer + Sample Inspector */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">
            Failure Explorer
          </h2>
          
          <FiltersBar filters={filters} onFilterChange={handleFilterChange} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Table takes 2 columns */}
            <div className="lg:col-span-2">
              <FailureTable
                data={predictions}
                loading={loadingPredictions}
                selectedId={selectedPrediction?.id || null}
                onSelect={handleSelectPrediction}
                onPageChange={handlePageChange}
              />
            </div>
            
            {/* Sample inspector takes 1 column */}
            <div className="lg:col-span-1">
              <SampleInspector prediction={selectedPrediction} />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <p className="text-xs text-zinc-600 text-center">
            ML Failure Analysis Dashboard • Built for debugging, not demos
          </p>
        </div>
      </footer>
    </div>
  );
}
