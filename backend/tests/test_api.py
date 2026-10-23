"""
Unit and integration tests for JOBSHIELD AI FastAPI endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ml.predictor import predictor

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def ensure_model_is_loaded():
    """Ensure ML predictor is loaded for tests."""
    predictor.load()


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("operational", "degraded")
    assert data["model_loaded"] is True
    assert "version" in data


def test_model_info_endpoint():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "JobShield AI Detector"
    assert "metrics" in data
    assert "accuracy" in data["metrics"]
    assert "roc_auc" in data["metrics"]
    assert "confusion_matrix" in data["metrics"]
    assert len(data["top_fraud_terms"]) > 0
    assert len(data["top_legit_terms"]) > 0


def test_presets_endpoint():
    response = client.get("/presets")
    assert response.status_code == 200
    presets = response.json()
    assert isinstance(presets, list)
    assert len(presets) >= 2
    assert "title" in presets[0]["data"]


def test_predict_legitimate_job():
    payload = {
        "title": "Senior Frontend Engineer",
        "company_name": "Stripe Payments Global",
        "description": "We are seeking a senior frontend engineer to build developer dashboard interfaces in React and TypeScript. You will collaborate with product designers, write unit tests, and maintain CI/CD pipelines.",
        "company_profile": "Global financial infrastructure platform founded in 2010.",
        "employment_type": "Full-time",
        "required_experience": "Mid-Senior level",
        "required_education": "Bachelor's Degree",
        "salary_range": "$150,000 - $180,000",
        "location": "San Francisco, CA",
        "required_skills": "React, TypeScript, CSS, Jest, GraphQL",
        "benefits": "Comprehensive medical, 401(k) matching, dental, vision, PTO.",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert data["prediction"]["predicted_class"] in ("Likely Legitimate", "Potentially Fraudulent")
    assert "fraud_probability" in data["prediction"]
    assert "model_evidence" in data
    assert "verification_steps" in data
    assert len(data["verification_steps"]) > 0


def test_predict_fraudulent_job_signals():
    payload = {
        "title": "URGENT Data Entry Clerk - Immediate Start",
        "company_name": "Apex Quick Staffing",
        "description": "URGENT HIRE! Work from home 2 hours a day and earn $4500 weekly! No experience needed. Immediate cash check will be mailed to buy home office equipment from our vendor. Deposit cashier check and wire the rest via Western Union.",
        "company_profile": "",
        "employment_type": "Part-time",
        "salary_range": "$4,500 / week",
        "location": "Anywhere",
        "benefits": "Contact recruiter on Telegram @FastCashRecruiter or whatsapp. Send resume to hr_quick_hire@gmail.com",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    prediction = data["prediction"]
    assert prediction["is_fraudulent"] is True
    assert prediction["fraud_probability"] > 0.50
    assert prediction["risk_tier"] in ("HIGH", "CRITICAL")
    # Verify heuristic signals caught the telegram and check cashing
    heuristic_ids = [h["rule_id"] for h in data["heuristic_warnings"]]
    assert "UNOFFICIAL_COMMUNICATION_APP" in heuristic_ids or "PAYMENT_OR_CHECK_PROCESSING" in heuristic_ids


def test_ready_endpoint():
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["ready"] is True
    assert data["model_loaded"] is True
    assert "ready for real-time inference" in data["message"].lower()


def test_batch_predict_endpoint():
    payload = {
        "jobs": [
            {
                "title": "Senior Frontend Engineer",
                "company_name": "Stripe Payments Global",
                "description": "We are seeking a senior frontend engineer to build developer dashboard interfaces in React and TypeScript.",
            },
            {
                "title": "URGENT Data Entry Clerk - Immediate Start",
                "company_name": "Apex Quick Staffing",
                "description": "URGENT HIRE! Work from home 2 hours a day and earn $4500 weekly! Wire transfer check.",
            },
        ]
    }
    response = client.post("/batch-predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_analyzed"] == 2
    assert len(data["results"]) == 2
    assert data["legitimate_count"] + data["fraudulent_count"] == 2


def test_predict_validation_error():
    # Empty title and short description should fail Pydantic validation
    payload = {
        "title": "",
        "description": "short",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422

