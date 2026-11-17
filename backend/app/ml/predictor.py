"""
JOBSHIELD AI - Prediction and Inference Engine
Loads the trained TF-IDF + Logistic Regression pipeline and performs
real-time inference, risk tier assessment, explainability extraction,
and verification checklist generation.
"""

import os
import json
from typing import Dict, Any, List, Optional
import joblib

from app.ml.preprocessor import build_combined_text
from app.ml.explain import extract_model_explanations, evaluate_heuristic_signals

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))
MODEL_PATH = os.path.join(MODELS_DIR, "jobshield_model.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")


class ModelNotLoadedError(RuntimeError):
    """Raised when prediction is attempted without a valid trained model artifact."""
    pass


class JobShieldPredictor:
    """Manages model lifecycle and inference requests."""

    def __init__(self, model_path: str = MODEL_PATH, metadata_path: str = METADATA_PATH):
        self.model_path = model_path
        self.metadata_path = metadata_path
        self.pipeline = None
        self.vectorizer = None
        self.classifier = None
        self.metadata = {}
        self.is_loaded = False

    def load(self) -> None:
        """Loads model artifact and metadata from disk."""
        if not os.path.exists(self.model_path):
            raise ModelNotLoadedError(
                f"Model artifact not found at '{self.model_path}'. "
                f"Please run the training script first: `python backend/app/ml/train.py`."
            )

        try:
            artifact = joblib.load(self.model_path)
            if "pipeline" in artifact:
                self.pipeline = artifact["pipeline"]
                self.vectorizer = self.pipeline.named_steps["vectorizer"]
                self.classifier = self.pipeline.named_steps["classifier"]
            else:
                self.pipeline = None
                self.vectorizer = artifact["vectorizer"]
                self.classifier = artifact["classifier"]
            self.is_loaded = True
        except Exception as e:
            raise ModelNotLoadedError(f"Failed to deserialize model artifact: {e}")

        if os.path.exists(self.metadata_path):
            try:
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            except Exception as e:
                print(f"[!] Warning: Could not read metadata: {e}")


    def predict(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes end-to-end inference for a job posting.
        Returns prediction, probability, risk tier, explanations, and verification steps.
        """
        if not self.is_loaded or self.vectorizer is None or self.classifier is None:
            raise ModelNotLoadedError("Prediction engine is not loaded. Model artifact is missing or corrupted.")

        # 1. Build combined structured representation
        combined_text = build_combined_text(
            title=job_data.get("title", ""),
            company_name=job_data.get("company_name", ""),
            company_profile=job_data.get("company_profile", ""),
            description=job_data.get("description", ""),
            requirements=job_data.get("requirements", ""),
            benefits=job_data.get("benefits", ""),
            employment_type=job_data.get("employment_type", ""),
            required_experience=job_data.get("required_experience", ""),
            required_education=job_data.get("required_education", ""),
            industry=job_data.get("industry", ""),
            function=job_data.get("function", ""),
            location=job_data.get("location", ""),
            salary_range=job_data.get("salary_range", ""),
            required_skills=job_data.get("required_skills", ""),
        )

        if not combined_text.strip():
            raise ValueError("All job posting text fields are empty. Please provide at least a title or description.")

        # 2. Vectorize and compute model probabilities
        X_vec = self.vectorizer.transform([combined_text])
        probabilities = self.classifier.predict_proba(X_vec)[0]
        legitimate_prob = float(probabilities[0])
        fraudulent_prob = float(probabilities[1])

        # 3. Class decision and risk tier
        is_fraud = fraudulent_prob >= 0.50
        predicted_class = "Potentially Fraudulent" if is_fraud else "Likely Legitimate"

        if fraudulent_prob >= 0.80:
            risk_tier = "CRITICAL"
            risk_label = "Severe Risk: High Scam Probability"
            risk_badge_color = "red"
        elif fraudulent_prob >= 0.50:
            risk_tier = "HIGH"
            risk_label = "Elevated Risk: Potentially Deceptive"
            risk_badge_color = "amber"
        elif fraudulent_prob >= 0.25:
            risk_tier = "MODERATE"
            risk_label = "Moderate Risk: Review Indicators"
            risk_badge_color = "quicksand"
        else:
            risk_tier = "LOW"
            risk_label = "Low Risk: Likely Legitimate"
            risk_badge_color = "sapphire"

        # 4. Model-derived feature attribution
        model_explanations = extract_model_explanations(
            text=combined_text,
            vectorizer=self.vectorizer,
            classifier=self.classifier,
            top_k=8,
        )

        # 5. Heuristic pattern evaluation
        heuristic_warnings = evaluate_heuristic_signals(
            combined_text=combined_text,
            raw_fields=job_data,
        )

        # 6. Actionable verification checklist tailored to findings
        verification_steps = self._generate_verification_checklist(
            is_fraud=is_fraud,
            fraud_prob=fraudulent_prob,
            heuristics=heuristic_warnings,
            company_name=job_data.get("company_name", ""),
            company_website=job_data.get("company_website", ""),
        )

        return {
            "prediction": {
                "predicted_class": predicted_class,
                "is_fraudulent": is_fraud,
                "confidence_score": round(max(fraudulent_prob, legitimate_prob), 4),
                "fraud_probability": round(fraudulent_prob, 4),
                "legitimate_probability": round(legitimate_prob, 4),
                "risk_tier": risk_tier,
                "risk_label": risk_label,
                "risk_badge_color": risk_badge_color,
            },
            "model_evidence": {
                "positive_fraud_contributors": model_explanations.get("fraud_indicators", []),
                "negative_legit_contributors": model_explanations.get("legitimate_indicators", []),
                "intercept_bias": model_explanations.get("intercept", 0.0),
                "active_tokens_count": model_explanations.get("total_features_active", 0),
                "net_log_odds": model_explanations.get("net_model_log_odds", 0.0),
            },
            "heuristic_warnings": heuristic_warnings,
            "verification_steps": verification_steps,
            "disclaimer": (
                "JOBSHIELD AI is a probabilistic screening tool and does not constitute conclusive proof of fraud. "
                "Always perform independent background checks, inspect sender email headers, and never pay upfront fees or wire money."
            ),
        }

    def _generate_verification_checklist(
        self,
        is_fraud: bool,
        fraud_prob: float,
        heuristics: List[Dict[str, Any]],
        company_name: str,
        company_website: str,
    ) -> List[Dict[str, Any]]:
        """Generates clear, actionable applicant safety steps."""
        company_str = f"'{company_name}'" if company_name else "the hiring company"
        steps = [
            {
                "priority": "MANDATORY",
                "title": "Cross-reference official career portal",
                "action": f"Visit the official website of {company_str} directly (not via links in the email or job post) and confirm the requisition ID exists under their Careers page.",
            },
            {
                "priority": "CRITICAL",
                "title": "Zero-upfront-payment rule",
                "action": "Legitimate employers never require candidates to pay for onboarding, buy home-office equipment through a specific vendor, or deposit checks for reimbursement.",
            },
            {
                "priority": "HIGH",
                "title": "Verify sender email domain",
                "action": "Inspect the email header. Legitimate corporate recruiters reach out from official domain emails (e.g., recruiter@company.com), never free domains (@gmail.com, @yahoo.com) or misspelled spoof domains.",
            },
            {
                "priority": "MEDIUM",
                "title": "Verify recruiter identity on LinkedIn",
                "action": f"Search LinkedIn for the recruiter and compare their tenure, mutual connections, and verified organization affiliation with {company_str}.",
            },
            {
                "priority": "CRITICAL",
                "title": "Withhold sensitive PII until formal offer",
                "action": "Never provide bank account details, Social Security Number (SSN), passport copies, or credit card info during the initial application or interview stage.",
            },
        ]

        if any(h["rule_id"] == "UNOFFICIAL_COMMUNICATION_APP" for h in heuristics):
            steps.insert(
                0,
                {
                    "priority": "URGENT",
                    "title": "Refuse off-platform messaging interviews",
                    "action": "The listing or correspondence mentions Telegram, WhatsApp, or instant messaging. Insist on a formal video interview conducted through corporate Zoom, Teams, or Google Meet.",
                },
            )

        return steps

    def batch_predict(self, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Executes sequential inference across a batch of job postings.
        """
        results = []
        for job in jobs:
            try:
                res = self.predict(job)
                results.append({"success": True, "result": res, "error": None})
            except Exception as e:
                results.append({"success": False, "result": None, "error": str(e)})
        return results


# Global predictor instance
predictor = JobShieldPredictor()

