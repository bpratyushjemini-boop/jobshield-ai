'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSearch,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { JobPostingFormData, JobAnalysisResponse, JobPreset } from '@/lib/types';
import { analyzeJob } from '@/lib/api';
import { saveAnalysis } from '@/lib/storage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

const samplePresets: JobPreset[] = [
  {
    id: 'preset-scam-1',
    name: 'Fake Check & Equipment Scam',
    category: 'Payment processing',
    expected_type: 'fraudulent',
    data: {
      title: 'Data Entry Clerk - Urgent Hire',
      company_name: 'Apex Global Logistics LLC',
      location: 'Remote, US',
      salary_range: '$4,500 / week ($45/hr)',
      description:
        'URGENT HIRE: Seeking remote Data Entry Clerk for immediate onboarding. Work from home 2 hours daily. A cashier check will be mailed directly to your residence to purchase mandatory home office equipment (MacBook Pro and printer) from our designated vendor. Deposit check and wire remainder via Western Union within 24 hours. Contact hiring manager on Telegram @QuickHire_Apex.',
    },
  },
  {
    id: 'preset-legit-1',
    name: 'Verified Enterprise Engineer',
    category: 'Engineering',
    expected_type: 'legitimate',
    data: {
      title: 'Senior Frontend Engineer',
      company_name: 'Stripe Payments Global',
      location: 'San Francisco, CA / Remote',
      salary_range: '$160,000 - $190,000 / yr',
      description:
        'Stripe is seeking an experienced Senior Frontend Engineer to build resilient developer portal interfaces in React and TypeScript. You will collaborate with product design, write automated unit tests, profile browser performance, and maintain enterprise design system standards. Requirements: 5+ years experience with modern JavaScript, CSS architecture, and web accessibility standards.',
    },
  },
];

