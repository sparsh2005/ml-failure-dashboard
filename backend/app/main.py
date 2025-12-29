from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .api import router


# Create FastAPI app
app = FastAPI(
    title="ML Failure Analysis Dashboard API",
    description="Backend API for analyzing ML model failures on CIFAR-10",
    version="1.0.0"
)

# Configure CORS for frontend development and production
import os

# Allow all origins in production for easier deployment
# In production, you'd want to restrict this to your specific Vercel domain
allowed_origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:5174",  # Vite alternate
    "http://localhost:3000",  # Common React port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

# Add production origins from environment variable if set
if production_origins := os.getenv("ALLOWED_ORIGINS"):
    allowed_origins.extend(production_origins.split(","))

# For demo purposes, allow all Vercel deployments
# In production, replace "*" with your specific domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for demo (change in production)
    allow_credentials=False,  # Must be False when allow_origins is "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving images
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Include API router
app.include_router(router)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "ML Failure Analysis Dashboard API",
        "docs": "/docs",
        "redoc": "/redoc",
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
    """Health check endpoint"""
    return {"status": "healthy"}

