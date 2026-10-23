"""
JOBSHIELD AI - Main FastAPI Application
Fake Job Posting Detection System Backend
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.endpoints import router as api_router
from app.ml.predictor import predictor


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes and loads ML models into memory on server startup."""
    print("[*] Starting JOBSHIELD AI backend service...")
    try:
        predictor.load()
        print("[+] ML Model pipeline loaded successfully into memory.")
        if predictor.metadata:
            metrics = predictor.metadata.get("metrics", {})
            print(f"    - Held-out Accuracy: {metrics.get('accuracy', 0)*100:.2f}%")
            print(f"    - Held-out ROC-AUC:  {metrics.get('roc_auc', 0):.4f}")
            print(f"    - Held-out F1-Score: {metrics.get('fraud_f1', 0):.4f}")
    except Exception as e:
        print(f"[!] Warning: ML model could not be loaded at startup: {e}")
        print("    Inference requests will return 503 until model is trained.")
    yield
    print("[*] Shutting down JOBSHIELD AI backend service...")


app = FastAPI(
    title="JOBSHIELD AI — Fake Job Posting Detection API",
    description=(
        "Production-ready machine learning API for detecting fraudulent job postings, "
        "trained on the Employment Scam Aegean Dataset (EMSCAD) with TF-IDF, "
        "calibrated linear explainability, and heuristic risk pattern analysis."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, RedirectResponse

# CORS configuration for local development and production
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

additional_origin = os.getenv("FRONTEND_URL")
if additional_origin:
    origins.append(additional_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    """Formats 422 validation errors into structured, user-friendly JSON."""
    errors = []
    for err in exc.errors():
        loc_parts = [str(x) for x in err.get("loc", []) if x != "body"]
        field = ".".join(loc_parts) if loc_parts else "payload"
        errors.append({
            "field": field,
            "message": err.get("msg", "Invalid field value"),
            "type": err.get("type", "validation_error"),
        })
    return JSONResponse(
        status_code=422,
        content={
            "detail": f"Request validation failed for {len(errors)} field(s): {', '.join(e['field'] for e in errors)}",
            "errors": errors,
        },
    )


# Mount endpoints at both root and /api/v1 for convenience
app.include_router(api_router, prefix="")
app.include_router(api_router, prefix="/api/v1")



@app.get("/", include_in_schema=False)
def root():
    """Redirect root path to interactive Swagger documentation."""
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
