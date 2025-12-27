"""API routes for ML Failure Analysis Dashboard."""
import math
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends

from ..models.schemas import (
    OverviewMetrics,
    ConfusionMatrix,
    ConfidenceCurvePoint,
    ErrorByClass,
    PredictionRecord,
    PaginatedPredictions,
    SortOrder
)
from ..services.data_store import DataStore, get_data_store


router = APIRouter(prefix="/api", tags=["api"])


@router.get("/overview", response_model=OverviewMetrics)
async def get_overview(
    data_store: DataStore = Depends(get_data_store)
) -> OverviewMetrics:
    """
    Get model overview metrics.
    
    Returns accuracy, precision, recall, F1, avg confidence,
    and failure breakdown percentages.
    """
    try:
        return data_store.get_overview()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/confusion-matrix", response_model=ConfusionMatrix)
async def get_confusion_matrix(
    data_store: DataStore = Depends(get_data_store)
) -> ConfusionMatrix:
    """
    Get confusion matrix data.
    
    Returns matrix where matrix[i][j] = count of samples
    with true label i predicted as label j.
    """
    try:
        return data_store.get_confusion_matrix()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/confidence-curve", response_model=list[ConfidenceCurvePoint])
async def get_confidence_curve(
    data_store: DataStore = Depends(get_data_store)
) -> list[ConfidenceCurvePoint]:
    """
    Get confidence vs correctness curve data.
    
    Returns accuracy per confidence bin to assess model calibration.
    """
    try:
        return data_store.get_confidence_curve()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/errors-by-class", response_model=list[ErrorByClass])
async def get_errors_by_class(
    data_store: DataStore = Depends(get_data_store)
) -> list[ErrorByClass]:
    """
    Get error distribution by class.
    
    Returns error counts and rates for each class.
    """
    try:
        return data_store.get_errors_by_class()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/predictions", response_model=PaginatedPredictions)
async def get_predictions(
    only_errors: bool = Query(False, description="Filter to only incorrect predictions"),
    only_high_confidence_errors: bool = Query(False, description="Filter to only high-confidence errors"),
    true_label: Optional[str] = Query(None, description="Filter by true label"),
    pred_label: Optional[str] = Query(None, description="Filter by predicted label"),
    min_conf: Optional[float] = Query(None, ge=0, le=1, description="Minimum confidence"),
    max_conf: Optional[float] = Query(None, ge=0, le=1, description="Maximum confidence"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort: SortOrder = Query(SortOrder.CONFIDENCE_DESC, description="Sort order"),
    data_store: DataStore = Depends(get_data_store)
) -> PaginatedPredictions:
    """
    Get paginated prediction records with filters.
    
    Supports filtering by:
    - only_errors: show only incorrect predictions
    - only_high_confidence_errors: show only dangerous (high confidence + wrong) errors
    - true_label: filter by ground truth label
    - pred_label: filter by predicted label  
    - min_conf/max_conf: filter by confidence range
    
    Supports sorting by:
    - confidence_desc: highest confidence first
    - confidence_asc: lowest confidence first
    """
    try:
        predictions, total = data_store.query_predictions(
            only_errors=only_errors,
            only_high_confidence_errors=only_high_confidence_errors,
            true_label=true_label,
            predicted_label=pred_label,
            min_confidence=min_conf,
            max_confidence=max_conf,
            sort=sort,
            page=page,
            page_size=page_size
        )
        
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        
        return PaginatedPredictions(
            predictions=predictions,
            total=total,
            page=page,
            pageSize=page_size,
            totalPages=total_pages
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/predictions/{prediction_id}", response_model=PredictionRecord)
async def get_prediction_by_id(
    prediction_id: str,
    data_store: DataStore = Depends(get_data_store)
) -> PredictionRecord:
    """
    Get a single prediction record by ID.
    """
    try:
        prediction = data_store.get_prediction_by_id(prediction_id)
        if prediction is None:
            raise HTTPException(status_code=404, detail=f"Prediction not found: {prediction_id}")
        return prediction
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

