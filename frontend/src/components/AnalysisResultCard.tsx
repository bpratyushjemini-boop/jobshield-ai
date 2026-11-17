'use client';

import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Scale,
} from 'lucide-react';
import { JobAnalysisResponse } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AnalysisResultCardProps {
  result: JobAnalysisResponse;
}

export default function AnalysisResultCard({ result }: AnalysisResultCardProps) {
  const { prediction, input_summary } = result;
  const fraudPercent = parseFloat((prediction.fraud_probability * 100).toFixed(1));
  const legitPercent = parseFloat((prediction.legitimate_probability * 100).toFixed(1));

  // Restrained semantic status styling with full dark mode contrast
  const isCriticalOrHigh = prediction.risk_tier === 'CRITICAL' || prediction.risk_tier === 'HIGH';
  const isModerate = prediction.risk_tier === 'MODERATE';

  const statusConfig = isCriticalOrHigh
    ? {
        border: 'border-[var(--danger-border)]',
        badgeBg: 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]',
        indicatorColor: 'bg-[var(--danger-text)]',
        titleColor: 'text-[var(--danger-text)]',
        icon: ShieldAlert,
        verdictTitle: 'Flagged as High Scam Risk',
        description:
          'Linguistic markers and/or recruitment red flags were detected that correlate strongly with fraudulent job postings in the EMSCAD benchmark corpus.',
      }
    : isModerate
    ? {
        border: 'border-[var(--warning-border)]',
        badgeBg: 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]',
        indicatorColor: 'bg-[var(--warning-text)]',
        titleColor: 'text-[var(--warning-text)]',
        icon: AlertTriangle,
        verdictTitle: 'Moderate Risk / Inconclusive Markers',
        description:
          'Mixed linguistic signals detected. While not conclusively fraudulent, several phrases or structural omissions warrant manual applicant caution.',
      }
    : {
        border: 'border-[var(--card-border)]',
        badgeBg: 'bg-[var(--subtle-bg)] text-[var(--foreground)] border-[var(--card-border)]',
        indicatorColor: 'bg-[#3C507D] dark:bg-[#E0C58F]',
        titleColor: 'text-[var(--foreground)]',
        icon: ShieldCheck,
        verdictTitle: 'Consistent with Legitimate Postings',
        description:
          'The phrasing, role requirements, compensation language, and organizational profile align closely with verified legitimate employment postings in the EMSCAD corpus.',
      };

  const Icon = statusConfig.icon;

  return (
    <Card className={`bg-[var(--card-bg)] ${statusConfig.border} overflow-hidden shadow-xs transition-colors duration-200`}>
      {/* Target Summary Header */}
      <CardHeader className="p-6 pb-5 border-b border-[var(--card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-text)] block mb-1">
            TARGET ROLE AUDIT RECORD
          </span>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-[var(--foreground)] tracking-tight">
            {input_summary.title}
          </CardTitle>
          <p className="text-xs text-[var(--muted-text)] mt-1">
            {input_summary.company_name || 'Unspecified Organization'} &bull;{' '}
            {input_summary.location || 'Location Not Specified'}
          </p>
        </div>

        <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between text-xs text-[var(--muted-text)] gap-1">
          <span className="font-mono text-[11px] bg-[var(--subtle-bg)] border border-[var(--card-border)] px-2 py-0.5 rounded text-[var(--foreground)]">
            ID: {result.id}
          </span>
          <span className="text-[11px] text-[var(--muted-text)] font-mono">
            {new Date(result.analyzed_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Classification Verdict & Context */}
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${statusConfig.badgeBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span
                  className={`inline-block text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${statusConfig.badgeBg}`}
                >
                  {prediction.risk_tier} RISK TIER
                </span>
                <h3 className={`text-xl sm:text-2xl font-semibold tracking-tight ${statusConfig.titleColor}`}>
                  {statusConfig.verdictTitle}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--muted-text)] leading-relaxed">
              {statusConfig.description}
            </p>

            <div className="text-[11px] text-[var(--muted-text)] flex items-center gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5 shrink-0 text-[var(--muted-text)]" />
              <span>
                Calculated by linear TF-IDF classifier on 12,000 sublinear n-gram features.
              </span>
            </div>
          </div>

          {/* Right: Model Probability Gauge */}
          <div className="p-5 rounded-lg bg-[var(--subtle-bg)] border border-[var(--card-border)] space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--foreground)]">
                Model-Derived Probabilities
              </span>
              <span className="text-[10px] font-mono text-[var(--muted-text)] bg-[var(--card-bg)] border border-[var(--card-border)] px-2 py-0.5 rounded">
                Logistic Sigmoid
              </span>
            </div>

            {/* Probability Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-[var(--danger-text)] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Scam probability</span>
                  </span>
                  <span className="text-[var(--foreground)] font-mono font-semibold tabular-nums">{fraudPercent}%</span>
                </div>
                <Progress
                  value={fraudPercent}
                  indicatorClassName="bg-[var(--danger-text)]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-[#3C507D] dark:text-[#E0C58F] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3C507D] dark:text-[#E0C58F]" />
                    <span>Legitimate probability</span>
                  </span>
                  <span className="text-[var(--foreground)] font-mono font-semibold tabular-nums">{legitPercent}%</span>
                </div>
                <Progress
                  value={legitPercent}
                  indicatorClassName="bg-[#3C507D] dark:bg-[#E0C58F]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--card-border)] flex items-center justify-between text-[11px] text-[var(--muted-text)] font-mono">
              <span>Decision Threshold: 50.0%</span>
              <span>Active tokens: {result.model_evidence.active_tokens_count}</span>
            </div>
          </div>
        </div>

        {/* Uncertainty & Statistical Realism Callout */}
        <div className="p-3.5 rounded-lg bg-[var(--subtle-bg)]/60 border border-[var(--card-border)] flex items-start gap-2.5 text-xs text-[var(--muted-text)]">
          <Scale className="w-4 h-4 text-[var(--muted-text)] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[var(--foreground)] font-medium">Statistical interpretation note: </strong>
            This evaluation reflects mathematical resemblance to historical patterns in the EMSCAD training corpus. It serves as an automated decision-support aid and does not constitute definitive legal proof of fraudulent conduct.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
