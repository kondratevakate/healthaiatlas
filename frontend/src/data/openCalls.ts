// Open Calls (заявки) — RFPs, sandbox openings, pilot calls, regulatory invitations.
// Faster cycle than grants; usually months, not years.

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
    deadline: 'rolling',
    audience: 'Medical-device and SaMD companies seeking FDA feedback before formal submission',
    roles: ['founder', 'business'],
    src: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/requests-feedback-and-meetings-medical-device-submissions-q-submission-program',
    notes: 'Free pre-IDE meetings; the standard way to de-risk a 510(k) or De Novo path.',
  },
  {
    id: 'nhs-ai-diagnostic-fund',
    title: 'NHS AI Diagnostic Fund — adoption rounds',
    issuer: 'NHS England',
    region: 'UK',
    type: 'rfp',
    deadline: '2026-07-31',
    audience: 'AI vendors with CE/UKCA-marked tools deployable in NHS Trusts',
    roles: ['founder', 'business'],
    src: 'https://transform.england.nhs.uk/ai-lab/ai-lab-programmes/',
    notes: '£21M fund deploying validated AI tools across NHS imaging pathways.',
  },
  {
    id: 'mhra-air-sandbox',
    title: 'MHRA AI-Airlock Regulatory Sandbox',
    issuer: 'MHRA (UK)',
    region: 'UK',
    type: 'sandbox',
    deadline: 'rolling',
    audience: 'Adaptive AI medical-device developers piloting under regulator supervision',
    roles: ['founder', 'business'],
    src: 'https://www.gov.uk/government/publications/ai-airlock-regulatory-sandbox',
    notes: 'Joint MHRA + DHSC. Lets developers test continuously-learning models with regulator oversight.',
  },
  {
    id: 'eu-ai-act-sandbox',
    title: 'EU AI Act — National Regulatory Sandboxes',
    issuer: 'European Commission + Member States',
    region: 'EU',
    type: 'sandbox',
    deadline: 'rolling (per member state)',
    audience: 'High-risk AI system developers — including healthcare',
    roles: ['founder', 'business', 'student'],
    src: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-sandboxes-ai',
    notes: 'Each EU member state must run at least one sandbox by Aug 2026. Healthcare AI explicitly in scope.',
  },
  {
    id: 'dha-innovation-licensing',
    title: 'DHA Innovation Licensing Pathway',
    issuer: 'Dubai Health Authority',
    region: 'UAE',
    type: 'pilot',
    deadline: 'rolling',
    audience: 'Healthcare-AI startups seeking pilot deployment in DHA-licensed facilities',
    roles: ['founder', 'business'],
    src: 'https://www.dha.gov.ae/en/HealthRegulation/Pages/HealthInnovation.aspx',
    notes: 'Faster than full medical-device licensing for time-bound pilots. Requires UAE entity or partner.',
  },
  {
    id: 'arpah-resilient-systems',
    title: 'ARPA-H Resilient Systems Office — Open BAA',
    issuer: 'ARPA-H (US)',
    region: 'US',
    type: 'rfp',
    deadline: '2026-08-30',
    audience: 'Domestic and international R&D teams; small-business friendly',
    roles: ['founder', 'student'],
    src: 'https://arpa-h.gov/research-and-funding/programs',
    notes: 'Broad Agency Announcement — lower-friction than NIH RFAs. Health resilience and access focus.',
  },
];
