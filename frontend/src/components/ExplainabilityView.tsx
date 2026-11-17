'use client';

import React from 'react';
import {
  Binary,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { ModelEvidence, HeuristicWarning } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface ExplainabilityViewProps {
  modelEvidence: ModelEvidence;
  heuristicWarnings: HeuristicWarning[];
}

export default function ExplainabilityView({
  modelEvidence,
  heuristicWarnings,
}: ExplainabilityViewProps) {
  const fraudTerms = modelEvidence.positive_fraud_contributors || [];
  const legitTerms = modelEvidence.negative_legit_contributors || [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="model">
        {/* Tab Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-[var(--foreground)]" />
            <h3 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
              Evidence &amp; Forensic Analysis
            </h3>
          </div>

          <TabsList className="bg-[var(--subtle-bg)] p-1 rounded-lg border border-[var(--card-border)]">
            <TabsTrigger value="model" className="flex items-center gap-1.5 text-xs">
              <span>Statistical weights</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--card-border)] text-[var(--foreground)]">
                {fraudTerms.length + legitTerms.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="heuristics" className="flex items-center gap-1.5 text-xs">
              <span>Deterministic rules</span>
              {heuristicWarnings.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--danger-bg)] text-[var(--danger-text)] font-semibold border border-[var(--danger-border)]">
                  {heuristicWarnings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="limitations" className="text-xs">
              <span>Model boundaries</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: Statistical Model Feature Contributions (TF-IDF x Beta) */}
        <TabsContent value="model" className="space-y-6 mt-4">
          <div className="p-4 rounded-lg bg-[var(--subtle-bg)]/80 border border-[var(--card-border)] text-xs text-[var(--muted-text)] leading-relaxed space-y-1">
            <div className="flex items-center gap-2">
              <strong className="text-[var(--foreground)] font-semibold">
                Linear Statistical Feature Attribution
              </strong>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--card-bg)] border border-[var(--card-border)]">
                TF-IDF &times; &beta;
              </span>
            </div>
            <p>
              Each n-gram present in the posting contributes linearly to the log-odds decision boundary (
              <code className="text-[var(--foreground)] font-mono text-[11px] bg-[var(--card-bg)] px-1 py-0.5 rounded border border-[var(--card-border)]">
                z = &beta;&#8320; + &sum;(tfidf&#7522; &times; &beta;&#7522;)
              </code>
              ). Positive coefficients push the verdict toward fraud; negative coefficients indicate characteristic enterprise legitimacy markers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Pushing toward Fraud (Red Risk State) */}
            <Card className="border-[var(--danger-border)] bg-[var(--card-bg)] overflow-hidden shadow-none">
              <CardHeader className="p-4 border-b border-[var(--danger-border)] bg-[var(--danger-bg)] flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--danger-text)]">
                  <ShieldAlert className="w-4 h-4 text-[var(--danger-text)]" />
                  <span>Pushing Toward Scam (+)</span>
                </div>
                <span className="text-[10px] font-mono font-medium text-[var(--danger-text)] bg-[var(--card-bg)] px-2 py-0.5 rounded border border-[var(--danger-border)]">
                  {fraudTerms.length} active terms
                </span>
              </CardHeader>

              <CardContent className="p-4">
                {fraudTerms.length === 0 ? (
                  <p className="text-xs text-[var(--muted-text)] italic py-4 text-center">
                    No statistically significant fraudulent n-grams detected.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {fraudTerms.map((item, idx) => {
                      const widthPercent = Math.min(100, Math.max(15, item.contribution * 35));
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--foreground)] font-medium">&ldquo;{item.term}&rdquo;</span>
                            <span className="text-[var(--danger-text)] font-semibold font-mono tabular-nums text-[11px]">
                              +{item.contribution.toFixed(3)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[var(--subtle-bg)] overflow-hidden">
                            <div
                              className="h-full bg-[var(--danger-text)] rounded-full"
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[var(--muted-text)] font-mono">
                            <span>TF-IDF: {item.tfidf_weight}</span>
                            <span>&beta; weight: {item.coefficient}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Column 2: Pushing toward Legitimate (Neutral Monochrome State) */}
            <Card className="border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden shadow-none">
              <CardHeader className="p-4 border-b border-[var(--card-border)] bg-[var(--subtle-bg)] flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--muted-text)]" />
                  <span>Pushing Toward Legitimate (&minus;)</span>
                </div>
                <span className="text-[10px] font-mono font-medium text-[var(--muted-text)] bg-[var(--card-bg)] px-2 py-0.5 rounded border border-[var(--card-border)]">
                  {legitTerms.length} active terms
                </span>
              </CardHeader>

              <CardContent className="p-4">
                {legitTerms.length === 0 ? (
                  <p className="text-xs text-[var(--muted-text)] italic py-4 text-center">
                    No characteristic enterprise legitimacy n-grams detected.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {legitTerms.map((item, idx) => {
                      const widthPercent = Math.min(
                        100,
                        Math.max(15, Math.abs(item.contribution) * 35)
                      );
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--foreground)] font-medium">&ldquo;{item.term}&rdquo;</span>
                            <span className="text-[#3C507D] dark:text-[#E0C58F] font-semibold font-mono tabular-nums text-[11px]">
                              {item.contribution.toFixed(3)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[var(--subtle-bg)] overflow-hidden">
                            <div
                              className="h-full bg-[#3C507D] dark:bg-[#E0C58F] rounded-full"
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[var(--muted-text)] font-mono">
                            <span>TF-IDF: {item.tfidf_weight}</span>
                            <span>&beta; weight: {item.coefficient}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: Deterministic Security Heuristic Rules */}
        <TabsContent value="heuristics" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-[var(--subtle-bg)]/80 border border-[var(--card-border)] text-xs text-[var(--muted-text)] space-y-1">
            <div className="flex items-center gap-2">
              <strong className="text-[var(--foreground)] font-semibold">
                Independent Deterministic Threat Signatures
              </strong>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--card-bg)] border border-[var(--card-border)]">
                Pattern Rules
              </span>
            </div>
            <p>
              These signatures trigger on concrete cybercrime behaviors (e.g. Telegram interviews, cashier check equipment deposits, and free webmail domains). They operate independently from the statistical TF-IDF NLP model.
            </p>
          </div>

          {heuristicWarnings.length === 0 ? (
            <Card className="p-8 text-center space-y-2 border-[var(--card-border)] bg-[var(--card-bg)]">
              <CheckCircle className="w-6 h-6 text-[var(--foreground)] mx-auto" />
              <h4 className="text-sm font-semibold text-[var(--foreground)]">
                No Deterministic Threat Signatures Triggered
              </h4>
              <p className="text-xs text-[var(--muted-text)] max-w-md mx-auto">
                The posting did not match known signatures for equipment checks, off-platform Telegram routing, or suspicious payment arrangements.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {heuristicWarnings.map((warning, idx) => {
                const isCritical = warning.severity === 'CRITICAL' || warning.severity === 'HIGH';
                return (
                  <Card
                    key={idx}
                    className="p-4 bg-[var(--card-bg)] border-[var(--card-border)] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${
                            isCritical
                              ? 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]'
                              : 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]'
                          }`}
                        >
                          {warning.severity} SEVERITY
                        </span>
                        <span className="text-xs text-[var(--muted-text)]">
                          {warning.category}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--muted-text)] bg-[var(--subtle-bg)] px-1.5 py-0.5 rounded border border-[var(--card-border)]">
                        RULE: {warning.rule_id}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-[var(--foreground)]">{warning.title}</h4>
                    <p className="text-xs text-[var(--muted-text)] leading-relaxed">{warning.detail}</p>

                    {warning.matched_terms && warning.matched_terms.length > 0 && (
                      <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-[var(--muted-text)] font-mono">Matched tokens:</span>
                        {warning.matched_terms.map((term, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-[var(--danger-bg)] text-[var(--danger-text)] border border-[var(--danger-border)]"
                          >
                            &ldquo;{term}&rdquo;
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: Model Boundaries & Limitations */}
        <TabsContent value="limitations" className="space-y-4 mt-4">
          <Card className="p-6 bg-[var(--card-bg)] border-[var(--card-border)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <HelpCircle className="w-4 h-4 text-[var(--muted-text)]" />
              <span>What text-only classification models cannot determine</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--muted-text)] leading-relaxed">
              <div className="p-4 rounded-lg bg-[var(--subtle-bg)] border border-[var(--card-border)] space-y-1.5">
                <strong className="text-[var(--foreground)] block font-medium">No External Corporate Registry Lookups:</strong>
                <p>
                  JOBSHIELD AI does not verify corporate state filing status or Secretary of State records. Scammers often impersonate authentic enterprise brands.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--subtle-bg)] border border-[var(--card-border)] space-y-1.5">
                <strong className="text-[var(--foreground)] block font-medium">Authentic Text Scraped by Scammers:</strong>
                <p>
                  Attackers frequently copy authentic job postings verbatim from legitimate corporate career portals, conducting deception privately in subsequent chat channels.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--subtle-bg)] border border-[var(--card-border)] space-y-1.5">
                <strong className="text-[var(--foreground)] block font-medium">No Email SPF / DKIM DNS Validation:</strong>
                <p>
                  Unless full email header envelopes are submitted, the system cannot verify if the sender&apos;s server was cryptographically authorized to send mail for the employer domain.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--subtle-bg)] border border-[var(--card-border)] space-y-1.5">
                <strong className="text-[var(--foreground)] block font-medium">Statistical Probability &ne; Legal Proof:</strong>
                <p>
                  Statistical confidence measures mathematical similarity to the training corpus. It should guide verification protocol, not unilateral accusations.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
