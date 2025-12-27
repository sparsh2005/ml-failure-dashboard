// CIFAR-10 class labels
export const CIFAR10_LABELS = [
  'airplane',
  'automobile', 
  'bird',
  'cat',
  'deer',
  'dog',
  'frog',
  'horse',
  'ship',
  'truck'
] as const;

export type Cifar10Label = typeof CIFAR10_LABELS[number];

// Model overview metrics
export interface OverviewMetrics {
  modelName: string;
  datasetName: string;
  totalSamples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  avgConfidence: number;
  // Failure breakdown
  correctConfident: number;      // % correct & high confidence
  correctUnsure: number;         // % correct & low confidence
  wrongUnsure: number;           // % wrong & low confidence
  wrongConfident: number;        // % wrong & high confidence (DANGEROUS)
  totalFailures: number;
}

// Confusion matrix data
export interface ConfusionMatrix {
  labels: string[];
  matrix: number[][]; // matrix[trueLabel][predictedLabel] = count
}

// Confidence vs correctness curve data point
export interface ConfidenceCurvePoint {
  confidenceBucket: string;      // e.g., "0.0-0.1", "0.1-0.2"
  confidenceMin: number;
  confidenceMax: number;
  totalCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracyInBucket: number;      // correctCount / totalCount
}

export type ConfidenceCurve = ConfidenceCurvePoint[];

// Error distribution by class
export interface ErrorByClass {
  className: string;
  totalSamples: number;
  correctCount: number;
  errorCount: number;
  errorRate: number;
  avgConfidenceOnErrors: number;
}

export type ErrorsByClass = ErrorByClass[];

// Individual prediction record
export interface PredictionRecord {
  id: string;
  imageUrl: string;              // Base64 or URL to the image
  trueLabel: string;
  predictedLabel: string;
  confidence: number;
  isCorrect: boolean;
  isHighConfidenceError: boolean; // confidence > 0.7 && !isCorrect
  topPredictions: {
    label: string;
    probability: number;
  }[];
}

// Paginated predictions response
export interface PaginatedPredictions {
  predictions: PredictionRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter options for failure explorer
export interface PredictionFilters {
  trueLabel?: string;
  predictedLabel?: string;
  minConfidence?: number;
  maxConfidence?: number;
  onlyErrors?: boolean;
  onlyHighConfidenceErrors?: boolean;
  page?: number;
  pageSize?: number;
}

