import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink, Scale } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--card-border)] bg-[var(--subtle-bg)]/60 text-[var(--muted-text)] text-sm mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#112250] text-[#F5F0E9] dark:bg-[#F5F0E9] dark:text-[#112250] flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 fill-current stroke-current" />
              </div>
              <span className="font-semibold text-sm text-[var(--foreground)]">JOBSHIELD AI</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--muted-text)]">
                v1.0
              </span>
            </div>
            <p className="text-xs text-[var(--muted-text)] leading-relaxed max-w-md">
              A transparent machine learning system designed to screen job postings for linguistic patterns associated with recruitment fraud. Trained and evaluated strictly on the 17,880 records of the EMSCAD benchmark using scikit-learn.
            </p>
          </div>

          {/* Column 2: System & Methodology */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
              Product &amp; Engine
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/analyze" className="hover:text-[var(--foreground)] transition-colors">
                  Job Posting Detector
                </Link>
              </li>
              <li>
                <Link href="/model" className="hover:text-[var(--foreground)] transition-colors">
                  Model Architecture &amp; Metrics
                </Link>
              </li>
              <li>
                <Link href="/model#viva" className="hover:text-[var(--foreground)] transition-colors">
                  Technical Defense (Viva Q&amp;A)
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-[var(--foreground)] transition-colors">
                  Local Audit History
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: API & Benchmark Data */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
              Resources &amp; Data
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
                >
                  <span>FastAPI Schema &amp; OpenAPI</span>
                  <ExternalLink className="w-3 h-3 text-[var(--muted-text)]" />
                </a>
              </li>
              <li>
                <span className="text-[var(--muted-text)]">Dataset: EMSCAD (Univ. of Aegean)</span>
              </li>
              <li>
                <span className="text-[var(--muted-text)]">Pipeline: TF-IDF + Logistic Reg</span>
              </li>
              <li>
                <span className="text-[var(--muted-text)]">Evaluation: Stratified 20% Held-Out</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Responsible Use Banner */}
        <div className="border-t border-[var(--card-border)] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--muted-text)]">
          <div className="flex items-start sm:items-center gap-2 max-w-3xl">
            <Scale className="w-4 h-4 text-[#92400E] dark:text-[#E0C58F] shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong className="text-[var(--foreground)]">Responsible use note:</strong> JOBSHIELD AI is a statistical screening aid, not definitive legal proof of fraud. Always verify employers directly on their official careers page and never wire funds for equipment.
            </span>
          </div>
          <p className="text-[11px] text-[var(--muted-text)] whitespace-nowrap">
            JOBSHIELD AI &bull; Academic Machine Learning Project
          </p>
        </div>
      </div>
    </footer>
  );
}
