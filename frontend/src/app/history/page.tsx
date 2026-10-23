'use client';

import React from 'react';
import Link from 'next/link';
import { History, ArrowLeft, FileSearch } from 'lucide-react';
import HistoryList from '@/components/HistoryList';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
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
              <span>Local Audit History</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--subtle-bg)] text-[var(--muted-text)] border border-[var(--card-border)]">
                Browser-Local Storage
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted-text)] mt-1">
            Audit records are stored strictly in your local browser storage. No candidate personal data is transmitted or retained on remote servers.
          </p>
        </div>

        <Link href="/analyze" className="self-start sm:self-auto">
          <Button variant="default" size="sm" className="font-semibold text-xs">
            <FileSearch className="w-4 h-4" />
            <span>Analyze a job</span>
          </Button>
        </Link>
      </div>

      {/* History List Component */}
      <HistoryList />
    </div>
  );
}
