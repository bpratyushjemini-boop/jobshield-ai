# JOBSHIELD AI — Fake Job Posting Detection System

> **"Detect the deception. Protect your next move."**

JOBSHIELD AI is a production-grade, college-level machine learning and cybersecurity application engineered to detect recruitment fraud, fake cashier check scams, unauthorized off-platform recruiting, and identity harvesting in employment listings.

Trained on the **Employment Scam Aegean Dataset (EMSCAD)**—an internationally recognized benchmark containing 17,880 verified job postings—JOBSHIELD AI achieves **98.52% held-out accuracy**, an **ROC-AUC of 0.9916**, and a **91.33% fraud recall rate**. The system features exact linear feature explainability (token-level weights) combined with heuristic threat intelligence rules.

---

## Table of Contents

1. [Engineering References & Design Principles](#1-engineering-references--design-principles)
2. [Architecture & Technology Stack](#2-architecture--technology-stack)
3. [Verified Machine Learning Results](#3-verified-machine-learning-results)
4. [Explainability & Threat Intelligence](#4-explainability--threat-intelligence)
5. [Project Structure](#5-project-structure)
6. [Quickstart Guide (macOS / Linux)](#6-quickstart-guide-macos--linux)
7. [API Documentation](#7-api-documentation)
8. [Running Unit & Integration Tests](#8-running-unit--integration-tests)
9. [College Viva Defense Q&A Guide](#9-college-viva-defense-qa-guide)
10. [Responsible Use & Limitations](#10-responsible-use--limitations)

---

## 1. Engineering References & Design Principles

JOBSHIELD AI incorporates proven industry patterns from three key open-source engineering references:

### A. shadcn/ui (`shadcn-ui/ui`)
- **Accessible, Reusable Components:** Reusable primitives placed in `frontend/src/components/ui/` (`Button`, `Card`, `Badge`, `Input`, `Textarea`, `Label`, `Alert`, `Progress`, `Tabs`, `Separator`).
- **Tailwind Merging Utility:** Uses `cn(...)` in `frontend/src/lib/utils.ts` combining `clsx` and `tailwind-merge` to resolve class conflicts cleanly.
- **Variant Authority:** Employs `class-variance-authority` (`cva`) for type-safe design tokens and states (default, destructive, warning, success, cyber).
- **No Unrelated Templates:** Carefully adapted into our Next.js frontend without replacing our custom cybersecurity dark-mode layout or business logic.

### B. FastAPI (`fastapi/fastapi`)
- **Modular Routing:** Clean `APIRouter` structure organizing endpoints into System, Model Governance, Inference, and Demonstration tags.
- **Strict Pydantic v2 Schemas:** Request payloads and responses are strictly validated with explicit constraints (`min_length`, `max_length`), descriptions, and examples.
- **Lifespan Context Management:** Safe model lifecycle initialization via `@asynccontextmanager lifespan(app: FastAPI)` loading the fitted ML pipeline once into application memory on startup.
- **Custom Error Handling:** Registered `RequestValidationError` handler returning structured 422 JSON detailing faulty fields, messages, and validation rules.
- **Comprehensive Probes:** Includes both `/health` (liveness) and `/ready` (readiness for zero-downtime routing).

### C. scikit-learn (`scikit-learn/scikit-learn`)
- **Unified Pipeline Architecture:** Encapsulates text transformation and classification in an atomic `sklearn.pipeline.Pipeline([('vectorizer', TfidfVectorizer(...)), ('classifier', LogisticRegression(...))])`.
- **Strict Leakage Prevention:** Stratified 80/20 train/test splitting (`random_state=42, stratify=y`). The vectorizer is fitted strictly on `X_train`, and `X_test` is kept completely untouched until held-out evaluation.
- **Robust Preprocessing:** Missing/NaN values are safely handled to prevent empty-header n-gram artifacts (e.g., eliminating spurious header combinations).
- **Transparent Explainability:** Decomposes the linear decision function $z = \beta_0 + \sum (x_i \cdot \beta_i)$ into exact token-level contributions ($x_i \cdot \beta_i$) pushing toward fraud (+) or legitimacy (-).
- **Severe Imbalance Resolution:** Uses `class_weight='balanced'` in Logistic Regression to handle the 1:19 fraud ratio without generating artificial synthetic data.

---

## 2. Architecture & Technology Stack

```
                                  JOBSHIELD AI ARCHITECTURE
                                  
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           FRONTEND (PORT 3000)                         │
  │   Next.js 16 (App Router) • React 19 • TypeScript • Tailwind CSS 4    │
  │   shadcn/ui Primitives • Lucide Icons • Client Storage • Cyber Theme   │
  │                                                                        │
  │   [ Overview ]   [ Detection Dashboard ]   [ Model Metrics ]   [ History ]
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │  REST API / JSON
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           BACKEND (PORT 8000)                          │
  │   FastAPI • Uvicorn • Pydantic V2 • CORS • Lifespan Pipeline Cache    │
  │   Endpoints: /health, /ready, /model-info, /predict, /batch-predict   │
  ├────────────────────────────────────────────────────────────────────────┤
  │                            ML CORE (PYTHON)                            │
  │                                                                        │
  │   1. Preprocessor: HTML stripping, entity unescape, NaN sanitization   │
  │   2. Pipeline:     TF-IDF (1-2 N-grams, 12k feats) + Logistic Reg      │
  │   3. Explain:      Exact linear log-odds attribution (tfidf * coef)    │
  │   4. Heuristics:   Telegram/WhatsApp, check cashing, free webmail      │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │  Joblib / JSON
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                          STORAGE & ARTIFACTS                           │
  │   • backend/models/jobshield_model.joblib (Fitted pipeline, 238 KB)    │
  │   • backend/models/model_metadata.json (Verified held-out metrics)     │
  │   • backend/data/fake_job_postings.csv (EMSCAD dataset, 17,880 rows)   │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Verified Machine Learning Results

The model was trained and evaluated on the full 17,880 records of the EMSCAD benchmark using stratified 80/20 train/test splitting (14,304 train samples, 3,576 held-out test samples).

### Held-Out Evaluation Metrics (Test Set, N = 3,576)

| Metric | Score | Explanation |
| :--- | :--- | :--- |
| **Overall Accuracy** | **98.52%** | Correct classifications across all test samples |
| **ROC-AUC Score** | **0.9916** | Near-perfect discriminative capability between legitimate and fraudulent postings |
| **PR-AUC (Average Precision)** | **0.9427** | High precision-recall area under the curve under severe 1:19 class imbalance |
| **Fraud Class Recall** | **91.33%** | **Intercepted 158 out of 173 test scams** on the held-out test set |
| **Fraud Class Precision** | **80.61%** | Minimizes false positives on legitimate listings |
| **Fraud Class F1-Score** | **0.8564** | Harmonic mean of precision and recall on the minority scam class |
| **Macro Average F1** | **0.9243** | Balanced performance across both legitimate and scam classes |

### Confusion Matrix (Held-out Test Set)

```
                       PREDICTED
                  Legitimate   Fraudulent
  ACTUAL  Legit      3,365          38     (False Positive Rate = 1.11%)
          Scam          15         158     (Scam Catch Rate     = 91.33%)
```

- **True Negatives (3,365):** Legitimate jobs correctly classified as legitimate.
- **False Positives (38):** Legitimate listings flagged for secondary review (only 1.11%).
- **False Negatives (15):** Subtle scam listings missed by text-only signals.
- **True Positives (158):** Confirmed fraudulent postings successfully intercepted.

---

## 4. Explainability & Threat Intelligence

### Mathematical Feature Attribution
Unlike deep black-box networks, our linear TF-IDF classifier enables exact mathematical feature attribution:

$$z = \beta_0 + \sum_{i \in \text{active}} \text{tfidf}_i \cdot \beta_i$$

For each token present in the user's input:
- $\text{contribution}_i = \text{tfidf}_i \cdot \beta_i$
- Positive contributions push the log-odds **toward fraudulent**.
- Negative contributions push the log-odds **toward legitimate**.

### Top 10 Genuine Scam Indicators
- `link` ($\beta = +4.335$)
- `data entry` ($\beta = +4.140$)
- `description apply` ($\beta = +4.079$)
- `earn` ($\beta = +3.832$)
- `hospital` ($\beta = +3.601$)
- `contact_phone` ($\beta = +3.469$)
- `money` ($\beta = +3.448$)
- `aptitude staffing` ($\beta = +3.425$)
- `administrative` ($\beta = +3.252$)
- `contact_email` ($\beta = +3.011$)

### Top 10 Legitimate Enterprise Indicators
- `profile` ($\beta = -4.618$)
- `company profile` ($\beta = -4.591$)
- `companies` ($\beta = -3.122$)
- `team` ($\beta = -2.880$)
- `software` ($\beta = -2.860$)
- `recruitment` ($\beta = -2.839$)
- `growing` ($\beta = -2.704$)
- `english` ($\beta = -2.632$)
- `client` ($\beta = -2.491$)
- `clients` ($\beta = -2.488$)

### Independent Heuristic Security Rules
1. `UNOFFICIAL_COMMUNICATION_APP`: Flags Telegram, WhatsApp, or instant messaging interview requests.
2. `PERSONAL_EMAIL_DOMAIN`: Catches `@gmail.com` or `@yahoo.com` used for corporate recruiting.
3. `PAYMENT_OR_CHECK_PROCESSING`: Intercepts cashier's checks, equipment reimbursement, and wire transfers.
4. `URGENT_OR_PRESSURE_TACTICS`: Flags urgent hiring, guaranteed placement, or skipping interviews.
5. `UNREALISTIC_COMPENSATION`: Flags daily/weekly payout promises for low-skill tasks.
6. `DATA_ENTRY_ENVELOPE_STUFFING`: Identifies high-risk job categories commonly spoofed by scammers.

---

## 5. Project Structure

```
AIP/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app with CORS & lifespan model loading
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── endpoints.py          # /health, /ready, /model-info, /predict, /batch-predict, /presets
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py             # App settings & environment resolution
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── preprocessor.py       # Robust text normalization & NaN sanitation
│   │   │   ├── train.py              # scikit-learn Pipeline training & evaluation
│   │   │   ├── predictor.py          # Inference engine & batch inference
│   │   │   └── explain.py            # Exact TF-IDF linear attribution & heuristics
│   │   └── schemas/
│   │       ├── __init__.py
│   │       └── job.py                # Pydantic v2 validation schemas
│   ├── data/
│   │   ├── download_dataset.py       # Automated EMSCAD dataset fetcher
│   │   ├── sample_presets.json       # Real-world legitimate & scam job presets
│   │   └── fake_job_postings.csv     # EMSCAD dataset (17,880 records)
│   ├── models/
│   │   ├── jobshield_model.joblib    # Serialized scikit-learn Pipeline artifact (238 KB)
│   │   └── model_metadata.json       # Verified training log and held-out metrics
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py               # Test environment configuration
│   │   ├── test_preprocessor.py      # Unit tests for text normalization & NaN handling
│   │   └── test_api.py               # Integration tests for FastAPI endpoints
│   ├── requirements.txt              # Backend dependencies
│   ├── .env.example                  # Environment configuration example
│   └── run.py                        # Backend server launcher
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Global cybersecurity dark layout
│   │   │   ├── globals.css           # Tailwind CSS design system tokens
│   │   │   ├── page.tsx              # Home landing page with hero & threat matrix
│   │   │   ├── analyze/page.tsx      # Detection Dashboard
│   │   │   ├── model/page.tsx        # Model evaluation & viva defense guide
│   │   │   └── history/page.tsx      # Local audit history
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable shadcn/ui primitives
│   │   │   │   ├── button.tsx        # Button with CVA variants & sizes
│   │   │   │   ├── card.tsx          # Card, CardHeader, CardTitle, CardContent
│   │   │   │   ├── badge.tsx         # Badge with CVA variants
│   │   │   │   ├── input.tsx         # Accessible Input with focus ring
│   │   │   │   ├── textarea.tsx      # Accessible Textarea
│   │   │   │   ├── label.tsx         # Accessible Label
│   │   │   │   ├── alert.tsx         # Alert, AlertTitle, AlertDescription
│   │   │   │   ├── progress.tsx      # Progress risk probability bar
│   │   │   │   ├── tabs.tsx          # Accessible tabbed navigation
│   │   │   │   └── separator.tsx     # Clean divider
│   │   │   ├── Navbar.tsx            # Header with live model status badge
│   │   │   ├── Footer.tsx            # Footer with citations and ethics disclaimer
│   │   │   ├── HeroSection.tsx       # Hero with verified metrics ribbon
│   │   │   ├── HowItWorks.tsx        # 4-stage scientific pipeline breakdown
│   │   │   ├── ThreatMatrix.tsx      # Overview of real-world scam modalities
│   │   │   ├── ResponsibleUseCard.tsx# Limitations and ethical AI disclaimer
│   │   │   ├── PresetLoader.tsx      # 1-click verified test preset buttons
│   │   │   ├── AnalysisForm.tsx      # 12-field validated input form
│   │   │   ├── AnalysisResultCard.tsx# Verdict card with risk meter
│   │   │   ├── ExplainabilityView.tsx# Token contribution bars vs heuristics
│   │   │   ├── VerificationChecklist.tsx # Interactive applicant safety checklist
│   │   │   └── HistoryList.tsx       # Saved audits manager (localStorage)
│   │   └── lib/
│   │       ├── utils.ts              # Canonical shadcn cn() utility
│   │       ├── api.ts                # Typed FastAPI HTTP client
│   │       ├── storage.ts            # LocalStorage manager with JSON export
│   │       └── types.ts              # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
├── README.md
└── .gitignore
```

---

## 6. Quickstart Guide (macOS / Linux)

### Step 1: Start the Backend (FastAPI)
```bash
# From workspace root
cd backend
source venv/bin/activate
pip install -r requirements.txt

# (Optional) Retrain model on EMSCAD dataset
python app/ml/train.py

# Launch FastAPI server on http://localhost:8000
python run.py
```

### Step 2: Start the Frontend (Next.js)
```bash
# In a new terminal window
cd frontend
npm install
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 7. API Documentation

Interactive Swagger documentation is available at **`http://localhost:8000/docs`** and ReDoc at **`http://localhost:8000/redoc`**.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check / liveness probe |
| `GET` | `/ready` | Readiness probe (verifies model pipeline is loaded in memory) |
| `GET` | `/model-info` | Complete model metadata, held-out evaluation metrics, and top terms |
| `POST` | `/predict` | Analyze single job posting; returns probabilities, token weights, heuristics, checklist |
| `POST` | `/batch-predict` | Bulk analysis for up to 25 postings; returns aggregate statistics |
| `GET` | `/presets` | Returns vetted legitimate and fraudulent sample postings |

---

## 8. Running Unit & Integration Tests

```bash
# Run backend tests with pytest
./backend/venv/bin/pytest backend/tests -v
```

All 14 unit and integration tests validate:
- Preprocessor text normalization, HTML stripping, entity unescaping, and NaN sanitation.
- Prevention of empty section header contamination.
- FastAPI `/health`, `/ready`, `/model-info`, `/predict`, `/batch-predict`, and `/presets` responses.
- Validation error handling on malformed payloads.

---

## 9. College Viva Defense Q&A Guide

**Q1: Why choose a scikit-learn Pipeline with TF-IDF + Logistic Regression over deep black-box models (e.g. BERT)?**
> *Answer:* In a college viva defense, transparency, interpretability, and reproducible latency are paramount. Linear models over TF-IDF allow exact log-odds feature attribution for every single token ($z = \text{intercept} + \sum \text{tfidf}_i \cdot \beta_i$). Furthermore, TF-IDF + Logistic Regression achieves 98.52% accuracy and 0.9916 ROC-AUC on EMSCAD while evaluating in milliseconds on standard CPUs without requiring GPU infrastructure.

**Q2: How did you handle the severe 1:19 class imbalance in the EMSCAD dataset?**
> *Answer:* The EMSCAD dataset contains only 866 scams (4.84%) out of 17,880 postings. We utilized scikit-learn's `class_weight='balanced'` parameter, which automatically weights instances inversely proportional to class frequencies ($w_j = n / (2 \cdot n_j)$). This prevents the model from trivially predicting all instances as legitimate and yielded a 91.33% recall on fraudulent samples (catching 158 out of 173 test scams).

**Q3: How was data leakage prevented between training and evaluation?**
> *Answer:* We applied a stratified train/test split (80% train = 14,304 samples, 20% test = 3,576 samples). We used a scikit-learn Pipeline(`[("vectorizer", TfidfVectorizer(...)), ("classifier", LogisticRegression(...))]`) fitted strictly on $X_{train}$ only. The held-out test data was never seen during vocabulary construction or coefficient optimization.

**Q4: What are the main limitations of a text-only classification model?**
> *Answer:* Text-only models can be bypassed by adversarial manipulation or when scammers copy legitimate job postings verbatim before switching candidates to private messaging. To mitigate this, JOBSHIELD AI pairs the ML pipeline with deterministic heuristic security rules (e.g. checking for Telegram/WhatsApp links and check reimbursement schemes).

---

## 10. Responsible Use & Limitations

- **Probabilistic Screening Tool:** JOBSHIELD AI calculates statistical likelihoods and does not constitute definitive proof of fraud.
- **Decision Support:** Designed to assist applicants and compliance teams, not to replace human discretion.
- **Candidate Safety:** Candidates must always verify requisitions directly on official corporate portals, inspect email headers, and never pay upfront fees or wire money.
