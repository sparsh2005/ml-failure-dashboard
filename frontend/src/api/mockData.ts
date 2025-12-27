import type {
  OverviewMetrics,
  ConfusionMatrix,
  ConfidenceCurve,
  ErrorsByClass,
  PredictionRecord
} from './types';
import { CIFAR10_LABELS } from './types';

// Realistic mock overview metrics
export const mockOverviewMetrics: OverviewMetrics = {
  modelName: 'ResNet-18 (CIFAR-10)',
  datasetName: 'CIFAR-10 Test Set',
  totalSamples: 10000,
  accuracy: 0.8847,
  precision: 0.8856,
  recall: 0.8847,
  f1Score: 0.8842,
  avgConfidence: 0.7823,
  correctConfident: 72.3,        // Most predictions
  correctUnsure: 16.2,           // Correct but uncertain
  wrongUnsure: 6.8,              // Wrong but at least uncertain
  wrongConfident: 4.7,           // DANGEROUS - wrong but confident
  totalFailures: 1153
};

// Realistic confusion matrix for CIFAR-10
// Rows = true labels, Columns = predicted labels
export const mockConfusionMatrix: ConfusionMatrix = {
  labels: [...CIFAR10_LABELS],
  matrix: [
    // airplane: confused with bird, ship
    [912, 8, 22, 4, 6, 2, 3, 5, 28, 10],
    // automobile: confused with truck
    [5, 948, 2, 3, 1, 2, 1, 3, 7, 28],
    // bird: confused with airplane, cat, deer, frog
    [18, 3, 842, 32, 28, 22, 26, 14, 8, 7],
    // cat: confused with dog (major), bird, frog
    [6, 4, 28, 798, 18, 92, 24, 16, 6, 8],
    // deer: confused with bird, horse, frog
    [8, 2, 32, 18, 876, 12, 22, 18, 6, 6],
    // dog: confused with cat (major), deer
    [4, 3, 18, 112, 22, 802, 8, 22, 4, 5],
    // frog: confused with bird, cat, deer
    [6, 2, 28, 24, 18, 8, 896, 6, 6, 6],
    // horse: confused with deer, dog
    [8, 4, 12, 18, 28, 32, 4, 878, 6, 10],
    // ship: confused with airplane, truck
    [32, 12, 6, 4, 4, 2, 4, 4, 918, 14],
    // truck: confused with automobile (major), ship
    [8, 42, 4, 6, 4, 4, 2, 8, 18, 904]
  ]
};

// Confidence vs correctness curve
export const mockConfidenceCurve: ConfidenceCurve = [
  {
    confidenceBucket: '0.0-0.2',
    confidenceMin: 0,
    confidenceMax: 0.2,
    totalCount: 89,
    correctCount: 18,
    incorrectCount: 71,
    accuracyInBucket: 0.202
  },
  {
    confidenceBucket: '0.2-0.3',
    confidenceMin: 0.2,
    confidenceMax: 0.3,
    totalCount: 156,
    correctCount: 52,
    incorrectCount: 104,
    accuracyInBucket: 0.333
  },
  {
    confidenceBucket: '0.3-0.4',
    confidenceMin: 0.3,
    confidenceMax: 0.4,
    totalCount: 312,
    correctCount: 134,
    incorrectCount: 178,
    accuracyInBucket: 0.429
  },
  {
    confidenceBucket: '0.4-0.5',
    confidenceMin: 0.4,
    confidenceMax: 0.5,
    totalCount: 524,
    correctCount: 283,
    incorrectCount: 241,
    accuracyInBucket: 0.540
  },
  {
    confidenceBucket: '0.5-0.6',
    confidenceMin: 0.5,
    confidenceMax: 0.6,
    totalCount: 687,
    correctCount: 446,
    incorrectCount: 241,
    accuracyInBucket: 0.649
  },
  {
    confidenceBucket: '0.6-0.7',
    confidenceMin: 0.6,
    confidenceMax: 0.7,
    totalCount: 1023,
    correctCount: 778,
    incorrectCount: 245,
    accuracyInBucket: 0.760
  },
  {
    confidenceBucket: '0.7-0.8',
    confidenceMin: 0.7,
    confidenceMax: 0.8,
    totalCount: 1456,
    correctCount: 1281,
    incorrectCount: 175,
    accuracyInBucket: 0.880
  },
  {
    confidenceBucket: '0.8-0.9',
    confidenceMin: 0.8,
    confidenceMax: 0.9,
    totalCount: 2234,
    correctCount: 2078,
    incorrectCount: 156,
    accuracyInBucket: 0.930
  },
  {
    confidenceBucket: '0.9-1.0',
    confidenceMin: 0.9,
    confidenceMax: 1.0,
    totalCount: 3519,
    correctCount: 3377,
    incorrectCount: 142,
    accuracyInBucket: 0.960
  }
];

