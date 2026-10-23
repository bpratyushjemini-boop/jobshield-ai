'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSearch,
  Sparkles,
  ArrowLeft,
  History,
  BookmarkCheck,
} from 'lucide-react';
import { JobPostingFormData, JobAnalysisResponse } from '@/lib/types';
import { analyzeJob } from '@/lib/api';
import { saveAnalysis } from '@/lib/storage';
import PresetLoader from '@/components/PresetLoader';
import AnalysisForm from '@/components/AnalysisForm';
import AnalysisResultCard from '@/components/AnalysisResultCard';
import ExplainabilityView from '@/components/ExplainabilityView';
import VerificationChecklist from '@/components/VerificationChecklist';
import ResponsibleUseCard from '@/components/ResponsibleUseCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LiquidGlassSurface } from '@/components/ui/liquid-glass';

const initialFormData: JobPostingFormData = {
  title: '',
  company_name: '',
  company_website: '',
  location: '',
  employment_type: '',
  required_experience: '',
  required_education: '',
  salary_range: '',
  industry: '',
  function: '',
  required_skills: '',
  company_profile: '',
  description: '',
  benefits: '',
};

export default function AnalyzePage() {
  const [formData, setFormData] = useState<JobPostingFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobAnalysisResponse | null>(null);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleFieldChange = (field: keyof JobPostingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectPreset = (presetData: Partial<JobPostingFormData>) => {
    setFormData({
      ...initialFormData,
      ...presetData,
    });
    setError(null);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await analyzeJob(formData);
      setResult(response);
      saveAnalysis(response);
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 4000);

      // Scroll smoothly to results
      setTimeout(() => {
        const el = document.getElementById('analysis-results-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while analyzing the job posting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--card-border)]">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors p-1 -ml-1 rounded-md"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)] tracking-tight flex items-center gap-2.5">
              <span>Job Posting Detector</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--subtle-bg)] text-[var(--muted-text)] border border-[var(--card-border)]">
                TF-IDF Pipeline
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
            Input a job posting or select a sample preset to evaluate linguistic signals and structural risk markers.
          </p>
        </div>

        <Link href="/history">
          <Button variant="outline" size="sm" className="text-xs">
            <History className="w-4 h-4 text-[var(--muted-text)]" />
            <span>Audit history</span>
          </Button>
        </Link>
      </div>

      {/* Preset Selector */}
      <PresetLoader onSelectPreset={handleSelectPreset} currentTitle={formData.title} />

      {/* Main Analysis Form Card */}
      <Card className="p-6 sm:p-8 space-y-6 bg-[var(--card-bg)] border-[var(--card-border)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-[var(--foreground)]" />
              <span>Job Posting Details</span>
            </h2>
            <p className="text-xs text-[var(--muted-text)] mt-0.5">
              Title and description are required. Additional context improves feature resolution.
            </p>
          </div>
        </div>

        <AnalysisForm
          formData={formData}
          onChange={handleFieldChange}
          onReset={handleReset}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </Card>

      {/* Results Section */}
      {result && (
        <div id="analysis-results-section" className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--foreground)]" />
              <h2 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">
                Model Assessment &amp; Risk Evidence
              </h2>
            </div>

            {savedNotification && (
              <LiquidGlassSurface
                variant="pill"
                radius={999}
                optics={{ frost: 2, strength: 0.06, dispersion: 0.00, sheen: 0.2 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--card-elevated)] text-[var(--foreground)] border border-[var(--card-border)] text-xs font-semibold shadow-xs"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Saved to local audit history</span>
              </LiquidGlassSurface>
            )}
          </div>

          {/* 1. Verdict & Probability Card */}
          <AnalysisResultCard result={result} />

          {/* 2. Explainability & Token Contributions */}
          <Card className="p-6 bg-[var(--card-bg)] border-[var(--card-border)]">
            <ExplainabilityView
              modelEvidence={result.model_evidence}
              heuristicWarnings={result.heuristic_warnings}
            />
          </Card>

          {/* 3. Actionable Verification Protocol */}
          <VerificationChecklist steps={result.verification_steps} />

          {/* 4. Responsible Use Reminder */}
          <ResponsibleUseCard />
        </div>
      )}
    </div>
  );
}
