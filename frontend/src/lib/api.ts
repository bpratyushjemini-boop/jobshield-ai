/**
 * JOBSHIELD AI - API Client
 * Interfaces with the FastAPI ML backend service.
 */

import { JobPostingFormData, JobAnalysisResponse, ModelInfo, JobPreset } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function checkHealth(): Promise<{ status: string; model_loaded: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
    return await res.json();
  } catch {
    return { status: 'offline', model_loaded: false };
  }
}

export async function getModelInfo(): Promise<ModelInfo> {
  const res = await fetch(`${API_BASE_URL}/model-info`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to load model metadata: ${errText || res.statusText}`);
  }
  return await res.json();
}

interface ValidationErrorDetail {
  loc?: (string | number)[];
  msg?: string;
}

export async function analyzeJob(data: JobPostingFormData): Promise<JobAnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let detailMsg = `Analysis failed with HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        if (typeof errJson.detail === 'string') {
          detailMsg = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          detailMsg = (errJson.detail as ValidationErrorDetail[])
            .map((d) => `${d.loc?.join('.') || 'field'}: ${d.msg || 'invalid'}`)
            .join(', ');
        }
      }
    } catch {
      // Fallback to text
    }
    throw new Error(detailMsg);
  }

  return await res.json();
}

export async function getPresets(): Promise<JobPreset[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/presets`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn('Could not fetch presets from API, using fallback:', error);
  }

  // Fallback presets if backend is offline or starting
  return [
    {
      id: 'fallback_legit',
      name: 'Senior Full-Stack Engineer (Legitimate)',
      category: 'Legitimate Tech',
      expected_type: 'legitimate',
      data: {
        title: 'Senior Full-Stack Software Engineer',
        company_name: 'CloudSphere Technologies Inc.',
        company_profile: 'CloudSphere Technologies is an enterprise cloud observability platform founded in 2017. Serving 400+ enterprise clients.',
        description: 'Design and build high-throughput microservices using TypeScript, Node.js, and React. Maintain distributed event pipelines with CI/CD and unit testing.',
        employment_type: 'Full-time',
        required_experience: 'Mid-Senior level',
        required_education: "Bachelor's Degree",
        salary_range: '$145,000 - $175,000',
        company_website: 'https://cloudspheretech.example.com',
        location: 'San Francisco, CA (Hybrid)',
        required_skills: 'TypeScript, React, Node.js, PostgreSQL, Docker, AWS',
        benefits: 'Comprehensive health/dental, 401(k) matching, wellness stipend, unlimited PTO.',
      },
    },
    {
      id: 'fallback_fraud',
      name: 'Data Entry & Payment Clerk (Scam)',
      category: 'Fraudulent Scam',
      expected_type: 'fraudulent',
      data: {
        title: 'Urgent: Remote Data Entry Clerk & Payment Assistant',
        company_name: 'Apex Global Logistics',
        company_profile: '',
        description: 'URGENT HIRE! Immediate Data Entry Assistant needed. Earn up to $4,500 weekly! Work 2 hours a day on your flexible schedule. No interview needed. Guaranteed immediate start.',
        employment_type: 'Part-time',
        salary_range: '$4,500 / week',
        company_website: '',
        location: 'Remote',
        required_skills: 'Basic typing, internet access',
        benefits: "Cashier's check will be mailed to you to purchase home office equipment from our vendor. Contact our hiring coordinator on Telegram @ApexManager or email apex_recruiter@gmail.com.",
      },
    },
  ];
}
