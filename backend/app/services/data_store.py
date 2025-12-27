import json
from pathlib import Path
from typing import Optional
from functools import lru_cache

from ..models import (
    OverviewMetrics,
    ConfusionMatrix,
    ConfidenceCurvePoint,
    ErrorByClass,
    PredictionRecord,
    PaginatedPredictions,
    SortOrder
)


class DataStore:
    """
    Service for loading and caching ML analysis data from JSON files.
    Data is loaded once and cached in memory.
    """
    
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self._overview: Optional[OverviewMetrics] = None
        self._confusion_matrix: Optional[ConfusionMatrix] = None
        self._confidence_curve: Optional[list[ConfidenceCurvePoint]] = None
        self._errors_by_class: Optional[list[ErrorByClass]] = None
        self._predictions: Optional[list[PredictionRecord]] = None
        self._predictions_by_id: Optional[dict[str, PredictionRecord]] = None
    
    def _load_json(self, filename: str) -> dict | list:
        """Load JSON file from data directory"""
        filepath = self.data_dir / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Data file not found: {filepath}")
        with open(filepath, 'r') as f:
            return json.load(f)
    
    def _load_jsonl(self, filename: str) -> list[dict]:
        """Load JSONL file (one JSON object per line)"""
        filepath = self.data_dir / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Data file not found: {filepath}")
        records = []
        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                if line:
                    records.append(json.loads(line))
        return records
    
    def get_overview(self) -> OverviewMetrics:
        """Get cached overview metrics"""
        if self._overview is None:
            data = self._load_json("overview.json")
            self._overview = OverviewMetrics(**data)
        return self._overview
    
    def get_confusion_matrix(self) -> ConfusionMatrix:
        """Get cached confusion matrix"""
        if self._confusion_matrix is None:
            data = self._load_json("confusion_matrix.json")
            self._confusion_matrix = ConfusionMatrix(**data)
        return self._confusion_matrix
    
    def get_confidence_curve(self) -> list[ConfidenceCurvePoint]:
        """Get cached confidence curve data"""
        if self._confidence_curve is None:
            data = self._load_json("confidence_curve.json")
            self._confidence_curve = [ConfidenceCurvePoint(**point) for point in data]
        return self._confidence_curve
    
    def get_errors_by_class(self) -> list[ErrorByClass]:
        """Get cached errors by class data"""
        if self._errors_by_class is None:
            data = self._load_json("errors_by_class.json")
            self._errors_by_class = [ErrorByClass(**item) for item in data]
        return self._errors_by_class
    
    def _load_predictions(self) -> None:
        """Load and cache all predictions"""
        if self._predictions is None:
            data = self._load_jsonl("predictions.jsonl")
            self._predictions = [PredictionRecord(**record) for record in data]
            self._predictions_by_id = {p.id: p for p in self._predictions}
    
    def get_prediction_by_id(self, prediction_id: str) -> Optional[PredictionRecord]:
        """Get a single prediction by ID"""
        self._load_predictions()
        return self._predictions_by_id.get(prediction_id)
    
    def get_predictions(
        self,
        only_errors: bool = False,
        true_label: Optional[str] = None,
        pred_label: Optional[str] = None,
        min_conf: Optional[float] = None,
        max_conf: Optional[float] = None,
        only_high_confidence_errors: bool = False,
        page: int = 1,
        page_size: int = 10,
        sort: Optional[SortOrder] = None
    ) -> PaginatedPredictions:
        """Get filtered and paginated predictions"""
        self._load_predictions()
        
        # Start with all predictions
        filtered = list(self._predictions)
        
        # Apply filters
        if only_errors:
            filtered = [p for p in filtered if not p.isCorrect]
        
        if only_high_confidence_errors:
            filtered = [p for p in filtered if p.isHighConfidenceError]
        
        if true_label:
            filtered = [p for p in filtered if p.trueLabel == true_label]
        
        if pred_label:
            filtered = [p for p in filtered if p.predictedLabel == pred_label]
        
        if min_conf is not None:
            filtered = [p for p in filtered if p.confidence >= min_conf]
        
        if max_conf is not None:
            filtered = [p for p in filtered if p.confidence <= max_conf]
        
        # Apply sorting
        if sort == SortOrder.CONFIDENCE_DESC:
            filtered.sort(key=lambda p: p.confidence, reverse=True)
        elif sort == SortOrder.CONFIDENCE_ASC:
            filtered.sort(key=lambda p: p.confidence, reverse=False)
        
        # Pagination
        total = len(filtered)
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated = filtered[start_idx:end_idx]
        
        return PaginatedPredictions(
            predictions=paginated,
            total=total,
            page=page,
            pageSize=page_size,
            totalPages=total_pages
        )
    
    def reload(self) -> None:
        """Clear cache and reload all data"""
        self._overview = None
        self._confusion_matrix = None
        self._confidence_curve = None
        self._errors_by_class = None
        self._predictions = None
        self._predictions_by_id = None


# Singleton instance
_data_store: Optional[DataStore] = None


def get_data_store() -> DataStore:
    """Get or create the singleton DataStore instance"""
    global _data_store
    if _data_store is None:
        # Default data directory
        data_dir = Path(__file__).parent.parent / "data"
        _data_store = DataStore(data_dir)
    return _data_store


def init_data_store(data_dir: Path) -> DataStore:
    """Initialize the data store with a custom data directory"""
    global _data_store
    _data_store = DataStore(data_dir)
    return _data_store

