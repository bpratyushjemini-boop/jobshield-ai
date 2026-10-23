"""
Unit tests for text preprocessing and field combination logic.
"""

import pytest
from app.ml.preprocessor import clean_text, build_combined_text, row_to_text


def test_clean_text_basic():
    raw = "Senior Software Engineer at ACME Corp!"
    cleaned = clean_text(raw)
    assert "senior software engineer at acme corp" in cleaned


def test_clean_text_html_tags():
    raw = "<p>Join our <b>dynamic</b> team! &amp; grow.</p>"
    cleaned = clean_text(raw)
    assert "<p>" not in cleaned
    assert "<b>" not in cleaned
    assert "&amp;" not in cleaned
    assert "join our dynamic team" in cleaned
    assert "& grow" in cleaned


def test_clean_text_emscad_placeholders():
    raw = "Apply at #URL_12345678# or email #EMAIL_abcdef# or call #PHONE_09876543#."
    cleaned = clean_text(raw)
    assert "#URL_" not in cleaned
    assert "external_link" in cleaned
    assert "contact_email" in cleaned
    assert "contact_phone" in cleaned


def test_build_combined_text():
    combined = build_combined_text(
        title="Data Analyst",
        company_name="Insightful Inc",
        description="Analyze big data with SQL and Python.",
        requirements="2 years experience in Pandas.",
        salary_range="$80k - $95k",
    )
    assert "job title: data analyst" in combined
    assert "company: insightful inc" in combined
    assert "description: analyze big data with sql and python" in combined
    assert "salary: $80k - $95k" in combined


def test_row_to_text_with_missing_fields():
    row = {
        "title": "Cashier",
        "company_profile": None,
        "description": "Store cashier needed.",
        "requirements": None,
        "benefits": float("nan"),
        "salary_range": "",
        "department": "   ",
    }
    combined = row_to_text(row)
    assert "job title: cashier" in combined
    assert "description: store cashier needed" in combined
    assert "nan" not in combined
    assert "company profile:" not in combined
    assert "benefits:" not in combined
    assert "salary:" not in combined
    assert "department:" not in combined


def test_clean_text_none_and_nan():
    assert clean_text(None) == ""
    assert clean_text(float("nan")) == ""
    assert clean_text("") == ""
    assert clean_text("   ") == ""

