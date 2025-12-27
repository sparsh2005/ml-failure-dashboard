"""Pydantic models mirroring frontend types."""
from typing import List, Optional
from pydantic import BaseModel, Field
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


class ErrorType(str, Enum):
    """Type of prediction error."""
    LOW_CONFIDENCE = "low_confidence"
    HIGH_CONFIDENCE = "high_confidence"


class SortOrder(str, Enum):
    """Sort order for predictions."""
    CONFIDENCE_DESC = "confidence_desc"
    CONFIDENCE_ASC = "confidence_asc"


# ============ Overview Metrics ============

class OverviewMetrics(BaseModel):
    """Model overview metrics."""
    model_name: str = Field(..., alias="modelName")
    dataset_name: str = Field(..., alias="datasetName")
    total_samples: int = Field(..., alias="totalSamples")
    accuracy: float
    precision: float
    recall: float
    f1_score: float = Field(..., alias="f1Score")
    avg_confidence: float = Field(..., alias="avgConfidence")
    # Failure breakdown percentages
    correct_confident: float = Field(..., alias="correctConfident")
    correct_unsure: float = Field(..., alias="correctUnsure")
    wrong_unsure: float = Field(..., alias="wrongUnsure")
    wrong_confident: float = Field(..., alias="wrongConfident")
    total_failures: int = Field(..., alias="totalFailures")

    class Config:
        populate_by_name = True


# ============ Confusion Matrix ============

class ConfusionMatrix(BaseModel):
    """Confusion matrix data."""
    labels: List[str]
    matrix: List[List[int]]


# ============ Confidence Curve ============

class ConfidenceCurvePoint(BaseModel):
    """Single point in confidence vs correctness curve."""
    confidence_bucket: str = Field(..., alias="confidenceBucket")
    confidence_min: float = Field(..., alias="confidenceMin")
    confidence_max: float = Field(..., alias="confidenceMax")
    total_count: int = Field(..., alias="totalCount")
    correct_count: int = Field(..., alias="correctCount")
    incorrect_count: int = Field(..., alias="incorrectCount")
    accuracy_in_bucket: float = Field(..., alias="accuracyInBucket")

    class Config:
        populate_by_name = True


# ============ Errors by Class ============

class ErrorByClass(BaseModel):
    """Error statistics for a single class."""
    class_name: str = Field(..., alias="className")
    total_samples: int = Field(..., alias="totalSamples")
    correct_count: int = Field(..., alias="correctCount")
    error_count: int = Field(..., alias="errorCount")
    error_rate: float = Field(..., alias="errorRate")
    avg_confidence_on_errors: float = Field(..., alias="avgConfidenceOnErrors")

    class Config:
        populate_by_name = True


# ============ Prediction Records ============

class TopPrediction(BaseModel):
    """Top-k prediction entry."""
    label: str
    probability: float


class PredictionRecord(BaseModel):
    """Individual prediction record."""
    id: str
    image_url: str = Field(..., alias="imageUrl")
    true_label: str = Field(..., alias="trueLabel")
    predicted_label: str = Field(..., alias="predictedLabel")
    confidence: float
    is_correct: bool = Field(..., alias="isCorrect")
    is_high_confidence_error: bool = Field(..., alias="isHighConfidenceError")
    top_predictions: List[TopPrediction] = Field(..., alias="topPredictions")

    class Config:
        populate_by_name = True


class PaginatedPredictions(BaseModel):
    """Paginated predictions response."""
    predictions: List[PredictionRecord]
    total: int
    page: int
    page_size: int = Field(..., alias="pageSize")
    total_pages: int = Field(..., alias="totalPages")

    class Config:
        populate_by_name = True


# ============ Query Parameters ============

class PredictionQueryParams(BaseModel):
    """Query parameters for predictions endpoint."""
    only_errors: bool = False
    only_high_confidence_errors: bool = False
    true_label: Optional[str] = None
    predicted_label: Optional[str] = None
    min_confidence: Optional[float] = None
    max_confidence: Optional[float] = None
    page: int = 1
    page_size: int = 10
    sort: SortOrder = SortOrder.CONFIDENCE_DESC

