"""Data store service for loading and caching artifacts."""
import json
from pathlib import Path
from typing import List, Optional
from functools import lru_cache

from ..models.schemas import (
    OverviewMetrics,
    ConfusionMatrix,
    ConfidenceCurvePoint,
    ErrorByClass,
    PredictionRecord,
    SortOrder
)


# Path to data directory
DATA_DIR = Path(__file__).parent.parent / "data"


class DataStore:
    """Singleton data store that caches loaded artifacts in memory."""
    
    _instance: Optional["DataStore"] = None
    
    def __new__(cls) -> "DataStore":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._overview: Optional[OverviewMetrics] = None
        self._confusion_matrix: Optional[ConfusionMatrix] = None
        self._confidence_curve: Optional[List[ConfidenceCurvePoint]] = None
        self._errors_by_class: Optional[List[ErrorByClass]] = None
        self._predictions: Optional[List[PredictionRecord]] = None
    
    def _load_json(self, filename: str) -> dict | list:
        """Load JSON file from data directory."""
        filepath = DATA_DIR / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Data file not found: {filepath}")
        with open(filepath, "r") as f:
            return json.load(f)
    
    def _load_jsonl(self, filename: str) -> List[dict]:
        """Load JSONL file from data directory."""
        filepath = DATA_DIR / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Data file not found: {filepath}")
        records = []
        with open(filepath, "r") as f:
            for line in f:
                line = line.strip()
                if line:
                    records.append(json.loads(line))
        return records
    
    def get_overview(self) -> OverviewMetrics:
        """Get cached overview metrics."""
        if self._overview is None:
            data = self._load_json("overview.json")
            self._overview = OverviewMetrics(**data)
        return self._overview
    
    def get_confusion_matrix(self) -> ConfusionMatrix:
        """Get cached confusion matrix."""
        if self._confusion_matrix is None:
            data = self._load_json("confusion_matrix.json")
            self._confusion_matrix = ConfusionMatrix(**data)
        return self._confusion_matrix
    
    def get_confidence_curve(self) -> List[ConfidenceCurvePoint]:
        """Get cached confidence curve data."""
        if self._confidence_curve is None:
            data = self._load_json("confidence_curve.json")
            self._confidence_curve = [ConfidenceCurvePoint(**point) for point in data]
        return self._confidence_curve
    
    def get_errors_by_class(self) -> List[ErrorByClass]:
        """Get cached errors by class data."""
        if self._errors_by_class is None:
            data = self._load_json("errors_by_class.json")
            self._errors_by_class = [ErrorByClass(**item) for item in data]
        return self._errors_by_class
    
    def get_predictions(self) -> List[PredictionRecord]:
        """Get cached predictions list."""
        if self._predictions is None:
            data = self._load_jsonl("predictions.jsonl")
            self._predictions = [PredictionRecord(**record) for record in data]
        return self._predictions
    
    def get_prediction_by_id(self, prediction_id: str) -> Optional[PredictionRecord]:
        """Get a single prediction by ID."""
        predictions = self.get_predictions()
        for pred in predictions:
            if pred.id == prediction_id:
                return pred
        return None
    
    def query_predictions(
        self,
        only_errors: bool = False,
        only_high_confidence_errors: bool = False,
        true_label: Optional[str] = None,
        predicted_label: Optional[str] = None,
        min_confidence: Optional[float] = None,
        max_confidence: Optional[float] = None,
        sort: SortOrder = SortOrder.CONFIDENCE_DESC,
        page: int = 1,
        page_size: int = 10
    ) -> tuple[List[PredictionRecord], int]:
        """
        Query predictions with filters and pagination.
        
        Returns:
            Tuple of (paginated predictions, total count)
        """
        predictions = self.get_predictions()
        
        # Apply filters
        filtered = predictions
        
        if only_errors:
            filtered = [p for p in filtered if not p.is_correct]
        
        if only_high_confidence_errors:
            filtered = [p for p in filtered if p.is_high_confidence_error]
        
        if true_label:
            filtered = [p for p in filtered if p.true_label == true_label]
        
        if predicted_label:
            filtered = [p for p in filtered if p.predicted_label == predicted_label]
        
        if min_confidence is not None:
            filtered = [p for p in filtered if p.confidence >= min_confidence]
        
        if max_confidence is not None:
            filtered = [p for p in filtered if p.confidence <= max_confidence]
        
        # Sort
        if sort == SortOrder.CONFIDENCE_DESC:
            filtered.sort(key=lambda p: p.confidence, reverse=True)
        elif sort == SortOrder.CONFIDENCE_ASC:
            filtered.sort(key=lambda p: p.confidence, reverse=False)
        
        # Get total count before pagination
        total = len(filtered)
        
        # Paginate
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated = filtered[start_idx:end_idx]
        
        return paginated, total
    
    def reload(self):
        """Force reload all data from disk."""
        self._overview = None
        self._confusion_matrix = None
        self._confidence_curve = None
        self._errors_by_class = None
        self._predictions = None


@lru_cache()
def get_data_store() -> DataStore:
    """Get the singleton data store instance."""
    return DataStore()

