import csv
import io
import json

from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import StreamingResponse
from typing import Optional

from ..models import (
    OverviewMetrics,
    ConfusionMatrix,
    ConfidenceCurvePoint,
    ErrorByClass,
    PredictionRecord,
    PaginatedPredictions,
    SortOrder,
    ExportFormat,
    CalibrationData
)
from ..services import DataStore, get_data_store


router = APIRouter(prefix="/api", tags=["ML Analysis"])


@router.get("/overview", response_model=OverviewMetrics)
async def get_overview(
    data_store: DataStore = Depends(get_data_store)
) -> OverviewMetrics:
    """
    Get model overview metrics including accuracy, precision, recall,
    and failure breakdown statistics.
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
    Get the confusion matrix showing prediction distributions
    across all classes.
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
    Get the confidence vs correctness curve data showing
    accuracy per confidence bucket.
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
    Get error distribution statistics for each class.
    """
    try:
        return data_store.get_errors_by_class()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/predictions", response_model=PaginatedPredictions)
async def get_predictions(
    only_errors: bool = Query(False, description="Filter to only show incorrect predictions"),
    true_label: Optional[str] = Query(None, description="Filter by true label"),
    pred_label: Optional[str] = Query(None, description="Filter by predicted label"),
    min_conf: Optional[float] = Query(None, ge=0, le=1, description="Minimum confidence"),
    max_conf: Optional[float] = Query(None, ge=0, le=1, description="Maximum confidence"),
    only_high_confidence_errors: bool = Query(False, description="Show only high confidence errors"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort: Optional[SortOrder] = Query(None, description="Sort order"),
    data_store: DataStore = Depends(get_data_store)
) -> PaginatedPredictions:
    """
    Get paginated predictions with optional filtering and sorting.
    
    Supports filtering by:
    - only_errors: Show only incorrect predictions
    - true_label: Filter by ground truth label
    - pred_label: Filter by predicted label
    - min_conf/max_conf: Filter by confidence range
    - only_high_confidence_errors: Show only confident but wrong predictions
    
    Supports sorting by:
    - confidence_desc: Highest confidence first
    - confidence_asc: Lowest confidence first
    """
    try:
        return data_store.get_predictions(
            only_errors=only_errors,
            true_label=true_label,
            pred_label=pred_label,
            min_conf=min_conf,
            max_conf=max_conf,
            only_high_confidence_errors=only_high_confidence_errors,
            page=page,
            page_size=page_size,
            sort=sort
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/predictions/{prediction_id}", response_model=PredictionRecord)
async def get_prediction_by_id(
    prediction_id: str,
    data_store: DataStore = Depends(get_data_store)
) -> PredictionRecord:
    """
    Get a single prediction by its ID.
    """
    try:
        prediction = data_store.get_prediction_by_id(prediction_id)
        if prediction is None:
            raise HTTPException(status_code=404, detail=f"Prediction not found: {prediction_id}")
        return prediction
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/calibration", response_model=CalibrationData)
async def get_calibration(
    bins: int = Query(10, ge=1, le=100, description="Number of calibration bins (currently fixed at 10)"),
    data_store: DataStore = Depends(get_data_store)
) -> CalibrationData:
    """
    Get calibration data including Expected Calibration Error (ECE)
    and reliability diagram bins.
    
    Note: bins parameter is accepted for API compatibility but currently
    the data is pre-computed with 10 bins.
    """
    try:
        return data_store.get_calibration()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/export")
async def export_predictions(
    format: ExportFormat = Query(..., description="Export format: csv or jsonl"),
    only_errors: bool = Query(False, description="Filter to only show incorrect predictions"),
    true_label: Optional[str] = Query(None, description="Filter by true label"),
    pred_label: Optional[str] = Query(None, description="Filter by predicted label"),
    min_conf: Optional[float] = Query(None, ge=0, le=1, description="Minimum confidence"),
    max_conf: Optional[float] = Query(None, ge=0, le=1, description="Maximum confidence"),
    only_high_confidence_errors: bool = Query(False, description="Show only high confidence errors"),
    sort: Optional[SortOrder] = Query(None, description="Sort order"),
    data_store: DataStore = Depends(get_data_store)
):
    """
    Export filtered predictions as CSV or JSONL.
    
    CSV includes: id, true_label, pred_label, confidence, error_type, image_url
    JSONL includes full prediction records.
    """
    try:
        predictions = data_store.get_filtered_predictions(
            only_errors=only_errors,
            true_label=true_label,
            pred_label=pred_label,
            min_conf=min_conf,
            max_conf=max_conf,
            only_high_confidence_errors=only_high_confidence_errors,
            sort=sort
        )
        
        if format == ExportFormat.CSV:
            # Generate CSV
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(["id", "true_label", "pred_label", "confidence", "error_type", "image_url"])
            
            for p in predictions:
                error_type = "correct"
                if not p.isCorrect:
                    error_type = "high_conf_error" if p.isHighConfidenceError else "low_conf_error"
                writer.writerow([
                    p.id,
                    p.trueLabel,
                    p.predictedLabel,
                    p.confidence,
                    error_type,
                    p.imageUrl
                ])
            
            output.seek(0)
            return StreamingResponse(
                iter([output.getvalue()]),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=predictions.csv"}
            )
        
        else:  # JSONL
            def generate_jsonl():
                for p in predictions:
                    yield json.dumps(p.model_dump()) + "\n"
            
            return StreamingResponse(
                generate_jsonl(),
                media_type="application/x-ndjson",
                headers={"Content-Disposition": "attachment; filename=predictions.jsonl"}
            )
    
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

