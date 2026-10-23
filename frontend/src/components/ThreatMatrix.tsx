import React from 'react';
import { CreditCard, MessageSquare, AlertOctagon, Building2 } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';

export default function ThreatMatrix() {
  const threats = [
    {
      title: "Fake Check & Equipment Scam",
      icon: CreditCard,
      severity: "CRITICAL",
      description:
        "Fraudsters issue counterfeit cashier's checks to 'purchase home office equipment' from an approved supplier. The check bounces days after the applicant wires personal funds.",
      signals: ["Cashier check deposit", "Equipment vendor wire", "Overpayment reimbursement"],
    },
    {
      title: "Off-Platform Telegram Recruitment",
      icon: MessageSquare,
      severity: "HIGH",
      description:
        "Attackers impersonate verified corporate hiring teams but redirect the candidate to text-only interviews on Telegram, Signal, or WhatsApp to evade enterprise audit trails.",
      signals: ["Telegram @handle", "WhatsApp interview", "Refusal of official video call"],
    },
    {
      title: "Money Mule & Reshipping Tasks",
      icon: AlertOctagon,
      severity: "HIGH",
      description:
        "Unrealistic compensation ($45–$80/hr) for trivial data processing, parcel re-boxing, or crypto transaction forwarding that turns applicants into unwitting accomplices.",
      signals: ["Unrealistic entry pay", "No experience required", "Payment processing tasks"],
    },
    {
      title: "Corporate Domain Spoofing",
      icon: Building2,
      severity: "MODERATE",
      description:
        "Attackers duplicate names and logos of prominent corporations but communicate through free webmail (@gmail.com) or typo-squatted domains that differ from official career sites.",
      signals: ["Free webmail senders", "Missing career portal listing", "Vague company overview"],
    },
  ];

  return (
    <section className="py-14 sm:py-18 border-b border-[var(--card-border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl mx-auto text-center space-y-2.5">
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[var(--muted-text)]">
            Threat Signatures
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)] tracking-tight">
            Common recruitment fraud vectors
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-text)] leading-relaxed">
            JOBSHIELD AI monitors both linguistic n-gram signatures and deterministic operational red flags associated with modern cybercrime campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {threats.map((threat, idx) => {
            const Icon = threat.icon;
            const isCritical = threat.severity === 'CRITICAL' || threat.severity === 'HIGH';
            return (
              <Card
                key={idx}
                className="p-5 bg-[var(--card-bg)] border-[var(--card-border)] space-y-3.5 hover:border-[var(--card-hover-border)] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[var(--subtle-bg)] flex items-center justify-center text-[var(--foreground)] border border-[var(--card-border)] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-[var(--foreground)]">
                        {threat.title}
                      </CardTitle>
                      <span className="text-[10px] font-mono text-[var(--muted-text)]">
                        Signature Pattern {idx + 1}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                      isCritical
                        ? 'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]'
                        : 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]'
                    }`}
                  >
                    {threat.severity}
                  </span>
                </div>

                <p className="text-xs text-[var(--muted-text)] leading-relaxed">
                  {threat.description}
                </p>

                <div className="pt-2 border-t border-[var(--card-border)] flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[var(--muted-text)] mr-1">Signals:</span>
                  {threat.signals.map((sig, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] px-2 py-0.5 rounded bg-[var(--subtle-bg)] text-[var(--foreground)] border border-[var(--card-border)]"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
