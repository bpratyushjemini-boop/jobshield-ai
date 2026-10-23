'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Trash2,
  Download,
  Search,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SavedAnalysis } from '@/lib/types';
import { getSavedAnalyses, clearAnalysisHistory, exportHistoryAsJSON } from '@/lib/storage';
import AnalysisResultCard from './AnalysisResultCard';
import ExplainabilityView from './ExplainabilityView';
import VerificationChecklist from './VerificationChecklist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LiquidGlassSurface } from '@/components/ui/liquid-glass';

export default function HistoryList() {
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<SavedAnalysis | null>(null);

  const loadData = () => {
    setHistory(getSavedAnalyses());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your local analysis history? This cannot be undone.')) {
      clearAnalysisHistory();
      setHistory([]);
      setSelectedItem(null);
    }
  };

  const filtered = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.company_name.toLowerCase().includes(term) ||
      item.risk_tier.toLowerCase().includes(term)
    );
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]';
      case 'MODERATE':
        return 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]';
      case 'LOW':
        return 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]';
      default:
        return 'bg-[var(--subtle-bg)] text-[var(--foreground)] border-[var(--card-border)]';
    }
  };

  if (history.length === 0) {
    return (
      <Card className="p-12 text-center bg-[var(--card-bg)] border-[var(--card-border)] space-y-4 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-xl bg-[var(--subtle-bg)] text-[var(--muted-text)] flex items-center justify-center mx-auto border border-[var(--card-border)]">
          <History className="w-6 h-6 text-[var(--foreground)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">No analyses recorded yet</h3>
        <p className="text-xs text-[var(--muted-text)] leading-relaxed">
          Your analyzed job postings will appear here automatically. All records are stored locally in your browser storage to guarantee complete candidate privacy.
        </p>
        <Link href="/analyze">
          <Button variant="default" size="default">
            <span>Analyze your first job</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar with Liquid Glass */}
      <LiquidGlassSurface
        variant="card"
        radius={12}
        optics={{ frost: 2, strength: 0.05, dispersion: 0.00, sheen: 0.15 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-[var(--card-border)]/80 shadow-xs"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--muted-text)] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, organization, or risk level..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportHistoryAsJSON}
            className="text-xs"
            title="Download JSON audit export"
          >
            <Download className="w-3.5 h-3.5 text-[var(--muted-text)]" />
            <span>Export JSON</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="text-xs text-[var(--danger-text)] hover:bg-[var(--danger-bg)] hover:border-[var(--danger-border)]"
            title="Clear all local history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear history</span>
          </Button>
        </div>
      </LiquidGlassSurface>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-[var(--subtle-bg)] text-[11px] font-semibold text-[var(--muted-text)] uppercase tracking-wider">
              <th className="py-3 px-4">Role &amp; Organization</th>
              <th className="py-3 px-4">Audit ID</th>
              <th className="py-3 px-4">Risk Tier</th>
              <th className="py-3 px-4">Scam Probability</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)] text-xs">
            {filtered.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const isFraud = item.is_fraudulent;
              const fraudPercent = (item.fraud_probability * 100).toFixed(1);

              return (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => setSelectedItem(isSelected ? null : item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[var(--subtle-bg)]/80' : 'hover:bg-[var(--subtle-bg)]/40'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                            isFraud
                              ? 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]'
                              : 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]'
                          }`}
                        >
                          {isFraud ? (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--foreground)] line-clamp-1">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[var(--muted-text)]">
                            {item.company_name || 'Unspecified Organization'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--muted-text)]">
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${getTierBadge(
                          item.risk_tier
                        )}`}
                      >
                        {item.risk_tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <span className={isFraud ? 'text-[var(--danger-text)]' : 'text-[var(--success-text)]'}>
                        {fraudPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--muted-text)] text-[11px]">
                      {new Date(item.timestamp).toLocaleDateString()}{' '}
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs text-[var(--foreground)] font-semibold inline-flex items-center gap-1 hover:text-[var(--muted-text)]">
                        <span>{isSelected ? 'Close' : 'View'}</span>
                        {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded Report Drawer for desktop */}
                  {isSelected && (
                    <tr>
                      <td colSpan={6} className="p-6 bg-[var(--subtle-bg)] border-t border-[var(--card-border)] space-y-6">
                        <AnalysisResultCard result={item.result} />
                        <Card className="p-6 bg-[var(--card-bg)] border-[var(--card-border)]">
                          <ExplainabilityView
                            modelEvidence={item.result.model_evidence}
                            heuristicWarnings={item.result.heuristic_warnings}
                          />
                        </Card>
                        <VerificationChecklist steps={item.result.verification_steps} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {filtered.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          const isFraud = item.is_fraudulent;
          const fraudPercent = (item.fraud_probability * 100).toFixed(1);

          return (
            <Card
              key={item.id}
              className="p-4 bg-[var(--card-bg)] border-[var(--card-border)] space-y-3 cursor-pointer"
              onClick={() => setSelectedItem(isSelected ? null : item)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                      isFraud
                        ? 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]'
                        : 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]'
                    }`}
                  >
                    {isFraud ? (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--foreground)] line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[var(--muted-text)]">
                      {item.company_name || 'Unspecified Organization'}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border uppercase ${getTierBadge(
                    item.risk_tier
                  )}`}
                >
                  {item.risk_tier}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--muted-text)] pt-2 border-t border-[var(--card-border)]">
                <span className={isFraud ? 'text-[var(--danger-text)] font-semibold' : 'text-[var(--success-text)] font-semibold'}>
                  {fraudPercent}% scam probability
                </span>
                <span className="text-[var(--foreground)] font-medium flex items-center gap-0.5 hover:text-[var(--muted-text)]">
                  <span>{isSelected ? 'Hide' : 'Details'}</span>
                  {isSelected ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>
              </div>

              {isSelected && (
                <div
                  className="pt-4 border-t border-[var(--card-border)] space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AnalysisResultCard result={item.result} />
                  <Card className="p-4 bg-[var(--card-bg)] border-[var(--card-border)]">
                    <ExplainabilityView
                      modelEvidence={item.result.model_evidence}
                      heuristicWarnings={item.result.heuristic_warnings}
                    />
                  </Card>
                  <VerificationChecklist steps={item.result.verification_steps} />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
