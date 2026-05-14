#!/usr/bin/env python
"""Entry point for LLM Service FastAPI server"""

import sys
import os
import uvicorn

# Add the workspace to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.server import app

if __name__ == "__main__":
    # FastAPI with uvicorn for async support
    # workers=1 because we're using a single ML model instance
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000,
        reload=False,
        workers=1
    )
