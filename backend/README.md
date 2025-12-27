# ML Failure Analysis Dashboard - Backend

FastAPI backend that serves model evaluation artifacts for the ML Failure Analysis Dashboard.

## Quick Start

### 1. Setup Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Generate Artifacts (Train & Evaluate CIFAR-10 Model)

```bash
# Run the evaluator to train a CNN and generate all dashboard artifacts
python -m app.services.evaluator

# Options:
#   --epochs 10          Training epochs (default: 10)
#   --seed 42            Random seed for reproducibility (default: 42)
#   --batch-size 128     Batch size (default: 128)
#   --force-retrain      Force retrain even if model exists
#   --no-save-images     Skip saving test images (faster)
#   --max-samples 10000  Max samples to evaluate (default: 10000)
```

This will:
- Train a SimpleCNN on CIFAR-10 (~85% accuracy in 10 epochs)
- Evaluate on the test set (10,000 images)
- Generate artifacts in `app/data/`:
  - `overview.json` - Model metrics
  - `confusion_matrix.json` - 10x10 confusion matrix
  - `confidence_curve.json` - Accuracy per confidence bin
  - `errors_by_class.json` - Error distribution by class
  - `predictions.jsonl` - All prediction records
- Save test images to `app/static/images/test/`

### 3. Start the API Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API Root**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/overview` | Model metrics & failure breakdown |
| `GET /api/confusion-matrix` | Confusion matrix data |
| `GET /api/confidence-curve` | Calibration curve data |
| `GET /api/errors-by-class` | Error distribution by class |
| `GET /api/predictions` | Paginated predictions with filters |
| `GET /api/predictions/{id}` | Single prediction by ID |

### Query Parameters for `/api/predictions`

| Parameter | Type | Description |
|-----------|------|-------------|
| `only_errors` | bool | Filter to errors only |
| `only_high_confidence_errors` | bool | Filter to dangerous errors (conf ≥ 0.8 & wrong) |
| `true_label` | string | Filter by true label |
| `pred_label` | string | Filter by predicted label |
| `min_conf` | float | Minimum confidence (0-1) |
| `max_conf` | float | Maximum confidence (0-1) |
| `page` | int | Page number (default: 1) |
| `page_size` | int | Items per page (default: 10, max: 100) |
| `sort` | string | `confidence_desc` or `confidence_asc` |

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes.py       # API endpoints
│   ├── data/               # Generated artifacts (JSON)
│   ├── models/
│   │   └── schemas.py      # Pydantic models
│   ├── services/
│   │   ├── data_store.py   # Data loading & caching
│   │   └── evaluator.py    # CIFAR-10 model training & evaluation
│   ├── static/
│   │   └── images/test/    # Test images (generated)
│   └── main.py             # FastAPI app
├── requirements.txt
└── README.md
```

## Development

### Using Mock Data

If you want to skip training and use pre-generated mock data:

1. The repo includes sample data files in `app/data/`
2. Just start the server: `uvicorn app.main:app --reload`

### Regenerating Artifacts

To regenerate artifacts with different settings:

```bash
# Quick evaluation (fewer epochs)
python -m app.services.evaluator --epochs 5

# Force retrain existing model
python -m app.services.evaluator --force-retrain

# Skip image saving (faster)
python -m app.services.evaluator --no-save-images
```

## Connecting to Frontend

The backend includes CORS headers for:
- `http://localhost:5173` (Vite default)
- `http://localhost:5174` (Vite alternate)

To use real backend data instead of mocks, update the frontend `.env`:

```env
VITE_USE_MOCKS=false
VITE_API_BASE=http://localhost:8000
```

