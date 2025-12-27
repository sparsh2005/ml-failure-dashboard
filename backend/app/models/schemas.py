from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# CIFAR-10 class labels
CIFAR10_LABELS = [
    "airplane",
    "automobile",
    "bird",
    "cat",
    "deer",
    "dog",
    "frog",
    "horse",
    "ship",
    "truck"
]


class SortOrder(str, Enum):
    CONFIDENCE_DESC = "confidence_desc"
    CONFIDENCE_ASC = "confidence_asc"


class OverviewMetrics(BaseModel):
    """Model overview and performance metrics"""
    modelName: str = Field(..., description="Name of the model")
    datasetName: str = Field(..., description="Name of the dataset")
    totalSamples: int = Field(..., description="Total number of samples")
    accuracy: float = Field(..., ge=0, le=1, description="Overall accuracy")
    precision: float = Field(..., ge=0, le=1, description="Macro precision")
    recall: float = Field(..., ge=0, le=1, description="Macro recall")
    f1Score: float = Field(..., ge=0, le=1, description="Macro F1 score")
    avgConfidence: float = Field(..., ge=0, le=1, description="Average confidence")
    # Failure breakdown percentages
    correctConfident: float = Field(..., description="% correct with high confidence")
    correctUnsure: float = Field(..., description="% correct with low confidence")
    wrongUnsure: float = Field(..., description="% wrong with low confidence")
    wrongConfident: float = Field(..., description="% wrong with high confidence (dangerous)")
    totalFailures: int = Field(..., description="Total number of failures")


class ConfusionMatrix(BaseModel):
    """Confusion matrix data"""
    labels: list[str] = Field(..., description="Class labels")
    matrix: list[list[int]] = Field(..., description="Confusion matrix values")


class ConfidenceCurvePoint(BaseModel):
    """Single point on the confidence vs correctness curve"""
    confidenceBucket: str = Field(..., description="Bucket label (e.g., '0.0-0.1')")
    confidenceMin: float = Field(..., ge=0, le=1)
    confidenceMax: float = Field(..., ge=0, le=1)
    totalCount: int = Field(..., ge=0)
    correctCount: int = Field(..., ge=0)
    incorrectCount: int = Field(..., ge=0)
    accuracyInBucket: float = Field(..., ge=0, le=1)


class ErrorByClass(BaseModel):
    """Error distribution for a single class"""
    className: str = Field(..., description="Class name")
    totalSamples: int = Field(..., ge=0)
    correctCount: int = Field(..., ge=0)
    errorCount: int = Field(..., ge=0)
    errorRate: float = Field(..., ge=0, le=1)
    avgConfidenceOnErrors: float = Field(..., ge=0, le=1)


class TopPrediction(BaseModel):
    """Top-k prediction entry"""
    label: str
    probability: float = Field(..., ge=0, le=1)


class PredictionRecord(BaseModel):
    """Individual prediction record"""
    id: str = Field(..., description="Unique identifier")
    imageUrl: str = Field(..., description="URL or path to image")
    trueLabel: str = Field(..., description="Ground truth label")
    predictedLabel: str = Field(..., description="Model's prediction")
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence")
    isCorrect: bool = Field(..., description="Whether prediction was correct")
    isHighConfidenceError: bool = Field(..., description="High confidence but wrong")
    topPredictions: list[TopPrediction] = Field(..., description="Top-k predictions")


class PaginatedPredictions(BaseModel):
    """Paginated list of predictions"""
    predictions: list[PredictionRecord]
    total: int = Field(..., ge=0, description="Total matching records")
    page: int = Field(..., ge=1, description="Current page number")
    pageSize: int = Field(..., ge=1, description="Items per page")
    totalPages: int = Field(..., ge=0, description="Total number of pages")


class PredictionFilters(BaseModel):
    """Filter options for predictions query"""
    trueLabel: Optional[str] = None
    predictedLabel: Optional[str] = None
    minConfidence: Optional[float] = Field(None, ge=0, le=1)
    maxConfidence: Optional[float] = Field(None, ge=0, le=1)
    onlyErrors: Optional[bool] = None
    onlyHighConfidenceErrors: Optional[bool] = None
    page: int = Field(1, ge=1)
    pageSize: int = Field(10, ge=1, le=100)
    sort: Optional[SortOrder] = None

