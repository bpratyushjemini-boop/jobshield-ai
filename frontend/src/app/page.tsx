import React from 'react';
import Link from 'next/link';
import { FileSearch, ArrowRight, Database, Lock } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import ThreatMatrix from '@/components/ThreatMatrix';
import ResponsibleUseCard from '@/components/ResponsibleUseCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-14 sm:space-y-18 pb-20">
      {/* 1. Hero Section with Interactive Live Screening Console & Metric Strip */}
      <HeroSection />

      {/* 2. System Architecture / Pipeline */}
      <HowItWorks />

      {/* 3. Threat Matrix & Pattern Signatures */}
      <ThreatMatrix />

      {/* 4. Responsible Use & Model Boundaries */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ResponsibleUseCard />
      </div>

      {/* 5. Bottom Action Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 sm:p-12 rounded-xl bg-[var(--card-bg)] border-[var(--card-border)] text-center space-y-5">
          <div className="inline-flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--subtle-bg)] border border-[var(--card-border)] text-[var(--muted-text)] text-xs font-mono">
              <Lock className="w-3 h-3 text-[var(--foreground)]" />
              <span>Zero Candidate Data Stored Remotely</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)] tracking-tight">
            Comprehensive screening workbench
          </h2>

          <p className="text-xs sm:text-sm text-[var(--muted-text)] max-w-lg mx-auto leading-relaxed">
            Screen custom postings, inspect n-gram coefficient contributions, run deterministic checks, and access local browser audit logs.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/analyze" className="w-full sm:w-auto">
              <Button size="default" className="w-full sm:w-auto font-semibold px-5">
                <FileSearch className="w-4 h-4" />
                <span>Open detector workbench</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </Link>

            <Link href="/model" className="w-full sm:w-auto">
              <Button variant="outline" size="default" className="w-full sm:w-auto font-medium">
                <Database className="w-4 h-4 text-[var(--muted-text)]" />
                <span>Model evaluation &amp; metrics</span>
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