export default function HeroSection() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = samplePresets;

  const handleSelectPreset = (preset: JobPreset) => {
    setTitle(preset.data.title || '');
    setDescription(preset.data.description || '');
    setResult(null);
    setError(null);
  };

  const handleQuickAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide at least a job title and posting description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: JobPostingFormData = {
        title,
        description,
      };
      const res = await analyzeJob(payload);
      setResult(res);
      saveAnalysis(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete analysis.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setResult(null);
    setError(null);
  };

  const fraudPercent = result ? (result.prediction.fraud_probability * 100).toFixed(1) : null;
  const legitPercent = result ? (result.prediction.legitimate_probability * 100).toFixed(1) : null;
  const isCritical = result?.prediction.risk_tier === 'CRITICAL' || result?.prediction.risk_tier === 'HIGH';
  const isModerate = result?.prediction.risk_tier === 'MODERATE';

  return (
    <section className="pt-8 sm:pt-12 pb-12 sm:pb-16 border-b border-[var(--card-border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Editorial Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--foreground)] leading-[1.1]">
            Detect recruitment fraud with statistical precision.
          </h1>

          <p className="text-sm sm:text-base text-[var(--muted-text)] leading-relaxed max-w-2xl mx-auto">
            Screen job postings against historical scam signatures and operational red flags. Transparent linear feature attribution trained on the EMSCAD benchmark.
          </p>
        </div>

        {/* Primary Focus: Interactive Job Analysis Console */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-[var(--card-bg)] border-[var(--card-border)] shadow-sm overflow-hidden">
            {/* Console Dock Header */}
            <div className="p-4 sm:p-5 border-b border-[var(--card-border)] bg-[var(--subtle-bg)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--foreground)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                  Live Screening Console
                </span>
              </div>

              {/* Sample Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-[var(--muted-text)] mr-1">Load sample:</span>
                {presets.map((preset) => {
                  const isPresetScam = preset.expected_type === 'fraudulent';
                  const isCurrent = title === preset.data.title;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-[11px] font-medium px-2 py-1 rounded border transition-colors cursor-pointer min-h-[32px] ${
                        isCurrent
                          ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-xs font-semibold'
                          : 'bg-[var(--card-bg)] text-[var(--muted-text)] border-[var(--card-border)] hover:text-[var(--foreground)] hover:border-[var(--card-hover-border)]'
                      }`}
                    >
                      {isPresetScam ? 'Scam: ' : 'Legit: '}
                      {preset.name.split('(')[0].trim()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Console Form */}
            <form onSubmit={handleQuickAnalyze} className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="hero-job-title"
                  className="block text-xs font-semibold text-[var(--foreground)]"
                >
                  Job Title <span className="text-[var(--danger-text)]">*</span>
                </label>
                <Input
                  id="hero-job-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Remote Data Entry Operator, Senior Software Engineer"
                  className="text-xs sm:text-sm h-9 sm:h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="hero-job-description"
                  className="block text-xs font-semibold text-[var(--foreground)]"
                >
                  Job Description &amp; Requirements <span className="text-[var(--danger-text)]">*</span>
                </label>
                <Textarea
                  id="hero-job-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste the job advertisement text, recruiter instructions, or payment details..."
                  rows={4}
                  className="text-xs sm:text-sm leading-relaxed"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-[var(--danger-bg)] border border-[var(--danger-border)] text-xs text-[var(--danger-text)]">
                  {error}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="submit"
                    disabled={loading}
                    size="default"
                    className="w-full sm:w-auto font-semibold px-5 min-h-[40px]"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing features...</span>
                      </>
                    ) : (
                      <>
                        <FileSearch className="w-4 h-4" />
                        <span>Analyze job posting</span>
                      </>
                    )}
                  </Button>

                  {(title || description || result) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={handleReset}
                      disabled={loading}
                      className="text-xs min-h-[40px]"
                      title="Clear form inputs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[var(--muted-text)]" />
                      <span>Reset</span>
                    </Button>
                  )}
                </div>

                <Link
                  href="/analyze"
                  className="text-xs text-[var(--muted-text)] hover:text-[var(--foreground)] inline-flex items-center gap-1 font-medium min-h-[40px] items-center"
                >
                  <span>Open comprehensive workbench</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </form>

            {/* Instant Result View (Inline within Hero Console) */}
            {result && (
              <div className="p-5 sm:p-6 border-t border-[var(--card-border)] bg-[var(--subtle-bg)]/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        isCritical
                          ? 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]'
                          : isModerate
                          ? 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]'
                          : 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]'
                      }`}
                    >
                      {isCritical ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : isModerate ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.2 rounded border ${
                            isCritical
                              ? 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]'
                              : isModerate
                              ? 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]'
                              : 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]'
                          }`}
                        >
                          {result.prediction.risk_tier} RISK
                        </span>
                        <h4 className="text-sm font-semibold text-[var(--foreground)]">
                          {isCritical
                            ? 'Flagged: High Scam Risk'
                            : isModerate
                            ? 'Caution: Inconclusive Markers'
                            : 'Consistent with Legitimate Postings'}
                        </h4>
                      </div>
                      <p className="text-xs text-[var(--muted-text)] mt-0.5">
                        {isCritical
                          ? 'Linguistic markers in this text match characteristic recruitment scam distributions.'
                          : isModerate
                          ? 'Mixed linguistic indicators detected. Additional employer verification advised.'
                          : 'Structural and vocabulary markers match verified legitimate employment postings.'}
                      </p>
                    </div>
                  </div>

                  <Link href="/analyze">
                    <Button variant="outline" size="sm" className="text-xs shrink-0 min-h-[36px]">
                      <span>Full diagnostics</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1 text-[var(--muted-text)]" />
                    </Button>
                  </Link>
                </div>

                {/* Probability Gauge Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--danger-text)] font-medium">Scam Probability</span>
                      <span className="font-mono font-semibold tabular-nums text-[var(--foreground)]">{fraudPercent}%</span>
                    </div>
                    <Progress value={Number(fraudPercent)} indicatorClassName="bg-[var(--danger-text)]" />
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--foreground)] font-medium">Legitimate Probability</span>
                      <span className="font-mono font-semibold tabular-nums text-[var(--foreground)]">{legitPercent}%</span>
                    </div>
                    <Progress value={Number(legitPercent)} indicatorClassName="bg-[#3C507D] dark:bg-[#E0C58F]" />
                  </div>
                </div>

                <p className="text-[11px] text-[var(--muted-text)] italic">
                  * Statistical estimate based on EMSCAD benchmark training distribution; automated classification aid, not legal proof.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Restrained Model Metrics Ribbon: Tabular, Calm, Precise */}
        <div className="max-w-4xl mx-auto rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-[var(--card-border)] grid grid-cols-2 sm:grid-cols-4">
          <div className="p-4 sm:p-5 text-center sm:text-left space-y-1">
            <div className="text-[11px] font-medium text-[var(--muted-text)]">
              Overall Accuracy
            </div>
            <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-[var(--foreground)] tracking-tight">
              98.52%
            </div>
            <div className="text-[11px] text-[var(--muted-text)]">
              3,523 / 3,576 test records
            </div>
          </div>

          <div className="p-4 sm:p-5 text-center sm:text-left space-y-1">
            <div className="text-[11px] font-medium text-[var(--muted-text)]">
              ROC-AUC Score
            </div>
            <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-[var(--foreground)] tracking-tight">
              0.9916
            </div>
            <div className="text-[11px] text-[var(--muted-text)]">
              Stratified discrimination
            </div>
          </div>

          <div className="p-4 sm:p-5 text-center sm:text-left space-y-1">
            <div className="text-[11px] font-medium text-[var(--muted-text)]">
              Scam Recall
            </div>
            <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-[var(--foreground)] tracking-tight">
              91.33%
            </div>
            <div className="text-[11px] text-[var(--muted-text)]">
              158 of 173 scams caught
            </div>
          </div>

          <div className="p-4 sm:p-5 text-center sm:text-left space-y-1">
            <div className="text-[11px] font-medium text-[var(--muted-text)]">
              Corpus Size
            </div>
            <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-[var(--foreground)] tracking-tight">
              17,880
            </div>
            <div className="text-[11px] text-[var(--muted-text)]">
              EMSCAD research dataset
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
