'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  FileSearch,
  Database,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { LiquidGlassSurface } from '@/components/ui/liquid-glass';
import { analyzeJob, getPresets } from '@/lib/api';
import { JobPostingFormData, JobAnalysisResponse, JobPreset } from '@/lib/types';
import { saveAnalysis } from '@/lib/storage';

export default function HeroSection() {
  const [presets, setPresets] = useState<JobPreset[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPresets()
      .then((data) => setPresets(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  const handleSelectPreset = (preset: JobPreset) => {
    setTitle(preset.data.title || '');
    setDescription(preset.data.description || '');
    setResult(null);
    setError(null);
  };

  const handleQuickAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both a job title and description to evaluate.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: JobPostingFormData = {
        title,
        description,
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
        benefits: '',
      };
      const res = await analyzeJob(payload);
      setResult(res);
      saveAnalysis(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete analysis.');
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

  const isFraud = result?.prediction.is_fraudulent;
  const fraudPercent = result ? (result.prediction.fraud_probability * 100).toFixed(1) : null;
  const legitPercent = result ? (result.prediction.legitimate_probability * 100).toFixed(1) : null;
  const isCritical = result?.prediction.risk_tier === 'CRITICAL' || result?.prediction.risk_tier === 'HIGH';
  const isModerate = result?.prediction.risk_tier === 'MODERATE';

  return (
    <section className="pt-10 sm:pt-14 pb-14 sm:pb-18 border-b border-[var(--card-border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Editorial Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex justify-center">
            <LiquidGlassSurface
              variant="pill"
              radius={999}
              optics={{ frost: 2, strength: 0.06, dispersion: 0.00, sheen: 0.15 }}
              className="inline-flex items-center gap-2 px-3 py-0.5 text-[11px] font-mono uppercase tracking-wider text-[var(--muted-text)] border border-[var(--card-border)] shadow-xs"
            >
              <span>Recruitment Threat Intelligence</span>
              <span className="text-[var(--card-border)]">&bull;</span>
              <span className="text-[#112250] dark:text-[#E0C58F] font-semibold">EMSCAD Benchmark</span>
            </LiquidGlassSurface>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--foreground)] leading-[1.1]">
            Detect recruitment fraud with statistical precision.
          </h1>

          <p className="text-sm sm:text-base text-[var(--muted-text)] leading-relaxed max-w-2xl mx-auto">
            Screen job postings against historical scam signatures and operational red flags. Transparent linear feature attribution powered by scikit-learn.
          </p>
        </div>

        {/* Primary Focus: Interactive Job Analysis Console */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-[var(--card-bg)] border-[var(--card-border)] shadow-sm overflow-hidden">
            {/* Console Dock Header */}
            <div className="p-4 sm:p-5 border-b border-[var(--card-border)] bg-[var(--subtle-bg)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--foreground)]" />
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
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-xs'
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
                <label htmlFor="hero-job-title" className="text-xs font-medium text-[var(--muted-text)]">
                  Target Job Title
                </label>
                <Input
                  id="hero-job-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer, Data Entry Operator, Virtual Assistant"
                  className="text-sm h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="hero-job-desc" className="text-xs font-medium text-[var(--muted-text)]">
                  Posting Content or Description
                </label>
                <Textarea
                  id="hero-job-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste job posting text, candidate requirements, compensation details, or recruitment messages..."
                  className="text-sm font-sans"
                />
              </div>

              {error && (
                <p className="text-xs text-[var(--danger-text)] bg-[var(--danger-bg)] p-2.5 rounded border border-[var(--danger-border)]">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    variant="default"
                    size="default"
                    disabled={loading}
                    className="w-full sm:w-auto font-semibold px-5"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Evaluating text features...</span>
                      </>
                    ) : (
                      <>
                        <FileSearch className="w-4 h-4" />
                        <span>Run forensic screening</span>
                      </>
                    )}
                  </Button>

                  {(title || description || result) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="text-xs text-[var(--muted-text)]"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      <span>Clear</span>
                    </Button>
                  )}
                </div>

                <Link
                  href="/analyze"
                  className="text-xs text-[var(--muted-text)] hover:text-[var(--foreground)] inline-flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Open full multi-field workbench</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </form>

            {/* Instant Result View (Inline within Hero Console) */}
            {result && (
              <div className="p-5 sm:p-6 border-t border-[var(--card-border)] bg-[var(--subtle-bg)]/30 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-md flex items-center justify-center border ${
                        isCritical
                          ? 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]'
                          : isModerate
                          ? 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]'
                          : 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]'
                      }`}
                    >
                      {isCritical ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : isModerate ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <ShieldCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.2 rounded border ${
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
                            ? 'Flagged: High Scam Correlation'
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
                    <Button variant="outline" size="sm" className="text-xs shrink-0">
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
                      <span className="text-[var(--success-text)] font-medium">Legitimate Probability</span>
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
