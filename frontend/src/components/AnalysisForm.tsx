'use client';

import React, { useState } from 'react';
import {
  FileSearch,
  RotateCcw,
  AlertCircle,
  Building2,
  MapPin,
  DollarSign,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { JobPostingFormData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface AnalysisFormProps {
  formData: JobPostingFormData;
  onChange: (field: keyof JobPostingFormData, value: string) => void;
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string | null;
}

export default function AnalysisForm({
  formData,
  onChange,
  onReset,
  onSubmit,
  loading,
  error,
}: AnalysisFormProps) {
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [optionalExpanded, setOptionalExpanded] = useState(false);

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.title || formData.title.trim().length < 2) {
      errors.title = 'Job title is required (minimum 2 characters)';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'Job description is required (minimum 10 characters)';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(e);
    }
  };

  // Keyboard shortcut: Cmd+Enter or Ctrl+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (validate()) {
        onSubmit(e);
      }
    }
  };

  // Automatically expand optional fields if any optional field has content
  const hasOptionalContent =
    !!formData.company_name ||
    !!formData.company_website ||
    !!formData.location ||
    !!formData.employment_type ||
    !!formData.required_experience ||
    !!formData.required_education ||
    !!formData.salary_range ||
    !!formData.company_profile ||
    !!formData.required_skills ||
    !!formData.benefits;

  const isExpanded = optionalExpanded || hasOptionalContent;

  return (
    <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-7">
      {/* Top Banner Error if present */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Analysis engine error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* SECTION 1: Core Job Requisition (Required for Statistical Modeling) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--foreground)]">
            01 &bull; Core Requisition Text
          </span>
          <span className="text-[11px] text-[var(--muted-text)]">
            Required for TF-IDF feature extraction
          </span>
        </div>

        {/* Job Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="job-title-input" className="text-xs font-semibold text-[var(--foreground)]">
              Job Title <span className="text-[var(--danger-text)]">*</span>
            </Label>
            <span className="text-[11px] text-[var(--muted-text)] font-mono">title</span>
          </div>
          <Input
            id="job-title-input"
            required
            value={formData.title}
            onChange={(e) => {
              onChange('title', e.target.value);
              if (validationErrors.title) {
                setValidationErrors((prev) => ({ ...prev, title: '' }));
              }
            }}
            error={!!validationErrors.title}
            placeholder="e.g. Senior Backend Engineer, Data Entry Operator, Executive Assistant"
            className="text-sm h-10"
          />
          {validationErrors.title && (
            <p className="text-xs text-[var(--danger-text)]">{validationErrors.title}</p>
          )}
        </div>

        {/* Job Description (Primary Body) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="description-textarea" className="text-xs font-semibold text-[var(--foreground)]">
              Job Description &amp; Responsibilities <span className="text-[var(--danger-text)]">*</span>
            </Label>
            <span className="text-[11px] text-[var(--muted-text)] font-mono">
              {formData.description ? `${formData.description.length} chars` : 'min 10 chars'}
            </span>
          </div>
          <Textarea
            id="description-textarea"
            rows={8}
            required
            value={formData.description}
            onChange={(e) => {
              onChange('description', e.target.value);
              if (validationErrors.description) {
                setValidationErrors((prev) => ({ ...prev, description: '' }));
              }
            }}
            error={!!validationErrors.description}
            placeholder="Paste the full job posting content: role summary, core tasks, qualifications, compensation notes, equipment details, or application directions..."
            className="text-sm leading-relaxed"
          />
          {validationErrors.description && (
            <p className="text-xs text-[var(--danger-text)]">{validationErrors.description}</p>
          )}
        </div>
      </div>

      {/* SECTION 2: Organizational Context & Structural Signals (Progressive Disclosure) */}
      <div className="space-y-4 pt-2 border-t border-[var(--card-border)]">
        <button
          type="button"
          onClick={() => setOptionalExpanded(!optionalExpanded)}
          className="w-full flex items-center justify-between py-2 text-left group cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--foreground)]">
              02 &bull; Organizational Context &amp; Structural Signals
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--subtle-bg)] text-[var(--muted-text)] border border-[var(--card-border)]">
              Optional &bull; 8 fields
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--muted-text)] group-hover:text-[var(--foreground)]">
            <span>{isExpanded ? 'Collapse' : 'Expand fields'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isExpanded && (
          <div className="space-y-4 pt-1 animate-in fade-in-50 duration-150">
            {/* Company & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company-name-input" className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[var(--muted-text)]" />
                  <span>Company or Organization Name</span>
                </Label>
                <Input
                  id="company-name-input"
                  value={formData.company_name}
                  onChange={(e) => onChange('company_name', e.target.value)}
                  placeholder="e.g. Acme Corporation, Global Logistical Solutions"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-website-input" className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[var(--muted-text)]" />
                  <span>Website or Career Link</span>
                </Label>
                <Input
                  id="company-website-input"
                  value={formData.company_website}
                  onChange={(e) => onChange('company_website', e.target.value)}
                  placeholder="e.g. https://company.com or career portal link"
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Location & Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location-input" className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--muted-text)]" />
                  <span>Location or Remote Scope</span>
                </Label>
                <Input
                  id="location-input"
                  value={formData.location}
                  onChange={(e) => onChange('location', e.target.value)}
                  placeholder="e.g. US, Remote / New York, NY / London, UK"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="salary-range-input" className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[var(--muted-text)]" />
                  <span>Stated Salary or Compensation</span>
                </Label>
                <Input
                  id="salary-range-input"
                  value={formData.salary_range}
                  onChange={(e) => onChange('salary_range', e.target.value)}
                  placeholder="e.g. $80,000 to $110,000 / yr, $45/hr"
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Type, Experience, Education */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="employment-type-select" className="text-xs font-medium text-[var(--muted-text)]">
                  Employment Type
                </Label>
                <select
                  id="employment-type-select"
                  value={formData.employment_type}
                  onChange={(e) => onChange('employment_type', e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-1.5 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--foreground)] focus-visible:border-[var(--foreground)] transition-colors"
                >
                  <option value="">Select type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="required-experience-select" className="text-xs font-medium text-[var(--muted-text)]">
                  Required Experience
                </Label>
                <select
                  id="required-experience-select"
                  value={formData.required_experience}
                  onChange={(e) => onChange('required_experience', e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-1.5 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--foreground)] focus-visible:border-[var(--foreground)] transition-colors"
                >
                  <option value="">Select level</option>
                  <option value="Entry level">Entry level</option>
                  <option value="Mid-Senior level">Mid-Senior level</option>
                  <option value="Associate">Associate</option>
                  <option value="Director">Director</option>
                  <option value="Executive">Executive</option>
                  <option value="Not Applicable">Not Applicable</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="required-education-select" className="text-xs font-medium text-[var(--muted-text)]">
                  Required Education
                </Label>
                <select
                  id="required-education-select"
                  value={formData.required_education}
                  onChange={(e) => onChange('required_education', e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-1.5 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--foreground)] focus-visible:border-[var(--foreground)] transition-colors"
                >
                  <option value="">Select education</option>
                  <option value="High School or equivalent">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                  <option value="Master's Degree">Master&apos;s Degree</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Unspecified">Unspecified</option>
                </select>
              </div>
            </div>

            {/* Profile Overview */}
            <div className="space-y-1.5">
              <Label htmlFor="company-profile-textarea" className="text-xs font-medium text-[var(--muted-text)]">
                Company Profile &amp; Overview
              </Label>
              <Textarea
                id="company-profile-textarea"
                rows={2}
                value={formData.company_profile}
                onChange={(e) => onChange('company_profile', e.target.value)}
                placeholder="Background on the hiring organization, corporate mission, or historical presence..."
                className="text-xs"
              />
            </div>

            {/* Skills & Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="required-skills-input" className="text-xs font-medium text-[var(--muted-text)]">
                  Required Skills &amp; Tools
                </Label>
                <Input
                  id="required-skills-input"
                  value={formData.required_skills}
                  onChange={(e) => onChange('required_skills', e.target.value)}
                  placeholder="e.g. Python, SQL, Docker, Client Support"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="benefits-input" className="text-xs font-medium text-[var(--muted-text)]">
                  Benefits &amp; Perks Mentioned
                </Label>
                <Input
                  id="benefits-input"
                  value={formData.benefits}
                  onChange={(e) => onChange('benefits', e.target.value)}
                  placeholder="e.g. Healthcare, 401(k), Home office stipend"
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Action Controls: Visually Prominent Inverted Primary CTA */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--card-border)]">
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => {
            onReset();
            setValidationErrors({});
            setOptionalExpanded(false);
          }}
          disabled={loading}
          className="w-full sm:w-auto text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[var(--muted-text)]" />
          <span>Reset all fields</span>
        </Button>

        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={loading}
          className="w-full sm:w-auto font-semibold px-6 shadow-sm"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Analyzing text features...</span>
            </>
          ) : (
            <>
              <FileSearch className="w-4 h-4" />
              <span>Analyze job posting</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/20 dark:bg-black/20 text-inherit ml-2 border border-current/20">
                ⌘↵
              </kbd>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
