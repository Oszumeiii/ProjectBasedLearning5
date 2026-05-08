#!/usr/bin/env python
"""Entry point for LLM Service Flask server"""

import sys
import os

# Add the workspace to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.server import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
