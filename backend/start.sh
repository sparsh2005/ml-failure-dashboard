#!/bin/bash

# Activate virtual environment if it exists
if [ -d "/opt/venv" ]; then
    source /opt/venv/bin/activate
fi

# Start the FastAPI app
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