// Error distribution by class
export const mockErrorsByClass: ErrorsByClass = [
  { className: 'airplane', totalSamples: 1000, correctCount: 912, errorCount: 88, errorRate: 0.088, avgConfidenceOnErrors: 0.52 },
  { className: 'automobile', totalSamples: 1000, correctCount: 948, errorCount: 52, errorRate: 0.052, avgConfidenceOnErrors: 0.61 },
  { className: 'bird', totalSamples: 1000, correctCount: 842, errorCount: 158, errorRate: 0.158, avgConfidenceOnErrors: 0.48 },
  { className: 'cat', totalSamples: 1000, correctCount: 798, errorCount: 202, errorRate: 0.202, avgConfidenceOnErrors: 0.54 },
  { className: 'deer', totalSamples: 1000, correctCount: 876, errorCount: 124, errorRate: 0.124, avgConfidenceOnErrors: 0.45 },
  { className: 'dog', totalSamples: 1000, correctCount: 802, errorCount: 198, errorRate: 0.198, avgConfidenceOnErrors: 0.58 },
  { className: 'frog', totalSamples: 1000, correctCount: 896, errorCount: 104, errorRate: 0.104, avgConfidenceOnErrors: 0.42 },
  { className: 'horse', totalSamples: 1000, correctCount: 878, errorCount: 122, errorRate: 0.122, avgConfidenceOnErrors: 0.51 },
  { className: 'ship', totalSamples: 1000, correctCount: 918, errorCount: 82, errorRate: 0.082, avgConfidenceOnErrors: 0.55 },
  { className: 'truck', totalSamples: 1000, correctCount: 904, errorCount: 96, errorRate: 0.096, avgConfidenceOnErrors: 0.63 }
];

