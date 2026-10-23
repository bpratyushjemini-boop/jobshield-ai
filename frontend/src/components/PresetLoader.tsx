'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { JobPreset, JobPostingFormData } from '@/lib/types';
import { getPresets } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { LiquidGlassSurface } from '@/components/ui/liquid-glass';

interface PresetLoaderProps {
  onSelectPreset: (presetData: Partial<JobPostingFormData>) => void;
  currentTitle?: string;
}

export default function PresetLoader({ onSelectPreset, currentTitle }: PresetLoaderProps) {
  const [presets, setPresets] = useState<JobPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPresets()
      .then((data) => {
        setPresets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[var(--muted-text)] py-2">
        <span className="w-3 h-3 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />
        <span>Loading sample presets...</span>
      </div>
    );
  }

  return (
    <LiquidGlassSurface
      variant="card"
      radius={12}
      optics={{ frost: 2.5, strength: 0.06, dispersion: 0.00, sheen: 0.2 }}
      className="p-4 border border-[var(--card-border)]/80 shadow-xs block space-y-3 w-full"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--foreground)]" />
          <span className="text-xs font-semibold text-[var(--foreground)] tracking-tight">
            Verified Test Presets
          </span>
        </div>
        <span className="text-xs text-[var(--muted-text)]">
          Click any preset to populate the form
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {presets.map((preset) => {
          const isSelected = currentTitle && currentTitle === preset.data.title;
          const isScam = preset.expected_type === 'fraudulent';

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.data)}
              className={`p-3 rounded-lg text-left transition-all border flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[var(--card-elevated)] border-[#112250] dark:border-[#E0C58F] ring-1 ring-[#112250] dark:ring-[#E0C58F] shadow-xs'
                  : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:bg-[var(--subtle-bg)] hover:border-[var(--card-hover-border)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                      isScam
                        ? 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]'
                        : 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]'
                    }`}
                  >
                    {isScam ? 'Scam sample' : 'Legit sample'}
                  </span>
                  {isScam ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-[var(--danger-text)]" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3C507D] dark:text-[#E0C58F]" />
                  )}
                </div>
                <h4 className="text-xs font-semibold text-[var(--foreground)] line-clamp-1">
                  {preset.name}
                </h4>
              </div>
              <span className="text-[10px] text-[var(--muted-text)] mt-2 block">
                {preset.category}
              </span>
            </button>
          );
        })}
      </div>
    </LiquidGlassSurface>
  );
}
