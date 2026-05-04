// Open Calls — RFPs, sandbox openings, pilot calls, regulatory invitations.
//
// Entries below are scaffolds — the call names, issuers, regions, types, and
// source URLs are real, but text fields like deadline, audience, and notes are
// TODO until each one is verified against the issuer's current page.

import { PathRole } from '@/types/research';
import { GrantRegion } from './grants';

export type OpenCallType = 'rfp' | 'pilot' | 'sandbox' | 'challenge' | 'tender';

export interface OpenCall {
  id: string;
  title: string;
  issuer: string;
  region: GrantRegion;
  type: OpenCallType;
  deadline?: string;
  audience: string;
  roles: PathRole[];
  src: string;
  notes?: string;
}

export const openCalls: OpenCall[] = [
  {
    id: 'fda-pre-submission',
    title: 'FDA Pre-Submission Program (Q-Sub)',
    issuer: 'FDA (US)',
    region: 'US',
    type: 'sandbox',
    deadline: 'TODO',
    audience: 'TODO',
    roles: ['founder', 'business'],
    src: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/requests-feedback-and-meetings-medical-device-submissions-q-submission-program',
    notes: 'TODO',
  },
  {
    id: 'nhs-ai-diagnostic-fund',
    title: 'NHS AI Diagnostic Fund',
    issuer: 'NHS England',
    region: 'UK',
    type: 'rfp',
    deadline: 'TODO',
    audience: 'TODO',
    roles: ['founder', 'business'],
    src: 'https://transform.england.nhs.uk/ai-lab/ai-lab-programmes/',
    notes: 'TODO',
  },
  {
    id: 'mhra-air-sandbox',
    title: 'MHRA AI-Airlock Regulatory Sandbox',
    issuer: 'MHRA (UK)',
    region: 'UK',
    type: 'sandbox',
    deadline: 'TODO',
    audience: 'TODO',
    roles: ['founder', 'business'],
    src: 'https://www.gov.uk/government/publications/ai-airlock-regulatory-sandbox',
    notes: 'TODO',
  },
  {
    id: 'eu-ai-act-sandbox',
    title: 'EU AI Act — National Regulatory Sandboxes',
    issuer: 'European Commission + Member States',
    region: 'EU',
    type: 'sandbox',
    deadline: 'TODO',
    audience: 'TODO',
    roles: ['founder', 'business', 'student'],
    src: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-sandboxes-ai',
    notes: 'TODO',
  },
  {
    id: 'dha-innovation-licensing',
    title: 'DHA Innovation Licensing Pathway',
    issuer: 'Dubai Health Authority',
    region: 'UAE',
    type: 'pilot',
    deadline: 'TODO',
    audience: 'TODO',
    roles: ['founder', 'business'],
    src: 'https://www.dha.gov.ae/en/HealthRegulation/Pages/HealthInnovation.aspx',
    notes: 'TODO',
  },
  {
    id: 'arpah-baa',
    title: 'ARPA-H Broad Agency Announcement',
    issuer: 'ARPA-H (US)',
    region: 'US',
    type: 'rfp',
    deadline: 'TODO',
    audience: 'TODO',
    roles: ['founder', 'student'],
    src: 'https://arpa-h.gov/research-and-funding/programs',
    notes: 'TODO',
  },
];
