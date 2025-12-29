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
#   --epochs 3           Training epochs (default: 3)
#   --seed 42            Random seed for reproducibility (default: 42)
#   --no-images          Skip saving test images (faster, use if images exist)
#   --output-dir PATH    Custom output directory for artifacts
```

This will:
- Train a SimpleCNN on CIFAR-10 (~70% accuracy in 3 epochs)
- Evaluate on the test set (10,000 images)
- Generate artifacts in `app/data/`:
  - `labels.json` - CIFAR-10 class labels
  - `overview.json` - Model metrics & failure breakdown
  - `confusion_matrix.json` - 10x10 confusion matrix
  - `confidence_curve.json` - Accuracy per confidence bin
  - `errors_by_class.json` - Error distribution by class
  - `calibration.json` - Reliability bins and ECE (Expected Calibration Error)
  - `predictions.jsonl` - All 10,000 prediction records
- Save test images to `app/static/images/test/` (use `--no-images` to skip)

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
| `GET /api/calibration` | Reliability diagram data with ECE |
| `GET /api/export` | Export predictions as CSV or JSONL |

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

### Query Parameters for `/api/calibration`

| Parameter | Type | Description |
|-----------|------|-------------|
| `bins` | int | Number of calibration bins (default: 10) |

### Query Parameters for `/api/export`

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | **Required.** `csv` or `jsonl` |
| `only_errors` | bool | Filter to errors only |
| `only_high_confidence_errors` | bool | Filter to dangerous errors |
| `true_label` | string | Filter by true label |
| `pred_label` | string | Filter by predicted label |
| `min_conf` | float | Minimum confidence (0-1) |
| `max_conf` | float | Maximum confidence (0-1) |
| `sort` | string | `confidence_desc` or `confidence_asc` |

**CSV columns:** `id, true_label, pred_label, confidence, error_type, image_url`

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
# Quick evaluation (fewer epochs, lower accuracy but faster)
python -m app.services.evaluator --epochs 1

# Higher accuracy (more epochs)
python -m app.services.evaluator --epochs 5

# Skip image saving (faster if images already exist)
python -m app.services.evaluator --no-images

# Different random seed
python -m app.services.evaluator --seed 123
```

**Note:** The model uses `conf_threshold=0.8` to label `isHighConfidenceError` (predictions where confidence ≥ 0.8 but wrong).

## Connecting to Frontend

The backend includes CORS headers for:
- `http://localhost:5173` (Vite default)
- `http://localhost:5174` (Vite alternate)

To use real backend data instead of mocks, update the frontend `.env`:

```env
VITE_USE_MOCKS=false
VITE_API_BASE=http://localhost:8000
```

## New Features (v2)

### 1. Calibration / Reliability Diagram

The dashboard now includes a **Reliability Diagram** showing model calibration:
- **ECE (Expected Calibration Error)**: Measures how well confidence scores match actual accuracy
- **Bins**: Shows average confidence vs accuracy per bin
- Lower ECE = better calibrated model

### 2. Slice Explorer

Click on any cell in the **Confusion Matrix** to explore that specific error slice:
- Clicking a cell (e.g., true=cat, pred=dog) sets filters automatically
- A **slice chip** appears showing the active slice (e.g., "cat → dog")
- Click the ✕ on the chip to clear the slice
- The Failure Table scrolls into view and refreshes with the filtered results

### 3. Export

Export filtered predictions directly from the dashboard:
- Click the **Export** button in the Filters Bar
- Choose **CSV** or **JSONL** format
- Exports respect current filters (slice, confidence range, error types)

### 4. Overconfident Errors Toggle

The "Only Confident Wrong" checkbox highlights the dashboard's killer feature:
- Shows predictions where confidence ≥ 0.8 but the model was wrong
- These are the most dangerous errors in production

