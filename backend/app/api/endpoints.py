"""
JOBSHIELD AI - API Endpoints
Handles /health, /model-info, /predict, and /presets endpoints.
"""

import os
import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException, status

from app.schemas.job import (
    JobAnalysisRequest,
    JobAnalysisResponse,
    BatchJobAnalysisRequest,
    BatchJobAnalysisResponse,
    ModelInfoResponse,
    HealthResponse,
    ReadyResponse,
)
from app.ml.predictor import predictor, ModelNotLoadedError

router = APIRouter()

PRESETS_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "sample_presets.json")
)


@router.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health check / Liveness probe",
    description="Returns the operational status of the service process.",
)
def get_health():
    """Returns the operational status of the service and model loading state."""
    return HealthResponse(
        status="operational" if predictor.is_loaded else "degraded",
        service="JOBSHIELD AI Fake Job Posting Detection Service",
        version="1.0.0",
        model_loaded=predictor.is_loaded,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get(
    "/ready",
    response_model=ReadyResponse,
    tags=["System"],
    summary="Readiness probe",
    description="Returns 200 when the ML model pipeline is fully loaded in memory and ready for inference.",
)
def get_readiness():
    """Readiness probe for zero-downtime traffic routing and Kubernetes/container checks."""
    if not predictor.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service Not Ready: ML pipeline is still initializing or model artifact is missing.",
        )
    return ReadyResponse(
        ready=True,
        service="JOBSHIELD AI Fake Job Posting Detection Service",
        model_loaded=True,
        timestamp=datetime.now(timezone.utc).isoformat(),
        message="Model pipeline ready for real-time inference.",
    )


@router.get(
    "/model-info",
    response_model=ModelInfoResponse,
    tags=["Model Governance"],
    summary="Model metadata and evaluation metrics",
    description="Returns full model card, held-out benchmark evaluation metrics, and top global feature indicators.",
)
def get_model_info():
    """
    Returns full model metadata, verified held-out evaluation metrics,
    training configuration, and top global feature indicators.
    """
    if not predictor.is_loaded or not predictor.metadata:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model metadata is unavailable. Ensure the model has been trained via `python backend/app/ml/train.py`.",
        )
    return predictor.metadata


@router.post(
    "/predict",
    response_model=JobAnalysisResponse,
    tags=["Inference"],
    summary="Analyze single job posting",
    description="Runs TF-IDF feature attribution and heuristic rules to classify a job posting as legitimate or fraudulent.",
)
def analyze_job_posting(request: JobAnalysisRequest):
    """
    Analyzes an incoming job posting.
    Returns:
    - Predicted classification (Potentially Fraudulent vs Likely Legitimate)
    - Model probability and risk tier
    - Mathematical linear feature contributions (tokens pulling toward fraud vs legit)
    - Heuristic warnings based on security patterns
    - Actionable applicant verification checklist
    """
    try:
        raw_dict = request.model_dump()
        result = predictor.predict(raw_dict)

        analysis_id = f"jobshield-{uuid.uuid4().hex[:10]}"
        return JobAnalysisResponse(
            id=analysis_id,
            analyzed_at=datetime.now(timezone.utc).isoformat(),
            input_summary={
                "title": request.title,
                "company_name": request.company_name or "Not Specified",
                "location": request.location or "Not Specified",
                "salary_range": request.salary_range or "Not Specified",
                "employment_type": request.employment_type or "Not Specified",
            },
            prediction=result["prediction"],
            model_evidence=result["model_evidence"],
            heuristic_warnings=result["heuristic_warnings"],
            verification_steps=result["verification_steps"],
            disclaimer=result["disclaimer"],
        )

    except ModelNotLoadedError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service Error: {str(e)}",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal inference failure: {str(e)}",
        )


@router.post(
    "/batch-predict",
    response_model=BatchJobAnalysisResponse,
    tags=["Inference"],
    summary="Analyze multiple job postings in batch",
    description="Processes up to 25 job postings sequentially and aggregates risk metrics across the batch.",
)
def analyze_job_postings_batch(request: BatchJobAnalysisRequest):
    """
    Batch job analysis endpoint for bulk screening and cohort comparisons.
    """
    if not predictor.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction engine not ready.",
        )

    results: List[JobAnalysisResponse] = []
    fraud_count = 0
    legit_count = 0

    for job in request.jobs:
        raw_dict = job.model_dump()
        result = predictor.predict(raw_dict)
        analysis_id = f"jobshield-{uuid.uuid4().hex[:10]}"

        if result["prediction"]["is_fraudulent"]:
            fraud_count += 1
        else:
            legit_count += 1

        results.append(
            JobAnalysisResponse(
                id=analysis_id,
                analyzed_at=datetime.now(timezone.utc).isoformat(),
                input_summary={
                    "title": job.title,
                    "company_name": job.company_name or "Not Specified",
                    "location": job.location or "Not Specified",
                    "salary_range": job.salary_range or "Not Specified",
                    "employment_type": job.employment_type or "Not Specified",
                },
                prediction=result["prediction"],
                model_evidence=result["model_evidence"],
                heuristic_warnings=result["heuristic_warnings"],
                verification_steps=result["verification_steps"],
                disclaimer=result["disclaimer"],
            )
        )

    return BatchJobAnalysisResponse(
        total_analyzed=len(results),
        fraudulent_count=fraud_count,
        legitimate_count=legit_count,
        processed_at=datetime.now(timezone.utc).isoformat(),
        results=results,
    )


@router.get(
    "/presets",
    response_model=List[Dict[str, Any]],
    tags=["Demonstration"],
    summary="Get vetted job sample presets",
    description="Returns curated realistic legitimate and fraudulent job posting presets for demonstration and testing.",
)
def get_sample_presets():
    """Returns curated presets of realistic legitimate and fraudulent job postings."""
    if not os.path.exists(PRESETS_PATH):
        return []
    try:
        with open(PRESETS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not load presets: {e}",
        )

