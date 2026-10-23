import React from 'react';
import { FileText, Binary, Cpu, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Multimodal Text Ingestion',
      icon: FileText,
      description:
        'Normalizes job title, description, company profile, location, and compensation. Strips extraneous markup and builds a consolidated document representation.',
    },
    {
      num: '02',
      title: 'TF-IDF N-Gram Vectorization',
      icon: Binary,
      description:
        'Extracts 12,000 sublinear-scaled unigram and bigram features fitted strictly on the EMSCAD training partition with zero data leakage.',
    },
    {
      num: '03',
      title: 'Class-Weighted Classification',
      icon: Cpu,
      description:
        'Balanced Logistic Regression calibrates for the 1:19 real-world fraud imbalance, calculating bounded sigmoid probabilities.',
    },
    {
      num: '04',
      title: 'Transparent Attribution',
      icon: ShieldCheck,
      description:
        'Computes mathematical token weights showing exactly which terms influenced the score, paired with actionable candidate verification guidance.',
    },
  ];

  return (
    <section className="py-14 sm:py-18 border-b border-[var(--card-border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl mx-auto text-center space-y-2.5">
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[var(--muted-text)]">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)] tracking-tight">
            How detection works
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-text)] leading-relaxed">
            Every prediction is calculated by a reproducible scikit-learn pipeline with exact mathematical feature attribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.num}
                className="p-5 bg-[var(--card-bg)] border-[var(--card-border)] flex flex-col justify-between space-y-4 hover:border-[var(--card-hover-border)] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[var(--muted-text)]">
                      {step.num}
                    </span>
                    <div className="w-7 h-7 rounded-md bg-[var(--subtle-bg)] text-[var(--foreground)] border border-[var(--card-border)] flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-[var(--foreground)] leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[var(--muted-text)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
