"""
JOBSHIELD AI - Pydantic Request & Response Schemas
Defines strict validation for job analysis requests and structured responses.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class JobAnalysisRequest(BaseModel):
    """Input payload for fake job posting analysis."""
    title: str = Field(
        ...,
        min_length=2,
        max_length=300,
        description="Official title of the job listing",
        examples=["Senior Full-Stack Engineer", "Data Entry Specialist"],
    )
    company_name: Optional[str] = Field(
        default="",
        max_length=200,
        description="Name of hiring organization",
    )
    description: str = Field(
        ...,
        min_length=10,
        description="Main job duties, overview, and responsibilities",
    )
    company_profile: Optional[str] = Field(
        default="",
        description="Company background, mission, or about text",
    )
    company_website: Optional[str] = Field(
        default="",
        description="Official corporate website or career URL",
    )
    employment_type: Optional[str] = Field(
        default="",
        description="Full-time, Part-time, Contract, etc.",
    )
    required_experience: Optional[str] = Field(
        default="",
        description="Entry level, Mid-Senior level, Executive, etc.",
    )
    required_education: Optional[str] = Field(
        default="",
        description="High School, Bachelor's Degree, Master's, etc.",
    )
    salary_range: Optional[str] = Field(
        default="",
        description="Advertised salary or compensation tier",
    )
    location: Optional[str] = Field(
        default="",
        description="Geographic location or 'Remote'",
    )
    required_skills: Optional[str] = Field(
        default="",
        description="Technologies, tools, or domain competencies",
    )
    benefits: Optional[str] = Field(
        default="",
        description="Company benefits, perks, or equipment stipends",
    )
    industry: Optional[str] = Field(
        default="",
        description="Industry domain (e.g., Information Technology, Finance)",
    )
    function: Optional[str] = Field(
        default="",
        description="Functional role (e.g., Engineering, Sales, Administrative)",
    )


class TokenContribution(BaseModel):
    term: str
    tfidf_weight: float
    coefficient: float
    contribution: float
    direction: str


class ModelEvidence(BaseModel):
    positive_fraud_contributors: List[TokenContribution]
    negative_legit_contributors: List[TokenContribution]
    intercept_bias: float
    active_tokens_count: int
    net_log_odds: float


class HeuristicWarning(BaseModel):
    rule_id: str
    category: str
    severity: str
    title: str
    detail: str
    matched_terms: List[str]
    source: str


class VerificationStep(BaseModel):
    priority: str
    title: str
    action: str


class PredictionDetail(BaseModel):
    predicted_class: str
    is_fraudulent: bool
    confidence_score: float
    fraud_probability: float
    legitimate_probability: float
    risk_tier: str
    risk_label: str
    risk_badge_color: str


class JobAnalysisResponse(BaseModel):
    id: str
    analyzed_at: str
    input_summary: Dict[str, Any]
    prediction: PredictionDetail
    model_evidence: ModelEvidence
    heuristic_warnings: List[HeuristicWarning]
    verification_steps: List[VerificationStep]
    disclaimer: str


class ModelInfoResponse(BaseModel):
    model_name: str
    version: str
    architecture: str
    trained_at: str
    training_duration_seconds: float
    dataset: Dict[str, Any]
    metrics: Dict[str, Any]
    hyperparameters: Dict[str, Any]
    top_fraud_terms: List[Dict[str, Any]]
    top_legit_terms: List[Dict[str, Any]]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model_loaded: bool
    timestamp: str


class ReadyResponse(BaseModel):
    ready: bool
    service: str
    model_loaded: bool
    timestamp: str
    message: str


class BatchJobAnalysisRequest(BaseModel):
    """Payload for analyzing multiple job postings in a single request."""
    jobs: List[JobAnalysisRequest] = Field(
        ...,
        min_length=1,
        max_length=25,
        description="List of job postings to evaluate (up to 25 per batch)",
    )


class BatchJobAnalysisResponse(BaseModel):
    """Batch analysis response containing individual results and batch statistics."""
    total_analyzed: int
    fraudulent_count: int
    legitimate_count: int
    processed_at: str
    results: List[JobAnalysisResponse]

