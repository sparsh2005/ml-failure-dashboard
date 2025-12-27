"""FastAPI application for ML Failure Analysis Dashboard."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .api.routes import router as api_router


# Create FastAPI app
app = FastAPI(
    title="ML Failure Analysis Dashboard API",
    description="Backend API for analyzing ML model failures on CIFAR-10",
    version="1.0.0"
)

# CORS configuration - allow frontend origins
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:5174",  # Vite alternative port
    "http://localhost:3000",  # Common dev port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for images
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Include API router
app.include_router(api_router)


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "ML Failure Analysis Dashboard API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "overview": "/api/overview",
            "confusion_matrix": "/api/confusion-matrix",
            "confidence_curve": "/api/confidence-curve",
            "errors_by_class": "/api/errors-by-class",
            "predictions": "/api/predictions",
            "prediction_by_id": "/api/predictions/{id}"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

