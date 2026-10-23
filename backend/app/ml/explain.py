"""
JOBSHIELD AI - Explainability and Evidence Extraction Engine
Extracts exact feature contributions from the linear TF-IDF model
and evaluates heuristic risk signals.
"""

import re
from typing import Dict, List, Any, Optional
import numpy as np


# Heuristic patterns for common recruitment fraud red flags
HEURISTIC_RULES = [
    {
        "id": "UNOFFICIAL_COMMUNICATION_APP",
        "category": "Communication Channel",
        "severity": "HIGH",
        "regex": re.compile(r"\b(telegram|whatsapp|signal|hangouts|google\s*chat|skype\s*interview)\b", re.IGNORECASE),
        "title": "Off-platform chat requested for interview/contact",
        "detail": "Legitimate employers almost never conduct official interviews exclusively over Telegram, WhatsApp, or instant messaging apps.",
    },
    {
        "id": "PERSONAL_EMAIL_DOMAIN",
        "category": "Domain Integrity",
        "severity": "HIGH",
        "regex": re.compile(r"\b[A-Za-z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|protonmail|aol)\.com\b", re.IGNORECASE),
        "title": "Personal or free email address used for recruiting",
        "detail": "Reputable companies contact candidates using enterprise domains matching their official corporate website, not free webmail services.",
    },
    {
        "id": "PAYMENT_OR_CHECK_PROCESSING",
        "category": "Financial Request",
        "severity": "CRITICAL",
        "regex": re.compile(r"\b(wire\s*transfer|cashier('?s)?\s*check|western\s*union|moneygram|crypto|bitcoin|reimburse.*equipment|check\s*deposit|purchase\s*materials)\b", re.IGNORECASE),
        "title": "Payment transfer, check cashing, or equipment purchase mentioned",
        "detail": "Classic fake check scam: scammers ask you to deposit a check and wire funds to their 'vendor' for home office equipment.",
    },
    {
        "id": "URGENT_OR_PRESSURE_TACTICS",
        "category": "Urgency & Scarcity",
        "severity": "MEDIUM",
        "regex": re.compile(r"\b(urgent\s*hire|immediate\s*start|no\s*interview\s*needed|guaranteed\s*placement|start\s*today|act\s*now)\b", re.IGNORECASE),
        "title": "Excessive urgency or bypass of standard interview process",
        "detail": "Scammers rush candidates into sharing sensitive information or money before they have time to verify the employer.",
    },
    {
        "id": "UNREALISTIC_COMPENSATION",
        "category": "Compensation",
        "severity": "MEDIUM",
        "regex": re.compile(r"\b(\$?\d{2,3}[,\.]?\d{3}\s*(per\s*week|weekly|\/wk)|earn\s*\$?[1-9]\d{2,3}\s*daily|make\s*\$?\d{3,4}\s*a\s*day)\b", re.IGNORECASE),
        "title": "Exaggerated weekly/daily earnings advertised",
        "detail": "Advertising high daily or weekly payouts for low-skill remote tasks is a hallmark of phishing and task scams.",
    },
    {
        "id": "DATA_ENTRY_ENVELOPE_STUFFING",
        "category": "Role Type",
        "severity": "MEDIUM",
        "regex": re.compile(r"\b(data\s*entry\s*clerk|envelope\s*stuffing|mystery\s*shopper|package\s*reship|processing\s*payments)\b", re.IGNORECASE),
        "title": "High-risk job category commonly spoofed by scammers",
        "detail": "Data entry and package forwarding roles are among the most frequently faked listings in online job boards.",
    },
]


def extract_model_explanations(
    text: str,
    vectorizer: Any,
    classifier: Any,
    top_k: int = 8,
) -> Dict[str, Any]:
    """
    Computes exact linear contributions:
    contribution_j = tfidf_j * beta_j
    Returns top terms pulling towards Fraudulent (positive) and Legitimate (negative).
    """
    if not text or not vectorizer or not classifier:
        return {"fraud_indicators": [], "legitimate_indicators": [], "intercept": 0.0}

    # Transform document
    X_tfidf = vectorizer.transform([text])
    feature_names = np.array(vectorizer.get_feature_names_out())
    coef = classifier.coef_[0]

    # Non-zero indices in sparse vector
    nonzero_indices = X_tfidf.indices
    nonzero_values = X_tfidf.data

    if len(nonzero_indices) == 0:
        return {
            "fraud_indicators": [],
            "legitimate_indicators": [],
            "intercept": float(classifier.intercept_[0]),
            "total_features_active": 0,
        }

    # Calculate exact contribution for each active token
    contributions = nonzero_values * coef[nonzero_indices]
    active_tokens = feature_names[nonzero_indices]

    # Combine into structured records
    token_records = [
        {
            "term": str(active_tokens[i]),
            "tfidf_weight": round(float(nonzero_values[i]), 4),
            "coefficient": round(float(coef[nonzero_indices[i]]), 4),
            "contribution": round(float(contributions[i]), 4),
            "direction": "fraudulent" if contributions[i] > 0 else "legitimate",
        }
        for i in range(len(contributions))
    ]

    # Split into positive (pushing towards fraud) and negative (pushing towards legit)
    fraud_terms = [t for t in token_records if t["contribution"] > 0]
    legit_terms = [t for t in token_records if t["contribution"] < 0]

    # Sort by absolute magnitude of contribution
    fraud_terms.sort(key=lambda x: x["contribution"], reverse=True)
    legit_terms.sort(key=lambda x: x["contribution"])  # most negative first

    return {
        "fraud_indicators": fraud_terms[:top_k],
        "legitimate_indicators": legit_terms[:top_k],
        "intercept": round(float(classifier.intercept_[0]), 4),
        "total_features_active": len(nonzero_indices),
        "net_model_log_odds": round(float(classifier.intercept_[0] + np.sum(contributions)), 4),
    }


def evaluate_heuristic_signals(
    combined_text: str,
    raw_fields: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Evaluates rule-based heuristic patterns against the job posting.
    These are explicitly distinguished from model-derived coefficients.
    """
    detected = []
    text_to_search = combined_text

    # Search rules in text
    for rule in HEURISTIC_RULES:
        matches = rule["regex"].findall(text_to_search)
        if matches:
            # Flatten tuples if regex groups exist
            unique_matches = list(set([m if isinstance(m, str) else m[0] for m in matches if m]))
            detected.append({
                "rule_id": rule["id"],
                "category": rule["category"],
                "severity": rule["severity"],
                "title": rule["title"],
                "detail": rule["detail"],
                "matched_terms": unique_matches[:5],
                "source": "heuristic_rule",
            })

    # Additional contextual heuristics
    if raw_fields:
        company_profile = raw_fields.get("company_profile", "")
        company_website = raw_fields.get("company_website", "")

        if not company_profile or len(str(company_profile).strip()) < 30:
            detected.append({
                "rule_id": "EMPTY_COMPANY_PROFILE",
                "category": "Company Transparency",
                "severity": "LOW",
                "title": "Minimal or absent company profile",
                "detail": "Legitimate corporate listings usually provide an established company mission, background, or overview.",
                "matched_terms": [],
                "source": "heuristic_rule",
            })

        if not company_website or not str(company_website).strip():
            detected.append({
                "rule_id": "NO_COMPANY_WEBSITE",
                "category": "Company Transparency",
                "severity": "LOW",
                "title": "No official website provided",
                "detail": "Absence of a verifiable corporate website makes independent domain authentication difficult.",
                "matched_terms": [],
                "source": "heuristic_rule",
            })

    return detected
