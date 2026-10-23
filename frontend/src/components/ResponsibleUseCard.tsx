import React from 'react';
import { Scale } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function ResponsibleUseCard() {
  return (
    <Alert variant="warning" className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Scale className="w-5 h-5 shrink-0" />
          <AlertTitle className="text-base font-semibold m-0">
            Responsible Use &amp; Model Limitations
          </AlertTitle>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 border border-current hidden sm:inline-flex">
          Ethical AI Guidance
        </span>
      </div>

      <AlertDescription className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed mt-2">
        <div className="space-y-2.5">
          <p className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />
            <span>
              <strong>Probabilistic Screening Aid:</strong> JOBSHIELD AI calculates statistical probabilities based on language patterns from the EMSCAD training dataset. A flagged posting may be legitimate, and novel scams may evade detection.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />
            <span>
              <strong>Confidence &ne; Factual Proof:</strong> High model confidence reflects stylistic resemblance to historical scams, not legal guilt. Never take punitive action based solely on an automated score.
            </span>
          </p>
        </div>

        <div className="space-y-2.5">
          <p className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />
            <span>
              <strong>Text-Only Architecture:</strong> Scammers continuously evolve vocabulary. Grammatical quirks, location names, or business sizes should never be treated as sole proof of fraud.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />
            <span>
              <strong>Mandatory Verification:</strong> Always confirm job requisitions directly on official corporate career portals, inspect email header domains, and never pay upfront fees or deposit checks for reimbursement.
            </span>
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
