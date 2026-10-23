/**
 * JOBSHIELD AI - TypeScript Type Definitions
 */

export interface JobPostingFormData {
  title: string;
  company_name: string;
  company_website: string;
  location: string;
  employment_type: string;
  required_experience: string;
  required_education: string;
  salary_range: string;
  industry: string;
  function: string;
  required_skills: string;
  company_profile: string;
  description: string;
  benefits: string;
}

export interface TokenContribution {
  term: string;
  tfidf_weight: number;
  coefficient: number;
  contribution: number;
  direction: 'fraudulent' | 'legitimate';
}

export interface ModelEvidence {
  positive_fraud_contributors: TokenContribution[];
  negative_legit_contributors: TokenContribution[];
  intercept_bias: number;
  active_tokens_count: number;
  net_log_odds: number;
}

export interface HeuristicWarning {
  rule_id: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  detail: string;
  matched_terms: string[];
  source: string;
}

export interface VerificationStep {
  priority: 'MANDATORY' | 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  action: string;
}

export interface PredictionDetail {
  predicted_class: 'Potentially Fraudulent' | 'Likely Legitimate';
  is_fraudulent: boolean;
  confidence_score: number;
  fraud_probability: number;
  legitimate_probability: number;
  risk_tier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  risk_label: string;
  risk_badge_color: string;
}

export interface JobAnalysisResponse {
  id: string;
  analyzed_at: string;
  input_summary: {
    title: string;
    company_name: string;
    location: string;
    salary_range: string;
    employment_type: string;
  };
  prediction: PredictionDetail;
  model_evidence: ModelEvidence;
  heuristic_warnings: HeuristicWarning[];
  verification_steps: VerificationStep[];
  disclaimer: string;
}

export interface JobPreset {
  id: string;
  name: string;
  category: string;
  expected_type: 'legitimate' | 'fraudulent';
  data: Partial<JobPostingFormData>;
}

export interface ModelInfo {
  model_name: string;
  version: string;
  architecture: string;
  trained_at: string;
  training_duration_seconds: number;
  dataset: {
    name: string;
    file: string;
    total_records: number;
    legitimate_count: number;
    fraudulent_count: number;
    imbalance_ratio: string;
    train_samples: number;
    test_samples: number;
    test_split_ratio: number;
    random_seed: number;
    stratified: boolean;
  };
  metrics: {
    accuracy: number;
    roc_auc: number;
    pr_auc: number;
    fraud_precision: number;
    fraud_recall: number;
    fraud_f1: number;
    macro_f1: number;
    confusion_matrix: {
      true_negatives: number;
      false_positives: number;
      false_negatives: number;
      true_positives: number;
    };
    classification_report: Record<string, any>;
  };
  hyperparameters: {
    vectorizer: Record<string, any>;
    classifier: Record<string, any>;
  };
  top_fraud_terms: Array<{ term: string; weight: number }>;
  top_legit_terms: Array<{ term: string; weight: number }>;
}

export interface SavedAnalysis {
  id: string;
  timestamp: string;
  title: string;
  company_name: string;
  risk_tier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  fraud_probability: number;
  is_fraudulent: boolean;
  result: JobAnalysisResponse;
}
