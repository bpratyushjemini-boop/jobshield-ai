#!/usr/bin/env python3
"""
Convenience launcher for JOBSHIELD AI FastAPI server.
Usage:
    python backend/run.py
"""

import os
import sys
import uvicorn

# Ensure backend root is on sys.path
backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    print(f"[*] Launching JOBSHIELD AI Backend on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
