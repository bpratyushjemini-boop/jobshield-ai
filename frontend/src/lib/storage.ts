/**
 * JOBSHIELD AI - Local History Storage
 * Stores anonymized past analyses in the user's browser localStorage.
 * No candidate PII is ever collected or persisted.
 */

import { JobAnalysisResponse, SavedAnalysis } from './types';

const STORAGE_KEY = 'jobshield_analysis_history';
const MAX_HISTORY_ITEMS = 25;

export function getSavedAnalyses(): SavedAnalysis[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse history from localStorage', e);
    return [];
  }
}

export function saveAnalysis(result: JobAnalysisResponse): SavedAnalysis {
  const current = getSavedAnalyses();
  const newEntry: SavedAnalysis = {
    id: result.id,
    timestamp: result.analyzed_at,
    title: result.input_summary.title,
    company_name: result.input_summary.company_name,
    risk_tier: result.prediction.risk_tier,
    fraud_probability: result.prediction.fraud_probability,
    is_fraudulent: result.prediction.is_fraudulent,
    result,
  };

  // Prepend new entry, remove duplicates by id, and cap at max items
  const filtered = current.filter((item) => item.id !== result.id);
  const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save analysis to localStorage', e);
    }
  }

  return newEntry;
}

export function clearAnalysisHistory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function exportHistoryAsJSON(): void {
  if (typeof window === 'undefined') return;
  const history = getSavedAnalyses();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jobshield_history_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
