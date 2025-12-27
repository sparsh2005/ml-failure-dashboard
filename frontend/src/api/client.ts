import type {
  OverviewMetrics,
  ConfusionMatrix,
  ConfidenceCurve,
  ErrorsByClass,
  PredictionRecord,
  PaginatedPredictions,
  PredictionFilters
} from './types';

import {
  mockOverviewMetrics,
  mockConfusionMatrix,
  mockConfidenceCurve,
  mockErrorsByClass,
  mockPredictions,
  getMockPaginatedPredictions
} from './mockData';

// Toggle between mock data and real backend
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Helper for API requests
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Get model overview metrics
export async function getOverview(): Promise<OverviewMetrics> {
  if (USE_MOCKS) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOverviewMetrics;
  }
  
  return fetchApi<OverviewMetrics>('/api/overview');
}

// Get confusion matrix data
export async function getConfusionMatrix(): Promise<ConfusionMatrix> {
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockConfusionMatrix;
  }
  
  return fetchApi<ConfusionMatrix>('/api/confusion-matrix');
}

// Get confidence vs correctness curve data
export async function getConfidenceCurve(): Promise<ConfidenceCurve> {
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockConfidenceCurve;
  }
  
  return fetchApi<ConfidenceCurve>('/api/confidence-curve');
}

// Get error distribution by class
export async function getErrorsByClass(): Promise<ErrorsByClass> {
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockErrorsByClass;
  }
  
  return fetchApi<ErrorsByClass>('/api/errors-by-class');
}

// Get paginated predictions with filters
export async function getPredictions(filters?: PredictionFilters): Promise<PaginatedPredictions> {
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return getMockPaginatedPredictions(
      filters?.page || 1,
      filters?.pageSize || 10,
      filters
    );
  }
  
  const params = new URLSearchParams();
  if (filters) {
    if (filters.trueLabel) params.set('true_label', filters.trueLabel);
    if (filters.predictedLabel) params.set('predicted_label', filters.predictedLabel);
    if (filters.minConfidence !== undefined) params.set('min_confidence', filters.minConfidence.toString());
    if (filters.maxConfidence !== undefined) params.set('max_confidence', filters.maxConfidence.toString());
    if (filters.onlyErrors) params.set('only_errors', 'true');
    if (filters.onlyHighConfidenceErrors) params.set('only_high_confidence_errors', 'true');
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.pageSize) params.set('page_size', filters.pageSize.toString());
  }
  
  const queryString = params.toString();
  const endpoint = queryString ? `/api/predictions?${queryString}` : '/api/predictions';
  
  return fetchApi<PaginatedPredictions>(endpoint);
}

// Get single prediction by ID
export async function getPredictionById(id: string): Promise<PredictionRecord | null> {
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockPredictions.find(p => p.id === id) || null;
  }
  
  return fetchApi<PredictionRecord>(`/api/predictions/${id}`);
}

