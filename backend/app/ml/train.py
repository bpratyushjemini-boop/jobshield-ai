"""
JOBSHIELD AI - Machine Learning Training Pipeline
Trains a transparent, reproducible, and explainable TF-IDF + Logistic Regression
classifier on the Employment Scam Aegean Dataset (EMSCAD).
"""

import os
import sys
import json
import time
from datetime import datetime, timezone
from typing import Dict, Any

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

# Adjust path to import local modules
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.ml.preprocessor import row_to_text


DATA_PATH = os.path.join(backend_dir, "data", "fake_job_postings.csv")
MODELS_DIR = os.path.join(backend_dir, "models")
MODEL_ARTIFACT_PATH = os.path.join(MODELS_DIR, "jobshield_model.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")


def load_and_validate_dataset(csv_path: str) -> pd.DataFrame:
    """Loads and validates the EMSCAD dataset."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Dataset not found at {csv_path}. Run `python backend/data/download_dataset.py` first."
        )

    print(f"[*] Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)

    # Validate essential columns
    required_cols = ["fraudulent", "title"]
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Required column '{col}' is missing from the dataset.")

    # Validate target distribution
    target_vals = set(df["fraudulent"].dropna().unique())
    if not target_vals.issubset({0, 1}):
        raise ValueError(f"Target column 'fraudulent' contains invalid values: {target_vals}")

    print(f"[+] Loaded {len(df):,} job records successfully.")
    fraud_count = int(df["fraudulent"].sum())
    legit_count = len(df) - fraud_count
    print(f"    - Legitimate jobs (0): {legit_count:,} ({legit_count / len(df) * 100:.2f}%)")
    print(f"    - Fraudulent jobs (1): {fraud_count:,} ({fraud_count / len(df) * 100:.2f}%)")
    print(f"    - Severe class imbalance ratio: ~1:{legit_count // fraud_count}")

    return df


def train_pipeline() -> Dict[str, Any]:
    """Executes the full training, evaluation, and serialization workflow following scikit-learn best practices."""
    start_time = time.time()
    os.makedirs(MODELS_DIR, exist_ok=True)

    # 1. Load data
    df = load_and_validate_dataset(DATA_PATH)

    # 2. Extract combined text features safely
    print("[*] Preprocessing and combining text fields...")
    combined_texts = [row_to_text(row) for _, row in df.iterrows()]
    y = df["fraudulent"].astype(int).values

    # 3. Stratified Train/Test Split (80% train, 20% test) to prevent data leakage
    print("[*] Splitting dataset into stratified train and test sets (80/20)...")
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        combined_texts,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )
    print(f"    - Training set size: {len(X_train_raw):,} samples (Fraud: {int(y_train.sum())})")
    print(f"    - Test set size:     {len(X_test_raw):,} samples (Fraud: {int(y_test.sum())})")

    # 4. Construct scikit-learn Pipeline
    # Encapsulating TF-IDF and Logistic Regression inside a Pipeline object
    # guarantees reproducible inference and strictly prevents train/test leakage.
    print("[*] Constructing scikit-learn Pipeline (TfidfVectorizer + LogisticRegression)...")
    pipeline = Pipeline(
        [
            (
                "vectorizer",
                TfidfVectorizer(
                    max_features=12000,
                    ngram_range=(1, 2),
                    min_df=3,
                    max_df=0.90,
                    stop_words="english",
                    sublinear_tf=True,
                ),
            ),
            (
                "classifier",
                LogisticRegression(
                    class_weight="balanced",
                    C=1.5,
                    max_iter=1000,
                    random_state=42,
                    solver="liblinear",
                ),
            ),
        ]
    )

    # 5. Fit Pipeline strictly on training split
    print("[*] Fitting pipeline on training split...")
    pipeline.fit(X_train_raw, y_train)

    vectorizer: TfidfVectorizer = pipeline.named_steps["vectorizer"]
    classifier: LogisticRegression = pipeline.named_steps["classifier"]
    print(f"[+] Vocabulary size: {len(vectorizer.vocabulary_):,} tokens.")

    # 6. Held-out Evaluation on untouched test set
    print("[*] Evaluating pipeline on held-out test set...")
    y_pred = pipeline.predict(X_test_raw)
    y_prob = pipeline.predict_proba(X_test_raw)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec_fraud = float(precision_score(y_test, y_pred, pos_label=1))
    rec_fraud = float(recall_score(y_test, y_pred, pos_label=1))
    f1_fraud = float(f1_score(y_test, y_pred, pos_label=1))
    macro_f1 = float(f1_score(y_test, y_pred, average="macro"))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    pr_auc = float(average_precision_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()  # [[TN, FP], [FN, TP]]

    tn, fp, fn, tp = cm[0][0], cm[0][1], cm[1][0], cm[1][1]

    print("\n" + "=" * 60)
    print("           JOBSHIELD AI - MODEL EVALUATION METRICS           ")
    print("=" * 60)
    print(f"Overall Accuracy:          {acc * 100:.2f}%")
    print(f"ROC-AUC Score:             {roc_auc:.4f}")
    print(f"PR-AUC (Avg Precision):    {pr_auc:.4f}")
    print(f"Fraud Class Recall:        {rec_fraud * 100:.2f}% (Found {tp} of {tp + fn} scams)")
    print(f"Fraud Class Precision:     {prec_fraud * 100:.2f}%")
    print(f"Fraud Class F1-Score:      {f1_fraud:.4f}")
    print(f"Macro Average F1:          {macro_f1:.4f}")
    print("\nConfusion Matrix (Held-out Test Set):")
    print(f"  True Negatives (Legit identified):   {tn:,}")
    print(f"  False Positives (Legit flagged):     {fp:,}")
    print(f"  False Negatives (Fraud missed):      {fn:,}")
    print(f"  True Positives (Fraud caught):       {tp:,}")
    print("=" * 60)

    clf_report = classification_report(
        y_test,
        y_pred,
        target_names=["Legitimate (0)", "Fraudulent (1)"],
        output_dict=True,
    )

    # 7. Extract Top Global Features (Explainability)
    feature_names = np.array(vectorizer.get_feature_names_out())
    coefficients = classifier.coef_[0]

    top_fraud_idx = np.argsort(coefficients)[::-1][:30]
    top_legit_idx = np.argsort(coefficients)[:30]

    top_fraud_features = [
        {"term": str(feature_names[i]), "weight": round(float(coefficients[i]), 4)}
        for i in top_fraud_idx
    ]
    top_legit_features = [
        {"term": str(feature_names[i]), "weight": round(float(coefficients[i]), 4)}
        for i in top_legit_idx
    ]

    print("\nTop 10 Global Indicators Pushing Toward Fraud:")
    for item in top_fraud_features[:10]:
        print(f"  + {item['term']:<25} (coef: +{item['weight']:.3f})")

    print("\nTop 10 Global Indicators Pushing Toward Legitimate:")
    for item in top_legit_features[:10]:
        print(f"  - {item['term']:<25} (coef: {item['weight']:.3f})")

    # 8. Save Model Artifact using Joblib
    print(f"\n[*] Saving trained pipeline bundle to {MODEL_ARTIFACT_PATH}...")
    artifact = {
        "pipeline": pipeline,
        "vectorizer": vectorizer,
        "classifier": classifier,
        "model_type": "Pipeline_TFIDF_LogisticRegression",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "scikit_learn_version": sklearn.__version__,
    }
    joblib.dump(artifact, MODEL_ARTIFACT_PATH, compress=3)
    print(f"[+] Model artifact saved ({os.path.getsize(MODEL_ARTIFACT_PATH) / 1024:.1f} KB).")

    # 9. Save Metadata JSON
    training_duration = round(time.time() - start_time, 2)
    metadata = {
        "model_name": "JobShield AI Detector",
        "version": "1.0.0",
        "architecture": "scikit-learn Pipeline [TfidfVectorizer(1-2 N-grams, 12,000 features, Sublinear TF) + LogisticRegression(class_weight='balanced')]",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "training_duration_seconds": training_duration,
        "scikit_learn_version": sklearn.__version__,
        "dataset": {
            "name": "Employment Scam Aegean Dataset (EMSCAD)",
            "file": "fake_job_postings.csv",
            "total_records": len(df),
            "legitimate_count": int((y == 0).sum()),
            "fraudulent_count": int((y == 1).sum()),
            "imbalance_ratio": f"1:{int((y == 0).sum() // (y == 1).sum())}",
            "train_samples": len(X_train_raw),
            "test_samples": len(X_test_raw),
            "test_split_ratio": 0.20,
            "random_seed": 42,
            "stratified": True,
        },
        "metrics": {
            "accuracy": round(acc, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "fraud_precision": round(prec_fraud, 4),
            "fraud_recall": round(rec_fraud, 4),
            "fraud_f1": round(f1_fraud, 4),
            "macro_f1": round(macro_f1, 4),
            "confusion_matrix": {
                "true_negatives": int(tn),
                "false_positives": int(fp),
                "false_negatives": int(fn),
                "true_positives": int(tp),
            },
            "classification_report": clf_report,
        },
        "hyperparameters": {
            "vectorizer": {
                "max_features": 12000,
                "ngram_range": [1, 2],
                "min_df": 3,
                "max_df": 0.90,
                "sublinear_tf": True,
                "stop_words": "english",
            },
            "classifier": {
                "model": "LogisticRegression",
                "class_weight": "balanced",
                "C": 1.5,
                "solver": "liblinear",
                "max_iter": 1000,
                "random_state": 42,
            },
        },
        "top_fraud_terms": top_fraud_features,
        "top_legit_terms": top_legit_features,
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[+] Model metadata saved to {METADATA_PATH}.")

    return metadata



if __name__ == "__main__":
    train_pipeline()
