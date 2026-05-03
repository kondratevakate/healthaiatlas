// Grants — open public-funding calls in healthcare AI.
// Every entry must include a primary `src` URL pointing at the funder's call page.

import { PathRole } from '@/types/research';

export type GrantRegion = 'US' | 'EU' | 'UK' | 'UAE' | 'Global';

export interface GrantOpening {
  id: string;
  title: string;
  funder: string;
  region: GrantRegion;
  amount?: string;
  deadline?: string; // ISO date or 'rolling'
  eligibility: string;
  roles: PathRole[];
  src: string;
  notes?: string;
}

export const grants: GrantOpening[] = [
  {
    id: 'nih-bridge2ai',
    title: 'NIH Bridge2AI',
    funder: 'NIH Common Fund',
    region: 'US',
    amount: '$30M+ per data-generation project',
    deadline: 'rolling',
    eligibility: 'US academic / non-profit consortia generating ethically sourced biomedical AI datasets',
    roles: ['student', 'founder'],
    src: 'https://commonfund.nih.gov/bridge2ai',
    notes: 'Flagship NIH initiative for AI-ready biomedical data — long-cycle, high-prestige.',
  },
  {
    id: 'arpa-h-missions',
    title: 'ARPA-H Open Calls',
    funder: 'ARPA-H (US)',
    region: 'US',
    amount: 'Varies by program',
    deadline: 'rolling',
    eligibility: 'Domestic and international researchers; for-profit and non-profit',
    roles: ['founder', 'student', 'business'],
    src: 'https://arpa-h.gov/research-and-funding/programs',
    notes: 'Mission-driven biomedical breakthroughs — funding cycles tied to specific challenges.',
  },
  {
    id: 'horizon-europe-health',
    title: 'Horizon Europe — Health Cluster',
    funder: 'European Commission',
    region: 'EU',
    amount: '€2-15M per project',
    deadline: '2026-09-16',
    eligibility: 'EU + associated-country consortia; minimum 3 partners from 3 countries',
    roles: ['founder', 'student', 'business'],
    src: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-search',
    notes: 'Largest EU R&D funder. Health Cluster covers AI for diagnostics, public health, personalized medicine.',
  },
  {
    id: 'aria-precision-neurotech',
    title: 'ARIA — Scaling Precision Neurotechnology',
    funder: 'Advanced Research and Invention Agency (UK)',
    region: 'UK',
    amount: '£5-50M per programme',
    deadline: 'rolling',
    eligibility: 'UK and international teams; high-risk, high-reward research',
    roles: ['founder', 'student'],
    src: 'https://www.aria.org.uk/opportunity-spaces/',
    notes: 'UK ARPA-equivalent. Multiple opportunity spaces relevant to brain-AI, diagnostics, biology.',
  },
  {
    id: 'wellcome-leap',
    title: 'Wellcome Leap — health-AI programs',
    funder: 'Wellcome Leap',
    region: 'Global',
    amount: 'Up to $50M per program',
    deadline: 'rolling',
    eligibility: 'Global academic + industry teams; outcome-based contracts',
    roles: ['student', 'founder'],
    src: 'https://wellcomeleap.org/programs/',
    notes: 'Outcome-driven model — fast cycles, hard milestones. Programs span 1K Days, Δ Tissue, etc.',
  },
  {
    id: 'cancer-grand-challenges',
    title: 'Cancer Grand Challenges',
    funder: 'Cancer Research UK + NCI (US)',
    region: 'Global',
    amount: '$25M per team over 5 years',
    deadline: '2026-08-15',
    eligibility: 'International multidisciplinary teams (4+ countries typical)',
    roles: ['student'],
    src: 'https://cancergrandchallenges.org/about',
    notes: 'Joint US/UK funding for moonshot cancer research. Strong AI/ML representation in recent rounds.',
  },
];
