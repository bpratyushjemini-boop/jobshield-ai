"""
JOBSHIELD AI - Text Preprocessor and Normalization Pipeline
Cleans and standardizes job posting text fields from EMSCAD schema
and user input.
"""

import math
import re
from typing import Dict, Any, Optional

# Compiled regex patterns for efficient cleaning
HTML_TAG_RE = re.compile(r"<[^>]+>")
URL_PLACEHOLDER_RE = re.compile(r"#URL_[a-f0-9]+#", re.IGNORECASE)
EMAIL_PLACEHOLDER_RE = re.compile(r"#EMAIL_[a-f0-9]+#", re.IGNORECASE)
PHONE_PLACEHOLDER_RE = re.compile(r"#PHONE_[a-f0-9]+#", re.IGNORECASE)
EXTRA_WHITESPACE_RE = re.compile(r"\s+")
SPECIAL_CHARS_RE = re.compile(r"[^\w\s\$\%\@\-\.\,\/\&]")


def clean_text(text: Any) -> str:
    """
    Cleans raw text from job postings:
    - Safely handles None, NaN, and non-string types
    - Removes HTML tags and EMSCAD hash-token placeholders
    - Preserves monetary symbols and common punctuation
    - Normalizes case and excess whitespace
    """
    if text is None:
        return ""
    if isinstance(text, float) and (math.isnan(text) or text != text):
        return ""
    if not isinstance(text, str):
        text = str(text)

    text = text.strip()
    if not text:
        return ""

    # Replace specific placeholders
    text = HTML_TAG_RE.sub(" ", text)
    text = URL_PLACEHOLDER_RE.sub(" external_link ", text)
    text = EMAIL_PLACEHOLDER_RE.sub(" contact_email ", text)
    text = PHONE_PLACEHOLDER_RE.sub(" contact_phone ", text)

    # HTML entity unescape for common symbols
    text = (
        text.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", '"')
        .replace("&#39;", "'")
        .replace("&nbsp;", " ")
    )

    # Strip unwanted special symbols while keeping alphanumeric and semantic punctuation
    text = SPECIAL_CHARS_RE.sub(" ", text)
    text = EXTRA_WHITESPACE_RE.sub(" ", text)
    return text.strip().lower()


def build_combined_text(
    title: Optional[Any] = "",
    company_name: Optional[Any] = "",
    company_profile: Optional[Any] = "",
    description: Optional[Any] = "",
    requirements: Optional[Any] = "",
    benefits: Optional[Any] = "",
    employment_type: Optional[Any] = "",
    required_experience: Optional[Any] = "",
    required_education: Optional[Any] = "",
    industry: Optional[Any] = "",
    function: Optional[Any] = "",
    location: Optional[Any] = "",
    salary_range: Optional[Any] = "",
    required_skills: Optional[Any] = "",
    department: Optional[Any] = "",
) -> str:
    """
    Combines individual job posting fields into a structured textual document
    with labeled sections. Only sections with actual cleaned content are included,
    preventing spurious empty header n-grams from distorting the vocabulary.
    """
    field_tuples = [
        ("job title", title),
        ("company", company_name),
        ("company profile", company_profile),
        ("location", location),
        ("department", department),
        ("industry", industry),
        ("function", function),
        ("employment type", employment_type),
        ("experience", required_experience),
        ("education", required_education),
        ("salary", salary_range),
        ("description", description),
        ("requirements", requirements),
        ("skills", required_skills),
        ("benefits", benefits),
    ]

    sections = []
    for label, raw_value in field_tuples:
        cleaned = clean_text(raw_value)
        if cleaned:
            sections.append(f"{label}: {cleaned}")

    return " \n ".join(sections)


def row_to_text(row: Dict[str, Any]) -> str:
    """Helper to convert a pandas DataFrame row or dict into combined clean text."""
    return build_combined_text(
        title=row.get("title"),
        company_name=row.get("company_name"),
        company_profile=row.get("company_profile"),
        description=row.get("description"),
        requirements=row.get("requirements"),
        benefits=row.get("benefits"),
        employment_type=row.get("employment_type"),
        required_experience=row.get("required_experience"),
        required_education=row.get("required_education"),
        industry=row.get("industry"),
        function=row.get("function"),
        location=row.get("location"),
        salary_range=row.get("salary_range"),
        required_skills=row.get("required_skills"),
        department=row.get("department"),
    )