// Generate a placeholder colored image based on class
function generatePlaceholderImage(className: string): string {
  const colorMap: Record<string, string> = {
    airplane: '#4A90D9',
    automobile: '#D94A4A',
    bird: '#8B4513',
    cat: '#FFA500',
    deer: '#8B7355',
    dog: '#D2691E',
    frog: '#228B22',
    horse: '#A0522D',
    ship: '#1E90FF',
    truck: '#708090'
  };
  
  const color = colorMap[className] || '#666666';
  
  // Create a simple SVG placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="${color}" rx="2"/>
      <text x="16" y="20" font-family="Arial" font-size="8" fill="white" text-anchor="middle">${className.slice(0, 4)}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Generate mock failed predictions
function generateMockPredictions(): PredictionRecord[] {
  const predictions: PredictionRecord[] = [];
  
  // Common confusions in CIFAR-10
  const confusionPairs: [string, string, number][] = [
    ['cat', 'dog', 0.78],
    ['dog', 'cat', 0.72],
    ['cat', 'dog', 0.85],
    ['dog', 'cat', 0.91],  // High confidence error!
    ['bird', 'airplane', 0.65],
    ['airplane', 'bird', 0.58],
    ['truck', 'automobile', 0.82],
    ['automobile', 'truck', 0.76],
    ['deer', 'horse', 0.69],
    ['horse', 'deer', 0.71],
    ['bird', 'frog', 0.45],
    ['frog', 'bird', 0.52],
    ['cat', 'frog', 0.38],
    ['ship', 'airplane', 0.74],
    ['airplane', 'ship', 0.68],
    ['deer', 'bird', 0.42],
    ['bird', 'deer', 0.55],
    ['dog', 'deer', 0.47],
    ['cat', 'bird', 0.61],
    ['truck', 'ship', 0.59],
    ['cat', 'dog', 0.93],  // Very high confidence error!
    ['dog', 'cat', 0.88],
    ['bird', 'cat', 0.44],
    ['frog', 'deer', 0.51],
    ['horse', 'dog', 0.63],
    ['automobile', 'ship', 0.48],
    ['ship', 'truck', 0.72],
    ['deer', 'frog', 0.39],
    ['cat', 'deer', 0.56],
    ['dog', 'horse', 0.67],
    ['bird', 'frog', 0.73],
    ['airplane', 'truck', 0.41],
    ['truck', 'airplane', 0.55],
    ['frog', 'cat', 0.62],
    ['horse', 'deer', 0.79],
    ['cat', 'dog', 0.81],
    ['dog', 'cat', 0.77],
    ['bird', 'airplane', 0.86], // High confidence error!
    ['automobile', 'truck', 0.92], // Very high confidence error!
    ['ship', 'airplane', 0.64]
  ];
  
  confusionPairs.forEach(([trueLabel, predictedLabel, confidence], index) => {
    const topPredictions = [
      { label: predictedLabel, probability: confidence },
      { label: trueLabel, probability: Math.max(0.05, (1 - confidence) * 0.6) },
      { 
        label: CIFAR10_LABELS.find(l => l !== trueLabel && l !== predictedLabel) || 'other',
        probability: Math.max(0.02, (1 - confidence) * 0.3)
      }
    ];
    
    predictions.push({
      id: `pred_${index.toString().padStart(4, '0')}`,
      imageUrl: generatePlaceholderImage(trueLabel),
      trueLabel,
      predictedLabel,
      confidence,
      isCorrect: false,
      isHighConfidenceError: confidence > 0.7,
      topPredictions
    });
  });
  
  // Add some correct predictions for variety
  const correctPredictions: [string, number][] = [
    ['airplane', 0.95],
    ['automobile', 0.89],
    ['bird', 0.72],
    ['cat', 0.84],
    ['deer', 0.78],
    ['dog', 0.91],
    ['frog', 0.96],
    ['horse', 0.83],
    ['ship', 0.88],
    ['truck', 0.79]
  ];
  
  correctPredictions.forEach(([label, confidence], index) => {
    predictions.push({
      id: `pred_correct_${index.toString().padStart(4, '0')}`,
      imageUrl: generatePlaceholderImage(label),
      trueLabel: label,
      predictedLabel: label,
      confidence,
      isCorrect: true,
      isHighConfidenceError: false,
      topPredictions: [
        { label, probability: confidence },
        { 
          label: CIFAR10_LABELS.find(l => l !== label) || 'other',
          probability: (1 - confidence) * 0.5
        },
        {
          label: CIFAR10_LABELS.find((l, i) => l !== label && i > 0) || 'other',
          probability: (1 - confidence) * 0.3
        }
      ]
    });
  });
  
  return predictions;
}

export const mockPredictions: PredictionRecord[] = generateMockPredictions();

// Get filtered and paginated predictions
export function getMockPaginatedPredictions(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    trueLabel?: string;
    predictedLabel?: string;
    minConfidence?: number;
    maxConfidence?: number;
    onlyErrors?: boolean;
    onlyHighConfidenceErrors?: boolean;
  }
): { predictions: PredictionRecord[]; total: number; page: number; pageSize: number; totalPages: number } {
  let filtered = [...mockPredictions];
  
  if (filters) {
    if (filters.trueLabel) {
      filtered = filtered.filter(p => p.trueLabel === filters.trueLabel);
    }
    if (filters.predictedLabel) {
      filtered = filtered.filter(p => p.predictedLabel === filters.predictedLabel);
    }
    if (filters.minConfidence !== undefined) {
      filtered = filtered.filter(p => p.confidence >= filters.minConfidence!);
    }
    if (filters.maxConfidence !== undefined) {
      filtered = filtered.filter(p => p.confidence <= filters.maxConfidence!);
    }
    if (filters.onlyErrors) {
      filtered = filtered.filter(p => !p.isCorrect);
    }
    if (filters.onlyHighConfidenceErrors) {
      filtered = filtered.filter(p => p.isHighConfidenceError);
    }
  }
  
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedPredictions = filtered.slice(startIndex, startIndex + pageSize);
  
  return {
    predictions: paginatedPredictions,
    total,
    page,
    pageSize,
    totalPages
  };
}

