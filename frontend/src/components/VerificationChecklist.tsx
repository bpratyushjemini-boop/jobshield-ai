'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, ShieldCheck, Copy, Check } from 'lucide-react';
import { VerificationStep } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VerificationChecklistProps {
  steps: VerificationStep[];
}

export default function VerificationChecklist({ steps }: VerificationChecklistProps) {
  const [completed, setCompleted] = useState<{ [key: number]: boolean }>({});
  const [copied, setCopied] = useState(false);

  const toggleCheck = (idx: number) => {
    setCompleted((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const copyToClipboard = () => {
    const text = steps
      .map(
        (s, i) =>
          `[${completed[i] ? 'X' : ' '}] (${s.priority}) ${s.title}: ${s.action}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'MANDATORY':
      case 'CRITICAL':
        return 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]';
      case 'URGENT':
      case 'HIGH':
        return 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]';
      default:
        return 'bg-[var(--subtle-bg)] text-[var(--foreground)] border-[var(--card-border)]';
    }
  };

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)] overflow-hidden shadow-xs transition-colors duration-200">
      <CardHeader className="p-6 pb-4 border-b border-[var(--card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--foreground)]" />
            <CardTitle className="text-base font-semibold text-[var(--foreground)] tracking-tight">
              Actionable Candidate Verification Protocol
            </CardTitle>
          </div>
          <p className="text-xs text-[var(--muted-text)] mt-0.5">
            Recommended checks to complete before sharing personal identification, interviewing, or accepting an offer.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="self-start sm:self-auto text-xs"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[var(--foreground)]" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-[var(--muted-text)]" />
          )}
          <span>{copied ? 'Copied checklist' : 'Copy protocol'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = !!completed[idx];

          return (
            <div
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3.5 ${
                isDone
                  ? 'bg-[var(--subtle-bg)] border-[var(--card-border)] opacity-70'
                  : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--card-hover-border)] hover:bg-[var(--subtle-bg)]'
              }`}
            >
              <button
                type="button"
                aria-label={`Toggle step ${step.title}`}
                className="mt-0.5 text-[var(--muted-text)] hover:text-[var(--foreground)] focus:outline-none"
              >
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-[var(--foreground)]" />
                ) : (
                  <Square className="w-4 h-4 text-[var(--muted-text)]" />
                )}
              </button>

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border uppercase ${getPriorityStyle(
                      step.priority
                    )}`}
                  >
                    {step.priority}
                  </span>
                  <h4
                    className={`text-xs font-semibold ${
                      isDone ? 'line-through text-[var(--muted-text)]' : 'text-[var(--foreground)]'
                    }`}
                  >
                    {step.title}
                  </h4>
                </div>
                <p className="text-xs text-[var(--muted-text)] leading-relaxed">
                  {step.action}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
